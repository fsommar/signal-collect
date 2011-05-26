/*
 *  @author Daniel Strebel
 *  
 *  Copyright 2011 University of Zurich
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

package signalcollect.implementations.storage

import org.specs2.mutable._
import org.junit.runner.RunWith
import org.specs2.runner.JUnitRunner
import org.specs2.matcher.Matcher
import org.specs2.mock.Mockito
import signalcollect.interfaces._
import signalcollect.implementations.messaging.DefaultMessageBus
import signalcollect.algorithms.Page
import java.io.File
import java.security.AccessController
import java.io.FilePermission
import java.lang.SecurityException

@RunWith(classOf[JUnitRunner])
class VertexStorageSpec extends SpecificationWithJUnit with Mockito {

  "InMemory Vertex Store" should {
    val defaultMessageBus = mock[DefaultMessageBus[Any, Any]]
    val vertexList = List(new Page(0, 1), new Page(1, 1), new Page(2, 1))
    val inMemoryStore = new DefaultStorage(defaultMessageBus)
    vertexList.foreach(v => inMemoryStore.vertices.put(v))

    "hold all vertices inserted" in {
      inMemoryStore.vertices.size must_== vertexList.size
    }

    "add all added vertices to the toSignal list" in {
      inMemoryStore.toSignal.size must_== vertexList.size
    }

    "add all added vertices to the toCollect list" in {
      inMemoryStore.toCollect.size must_== vertexList.size
    }

    "remove vertices from the store" in {
      val inMemoryStore = new DefaultStorage(defaultMessageBus)
      vertexList.foreach(v => inMemoryStore.vertices.put(v))
      inMemoryStore.vertices.remove(0)
      inMemoryStore.vertices.size must_== vertexList.size - 1
    }
  }

  "Berkeley DB Vertex Store" should {
    var canCreateFolder = true

    try {
      AccessController.checkPermission(new FilePermission("/tmp/*", "read,write"));
      // Has permission
    } catch {
      case e: SecurityException => canCreateFolder = false
    }
    if (canCreateFolder) {
      val defaultMessageBus = mock[DefaultMessageBus[Any, Any]]
      val vertexList = List(new Page(0, 1), new Page(1, 1), new Page(2, 1))
      class BerkeleyStorage(messageBus: MessageBus[Any, Any]) extends DefaultStorage(messageBus) with BerkDBJE
      val berkeleyStore = new BerkeleyStorage(defaultMessageBus)
      vertexList.foreach(v => berkeleyStore.vertices.put(v))

      "hold all vertices inserted" in {
        berkeleyStore.vertices.size must_== vertexList.size
      }

      "add all added vertices to the toSignal list" in {
        berkeleyStore.toSignal.size must_== vertexList.size
      }

      "add all added vertices to the toCollect list" in {
        berkeleyStore.toCollect.size must_== vertexList.size
      }

      "reflect changes on a vertex" in {
        val berkeleyStore = new BerkeleyStorage(defaultMessageBus)
        val vertex0 = new Page(0, 0)
        val state0 = vertex0.state
        berkeleyStore.vertices.put(vertex0)
        val vertex1 = berkeleyStore.vertices.get(0)
        val state1 = vertex1.state
        berkeleyStore.vertices.updateStateOfVertex(new Page(0, 1)) //simulates an update of the vertex since the id (1st parameter) remains unchanged.
        val state2 = berkeleyStore.vertices.get(0).state
        state0 must_== state1
        state1 must_!= state2
      }

      "remove vertices from the store" in {
        val berkeleyStore = new BerkeleyStorage(defaultMessageBus)
        vertexList.foreach(v => berkeleyStore.vertices.put(v))
        berkeleyStore.vertices.remove(0)
        berkeleyStore.vertices.size must_== vertexList.size - 1
      }

      "create a directory" in {
        val directoryPath = "/tmp/" + "testdir"
        trait BerkDBJE2 extends DefaultStorage {
          override protected def vertexStoreFactory = new BerkeleyDBStorage(this, directoryPath)
        }
        class BerkeleyStorage2(messageBus: MessageBus[Any, Any]) extends DefaultStorage(messageBus) with BerkDBJE2
        val berkeleyStore = new BerkeleyStorage2(defaultMessageBus) // This should create the folder with path directoryPath if not existent.
        directoryPath must beADirectoryPath
      }

      // Has permission
    } else {
      "fail gracefully because no write permissions for temp folder exist" in {
        1 === 1
      }
    }

  }
}