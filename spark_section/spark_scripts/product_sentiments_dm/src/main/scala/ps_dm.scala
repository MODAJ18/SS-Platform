import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._


object ps_dm {
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

    def getTwitterData(spark: SparkSession): org.apache.spark.sql.DataFrame = {
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
        val dfFromText = spark.read.text("hdfs://localhost:9000/datalake/" +
          "mongodb.twitter_sentiment_db.tweet_collection/*/*/*/*.txt")
        
        // cleaning and structuring data
        val df_cleaned = dfFromText.columns.foldLeft(dfFromText)(
            (dfFromText, c) => dfFromText.withColumn(c, regexp_replace(col(c), "\\\\", ""))
            )
            .withColumn("value", expr("substring(value, 2, length(value) - 2)"))
        val jsonSchema_formed = new StructType().add("fullDocument", StringType)
        val df_formed = df_cleaned.select(from_json($"value", jsonSchema_formed) as "vals").select($"vals.*")
        val main_data_schema = new StructType().add("_id", StringType)
                                               .add("tweet_id", IntegerType)
                                               .add("product", StringType)
                                               .add("tweet_poster", StringType)
                                               .add("tweet_mention", StringType)
                                               .add("tweet_date", StringType)
                                               .add("tweet_text", StringType)
                                               .add("num_comments", IntegerType)
                                               .add("num_retweets", IntegerType)
                                               .add("num_likes", IntegerType)
                                               .add("num_views", IntegerType)
        var tweet_prod_df = df_formed.select(from_json($"fullDocument", main_data_schema) as "nested_vals")
                               .select($"nested_vals.*")
        val js_tdate = new StructType().add("$date", StringType)
        val js_tid = new StructType().add("$oid", StringType)
        tweet_prod_df = tweet_prod_df.select(from_json($"_id", js_tid ) as "doc_id",
                                                       $"tweet_id",
                                                       $"product", 
                                                       $"tweet_poster", 
                                                       from_json($"tweet_date", js_tdate) as "tweet_date", 
                                                       $"tweet_text", 
                                                       $"num_comments", 
                                                       $"num_retweets", 
                                                       $"num_likes", 
                                                       $"num_views")
                                     .select($"doc_id.*",
                                             $"tweet_id",
                                             $"product",
                                             $"tweet_poster",
                                             $"tweet_date.*", 
                                             $"tweet_text", 
                                             $"num_comments", 
                                             $"num_retweets", 
                                             $"num_likes", 
                                             $"num_views")
                                     .withColumn("tweet_date", from_unixtime(col("$date")/1000, "yyyy-MM-dd")
                                        .cast("date"))
                                     .drop("$date")
                                     .withColumn("doc_id", col("$oid"))
                                     .drop("$oid")
                                     .filter("tweet_id is not NULL")

        tweet_prod_df = tweet_prod_df.filter("tweet_text is not NULL")
                            .select($"tweet_id",
                                    $"product", 
                                    $"tweet_poster", 
                                    $"tweet_text", 
                                    split(lower(trim(col("tweet_text")))," ").as("tweet_sentiment_score"), 
                                    $"num_comments", 
                                    $"num_retweets", 
                                    $"num_likes", 
                                    $"num_views", 
                                    $"tweet_date", 
                                    $"doc_id")

        tweet_prod_df = tweet_prod_df.map(row=>{
                            var word_arr = row.getSeq[String](4)
                            var score = word_arr.map(word_i=>{
                                if (lexicon_words.contains(word_i)) {
                                    lexicon_scores.apply(lexicon_words.indexOf(word_i)) * 0.7 + 
                                                            (1/(word_arr.length + 1))* 0.3
                                }
                                else 0
		                        }).sum
		                    (row.getInt(0), row.getString(1), row.getString(2), 
                             row.getString(3), score, row.getInt(5), row.getInt(6), 
                             row.getInt(7), row.getInt(8), row.getDate(9))
		                }).toDF("tweet_id",
                                "t_product_name",
                                "tweet_poster", 
                                "tweet_text", 
                                "tweet_sentiment_score", 
                                "num_comments", 
                                "num_retweets", 
                                "num_likes", 
                                "num_views", 
                                "tweet_date")
        
        return tweet_prod_df
    }

    def main(args: Array[String]) = {
        // order_details_df, products_df, ama_prod_enh_dfff3, tweet_prod_enh_dff3
        println("START - Spark Session")
        val spark = SparkSession.builder()
                        .appName("ETL-data_lake_to_product_sentiments_data_mart")
                        .config("spark.sql.warehouse.dir","hdfs://localhost:9000/user/hive/warehouse")
                        .config("hive.exec.dynamic.partition", "true")
                        .config("hive.exec.dynamic.partition.mode", "nonstrict")
                        .enableHiveSupport()
                        .getOrCreate()
        spark.sql("set hive.exec.dynamic.partition = true")
        spark.sql("set hive.exec.dynamic.partition.mode = nonstrict")                 
        import spark.implicits._
        println("START - SUCCESS")
        println("")

        println("HDFS - Getting Data")
        val order_details_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-OrderDetails/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "od_row_id")
        val products_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Products/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "p_row_id")

        val ama_prod_df = getAmazonData(spark)
        val twitter_prod_df = getTwitterData(spark)
        println("HDFS - SUCCESS")
        println("")

        println("HIVE - Forming Tables for Data Mart")
        val ps_dw_products = products_df.join(order_details_df, 
                                        products_df("p_row_id")===order_details_df("product_bought"), 
                                        "left")
                                    .na.drop()
                                    .groupBy("p_row_id", "product_name", "category", "sub_category")
                                    .agg(avg("product_price").as("product_price"),
                                            sum("sales").as("overall_sales"), 
                                            sum("quantity").as("quantity_total"), 
                                            sum("profit").as("overall_profit"))
        val ps_dw_ama_prod =  ama_prod_df.filter("product_similarity > 0.35")
                                    .na.drop()
                                    .toDF
                                    .groupBy("a_product_name")
                                        .agg(max("review_count").as("number_of_amazon_reviews"),
                                             avg("review_score").as("amazon_rating_avg"),
                                             avg("review_sentiment_score").as("amazon_sentiment_score"))
        val ps_dw_tweet_prod = twitter_prod_df.select($"tweet_id".
                                                cast(StringType), 
                                                $"t_product_name", 
                                                $"tweet_poster", 
                                                $"tweet_text", 
                                                $"tweet_sentiment_score", 
                                                $"num_comments", 
                                                $"num_retweets", 
                                                $"num_likes", 
                                                $"num_views", 
                                                $"tweet_date")
                                        .filter("t_product_name is not NULL")
                                        .na.drop()
                                        .toDF
                                        .withColumn("year", date_format(col("tweet_date"), "y"))
                                        .withColumn("month", date_format(col("tweet_date"), "M"))

        println("HIVE - Loading Data to Hive Tables")
        spark.sql("CREATE DATABASE IF NOT EXISTS product_sentiments")
        spark.sql("use product_sentiments")
        ps_dw_products.write.mode("overwrite").partitionBy("category", "sub_category").format("hive").saveAsTable("product_sentiments.productInfo")
        ps_dw_ama_prod.write.mode("overwrite").format("hive").saveAsTable("product_sentiments.AmazonSentiments")
        ps_dw_tweet_prod.write.mode("overwrite").partitionBy("year", "month").format("hive").saveAsTable("product_sentiments.TwitterSentiments")
        println("HIVE - SUCCESS")
        println("")
    }
}