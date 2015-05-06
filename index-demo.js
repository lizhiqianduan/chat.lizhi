var express = require('express');
var app = express();

var io= require("socket.io"); 
var fs = require("fs");
// var indexHtml = fs.readFileSync('client.html');

// 保存客户端连接个数
var clientList = [];

app.engine('.html', require('ejs').__express);
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {

    var ip = getIPAdress();
    response.render('QQ.min.html',{
      ip:ip,
      port:process.env.PORT || 5000,
      clientList:clientList
    });
});

var httpIns = app.listen(app.get('port'), function() {
  console.log("Node app is running on port:" + app.get('port'))
});





// var socketapp = express.createServer();
var socket= io.listen(httpIns); 


// console.log(socket,io,httpIns);


// 客户端的连接事件
socket.on("connection", function(client){

  // 用来捆绑自定义的一些信息
  client.lzUserInfo = {};

  // push到客户端的连接数组里面
  clientList.push(client);

  

  // 用conn.id来辨别不同的客户端，即：一个连接一个客户端
  var clientInfo = client.conn.id;
  // console.log(clientInfo);

  // 检测用户信息  data --> 必须包含username字段
  client.on('checkUsername',function(data){
    var curName = data.username;
    // console.log(data);
    for (var i = 0; i < clientList.length; i++) {
      // console.log(1111,clientList[i].lzUserInfo.username,curName);
      if(clientList[i].lzUserInfo.username == curName){
        client.emit('usernameCheckFail',{});
        return;
      }
    };
    // 如果是新用户进入，给客户端发送一个更新用户的事件
    client.lzUserInfo.username = curName;
    client.lzUserInfo.connId = client.conn.id;
    client.emit('usernameCheckSuccess',{});
    
    letClientRefreshUser();

  });

  // 让客户端更新用户列表
  function letClientRefreshUser(){
    var allConnId = [];
    for (var i = 0; i < clientList.length; i++) {
      allConnId.push({connId:clientList[i].conn.id,userIp:clientList[i].handshake.address,username:clientList[i].lzUserInfo.username});
    };
    for (var i = 0; i < clientList.length; i++) {
      // if (clientList[i].conn.id != clientInfo) {
        clientList[i].emit("refreshUserList", allConnId);
      // };
    };
  }

  // 收到客户端的消息
  client.on("message",function(data){
    // console.log("收到客户端的消息：",data);
    client.emit("emitMessage", { sendSuccess:1,message:data.message,username:data.username,connId:clientInfo});

    // 记录socket不可写的客户端
    var cleanList = [];

    // 遍历客户端列表发消息
    for (var i = 0; i < clientList.length; i++) {

      // 如果可写，那么发送数据，不需要给自身发数据
      if (clientList[i].conn.id != clientInfo) {
        // console.log(clientList[i].conn.id,clientInfo,clientList[i].conn.id != clientInfo);
        clientList[i].emit("emitMessage", {otherClientData:1, message: data.message,username:data.username});
      };

    };


  });

  // 客户端断开连接事件 -->更新客户端列表
  client.on("disconnect",function(){
    // console.log("Server has disconnected");
    clientList.splice(clientList.indexOf(client),1);
    letClientRefreshUser();
  }); 

});

// 给所有客户端发消息
function sendMessageToAllClient(message,clientList,eventTypeString){
    for (var i = 0; i < clientList.length; i++) {
        clientList[i].emit(eventTypeString, message);
    };
}


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

