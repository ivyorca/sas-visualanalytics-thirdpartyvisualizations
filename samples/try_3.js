function sample_va() {
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
  console.log(csv_data);
  var root = d3
    .stratify()
    .id(function(d) {
      return d.id;
    })
    .parentId(function(d) {
      return d.p_id;
    })(csv_data);
  console.log(root);
  console.log(d3.hierarchy(root));
  draw(root);
}

function draw(treeData) {
  var margin = {
      top: 40,
      right: 90,
      bottom: 50,
      left: 90
    },
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // declares a tree layout and assigns the size
  var treemap = d3.tree().size([width, height]);

  //  assigns the data to a hierarchy using parent-child relationships
  var nodes = d3.hierarchy(treeData);

  // maps the node data to the tree layout
  nodes = treemap(nodes);

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom),
    g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // adds the links between the nodes
  var link = g
    .selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", "link")
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
    })
    .attr("stroke-width", function(d) {
      return d.data.value;
    });

  // adds each node as a group
  var node = g
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .attr("class", function(d) {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  // adds the circle to the node
  node.append("circle").attr("r", 8);

  // adds the text to the node
  node
    .append("text")
    .attr("dy", ".35em")
    .attr("y", function(d) {
      return d.children ? -20 : 20;
    })
    .style("text-anchor", "middle")
    .text(function(d) {
      return d.data.name;
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
}

if (!inIframe()) {
  sample_va();
}
function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
va.messagingUtil.setOnDataReceivedCallback(onDataReceived);
