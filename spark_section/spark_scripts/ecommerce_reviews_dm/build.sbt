
// The simplest possible sbt build file is just one line:

scalaVersion := "2.12.15"
name := "DE_Sales - ETL - Data Mart - Ecommerce Reviews"
organization := "ch.epfl.scala"
version := "1.0"

// spark - for quickstart task  + structured streaming
libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.3.2"

