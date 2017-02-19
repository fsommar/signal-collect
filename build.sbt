organization := "com.signalcollect"

name := "signal-collect"

version := "8.0.7-SNAPSHOT"

scalaVersion := "2.11.7"

scalacOptions ++= Seq(
  "-deprecation",
  "-encoding", "UTF-8",
  "-feature",
  "-target:jvm-1.8",
  "-unchecked"
)

libraryDependencies ++= Seq(
  "org.scala-lang" %  "scala-library" % "2.11.7",
  "com.typesafe.akka" %  "akka-cluster_2.11" % "2.4.1",
  "com.github.romix.akka" %  "akka-kryo-serialization_2.11" % "0.4.0",
  "net.ceedubs" %  "ficus_2.11" % "1.1.2",
  "org.json4s" %  "json4s-native_2.11" % "3.2.11",
  "org.java-websocket" %  "Java-WebSocket" % "1.3.0",
  "org.webjars" %  "d3js" % "3.5.6",
  "org.webjars" %  "jquery" % "2.1.4",
  "org.webjars" %  "reconnecting-websocket" % "1.0.0",
  "org.webjars" %  "intro.js" % "1.0.0",
  "junit" %  "junit" % "4.12",
  "org.scalatest" %  "scalatest_2.11" % "2.2.6",
  "com.typesafe.akka" %  "akka-testkit_2.11" % "2.4.1",
  "org.scalacheck" %  "scalacheck_2.11" % "1.12.5",
  "org.easymock" %  "easymock" % "3.4"
)

logLevel := Level.Info

cancelable in Global := true
