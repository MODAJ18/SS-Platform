import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._


object sf_stream {
    def main(args: Array[String]) = {
        println("START - Spark Session")
        val spark = SparkSession.builder()
                        .appName("stream-ETL-speed-layer")
                        .getOrCreate()
        import spark.implicits._
        println("START - SUCCESS")
        println("")

        println("HDFS - Getting Data")
        val products_df = spark.read.json("hdfs://localhost:9000/datalake/mysql-db-source-Products/*/*/*/*.json")
                                    .withColumnRenamed("row_id", "p_row_id")
        println("HDFS - SUCCESS")
        println("")

        println("KAFKA - Getting Data")
        val sales_feed_df = spark
            .readStream
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
        // val sl_daily_sales = products_df.join(sales_feed_df_formatted, 
        //                                       products_df("p_row_id")===sales_feed_df_formatted("product_id"), 
        //                                       "inner")
        //                                 .withColumn("year", date_format(col("order_date"), "y"))
        //                                 .withColumn("quarter", date_format(col("order_date"), "Q"))
        //                                 .withColumn("month", date_format(col("order_date"), "M"))
        //                                 .withColumn("day", date_format(col("order_date"), "D"))
        //                                 .withColumn("timestamp", unix_timestamp(col("order_date"), "MM/dd/yyyy hh:mm:ss aa").cast(TimestampType))
        //                                 .withWatermark("timestamp", "1 minutes")
        //                                 .groupBy("order_id", "product_name", "category", "sub_category", 
        //                                          "year", "quarter", "month", "day", "timestamp")
        //                                          .agg(sum("sales").as("sales"), 
        //                                               sum("quantity").as("quantity"), 
        //                                               sum("profit").as("profit"),
        //                                               max(col("timestamp")).as("max_timestamp"))
        //                                 .withColumnRenamed("product_name", "product")
        // val sl_monthly_sales = products_df.join(sales_feed_df_formatted, 
        //                                         products_df("p_row_id")===sales_feed_df_formatted("product_id"), 
        //                                         "inner")
        //                                   .withColumn("year", date_format(col("order_date"), "y"))
        //                                   .withColumn("quarter", date_format(col("order_date"), "Q"))
        //                                   .withColumn("month", date_format(col("order_date"), "M"))
        //                                   .withColumn("timestamp", unix_timestamp(col("order_date"), "MM/dd/yyyy hh:mm:ss aa").cast(TimestampType))
        //                                   .withWatermark("timestamp", "1 minutes")
        //                                   .groupBy("order_id", "product_name", "category", "sub_category", 
        //                                            "year", "quarter", "month", "timestamp")
        //                                            .agg(sum("sales").as("sales"), 
        //                                                 sum("quantity").as("quantity"), 
        //                                                 sum("profit").as("profit"),
        //                                                 max(col("timestamp")).as("max_timestamp"))
        //                                   .withColumnRenamed("product_name", "product")
        // val sl_quarterly_sales = products_df.join(sales_feed_df_formatted, 
        //                                           products_df("p_row_id")===sales_feed_df_formatted("product_id"), 
        //                                           "inner")
        //                                     .withColumn("year", date_format(col("order_date"), "y"))
        //                                     .withColumn("quarter", date_format(col("order_date"), "Q"))
        //                                     .withColumn("timestamp", unix_timestamp(col("order_date"), "MM/dd/yyyy hh:mm:ss aa").cast(TimestampType))
        //                                     .withWatermark("timestamp", "1 minutes")
        //                                     .groupBy("order_id", "product_name", "category", "sub_category", 
        //                                              "year", "quarter", "timestamp")
        //                                              .agg(sum("sales").as("sales"), 
        //                                                   sum("quantity").as("quantity"), 
        //                                                   sum("profit").as("profit"),
        //                                                   max(col("timestamp")).as("max_timestamp"))
        //                                     .withColumnRenamed("product_name", "product")
        // val sl_yearly_sales = products_df.join(sales_feed_df_formatted,
        //                                        products_df("p_row_id")===sales_feed_df_formatted("product_id"), 
        //                                        "inner")
        //                                  .withColumn("year", date_format(col("order_date"), "y"))
        //                                  .withColumn("timestamp", unix_timestamp(col("order_date"), "MM/dd/yyyy hh:mm:ss aa").cast(TimestampType))
        //                                  .withWatermark("timestamp", "1 minutes")
        //                                  .groupBy("order_id", "product_name", "category", "sub_category", 
        //                                           "year", "timestamp")
        //                                           .agg(sum("sales").as("sales"), 
        //                                                sum("quantity").as("quantity"), 
        //                                                sum("profit").as("profit"),
        //                                                max(col("timestamp")).as("max_timestamp"))
        //                                  .withColumnRenamed("product_name", "product")
        //                                  .withColumn("current_timestamp", current_timestamp().as("current_timestamp"))
        val stream_timely_orders_stream = products_df.join(sales_feed_df_formatted, 
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

        println("CASSANDRA - SUCCESS")
        // sl_daily_sales
        //             .write.format("org.apache.spark.sql.cassandra")
        //             .option("keyspace", "sales_serving_layer")
        //             .option("table", "daily_orders_stream")
        //             .option("confirm.truncate", "true").mode("append").save()
        // sl_monthly_sales
        //             .write.format("org.apache.spark.sql.cassandra")
        //             .option("keyspace", "sales_serving_layer")
        //             .option("table", "monthly_orders_stream")
        //             .option("confirm.truncate", "true").mode("append").save()
        // sl_quarterly_sales
        //             .write.format("org.apache.spark.sql.cassandra")
        //             .option("keyspace", "sales_serving_layer")
        //             .option("table", "quarterly_orders_stream")
        //             .option("confirm.truncate", "true").mode("append").save()
        // sl_yearly_sales
        //             .write.format("org.apache.spark.sql.cassandra")
        //             .option("keyspace", "sales_serving_layer")
        //             .option("table", "yearly_orders_stream")
        //             .option("confirm.truncate", "true").mode("append").save()
        

        // Start running stream queries
        // val query1 = sl_daily_sales.select(col("order_id"),
        //                                    col("product"),
        //                                    col("category"),
        //                                    col("sub_category"),
        //                                    col("year"),
        //                                    col("quarter"),
        //                                    col("month"),
        //                                    col("day"),
        //                                    col("profit"), 
        //                                    col("quantity"),
        //                                    col("sales"))   
        //                 .writeStream
        //                 .format("org.apache.spark.sql.cassandra")
        //                 .option("keyspace","sales_serving_layer")
        //                 .option("table","daily_orders_stream")
        //                 .option("checkpointLocation", "/home/modaj/Workspace/Projects/DE_Sales_Data/spark_scripts/sales_feed_stream/checkpoint_optional_dos")
        //                 .outputMode("append")
        //                 .start()
        // val query2 = sl_monthly_sales.select(col("order_id"),
        //                                     col("product"),
        //                                     col("category"),
        //                                     col("sub_category"),
        //                                     col("year"),
        //                                     col("quarter"),
        //                                     col("month"),
        //                                     col("profit"), 
        //                                     col("quantity"),
        //                                     col("sales"))  
        //                 .writeStream
        //                 .format("org.apache.spark.sql.cassandra")
        //                 .option("keyspace","sales_serving_layer")
        //                 .option("table","monthly_orders_stream")
        //                 .option("checkpointLocation", "/home/modaj/Workspace/Projects/DE_Sales_Data/spark_scripts/sales_feed_stream/checkpoint_optional_mos")
        //                 .outputMode("append")
        //                 .start()
        // val query3 = sl_quarterly_sales.select(col("order_id"),
        //                                     col("product"),
        //                                     col("category"),
        //                                     col("sub_category"),
        //                                     col("year"),
        //                                     col("quarter"),
        //                                     col("profit"), 
        //                                     col("quantity"),
        //                                     col("sales"))  
        //                 .writeStream
        //                 .format("org.apache.spark.sql.cassandra")
        //                 .option("keyspace","sales_serving_layer")
        //                 .option("table","quarterly_orders_stream")
        //                 .option("checkpointLocation", "/home/modaj/Workspace/Projects/DE_Sales_Data/spark_scripts/sales_feed_stream/checkpoint_optional_qos")
        //                 .outputMode("append")
        //                 .start()
        // val query4 = sl_yearly_sales.select(col("order_id"),
        //                                     col("product"),
        //                                     col("category"),
        //                                     col("sub_category"),
        //                                     col("year"),
        //                                     col("profit"), 
        //                                     col("quantity"),
        //                                     col("sales"),
        //                                     col("current_timestamp"))  
        //                 .writeStream
        //                 .format("org.apache.spark.sql.cassandra")
        //                 .option("keyspace","sales_serving_layer")
        //                 .option("table","yearly_orders_stream")
        //                 .option("checkpointLocation", "/home/modaj/Workspace/Projects/DE_Sales_Data/spark_scripts/sales_feed_stream/checkpoint_optional_yos")
        //                 .outputMode("append")
        //                 .start()
        val query5 = stream_timely_orders_stream
                        .writeStream
                        .format("org.apache.spark.sql.cassandra")
                        .option("keyspace", "sales_serving_layer")
                        .option("table", "timely_orders")
                        .option("checkpointLocation", 
                        "/home/modaj/Workspace/Projects/DE_Sales_Data/spark_scripts/sales_feed_stream/checkpoint_optional_yos")
                        .outputMode("append")
                        .start()
        query5.awaitTermination()
    }
}