/*
 *  @author Carol Alexandru
 *  @author Silvan Troxler
 *  
 *  Copyright 2013 University of Zurich
 *      
 *  Licensed below the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *         http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed below the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations below the License.
 *  
 */

STR = {"addBySubstring": "Node ID should contain this string", //TODO put these in sub-object
       "pickVertex": "Enter full ID or select using mouse",
       "enterState": "Enter state",
       "noConditions": "No conditions specified",
       "noExecution": "The interactive execution mode is unavailable, retrying...",
       "State": {
         "non-interactive": [
           "Waiting for interactive exec...",
           "The interactive execution is either not enabled or currently unavailable"],
         "pausedBeforeChecksAfterCollect": [
           "Paused bef. checks after collect",
           "Paused - The next partial step triggers a break condition check"],
         "checksAfterCollect": [
           "Check cond. after collecting...",
           "Checking conditions before the next signal step..."],
         "pausedBeforeSignal": [
           "Paused before signalling",
           "Paused - The next partial step will perform the signalling step of the computation"],
         "signalling": [
           "Signalling...",
           "Performing the signalling step of the computation..."],
         "pausedBeforeChecksAfterSignal": [
           "Paused before checks after signal",
           "Paused - The next partial step triggers a break condition check"],
         "checksAfterSignal": [
           "Check cond. after signalling...",
           "Checking conditions before the next collect step..."],
         "pausedBeforeCollect": [
           "Paused before collecting",
           "Paused - The next partial step will perform the collecting step of the computation"],
         "collecting": [
           "Collecting...",
           "Performing the collecting step of the computation..."],
         "pausedBeforeGlobalChecks": [
           "Paused before global checks",
           "Paused - The next partial step triggers the global break condition check"],
         "globalChecks": [
           "Checking global conditions...",
           "Checking global termination conditions..."],
         "resetting": [
           "Resetting graph...",
           "Resetting the graph to its initial state"],
         "terminating": [
           "Terminating Signal/Collect...",
           "Terminating the Signal/Collect application"],
         "pausing": [
           "Pausing...",
           "Pausing the computation, waiting for tasks to finish"],
         "converged": [
           "Computation converged!",
           "The computation has converged. You may reset the graph to start over."]
       }
       
};

chartNames = {
    "messagesSent": "Messages Sent in Total (#)",
    "messagesSentToVertices": "Messages Sent to Vertices(#)",
    "messagesSentToWorkers": "Messages Sent to Workers (#)",
    "messagesSentToCoordinator": "Messages Sent to Coordinator (#)",
    "messagesSentToOthers": "Messages Sent to Others (#)",
    "messagesReceived": "Messages Received in Total (#)",
    "signalMessagesReceived": "Signal Messages Received (#)",
    "otherMessagesReceived": "Other Messages Received (#)",
    "requestMessagesReceived": "Request Messages Received (#)",
    "continueMessagesReceived": "Continue Messages Received (#)",
    "bulkSignalMessagesReceived": "Bulk Signal Messages Received (#)",
    "heartbeatMessagesReceived": "Heartbeat Messages Received (#)",
    "receiveTimeoutMessagesReceived": "Timeout Messages Received (#)",
    "outgoingEdgesAdded": "Outgoing Edges Added (#)",
    "outgoingEdgesRemoved": "Outgoing Edges Removed (#)",
    "numberOfOutgoingEdges": "Number of Outgoing Edges (#)",
    "verticesRemoved": "Vertices Removed (#)",
    "verticesAdded": "Vertices Added (#)",
    "numberOfVertices": "Number of Vertices (#)",
    "signalOperationsExecuted": "Signal Operations Executed (#)",
    "collectOperationsExecuted": "Collect Operations Executed (#)",
    "toCollectSize": "To Collect Size (#)",
    "toSignalSize": "To Signal Size (#)",
    "workerId": "Worker ID",
    "runtime_cores": "Available Processors (#)",
    "jmx_system_load": "System CPU Load (%)",
    "jmx_process_time": "Process CPU Time (NS)",
    "jmx_process_load": "Process CPU Load (%)",
    "jmx_swap_free": "Free Swap Space Size (B)",
    "jmx_swap_total": "Total Swap Space Size (B)",
    "jmx_mem_total": "Total Physical Memory Size (B)",
    "jmx_mem_free": "Free Physical Memory Size (B)",
    "jmx_committed_vms": "Committed Virtual Memory Size (B)",
    "runtime_mem_max": "Max Memory (B)",
    "runtime_mem_free": "Free Memory (B)",
    "runtime_mem_total": "Total Memory (B)",
};