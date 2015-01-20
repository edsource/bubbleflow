/* GLOBAL CHART FUNCTIONS
===================================================================================*/
var chartFunctions = {

	/* GLOBAL CHART FUNCTIONS
	===================================================================================*/
	highlightLine:function(){
		var current = $(this); 
		var state = current.attr("state");
				
		//append label
		var clicked = $("#selection p[state='"+state+"']").attr("clicked");
		if (clicked === "false"){
			var where = _.indexOf(states, state);
			var position = parseFloat(endPoints[where]) + 15;
			$("#main-wrapper").append("<span class=\"labels\" state=\""+state+"\" style=\"top:"+ position + "px;color:"+colors[colorStep]+"\">" + state + "</span>");
			$(".label[state='"+ state +"']").insertBefore("#selection");

			//highlight and move to highlight group
			current.css("stroke", colors[colorStep]).detach().insertAfter("svg path:last");			
		}
	},
	unhightlightLine:function(){
		var current = $(this); 
		var state = current.attr("state");
		
		//remove label abd highlight
		var clicked = $("#selection p[state='"+state+"']").attr("clicked");
		if (clicked === "false"){
			current.css("stroke", "#e2e2e2");
			$("span[state='"+ state +"']").remove();

			//push to back
			current.detach().insertBefore("svg path:first");	
		}		
	},
	setDefaults:function(){
		y = d3.scale.linear()
			.domain([endData, startData])
			.range([0 + margin.top, h - margin.bottom]),
		x = d3.scale.linear()
				.domain([startYear, endYear])
				.range([0 + margin.left, w - margin.right]),
		years = d3.range(startYear, endYear + 1),
		states = [],
		endPoints = [];

		chart = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g");

		line = d3.svg.line()
			.x(function(d, i) {
				return x(d.x);
		}).y(function(d) {
				return y(d.y);
		});
	},
	drawChart:function(){
		//Draw Axes//
		chart.append("svg:line")
			.attr("x1", x(startYear))
			.attr("y1", h - 30)
			.attr("x2", 586)
			.attr("y2", h - 30)
			.attr("class", "axis"); //X-Axis
		chart.append("svg:line")
			.attr("x1", x(startYear))
			.attr("y1", y(startData))
			.attr("x2", x(startYear))
			.attr("y2", y(endData))
			.attr("class", "axis"); //Y-Axis

		//Move Axes to Top//
		$("svg line:eq(0)")
			.add("svg line:eq(1)")
			.detach()
			.insertAfter("#chart svg g");

		// Y Axis Labels //
		chart.selectAll(".yLabel")
			.data(y.ticks(4))
			.enter().append("svg:text")
			.attr("class", "yLabel")
			.text(String)
			.attr("x", 100)
			.attr("y", function(d) {
			return y(d)
		}).attr("text-anchor", "end").attr("dy", 3);

		utilityFunctions.churnLargeNumbers(true);

		// Y Axis Ticks //
		chart.selectAll(".yTicks")
			.data(y.ticks(4))
			.enter()
			.append("svg:line")
			.attr("class", "yTicks")
			.attr("y1", function(d) {
				return y(d);
		}).attr("x1", x(2004.95)).attr("y2", function(d) {
				return y(d);
		}).attr("x2", x(2005));

		if (dataType === "NAEP"){
			// X Axis Labels //
			chart.selectAll(".xLabel")
				.data(x.ticks(5))
				.enter()
				.append("svg:text")
				.attr("class", "xLabel")
				.text(String)
				.attr("x", function(d) {
				return x(d)
			}).attr("y", h - 10).attr("text-anchor", "middle");
			
			// X Axis Ticks //
			chart.selectAll(".xTicks")
				.data(x.ticks(5))
				.enter()
				.append("svg:line")
				.attr("class", "xTicks")
				.attr("x1", function(d) {
					return x(d);
			}).attr("y1", y(startData)).attr("x2", function(d) {
					return x(d);
			}).attr("y2", y(startData) + 10);
		}
		else {
			// X Axis Labels //
			chart.selectAll(".xLabel")
				.data(x.ticks(50))
				.enter()
				.append("svg:text")
				.attr("class", "xLabel")
				.text(String)
				.attr("x", function(d) {
				return x(d)
			}).attr("y", h - 10).attr("text-anchor", "middle");
			
			// X Axis Ticks //
			chart.selectAll(".xTicks")
				.data(x.ticks(50))
				.enter()
				.append("svg:line")
				.attr("class", "xTicks")
				.attr("x1", function(d) {
					return x(d);
			}).attr("y1", y(startData)).attr("x2", function(d) {
					return x(d);
			}).attr("y2", y(startData) + 10);
			chartFunctions.adjustNormalX(dataType);
		}
	},
	processData:function(thisData){
		for (i = 1; i < thisData.length; i++) {
			var values = thisData[i].slice(1,45);
			var tempData = [];
			var started = false;
			for (j = 0; j < values.length; j++) {
				if (values[j] != '') {
					tempData.push({
						x: years[j],
						y: values[j]
					});
					if (!started) {
						startEnd[thisData[i][0]] = {
							'startYear': years[j],
							'startVal': values[j]
						};
						started = true;
					} else if (j == values.length - 1) {
						startEnd[thisData[i][0]]['endYear'] = years[j];
						startEnd[thisData[i][0]]['endVal'] = values[j];
					}
				}
			}

			//populate state labels
			states[i-1] = thisData[i][0];

			chart.append("svg:path")
				.data([tempData])
				.attr("state", thisData[i][0])
				.attr("d", line)
				.attr("shape-rendering","auto")
				.on("mouseover", chartFunctions.highlightLine)
				.on("mouseleave", chartFunctions.unhightlightLine)

			//populate end points for each line
			var ii = i - 1;
			var temp = $("#chart path:eq("+ii+")").attr("d");
			var split = temp.split(",");
			var end = split.length - 1;
			endPoints[ii] = split[end];
		}	

		chartFunctions.populateLabels();
		chartFunctions.drawChart();
	},
	populateLabels:function(){
		//Axis Labels
		$("#y-axis").text(yAxisLabel);

		//State Labels
		for (i=0 ; i < states.length ; i++){
			$("#selection").append("<p state=\""+states[i]+"\"clicked=\"false\">" + states[i] + "</p>");
			$("#selection p:eq("+i+")").on("click", function(){
				var clicked = $(this).attr("clicked");
				var thisState = $(this).text();
				if (clicked === "false"){
					//determine position
					var where = _.indexOf(states, thisState);
					var position = parseFloat(endPoints[where]) + 15;
					//background and up front
					$(this).css("background", "#ddd").attr("clicked","true");
					$("#chart path[state='"+ thisState +"']").css("stroke",colors[colorStep]).detach().insertAfter("svg path:last");
					//toggle layer
					$("#main-wrapper").append("<span class=\"labels\" state=\""+thisState+"\" style=\"top:"+ position+ "px;color:"+colors[colorStep]+"\">" + thisState + "</span>");
					$(".label[state='"+ thisState +"']").insertBefore("#selection")

					//add to color step
					if (colorStep != 3){
						colorStep += 1;
					}
					else {
						colorStep = 0;
					}
				}
				else {
					//background
					$(this).css("background", "#fff").attr("clicked","false");
					$("#chart path[state='"+ thisState +"']").css("stroke","#e2e2e2");
					
					//remove label
					$("span[state='"+ thisState +"']").remove();

					//remove to color step
					if (colorStep != 0){
						colorStep -= 1;
					}
					else {
						colorStep = 3;
					}
				}
			});
		}
	},
	adjustNormalX:function(dataType){
		if (dataType === "Poverty"){
			//show certain labels
			$(".xLabel").css("display","none");
			$(".xLabel:first").css("display","block");
			$(".xLabel:last").css("display","block");
			$(".xLabel:eq(8)").css("display","block");
			$(".xLabel:eq(15)").css("display","block");
			$(".xLabel:eq(22)").css("display","block");
			$(".xLabel:eq(29)").css("display","block");

			//show certain ticks
			$(".xTicks").css("display","none");
			$(".xTicks:first").css("display","block");
			$(".xTicks:last").css("display","block");
			$(".xTicks:eq(8)").css("display","block");
			$(".xTicks:eq(15)").css("display","block");
			$(".xTicks:eq(22)").css("display","block");
			$(".xTicks:eq(29)").css("display","block");
		}
		else {
			//show certain labels
			$(".xLabel").css("display","none");
			$(".xLabel:first").css("display","block");
			$(".xLabel:last").css("display","block");
			$(".xLabel:eq(6)").css("display","block");
			$(".xLabel:eq(13)").css("display","block");
			$(".xLabel:eq(20)").css("display","block");
			$(".xLabel:eq(27)").css("display","block");
			$(".xLabel:eq(34)").css("display","block");

			//show certain ticks
			$(".xTicks").css("display","none");
			$(".xTicks:first").css("display","block");
			$(".xTicks:last").css("display","block");
			$(".xTicks:eq(6)").css("display","block");
			$(".xTicks:eq(13)").css("display","block");
			$(".xTicks:eq(20)").css("display","block");
			$(".xTicks:eq(27)").css("display","block");
			$(".xTicks:eq(34)").css("display","block");
		}
	}
}


/* GLOBAL VARIABLES
===================================================================================*/
var dataType = $("meta").attr("content"), filename, w = 600, h = 400, startYear = 1970, endYear = 2013, startData = 0, endData = 0, yAxisLabel, margin = {all:-1,left:110,right:15,top:30,bottom:30}, colors = ["#4169E1","#e14169","#e16941","#41e1b9"], colorStep = 0, chart, line, x, y, startEnd = {};

/* DETERMINES SPECIFIC CHART ONLOAD AND ADDS CUSTOMIZATION
===================================================================================*/
(function() {
	switch(dataType){
		case "Population":
			filename = 'data/population.csv';
			endData = 40000000;
			yAxisLabel = "State Population (in millions)"
			break;
		case "Students":
			filename = 'data/students.csv';
			endData = 6500000;
			yAxisLabel = "K-12 Students (in millions)"
			break;
		case "Students per Capita":
			filename = 'data/studentspercapita.csv';
			endData = 40;
			yAxisLabel = "Students per Capita"
			break;
		case "NAEP":
			filename = 'data/naep.csv';
			endData = 60;
			yAxisLabel = "Average NAEP Proficency in Math and Reading, Grades 4 and 8"
			startYear = 2003;
			endYear = 2014;
			break;
		case "Income":
			endData = 80000;
			yAxisLabel = "Income per Capita (in thousands)"
			startYear = 1970;
			endYear = 2013;
			break;
		case "Salaries":
			filename = 'data/salaries.csv';
			endData = 100000;
			yAxisLabel = "K-12 Teacher Salaries (in thousands)"
			startYear = 1970;
			endYear = 2011;
			break;
		case "Salaries-Income":
			filename = 'data/sVi.csv';
			startData = -2;
			endData = 2;
			yAxisLabel = "K-12 Teacher Salaries Against Income per Capita"
			startYear = 1970;
			endYear = 2011;
			break;
		case "Poverty":
			filename = 'data/poverty.csv';
			endData = 60;
			yAxisLabel = "Percentage of 6-17 Year-Olds in Poverty"
			startYear = 1977;
			endYear = 2013;
			break;
		case "Effort":
			filename = 'data/effort.csv';
			endData = 10;
			yAxisLabel = "K-12 Expenditures Compared With State Income"
			startYear = 1970;
			endYear = 2012;	
			break;
	}
	d3.text(filename, 'text/csv', function(text) {
		var thisData = d3.csv.parseRows(text);
		chartFunctions.processData(thisData);
	});	
	chartFunctions.setDefaults();
}());

/* GLOBAL UTILITY FUNCTIONS
===================================================================================*/
var utilityFunctions = {
	commaSeparateNumber:function(val){
	    while (/(\d+)(\d{3})/.test(val.toString())){
	      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return val;
	},
	churnLargeNumbers:function(line){
		var countX = $(".xLabel").length;
		var countY = $(".yLabel").length;
		var xLabels = [], xTemp = [], yLabels = [], yTemp = [];
		
		if (!line){
			for (i=0 ; i < countX ; i++){
				xTemp[i] = $(".xLabel:eq("+i+")").text();
				$(".xLabel:eq("+i+")").text(xLabels[i]);
			}
		}
		
		for (i=0 ; i < countY ; i++){
			yTemp[i] = $(".yLabel:eq("+i+")").text();

			//Shorten Axis Labels
			switch(yTemp[i].length){
				case 4: yTemp[i] = yTemp[i].slice(0,1); break;
				case 5: yTemp[i] = yTemp[i].slice(0,2); break;
				case 6: yTemp[i] = yTemp[i].slice(0,3); break;
				case 7: yTemp[i] = yTemp[i].slice(0,1); break;
				case 8: yTemp[i] = yTemp[i].slice(0,2); break;
				case 9: yTemp[i] = yTemp[i].slice(0,3); break;
			}
			$(".yLabel:eq("+i+")").text(yTemp[i]);
		}
	}
}




