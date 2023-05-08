import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._

import java.sql.Date
import java.time.{Duration, LocalDate}

import org.apache.spark.ml.feature.StringIndexer
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.feature.VectorAssembler
import org.apache.spark.ml.Pipeline

object future_sl {

    def getDateRange(dateFrom: Date, dateTo: Date): Seq[Date] = {
        val daysBetween = Duration
                .between(
                    dateFrom.toLocalDate.atStartOfDay(),
                    dateTo.toLocalDate.atStartOfDay()
                )
                .toDays
        val newRows = Seq.newBuilder[Date]
        // get all intermediate dates
        for (day <- 0L to daysBetween) {
            val date = Date.valueOf(dateFrom.toLocalDate.plusDays(day))
            newRows += date
        }
        newRows.result()
    }

    def main(args: Array[String]) = {
        println("START - Spark Session")
        val spark = SparkSession.builder()
                        .appName("ETL-data_lake_to_future_sales_serving_layer")
                        .getOrCreate()
        import spark.implicits._
        println("START - SUCCESS")
        println("")

        println("HDFS - Getting Data")
        val customers_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Customers/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "c_row_id")
        val order_details_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-OrderDetails/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "od_row_id")
        val orders_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Orders/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "o_row_id")
                                    .withColumn("order_date", from_unixtime(col("order_date")*86400, "yyyy-MM-dd")
                                                                .cast("date"))
                                    .withColumn("ship_date", from_unixtime(col("ship_date")*86400, "yyyy-MM-dd")
                                                                .cast("date"))
        var features_df = order_details_df.join(orders_df, 
                                                order_details_df("order_id")===orders_df("order_id"), 
                                                "inner")
                                          .join(customers_df, 
                                                orders_df("customer")===customers_df("customer_id"), 
                                                "inner")
                                          .withColumnRenamed("segment", "customer_segment")
                                          .select($"order_date", 
                                                  $"customer_id", 
                                                  $"profit", 
                                                  $"sales")
                                          .groupBy($"order_date")
                                            .agg(countDistinct("customer_id").as("num_customers"), 
                                                 sum("sales").as("overall_sales"), 
                                                 sum("profit").as("overall_profit"))
                                          .orderBy("order_date")
                                          
        println("HDFS - SUCCESS")
        println("")

        println("SPARK - Transforming Data")

        // fill missing dates
        spark.sql("set spark.sql.legacy.allowUntypedScalaUDF = true")
        val dateRangeUDF = udf(getDateRange _, ArrayType(DateType))
        val minMax = features_df.select($"order_date")
                                    .agg(min("order_date").as("min"), 
                                         max("order_date").as("max"))
        val allDates = minMax.withColumn("range", dateRangeUDF(col("min"), col("max")))
                             .withColumn("date", explode(col("range")))
                             .drop("range", "min", "max")
        features_df = allDates.join(features_df, 
                                    allDates("date")===features_df("order_date"), 
                                    "left")
                              .orderBy("date")
                              .na.fill(0)
                              .drop("order_date")
                              .withColumn("date", col("date").cast(StringType))

        // prepare features for the training process
        val indexer = new StringIndexer().setInputCol("date").setOutputCol("date_index")
        val features_dff = indexer.fit(features_df).transform(features_df)
        val assembler = new VectorAssembler().setInputCols(Array("date_index")).setOutputCol("features")
        
        // creating dataset
        val ml_dataset = assembler.transform(features_dff) 

        // creating future dataset
        val start_f_index = ml_dataset.sort($"date_index".desc).first.getDouble(4).toInt + 1
        val ml_fdataset = assembler.transform(
                            ml_dataset.select($"date".cast(DateType))
                                .agg(date_add(max("date"), 1).as("start_fdate"), 
                                     date_add(max("date"), 365).as("end_fdate"))
                                .withColumn("range", dateRangeUDF(col("start_fdate"), col("end_fdate")))
                                .withColumn("date", explode(col("range")))
                                .drop("range", "start_fdate", "end_fdate")
                                .select($"date", 
                                        lit(0).as("num_customers"), 
                                        lit(0).as("overallsales"), 
                                        lit(0).as("overallprofit"))
                                .withColumn("date_index", monotonicallyIncreasingId+start_f_index)
                            )
        println("SPARK - SUCCESS")
        println("")

        println("SPARK MLlib - Model Training and Prediction")
        val algo_profit = new LinearRegression()
                            .setLabelCol("overall_profit")
                            .setFeaturesCol("features")
                            .setMaxIter(10)
                            .setRegParam(0.3)
                            .setElasticNetParam(0.8)
        val algo_sales= new LinearRegression()
                            .setLabelCol("overall_sales")
                            .setFeaturesCol("features")
                            .setMaxIter(10)
                            .setRegParam(0.3)
                            .setElasticNetParam(0.8)
        val algo_num_customers = new LinearRegression()
                                    .setLabelCol("num_customers")
                                    .setFeaturesCol("features")
                                    .setMaxIter(10)
                                    .setRegParam(0.3)
                                    .setElasticNetParam(0.8)
                                
        val pipeline_profit = new Pipeline().setStages(Array(algo_profit))
        val pipeline_sales = new Pipeline().setStages(Array(algo_sales))
        val pipeline_num_customers = new Pipeline().setStages(Array(algo_num_customers))

        val model_profit = pipeline_profit.fit(ml_dataset)
        val model_sales = pipeline_sales.fit(ml_dataset)
        val model_num_customers = pipeline_num_customers.fit(ml_dataset)

        var predictions = model_profit.transform(ml_fdataset).withColumnRenamed("prediction", "pred_profit")
        predictions = model_sales.transform(predictions).withColumnRenamed("prediction", "pred_sales")
        predictions = model_num_customers.transform(predictions)
                            .withColumnRenamed("prediction", "pred_num_customers")
                            .select($"date", 
                                    $"pred_profit", 
                                    $"pred_sales", 
                                    $"pred_num_customers".cast(IntegerType))
        val final_predictions = predictions.select($"date", 
                                                   $"pred_profit".cast(IntegerType), 
                                                   $"pred_sales".cast(IntegerType), 
                                                   $"pred_num_customers".cast(IntegerType)) 
                                           .withColumn("year", date_format(col("date"), "y"))
                                           .withColumn("quarter", date_format(col("date"), "Q").cast(IntegerType))
                                           .withColumn("month", date_format(col("date"), "M").cast(IntegerType))
                                           .withColumn("day", date_format(col("date"), "D").cast(IntegerType))
                                           .select($"year", 
                                                   $"quarter", 
                                                   $"month", 
                                                   $"day", 
                                                   $"pred_num_customers", 
                                                   $"pred_sales", 
                                                   $"pred_profit")
        println("SPARK MLlib - SUCCESS")
        println("")
        
                                    
        println("CASSANDRA - Loading Data to Cassandra")
        final_predictions
                    .write.format("org.apache.spark.sql.cassandra")
                    .option("keyspace", "sales_serving_layer")
                    .option("table", "future_sales")
                    .option("confirm.truncate", "true").mode("overwrite").save()
        println("CASSANDRA - SUCCESS")
        println("")
        
    }
}