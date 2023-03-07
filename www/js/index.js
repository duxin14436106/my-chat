$(function() {
    // io-client
    // 连接成功会触发服务器端的connection事件
    const socket = io();

    const login = ()=> {

        if($('#name').val().trim()!==''){
            socket.emit('login', {
                name: $('#name').val(),
                img: $('#profile')[0].src
            });
        } else {
            alert('请输入昵称')
        }

        return false;
    }
    // 点击输入昵称
    $('#nameBtn').click(login);
    $('#name').keyup(ev => {
        if (ev.which === 13) {
            login()
        }
    })

    socket.on('profile', () => {
        const imgN = Math.floor(Math.random()*7)+1;
        $('#profile').attr('src', `image/allen${imgN}.png`)
    })


    // 登录成功，隐藏登录层
    socket.on('loginSuc', ()=> {
        $('.name').hide();
    })
    socket.on('system', user => {
        const $user = `<p class="system">
                  <span>${new Date().toTimeString().substr(0, 8)}</span>
                  <br>
                  <span>欢迎 <b>${user.name}</b> ${user.status}到该群聊</span>
                </p>`;
        $('#messages').append($user);
        // 滚动条总是在最底部
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    })
    socket.on('loading all clients', (info) => {
        onUserLoad(info)
    })
    socket.on('loginError', ()=> {
        alert('昵称重复，请重新设置');
        $('#name').val('')
    });
    socket.on('receiveMsg', obj => {
        // 发送为图片
        if(obj.type === 'img') {
            $('#messages').append(`
              <li class='${obj.side}'>
                <img src="${obj.img}">
                <div>
                  <span>${obj.name}</span>
                  <p style="padding: 0;">${obj.msg}</p>
                </div>
              </li>
            `);
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
            return;
        }

        // 提取文字中的表情加以渲染
        var msg = obj.msg;
        var content = '';
        while(msg.indexOf('[') > -1) {  // 其实更建议用正则将[]中的内容提取出来
            var start = msg.indexOf('[');
            var end = msg.indexOf(']');

            content += '<span>'+msg.substr(0, start)+'</span>';
            content += '<img src="image/emoji/emoji%20('+msg.substr(start+6, end-start-6)+').png">';
            msg = msg.substr(end+1, msg.length);
        }
        content += '<span>'+msg+'</span>';

        $('#messages').append(`
        <li class='${obj.side}'>
          <img src="${obj.img}">
          <div>
            <span>${obj.name}</span>
            <p style="color: ${obj.color};">${content}</p>
          </div>
        </li>
      `);
        // 滚动条总是在最底部
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    })
    // 点击抖动图标
    $('#shake').click(() => {
        socket.emit('shake')
    })
    // 点听服务端发来的抖动
    socket.on('shake', user =>{
        var data = new Date().toTimeString().substr(0, 8);
        $('#messages').append(`<p class='system'><span>${data}</span><br /><span>${user.name}发送了一个窗口抖动</span></p>`);
        shake();
        // 滚动条总是在最底部
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    })

    const onUserLoad = (info) => {
        $('#users').empty();
        if (info.length < 1) {
            $('.contacts p').show()
            return false
        } else {
            $('.contacts p').hide()
            $('#num').text(info.length)
            let $user = ''
            for (let i = 0; i < info.length; i++) {
                $user = `<li>
                  <img src="${info[i].profile}">
                  <span>${info[i].name}</span>
                </li>`;
                $('#users').append($user);
            }
        }
    }

    var timer;
    function shake() {
        $('.main').addClass('shaking');
        clearTimeout(timer);
        timer = setTimeout(()=> {
            $('.main').removeClass('shaking');
        }, 500);
    }

    // 渲染表情
    init();
    function init() {
        for(var i = 0; i < 141; i++) {
            $('.emoji').append('<li id='+i+'><img src="image/emoji/emoji ('+(i+1)+').png"></li>');
        }
    }

    // 显示表情
    $('#smile').click(()=> {
        $('.selectBox').css('display', "block");
    });
    $('#smile').dblclick((ev)=> {
        $('.selectBox').css('display', "none");
    });
    $('#m').click(()=> {
        $('.selectBox').css('display', "none");
    });

    $('#form').click(() => {
        $('#users').parent().addClass('contacts-form')
        $('#list').removeClass('hide')
        $('#form').addClass('hide')
    })

    $('#list').click(() => {
        $('#users').parent().removeClass('contacts-form')
        $('#form').removeClass('hide')
        $('#list').addClass('hide')
    })



    const sendMsg = () => {
        if($('#m').val() == '') {
            alert('请输入内容！');
            return false;
        }
        const color = $('#color').val() || '#000';
        socket.emit('sendMsg', {
            msg: $('#m').val(),
            color: color,
            type: 'text'
        });
        $('#m').val('');
        return false;
    }

//    发送消息
    $('#sub').click(sendMsg)
    $('#m').keyup(ev => {
        if (ev.which === 13) {
            sendMsg()
        }
    })

    // 用户点击发送表情
    $('.emoji li img').click((ev)=> {
        ev = ev || window.event;
        var src = ev.target.src;
        var emoji = src.replace(/\D*/g, '').substr(6, 8);
        var old = $('#m').val();
        $('#m').val(old+'[emoji'+emoji+']');
        $('.selectBox').css('display', "none");
    });

//    上传图片
    $('#file').change(function () {
        var file = this.files[0];  // 上传单张图片
        var reader = new FileReader();

        //文件读取出错的时候触发
        reader.onerror = function(){
            console.log('读取文件失败，请重试！');
        };
        // 读取成功后
        reader.onload = function() {
            var src = reader.result;  // 读取结果
            var img = '<img class="sendImg" src="'+src+'">';
            socket.emit('sendMsg', {  // 发送
                msg: img,
                color: color,
                type: 'img'
            });
        };
        reader.readAsDataURL(file); // 读取为64位
    })
});
