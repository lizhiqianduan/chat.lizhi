//创建Socket.IO实例，建立连接
var socket = null;
// var socket = io.connect("<%= ip %>:5000");
// var socket =  io.connect(window.location.hostname);
// var socket =  io.connect("/");

var username = '';

var titleIsBlink = false;

var lastSendTime = 0;



// 表情模块（变量名懒得想了）
var lzFaceModule = {
    // 表情选择窗的开启状态
    faceIsOpen:false,

    // 保存中文字符表示的表情数组
    faceZh:[],

    // 初始化一些事件
    init:function(){
        var faceImg = getById("face_images");
        var allFace = faceImg.getElementsByTagName('i');
        this.faceImgToStr(allFace);
        this.bintEvent();
    },

    // 图标转换为字符串数组
    faceImgToStr:function(allFaceDoms){
        for (var i = 0; i < allFaceDoms.length; i++) {
            if(allFaceDoms[i].title != "delKey"){
                this.faceZh.push("["+allFaceDoms[i].title+"]");
            }
        };
    },

    // 将一个str转换为face
    strToFace:function(str){

    },

    // 点击表情
    faceBtnClick:function(){
        lzFaceModule.faceIsOpen = !lzFaceModule.faceIsOpen;
        lzFaceModule.showFace();
    },

    // 展示选择框
    showFace:function(){
        var faceImg = getById("face_images");
        faceImg.style.display = 'block';
        faceImg.getElementsByTagName('ul')[0].style.display = 'block';
        faceImg.getElementsByTagName('ul')[0].style.width = '4200px';
        getById("panelBodyWrapper-5").style.height = getById("panel-5").offsetHeight - getById("panelHeader-5").offsetHeight - getById("panelFooter-5").offsetHeight+'px';
        

    },
    bintEvent:function(){
        var faceImg = getById("face_images");
        var pageDots = faceImg.getElementsByTagName('ul')[1].getElementsByTagName('li');
        var allFace = faceImg.getElementsByTagName('i');
        // 绑定翻页事件
        for (var i = 0; i < pageDots.length; i++) {
            pageDots[i].onclick = function(i){
                
                return function(){
                    for (var j = 0; j < pageDots.length; j++) {
                        pageDots[j].className = "";
                    };
                    pageDots[i].className="selected";
                    faceImg.getElementsByTagName('ul')[0].style.left = -faceImg.getElementsByTagName('ul')[0].getElementsByTagName("li")[0].offsetWidth*i + 'px';
                }
                
            }(i)
        };

        // 绑定表情的点击事件
        for (var i = 0; i < allFace.length; i++) {
            if (allFace[i].title=='delKey') {
                break;
            };
            allFace[i].onclick = function(i){
                return function(){
                    getById("chat_textarea").value += "["+this.title+"]";
                }
            }(i)
        };


    }
}











init();




function getById(id){
    return document.getElementById(id);
}

// 从cookie中读取用户名
function getNameFormCookie(){
    var cookies = document.cookie.split(";");
    if (cookies.length) {
        for (var i = 0; i < cookies.length; i++) {
            var kv = cookies[i].split('=');
            // console.log(kv);

            if(kv[0].trim() == 'lz-username' && kv[1]){
                return kv[1];
            }
        };
    };
    return '';
}

// 时间提示函数
function addTimeTip(timeStr){
    var dom = '<div class="chat_time"><span>'+timeStr+'</span></div>';
    document.getElementById("panelBody-5").innerHTML += dom;
    chatBoxScrollBottom();
}

// 显示其他人发送的消息
function addOtherClentMessage(message,name){
    var dom = '<div class="chat_content_group buddy  " _sender_uin="418131904"><img class="chat_content_avatar" src="./QQ_files/getface(1)" width="40px" height="40px"><p class="chat_nick">'+ name +'</p><p class="chat_content ">'+ message +' </p></div>';
    document.getElementById("panelBody-5").innerHTML += dom;
    chatBoxScrollBottom();
}

// 显示自己发送的消息
function addMyMessage(message,name){
    var dom = '<div class="chat_content_group self  " ><img class="chat_content_avatar" src="./QQ_files/getface"><p class="chat_nick">'+ name +'</p><p class="chat_content ">'+ message +'</p></div>';
    document.getElementById("panelBody-5").innerHTML += dom;
    chatBoxScrollBottom();
}

// 滚动聊天窗口到底部
function chatBoxScrollBottom(){
    getById('panelBodyWrapper-5').scrollTop = 9999999;
}

// 闪烁标题，提示新消息
function titleBlink(){
    if (titleIsBlink) {
        return;
    };
    titleIsBlink = true;
    var oldTitle = document.title;
    document.title = '你有新消息了!!!';
    var i=0;
    var tid = setInterval(function(){
        if(i%2==0){
            document.title = oldTitle;
        }else{
            document.title = '....新消息....';
        }
        i++;
        if(i==7){
            clearInterval(tid);
            titleIsBlink = false;
        }
    },500);
}















// 通过Socket发送一条消息到服务器,消息可以是json数据
function sendMessageToServer(message) {
    socket.send(message); 
}

// 发送按钮绑定事件
function sendBtnClick(){
    

    var message = document.getElementById('chat_textarea').value;
    if (message && username){
        var curTime = new Date().getTime();
        if(curTime - lastSendTime<800){
            addTimeTip('发言最小间隔为1秒，否则会按刷屏处理');
            console.log(curTime,lastSendTime);
            return;
        }
        lastSendTime = new Date().getTime();


        // sendMessageToServer(document.getElementById('chat_textarea').value);
        addMyMessage(message,username);
        sendMessageToServer({message:message,username:username});
        document.getElementById('chat_textarea').value = '';
        document.getElementById('chat_textarea').focus();
    }
        
}

// 输入用户名确定按钮点击事件
function lzSureClick(){
    if (getById('lz-username').value) {
        username = getById('lz-username').value;

        setCookie('lz-username',username,24);
        getById('lz-mask').style.display = 'none';
        bindSocketEvent();
    };
}

// 设置cookie,expirsTime单位：小时，为负表示删除该cookie
function setCookie(name,value,expirsTime){
    expirsTime = expirsTime ? expirsTime : 1;
    var exp = new Date();
    exp.setTime(exp.getTime() + expirsTime*60*60*1000);
    document.cookie = name+"="+ value + ";expires=" + exp.toGMTString();
}

function loginOut(){
    // document.cookie
    setCookie('lz-username','',-3); 
    window.location.reload();
}


// 绑定socket相关事件
function bindSocketEvent(){
    // socket = io.connect("localhost:5000");
        socket =  io.connect(window.location.hostname);
        // var socket =  io.connect("/");
    // 绑定事件

    // 添加一个连接监听器，如果连接成功，再绑定事件
    socket.on("connect",function() {
        console.log('connect success');
        socket.emit("checkUsername",{username:username});
    });

    // 验证用户成功
    socket.on("usernameCheckSuccess",function(data){
        // console.log(data);
        getById('lz-logined-name').innerText = username;
        addTimeTip(new Date().toLocaleTimeString());
        addOtherClentMessage(username+'，你好！你已经进入聊天室了，快和大家打个招呼吧！','小黑的智能机器人');
        addTimeTip('现版本聊天室没有数据库作存储，所以...千万别刷新!');
    });

    // 无论用户是否登陆，都接收后端发来的数据
    socket.on("emitMessage",function(data) {
      // 如果返回的数据有sendSuccess字段，表示发送成功
      if (data.sendSuccess) {
        // addMyMessage(data.message,username);
        console.log('send success');
      };

      // 如果返回的数据有otherClientData字段，表示这条消息来自其他客户端
      if(data.otherClientData){
        // console.log(data);
        titleBlink();
        addOtherClentMessage(data.message,data.username);
      };

      
    });

    // 更新用户列表
    socket.on("refreshUserList",function(list){
        // console.log(list);

        var allUserNum = list.length;
        getById('lz-user-number').innerText = allUserNum;

        var userWrap = getById('groupBodyUl-0');
        userWrap.innerHTML = '';
        for(var i=0;i<list.length;i++){
            if(list[i].username){
                var dom = '<li id="'+ list[i].connId +'" class="list_item" _uin="418131904" _type="friend" cmd="clickMemberItem"><a href="javascript:void(0);" class="avatar" cmd="clickMemberAvatar" _uin="418131904" _type="friend"><img src="./QQ_files/getface(1)" class="lazyLoadImg loaded"></a><p class="member_nick" id="userNick-418131904"> '+ list[i].username +' </p><p class="member_msg text_ellipsis"><span class="member_state">[在线]</span><span class="member_signature" title="IP:'+ list[i].userIp +'">鼠标悬浮可查看对方ip</span></p></li>';
                userWrap.innerHTML+=dom;
            }
        }
    });

    // 验证用户失败
    socket.on("usernameCheckFail",function(data){
        var lzmask = getById('lz-mask');
        lzmask.style.display = 'block';
        getById('namewrap').innerHTML += '<div style="color:red;">该名字已经在别处登陆了~~<br>重新取个牛逼的名字吧</div>';
    });

    


    // 添加一个关闭连接的监听器
    socket.on("disconnect",function() { 
      console.log("The client has disconnected!"); 
    }); 
}

// 页面初始化，程序入口
function init(){
    // 获取姓名
    if (getNameFormCookie() =='') {
        getById('lz-mask').style.display = 'block';
    }else{
    // 建立连接
        if(confirm('检测到你之前登陆过，是否使用之前的名字开始交流')){
            username = getNameFormCookie();
            bindSocketEvent();
        }else{
            getById('lz-mask').style.display = 'block';
        }
    }

    lzFaceModule.init();

}




