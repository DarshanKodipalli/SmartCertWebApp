var express = require('express'),
  getRoutes = require('./routes/routeController.js'),
  config = require("./Config/Config"),
  bodyparser = require('body-parser'),
  mongoose = require("mongoose"),
  test = require("./test/apptest"),
  fileUpload = require('express-fileupload'),
  https = require("https"),
  fs = require("fs");

var app = express();
var router = express.Router();
var sslOptions = {
  key:fs.readFileSync("key.pem","utf8"),
  cert:fs.readFileSync("cert.pem","utf8"),
  passphrase:"xanbellraremile"
};

mongoose.Promise = require('bluebird');
mongoose.connect(config.databaseUrls,{
  useMongoClient: true
});

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json({limit: '50mb'}));
app.use(fileUpload());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

getRoutes.assign(router);
test.assign(router);
app.use("/",router);

https.createServer(sslOptions,app).listen(config.port,function () {
  console.log('App listening on port '+ config.port);
});
