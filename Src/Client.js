"use strict";
let Net = require('net');
let EventEmitter = require('events').EventEmitter;
class Client extends EventEmitter{
  constructor(Path){
    super();
    this.Path = Path;
  }
  // Public
  connect(Callback){
    let Me = this;

    this.Socket = Net.createConnection(this.Path, function(){
      Callback();
    });
    this.Socket.setEncoding("utf8");
    this.Socket.on('data', function(Data){
      Data.split("\n").forEach(function(Raw){
        if(Raw.length === 0) return ;
        let Chunk;
        try {
          Chunk = JSON.parse(Raw);
        } catch(err){return console.error(err)}
        Me.handleRequest(Chunk);
      })
    });
  }
  // Internal
  handleRequest(Data){
    if(!Data.Type) return ;
    if(Data.Type === 'Request'){
      Data.Result = null;
      this.emit(Data.SubType, Data.Message, Data);
      this.emit("All", Data.Message, Data);
    } else if(Data.Type === 'Broadcast'){
      this.emit(Data.SubType, Data.Message, Data);
      this.emit("All", Data.Message, Data);
    } else if(Data.Type === 'Reply'){
      this.emit(`JOB:${Data.ID}`, Data.Message);
    }
  }
  // Public
  Broadcast(Type, Message){
    Message = Message || '';
    this.Socket.write(JSON.stringify({Type: 'Broadcast', SubType: Type, Message: Message}), "utf8");
    return this;
  }
  // Public
  Request(Type, Message){
    Message = Message || '';
    let Me = this;
    return new Promise(function(Resolve){
      let JobID = (Math.random().toString(36)+'00000000000000000').slice(2, 7+2);
      Me.once(`JOB:${JobID}`, Resolve);
      Me.Socket.write(JSON.stringify({Type: 'Request', SubType: Type, Message: Message, ID: JobID}), "utf8");
    });
  }
  // Public
  Finished(Job){
    this.Socket.write(JSON.stringify({Type: 'Reply', ID: Job.ID, Message: Job.Result}), "utf8");
  }
}
module.exports = Client;