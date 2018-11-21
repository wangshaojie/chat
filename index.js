const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const router = require(__dirname + '/server/router/index');
const apiRouter = require(__dirname + '/server/service/apiService');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const socketIo = require(__dirname + '/server/service/ScoketIo');




app.set('views', path.join(__dirname, 'server','views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'));
const identityKey = 'skey';

app.use(session({
    name: identityKey,
    secret: 'chyingp',  // 用来对session id相关的cookie进行签名
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24   //有效期一天
    }
}));


//登录拦截器，必须放在静态资源声明之后、路由导航之前
// app.use(function (req, res, next) {
//     var url = req.originalUrl;
//     console.log(req.session)
//     if (url != "/join" && !req.session.loginUser) {
//         return res.redirect("/join");
//     }
//     next();
// });

app.use('/', router);
app.use('/api', apiRouter);



server.listen(3000, function(){
	console.log("listening on : 3000" + " 我成功启动咯~!")
});


//创建socketio连接
socketIo.init(server);