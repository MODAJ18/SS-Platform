<!-- PROJECT SHIELDS -->
<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


<!-- Introduction -->
# SS-Platform

This platform allows analytics and machine learning forecasting of large-scale retail data from mega stores by integrating various sources of operational databases and simulated live-feed APIs into a data lake. The platform centralizes storage by cataloging data and facilitates detailed analysis in a data warehouse. The data is processed through a scalable pipeline based on a lambda architecture and served for analytics in a BI dashboard, providing the latest data for the business.

The platform provides users with the ability to monitor their business's sales, sales volume, and revenue over yearly, quarterly, monthly, and daily intervals, enabling them to comprehend historical trends. In addition, the platform offers branch sales, product aggregated performance metrics, and sales forecasting analytics to provide a comprehensive outlook on the business's operational performance.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#SS-Platform">About The Project</a>
    </li>
    <li>
      <a href="#architecture-and-workflow">Architecture and Workflow</a>
      <ul>
        <li><a href="#main-architecture">Main Architecture</a></li>
        <li><a href="#data">Data</a></li>
        <li><a href="#data-ingestion">Data Ingestion</a></li>
        <li><a href="#data-storage">Data Storage</a></li>
        <li><a href="#pipeline---batch-and-speed-layer">Pipeline - Batch and Speed Layer</a></li>
        <li><a href="#web-applicaiton---bi-dashboard">Web Applicaiton - BI Dashboard</a></li>
      </ul>
    </li>
    <li><a href="#ss-platform-components">SS-Platform Components</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>


<!-- Architecture and Workflow -->
## Architecture and Workflow

### Main Architecture

the platform can be broken down to three parts: 
<ol>
  <li>Data pipeline based on lambda architecture, having a batch layer as well as a speed layer.</li>  
  <li>Data lake and and data warehouse that are updated and added on to through the pipeline, both being appropriately prepared in partitions, with the data warehouse being composed of several data marts.</li>  
  <li>Full-stack web application built with node js and angular, to visualize and analyse the data served by the pipeline.</li>  
</ol>

<p float="left" align="center">
  <img src="Extras/images/Architecture.png" alt="architecture" width="850" height="500">
</p>

### Data 
For this project, data containing superstore information on Kaggle (available at the link: https://www.kaggle.com/datasets/vivek468/superstore-dataset-final) was used to create a traditional transactional database system that includes order sales, product, customer, and location data for a hypothetical business. Additionally, an API feed was built in FastAPI and Apache Nifi to simulate a stream source of online orders and transactions using the same data.

<p float="left" align="center">
  <img src="Extras/images/raw-data.png" alt="raw-data" width="550" height="300">
</p>
<p float="left" align="center">
  <img src="Extras/images/main-data-er-model.png" alt="main-data-er-model" width="550" height="300">
</p>
<p float="left" align="center">
  <img src="Extras/images/other-data-er-model.png" alt="other-data-er-model" width="450" height="300">
</p>

Customer sentiments and online perception is also incorporated by scraping relavent information from twitter on different products that the business sells, and then retrieving tweets regarding users talking about the products. 

To enhance the product data and gather customer sentiment, Amazon product reviews and information are scraped and stored. This provides rating data and review perception on different products for the company. This is done in addition to gathering customer sentiments from Twitter.

Data that is not relevant to the pipeline, such as the Dojo shopping API data, is only stored for the purpose of ensuring that all data is stored properly. This data is not incorporated into the data warehouse for analysis or analytics. Instead, it is stored in the data lake, which is deployed in HDFS.

### Data Ingestion

To simulate the need for integrating various sources into a central storage system, multiple databases were established in MySQL, PostgreSQL, and MongoDB. Each database stores one or two of the sources of data collected from web scraping, APIs, or downloads from Kaggle. The events of database inserts are then stored in Kafka as events to fulfill a change-data-capture process. By using Kafka Connect, different source connectors are utilized to automatically ingest data into Kafka topics.

Kafka serves as the main ingestion layer enabling the pipeline, and serving both speed and batch layers, and creation of HDFS data lake.

### Data Storage

A HDFS sink connector is employed to aggregate data from multiple sources into JSON and text files organized in daily partiions. Data from the data lake is utilized for building the serving layer and machine learning components. Furthermore, a batch pipeline is utilized to perform an ETL process for deploying data to a data warehouse created in Apache Hive, which is composed of three data marts: E-commerce Reviews, Product Sentiments, and Order History.

The data lake serves to store raw data in its various forms, while data warehouse stores data prepared for analytics and EDA, as well as building dataset for modeling in machine learning, both are partitioned accordingly for better access and querying.

### Pipeline - Batch and Speed Layer

In this project, Spark is the tool chosen for the batch layer. Batch scripts are written in Scala and compiled with sbt build tool. Multiple batch layer jobs are executed periodically throughout the day, where the batch layer jobs are retrieving raw data from HDFS and performing required tasks, and then saving the results in the Serving layer. Crontab is the main tool for scheduling various batch jobs.

for the speed layer, spark structured streaming is utilized. the script is written in Scala. streams layer serves to supplement the batch layer to immediately process and transform online transactions from customers orders, extracted data directly from kafka, processing it, and storing it in cassandra tables to serve near real-time data for the serving layer. 

Several Tasks performed by the pipeline:
- preparing product sentiment scores, ratings, and sales information.
- customer preference trends in regards to certain products and shopping categories.
- yearly, quarterly, monthly, and daily sale figures.
- branch and city locations sale production, in terms of revenue and sale volume.
- sentiment analysis and ML forecasting of profit and customer counts.
- updating of Hive data warehouse.

Most tasks are performed by the batch layer, with the speed layer being employed for necessary processing of oncoming customer orders.
 
-- <yarn-batch-and-stream-pictures>
<p float="left" align="center">
  <img src="Extras/images/yarn-finished-jobs.png" alt="yarn-finished-jobs" width="800" height="400">
</p>

### Web Applicaiton - BI Dashboard

Node js is the framework of choosing for the backend, it fetches data from the serving layer (cassandra) and pushes it into an API for use by the frontend software. A dashboard application showcasing sections for order history, branch sales, product performance, and forecasted sales is built using angular 2 framework, in addition to several components, such as chart js, and angular material.

  
<p float="left" align="center">
  <img src="Extras/images/webpage-main.png" alt="webpage-main" width="750" height="350">
</p>
<p float="left" align="center">
  <img src="Extras/images/webpage-oh.png" alt="webpage-oh" width="750" height="350">
</p>
<p float="left" align="center">
  <img src="Extras/images/webpage-bs.png" alt="ebpage-bs" width="750" height="350">
</p>
<p float="left" align="center">
  <img src="Extras/images/webpage-pp.png" alt="webpage-pp" width="750" height="350">
</p>
<p float="left" align="center">
  <img src="Extras/images/webpage-fs.png" alt="webpage-fs" width="750" height="350">
</p>
  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

  
<!-- SS-Platform Components -->
## SS-Platform Components
The main tools, languages, and frameworks used in this project are:

`Languages`: Python, Scala, SQL, Javascript, Typescript, HTML, CSS.

`Tools`: MySQL, PostgreSQL, MongoDB, Apache Nifi, Apache Kafka, HDFS, Apache Hive, Apache Cassandra, Crontab, YARN, Zookeeper. 

`Frameworks`: Node.js, Angular 2, Apache Spark, Spark Structured Streaming, Spark MLlib, FastAPI.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

  
<!-- LICENSE -->
## License

Distributed under the Apache License 2.0. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
  
 
<!-- CONTACT -->
## Contact

Mohammad Almasri - [@linkedin](https://www.linkedin.com/in/mohammad-almasri-964867197/) - modaj18@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/MODAJ18/SS-Platform.svg?style=for-the-badge
[contributors-url]: https://github.com/MODAJ18/SS-Platform/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/MODAJ18/SS-Platform.svg?style=for-the-badge
[forks-url]: https://github.com/MODAJ18/SS-Platform/network/members
[stars-shield]: https://img.shields.io/github/stars/MODAJ18/SS-Platform.svg?style=for-the-badge
[stars-url]: https://github.com/MODAJ18/SS-Platform/stargazers
[issues-shield]: https://img.shields.io/github/issues/MODAJ18/SS-Platform.svg?style=for-the-badge
[issues-url]: https://github.com/MODAJ18/SS-Platform/issues
[license-shield]: https://img.shields.io/github/license/MODAJ18/SS-Platform.svg?style=for-the-badge
[license-url]: https://github.com/MODAJ18/SS-Platform/blob/master/License
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/mohammad-almasri-964867197/

