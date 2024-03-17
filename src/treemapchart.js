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
    // Define the fixed order of albums
    const albumOrder = [
      "Ring Ring",
      "Waterloo",
      "ABBA",
      "Arrival",
      "The Album",
      "Voulez-Vous",
      "Super Trouper",
      "The Visitors"
    ];

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const tempAlbumColors = {};
    // Assign colors based on the fixed order
    albumOrder.forEach((album, index) => {
      if (!tempAlbumColors.hasOwnProperty(album)) {
        // Use the index to fetch a consistent color from the scale
        const mainColor = colorScale(index);
        const startColor = d3.rgb(mainColor).darker(0.2);
        const endColor = d3.rgb(mainColor).brighter(0.2);
        tempAlbumColors[album] = d3.scaleSequential([0, 8], d3.interpolateLab(startColor, endColor));
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

    const node = svg.selectAll(".node")
    .data(root.leaves())
    .enter().append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

// 矩形元素的??和交互效果
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
    .style("fill-opacity", 0) // 初始透明度?置?0
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
    })
    .transition() // ?始?渡??
    .duration(800) // ?置??持???
    .style("fill-opacity", 1); // ???束?的透明度

    svg.selectAll(".node")
    .data(root.descendants().filter(d => d.depth === 1))
    .enter().append("text")
      .attr("dy", "1em")
      .attr("dx", "5")
      .style("fill", "white")
      .style("font-weight", "bold")
      .attr("text-anchor", "start")
      .text(d => d.data.name)
      // 初始化transform?性，以便?始??放?0（完全?小）
      .attr("transform", d => `translate(${d.x0 + 5},${d.y0 + 5}) scale(0)`)
      // 通?transition和attrTween添加?放??
      .transition() // ?始???渡
      .duration(800) // ??持???
      .attrTween("transform", function(d) {
          const x = d.x0 + 5;
          const y = d.y0 + 5;
          // interpolateScale接受一?范??0到1的t??，并返回一???的插值??字符串
          const interpolateScale = d3.interpolateNumber(0, 1); // ?0（完全?小）到1（完全展?）
          return function(t) {
              // t是???量，?0?增到1
              const scale = interpolateScale(t);
              return `translate(${x},${y}) scale(${scale})`; // 根据t的值?算?放值
          };
      });
};

  return (
    <svg ref={svgRef} width="1350" height="130"></svg>
  );
};

export default TreeMapChart;
