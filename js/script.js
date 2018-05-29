var topic = "Applications";
var metric = "Application Submitted(D)";
var filteredData;
var dt;
var linestates = ["Alabama", "Alaska"];
staticGraph(linestates)
function staticGraph(lnstates) {
    Plotly.d3.json('data/static.json', function (data) {
        var percents = data["Percent"].map((d) => parseInt(d))
        var states = data["State"]
        var statesf = Array.from(new Set(data["State"]));
        var traces = [];
        var dates = Array.from(new Set(data["Date"]))
        dates = dates.slice(dates.length - 4, dates.length)
        var dt = {}
        for (let key = 0; key < statesf.length; key++) {
            dt[statesf[key]] = []
        }
        for (let key = 0; key < percents.length; key++) {
            dt[states[key]].push(percents[key])
        }
        console.log(dates)
        for (let i = 0; i < linestates.length; i++) {
            state = linestates[i]
            var trace = {
                x:dates,
                y:dt[state].slice(dt[state].length - 4, dt[state].length),
                type:'scatter',
                name:state
            }
            traces.push(trace)  
        }
        Plotly.newPlot('line', traces)
    });
}
Plotly.d3.json('data/choropleth.json', function (data) {
    var topics = Array.from(Object.keys(data))
    for (let key = 0; key < topics.length; key++) {
        var opt = document.createElement("li");
        opt.innerHTML = topics[key];
        if (topics[key] == "Applications") {
            opt.classList.add("active")
        }
        opt.onclick = topicOnclick;
        opt.classList.add("list-group-item")
        document.getElementById("topic-select").appendChild(opt);
    }
    choro(topic, metric, linestates)
})

function choro(topic, metric, linestates) {
    Plotly.d3.json('data/choropleth.json', function (data) {
        function unpack(data, key) {
            return data.map((d) => d[key])
        }
        $("#metric-select").empty();
        var dlist = [];
        filteredData = data[topic];
        var metrics = new Set();
        metric = (metric == "") ? filteredData[0]["Metric"] : metric;
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i]["Metric"] == metric) {
                dlist.push(filteredData[i])
            }
            metrics.add(filteredData[i]["Metric"])
        }
        metrics = Array.from(metrics)
        for (let key = 0; key < metrics.length; key++) {
            var opt = document.createElement("li");
            if (metrics[key] == metric) {
                opt.classList.add("active")
            }
            opt.classList.add("list-group-item")
            opt.onclick = metricOnclick;
            opt.innerHTML = metrics[key];
            document.getElementById("metric-select").appendChild(opt);
        }
        var textarr = [];
        var states = unpack(dlist, 'State')
        var statesfil = new Set(states);
        statesfil = Array.from(statesfil);
        var shtp = unpack(dlist, 'Shop Type')
        var mde = unpack(dlist, 'Medical Expansion')
        var exc = unpack(dlist, 'Exchange')
        var values = unpack(dlist, 'Value');
        var dates = new Set(unpack(dlist, 'Date'))
        dates = Array.from(dates)
        var valsD = {}
        var vals = []
        $("#state-select").empty()
        for (let i = 0; i < statesfil.length; i++) {
            var li = document.createElement("li")
            li.innerHTML = statesfil[i];
            li.classList.add("list-group-item");
            if (linestates.includes(statesfil[i])) {
                li.classList.add("active")
            }
            li.onclick = stateOnClick;
            document.getElementById("state-select").appendChild(li)
            valsD[statesfil[i]] = [];
        }
        for (let i = 0; i < states.length; i++) {
            valsD[states[i]].push(values[i])
        }
        for (var i in valsD) {
            vals.push(valsD[i].reduce((a, b) => a + b))
        }
        for (let v = 0; v < statesfil.length; v++) {
            var st = "";
            st += "State: " + states[v] + "<br>"
            st += "Medical Expansion: " + mde[v] + "<br>"
            st += "Shop Type: " + shtp[v] + "<br>"
            st += "Exchange: " + exc[v] + "<br>"
            textarr.push(st)
        }
        var traces = [];
        for (let i = 0; i < linestates.length; i++) {
            var trace = {
                type: 'scatter',
                name: linestates[i],
                x: dates,
                y: valsD[linestates[i]]
            };
            traces.push(trace);
        }
        console.log(traces)
        // console.log(unpack(filteredData,"Value"))
        $("choropleth").empty();
        var data = [{
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: unpack(dlist, 'Code'),
            z: vals,
            text: textarr,
            zmin: 0,
            zmax: d3.max(dlist, (d) => d["Value"]),
            autocolorscale: true,
            showscale: false,
            hoverinfo: 'location+z+text',
            marker: {
                line: {
                    color: 'rgb(255,255,255)',
                    width: 2
                }
            }
        }]
        var layout = {
            title: 'Metric Data',
            geo: {
                scope: 'usa',
                showlakes: true,
                lakecolor: 'rgb(0,0,255)'
            }
        };
        Plotly.plot('choropleth', data, layout, {
            showLink: false
        });
        Plotly.newPlot('line2', traces)

    });
}
// $("#topic-select").on("change", function () {
//     topic = $("#topic-select").val();
//     metric = "";
//     choro(topic, metric);
// })
// $("#metric-select").on("change", function () {
//     topic = $("#topic-select").val();
//     metric = $("#metric-select").val();
//     choro(topic, metric);
// })
var tps = document.getElementById("topic-select").getElementsByTagName("li")

function topicOnclick() {
    topic = this.innerHTML;
    metric = ""
    for (let i = 0; i < tps.length; i++) {
        tps[i].classList.remove("active");
    }
    this.classList.add("active")
    choro(topic, metric, linestates)
}
var mps = document.getElementById("metric-select").getElementsByTagName("li")

function metricOnclick() {
    metric = this.innerHTML;
    for (let i = 0; i < mps.length; i++) {
        mps[i].classList.remove("active");
    }
    this.classList.add("active")
    choro(topic, metric, linestates)
}

var sps = document.getElementById("state-select").getElementsByTagName("li")

function stateOnClick() {
    linestates = []
    for (let k = 0; k < sps.length; k++) {
        if (sps[k].classList.contains("active")) {
            linestates.push(sps[k].innerHTML)
        }
    }
    if (!$(this).hasClass("active")) {
        if (!linestates.includes(this.innerHTML)) {
            linestates.push(this.innerHTML);
            $(this).addClass("active")
        }
    } else {
        $(this).removeClass("active")
        var index = linestates.indexOf(this.innerHTML)
        if (index > -1) {
            linestates.splice(index, 1);
        }
    }
    console.log(linestates)
    choro(topic, metric, linestates);
    staticGraph(linestates);
}