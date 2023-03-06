const express = require('express')
const app = express()
const server = require('http').Server(app)
// 因为WebSocket服务需要调用http模块并调用其下的server,
// 生成server作为参数传给socket.io
const io = require('socket.io')(server)

// 将www文件夹托管为静态资源，意味着这个文件夹里的文件批次之间可以用相对路径
app.use('/', express.static(__dirname + '/www'))
let users = [], // 存放用户的名字
    usersInfo = [] // 存放用户的信息

io.on('connection', (socket) => {
    // io.emit('loading all clients', usersInfo)//加载所有客户端进来的用户
    socket.on('login', data => {
        console.log('client data', data)
        if (users.includes(data.name)) {
            socket.emit('loginError')
            return false
        }
        users.push(data.name)
        usersInfo.push({
            name: data.name,
            profile: data.img
        })
        socket.nickname = data.name
        socket.emit('loginSuc')
        io.emit('system', {
            name: data.name,
            status: '进入'
        })
        io.emit('loading all clients', usersInfo)//加载所有客户端进来的用户
    })
    // 抖动
    socket.on('shake', () => {
        // 自己
        socket.emit('shake', {
            name: '您'
        });
        // 除了自己的其他人
        socket.broadcast.emit('shake', {
            name: socket.nickname
        })
    })

    socket.on('disconnection', data => {
        io.emit('logout', {
            name: data.name,
            status: '离开'
        })
    })
})

//listen
server.listen(3031, () =>{
    console.log('server is begining')
})


