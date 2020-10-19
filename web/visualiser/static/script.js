var mymap = L.map('mainmap').setView([52.9717752,0.7342873], 15);
L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(mymap);
// 14/5339/8225.png
function getRandomColor() {
var letters = '0123456789ABCDEF';
var color = '#';
for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
}
    return color;
}
function highlight(e){
    e.target.setStyle({color:"#000000"})
}
$.ajax("query",{
    data:{key:"windsurf"},
    success:function(res){
        res.forEach(element => {
            latlng = element.map(point => [point.lat,point.long]);
            L.polyline(latlng, {color:getRandomColor()}).on({mouseover: highlight}).addTo(mymap);
        });
        console.log(res);
    }
})