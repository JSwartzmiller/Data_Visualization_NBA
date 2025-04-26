// Define constants and variables
const width = 800;
const height = 400;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

// Create SVG container
const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Data fetching and processing
d3.csv("data.csv").then(function(data) {
    // Data processing and cleaning

    // Scales and axes setup
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.value)])
        .nice()
        .range([height, 0]);

    // Axes setup
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .call(yAxis);

    // Data visualization (e.g., bar chart)
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.category))
        .attr("y", d => yScale(+d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(+d.value))
        .attr("fill", "steelblue")
        .on("mouseover", function(d) {
            // Tooltip or additional information on hover
            // Implement tooltip or console log for simplicity
            console.log(d);
        });
});
