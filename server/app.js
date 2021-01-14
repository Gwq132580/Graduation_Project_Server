const express = require('express') //引入服务器模块

const app = express()

const router = require('./router.js') //引入路由模块

const path = require('path') //配置系统path路径

const bodyParser = require('body-parser') // post请求解析模块

const cors = require('cors');

const cookieParase = require('cookie-parser');

//处理post请求参数
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//启用cookie
app.use(cookieParase());

//处理静态资源
app.use(express.static(path.join(__dirname, 'public/img')))

//设置跨域和相应数据格式

app.use(cors())

// app.all('*', function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, mytoken')
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization')
//     res.setHeader('Content-Type', 'application/json;charset=utf-8')
//     res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
//     res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
//     res.header('X-Powered-By', ' 3.2.1')
//     if (req.method == 'OPTIONS') res.send(200)
//         /*让options请求快速返回*/
//     else next() //放行
// })

app.use(router); //挂载路由

app.listen(3000, (req, res) => { //端口3000
    console.log('服务器启动成功');
})