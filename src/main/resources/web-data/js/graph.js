/*
 *  @author Carol Alexandru
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

/**
 * The default settings for the graph module.
 */
scc.defaults.graph = {"layout": {
                        "cVertexSelection": "show",
                        "cGraphDesign": "show",
                        "cGraphControl": "show",
                        "expositionWidth": "350"
                      },
                      "options": {
                        "gs_addBySubstring": "",
                        "gs_autoAddVicinities": "No",
                        "gs_topCriterium": "Highest degree",
                        "gd_vertexSize": "Vertex state",
                        "gd_vertexColor": "Outgoing degree",
                        "gd_vertexBorder": "Latest query",
                        "gp_vicinityIncoming": "Yes",
                        "gp_exposeVertices": "No",
                        "gp_vicinityRadius": "1",
                        "gp_maxVertexCount": "250",
                        "gp_targetCount": "100",
                        "gp_refreshRate": "1",
                        "gp_drawEdges": "When graph is still"
                      }
};

//TODO: always get options from settings, not HTML!
/**
 * The Graph module provides the graph-related menu panel and the graph
 * drawing itself.
 * @constructor
 */
scc.modules.Graph = function() {
  /**
   * Messages from the specified provider are routed to this module by the
   * main module.
   * @type {Array.<string>}
   */
  this.requires = ["graph", "configuration"];

  /**
   * If this is true, the graph will reload itself periodically. This is the
   * case when the computation is running.
   * @type {boolean}
   */
  this.autoRefresh = false;

  // Object-scope variables
  var s, svg, force;
  var color = d3.scale.category20();
  var colorCategories = d3.scale.ordinal()
    .domain(["n", "v"])
    .range(["#cc0000", "#00cc00"]);
  var scale = d3.scale.linear()
    .range([5, 25])
    .clamp(true);
  var vertices = [];
  var edges = [];
  var vertexRefs = {};
  var edgeRefs = {};
  var svgVertices;
  var svgEdges;
  var fadeTimer;
  var hideBackgroundTimeout;
  var vicinityAutoLoadDelay;
  var orderTemplate = {"provider": "graph"};
  var gradientDomain = [null,null];
  var zoomLevel = 1;
  var hoveringOverVertex = undefined;
  var mouseClickCoords = undefined;
  var selectedVertices;
  var pickAction;
  var vertexSequence = 0;
  var vertexSequenceEnd = 0;
  var GSTR = STR["Graph"];
  var vertexCountIntervals = []; 
  for (var i = 5; i<=25; i+=5) { vertexCountIntervals.push(i) };
  for (var i = 50; i<=250; i+=50) { vertexCountIntervals.push(i) };
  for (var i = 400; i<=1000; i+=100) { vertexCountIntervals.push(i) };
  var signalThreshold = 0.01;
  var collectThreshold = 0.0;
  var resizingExposition = false;
  var exposedVertexId = undefined;

  /**
   * The VertexStorageAgent provides method for setting, getting and adding to the
   * local storage which contains an array of vertexIds as strings. It represents
   * the vertices which the user has loaded into the canvas
   * @constructor
   */
  var VertexStorageAgent = function () {
    // Initialize the localStorage if necessary
    if (localStorage["vertexIds"] == undefined || localStorage["vertexIds"] == "") { 
      localStorage["vertexIds"] = "[]";
    }

    /**
     * Adds the given vertices to the local storage.
     * @param {array<string>} vertexIds - The vertices to be added to the storage
     */
    this.push = function (vertexIds) {
      var stored = this.get()
      $.each(stored, function (key, value) {
        if (vertexIds.indexOf(value) != -1) { vertexIds.splice(key, 1); }
      });
      stored.push.apply(stored, vertexIds)
      localStorage["vertexIds"] = JSON.stringify(stored);
    };

    /**
     * Replaces the existing list stored with the one passed to the funciton
     * @param {array<string>} vertexIds - The vertices to be stored
     */
    this.save = function () {
      localStorage["vertexIds"] = JSON.stringify(
        $.map(vertices, function (vertex, i) { return vertex.id; })
      );
    };

    /**
     * Loads the list of vertices from the local storage
     */
    this.get = function () {
      return JSON.parse(localStorage["vertexIds"]);
    };
  };
  // Instantiate an agent for us to use
  var vertexStorage = new VertexStorageAgent();

  /**
   * Clears and then populates the select box that allows the user to choose
   * the number of exceptional vertices with numbers ranging up to the
   * specified maximum.
   * @param {int} maximum - Maximum option to show
   */
  var populateTargetCountSelector = function (maximum) {
    var selector = $("#gp_targetCount");
    var currentChoice = selector.val()
    selector.empty();
    for (var i in  vertexCountIntervals) {
      if (vertexCountIntervals[i] > maximum) { break; }
      selector.append('<option value="' + vertexCountIntervals[i] + '">' + 
                      vertexCountIntervals[i] + '</option>');
    }
    // re-select the value selected before emptying or the maximum value
    if (currentChoice != null) {
      currentChoice = parseInt(currentChoice)
      if (currentChoice > maximum) { selector.val(maximum); }
      else if (currentChoice <= maximum) { selector.val(currentChoice); }
    }
  }

  /**
   * Returns a d3 scale that that maps the domain passed to the function
   * to a blue-to-red color scale
   * @param {array<double>} domain - A three-element array containing the
   *     lowest, median and highest values of the input domain
   * @return {object} - The d3 color scale for this input domain
   */
  var colorGradient = function (domain) {
    var scale = d3.scale.linear()
        .domain(domain)
        .range(["blue", "green", "red"]);
    return scale;
  };

  /**
   * Returns a d3 scale that that maps the domain passed to the function
   * to a green-to-red color scale
   * @param {array<double>} domain - A three-element array containing the
   *     lowest, median and highest values of the input domain
   * @return {object} - The d3 color scale for this input domain
   */
  var sizeGradient = function (domain) {
    var scale = d3.scale.linear()
        .domain(domain)
        .range([2, 5, 30]);
    return scale;
  };

  /**
   * An object containing the necessary transformation functions that can be
   * used to style the graph.
   */
  var vertexDesign = {
    // functions returning a color
    "gd_vertexColor":  {"Vertex state": function(d) { 
                            return colorGradient(gradientDomain)(d.state); },
                      "Vertex id": function(d) { 
                            return color(d.id); },
                      "Latest query": function(d) { 
                            return  d.seq > vertexSequenceEnd?"#00ff00":"#ff0000"; },
                      "All equal": function(d) { 
                            return "#17becf"; },
                      "Outgoing degree": function(d) { 
                            return colorGradient([1, 5, 50])(d.es); },
                      "Signal threshold": function(d) { 
                            return d.ss > signalThreshold?"#00ff00":"#ff0000"; },
                      "Collect threshold": function(d) { 
                            return d.cs > collectThreshold?"#00ff00":"#ff0000"; }
    },
    "gd_vertexBorder": {"Vertex state": function(d) { 
                            return colorGradient(gradientDomain)(d.state); },
                      "Vertex id": function(d) { 
                            return color(d.id); },
                      "Outgoing degree": function(d) { 
                            return colorGradient([1, 5, 50])(d.es); },
                      "Signal threshold": function(d) { 
                            return d.ss > signalThreshold?"#00ff00":"#ff0000"; },
                      "Collect threshold": function(d) { 
                            return d.cs > collectThreshold?"#00ff00":"#ff0000"; },
                      "All equal": function(d) { 
                            return "#9edae5"; },
                      "Latest query": function(d) { 
                            return d.seq > vertexSequenceEnd?"#00ff00":"#ff0000"; }
    },
    // functions returning a radius
    "gd_vertexSize": { "Vertex state": function(d) { 
                            return sizeGradient(gradientDomain)(d.state.replace(/[^0-9.,]/g, '')); },
                       "All equal": function(d) { 
                            return 5; }
    }
  };

  /**
   * Set the color of vertices in the graph. Providing a string, all vertices will
   * have the same color. If a function is provided, it will be run for each
   * vertex individually, resulting in different colors for different vertices.
   * @param {string|function} s - The color or a function returning a color
   */
  var setVertexColor = function (s) {
    vertexColor = s;
    svgVertices.transition().style("fill", s);
  };
  /**
   * The default vertex color
   */
  var vertexColor = vertexDesign["gd_vertexColor"]["Vertex state"];
  
  /**
   * Set the color of vertex borders (outlines) in the graph.
   * @see setVertexColor
   * @param {string|function} s - The color or a function returning a color
   */
  var setVertexBorder = function (s) {
    vertexBorder = s;
    svgVertices.transition().style("stroke", s);
  };
  /**
   * The default vertex border color
   */
  var vertexBorder = vertexDesign["gd_vertexBorder"]["Vertex id"];

  /**
   * Set the radius of vertices in the graph.
   * @see setVertexColor
   * @param {int|function} s - The radius or a function returning a radius
   */
  var setVertexSize = function (s) {
    vertexSize = s;
    svgVertices.transition().attr("r", s);
  };
  /**
   * The default vertex radius
   */
  var vertexSize = vertexDesign["gd_vertexSize"]["Vertex state"];

  /**
   * Wrapper function to do things that allways come with a graph order
   */
  var order = function (order, delay) {
    if (!delay) { delay = 0; }
    order["exposeVertices"] = (scc.settings.get().graph.options["gp_exposeVertices"] == "Yes")
    scc.order(order, delay)
  };

  /**
   * Order graph data using the options set in the GUI. This function may be
   * called by other modules as well, in case they require a graph refresh.
   */
  this.update = function(delay) {
    if (vertexStorage.get().length > 0) {
      order({"provider": "graph",
             "query": "vertexIds",
             "vertexIds": vertexStorage.get()
      }, delay);
    }
  };

  /**
   * Take a json document and transform it into a tree compatible with d3's
   * tree layout (with name and children attributes).
   * @param {object} json to transform
   * @return {object} tree for d3's tree layout
   */
  var jsonIntoTree = function (json) {
    if(typeof json == "object") {
      var arr = []
      $.each(json, function(k,v) {
        var child = jsonIntoTree(v)
        if (Object.prototype.toString.call(child) === '[object Array]') {
          arr.push({"name": k, "children": child});
        }
        else {
          arr.push({"name": k, "val": child});
        }
      });
      return arr;
    }
    else {
      return json;
    }
  };

  /**
   * Loads the information into the exposition panel using the provided id and
   * json data.
   * @param {string} id the id of the vertex
   * @param {object} id the arbitrary json data to display
   */
  var expose = function (id, json) {
    // Transform the json into a tree for d3's tree layout
    var tree = { "name": "root", "children": jsonIntoTree(json)}

    // Clicking on the Id shall load the node
    $("#exposition_title").html(
        '<span class="ttop">Information exposed by vertex with ID:</span><br/>' + 
        '<span class="tid">' + id + '</span>')
    $(".tid").click(function () {
      scc.consumers.Graph.addBySubstring($(this).text());
    });

    // Create the layout and popluate it
    var treeLayout = d3.layout.tree();
    treeLayout.value(function(d) { return d.name; });

    var expo = d3.select("#exposition_data")
    expo.data([tree]);
    expo.data([tree]);
    var t = expo.selectAll("div")
        .data(treeLayout.nodes);
    
    t.enter().append("div")
      .attr("class", function (d) {
        if (d.depth == 0) {
          return "hidden";
        }
        if (d.children != undefined) {
          return "tobject_key";
        }
        return "tvalue_container";
      })
      .style("margin-left", function(d) {
        return (10*(d.depth-1)) + "px";
      })
    t.exit().remove();
    t.html(function (d) {
      var s = d.name;
      s = '<span class="tvalue_key">' + s + '</span>';
      if (d.val == undefined) { 
        s = s + ": ";
      }
      else { 
        s = s + '<br/><span class="tvalue">' + d.val + '</span>';
      }
      return s;
    })
  }

  /**
   * Handler for when the user presses the mouse when resizing the exposition panel
   * @param {Event} e - The event that triggered the call
   */
  d3.select('#dragbar').on("mousedown.resizeExposition", function () {
    d3.event.preventDefault();
    resizingExposition = true;
    var main = $('#exposition');
    var ghostbar = $('<div>', {id:'ghostbar',
                               css: { height: main.outerHeight(),
                                      top: main.offset().top,
                                      left: main.offset().left
                    }}).appendTo('body');
    d3.select(document).on("mousemove.resizeExposition", function () {
      d3.event.preventDefault();
      ghostbar.css("left", d3.event.x);
    });
  });
      
  /**
   * Handler for when the user releases the mouse when resizing the exposition panel
   * @param {Event} e - The event that triggered the call
   */
  d3.select(document).on("mouseup.resizeExposition", function () {
    d3.event.preventDefault();
    if (resizingExposition) {
      var newWidth = screen.width-d3.event.x;
      scc.settings.set({"graph":{"layout": {"expositionWidth": newWidth}}});
      $('#exposition').css("width", newWidth);
      $('#graph_canvas').css("right", newWidth);
      $('#ghostbar').remove();
      d3.select(document).on("mousemove.resizeExposition", null);
      resizingExposition = false;
    }
  });

  /**
   * Modify the panel html, setting options and adding dynamic fields
   */
  this.layout = function() {
    for (var i = 0; i<=4; i++) {
      $("#gp_vicinityRadius").append('<option value="' + i + '">' + i + '</option>');
    }
    for (var i = 1; i<=10; i+=1) {
      $("#gp_refreshRate").append('<option value="' + i + '">' + i + '</option>');
    }
    for (var i = 15; i<=60; i+=5) {
      $("#gp_refreshRate").append('<option value="' + i + '">' + i + '</option>');
    }
    for (var i in vertexCountIntervals) {
      $("#gp_maxVertexCount").append('<option value="' + vertexCountIntervals[i] + '">' + 
                                     vertexCountIntervals[i] + '</option>');
    }
    populateTargetCountSelector(vertexCountIntervals[vertexCountIntervals.length-1]);
    $('input[type="text"]').click(function(e) { $(this).select(); });
    $('#gs_addBySubstring').keypress(function(e) {
      if ( e.which == 13 ) { 
        e.preventDefault();
        $("#gs_addBySubstringAdd").addClass("active")
        setTimeout(function () { $("#gs_addBySubstringAdd").removeClass("active"); }, 100);
        scc.consumers.Graph.addBySubstring($("#gs_addBySubstring").val());
      }
    });
    $.each(scc.settings.get().graph.layout, function (key, value) {
      if (value == "show") { $("#" + key).show(); }
    });
    $.each(scc.settings.get().graph.options, function (key, value) {
      $("#" + key).val(value);
    });
    if (scc.settings.get().graph.options["gp_exposeVertices"] == "Yes") {
      $('#exposition').css("width", scc.settings.get().graph.layout.expositionWidth);
      exposedVertexId = localStorage["exposedVertexId"];
      $("#exposition").fadeIn(100, function () {
        $('#graph_canvas').css("right", $("#exposition").width());
      });
    }
    $("#exposition_background").text(GSTR.expositionEmpty);
    var val = parseInt($("#gp_maxVertexCount").val());
    populateTargetCountSelector(val);
  }
  this.layout();

  /**
   * Function that is called by the main module when a new WebSocket connection
   * is established. Create the SVG element and prepare the graph drawing
   * functionality.
   * @param {Event} e - The event that triggered the call
   */
  this.onopen = function(e) {
    $("#graph_background").text("Loading...");

    // Add an SVG element to the canvas and enable the d3 zoom functionality
    svg = d3.select("#graph_canvas").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.behavior.zoom().on("zoom", function () {
          if (zoomLevel == d3.event.scale) {
            svg.attr("transform",
                     "translate(" + d3.event.translate + ")" + 
                     " scale(" + zoomLevel + ")")
          }
          else {
            zoomLevel = d3.event.scale;
            svg.transition().duration(200).attr("transform",
                     "translate(" + d3.event.translate + ")" + 
                     " scale(" + zoomLevel + ")")
          }
        })).append("svg:g");
    // Disable double-click zooming, because we need double clicks to expand
    // the vicinity of a vertex. Zooming remains possible using the mouse wheel.
    d3.select("#graph_canvas > svg").on("dblclick.zoom", null);

    // When double clicking a vertex, load the vicinity of the vertex
    d3.select("#graph").on("dblclick", function (e) {
      if (d3.event.target.tagName == "circle") {
        var target = d3.event.target;
        var data = target.__data__;
        order({"provider": "graph",
               "query": "vertexIds",
               "vertexIds": [data.id],
               "vicinityIncoming": ($("#gp_vicinityIncoming").val() == "Yes"),
               "vicinityRadius": parseInt($("#gp_vicinityRadius").val()) 
        });
      }
    });

    /**
     * Fill the tooltip with information from a data object
     * @param {object} data - The data to use.
     */
    var fillTooltip = function (data) {
        $("#vertex_id").text(data.id);
        $("#vertex_state").text(data.state);
        $("#vertex_ss").text(data.ss);
        $("#vertex_cs").text(data.cs);
    };

    /**
     * Handler for when the user clicks on a node to load its exposed
     * information.
     * @param {Event} e - The event that triggered the call
     */
    d3.select("#graph").on("click.exposeVertex", function (e) {
      if ($("#exposition").is(":visible")) {
        var target = d3.event.target;
        var data = target.__data__;
        if (target.tagName == "circle") {
          exposedVertexId = data.id;
          localStorage["exposedVertexId"] = exposedVertexId;
          $("#exposition_background").text("");
          expose(data.id, data.info);
        }
      }
    });

    /**
     * Handler for when the user hovers over the graph. Shows a tooltip when
     * hovering over a vertex.
     * @param {Event} e - The event that triggered the call
     */
    d3.select("#graph").on("mousemove", function (e) {
      var coords = d3.mouse(this);
      var target = d3.event.target;
      var data = target.__data__;
      var vertex = $(target);
      var drawEdges = scc.settings.get().graph.options["gp_drawEdges"];
      var tooltip = $("#graph_tooltip");

      // When over a vertex, show the tooltip, highlight its edges and hide all
      // other edges in the graph
      if (target.tagName == "circle") {
        $("#graph_tooltip").css({"left": coords[0]+5 + "px", "top": coords[1]+5 + "px"});
        hoveringOverVertex = data.id; 
        fillTooltip(data);
        clearTimeout(fadeTimer);
        tooltip.fadeIn(200);
        svgEdges.attr("class", function(o) {
          if (o.source.id === data.id) { return "edge outgoing"; }
          if (o.target.id === data.id) { return "edge"; }
          return "edge hiddenOpacity";
        });
        if (scc.settings.get().graph.options["gs_autoAddVicinities"] == "Yes") {
          clearTimeout(vicinityAutoLoadDelay);
          var target = d3.event.target;
          var data = target.__data__;
          vicinityAutoLoadDelay = setTimeout(function () {
            order({"provider": "graph",
                   "query": "vertexIds",
                   "vertexIds": [data.id],
                   "vicinityIncoming": ($("#gp_vicinityIncoming").val() == "Yes"),
                   "vicinityRadius": parseInt($("#gp_vicinityRadius").val()) 
            });
          }, 150);
        }
      }
      // Otherwise, clear the tooltip and set a timeout to hide it soon
      else {
        hoveringOverVertex = undefined; 
        tooltip.css({"left": coords[0]+5 + "px", "top": coords[1]+5 + "px"});
        fillTooltip({"id": "-", "state": "-", "ss": "-", "cs": "-"});
        clearTimeout(fadeTimer);
        clearTimeout(vicinityAutoLoadDelay);
        fadeTimer = setTimeout(function() {
          tooltip.fadeOut(200);
        }, 500);
        if (drawEdges == "Only on hover") {
          svgEdges.attr("class", "edge hiddenOpacity");
        }
        else {
          svgEdges.attr("class", "edge");
        }
      }
    });

    // Enable d3's forced directed graph layout
    force = d3.layout.force()
        .size([$("#graph_canvas").width(), $("#graph_canvas").height()])
        .nodes(vertices)
        .links(edges)
        .linkDistance(150)
        .charge(-100);
    
    svgEdges = svg.append('svg:g').selectAll(".edge");
    svgVertices = svg.append('svg:g').selectAll(".vertex");

    // apply graph design options from the settings
    $.each(scc.settings.get().graph.options, function (key, value) {
      scc.consumers.Graph.setGraphDesign(key, value);
    });

    /**
     * Handler on d3's force layout. This handler may be called several times
     * per second and as such causes the fluid animation to occur. On each 
     * 'tick', the vertex positions need to be updated.
     * @param {Event} e - The event that triggered the call
     */
    failed = false;
    force.on("tick", function(e) {
      // The user may choose if the graph edges should be drawn always, never,
      // or only when the graph is moving only very little or not at all. The
      // amount of movement is expressed by d3 through the .alpha() property.
      
      // Update the vertex and edge positions
      if (failed) { return; }
      svgVertices
          .attr("cx", function(d) { if (isNaN(d.x)) { failed = true; return 1; }; return d.x; })
          .attr("cy", function(d) { if (isNaN(d.y)) { failed = true; return 1; };  return d.y; });
      svgEdges
          .attr("x1", function(d) { if (isNaN(d.source.x)) { failed = true; return 1; };  return d.source.x; })
          .attr("y1", function(d) { if (isNaN(d.source.y)) { failed = true; return 1; };  return d.source.y; })
          .attr("x2", function(d) { if (isNaN(d.target.x)) { failed = true; return 1; };  return d.target.x; })
          .attr("y2", function(d) { if (isNaN(d.target.y)) { failed = true; return 1; };  return d.target.y; });

      if (failed) { return; }
      // Add classes to edges depending on options and user interaction
      var drawEdges = scc.settings.get().graph.options["gp_drawEdges"];
      svgEdges.attr("class", function(o) {
        // If the user is hovering over a vertex, only draw edges of that vertex
        if (hoveringOverVertex) {
          if (o.source.id === hoveringOverVertex) { return "edge outgoing"; }
          if (o.target.id === hoveringOverVertex) { return "edge"; }
          return "edge hiddenOpacity";
        }
        // Else draw vertices depending on the drawEdges setting
        else {
          if (drawEdges == "Always" || 
             (drawEdges == "When graph is still" && 
             force.alpha() < 0.05)) { return "edge"; }
          else { return "edge hiddenOpacity"; }
        }
      });
    });

    // enable the forced layout
    restart(true);
  }

  /**
   * Update the visual graph representation.
   * @param {boolean} graphChanged - Were vertices/edges added or removed?
   */
  var restart = function (graphChanged) {

    // Update the edge data
    svgEdges = svgEdges.data(edges, function(d) { return d.id; });
    svgEdges.enter().append("svg:line")
        .attr("class", "edge hiddenOpacity");
    svgEdges.exit().remove();

    // update the vertex data
    svgVertices = svgVertices.data(vertices, function(d) { return d.id; })
    svgVertices.enter().append("circle")
        .attr("class", "vertex")
        .call(force.drag)
        .on("mousedown.drag", null); // prevent grabbing of vertices
    svgVertices.exit()
      .style("opacity", 1)
      .transition()
      .duration(100)
      .style("opacity", 0)
      .remove();
    svgVertices
      .style("fill", vertexColor)
      .style("stroke", vertexBorder)
      .transition()
      .duration(100)
      .attr("r", vertexSize);

    // TODO: show correct message if graph empty
    if (vertices.length == 0) {
      clearTimeout(hideBackgroundTimeout);
      $("#graph_background").text(GSTR["canvasEmpty"]);
    }
    $("#graph_background").text("Showing " + vertices.length + " vertices");

    // Restart the forced layout if necessary
    xValues = []
    $.each(vertices, function (key, v) {
      xValues.push(v.x)
    });
    force.start();
  };
  
  /**
   * Calculate which are the 'oldest' vertices in the sequence that do not
   * fit onto the canvas given current vertex count limitations.
   * @return {array<object>} the vertices that can be removed
   */
  var getOverflowingVertices = function () {
    var verticesToRemove = [];
    var maxVertexCount = parseInt(scc.settings.get().graph.options["gp_maxVertexCount"]);
    var vertexOverflow = maxVertexCount - vertices.length;
    if (vertexOverflow < 0) {
      var highestSeqToKeep = vertexSequence - maxVertexCount + 1;
      verticesToRemove = $("circle").filter(function (i) {
        if (this.__data__.seq < highestSeqToKeep) { return true; }
      });
    }
    return verticesToRemove;
  }

  /**
   * Function that is called by the main module when a message is received
   * from the WebSocket. Reads the graph data received and updates the graph
   * accordingly.
   * @param {object} j - The message object received from the server
   */
  this.onmessage = function(j) {
    if (j.provider == "configuration") {
      if (j.executionConfiguration != "unknown") {
        signalThreshold = j.executionConfiguration.signalThreshold
        collectThreshold = j.executionConfiguration.collectThreshold
      }
    }
    // Keep references to the forced layout data
    var newVertices = false;

    // If the server sent an empty graph, do nothing
    if (j.vertices == undefined) { 
      $("#graph_background").text("There are no vertices matching your request");
      hideBackgroundTimeout = setTimeout(function () {
        if (vertices.length == 0) {
          $("#graph_background").text(GSTR["canvasEmpty"]);
        }
      }, 2000);
      return; 
    }

    // The server sends us two maps, one for vertices and one for edges. In both,
    // the vertices are identifies using strings. For example, given the following
    // vertex map...
    //
    // {"1111":{ <vertex properties> },
    //  "2222":{ <vertex properties> },
    //  "3333":{ <vertex properties> }}
    //
    // and the following edge map...
    //
    // {"1111":["2222","3333"],
    //  "2222":["3333"]}
    //
    // we'd had received a graph that looks like a triangle. 
    // 
    // d3 needs a different representation for the graph. It keeps a list of
    // vertices, not a map, and as such every vertex is only identifiable by its 
    // index in the list. This is not sufficient for our purpose, since we
    // want to be able to update existing vertices without having to redraw the 
    // whole graph but we have no way of mapping the actual vertex id to the 
    // index used by d3. For this reason, we keep a lookup table, 'vertexRefs',
    // which keeps the (vertexId -> index) mapping. The same thing happens for
    // the edges. For example given the graph above, the resulting maps could be:
    //
    // vertexRefs["1111"] = 0
    // vertexRefs["2222"] = 1
    // vertexRefs["3333"] = 2
    // edgeRefs["1111-2222"] = 0
    // edgeRefs["1111-3333"] = 1
    // edgeRefs["2222-3333"] = 3
    //
    // This way, we can later update vertex states, for exmaple by re-assigning
    // to vertices[vertexRefs["1111"]], thereby updating the correct vertex in d3's
    // vertex array.

    // If there's a vertex limit, then check if we need to remove some vertices
    // before there's enough space for the new ones

    var maxVertexCount = parseInt(scc.settings.get().graph.options["gp_maxVertexCount"]);

    vertexSequenceEnd = vertexSequence;
    var newVertexCount = 0;
    var tooManyVertices = 0;

    $.each(j.vertices, function(id, data) {
      newVertexCount += 1;
      // If there are more vertices in the data than we're allowed to draw,
      // then remove the remaining elements from the vertexRefs if necessary
      if (newVertexCount > maxVertexCount) { 
        vertexRefs[id] = undefined;
        tooManyVertices += 1;
        return;
      }
      vertexSequence += 1;
      if (vertexRefs[id] == undefined) {
        // The vertex hasn't existed yet. Update d3's vertex array
        vertices.push({"id": id, "state": data.s, "seq": vertexSequence, 
                       "es": data.es, "ss": data.ss, "cs": data.cs,
                       "info": data.exposition});
        // Store the index of the vertex in the lookup table
        vertexRefs[id] = vertices.length - 1;
        newVertices = true;
      }
      else {
        // Look up the vertex with this id in d3's vertex array and update it
        vertices[vertexRefs[id]].state = data.s;
        vertices[vertexRefs[id]].seq = vertexSequence;
        vertices[vertexRefs[id]].ss = data.ss;
        vertices[vertexRefs[id]].cs = data.cs;
        vertices[vertexRefs[id]].info = data.exposition;
      }
    });
    var verticesToRemove = getOverflowingVertices()
    vertexStorage.save();


    // Determine maximum and minimum state to determine color gradient
    gradientDomain = [parseFloat(j.lowestState),
                      d3.median(vertices, function (d) { return parseFloat(d.state) }),
                      parseFloat(j.highestState)]

    if (j.edges) {
      $.each(j.edges, function (source, targets) {
        for (var t = 0; t < targets.length; t++) {
          edgeId = source + "-" + targets[t];
          if (edgeRefs[edgeId] == undefined) {
            // The edge hasn't existed yet. Update d3's edge array
            if (vertexRefs[source] != undefined && 
                vertexRefs[targets[t]] != undefined) {
              edges.push({"id": edgeId,
                          "source": vertices[vertexRefs[source]], 
                          "target": vertices[vertexRefs[targets[t]]]});
              // Store the index of the edge in the lookup table
              edgeRefs[edgeId] = edges.length - 1;
            }
          }
          else {
            // One could update d3's edge array here, like with the vertices
          }
        }
      });
    }
    
    if (verticesToRemove.length != 0) {
      removeVerticesFromCanvas(verticesToRemove);
    }
    else {
      restart(newVertices);    
    }

    if (tooManyVertices > 0) {
      $("#graph_background").stop().text(
          "The query yields " + (tooManyVertices + vertices.length) + " vertices. Only the first " +
          maxVertexCount  + " are being displayed.");
      hideBackgroundTimeout = setTimeout(function () {
        $("#graph_background").text("Showing " + vertices.length + " vertices");
      }, 4000);
    }

    // Update exposed vertex
    if (typeof exposedVertexId == "string") {
      var exposedVertex = svgVertices.filter(function (d, i) {
        return d.id == exposedVertexId;
      })[0][0];
      if (exposedVertex != undefined) {
        var data = exposedVertex.__data__;
        $("#exposition_background").text("");
        expose(data.id, data.info);
      }
    }

    // Order new graph if autorefresh is enabled
    if (scc.consumers.Graph.autoRefresh) {
      scc.consumers.Graph.update(parseInt($("#gp_refreshRate").val())*1000);
    }

  }

  /**
   * Function that is called by the main module when a WebSocket error is
   * encountered. Does nothing.
   * @param {Event} e - The event that triggered the call
   */
  this.onerror = function(e) { };

  /**
   * Function that is called by the main module when a requested piece of data
   * is not (yet) available from the server. Show a message on the graph canvas
   */
  this.notready = function() {
    $("#graph_background").text("Data Provider not ready, retrying...");
  };

  /**
   * Function that is called by the main module when a new WebSocket connection
   * breaks down. 
   * @param {Event} e - The event that triggered the call
   */
  this.onclose = function(e) {
    this.destroy();
    $("#graph_background").text("Connection lost");
  };

  /**
   * Clear graph canvas and then re-initialize graph (calling onopen).
   */
  this.reset = function() {
    this.destroy();
    scc.consumers.Graph.onopen();
  };

  /**
   * Clear graph canvas and cancel all pending orders. Clear data variables.
   */
  this.destroy = function() {
    scc.resetOrders("graph");
    $("#graph_canvas").empty();
    vertices = [];
    edges = [];
    vertexRefs = {};
    edgeRefs = {};
  };


  /**
   * Take two coordinates and use them as opposite corner of a rectangle.
   * Calculate the position and size of the resulting rectangle.
   * @param {array<int>} cornerA - The [x,y] position of the first corner
   * @param {array<int>} cornerB - The [x,y] position of the second corner
   * @return {array<int>} dimensions - The [x, y, w, h] dimensions
   */
  var cornersToDimensions = function (cornerA, cornerB) {
    var left = Math.min(cornerA[0],cornerB[0]);
    var top = Math.min(cornerA[1],cornerB[1]);
    var width = Math.max(cornerA[0],cornerB[0]) - left;
    var height = Math.max(cornerA[1],cornerB[1]) - top;
    return [left, top, width, height];
  };

  /**
   * d3 handler that initiates a selection using the mouse to draw a rectangle.
   */
  d3.select("#graph_canvas_overlay").on("mousedown.selectVertices", function (e) {
    // Store the positions of where the mouse button was pressed
    mouseClickCoords = d3.mouse(this);
    // Place the selection rectangle at the right spot and show it
    $("#graph_canvas_selection").css({"height": 0, "width": 0});
    $("#graph_canvas_selection").show();
  });

  /**
   * d3 handler that adjusts the selection rectangle when moving the mouse
   */
  d3.select("#graph_canvas_overlay").on("mousemove.selectVertices", function (e) {
    if (mouseClickCoords) {
      // update the width
      var coords = d3.mouse(this);
      var dimensions = cornersToDimensions(coords, mouseClickCoords);
      $("#graph_canvas_selection").css({"left": dimensions[0], 
                                        "top": dimensions[1],
                                        "width": dimensions[2], 
                                        "height": dimensions[3]
      });
    }
  });

  /**
   * d3 handler that finally calculates which vertices fall into the selection
   * and then adjusts the panel buttons depending on the action that follows
   * this selection.
   */
  d3.select("#graph_canvas_overlay").on("mouseup.selectVertices", function (e) {
    // Filter vertices to find the ones inside the selection rectangle
    var coords = d3.mouse(this);
    selectedVertices = $("circle").filter(function (i) {
      var boundingRect = this.getBoundingClientRect()
      if (boundingRect.left-301 > Math.min(coords[0], mouseClickCoords[0]) && 
          boundingRect.bottom > Math.min(coords[1], mouseClickCoords[1]) &&
          boundingRect.right-301 < Math.max(coords[0], mouseClickCoords[0]) && 
          boundingRect.bottom < Math.max(coords[1], mouseClickCoords[1])) { 
        return true;
      }
      return false;
    });

    // Highlight the selected vertices
    selectedVertices.css({"fill": "#00ff00", "stroke": "#fff"});

    // Modify the panel buttons depending on the current action
    switch (pickAction) {
      case "remove":
        $("#gd_removeBySelect").addClass("snd");
        $("#gd_removeBySelectRemove").removeClass("hidden");
        break;
      case "addVicinities":
        $("#gs_addVicinitiesBySelect").addClass("snd");
        $("#gs_addVicinitiesBySelectAdd").removeClass("hidden");
        break;
    }

    // Hide the selection rectangle and overlay
    $("#graph_canvas_selection").hide();
    $("#graph_canvas_overlay").fadeOut(100);
    $("#graph_canvas_overlay").removeClass("pickingVertices");
  });

  /**
   * Function used as handler for selecting vertices whose vicinities shall be 
   * loaded.
   */
  var processSelection = function (e, action, primaryButton, confirmButton) { 
    e.preventDefault();
    // restore styling on all vertices
    svgVertices.style("fill", vertexColor)
               .style("stroke", vertexBorder);
    selectedVertices = undefined;
    $("button").attr("disabled", false);
    primaryButton.removeClass("active");
    pickAction = action;
    // modify panel buttons
    if (primaryButton.text() == "Cancel") {
      primaryButton.text("Selected vertices");
      primaryButton.removeClass("snd");
      confirmButton.addClass("hidden");
      $("#graph_canvas_selection").hide();
      $("#graph_canvas_overlay").fadeOut(100);
      $("#graph_canvas_overlay").removeClass("pickingVertices");
    }
    else {
      $("button").removeClass("snd");
      primaryButton.text("Cancel");
      primaryButton.addClass("active");
      confirmButton.addClass("hidden");
      $("#graph_canvas_overlay").addClass("pickingVertices");
      $("#graph_canvas_overlay").fadeIn(100);
      $("button:not(.active)").attr("disabled", true);
    }
  };

  /**
   * Bind the function to the vertex selection buttons
   */
  $("#gs_addVicinitiesBySelect").click(function (e) {
    processSelection(e, "addVicinities", $("#gs_addVicinitiesBySelect"), 
                     $("#gs_addVicinitiesBySelectAdd"));
  });
  $("#gd_removeBySelect").click(function (e) {
    processSelection(e, "remove", $("#gd_removeBySelect"), 
                     $("#gd_removeBySelectRemove"));
  });

  /**
   * Function used as handler for finally executing the action 
   */
  var executeAction = function (e, primaryButton, confirmButton, callback) {
    e.preventDefault();
    $("button").attr("disabled", false);
    primaryButton.text("Selected vertices");
    primaryButton.removeClass("snd");
    primaryButton.removeClass("active");
    confirmButton.addClass("hidden");
    callback();
  }

  /**
   * Bind the function to the vertex selection buttons
   */
  $("#gs_addVicinitiesBySelectAdd").click(function (e) { 
    executeAction(e, $("#gs_addVicinitiesBySelect"), 
                     $("#gs_addVicinitiesBySelectAdd"), function () {
      // extract list of Ids from vertex list and order data
      var selectedVertexIds = $.map(selectedVertices, function (vertex, key) { 
        return vertex.__data__.id;
      });
      order({"provider": "graph",
             "query": "vertexIds",
             "vertexIds": selectedVertexIds,
             "vicinityIncoming": ($("#gp_vicinityIncoming").val() == "Yes"),
             "vicinityRadius": parseInt($("#gp_vicinityRadius").val()) 
      });
    });
  });

  $("#gd_removeBySelectRemove").click(function (e) { 
    executeAction(e, $("#gd_removeBySelect"), 
                     $("#gd_removeBySelectRemove"), function () {
      removeVerticesFromCanvas(selectedVertices);
    });
  });

  /**
   * Handler called when the user clicks on button to remove all vertices
   * @param {Event} e - The event that triggered the call
   */
  $("#gd_removeOrphans").click(function (e) { 
    e.preventDefault();
    var verticesWithEdges = {};
    $.map(edges, function (d, i) {
      verticesWithEdges[d.source.id] = 1; 
      verticesWithEdges[d.target.id] = 1; 
    });
    var vertexIds = Object.keys(verticesWithEdges);
    var verticesWithoutEdges = svgVertices.filter(function (d, i) {
      return vertexIds.indexOf(d.id) == -1;
    });
    removeVerticesFromCanvas(verticesWithoutEdges[0]);
  });

  /**
   * Handler called when the user clicks on button to remove all vertices that
   * do not belong to the latest query.
   * @param {Event} e - The event that triggered the call
   */
  $("#gd_removeNonLatest").click(function (e) { 
    e.preventDefault();
    var verticesToRemove = $("circle").filter(function (i) {
      if (this.__data__.seq <= vertexSequenceEnd) { return true; }
    });
    removeVerticesFromCanvas(verticesToRemove);
  });

  /**
   * Handler that fires when pressing a key. It facilitates issuing some
   * actions using the keyboard
   */
  $(document).keydown(function(e) {
    // If the user has selected vertices to be removed, DEL will do the same as
    // clicking on "Remove". ESC will cancel the selection.
    if ($("#gd_removeBySelect").hasClass("snd")) {
      if ( e.which == 46 ) { 
        e.preventDefault();
        $("#gd_removeBySelectRemove").trigger('click');
      }
    }
    if ($("#gd_removeBySelect").text() == "Cancel") {
      if ( e.which == 27 ) { 
        e.preventDefault();
        $("#gd_removeBySelect").trigger('click');
      }
    }
    // If the user has selected vertices to load their vicinities, ENTER will do
    // the same as clicking on "Add". ESC will cancel the selection.
    if ($("#gs_addVicinitiesBySelect").hasClass("snd")) {
      if ( e.which == 13 ) { 
        e.preventDefault();
        $("#gs_addVicinitiesBySelectAdd").trigger('click');
      }
    }
    if ($("#gs_addVicinitiesBySelect").text() == "Cancel") {
      if ( e.which == 27 ) { 
        e.preventDefault();
        $("#gs_addVicinitiesBySelect").trigger('click');
      }
    }
  });

  /**
   * Find the DOM element of the graph vertex where the id contains the given
   * string. 
   * @param {string} s - The string that should appear in the vertex id
   * @return {DOMElement|undefined} - The vertex with the matching id
   */
  this.findExistingVertices = function (ids) {
    var existingVertices = svgVertices.filter(function (d, i) {
      return ids.indexOf(d.id) != -1
    });
    return existingVertices;
  };

  /**
   * Search the graph for the given id, and if the vertex is not present, order
   * it from the server
   * @param {string} id - The vertex id
   */
  this.addBySubstring = function (s) {
    order({"provider": "graph", 
           "query": "substring", 
           "targetCount": Math.min(100, $("#gp_maxVertexCount").val()),
           "substring": s});
  }

  $("#gs_addBySubstringAdd").click(function (e) {
    e.preventDefault();
    var s = $("#gs_addBySubstring").val();
    scc.consumers.Graph.addBySubstring(s);
  });
          
  /**
   * Send an order for the top vertices by the criteria and in the quantity
   * specified by the user.
   * @param {Event} e - The event that triggered the call
   */
  var addTop = function (e) {
    e.preventDefault();
    order({"provider": "graph",
           "query": "top", 
           "signalThreshold": signalThreshold,
           "collectThreshold": collectThreshold,
           "targetCount": parseInt($("#gp_targetCount").val()),
           "topCriterium": $("#gs_topCriterium").val()
    });
  };
  $("#gs_addByTop").click(addTop);

  /**
   * Set the design of the given vertex property to the given vertex metric.
   * For example, set the size ("gd_vertexSize") to be depending on the vertex
   * vertex state ("Vertex state").
   * @param {string} property - The visual vertex property to change
   * @param {string} metric - The vertex metric on which the visual
   *     representation should depend.
   */
  this.setGraphDesign = function (property, metric) {
    switch (property) {
      case "gd_vertexSize": 
          setVertexSize(vertexDesign["gd_vertexSize"][metric]); 
          break;
      case "gd_vertexColor": 
          setVertexColor(vertexDesign["gd_vertexColor"][metric]); 
          break;
      case "gd_vertexBorder": 
          setVertexBorder(vertexDesign["gd_vertexBorder"][metric]); 
          break;
    }
  };

  /**
   * Handler called when a 'select' HTML element is changed. The choice is
   * presisted to the settings hash.
   * @param {Event} e - The event that triggered the call
   */
  $("#cGraphDesign select").change(function (e) {
    var property = $(this);
    scc.consumers.Graph.setGraphDesign(property.attr("id"), property.val());
  });

  /**
   * Handler called when the user wants to load the vicinity of all vertices
   * @param {Event} e - The event that triggered the call
   */
  $("#gs_addAllVicinitiesAdd").click(function (e) { 
    e.preventDefault();
    order({"provider": "graph",
           "query":  "vertexIds",
           "vertexIds":  vertexStorage.get(),
           "vicinityIncoming": ($("#gp_vicinityIncoming").val() == "Yes"),
           "vicinityRadius": parseInt($("#gp_vicinityRadius").val()) 
    });
  });

  /**
   * Handler called when the user wants to load the vicinity of the vertices
   * that have been most recently queried
   * @param {Event} e - The event that triggered the call
   */
  $("#gs_addRecentVicinitiesAdd").click(function (e) { 
    e.preventDefault();
    var verticesToExpand = $("circle").filter(function (i) {
      if (this.__data__.seq > vertexSequenceEnd) { return true; }
    });
    var vertexIds = $.map(verticesToExpand, function (vertex, key) { 
      return vertex.__data__.id;
    });
    order({"provider": "graph",
           "query":  "vertexIds",
           "vertexIds":  vertexIds,
           "vicinityIncoming": ($("#gp_vicinityIncoming").val() == "Yes"),
           "vicinityRadius": parseInt($("#gp_vicinityRadius").val()) 
    });
  });

  /**
   * Removes the provided vertices from the graph cavas
   * @param {object} vertexList - List of vertex items
   */
  var removeVerticesFromCanvas = function(vertexList) {
    // Extract vertex Ids from vertex items
    // scc.resetOrders("graph"); TODO: is this necessary?
    var vertexIds = $.map(vertexList, function (vertex, key) { 
      return vertex.__data__.id;
    });
    // remove the vertices
    for (var i = 0; i < vertices.length; i++) {
      var n = vertices[i];
      if (vertexIds.indexOf(n.id) != -1) {
        vertices.splice(i, 1);
        vertexRefs[n.id] = undefined;
        i--
      }
      else {
        vertexRefs[n.id] = i;
      }
    }
    // remove edges that were connected to these vertices
    for (var i = 0; i < edges.length; i++) {
      var l = edges[i];
      edgeId = l.source.id + "-" + l.target.id;
      if (vertexIds.indexOf(l.source.id) != -1 ||
          vertexIds.indexOf(l.target.id) != -1) {
        edges.splice(i, 1);
        edgeRefs[l.id] = undefined;
        i--
      }
      else {
        edgeRefs[l.id] = i;
      }
    }
    // persist the new vertex selection and re-activate the graph layout
    vertexStorage.save();
    restart(true); 
  };

  /**
   * Handler called when the user clicks on button to remove all vertices
   * @param {Event} e - The event that triggered the call
   */
  $("#gd_removeAll").click(function (e) { 
    e.preventDefault();
    vertices = [];
    vertexStorage.save();
    scc.consumers.Graph.reset();
    scc.consumers.Graph.update();
  });

  /**
   * Handler called when the maximum vertex count option changes. Adjusts the
   * possible range to choose from in the target count option.
   */
  $("#gp_maxVertexCount").change(function (e) { 
    var val = parseInt($(this).val());
    var verticesToRemove = getOverflowingVertices()
    removeVerticesFromCanvas(verticesToRemove);
    populateTargetCountSelector(val);
  });

  /**
   * Handler called when the exposeVertices option changes. Adjusts the
   * possible range to choose from in the target count option.
   */
  $("#gp_exposeVertices").change(function (e) { 
    var val = $(this).val();
    if (val == "Yes") {
      scc.consumers.Graph.update();
      $('#exposition').css("width", scc.settings.get().graph.layout.expositionWidth);
      exposedVertexId = localStorage["exposedVertexId"];
      $("#exposition").fadeIn(100, function () {
        $('#graph_canvas').css("right", $("#exposition").width());
      });
      $("#exposition").fadeIn(100)
    }
    else {
      $("#exposition").fadeOut(100)
    }
  });

  /**
   * Handler called when the 'draw edges' option changes. Persists the choice 
   * to the settings hash and updates the representation (shows or hides the
   * edges)
   * @param {Event} e - The event that triggered the call
   */
  $("#gp_drawEdges").change(function (e) { 
    var val = $(this).val();
    switch (val) {
        case "Always":
        case "When graph is still":
            svgEdges.attr("class", "edge"); break;
        case "Only on hover":
            svgEdges.attr("class", "edge hiddenOpacity"); break;
    }
  });
};

