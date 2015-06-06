"use strict";
var Client = require("../Src/Client");
var Instance = new Client('/tmp/pworker-worker.sock');

Instance.connect(function(){
  Instance.Request("Ping").then(function(Response){
    console.log(Response === 'Pong'); // true
  });
});