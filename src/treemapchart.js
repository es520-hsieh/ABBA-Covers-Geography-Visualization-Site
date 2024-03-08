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
    d3.select("#myTreeMapChart").selectAll("*").remove();

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
    const treemap = d3.treemap().size([1300, 150]).padding(1);
    treemap(root);

    const svg = d3.select("#myTreeMapChart")
                  .attr("width", 1300)
                  .attr("height", 150);

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
.style("stroke", "Orange")
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
      .attr("dy", ".35em")
      .style("opacity", 0)
      .attr("text-anchor", "middle")
      .text(d => d.data.name)
      .attr("transform", d => `translate(${d.x0 + (d.x1 - d.x0) / 2},${d.y0 + (d.y1 - d.y0) / 2})`)
      .style("opacity", 1);
  };

  return (
    <svg ref={svgRef} width="1450" height="250"></svg>
  );
};

export default TreeMapChart;
