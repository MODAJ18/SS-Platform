CREATE KEYSPACE sales_serving_layer WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 1 };

use sales_serving_layer;


CREATE TABLE product_performance(row_id text, product_name text, category text, sub_category text, year text, quarter text, month text, day text, product_price float, overall_sales float, quantity_total int, overall_profit float, product_rating float, sentiment_score float, review_perception float, PRIMARY KEY(row_id, product_name, category, sub_category, year, quarter, month, day));


CREATE TABLE branch_sales(l_row_id text, region text, country text, city text, year text, quarter text, month text, day text, quantity_total int, overall_sales float, overall_profit float, PRIMARY KEY(l_row_id, region, country, city, year, quarter, month, day));


CREATE TABLE customer_preference_sales(category text, sub_category text, num_customers text, overall_sales float, quantity_total int, overall_profit float, PRIMARY KEY(customer_id, customer_segment, year, category, sub_category));


CREATE TABLE timely_orders(order_id text, product text, category text, sub_category text, year text, quarter text, month text, day text, sales float, quantity int, profit float, PRIMARY KEY (order_id, product, (category, sub_category, year, quarter, month, day) ));


CREATE TABLE future_sales(year text, quarter text, month text, day text, pred_num_customers int, pred_sales float, pred_profit float, PRIMARY KEY(year, quarter, month, day));






