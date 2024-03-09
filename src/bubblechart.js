// BubbleChart.js
import React, { useEffect } from 'react';
import * as d3 from 'd3';
import './bubblechart.css';

const BubbleChart = ({ popupCountry, bubbleData, onBubbleClick }) => {
  useEffect(() => {
    if (bubbleData) {
      drawChart(bubbleData);
    }
  }, [bubbleData]);

  const drawChart = (filteredData) => {
    const filteredByCountry = filteredData.filter(item => item['Artist Country'] === popupCountry);

    d3.select("#bubbleChart").selectAll("*").remove();

    let hierarchyData = { name: "Albums", children: [] };
    let albums = {};

    filteredByCountry.forEach(item => {
      if (!albums[item.Album]) {
        albums[item.Album] = { name: item.Album, children: [] };
      }
      let original = albums[item.Album].children.find(d => d.name === item.Original);
      if (original) {
        original.value += 1;
      } else {
        albums[item.Album].children.push({ name: item.Original, value: 1, data: item }); // Include data with the bubble
      }
    });

    for (let album in albums) {
      hierarchyData.children.push(albums[album]);
    }

    const root = d3.hierarchy(hierarchyData).sum(d => d.value).sort((a, b) => b.value - a.value);
    const bubble = d3.pack().size([500, 500]).padding(1.5);
    const svg = d3.select("#bubbleChart").append("svg")
  .attr("width", 600)
  .attr("height", 600)
  .attr("class", "bubble")
  .style("transform", "translate(0px, -200px)"); // æ·»å??è¿?è¡?ä»??????¥è????´ä??ç½?

    const nodes = bubble(root).descendants();
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    

    const tooltip = d3.select("#chartTooltip");

    const node = svg.selectAll(".node")
      .data(nodes.filter(d => !d.children))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.r)
      .style("fill", d => color(d.parent.data.name))
      .on("mouseover", function(event, d) {
        d3.select(this)
          .style("stroke", "white")
          .style("stroke-width", 3);
        d3.select(this.parentNode).select("title")
          .text(`${d.parent.data.name}: ${d.data.name} (${d.value})`);
      })
      
      .on("mouseout", function() {
        d3.select(this)
        .style("stroke", null)
        .style("stroke-width", null);
      d3.select(this.parentNode).select("title")
        .text(""); // Hide text on mouseout
      })
      .on("click", function(event, d) {
        if (onBubbleClick) {
          onBubbleClick(d.data); // Pass bubble data to parent component
        }
      });

    node.append("text")
      .attr("dy", ".2em")
      .style("text-anchor", "middle")
      .text(d => d.data.name.substring(0, d.r / 3))
      .attr("font-size", d => `${d.r / 5}px`);

    node.append("text")
      .attr("dy", "1.3em")
      .style("text-anchor", "middle")
      .text(d => d.value)
      .attr("font-size", d => `${d.r / 5}px`);
  };

  return (
    <div>
      <div id="bubbleChart"></div>
      <div className="tooltip" id="chartTooltip"></div>
    </div>
  );
};

export default BubbleChart;
