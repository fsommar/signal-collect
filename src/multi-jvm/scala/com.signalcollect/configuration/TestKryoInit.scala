package com.signalcollect.configuration

import com.esotericsoftware.kryo.Kryo

class TestKryoInit extends KryoInit {
  override def customize(kryo: Kryo): Unit = {
    kryo.setReferences(true)
    kryo.setCopyReferences(true)
    register(kryo)
  }
}

object TestKryo {
  val registrations: List[String] = {
    List(
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$com$signalcollect$ClusterIntegrationSpec$$anonfun$$test$1$1$$anonfun$apply$1$$anon$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$com$signalcollect$ClusterIntegrationSpec$$anonfun$$test$1$1$$anonfun$apply$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$com$signalcollect$ClusterIntegrationSpec$$anonfun$$test$1$1$$anonfun$apply$1$$anon$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$com$signalcollect$ClusterIntegrationSpec$$anonfun$$test$1$1$$anonfun$apply$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$com$signalcollect$ClusterIntegrationSpec$$anonfun$$test$1$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$com$signalcollect$ClusterIntegrationSpec$$anonfun$$test$1$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1$$anonfun$apply$mcV$sp$5$$anonfun$apply$mcV$sp$6$$anonfun$4",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1$$anonfun$apply$mcV$sp$5$$anonfun$apply$mcV$sp$6",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1$$anonfun$apply$mcV$sp$5",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1$$anonfun$apply$mcV$sp$5$$anonfun$apply$mcV$sp$6$$anonfun$4",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1$$anonfun$apply$mcV$sp$5$$anonfun$apply$mcV$sp$6",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1$$anonfun$apply$mcV$sp$5",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1$$anonfun$apply$mcV$sp$1",
      "com.signalcollect.ClusterIntegrationSpec$$anonfun$1",
      "com.signalcollect.ClusterIntegrationSpecMultiJvmNode1",
      "org.scalatest.concurrent.AbstractPatienceConfiguration$PatienceConfig$",
      "akka.remote.testconductor.RoleName",
      "org.scalatest.Matchers$AWord",
      "org.scalactic.Explicitly$TheAfterWord",
      "akka.remote.testkit.MultiNodeSpec$Replacement",
      "org.scalactic.Explicitly$TheAfterWord",
      "akka.remote.testkit.MultiNodeSpec$Replacement",
      "scala.concurrent.duration.Duration$$anon$1",
      "scala.concurrent.duration.Duration$$anon$1",
      "java.util.concurrent.LinkedBlockingDeque",
      "java.util.concurrent.LinkedBlockingDeque",
      "org.scalatest.Matchers$AnWord",
      "org.scalatest.Assertions$AssertionsHelper",
      "org.scalatest.words.BeWord",
      "org.scalatest.words.BehaveWord",
      "org.scalatest.words.CompileWord",
      "org.scalatest.Assertions$AssertionsHelper",
      "org.scalatest.words.ContainWord",
      "java.net.InetSocketAddress",
      "org.scalatest.words.BeWord",
      "org.scalactic.Explicitly$DecidedWord",
      "org.scalatest.words.BehaveWord",
      "org.scalatest.words.CompileWord",
      "org.scalatest.words.ContainWord",
      "java.net.InetSocketAddress",
      "org.scalactic.Explicitly$DecidedWord",
      "org.scalatest.words.DefinedWord",
      "akka.remote.testkit.MultiNodeSpec$$anonfun$$lessinit$greater$1",
      "org.scalatest.words.DefinedWord",
      "akka.remote.testkit.MultiNodeSpec$$anonfun$$lessinit$greater$1",
      "com.signalcollect.ClusterIntegrationConfig$",
      "org.scalactic.Explicitly$DeterminedWord",
      "org.scalatest.words.EmptyWord",
      "org.scalatest.words.EndWithWord",
      "com.signalcollect.ClusterIntegrationConfig$",
      "org.scalactic.Explicitly$DeterminedWord",
      "org.scalatest.words.EmptyWord",
      "org.scalatest.words.EndWithWord",
      "org.scalatest.words.ExistWord",
      "org.scalatest.words.ExistWord$$anon$2",
      "org.scalatest.words.FullyMatchWord",
      "org.scalatest.words.HaveWord",
      "org.scalatest.words.IncludeWord",
      "org.scalatest.WordSpecLike$ItWord",
      "org.scalatest.Matchers$KeyWord",
      "org.scalatest.words.ExistWord",
      "org.scalatest.words.ExistWord$$anon$2",
      "org.scalatest.words.FullyMatchWord",
      "akka.testkit.TestActor$NullMessage$",
      "org.scalatest.words.HaveWord",
      "org.scalatest.words.LengthWord",
      "org.scalatest.words.IncludeWord",
      "org.scalatest.WordSpecLike$ItWord",
      "org.scalatest.Matchers$KeyWord",
      "akka.event.BusLogging",
      "akka.testkit.TestActor$NullMessage$",
      "org.scalatest.words.LengthWord",
      "akka.event.BusLogging",
      "akka.event.EventStream",
      "akka.event.EventStream",
      "akka.util.ReentrantGuard",
      "akka.util.ReentrantGuard",
      "java.util.concurrent.locks.ReentrantLock$NonfairSync",
      "akka.cluster.ClusterEvent$SeenChanged",
      "akka.cluster.ClusterEvent$LeaderChanged",
      "akka.cluster.ClusterEvent$LeaderChanged",
      "akka.cluster.ClusterEvent$MemberEvent",
      "akka.cluster.ClusterEvent$MemberEvent",
      "akka.cluster.ClusterEvent$ReachabilityChanged",
      "akka.cluster.ClusterEvent$ClusterMetricsChanged",
      "akka.actor.DeadLetter",
      "akka.event.Logging$Warning",
      "akka.event.Logging$Error",
      "akka.remote.AssociatedEvent",
      "akka.event.Logging$Error",
      "akka.remote.AssociatedEvent",
      "akka.cluster.ClusterEvent$ClusterDomainEvent",
      "akka.remote.QuarantinedEvent",
      "akka.cluster.ClusterEvent$MemberUp",
      "akka.event.Logging$Debug",
      "akka.cluster.ClusterEvent$ReachabilityEvent",
      "akka.event.Logging$Debug",
      "akka.cluster.ClusterEvent$ReachabilityEvent",
      "akka.remote.RemotingListenEvent",
      "akka.util.SubclassifiedIndex",
      "akka.event.EventStream$$anon$1",
      "akka.util.SubclassifiedIndex$Nonroot",
      "org.scalatest.words.MatchPatternWord",
      "akka.actor.Address",
      "org.scalatest.words.NoExceptionWord",
      "org.scalatest.words.NotWord",
      "org.scalatest.words.NotWord$$anon$51",
      "org.scalatest.words.MatchPatternWord",
      "akka.actor.Address",
      "org.scalatest.words.NoExceptionWord",
      "org.scalatest.words.NotWord",
      "org.scalatest.words.NotWord$$anon$51",
      "org.scalatest.Engine",
      "org.scalatest.SuperEngine$Bundle$",
      "org.scalatest.SuperEngine$Trunk$",
      "org.scalatest.Engine",
      "org.scalatest.SuperEngine$Bundle$",
      "org.scalatest.SuperEngine$Trunk$",
      "org.scalatest.SuperEngine$DescriptionBranch",
      "org.scalatest.events.LineInFile",
      "org.scalatest.SuperEngine$TestLeaf",
      "org.scalatest.Transformer",
      "java.util.concurrent.atomic.AtomicReference",
      "org.scalatest.SuperEngine$Bundle",
      "org.scalatest.ConcurrentAlerter",
      "java.lang.Thread",
      "sun.misc.Launcher$AppClassLoader",
      "java.security.AccessControlContext",
      "java.security.AccessControlContext",
      "java.util.Vector",
      "org.scalatest.tools.Runner",
      "org.scalatest.tools.Runner$",
      "scala.Function1",
      "scala.MatchError",
      "scala.PartialFunction",
      "scala.collection.generic.HasNewBuilder",
      "scala.collection.generic.FilterMonadic",
      "scala.collection.GenTraversableOnce",
      "scala.collection.TraversableOnce",
      "scala.collection.Parallelizable",
      "scala.collection.GenTraversableLike",
      "scala.collection.TraversableLike",
      "scala.collection.generic.GenericTraversableTemplate",
      "scala.collection.GenTraversable",
      "scala.collection.Traversable",
      "scala.collection.GenIterableLike",
      "scala.collection.GenIterable",
      "scala.Equals",
      "scala.collection.Traversable",
      "scala.collection.GenIterableLike",
      "scala.collection.GenIterable",
      "scala.collection.IterableLike",
      "scala.Equals",
      "scala.collection.IterableLike",
      "scala.collection.Iterable",
      "scala.collection.Iterable",
      "scala.collection.GenSeqLike",
      "scala.collection.GenSeq",
      "scala.collection.SeqLike",
      "scala.collection.Seq",
      "scala.Function2",
      "scala.math.Ordered",
      "scala.Function2",
      "scala.math.Ordered",
      "org.scalatest.events.Event",
      "akka.remote.AssociationErrorEvent",
      "akka.event.Logging$Warning2",
      "scala.Product",
      "akka.cluster.InternalClusterAction$InitJoin$",
      "akka.cluster.InternalClusterAction$InitJoinAck",
      "akka.cluster.InternalClusterAction$Join",
      "akka.cluster.UniqueAddress",
      "akka.cluster.Gossip",
      "scala.collection.immutable.TreeSet",
      "akka.cluster.Member$$anon$1",
      "akka.cluster.Member",
      "akka.cluster.MemberStatus$Joining$",
      "akka.cluster.GossipOverview",
      "akka.cluster.Reachability",
      "akka.cluster.VectorClock",
      "scala.collection.immutable.TreeMap",
      "scala.math.Ordering$String$",
      "akka.cluster.ClusterHeartbeatSender$Heartbeat",
      "akka.cluster.ClusterHeartbeatSender$HeartbeatRsp",
      "akka.cluster.InternalClusterAction$Welcome",
      "akka.cluster.MetricsGossipEnvelope",
      "akka.cluster.GossipStatus",
      "akka.cluster.MetricsGossip",
      "akka.cluster.NodeMetrics",
      "akka.cluster.Metric",
      "akka.cluster.EWMA",
      "scala.Serializable",
      "org.scalatest.events.DiscoveryStarting",
      "org.scalactic.TripleEqualsSupport",
      "org.scalactic.TripleEquals",
      "org.scalatest.Assertions",
      "org.scalatest.AbstractSuite",
      "org.scalatest.Suite",
      "scala.Option",
      "org.scalatest.events.DiscoveryCompleted",
      "scala.Immutable",
      "scala.collection.immutable.Traversable",
      "scala.collection.immutable.Iterable",
      "scala.collection.immutable.Seq",
      "scala.collection.LinearSeqLike",
      "scala.collection.LinearSeq",
      "akka.cluster.MemberStatus$Up$",
      "akka.remote.DisassociatedEvent",
      "akka.event.Logging$Info",
      "scala.collection.immutable.LinearSeq",
      "scala.collection.LinearSeqOptimized",
      "scala.collection.AbstractTraversable",
      "scala.collection.generic.Clearable",
      "scala.collection.AbstractIterable",
      "scala.collection.AbstractSeq",
      "scala.collection.immutable.List",
      "org.scalatest.Reporter",
      "org.scalatest.events.RunAborted",
      "org.scalatest.events.RunStarting",
      "org.scalatest.time.Units",
      "org.scalatest.time.Millis$",
      "org.scalatest.ResourcefulReporter",
      "org.scalatest.CatchReporter",
      "org.scalatest.DistributedSuiteSorter",
      "org.scalatest.tools.SuiteSortingReporter",
      "org.scalatest.DispatchReporter",
      "org.scalatest.events.RunStopped",
      "org.scalatest.events.RunCompleted",
      "scala.collection.generic.Growable",
      "scala.collection.mutable.Builder",
      "scala.collection.generic.TraversableForwarder",
      "scala.collection.generic.IterableForwarder",
      "scala.collection.generic.SeqForwarder",
      "scala.Mutable",
      "scala.collection.mutable.Traversable",
      "scala.collection.mutable.Iterable",
      "scala.Cloneable",
      "scala.runtime.BoxedUnit",
      "scala.collection.mutable.Cloneable",
      "scala.collection.mutable.SeqLike",
      "scala.collection.mutable.Seq",
      "scala.collection.generic.Shrinkable",
      "scala.collection.script.Scriptable",
      "scala.collection.generic.Subtractable",
      "scala.collection.mutable.BufferLike",
      "scala.collection.mutable.Buffer",
      "scala.collection.mutable.AbstractSeq",
      "scala.collection.mutable.AbstractBuffer",
      "scala.collection.mutable.ListBuffer",
      "org.scalatest.time.Seconds$",
      "scala.runtime.AbstractFunction1",
      "org.scalatest.tools.Runner$$anonfun$2",
      "org.scalatest.tools.Runner$$anonfun$3",
      "org.scalatest.tools.Runner$$anonfun$4",
      "org.scalatest.tools.Runner$$anonfun$5",
      "org.scalatest.tools.Runner$$anonfun$6",
      "org.scalatest.tools.Runner$$anonfun$7",
      "org.scalatest.tools.Runner$$anonfun$8")
  }
}