/* product sentiments data mart */
-- Hypothesis 1: does high rating determine well sold products?
SELECT ase.a_product_name, ROUND(ase.amazon_rating_avg, 2) as avg_rating, overall_sales, overall_profit
FROM amazonSentiments ase
JOIN productinfo pi on ase.a_product_name=pi.product_name
ORDER BY avg_rating desc
LIMIT 10;

-- Hypothesis 2: is there correlation between twitter general sentiment and amazon ratings?
SELECT t_product_name, ROUND(avg(tweet_sentiment_score), 3) as avg_tweet_sentscore, 
                       ROUND(avg(ase.amazon_rating_avg), 2) as avg_amazon_rating,
                       ROUND(avg(ase.amazon_sentiment_score), 2) as avg_amazon_sentscore
FROM twittersentiments ts
JOIN amazonSentiments ase ON ts.t_product_name=ase.a_product_name
GROUP BY t_product_name
ORDER BY avg_tweet_sentscore desc
LIMIT 10; 

-- Hypothesis 3: is the company declining in popularity?
SELECT year(tweet_date) as year_period, avg(tweet_sentiment_score) as popularity_score
FROM twittersentiments
GROUP BY year_period
ORDER BY year_period desc
LIMIT 10;


/* product sentiments data mart */
-- Hypothesis 4: is there a decline in company ratings?
SELECT year(review_date) as year_period, ROUND(avg(rating), 2) as avg_rating, ROUND(avg(sentiment_score), 2) as avg_sentscore
FROM reviewhistory
GROUP BY year_period
ORDER BY year_period desc
LIMIT 10;



/* order history data mart */
-- Hypothesis 5: are highly sold products have correlation with ratings and product sentiment?
SELECT sum(odt.overall_profit) as product_profit, 
       sum(odt.overall_sales) as product_sales,
       avg(pdt.product_rating) as product_rating,
       avg(pdt.tweet_sentiment_score) as product_sentscore
FROM order_dt odt
JOIN product_dt pdt ON pdt.p_row_id=odt.product_bought
GROUP BY product_bought
ORDER BY product_sales;

-- Hypothesis 6: is there relation between time, popularity, and company sales?
SELECT year(order_date) as year_period
       sum(odt.overall_profit) as yearly_profit, 
       sum(odt.overall_sales) as yearly_sales,
       avg(pdt.product_rating) as yearly_rating,
       avg(pdt.tweet_sentiment_score) as yearly_sentscore
FROM order_dt odt
JOIN product_dt pdt ON pdt.p_row_id=odt.product_bought
GROUP BY year_period
ORDER BY year_period;