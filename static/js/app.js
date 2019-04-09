function buildMetadata(sample) {

    var url = `/metadata/${sample}`;
    var metadata = d3.select("#sample-metadata");
    metadata.html("");

    d3.json(url).then(function(response) {
      Object.entries(response).forEach(d => {
        var paragraph = metadata.append("p").text(`${d[0]}: ${d[1]}`);
      });

    // BONUS: Build the Gauge Chart
     buildGauge(response.WFREQ);
    });

}
function buildGauge(WFREQ) {
  //var url = `/WFREQ/${sample}`;
  // Enter a speed between 0 and 180
  console.log(`console:${WFREQ}`)
  var level = WFREQ;

  // Trig to calc meter point
  var degrees = (9-level)*180/9,
      radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
    x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'},
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9,50/9,50/9,50],
    rotation: 90,
    text: ['8-9', '7-8','6-7', '5-6','4-5', '3-4', '2-3','1-2','0-1',''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(19, 113, 119, .5)','rgba(24, 137, 119, .5)','rgba(25, 127, 0, .5)',
                    'rgba(110, 154, 22, .5)','rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                    'rgba(210, 206, 145, .5)','rgba(230, 216, 180, .5)','rgba(232, 226, 202, .5)',
                    'rgba(255, 255, 255, 0)']},
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3','1-2','0-1',''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
   // height: 1000,
    //width: 1000,
    xaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]}
  };

Plotly.newPlot('gauge', data, layout);
}


function buildCharts(sample) {

  var url = `/samples/${sample}`;

    d3.json(url).then(function(response) {
      //Pie Charts
      var pieData = [{
        values: response.sample_values.slice(0, 10),
        labels: response.otu_ids.slice(0, 10),
        name: "Sample No.:"+sample,
        text:response.otu_labels.slice(0, 10),
        hoverinfo: 'label+text',
        textinfo: 'percent',
        type: 'pie'
      }];
      var pieLayout = { 
        hovermode:'closest',
        //margin: { t: 0 }
      };
      Plotly.newPlot("pie", pieData,pieLayout);

      //Bubble Chart
      bubbleData= [{
        x: response.otu_ids,
        y: response.sample_values,
        text:  response.otu_labels,
        mode: 'markers',
        marker: {
            size: response.sample_values,
            color:response.otu_ids,
            showscale: "True"
        }
      }];
      var bubbleLayout = { 
      xaxis:{ title: 'OTU ID'}
      };
      Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
