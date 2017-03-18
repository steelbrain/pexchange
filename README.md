PExchange
==========

[![Greenkeeper badge](https://badges.greenkeeper.io/steelbrain/pexchange.svg)](https://greenkeeper.io/)

PExchange is a promise based information exchange for Node. It allows different processes to communicate with each other.

#### Benefits

PExchange provides you an extremely easy to use API, that can be extended to make applications written in different languages talk to each other. It just works, there's no complicated setup or stuff, You just run it on a port or a unix socket and connect your programs to it.

You can easily set it up to send emails and other stuff from a nodejs thread while serving your non-blocking website from PHP or HackLang or any other language of your choice.

#### Hello World

```js
// Server.js
"use strict";
var PExchange = require("pexchange");
var Server = new PExchange.Server('/tmp/pexchange.sock');

Server.on('Ping', function(Request, Job){
  Job.Result = 'Pong';
  Server.Finished(Job);
});
```
```js
// Client.js
var PExchange = require("pexchange");
var Client = new PExchange.Client('/tmp/pexchange.sock');

Client.connect(function(){
  Client.Request("Ping").then(function(Response){
    console.log(Response); // "Pong"
  });
});
```

#### API

```js
enum JobType:string{
  Request, Reply, Broadcast
}
type ServerJob = shape( Type:JobType, SubType:String, Message:String, ID:String, Socket:Net.Socket )
type ClientJob = shape( Type:JobType, SubType:String, Message:String, ID:String )
class ExchangeServer extends EventEmitter{
  Server: Net.Server
  Connections: array<Net.Socket>
  on(Type:String, Callback:function(Job:ServerJob))
  Broadcast(Type:String, Message:String, ?Socket:Net.Socket):this
  Request(Type:String, Message:String, ?Socket:Net.Socket):Promise<String>
  Finished(Job)
}
class ExchangeClient extends EventEmitter{
  on(Type:String, Callback:function(Job:ClientJob))
  Broadcast(Type:String, Message:String, ?Socket:Net.Socket):this
  Request(Type:String, Message:String, ?Socket:Net.Socket):Promise<String>
  Finished(Job)  
}
```

#### License

This project is licensed under the terms of MIT License. See the License file for more info.