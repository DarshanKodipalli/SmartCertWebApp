/*jshint esversion: 6 */
var express    = require('express'),
    bodyParser = require('body-parser'),
    config     = require('./config/config'),
    routes     = require('./routes/route'),
    fs         = require("fs"),
  https        = require("https");


var app = express();
var router = express.Router();
var sslOptions = {
  key:fs.readFileSync("key.pem","utf8"),
  cert:fs.readFileSync("cert.pem","utf8"),
  passphrase:"xanbellraremile"
};

// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(function (req, res, next) {
    var allowedOrigins = ['http://localhost:4200',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:4201',
    'http://localhost:3003'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
routes.assign(router);
app.use('/',router);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

https.createServer(sslOptions,app).listen(config.port,function () {
  console.log('App listening on port '+ config.port);
});

