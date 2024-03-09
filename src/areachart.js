import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const Streamgraph = ({ minValue, maxValue }) => {
  const [transformedData, setTransformedData] = useState([]);
  const [albumNames, setAlbumNames] = useState([]);
  const [tooltip, setTooltip] = useState({ display: false, content: '', x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const data = await d3.json(`${process.env.PUBLIC_URL}/yearly_album_counts.json`);
      const newData = data.map(d => {
        const newObj = { "Year": new Date(d.Year, 0, 1) };
        for (const [key, value] of Object.entries(d["Album Counts"])) {
          newObj[key] = value;
        }
        return newObj;
      });
      setTransformedData(newData);
      setAlbumNames(Object.keys(data[0]["Album Counts"]));
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (transformedData.length > 0 && albumNames.length > 0) {
      drawChart();
    }
  }, [transformedData, albumNames, minValue, maxValue]);

  const yearSpan = [minValue, maxValue];
  const filteredData = transformedData.filter(d => d.Year.getFullYear() >= yearSpan[0] && d.Year.getFullYear() <= yearSpan[1]);

  const drawChart = () => {

    d3.select("#myStreamgraph").selectAll("*").remove();

    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("padding", "10px")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("z-index", "10");
    }
    
    const svg = d3.select("#myStreamgraph")
      .attr("viewBox", [0, 0, 1350, 120])
      .style("display", "block");

    const margin = { top: 15, right: 25, bottom: 0, left: 20 },
          width = 1400 - margin.left - margin.right,
          height = 120 - margin.top - margin.bottom;

    const x = d3.scaleUtc()
      .domain(d3.extent(filteredData, d => d.Year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(albumNames);

    const area = d3.area()
      .curve(d3.curveBasis)
      .x(d => x(d.data.Year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    const stack = d3.stack()
      .keys(albumNames)
      .offset(d3.stackOffsetSilhouette)
      .order(d3.stackOrderNone);

    const layers = stack(filteredData);

    y.domain([d3.min(layers, layer => d3.min(layer, d => d[0])), d3.max(layers, layer => d3.max(layer, d => d[1]))]);

    svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    .call(g => g.selectAll(".tick line, .domain").attr("stroke", "#d3d3d3")) // Set X-axis line and ticks to light gray
    .call(g => g.selectAll(".tick text").attr("fill", "#d3d3d3")); // Set X-axis text to light gray

      svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "area")
      .style("fill", ({key}) => color(key))
      .attr("d", area)
      .on('mouseover', (event, d) => {
        // 更新并显示 tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", 1);
  
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        const year = x.invert(d3.pointer(event, this)[0]).getFullYear();
        const yearData = filteredData.find(data => data.Year.getFullYear() === year);
        let content = `<strong>Year: ${year}</strong><br/>`;
        if (yearData) {
          albumNames.forEach(album => {
            if (yearData[album] !== undefined) {
              content += `${album}: ${yearData[album]}<br/>`;
            }
          });
        }
  
        tooltip.html(content)
          .style("left", `${mouseX}px`)
          .style("top", `${mouseY}px`);
      })
      .on('mouseout', () => {
        // 隐藏 tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
    
      });

// 计算图例位置
const legendMarginTop = 10; // 图表与图例之间的间距

const chartBottom = height + margin.top + margin.bottom;
const legendYStart = chartBottom + legendMarginTop; // 图例开始的Y坐标

// 添加图例容器
const legend = svg.append("g")
  .attr("transform", `translate(${margin.left},${legendYStart})`);

// 计算每个图例项的宽度，这里简单地用总宽度除以专辑数目，也可以根据实际需要调整
const legendItemWidth = width / albumNames.length;

// 为每个专辑创建图例项
albumNames.forEach((albumName, index) => {
  const legendItem = legend.append("g")
    .attr("transform", `translate(${index * legendItemWidth},0)`);

  legendItem.append("rect")
    .attr("x", 0)
    .attr("width", 15) // 小方块的大小
    .attr("height", 15)
    .attr("fill", color(albumName));

  legendItem.append("text")
    .attr("x", 22) // 文字与小方块的距离
    .attr("y", 5) // 文字位置的微调
    .attr("dy", "0.35em") // 垂直居中的微调
    .text(albumName)
    .attr("fill", "White"); // 将文字颜色设置为灰色
});

  };

  return (
    <>
    <svg id="myStreamgraph" width="1400" height="200"></svg>
    {tooltip.display && (
      <div
        style={{
          position: 'absolute',
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          backgroundColor: 'white',
          border: '1px solid black',
          padding: '10px',
          pointerEvents: 'none',
          zIndex: 100
        }}
        dangerouslySetInnerHTML={{ __html: tooltip.content }}
      ></div>
    )}
  </>
  );
};

export default Streamgraph;
