d3.json("data/bar.json",function(data){
    var enrolled = data["Enrolled"].map((d) => parseInt(d));
    var target = data["Target"].map((d) => parseInt(d));
    var dates = data["Date"]
    var dt = {
        date:dates,
        enrolled:enrolled,
        target:target
    }
    console.log(dt);
    var bar = new BarChart("#bar",dt,"date","enrolled","Enrolled","time","linear")
})
// $("#bar-select").on("change",function(){
//     bar1.wrangleData("name",$("#var-select").val())
// })