import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const MyD3Component = ({minValue, maxValue}) => {
  const [loadedData, setLoadedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPerPage, setNumPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const processData = (data, setLoadedData, setCurrentPage, setTotalPages, numPerPage, currentPage) => {
    const countsByCountryAlbum = d3.rollups(data, 
      vs => d3.rollup(vs, vv => vv.length, d => d.Album),
      d => d['Artist Country']
    );

    let preparedData = countsByCountryAlbum.map(([country, albums]) => {
      let entry = { country: country };
      let total = 0;
      albums.forEach((count, album) => {
        entry[album] = count;
        total += count;
      });
      entry.total = total;
      return entry;
    });

    preparedData.sort((a, b) => b.total - a.total);

    setTotalPages(Math.ceil(preparedData.length / numPerPage));

    updateData(preparedData, setLoadedData, numPerPage, currentPage);
  };

  const updateData = (preparedData, setLoadedData, numPerPage, currentPage) => {
    const start = currentPage * numPerPage;
    const paginatedData = preparedData.slice(start, start + numPerPage);

    let albums = new Set(preparedData.flatMap(d => Object.keys(d).filter(k => k !== 'country' && k !== 'total')));
    let stack = d3.stack().keys([...albums]);
    let stackedData = stack(paginatedData);

    setLoadedData(stackedData);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await d3.json(`${process.env.PUBLIC_URL}/database.json`);
      const filteredData = data.filter(item => item['Release year'] >= minValue && item['Release year'] <= maxValue);
      processData(filteredData, setLoadedData, setCurrentPage, setTotalPages, numPerPage, currentPage);
    };

    fetchData();
  }, [minValue, maxValue, currentPage]);

  useEffect(() => {
    if (loadedData.length > 0) {
      drawChart();
    }
  }, [loadedData]);

  const nextPage = () => {
    setCurrentPage(current => Math.min(current + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage(current => Math.max(current - 1, 0));
  };

  const drawChart = () => {

    d3.select("#myD3Chart").selectAll("*").remove();
    
    const svg = d3.select("#myD3Chart");
    svg.selectAll("*").remove();
  
    const margin = {top: 60, right: 20, bottom: 60, left: 20},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom,
          x = d3.scaleBand().rangeRound([0, width]).padding(0.4),
          y = d3.scaleLinear().rangeRound([height, 0]),
          z = d3.scaleOrdinal(d3.schemeCategory10);
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("padding", "10px")
      .style("background", "white")
      .style("border", "1px solid #cccccc")
      .style("border-radius", "5px")
      .style("pointer-events", "none");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const albumOrder = [
      "Ring Ring", "Waterloo", "ABBA", "Arrival", 
      "The Album", "Voulez-Vous", "Super Trouper", "The Visitors"
    ];

    x.domain(loadedData[0].map(d => d.data.country));
    y.domain([0, d3.max(loadedData, d => d3.max(d, d => d.data.total))]);
    z.domain(albumOrder);

    // Adjusting X and Y axis font color to white
    svg.append("style").text(`
      .axis text {
        fill: white;
      }
      .axis path,
      .axis line {
        stroke: white;
      }
    `);

    g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
        .ticks(6)
        .tickSize(-width)
        .tickFormat(d => d) // ??曄內??餃漲???
    )
    .selectAll(".tick line")
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("stroke-dasharray", "2,2")
    .style("opacity", 0) // 初始透明度?? 0
    .transition() // ?用?渡
    .duration(750) // ?渡??的持???，?位?毫秒
    .delay((d, i) => i * 100) // 每??延?不同的???始??，?造??出?的效果
    .style("opacity", 1); // 最?的透明度?? 1


    g.selectAll(".domain").remove(); // 蝘駁?方蓬蝥?



    const series = g.selectAll(".serie")
    .data(loadedData)
    .enter().append("g")
      .attr("fill", d => z(d.key));

      series.selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", d => x(d.data.country))
      
      .attr("width", x.bandwidth())
      .attr("y", height) // 初始化??置y??表的高度，使得矩形?底部?始
      .attr("height", 0) // 初始化??置高度?0
      // 下面?始???程
      .transition() // ?始一??渡
      .duration(750) // ?置??持???，?位?毫秒
      .attr("y", d => y(d[1])) // 最?的y位置
      .attr("height", d => y(d[0]) - y(d[1])) // 最?的高度
      .on("end", function() { // 在???束?添加交互
        d3.select(this)
          .on("mouseover", function(event, d) {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(`Country: ${d.data.country}<br>Total: ${d.data.total}<br>` + 
            `${Object.entries(d.data)
              .filter(([key]) => key !== 'country' && key !== 'total')
              .map(([key, value]) => `${key}: ${value}`)
              .join('<br>')}`)
          })
          .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX) + "px")
                   .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });
      });

    // Displaying total numbers above each bar
    const countries = loadedData[0].map(d => d.data.country);
    countries.forEach((country, index) => {
      const total = loadedData[0][index].data.total;
      g.append("text")
        .attr("x", x(country) + x.bandwidth() / 2)
        .attr("y", y(total) - 5)
        .attr("text-anchor", "middle")
        .text(total)
        .attr("fill", "white")
        .attr("opacity", 0) // 初始透明度? 0
        .transition() // ?用?渡
        .duration(750) // ?渡??的持???
        .attr("opacity", 1); // 最?透明度? 1
    });
    
    const xAxis = g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

// ?置 x ?的初始透明度? 0
xAxis.attr("opacity", 0)
  .transition() // ?用?渡
  .duration(750) // ?渡??的持???
  .attr("opacity", 1); // 最?透明度? 1

        const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.left},${height + margin.top + 40})`); // 撠???曆????曄蔭??冽?∪耦??曆?????

    const legendItem = legend.selectAll(".legend-item")
        .data(z.domain()) // 雿輻?券????脫??靘?撠箇???????亦???????曆??憿?
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 175}, -10)`); // 水平排列?例?

    legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z); // 雿輻?其????∪耦??曄?詨?????憸???脫??靘?撠?

    legendItem.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .attr("fill", "white") // 霈曄蔭?????祇????脖蛹??質??
        .text(d => d); // ??曄內銝?颲????蝘?


  };

  return (
    <>

  <svg id="myD3Chart" width="1400" height="200"></svg>
  <div className="chart-navigation" style={{ position: 'absolute', right: '5px', top: '5px' }}>
    <button onClick={prevPage} disabled={currentPage === 0} class="my-custom-button">Previous</button>
    <button onClick={nextPage} disabled={currentPage === totalPages - 1} class="my-custom-button">Next</button>
  </div>

    </>
  );
};

export default MyD3Component;
