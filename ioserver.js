var http = require("http");
var io= require("socket.io"); 
var fs = require("fs");
var indexHtml = fs.readFileSync('client.html');

var server = http.createServer(function(request, response){
    response.writeHead(200,{"Content-Type":"text/html"});
    response.write("WebSocket Start~~~~~~~~~~~~");
    response.end(indexHtml);
}).listen(8080);

var socket= io.listen(server); 

// 客户端的连接事件
socket.on("connection", function(client){

// 通过客户端的client.handshake对象可以获取客户端的信息，user-agent、cookie、address、
  console.log('该客户端的client.conn.id：',client.conn.id,'client.handshake：',client.handshake);

  // 收到客户端的消息
  client.on("message",function(data){ 
    console.log("收到客户端的消息：",data);
    client.emit("emitMessage", { hello: "你好,服务器已经收到消息了"});
  }); 
  client.on("disconnect",function(){ 
    console.log("Server has disconnected");
  }); 
  client.send("hello, I am the server");
});