import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._


object tos_sl {
    def main(args: Array[String]) = {
        println("START - Spark Session")
        val spark = SparkSession.builder()
                        .appName("ETL-data_lake_to_timely_order_sales_serving_layer")
                        .config("spark.sql.warehouse.dir","hdfs://localhost:9000/user/hive/warehouse")
                        .enableHiveSupport()
                        .getOrCreate()
        import spark.implicits._
        println("START - SUCCESS")
        println("")

        println("HDFS - Getting Data")
        val customers_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Customers/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "c_row_id")
        val order_details_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-OrderDetails/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "od_row_id")
                                    .withColumnRenamed("order_id", "od_order_id")
        var orders_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Orders/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "o_row_id")
                                    .withColumn("order_date", from_unixtime(col("order_date")*86400, "yyyy-MM-dd")
                                                                .cast("date"))
                                    .withColumn("ship_date", from_unixtime(col("ship_date")*86400, "yyyy-MM-dd")
                                                                .cast("date"))                     
        val products_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Products/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "p_row_id")

        println("HDFS - SUCCESS")
        println("")

        println("KAFKA - Getting Data")
        val sales_feed_df = spark
            .read
            .format("kafka")
            .option("kafka.bootstrap.servers", "localhost:9092")
            .option("subscribe", "sales_feed")
            .load().selectExpr("CAST(value AS STRING)")
        val valueSchema =  StructType(Array(StructField("order_id", StringType),
                                            StructField("order_date", DateType),
                                            StructField("ship_date", DateType),
                                            StructField("ship_mode", StringType),
                                            StructField("customer_id", StringType),
                                            StructField("order_details", 
                                                    ArrayType(MapType(StringType,StringType))) ))
        val sales_feed_df_formatted = sales_feed_df.select(from_json(col("value"), valueSchema).as("data"))
                                                .select(col("data.order_id").as("order_id"), 
                                                        col("data.order_date").as("order_date"), 
                                                        col("data.ship_date").as("ship_date"), 
                                                        col("data.ship_mode").as("ship_mode"), 
                                                        col("data.customer_id").as("customer_id"), 
                                                        explode(col("data.order_details")).as("order_details"))
                                                .select(col("order_id"), col("order_date"), 
                                                        col("ship_date"), col("ship_mode"), 
                                                        col("customer_id"), 
                                                        col("order_details.order_detail_id").as("order_detail_id"), 
                                                        col("order_details.order_id").as("od_order_id"), 
                                                        col("order_details.product_id").as("product_id"), 
                                                        col("order_details.location_id").as("location_id"), 
                                                        col("order_details.sales").as("sales"), 
                                                        col("order_details.quantity").as("quantity"), 
                                                        col("order_details.discount").as("discount"), 
                                                        col("order_details.profit").as("profit"))

        println("KAFKA - SUCCESS")
        println("")
        
        println("CASSANDRA - Transforming Tables for Serving")
        val sl_timely_sales = products_df.join(order_details_df, 
                                               products_df("p_row_id")===order_details_df("product_bought"), 
                                               "inner")
                                         .join(orders_df, 
                                               order_details_df("od_order_id")===orders_df("order_id"), 
                                               "inner")                                        
                                         .withColumn("year", date_format(col("order_date"), "y"))
                                         .withColumn("quarter", date_format(col("order_date"), "Q"))
                                         .withColumn("month", date_format(col("order_date"), "M"))
                                         .withColumn("day", date_format(col("order_date"), "D"))
                                         .select($"order_id", 
                                                 $"product_name".as("product"), 
                                                 $"category", 
                                                 $"sub_category", 
                                                 $"year", 
                                                 $"quarter", 
                                                 $"month", 
                                                 $"day", 
                                                 $"profit", 
                                                 $"quantity", 
                                                 $"sales")
        val sl_timely_orders_stream = products_df.join(sales_feed_df_formatted, 
                                                           products_df("p_row_id")===sales_feed_df_formatted("product_id"), 
                                                           "inner")
                                                    .withColumn("year", date_format(col("order_date"), "y"))
                                                    .withColumn("quarter", date_format(col("order_date"), "Q"))
                                                    .withColumn("month", date_format(col("order_date"), "M"))
                                                    .withColumn("day", date_format(col("order_date"), "D"))
                                                    .select($"order_id", 
                                                            $"product_name".as("product"), 
                                                            $"category", 
                                                            $"sub_category", 
                                                            $"year", 
                                                            $"quarter", 
                                                            $"month", 
                                                            $"day", 
                                                            $"profit", 
                                                            $"quantity", 
                                                            $"sales")
        val sl_timely_orders_concat = sl_timely_sales.union(sl_timely_orders_stream).dropDuplicates()
        println("CASSANDRA - Loading Data to Cassandra")
        sl_timely_orders_concat
                    .write.format("org.apache.spark.sql.cassandra")
                    .option("keyspace", "sales_serving_layer")
                    .option("table", "timely_orders")
                    .option("confirm.truncate", "true").mode("overwrite").save()
                    
        println("CASSANDRA - SUCCESS")
        println("")
    }
}