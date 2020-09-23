var express = require("express");
var bodyParser = require('body-parser')

var app = express();

// app.use( bodyParser.json() );       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// })); 
app.use(bodyParser.json({limit: '50mb',parameterLimit:1000000000}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:1000000000}));
// app.use(bodyParser());
app.use(express.static("public"));
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://"+process.env.USER+":"+process.env.PASS+"@"+process.env.HOST+"?retryWrites=true&w=majority";
var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(function(err, client){
  
  var collection = client.db("logs").collection("traces");
  // perform actions on the collection object
  app.get("/mongotest", function(req, resp){
    collection.insertOne({
      "ya":"yeet"
    }, function(err, res){
      if (err) throw err;
      console.log(res.ops[0]._id);
    });
    resp.send("yeet")
  });
  app.post("/createsesh", function(req, resp){
    console.log(req.body)    //check if key is unique, iff not respond with error, or otherwise
    //simply need to use the _id field and then use insertone
    //if unique add a new thing to the mongodb
    // resp.send("hi");
    // mongo "mongodb+srv://skip0.gwzut.mongodb.net/logs" --username glitch 
    collection.insertOne({
      _id:req.body.key,
      trace:[],
      totaldistance:req.body.data.totaldistance,
      topspeed:req.body.data.totaldistance,
      accel:[],
      gyro:[]
    }, function(err, res){
      if(err){
        // console.log(err);
        resp.sendStatus(400,{error:"there was an error! - key probably already existed"});
      }else{
        // // console.log(err);
        // console.log(res);
        resp.sendStatus(200);
      }
    });
    
  });
  
  app.post("/update", function(req, resp){
    //check that the key is in the dataset, if not just make a new one, if so overwrite data with new data
    //can just use updateOne as I don't care about multiple access to same datapoint and I'm probably overwriting the whole thing 99% of the time
    collection.updateOne({
      _id:req.body.key},{$set:{
      trace:req.body.data.trace,
      totaldistance:req.body.data.totaldistance,
      topspeed:req.body.data.totaldistance,
      accel:req.body.data.accel,
      gyro:req.body.data.gyro 
    }}, function(err, res){
    // resp.send("hi");
      if(err){
        // console.log(err);
        resp.sendStatus(400,{error:"there was an error! - key probably didn't exist"});
      }else{
        // // console.log(err);
        // console.log(res);
        resp.sendStatus(200);
      }
    });
  });
  app.post("/append",function(req, resp){
    //generally the same as /update, but here we just want to append so must use findAndModify instead I think
    //I don't think I need to implement this yet (I do)
    console.log(req.body.data.accel.length);
    collection.updateOne({
      _id:req.body.key},{$push:{
                          trace:{$each:req.body.data.trace},
                          accel:{$each:req.body.data.accel},
                          gyro:{$each:req.body.data.gyro}
                          },
                         $set:{
                           totaldistance:req.body.data.totaldistance,
                           topspeed:req.body.data.totaldistance,
                         }
                        }, function(err, res){
    // resp.send("hi");
      if(err){
        // console.log(err);
        resp.sendStatus(400,{error:"there was an error! - key probably didn't exist"});
      }else{
        // // console.log(err);
        // console.log(res);
        resp.sendStatus(200);
      }
    });
    
  });
  
});
module.exports = app;