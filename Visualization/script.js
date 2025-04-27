//chart dimensions and margins
const margin = { top: 40, right: 30, bottom: 50, left: 60 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

//load the data
d3.csv('clean_player_games.csv', d3.autoType).then(data => {
    //retrieve all unique team names in alphabetival order from data set
    const teams = [...new Set(data.map(d => d.Team))].sort();

    //initial values shown before user chooses
    let user_chosen_team = null;
    let user_chosen_player = null;
    let user_chosen_stat = "PTS";
    let baseline = null;
    let gameCount = 10;

    //selct all html elements
    const teamDropdown = d3.select("#teamSelect");
    const playerDropdown = d3.select("#playerSelect");
    const statDropdown = d3.select("#statSelect");
    const baselineInput = d3.select("#baselineInput");
    const gameCountSelect = d3.select("#gameCountSelect").property("value", gameCount);;

    //adjust chart with margins
    const svg = d3.select("#statSVG")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    //Get values for inside team dropdown with Select Team as inital placeholder value
    teamDropdown.append("option")
        .attr("value", "")
        .text("Select Team");
    teamDropdown.selectAll(null)
        .data(teams)
        .join("option")
        .attr("value", d => d)
        .text(d => d);

    //function to fill player dropdown based off team
    function updatePlayerDropdown(team) {
        //Clear the old inputs
        playerDropdown.html("");

        //add initial select player option
        playerDropdown.append("option")
            .attr("value", "")
            .text("Select Player");

        //fetch player names for specified team
        const players = [...new Set(data.filter(d => d.Team === team).map(d => d.Player))].sort();
        //add player names to the dropdown
        playerDropdown.selectAll(null)
            .data(players)
            .join("option")
            .attr("value", d => d)
            .text(d => d);

        
        user_chosen_player = null;    //clear last selected player
        updateChart();
    }

    //changes to the dashboard when a different option is selected
    teamDropdown.on("change", function() {
        user_chosen_team = this.value;
        updatePlayerDropdown(user_chosen_team); // change players for new selected team
    });
    playerDropdown.on("change", function() {
        user_chosen_player = this.value;
        updateChart();
    });
    statDropdown.on("change", function() {
        user_chosen_stat = this.value;
        updateChart();
    });
    baselineInput.on("input", function() {
        baseline = this.value === "" ? null : +this.value;
        updateChart();
    });
    gameCountSelect.on("change", function() {
        gameCount = +this.value;
        updateChart();
    });

    //function that creates the new bar chart with updated selected values
    function updateChart() {
        //remove previously made chart 
        svg.selectAll("*").remove();

        //only create graph if correct information is selected
        if (!user_chosen_team || !user_chosen_player) { 
            return; 
        }

        //filter dataset to only get players selected games
        const playerGames = data.filter(d => d.Team === user_chosen_team && d.Player === user_chosen_player);
        //only keep amount of games user chose
        const recentGames = playerGames.slice(-gameCount);

        //dynamically size the charts based on user number of games selceted
        let barWidth;
        if (recentGames.length <= 10) {
            barWidth = 75;
        } else if (recentGames.length <= 25) {
            barWidth = 35;
        } else {
            barWidth = 20;
        }
        //calculate the width based of number of games
        const totalWidth = recentGames.length * barWidth;

        //adjust width on graph
        d3.select("#statSVG")
            .attr("width", totalWidth + margin.left + margin.right);
        const x = d3.scaleBand()
            .domain(recentGames.map((d, i) => i))
            .range([0, totalWidth])
            .padding(0.2);
        const y = d3.scaleLinear()
            .domain([0, d3.max(recentGames, d => d[user_chosen_stat]) * 1.1])
            .range([height, 0]);

        //add axes to the newly formed chart
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => d + 1))
            .selectAll("text")
            .attr("fill", "white");   
        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("fill", "white");


        //import tooltips
        const tooltip = d3.select("#tooltip")

        //adjust bars on new chart with hover tooltip
        svg.selectAll("rect")
            .data(recentGames)
            .join("rect")
            .attr("x", (d, i) => x(i))
            .attr("y", d => y(d[user_chosen_stat]))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d[user_chosen_stat]))
            .attr("fill", d => (baseline !== null && d[user_chosen_stat] >= baseline) ? "#ff9900" : "steelblue")
            
            //tooltip appears on when mouse is hovering
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`${user_chosen_stat}: ${d[user_chosen_stat]}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY -28) + "px");
            })

            //tooltip follows mouse when moving across the page
            .on("mousemove", (event, d) => {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY -28) + "px");
            })

            //tooltip fades out on mouse movement
            .on("mouseout", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0);
            });

        //check if user added baseline feature
        if (baseline !== null) {
            //add baseline inside of graph
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", totalWidth)
                .attr("y1", y(baseline))
                .attr("y2", y(baseline))
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4 4");
        }
    }

});
