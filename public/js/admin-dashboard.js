$(document).ready(function() {
	$(window).on("resize", function(){
		responsiveVisualize();
	});

});

function responsiveVisualize() {
	$('.visualize').remove();
	$('.visualize-chart').each(function() {
		var chartType = ''; // Set chart type
		var chartWidth = $(this).parent().width()*0.9; // Set chart width to 90% of its parent
		var chartHeight;
		if(chartWidth < 280) {
			chartHeight = chartWidth;
		}else{
			chartHeight = chartWidth*0.25;
		}
		
		if ($(this).attr('data-chart')) { // If exists chart-chart attribute
			chartType = $(this).attr('data-chart'); // Get chart type from data-chart attribute
		} else {
			chartType = 'area'; // If data-chart attribute is not set, use 'area' type as default. Options: 'bar', 'area', 'pie', 'line'
		}
		
		if(chartType == 'line' || chartType == 'pie') {
			$(this).hide().visualize({
				type: chartType,
				width: chartWidth,
				height: chartHeight,
				colors: ['#ae432e','#77ab13','#088ec8','#f89406','#33363B','#33363b','#b29559','#6bd5b1','#66c9ee'],
				lineDots: 'double',
				interaction: true,
				multiHover: 5,
				tooltip: true,
				tooltiphtml: function(data) {
					var html ='';
					for(var i=0; i<data.point.length; i++){
						html += '<p class="tooltip chart_tooltip"><div class="tooltip-inner"><strong>'+data.point[i].value+'</strong> '+data.point[i].yLabels[0]+'</div></p>';
					}
					return html;
				}
			});
		} else {
			$(this).hide().visualize({
				type: chartType,
				width: chartWidth,
				height: chartHeight,
				colors: ['#ae432e','#77ab13','#088ec8','#f89406','#33363B','#33363b','#b29559','#6bd5b1','#66c9ee']
			});
		}
	});
}

/* - - - - - - - - - - - Map - - - - - - - - - - */

function initialiseMap(){
	var map = L.mapbox.map('map').setView([50.328313,-3.83891], 9);
	map.locate({setView: true, maxZoom: 9});
	markersOverlay = L.layerGroup().addTo(map);
	L.control.layers({
		'Terrain': L.mapbox.tileLayer('paperclipmonkey.map-zr7oe1u7').addTo(map),
		'Satellite': L.mapbox.tileLayer('paperclipmonkey.map-asryj7mr')
	}, {}, {position: 'bottomleft'}).addTo(map);
}

try{
	initialiseMap();
} catch(e){};

//Load the last 10 views owned by this user
$.get('/admin/responses-datatables/', function(data){
});

/* - - - - - - - - - - Get data - - - - - - - - - */

$.get('/admin/dash/responses/total', function(data){
	$('.stats-total').text(data.result);
});

$.get('/admin/dash/responses/week', function(data){
	$('.stats-total-week').text(data.result);
});

$.get('/admin/dash/responses/months', function(data){
	var month = new Date().getMonth() + 2;
	for(var i = 1; i <= 12; i++) {
		if(month > 12){
			month = 1;
		}
		var k = data.result[month];
		$('.views.total.months.names').append($('<th>').text(k.name));
		$('.views.total.months.values').append($('<td>').text(k.value));
		month++;
	}
	responsiveVisualize();
});