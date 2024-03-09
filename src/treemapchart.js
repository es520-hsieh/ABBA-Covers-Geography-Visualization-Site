import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TreeMapChart = ({ minValue, maxValue }) => {
  const [loadedData, setLoadedData] = useState([]);
  const [albumColors, setAlbumColors] = useState({});
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const data = await d3.json(`${process.env.PUBLIC_URL}/database.json`);
      const filteredData = data.filter(item => item['Release year'] >= minValue && item['Release year'] <= maxValue);
      setLoadedData(filteredData);
      processColors(filteredData);
    };

    fetchData();
  }, [minValue, maxValue]);

  useEffect(() => {
    if (loadedData.length > 0) {
      drawChart();
    }
  }, [loadedData, albumColors]);

  const processColors = (data) => {
    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const tempAlbumColors = {};
    data.forEach(d => {
        if (!tempAlbumColors.hasOwnProperty(d['Album'])) {
            const mainColor = colorScale(d['Album']);
            const startColor = d3.rgb(mainColor).darker(0.2);
            const endColor = d3.rgb(mainColor).brighter(0.2);
            tempAlbumColors[d['Album']] = d3.scaleSequential([0, 8], d3.interpolateLab(startColor, endColor));
        }
    });
    setAlbumColors(tempAlbumColors);
  };

  const drawChart = () => {
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const albumCounts = d3.rollup(loadedData, v => v.length, d => d['Album']);
    const sortedAlbum = Array.from(albumCounts).sort((a, b) => b[1] - a[1]);

    const hierarchyData = sortedAlbum.map(([album, _]) => ({
      name: album,
      children: Array.from(d3.rollup(loadedData.filter(d => d['Album'] === album), 
          v => v.length, d => d['Original']))
          .sort((a, b) => b[1] - a[1])
          .map(([original, count]) => ({
              name: original,
              value: count
      }))
    }));

    const data = {
      name: "root",
      children: hierarchyData
    };

    const root = d3.hierarchy(data).sum(d => d.value);
    const treemap = d3.treemap().size([1350, 110]).padding(1);
    treemap(root);

    const svg = svgElement
    .attr("width", 1350)
    .attr("height", 110);

    svg.selectAll("*").remove();

    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "white")
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("pointer-events", "none");

const node = d3.select(svgRef.current).selectAll(".node")
.data(root.leaves())
.enter().append("g")
.attr("transform", d => `translate(${d.x0},${d.y0})`);

node.append("rect")
.attr("width", d => d.x1 - d.x0)
.attr("height", d => d.y1 - d.y0)
.attr("rx", 5)
.attr("ry", 5)
.style("stroke", "white")
.style("fill", d => {
const originalIndex = d.parent.data.children.findIndex(child => child.name === d.data.name);
return albumColors[d.parent.data.name](originalIndex);
})
.on("mouseover", function(event, d) {
d3.select(this)
.style("stroke", "#d63384")
.style("stroke-width", 3);
tooltip.transition()
 .duration(200)
 .style("opacity", .9);
tooltip.html(d.data.name + "<br/>" + d.value)
 .style("left", (event.pageX) + "px")
 .style("top", (event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
d3.select(this)
.style("stroke", "white")
.style("stroke-width", 1);
tooltip.transition()
 .duration(500)
 .style("opacity", 0);
});
      
svg.selectAll(".node")
  .data(root.descendants().filter(d => d.depth === 1))
  .enter().append("text")
    .attr("dy", "1em") // ?????´å¯¹é½?ï¼?ç¨?å¾®ä??ç§»ä½¿å¾??????¬ä??ç´§è´´ä¸?è¾¹ç??
    .attr("dx", "5") // æ°´å¹³å¯¹é??ï¼?ç¨?å¾®å?³ç§»ä½¿å???????¬ä??ç´§è´´å·¦è¾¹ç¼?
    .style("fill", "white") // è®¾ç½®?????¬é????²ä¸º??½è??
    .style("font-weight", "bold") // è®¾ç½®?????¬ä¸ºç²?ä½?
    .attr("text-anchor", "start") // å°??????¬é????¹è®¾ç½®ä¸ºèµ·å??ç«¯ï???????©ä??ä»?å·¦å????³æ???????????
    .text(d => d.data.name)
    .attr("transform", d => `translate(${d.x0 + 5},${d.y0 + 5})`); // å°??????¬ä??ç½®è®¾ç½®å?°æ??ä¸ªç?©å½¢???å·¦ä??è§?ï¼?è·?ç¦»è¾¹ç¼?5???ç´?

      
  };

  return (
    <svg ref={svgRef} width="1350" height="130"></svg>
  );
};

export default TreeMapChart;
