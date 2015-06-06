"use strict";
var Server = require("../Src/Server");
var Instance = new Server('/tmp/pexchange.sock');

Instance.on('Ping', function(Request, Job){
  Job.Result = 'Pong';
  Instance.Finished(Job);
});