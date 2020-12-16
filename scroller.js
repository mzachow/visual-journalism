/*--------------- D3 STUFF -------------*/

//define dimensions
const SIZE = {X:$(".graph").width(), Y:$(".graph").width()*0.6};
const MARGIN = {TOP:10, BOTTOM:100, LEFT:100, RIGHT:10};
const DIM = {WIDTH: SIZE.X - MARGIN.LEFT - MARGIN.RIGHT,
            HEIGHT: SIZE.Y - MARGIN.TOP - MARGIN.BOTTOM};

//add svg to graph class
const svg = d3.select(".graph").append("svg")
    .attr("width", SIZE.X)
    .attr("height", SIZE.Y);  

//add group to svg to have margins apply to everything
const graph = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// To convert Date correctly
var parseTime = d3.timeParse("%Y-%m-%d");

//define scales
var x = d3.scaleTime()
    .range([0, DIM.WIDTH]);

var y = d3.scaleLinear()
    .range([DIM.HEIGHT, 0]);

//define axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()

//make axis groups
const xAxis = graph.append("g")
    .attr("class", "axisWhite")
    .attr("opacity", 1)
    .attr("transform", `translate(0, ${DIM.HEIGHT+100})`);
    
const yAxis = graph.append("g")
    .attr("class", "axisWhite")
    .attr("opacity", 1)
    .attr("transform", "translate(-50,0)");

//makes sure that nothing is plotted outside of axes
var clipPath = graph.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", DIM.WIDTH)
    .attr("height", DIM.HEIGHT);

//initialize variables
var state = 0;
var run;


    
//read in data & first draw
d3.csv("data/Activities.csv").then(data => {
    data.forEach(d => {
        d.yVal = 0;
    })

    allData = data.map(({ date, distance, yVal}) => ({ date: new Date(date), distance: parseFloat(distance) , yVal}));

    graph
        .selectAll("circle")
        .data(allData)
        .enter()
            .append("circle")
            .attr("r", 10)
            .attr("fill", "purple")
            .style("filter", "url(#glow)")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.yVal))
            .attr("opacity", 0.3);


    draw(allData, state);
})

// function to draw the shape of a graph to start with
function drawGraph(data) {
    x.domain([parseTime("2020-03-01"), parseTime("2020-11-01")]);
    
    y.domain([0,0]);    

    xAxis.attr("opacity", 0.3);
    yAxis.attr("opacity", 0);
    updateAxes(data, extent=false, fly=true);


    d3.selectAll("circle")
        .transition().duration(200)
        .attr("r", d => d.distance/21 * 40)
        .attr("fill", "purple")
        .style("filter", "url(#glow)")
        .attr("stroke-width", "0px")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(0))
        .attr("opacity", 0.3);
}

//function for drawing a flat line
function flatLine(data) {
    x.domain([parseTime("2020-03-01"), parseTime("2020-11-01")]);

    y.domain([0,0]);
    updateAxes(data, extent=false, fly=true);

    xAxis.attr("opacity", 1);
    yAxis.attr("opacity", 0);
  
    d3.selectAll("circle")
        .transition().duration(200)
        .attr("r", d => d.distance/21 * 40)
        .attr("fill", "purple")
        .style("filter", "url(#glow)")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(0))
        .attr("stroke", "#33086b")
        .attr("stroke-width", "2px")
        .attr("opacity", 0.6);

    
}

//function for zooming out to entire dataset
function zoomOut(data, first=false) {
    $(".x.axis").removeClass("invisible")
    $(".y.axis").removeClass("invisible")

    xAxis.attr("opacity", 1)
    yAxis.attr("opacity", 1)

    yAxisCall.ticks(10);
    
    updateAxes(data, extent=false, fly=first);

    d3.selectAll("circle")
        .transition().duration(300)
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.distance));


}

//function to update axes for each new section
function updateAxes(data, extent=false, call=true, fly=false, flat=false) {
    x.domain([parseTime("2020-03-01"), parseTime("2020-11-01")]);

    if (flat===true) {
        y.domain([0,0]);
    } else {
        if (extent) {
            y.domain(d3.extent(data, d => d.distance));
        } else {
            y.domain([0, 25]);
        }
    }
    
    if (call) {
        if (fly) {
            xAxis
                .call(xAxisCall.scale(x))
                .attr("transform", `translate(0, ${DIM.HEIGHT+100})`)
                .transition().duration(200)
                .attr("transform", `translate(0, ${DIM.HEIGHT})`);

            yAxis
                .call(yAxisCall.scale(y))
                .attr("transform", "translate(-100,0)")
                .transition().duration(200)
                .attr("transform", "translate(0,0)")
        } else {
            xAxis
                .transition().duration(200)
                .call(xAxisCall.scale(x))
                .attr("transform", `translate(0, ${DIM.HEIGHT})`);

            yAxis
                .transition().duration(200)
                .call(yAxisCall.scale(y))
                .attr("transform", "translate(0,0)")
        }
    }
}

//function to call drawing functions depending on the section or state
function draw(data, state) {
    switch (state) {
        case 1:
            drawGraph(data);
            break;
        case 2:
            flatLine(data);
            break;
        case 3:
            zoomOut(data, first=true);
            break;
    };
};

/*---------- SCROLLMAGIC STUFF ----------*/

//instanciate scrollmagic controller
var controller = new ScrollMagic.Controller();

//get number of steps and length of entire sections div
const n = $("section").length;
const duration = $(".sections").outerHeight(true);


//rounding function
function round( num, precision ) {
    return +(+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
}

//make list with relative endpoints of all steps
var length = [];
for (let i = 1; i <= n; i++) {
    var len = $(".step" + i).outerHeight(true)/duration;

    var sum = 0;
    for (let j = 1; j <= length.length; j++) {
        sum =+ length[j-1];   
    }
    
    length[i-1] = round(len+sum, 3);
}

//initialize last_step
var last_step = 0;

//define scrollmagic scene to be triggered by sections class and measure at 65% from the top
var scene = new ScrollMagic.Scene({triggerHook: 0.55, triggerElement: ".sections", offset: 0, duration: duration})
                .addTo(controller)
                .on("progress", function (e) {
                    //define progress as how far we've scrolled (0 to 1)
                    var progress = e.progress.toFixed(3);
                    
                    //use progess and relative endpoints to determine in which section we are
                    var step;
                    if (progress < length[0]) {
                        step = 1;
                    } else if (progress < length[1]) {
                        step = 2;
                    }  else if (progress < length[2]) {
                        step = 3;
                    }
                    if (!(step === last_step)) {
                        $(".step").removeClass("active")
                        $(".step" + step).addClass("active");
                        draw(run, step);
                    }
                    
                    })

// Blurring effect
    //Container for the gradients
    var defs = graph.append("defs");

    //Filter for the outside glow
    var filter = defs.append("filter")
                        .attr("id","glow");
    filter.append("feGaussianBlur")
            .attr("stdDeviation","1") // Change standard deviation to increase/decrease blurring effect
            .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
                .attr("in","coloredBlur");
    feMerge.append("feMergeNode")
                .attr("in","SourceGraphic");