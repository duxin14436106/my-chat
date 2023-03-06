$(function() {
    // io-client
    // 连接成功会触发服务器端的connection事件
    const socket = io();

    // 点击输入昵称
    $('#nameBtn').click(()=> {
        var imgN = Math.floor(Math.random()*7)+1;
        if($('#name').val().trim()!=='')
            socket.emit('login', {
                name: $('#name').val(),
                img: 'image/allen' + imgN + '.png'
            });
        return false;
    });

    // 登录成功，隐藏登录层
    socket.on('loginSuc', ()=> {
        $('.name').hide();
    })
    socket.on('system', user => {
        const $user = `<p class="system">
                  <span>${new Date().toTimeString().substr(0, 8)}</span>
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

    $('#shake').click(() => {
        socket.emit('shake')
    })

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
});
