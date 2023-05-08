import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._

object er_dm {
    def getAmazonData(spark: SparkSession): org.apache.spark.sql.DataFrame = {
        import spark.implicits._

        // getting lexicon data
        val lexicon = spark.read.text("/downloaded/SemEval2015-English-Twitter-Lexicon.txt")
                        .withColumn("score", split(col("value"), "\t")
                                .getItem(0).cast("double"))
                        .withColumn("word", split(col("value"), "\t").getItem(1))
                        .drop("value")
                        .withColumn("word", regexp_replace($"word", "#", ""))
        val lexicon_words = lexicon.select("word").as[String].collect().toList
        val lexicon_scores = lexicon.select("score").as[Double].collect().toList

        // importing data                
        val df_from_text = spark.read.text("hdfs://localhost:9000/datalake" +
          "/mongodb.amazon_product_reviews_db.product_reviews/*/*/*/*.txt")

        // cleaning and structuring data
        val df_cleaned = df_from_text.columns.foldLeft(df_from_text)(
            (df_from_text, c) => df_from_text.withColumn(c, regexp_replace(col(c), "\\\\", "")))
            .withColumn("value", expr("substring(value, 2, length(value) - 2)"))
        val schema_form = new StructType().add("fullDocument", StringType)
        val df_formed = df_cleaned.select(from_json($"value", schema_form) as "vals").select($"vals.*")
        val main_data_schema = new StructType().add("_id", StringType)
                                          .add("product_id_AMA", IntegerType)
                                          .add("product", StringType)
                                          .add("product_similarity", DoubleType)
                                          .add("price", FloatType)
                                          .add("rating", StringType)
                                          .add("availability", StringType)
                                          .add("review_count", StringType)
                                          .add("amazon_product_name", StringType)
                                          .add("review_date", StringType)
                                          .add("review_score", FloatType)
                                          .add("review_text", StringType)
        var ama_prod_df = df_formed.select(from_json($"fullDocument", main_data_schema) as "nested_vals")
                                    .select($"nested_vals.*")
        val js_rdate = new StructType().add("$date", StringType)
        val js_id = new StructType().add("$oid", StringType)
        ama_prod_df = ama_prod_df.select(from_json($"_id", js_id) as "doc_id", 
                                         $"product_id_AMA",
                                         $"product",
                                         $"product_similarity",
                                         $"price",
                                         $"rating",
                                         $"availability",
                                         $"review_count",
                                         $"amazon_product_name",
                                         from_json($"review_date", js_rdate) as "review_date",
                                         $"review_score", $"review_text")
                                 .select($"doc_id.*",
                                         $"product_id_AMA",
                                         $"product",
                                         $"product_similarity",
                                         $"price",
                                         $"rating",
                                         $"availability",
                                         $"review_count",
                                         $"amazon_product_name",
                                         $"review_date.*",
                                         $"review_score",
                                         $"review_text")
                                .withColumn("review_date", from_unixtime(col("$date")/1000, "yyyy-MM-dd")
                                        .cast("date"))
                                .drop("$date")
                                .withColumn("doc_id", col("$oid"))
                                .drop("$oid")
        
        // adding sentiment scores                        
        ama_prod_df = ama_prod_df.filter("review_text is not NULL")
                                 .select($"product_id_AMA",
                                         $"product",
                                         $"product_similarity",
                                         $"price", 
                                         $"rating".cast(FloatType), 
                                         $"availability", 
                                         $"review_count".cast(IntegerType), 
                                         $"amazon_product_name", 
                                         $"review_score", 
                                         $"review_text", 
                                         split(lower(trim(col("review_text")))," ").as("NameArray"),
                                         $"review_date", 
                                         $"doc_id")
        ama_prod_df = ama_prod_df.map(row=>{
                        var word_arr = row.getSeq[String](10)
                        var score = word_arr.map(word_i=>{
                            if (lexicon_words.contains(word_i)) {
                                lexicon_scores.apply(lexicon_words.indexOf(word_i)) * 0.7 + (1/(word_arr.length + 1))* 0.3
                            }
                            else 0
                            }).sum
                        (row.getInt(0), row.getString(1), row.getDouble(2), 
                         row.getFloat(3), row.getFloat(4), row.getString(5), 
                         row.getInt(6), row.getString(7), row.getFloat(8), 
                         row.getString(9), score, row.getDate(11), row.getString(12))
                    }).toDF("product_id_AMA", 
                            "a_product_name", 
                            "product_similarity", 
                            "price", 
                            "rating", 
                            "availability", 
                            "review_count", 
                            "amazon_product_name", 
                            "review_score", 
                            "review_text", 
                            "review_sentiment_score", 
                            "review_date", 
                            "doc_id")

        return ama_prod_df
    }

    def main(args: Array[String]) = {
        println("START - Spark Session")
        val spark = SparkSession.builder()
                        .appName("ETL-data_lake_to_ecommerce_reviews_data_mart")
                        .config("spark.sql.warehouse.dir","hdfs://localhost:9000/user/hive/warehouse")
                        .config("hive.exec.dynamic.partition", "true")
                        .config("hive.exec.dynamic.partition.mode", "nonstrict")
                        .enableHiveSupport()
                        .getOrCreate()
        import spark.implicits._
        println("START - SUCCESS")
        println("")

        println("HDFS - Getting Data")
        val customers_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Customers/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "c_row_id")
        val locations_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Locations/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "l_row_id")
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
        val ama_prod_df = getAmazonData(spark)
        println("HDFS - SUCCESS")
        println("")
        
        println("HIVE - Forming Tables for Data Mart")
        val ecr_dw_products_all = products_df.join(order_details_df, 
                                                   products_df("p_row_id")===order_details_df("product_bought"), 
                                                   "left")
                                    .join(orders_df, 
                                            order_details_df("od_order_id")===orders_df("order_id"), 
                                            "inner")
                                    .join(customers_df, 
                                            orders_df("customer")===customers_df("customer_id"), 
                                            "inner")
                                    .join(locations_df, 
                                            order_details_df("location_bought")===locations_df("l_row_id"), 
                                            "inner")
                                    .na.drop()
                                    .groupBy("p_row_id", "product_name", "category", "sub_category")
                                        .agg(avg("product_price").as("product_price"), 
                                                sum("sales").as("overall_sales"), 
                                                sum("quantity").as("quantity_total"), 
                                                sum("profit").as("overall_profit"), 
                                                countDistinct("order_id").as("num_orders"), 
                                                countDistinct("customer_id").as("num_customers"))
        val ecr_dw_review_history = ama_prod_df.select($"product_id_AMA".as("review_id"),
                                                       $"a_product_name".as("product_name"), 
                                                       $"amazon_product_name", 
                                                       $"review_text", 
                                                       $"review_score".as("rating"), 
                                                       $"review_date", 
                                                       $"price".as("amazon_product_price"), 
                                                       $"review_sentiment_score".as("sentiment_score"))

        println("HIVE - Loading Data to Hive Tables")
        spark.sql("CREATE DATABASE IF NOT EXISTS ecommerce_reviews")
        spark.sql("use ecommerce_reviews")
        ecr_dw_products_all.write.mode("overwrite").partitionBy("category", "sub_category").format("hive").saveAsTable("ecommerce_reviews.ProductAggregates")
        ecr_dw_review_history.write.mode("overwrite").partitionBy("product_name").format("hive").saveAsTable("ecommerce_reviews.ReviewHistory")
        println("HIVE - SUCCESS")
        println("")
    }
}