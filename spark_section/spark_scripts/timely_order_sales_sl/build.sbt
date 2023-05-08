
// The simplest possible sbt build file is just one line:

scalaVersion := "2.12.15"
name := "DE_Sales - ETL - Serving Layer - Timely Order Sales"
organization := "ch.epfl.scala"
version := "1.0"

// spark - for quickstart task  + structured streaming
libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.3.2"
libraryDependencies += "com.datastax.spark" %% "spark-cassandra-connector" % "3.3.0"
libraryDependencies += "com.datastax.cassandra" % "cassandra-driver-core" % "3.9.0"
