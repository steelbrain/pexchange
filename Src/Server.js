"use strict";
let Net = require('net');
let FS = require('fs');
let EventEmitter = require('events').EventEmitter;
class Server extends EventEmitter{
  constructor(Path){
    super();
    if(FS.existsSync(Path)){
      FS.unlinkSync(Path);
    }
    this.Server = Net.createServer(this.onConnection.bind(this));
    this.Server.listen(Path);
    this.Connections = []
  }
  // Internal
  onConnection(Socket){
    let Me = this;
    this.Connections.push(Socket);
    Socket.setEncoding("utf8");
    Socket.on('close', function(){
      Me.Connections.splice(Me.Connections.indexOf(Socket), 1);
    });
    Socket.on('data', function(Data){
      Data.split("\n").forEach(function(Raw){
        if(Raw.length === 0) return ;
        let Chunk;
        try {
          Chunk = JSON.parse(Raw);
        } catch(err){return console.error(err)}
        Me.handleRequest(Chunk, Socket);
      });
    });
    this.emit('Internal:Connection', Socket);
  }
  // Internal
  handleRequest(Data, Socket){
    if(!Data.Type) return ;
    Data.Socket = Socket;
    if(Data.Type === 'Request'){
      Data.Result = '';
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
  Broadcast(Type, Message, Socket){
    Socket = Socket || this.Connections[0];
    Message = Message || '';
    Socket.write(JSON.stringify({Type: 'Broadcast', SubType: Type, Message: Message}), "utf8");
    return this;
  }
  // Public
  Request(Type, Message, Socket){
    Socket = Socket || this.Connections[0];
    Message = Message || '';
    let Me = this;
    return new Promise(function(Resolve){
      let JobID = (Math.random().toString(36)+'00000000000000000').slice(2, 7+2);
      Me.once(`JOB:${JobID}`, Resolve);
      Socket.write(JSON.stringify({Type: 'Request', SubType: Type, Message: Message, ID: JobID}), "utf8");
    });
  }
  // Public
  Finished(Job){
    Job.Socket.write(JSON.stringify({Type: 'Reply', ID: Job.ID, Message: Job.Result}), "utf8");
  }
}
module.exports = Server;