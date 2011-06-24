/*
 *  @author Philip Stutz
 *  
 *  Copyright 2010 University of Zurich
 *      
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *         http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

package signalcollect.implementations.coordinator

import signalcollect.implementations.messaging.AbstractMessageRecipient
import signalcollect.implementations.graph.DefaultGraphApi
import signalcollect.api.Factory
import signalcollect.interfaces._
import java.util.concurrent.ArrayBlockingQueue
import signalcollect.interfaces.ComputeGraph
import java.util.concurrent.BlockingQueue
import java.lang.management._
import com.sun.management.OperatingSystemMXBean
import signalcollect.api._

class AsynchronousCoordinator(workerApi: WorkerApi, config: Configuration)
  extends Coordinator(workerApi, config) with AsynchronousExecution

class SynchronousCoordinator(workerApi: WorkerApi, config: Configuration)
  extends Coordinator(workerApi, config) with SynchronousExecution

abstract class Coordinator(protected val workerApi: WorkerApi, config: Configuration) {

  protected var stepsLimit = Int.MaxValue

  def setStepsLimit(l: Int) {
    stepsLimit = l
  }

  def execute(parameters: ExecutionParameters): ExecutionInformation = {
    workerApi.signalSteps = 0
    workerApi.collectSteps = 0

    workerApi.setSignalThreshold(parameters.signalThreshold)
    workerApi.setCollectThreshold(parameters.collectThreshold)

    workerApi.logCoordinatorMessage("Waiting for graph loading to finish ...")

    val graphLoadingWait = workerApi.awaitIdle

    workerApi.logCoordinatorMessage("Starting computation ...")
    val jvmCpuStartTime = getJVMCpuTime
    val startTime = System.nanoTime

    /*******************************/
    performComputation
    /*******************************/

    val stopTime = System.nanoTime
    val jvmCpuStopTime = getJVMCpuTime
    val totalTime: Long = stopTime - startTime
    val totalJvmCpuTime: Long = jvmCpuStopTime - jvmCpuStartTime

    workerApi.logCoordinatorMessage("\t\t\tDONE")

    val workerStatistics = workerApi.getWorkerStatistics
    val aggregatedWorkerStatistics = workerStatistics.fold(WorkerStatistics())(_ + _)

    val executionStatistics = ExecutionStatistics(
      computationTimeInMilliseconds = (totalTime / 1000000.0).toLong,
      jvmCpuTimeInMilliseconds = (totalJvmCpuTime / 1000000.0).toLong,
      graphLoadingWaitInMilliseconds = (graphLoadingWait / 1000000.0).toLong)

    ExecutionInformation(
      config,
      parameters,
      executionStatistics,
      aggregatedWorkerStatistics,
      workerStatistics)
  }

  //case class ExecutionInformation(
  //  computeGraphConfiguration: Configuration,
  //  executionParameters: ExecutionParameters,
  //  executionStatistics: ExecutionStatistics,
  //  aggregatedWorkerStatistics: WorkerStatistics,
  //  individualWorkerStatistics: List[WorkerStatistics])
  //
  //case class ExecutionStatistics(
  //  computationTimeInMilliseconds: Long,
  //  jvmCpuTimeInMilliseconds: Long,
  //  graphLoadingWaitInMilliseconds: Long)
  //
  //case class ExecutionParameters(
  //  timeLimit: Long,
  //  stepsLimit: Long,
  //  signalThreshold: Double,
  //  collectThreshold: Double)
  //  }

  protected def performComputation

  def getJVMCpuTime = {
    val bean = ManagementFactory.getOperatingSystemMXBean
    if (!bean.isInstanceOf[OperatingSystemMXBean]) {
      0
    } else {
      (bean.asInstanceOf[OperatingSystemMXBean]).getProcessCpuTime
    }
  }
}