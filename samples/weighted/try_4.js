var categoryArray;
var dp1Array;
var tooltip;
var tooltip = d3
  .select("section")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 1);
var c_id;
var searchField;
var root2;
function clearInput() {
  $("input[name=Company_nm").val("");
  root2 = null;
  updateChart();
}
function filter() {
  c_id = document.getElementById("c_id").value;
  if (c_id) {
    console.log(root1);
    searchField = "d.id";
    var rootval = root1;
    console.log(rootval);
    searchTree(rootval);
  }
}

function searchTree(d) {
  if (d.children) d.children.forEach(searchTree);
  else if (d._children) d._children.forEach(searchTree);
  var searchFieldValue = eval(searchField);
  if (searchFieldValue && searchFieldValue.match(c_id)) {
    // Walk parent chain
    console.log("check par");
    console.log(d); //d here has clicked node
    var ancestors = [];
    var parent = d;
    while (d.parent) {
      // Back up original tree
      d.parent._children = d.parent.children;
      // Filter out non line of site children
      d.parent.children = [
        _.find(d.parent.children, function(e) {
          return e.id === d.id;
        })
      ];
      d = d.parent;
    }
    // console.log(ancestors);
    console.log(d);
    root2 = d;
    console.log(root2);
  }
  updateChart();
}

var d_dataTable;
var root1;
const SAMPLE_MESSAGE = {
  version: "1",
  resultName: "result",
  rowCount: 6,
  availableRowCount: 6,
  data: [
    ["5Z78190499", "(missing)"],
    ["1E04201305", "5Z78190499"],
    ["1N34201907", "5Z78190499"],
    ["4H33202112", "5Z78190499"],
    ["8C26190184", "5Z78190499"],
    ["4G23200513", "4H33202112"],
    ["3G66190496", "8C26190184"],
    ["0H59201108", "1N34201907"],
    ["8K71202310", "1E04201305"],
    ["7G77202616", "8K71202310"],
    ["2M54190495", "0H59201108"],
    ["4Z58201108", "0H59201108"],
    ["8Z36190098", "0H59201108"],
    ["9H00201310", "0H59201108"],
    ["9Z80200103", "0H59201108"],
    ["8W17201713", "4G23200513"],
    ["6K44202309", "3G66190496"]
  ],
  columns: [
    {
      name: "column",
      label: "id",
      type: "string"
    },
    {
      name: "column",
      label: "p_id",
      type: "string"
    }
  ]
};

var g_sampleData = [
  {id: "5Z78190499", p_id: "", nlevel: "", value: ""},
  {id: "1E04201305", p_id: "5Z78190499", nlevel: "1", value: "100"},
  {id: "1N34201907", p_id: "5Z78190499", nlevel: "1", value: "100"},
  {id: "4H33202112", p_id: "5Z78190499", nlevel: "1", value: "100"},
  {id: "8C26190184", p_id: "5Z78190499", nlevel: "1", value: "100"},
  {id: "4G23200513", p_id: "4H33202112", nlevel: "2", value: "100"},
  {id: "3G66190496", p_id: "8C26190184", nlevel: "2", value: "100"},
  {id: "0H59201108", p_id: "1N34201907", nlevel: "2", value: "100"},
  {id: "8K71202310", p_id: "1E04201305", nlevel: "2", value: "50"},
  {id: "7G77202616", p_id: "8K71202310", nlevel: "3", value: "80"},
  {id: "2M54190495", p_id: "0H59201108", nlevel: "3", value: "100"},
  {id: "4Z58201108", p_id: "0H59201108", nlevel: "3", value: "75"},
  {id: "8Z36190098", p_id: "0H59201108", nlevel: "3", value: "7.5"},
  {id: "9H00201310", p_id: "0H59201108", nlevel: "3", value: "100"},
  {id: "9Z80200103", p_id: "0H59201108", nlevel: "3", value: "65"},
  {id: "8W17201713", p_id: "4G23200513", nlevel: "3", value: "50"},
  {id: "6K44202309", p_id: "3G66190496", nlevel: "3", value: "50"}
];

function sample_va() {
  var arrayData = SAMPLE_MESSAGE.data;
  var columnsInfo = SAMPLE_MESSAGE.columns;
  convertData(arrayData, columnsInfo);
}
function convertData(arrayData, columnsInfo) {
  var len = arrayData.length;
  d_dataTable = [];
  let colname_arr = columnsInfo.map(a => a.label);
  var arr_len = colname_arr.length;
  for (var i = 0; i < len; i++) {
    var cols_array_toreduce = [];
    var data_array_toreduce = [];
    arr_len = arrayData[i].length;
    for (var j = 0; j < arr_len; j++) {
      cols_array_toreduce.push(colname_arr[j]);
      if (arrayData[i][j] == "(missing)") {
        data_array_toreduce.push("");
      } else {
        data_array_toreduce.push(arrayData[i][j]);
      }
    }
    var result = data_array_toreduce.reduce(function(result, field, index) {
      result[cols_array_toreduce[index]] = field;
      return result;
    }, {});
    d_dataTable.push(result);
  }
  stratify_data(d_dataTable);
}

function csv_parse() {
  d3.csv(
    "https://raw.githubusercontent.com/ivyorca/sas-visualanalytics-thirdpartyvisualizations/master/3nlevel_data.csv"
  ).get(function(error, rows) {
    console.log(rows);
    stratify_data(rows);
  });
}

function stratify_data(csv_data) {
  var root = d3
    .stratify()
    .id(function(d) {
      return d.id;
    })
    .parentId(function(d) {
      return d.p_id;
    })(csv_data);
  root1 = root;
//  updateChart(root1);
}

function updateChart() {
  d3.selectAll("g").remove();
  var margin = {
    top: 40,
    right: 90,
    bottom: 50,
    left: 90
  };

  var width = window.innerWidth - margin.left - margin.right;
  var height = window.innerHeight - margin.top - margin.bottom;

  var chart = d3.select("div#chart");
  var svg = chart
    .select("svg#tree")
    // .select("body")
    // // .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //  g = svg

    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .append("g")
    .attr("transform", "translate(" + 0 + "," + 30 + ")");

  stratify_data(d_dataTable);
  console.log("F THIS");
  var dataTable = [];
  if (root2) {
    dataTable = root2;
    draw(dataTable, width, height);
  } else {
    dataTable = root1 ? root1 : g_sampleData;
    draw(dataTable, width, height);
  }
}

function draw(treeData, width, height) {
  // categoryArray = [];
  // dp1Array = [];
  // var depths = d3.hierarchy(treeData);
  // var max_depth;
  // dp1Array = depths.data.children;
  // console.log(depths.height);
  // for (var i = 0, len = dp1Array.length; i < len; i++) {
  //   categoryArray[i] = dp1Array[i].data.id; //get the depth === 1 categories
  // }

  categoryArray = [];
  dp1Array = [];
  var depths = d3.hierarchy(treeData);
  for (var i = 1, ht = depths.height; i <= ht; i++) {
    categoryArray[i] = i; //get the depth === 1 categories
  }
  console.log(categoryArray)
  colorDomain = categoryArray;
  var color = d3
    .scaleOrdinal()
    .domain(colorDomain)
    .range(d3.schemeSet2);

  var svg = d3.select("svg");
  // declares a tree layout and assigns the resize;

  var treemap = d3.tree().size([width - 2, height - 2]);
  //  assigns the data to a hierarchy using parent-child relationships
  var nodes = d3.hierarchy(treeData);
  // maps the node data to the tree layout
  nodes = treemap(nodes);

  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0.8);

  var link = svg
    .select("g")
    .selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter()
    .append("g")
    .attr("class", "link");

  link
    .append("path")
    .attr("fill", "none")
    .attr("stroke", function(d) {
      return color(d.depth);
    })
    .attr("opacity", "0.5")
    .attr("stroke-width", function(d) {
      if (d.data.data.value) {
        var strokevar;
        if ((d.data.data.value / 100) * 30 < 1) {
          strokevar = 2.5;
        } else {
          strokevar = (d.data.data.value / 100) * 30;
        }
        return strokevar;
      } else {
        return 5;
      }
    })
    .attr("d", function(d) {
      return (
        "M" +
        d.x +
        "," +
        d.y +
        "C" +
        d.x +
        "," +
        (d.y + d.parent.y) / 2 +
        " " +
        d.parent.x +
        "," +
        (d.y + d.parent.y) / 2 +
        " " +
        d.parent.x +
        "," +
        d.parent.y
      );
    });

  link
    .append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("fill", "Black")
    .attr("stroke", "Black")
    .style("font", "normal 12px Arial")
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .attr("dy", ".35em")
    .attr("y", function(d) {
      return d.children ? -40 : 35;
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      if (d.data.data.value) {
        return d.data.data.value + "%";
      }
    });
  // adds each node as a group
  var node = svg
    .select("g")
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .attr("class", function(d) {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .on("click", function(d) {
      // console.log(d);
      // construct_generations(d);
    });

  // adds the circle to the node
  node
    .append("circle")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .attr("r", 13);

  // adds the text to the node
  node
    .append("text")
    .attr("dy", ".25em")
    .attr("y", function(d) {
      return d.children ? -20 : 25;
    })
    .style("text-anchor", "middle")
    .text(function(d) {
      //  console.log(d.data.data.id);
      return d.data.data.id;
    });

  node.select("circle").attr("stroke", function(d) {
    if (d.depth === 0) {
      return "Black";
    } else {
      return color(d.depth);
    }
  });
}
// csv_parse();
// sample_va();

function onDataReceived(event) {
  if (
    event &&
    event.hasOwnProperty("data") &&
    event.hasOwnProperty("columns") &&
    event.hasOwnProperty("resultName") &&
    event.data
  ) {
    // Process event.data
    // Because data will dynamically change, we need an event handler to to redraw the chart
    eventHandlerFromVA(event);
  }
}

function eventHandlerFromVA(messageFromVA) {
  var arrayData = messageFromVA.data;
  var columnsInfo = messageFromVA.columns;
  convertData(arrayData, columnsInfo);
  updateChart();
}

if (!inIframe()) {
  // sample_va();
  onDataReceived(SAMPLE_MESSAGE);
}
function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function initChart() {
  // Listen for resize event
  va.contentUtil.setupResizeListener(updateChart);
}

construct_generations = function(d) {
  var c, generations;
  c = d; // make a clone of d.
  console.log(d);
  generations = []; // Array for each ancestors children. Will reconstruct later on body click
  while (c.parent) {
    generations.push(c.parent.children);
    c = c.parent;
  }
  console.log(generations);
  //  return generations;
};

//======================MOUSE EVENTS==================//
function mouseover() {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0.9);
}

function mousemove(d) {
  tooltip
    .html(
      "ID: " + d.data.data.id + "<br />" + ("Parent ID: " + d.data.data.p_id)
    )
    .style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY - 50 + "px");
}

function mouseout() {
  tooltip
    .transition()
    .duration(500)
    .style("opacity", 0);
}

va.messagingUtil.setOnDataReceivedCallback(onDataReceived);
initChart();
updateChart();
