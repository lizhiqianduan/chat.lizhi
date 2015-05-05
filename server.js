/*
2015年4月28日22:30:13 created by xiaohei
*/

var net = require('net');
console.log('net模块提供的api：',net);

// 创建一个服务器
var chatServer = net.createServer();

// 保存已经连接的客户端列表
var clientList = [];

// 监听客户端连接事件
chatServer.on('connection',function(client){

	// push到客户端的连接数组里面
	clientList.push(client);

	// 用远端地址和端口来辨别不同的客户端
	var clientInfo = client.remoteAddress+":"+client.remotePort;

	console.log('客户端已经连接,打印下客户端的应用：',client);
	client.write('hello,'+clientInfo+',this message is from server');

	// 监听客户端发送数据事件
	client.on('data',function(data){
		console.log(clientInfo,'客户端发数据来了：',data,'\r\n');

		// 记录socket不可写的客户端
		var cleanList = [];

		// 遍历客户端列表发消息
		for (var i = 0; i < clientList.length; i++) {

			// 如果某个客户端不可写，就将它的套接字关闭，并push进数组记录下来方便清除
			if (!clientList[i].writable) {
				cleanList[i].destory();
				cleanList.push(clientList[i]);
				break;
			};

			// 如果可写，那么发送数据
			if (clientList[i].remoteAddress+":"+clientList[i].remotePort != clientInfo) {
				clientList[i].write(data);
			};
		};

		// 遍历结束后，再来清除掉所有不可写的socket客户端
		for (var i = 0; i < cleanList.length; i++) {
			clientList.splice(clientList.indexOf(cleanList[i]),1);
		};
	});

	// 监听客户端的断开事件
	client.on('end',function(){
		console.log(clientInfo,'客户端断开了连接');
		// 如果当前客户端断开，就在客户端列表中去除该客户端
		clientList.splice(clientList.indexOf(client),1);
	});

	// 记录连接中的错误
	client.on('error',function(e){
		console.log(clientInfo,'连接发生错误',e);
	});
	// client.end();
});

// 监听端口
chatServer.listen(9999);
