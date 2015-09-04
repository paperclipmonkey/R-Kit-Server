function drawCloud(words){
  //Check it's visible - Gets turned off for smaller devices
  var visible = $('#wordcloud').css('display') === "block";
  if(!visible){
    return;
  }

  function _drawCloud(words) {
    document.getElementById('wordcloud').innerHTML = '';
    var cctrplt = ["#73b5e5","#7fcd68","#efcc3b", "#66c547"];
    //var fillthr = d3.scale.threshold()
    //    .domain([2, 5, 10])
    //    .range(cctrplt.BuOrPuRd[4]);
    d3.select("#wordcloud").append("svg")
        .attr("width", size[0])
        .attr("height", size[1])
      .append("g")
        .attr("transform", "translate(" + (size[0]/2) + "," + (size[1]/2) + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(k,i) { return cctrplt[parseInt(Math.random() * cctrplt.length, 10)]; })
        //.style("stroke", "#aaa")
        //.style("stroke-width", "1px")
        //.style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }

  if(!$.support.opacity){
    return;//Stops IE8 issue
  }

  //Whittle down WordCloud
  var wordCloud = {};

  var i = 0;

  while(i < words.length){
    if(!wordCloud[words[i]]){//Within viewport
       wordCloud[words[i]]= 0;
    }
    wordCloud[words[i]]++;
    i++;
  }

  var wordClouds = [];
  for(var x in wordCloud){
    wordClouds.push({
      text: x,
      size: wordCloud[x]*15
    });
  }

  var size = [
    document.getElementById('wordcloud').offsetWidth,
    document.getElementById('wordcloud').offsetHeight
  ];

  var fill = d3.scale.category20();

  d3.layout.cloud().size(size)
    .words(wordClouds)
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", _drawCloud)
    .start();
}