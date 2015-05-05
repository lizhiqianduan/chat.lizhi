var express = require('express');
var app = express();

var io= require("socket.io"); 
var fs = require("fs");
// var indexHtml = fs.readFileSync('client.html');


app.engine('.html', require('ejs').__express);
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
	  // response.writeHead(200,{"Content-Type":"text/html"});
    // response.send('my hello world on port:'+process.env.PORT);
    // response.sendFile(__dirname+'/client.html');
    // response.send('<input type="hidden" value='+ getIPAdress() +' />');
    var ip = getIPAdress();
    response.render('QQ.html',{
      ip:ip,
      port:process.env.PORT || 5000
    });
});

var httpIns = app.listen(app.get('port'), function() {
  console.log("Node app is running on port:" + app.get('port'))
});





// var socketapp = express.createServer();
var socket= io.listen(httpIns); 

// 保存客户端连接个数
var clientList = [];
// console.log(socket,io,httpIns);


// 客户端的连接事件
socket.on("connection", function(client){

// 通过客户端的client.handshake对象可以获取客户端的信息，user-agent、cookie、address、
  console.log('该客户端的client.conn.id：',client.conn.id,'client.handshake：',client.handshake);

  // 收到客户端的消息
  client.on("message",function(data){ 
    console.log("收到客户端的消息：",data);
    client.emit("emitMessage", { isSuccess:1,hello: "你好,服务器已经收到你的消息了："+data});
  }); 
  client.on("disconnect",function(){ 
    console.log("Server has disconnected");
  }); 
  // client.send("hello, I am the server");
});



function getIPAdress(){  
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i=0;i<iface.length;i++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                     return alias.address;  
               }  
          }  
    }  
}  

