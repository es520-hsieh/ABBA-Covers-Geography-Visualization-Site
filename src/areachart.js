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
    
    const svg = d3.select("#myStreamgraph")
      .attr("viewBox", [0, 0, 1400, 200])
      .style("display", "block");

    const margin = { top: 10, right: 20, bottom: 30, left: 40 },
          width = 1400 - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom;

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
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "area")
      .style("fill", ({key}) => color(key))
      .attr("d", area)
      .on('mouseover', (event, d) => {
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        const year = x.invert(d3.pointer(event, this)[0] + margin.left).getFullYear();
        const yearData = filteredData.find(data => data.Year.getFullYear() === year);
        let content = `<strong>Year: ${year}</strong><br/>`;
        if (yearData) {
          albumNames.forEach(album => {
            if (yearData[album] !== undefined) {
              content += `${album}: ${yearData[album]}<br/>`;
            }
          });
        }
        setTooltip({
          display: true,
          content: content,
          x: mouseX,
          y: mouseY
        });
      })
      .on('mouseout', () => {
        setTooltip({
          display: false,
          content: '',
          x: 0,
          y: 0
        });
      });


    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.select(".domain").remove());
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
