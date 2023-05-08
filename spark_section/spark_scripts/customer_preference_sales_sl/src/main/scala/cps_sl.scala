import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._


object cps_sl {
    def main(args: Array[String]) = {
        println("START - Spark Session")
        val spark = SparkSession.builder()
                        .appName("ETL-data_lake_to_customer_preferences_sales_serving_layer")
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
        
        println("CASSANDRA - Transforming Tables for Serving")
        val sl_customer_preference_sales = products_df.join(order_details_df, 
                                                            products_df("p_row_id")===order_details_df("product_bought"), 
                                                            "left")
                                                      .join(orders_df, 
                                                            order_details_df("od_order_id")===orders_df("order_id"), 
                                                            "inner")
                                                      .join(customers_df, 
                                                            orders_df("customer")===customers_df("customer_id"), 
                                                            "inner")
                                                      .withColumnRenamed("segment", "customer_segment")
                                                      .withColumn("year", date_format(col("order_date"), "y"))
                                                      .withColumn("quarter", date_format(col("order_date"), "Q"))
                                                      .withColumn("month", date_format(col("order_date"), "M"))
                                                      .withColumn("day", date_format(col("order_date"), "D"))
                                                      .groupBy("category", "sub_category", "year", "quarter", "month", "day")
                                                            .agg(countDistinct("customer_id").as("num_customers"),
                                                                 sum("sales").as("overall_sales"), 
                                                                 sum("quantity").as("quantity_total"), 
                                                                 sum("profit").as("overall_profit"))

                                    
        println("CASSANDRA - Loading Data to Cassandra")
        sl_customer_preference_sales
                    .write.format("org.apache.spark.sql.cassandra")
                    .option("keyspace", "sales_serving_layer")
                    .option("table", "customer_preference_sales")
                    .option("confirm.truncate", "true").mode("overwrite").save()
        println("CASSANDRA - SUCCESS")
        println("")
    }
}