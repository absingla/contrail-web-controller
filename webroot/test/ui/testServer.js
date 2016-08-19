
var express = require('express');
var app = express();
var http = require("http");
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var nock = require('nock');


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// hook to initialize the dynamic route at runtime
app.post('/api/dynamic', function(req,res){
    console.log("api call made...."+req.body.mockDataFile);
    var mockDataFile = req.body.mockDataFile;
    var responses = req.body.responses;

    var dynamicController = require('./routes.js');
    dynamicController.init(app, responses, mockDataFile);
    res.status(200).send();
});

console.log("Listening on port"+9090);
app.listen(9090);

