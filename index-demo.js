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
  // push到客户端的连接数组里面
  clientList.push(client);

  // 用conn.id来辨别不同的客户端，即：一个连接一个客户端
  var clientInfo = client.conn.id;
  console.log(clientInfo);


  // 通过客户端的client.handshake对象可以获取客户端的信息，user-agent、cookie、address、
  // console.log('该客户端的client.conn.id：',client.conn.id,'client.handshake：',client.handshake);


  // 收到客户端的消息
  client.on("message",function(data){ 
    // console.log("收到客户端的消息：",data);
    client.emit("emitMessage", { sendSuccess:1,message:data.message,username:data.username,connId:clientInfo});

    // 记录socket不可写的客户端
    var cleanList = [];

    // 遍历客户端列表发消息
    for (var i = 0; i < clientList.length; i++) {

      // 如果某个客户端不可写，就将它的套接字关闭，并push进数组记录下来方便清除
      // if (!clientList[i].writable) {
      //   cleanList[i].destory();
      //   cleanList.push(clientList[i]);
      //   break;
      // };

      // 如果可写，那么发送数据，不需要给自身发数据
      if (clientList[i].conn.id != clientInfo) {
        // console.log(clientList[i].conn.id,clientInfo,clientList[i].conn.id != clientInfo);
        clientList[i].emit("emitMessage", {otherClientData:1, message: data.message,username:data.username});
      };

    };

    // 遍历结束后，再来清除掉所有不可写的socket客户端
    // for (var i = 0; i < cleanList.length; i++) {
    //   clientList.splice(clientList.indexOf(cleanList[i]),1);
    // };

  });

  // 客户端断开连接事件 -->更新客户端列表
  client.on("disconnect",function(){ 
    // console.log("Server has disconnected");
    clientList.splice(clientList.indexOf(client),1);

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

