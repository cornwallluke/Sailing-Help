if (location.protocol != "https:") {
    location.href =
      "https:" +
      window.location.href.substring(window.location.protocol.length);
  }
  var renderer = null;
  var torender = false;
  var parameters = {
    start_time: new Date().getTime(),
    time: 0,
    screenWidth: 0,
    screenHeight: 0,
    alpha: 0,
    beta: 0,
    gamma: 0,
    hset: 0,
    level: glMatrix.mat4.create(),
    rolloff: glMatrix.mat4.create(),
    pitchoff: glMatrix.mat4.create(),
    headingoff: glMatrix.mat4.create(),
    headingoff2: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    speed: 0,
    location: {
      lat:0,
      long:0,
      acc:0,
      timestamp:0
    },
  };
  var tripData = {
    trace:[
      //{"lat":, "long":, "acc":, "time":, "head":, "roll":, "pitch":}
    ],
    totaldistance:0,
    topspeed:0,
    accel:[],
    gyro:[]
  }
  var speedqueue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  function rollingspeed(newspeed){
    speedqueue.push(newspeed);
    speedqueue.shift();
    return speedqueue.reduce((a,b)=>a+b, 0);;
  }
  window.onload = function() {
    // Check if is IOS 13 when page loads.
    // window.alert("onload");
    setgps();
    renderer = new cuberenderer($("#calibratecanvas")[0]);
    // console.log(renderer);
    $("#canvasmodal").on("hidden.bs.modal", function(e){
      torender = false;
    });
    $("#canvasmodal").on("shown.bs.modal", function(e){
      renderer.render(0,0,0);
      
    });
    // $("#tripkey").on("submit", function(e){
    //   console.log("yeye");
    //   upload();
    //   e.preventDefault();
    // })
    $("#forms").submit(function(e){
      console.log("yeye");
      upload();
      // e.preventDefault();
      e.preventDefault();
    });
    $("#calibratecanvas").click(function(e){
      // console.log(parameters.headingoff);
      adjustheading(10*(e.originalEvent.layerX)/e.target.width-5);
      // glMatrix.vec3.rotateZ(parameters.headingoff, parameters.headingoff, glMatrix.vec3.create(),1*(e.originalEvent.layerX)/e.target.width-0.5);
      // leveloffsets();
    });
    $("#levelbut").click(calibrate);
    $("#gpsbut").click(setgps);
    
    // $("#headingbut").click(headingoffsets);
    if (
      window.DeviceMotionEvent &&
      typeof window.DeviceMotionEvent.requestPermission === "function"
    ) {
      // Everything here is just a lazy banner. You can do the banner your way.
      // const banner = document.createElement('div')
      // banner.innerHTML = `<div style="z-index: 1; position: absolute; width: 100%; background-color:#000; color: #fff"><p style="padding: 10px">Click here to enable DeviceMotion</p></div>`
      $("#permissionmodal").modal("show");
      $("#permitbut").click(ClickRequestDeviceMotionEvent); // You NEED to bind the function into a onClick event. An artificial 'onClick' will NOT work.
      
      // document.querySelector('body').appendChild(banner)
      // document.getElementById("permitbut").onclick = ClickRequestDeviceMotionEvent;
    } else {
      listeners();
    }
  };
  function latlongdist(lat1, lon1, lat2, lon2){
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  }
  var watchId = null;
  function tripreset(){
    numposition = 5;
    tripData = {
      trace:[
        //{"lat":, "long":, "acc":, "time":, "head":, "roll":, "pitch":}
      ],
      totaldistance:0,
      topspeed:0,
      accel:[],
      gyro:[]
    }
  }
  function setgps(){
    numposition = 5;
    if(watchId != null){
      navigator.geolocation.clearWatch(watchId);
    }
    watchId = navigator.geolocation.watchPosition(handlePos, err =>{
                                                          window.alert("denied")
                                                        },
                                                        {timeout:1000, enableHighAccuracy:true});
  }
  function calibrate(){
    // parameters.headingoff2 = 0;
    leveloffsets();
    $("#canvasmodal").modal("show");
    
    torender = true;
    renderer.render(0, 0, 0);
    return 0;
  }
  function leveloffsets() {
    // parameters.aoff = -parameters.alpha;
    // parameters.boff = -parameters.beta;
    // parameters.goff = -parameters.gamma;
    parameters.headingoff2 = 0;
    let ident = glMatrix.mat4.create();
    let rota = glMatrix.mat4.create();
    let rotb = glMatrix.mat4.create();
    let rotg = glMatrix.mat4.create();
    glMatrix.mat4.rotateZ(rotg, ident, -parameters.alpha * Math.PI/180); //parameters.alpha
    glMatrix.mat4.rotateX(rotb, ident, -parameters.beta * Math.PI/180);
    glMatrix.mat4.rotateY(rota, ident, -parameters.gamma * Math.PI/180);
    
    glMatrix.mat4.multiply(rotb, rotb, rotg);
    glMatrix.mat4.multiply(rota, rota, rotb); 
    parameters.level = rota;
    parameters.rolloff = glMatrix.vec3.fromValues(1, 0, 0);
    parameters.pitchoff = glMatrix.vec3.fromValues(0, 0, 1);
    parameters.headingoff = glMatrix.vec3.fromValues(0, 1, 0);
    glMatrix.vec3.transformMat4(parameters.rolloff, parameters.rolloff, rota);
    glMatrix.vec3.transformMat4(parameters.pitchoff, parameters.pitchoff, rota);
    glMatrix.vec3.transformMat4(parameters.headingoff, parameters.headingoff, rota);
    
    // parameters.rolloff = -parameters.roll;
    // parameters.pitchoff = -parameters.pitch;
    // parameters.headingoff = -parameters.alpha;
    
    
    return 0;
  }
  function adjustheading(trim){
    // window.alert("ey");
    let ident = glMatrix.mat4.create();
    let trimming = glMatrix.mat4.create();
    parameters.headingoff2-=trim;
    glMatrix.mat4.rotateZ(trimming, ident, trim * 0.0174532925199); //parameters.alpha 
    glMatrix.mat4.multiply(parameters.level, parameters.level, trimming);
    parameters.rolloff = glMatrix.vec3.fromValues(1, 0, 0);
    parameters.pitchoff = glMatrix.vec3.fromValues(0, 0, 1);
    parameters.headingoff = glMatrix.vec3.fromValues(0, 1, 0);
    glMatrix.vec3.transformMat4(parameters.rolloff, parameters.rolloff, parameters.level);
    glMatrix.vec3.transformMat4(parameters.pitchoff, parameters.pitchoff, parameters.level);
    glMatrix.vec3.transformMat4(parameters.headingoff, parameters.headingoff, parameters.level);
  }
  // function headingoffsets() {
  //   parameters.hset = 1 - parameters.hset;
  // }
  // function updateheadingoff() {
  //   parameters.headingoff++;
  //   // parameters.headingoff = -parameters.alpha;
  // }
  
  function ClickRequestDeviceMotionEvent() {
    window.DeviceMotionEvent.requestPermission()
      .then(response => {
        // window.alert(response);
        if (response === "granted"){
          listeners();
          $("#permissionmodal").modal("hide");
        } else {
          console.log("DeviceMotion permissions not granted.");
        }
        
      })
      .catch(e => {
        console.error(e);
      });
  }
  function listeners() {
    $(".permit").addClass("d-none");
    window.addEventListener("devicemotion", handleMotion, true);
    window.addEventListener("deviceorientation", handleOrient, true);
  }
  var numposition = 3;
  // var speed = 0;
  function handlePos(position){
    // $("#heading").text(Math.atan((pitcht[0])/(pitcht[1]))*180/Math.PI);
    console.log(position);
    parameters.location.lat = position.coords.latitude;
    parameters.location.long = position.coords.longitude;
    parameters.location.acc = position.coords.accuracy;
    parameters.location.timestamp = position.timestamp
    $("#accuracy").text("Accuracy: "+parameters.location.acc.toFixed(1)+"m");
    if(!numposition && parameters.location.acc < 100){
      
      if(tripData.trace.length>1){
        parameters.speed = rollingspeed(latlongdist(parameters.location.lat,
                                               parameters.location.long,
                                               tripData.trace[tripData.trace.length-2].lat,
                                               tripData.trace[tripData.trace.length-2].long)/
                                               (parameters.location.timestamp-tripData.trace[tripData.trace.length-2].time)*1000);
        $("#inst").text((parameters.speed * 1.94384).toFixed(3)+"Kn");
      }
      storedata();
      $("#topspeed").text((tripData.topspeed * 1.94384).toFixed(3)+"Kn")
      $("#average").text((tripData.totaldistance).toFixed(3)+"m");
      $("#latitude").text("Latitude: "+parameters.location.lat);
      $("#longitude").text("Longitude:"+parameters.location.long);
      // $("#heading").text("Heading " + (parameters.heading  ).toFixed(3)+ " degrees"); //I think that this is just correct, use to rotate a horizontal vector, rotate and measure angle
      // $("#pitch").text("Pitch " + parameters.pitch.toFixed(3) + " degrees"); //(90-Math.abs(.toFixed(3));
      // $("#roll").text("Heel " + parameters.roll.toFixed(3) + " degrees"); //((90-Math.abs()*).toFixed(3));
      
    }else{
      numposition-=numposition>0*1;
    }
  }
  function storedata(){
    
    if(tripData.trace.length>0){
      if(tripData.trace[tripData.trace.length-1].timestamp != parameters.location.timestamp){
        let dist = latlongdist(parameters.location.lat,
                                                  parameters.location.long,
                                                  tripData.trace[tripData.trace.length-1].lat,
                                                  tripData.trace[tripData.trace.length-1].long);
        tripData.totaldistance += dist;
        tripData.topspeed = Math.max(tripData.topspeed, parameters.speed);//dist/(parameters.location.timestamp-tripData.trace[tripData.trace.length-1].time));
        tripData.trace.push(
        {"lat":parameters.location.lat,
          "long":parameters.location.long,
          "acc":parameters.location.acc,
          "time":parameters.location.timestamp,
          "head":parameters.heading,
          "roll":parameters.roll,
          "pitch":parameters.pitch,
        });
      }
      
    }else{
      tripData.trace.push(
        {"lat":parameters.location.lat,
          "long":parameters.location.long,
          "acc":parameters.location.acc,
          "time":parameters.location.timestamp,
          "head":parameters.heading,
          "roll":parameters.roll,
          "pitch":parameters.pitch,
        });
    }
    if(unique){
      try{
        upappend();
      }catch(err){
        console.log("there was an error");
      }
    }
    
  }
  var unique = false;
  function upload(){
    try{
      $.post("/createsesh", {key:$("#tripkey").val(), data: {
      trace:[,
        //{"lat":, "long":, "acc":, "time":, "head":, "roll":, "pitch":}
      ],
      totaldistance:0,
      topspeed:0,
      accel:[,],
      gyro:[,]
    }},function(res){
        console.log(res);
        $("#disconnect").addClass("d-none");
        unique = true;
      }).fail(function(err){
        console.log(err);
        $("#disconnect").removeClass("d-none");
        unique = false;
      });
      
    }catch(err){
      console.log("fail does not prevent error!");
      
      $("#disconnect").removeClass("d-none");
    }
  }
  function update(){
    try{
      $.post("/update", {key:$("#tripkey").val(), data:tripData},function(res){
        console.log(res);
      }).fail(function(err){
        console.log(err);
        $("#disconnect").removeClass("d-none");
      });
      $("#disconnect").addClass("d-none");
    }catch(err){
      console.log(err);
      $("#disconnect").removeClass("d-none");
    }
  }
  var lasttracelen = 0, tracebuf = 0;
  var lastgyrolen = 0, gyrobuf = 0;
  var lastaccellen = 0, accelbuf = 0;
  function upappend(){
    try{
      tracebuf = tripData.trace.length;
      gyrobuf = tripData.gyro.length;
      accelbuf = tripData.accel.length;
      $.post("/append", {key:$("#tripkey").val(), data:{
      trace:tripData.trace.slice(lasttracelen, tripData.trace.length),
      totaldistance:tripData.totaldistance,
      topspeed:tripData.topspeed,
      accel:tripData.accel.slice(lastaccellen, tripData.accel.length),
      gyro:tripData.gyro.slice(lastgyrolen, tripData.gyro.length)
    }},function(res){
        console.log(res);
        lasttracelen = tracebuf;
        lastgyrolen = gyrobuf;
        lastaccellen = accelbuf;
      }).fail(function(err){
        console.log(err);
        $("#disconnect").removeClass("d-none");
      });
      $("#disconnect").addClass("d-none");
    }catch(err){
      console.log(err);
      $("#disconnect").removeClass("d-none");
    }
  }
  function process(){
    
  }
  function handleMotion() {
    tripData.accel.push([event.acceleration.x, event.acceleration.y, event.acceleration.z, Date.now()]);
    // $("#a").text(event.acceleration.x);
    // $("#b").text(event.accelerationIncludingGravity.y);
    // $("#gamma").text(event.accelerationIncludingGravity.z);
  }
  var first = true;
  function handleOrient(event) {
    if(first){
      leveloffsets();
      first = false;
    }
    // let alpha = event.alpha* 0.0174532925199;
    // let beta = event.beta* 0.0174532925199;
    // let gamma = event.gamma* 0.0174532925199;
    parameters.alpha = event.alpha;
    parameters.beta = event.beta;
    parameters.gamma = event.gamma;
    tripData.gyro.push({"alpha":event.alpha, "beta":event.beta, "gamma":event.gamma, time:Date.now()});
    // console.log("yeet");
    let ident = glMatrix.mat4.create();
    let rota = glMatrix.mat4.create();
    let rotb = glMatrix.mat4.create();
    let rotg = glMatrix.mat4.create();

    glMatrix.mat4.rotateZ(rotg, ident, (parameters.alpha+parameters.headingoff2) * Math.PI/180); //parameters.alpha//parameters.headingoff
    glMatrix.mat4.rotateX(rotb, ident, parameters.beta * Math.PI/180);
    glMatrix.mat4.rotateY(rota, ident, parameters.gamma * Math.PI/180);
    
    glMatrix.mat4.multiply(rotb, rotb, rota);
    glMatrix.mat4.multiply(rotg, rotg, rotb); //rotation was in wrong order, want to go from global to intrinsic not opposite

    // glMatrix.mat4.rotateZ(rota, ident, (parameters.alpha) * 0.0174532925199); //parameters.alpha
    // glMatrix.mat4.multiply(rotg, rota, rotg);

    // let roll = glMatrix.vec3.fromValues(-1,0,0);
    // let pitch = glMatrix.vec3.fromValues(0,1,0);
    // let yaw = glMatrix.vec3.fromValues(0,0,1);
    let rollt = glMatrix.vec3.fromValues(1, 0, 0);
    let pitcht = glMatrix.vec3.fromValues(0, 0, 1);
    let yawt = glMatrix.vec3.fromValues(0, 1, 0);
    // glMatrix.vec3.transformMat4(rollt, parameters.rolloff, rotg);
    // glMatrix.vec3.transformMat4(pitcht, parameters.pitchoff, rotg);
    glMatrix.vec3.transformMat4(yawt, parameters.headingoff, rotg);
    // console.log(yawt);
    parameters.heading = Math.atan(yawt[1] / (-yawt[0])) * 180/Math.PI + 90 + (yawt[0]<0?180:0);
    
    
    glMatrix.mat4.rotateZ(rota, ident, (parameters.heading) * Math.PI/180); //parameters.alpha
    glMatrix.mat4.multiply(rotg, rota, rotg);
    // glMatrix.mat4.rotateZ(rotg, rotg, (-parameters.alpha) * 0.0174532925199); //parameters.alpha
    glMatrix.vec3.transformMat4(pitcht, parameters.pitchoff, rotg);
    parameters.pitch = Math.atan(pitcht[1] / pitcht[2]) * 180/Math.PI;
    
    // glMatrix.mat4.rotateX(rota, ident, (-parameters.pitch) * 0.0174532925199); //parameters.alpha
    // glMatrix.mat4.multiply(rotg, rotg, rota);
    
    glMatrix.vec3.transformMat4(rollt, parameters.rolloff, rotg);
    parameters.roll = Math.atan(rollt[2] / rollt[0]) * 180/Math.PI;
    
    
    // let roll = (parameters.roll + parameters.rolloff) % 360;
    // let pitch = parameters.pitch + parameters.pitchoff;
    // let heading = (parameters.alpha + parameters.headingoff) % 360;
    if (torender) {
      renderer.render(0, -parameters.roll, parameters.pitch);//minus pitch instead of last param
    }
    // $("#heading").text(Math.atan((pitcht[0])/(pitcht[1]))*180/Math.PI);
    $("#heading").text("Heading " + (parameters.heading  ).toFixed(3)+ " degrees"); //I think that this is just correct, use to rotate a horizontal vector, rotate and measure angle
    // $("#pitch").text(pitcht[0].toFixed(2)+" "+pitcht[1].toFixed(2)+" "+pitcht[2].toFixed(2)+" ");//(parameters.beta+parameters.boff).toFixed(5));
    // $("#roll").text(rollt[0].toFixed(2)+" "+rollt[1].toFixed(2)+" "+rollt[2].toFixed(2)+" ");//(parameters.gamma+parameters.goff).toFixed(5));//(Math.cos(alpha)*gamma+Math.sin(alpha)*beta)*180/Math.PI);//);
    $("#pitch").text("Pitch " + parameters.pitch.toFixed(3) + " degrees"); //(90-Math.abs(.toFixed(3));
    $("#roll").text("Heel " + parameters.roll.toFixed(3) + " degrees"); //((90-Math.abs()*).toFixed(3));
  }