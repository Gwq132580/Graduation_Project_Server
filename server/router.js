const express = require('express')

const router = express.Router()

const connection = require('./db.js')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

const fs = require('fs');

const multer = require('multer');

//验证码
const svgCaptcha = require('svg-captcha');

const user = require('./UserSql.js')
const jwt_decode = require('jwt-decode');
const AlipaySdk = require('alipay-sdk').default;

//验证码
let code = '';

//接入短信的sdk
var QcloudSms = require("qcloudsms_js");


//支付请求
router.post('/api/pay', async function(req, res, next) {
    var alipaySdk = new AlipaySdk({
        appId: '2016102700771848', // 之前我们所记录的沙箱环境的 sdk
        privateKey: 'MIIEogIBAAKCAQEAg495jYJ9f8g4vXjw7uGEWmhVqeMf9Bw0PLao6CQlJijDz/DZif/UViVizvZj3RAQNHD44+ZL0KeqfpW58/V8YbcZ2TQCyDKLcUJ7+2c0ppqoTBpnOr/zeadBq/yZrfgfRXQdO5ToTQlCXwbRqgXBvUAnv7cPJVT0/gZ2qjI2geh4YuMUdORjldrg/UnLCgXcSHROLkLe755yJUWBoZZN8hkiCGu8SvsFiiIhYRIaM9GnJuFz1wVvQ2jO/UWETVjeaRCqxy7uEZW6ZAllrvAhOeenE9qer23I4TTee80iYZKoY160KF8rEIOh2tGR07JVag0yhC3flW2NP+Pt6yAEzwIDAQABAoIBAE+INeCBaWMNZJfOfEC9XqjU+Cx63L9TKZUmi5fC+h5GeJHFtY0CdpgZg9FADIEAi/tX7G7Bs0WRhrV9yGueFTJxYZP4KFJkk/3FRnRmIOMzDdjsAUn37rW1kjLpwvHz1NvE5UM2svSXS2NtGOTjFAtXtG/mt6ZG5NCIkcY0EtWXGPtA0duK9XTYwFqORdMBHme28jtd4uSJihMuQ9EMRUnbMEeXfH6UQs9d0J+fyI+qVLOWplUrWJJl9bsK6Em8xp/FupnfnoMvkmklxdYpaS6/xGi9FwDfN/QkFix4oez1eDcKjEtzFczXrUTkKPk7vzmUInIB/Wv8+1kvHS6kOGECgYEAutnlmNQlhnnRoVGvK/uGwb0RcOjnNFRbfeHgRLBDs+alSXYZPOZ28pdfzm6o5m+bL0Th7R8mBUzm1QjxRo+7ZecMPWJ1zr/H/NBeRampiN+5LsXrqB92SBPAq/LCcOOy5EO897oa9em0M8JB20b7nSZiKzzxKS/+9Lgq41NlGfECgYEAtD9jUphBm0zH20ghgpXT1nd51DqtJryMc0XyEUYFIdBddLJmHURlq4BXJyKCEKbJnwVafGZ8MtQE3fnUhs2+I1JfwJ1A96dDd08wE/UTN5bu7RMAPIwxG+PoUoDh0KU8Os5SOyREL8asHEupuMAhTM6ElqpftJf1bT5CLcpSSr8CgYB3W4mWvq3Z4SdP7WYAqoPCbowdnClU/C4Vk5w3RIF7AfLDonUsuetxu9CvhXDPAqwW3eGUHzmiWSV7IGM/t8D1r0naTHMExu1xSYlu5potnPwmLLgEhVSBZlzFeiVLB6jWt46WkIN4YvmBtq1q7UT9de9vv1YuAULUAHElFbiXgQKBgEOxjrbFUdZmZqS3GUa2yGFCa7HF+6ORqlncigXsux6w53hdS7ZwKpLXV2PuNNTWHuCnHQ2dW8WnFNDc8/FQsbkIRcfMB0s7OT5EsjS8lOQKvl6xBSS4LfVgia76klROyij3tbBadXVP8vGJhQtKtPbolKkVAW6Mp3LIsAgMdQ13AoGAB9RjkucN4Srqxp9yufzNTFdO2APJCC2SaLrN8tJN240EP+jIuIQZ9O2JBnYoFHmctQaelqlGJPK9aNNnUqrGpnXbl83xFAtZLY0eYvYc26wuki9n3wsHuH9LYiKwZFBzI1UASCG4l/9rzqYLsnxRQ2hwJJdeSnrfsCuxvjhxaOY=', // 传入私钥
        gateway: "https://openapi.alipaydev.com/gateway.do"
    });
    let data = JSON.parse(req.body.data),
        customer = req.body.customer,
        path = req.body.path;
    let total = 0,
        pay = 1,
        date = Date.now(),
        uid = data[0].uid;
    data.forEach(item => {
        total += item.cprice * item.num
    })
    connection.query('insert into goods_order(customer,total,pay,date,uid,path) values ("' + customer + '","' + total + '","' + pay + '","' + date + '","' + uid + '","' + path + '")', (err, result) => {
        if (err)
            throw err;
        res.send({
            data: {
                success: 1
            }
        })
    })

    // const result = await alipaySdk.exec('alipay.trade.app.pay', {
    //     total_amount: "10",
    //     subject: '大个头',
    //     out_trade_no: '70501111111S001111119'
    // });
    // console.log(result)
});

//获取头像
router.post('/api/getAvatar', function(req, res, next) {
    let phone = req.body.phone;
    connection.query(`select imgUrl from user where phone = ${phone}`, function(error, results, fields) {
        if (error)
            return console.log(error);
        res.send({
            data: results
        })
    })
})

//新增地址
router.post('/api/addAddress', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt_decode(token);
    let name = req.body.name;
    let tel = req.body.tel;
    let province = req.body.province;
    let city = req.body.city;
    let district = req.body.district;
    let address = req.body.address;
    let isDefault = req.body.isDefault;
    connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
        let id = results[0].id;
        let sqlInert = 'insert into address (name,tel,province,city,district,address,isDefault,userId) values ("' + name + '","' + tel + '","' + province + '","' + city + '","' + district + '","' + address + '","' + isDefault + '","' + id + '")';
        connection.query(sqlInert, function(err, result, field) {
            res.send({
                data: {
                    success: "成功"
                }
            })
        })
    })
})

//修改地址
router.post('/api/updateAddress', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt_decode(token);
    let name = req.body.name;
    let tel = req.body.tel;
    let province = req.body.province;
    let city = req.body.city;
    let district = req.body.district;
    let address = req.body.address;
    let isDefault = req.body.isDefault;
    let id = req.body.id;

    //获取userId
    connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
        let userId = results[0].id;
        connection.query(`select * from address where userId = ${userId} and isDefault = ${isDefault}`, function(err, result) {
            let childId = result[0].id;
            connection.query(`update address set isDefault = replace(isDefault,"1","0") where id = ${childId}`, function(e, r) {
                let updateSql = `update address set name = ?,tel = ?,province = ?,city = ?,district = ?,address = ?,isDefault = ?,userId = ? where id = ${id}`
                connection.query(updateSql, [name, tel, province, city, district, address, isDefault, userId], function(err, result) {
                    res.send({
                        data: {
                            success: '成功'
                        }
                    })
                })
            })
        })
    })
})

//当前用户查询收货地址
router.post('/api/selectAddress', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt_decode(token);
    connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
        let id = parseInt(results[0].id);
        connection.query(`select * from address where userid = ${id} and isDefault=1`, function(err, result, field) {
            res.send({
                data: result
            })
        })
    })
})

//获取当前用户购物车列表
router.post('/api/selectCart', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt_decode(token);
    connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
        //当前用户id
        let userId = results[0].id;
        connection.query(`select * from goods_cart where uid = ${userId}`, function(err, result) {
            res.json({
                data: result
            })
        })
    })
})

//修改当前用户购物车商品数量
router.post('/api/updateNumCart', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt_decode(token);
    //商品id
    let goodsId = req.body.goodsId;
    //用户输入的商品数量
    let num = req.body.num;
    connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
        //当前用户id
        let userId = results[0].id;
        connection.query(`select * from goods_cart where uid = ${userId} and goods_id = ${goodsId}`, function(err, result) {
            //数据中当前的数量
            let goods_num = result[0].num;
            //当前的id号
            let id = result[0].id;
            //修改[替换]
            connection.query(`update goods_cart set num = replace(num,${goods_num},${num}) where id = ${id}`, function(e, r) {
                res.json({
                    data: {
                        success: true
                    }
                })
            })
        })
    })
})

//加入购物车
router.post('/api/addCart', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt_decode(token);
    // //商品id
    let goods_id = req.body.goods_id;
    // //用户输入的商品数量
    let num = req.body.num;
    connection.query(`select * from user where phone = ${phone.name}`, function(error, results, fields) {
        //当前用户id
        let userId = results[0].id;
        connection.query(`select * from goods where id = ${goods_id}`, function(err, result) {
            let name = result[0].name;
            let imgUrl = result[0].imgUrl;
            let cprice = result[0].cprice;
            //查询当前用户之前是否添加过这个商品
            connection.query(`select * from goods_cart where uid = ${userId} and goods_id = ${goods_id}`, function(err, data) {
                if (data.length > 0) {
                    //如果当前用户已经添加过本商品,就让数量增加
                    connection.query(`update goods_cart set num = replace(num,${data[0].num},${ parseInt(num) + parseInt(data[0].num) }) where id = ${data[0].id}`, function(e, r) {
                        res.json({
                            data: {
                                success: "加入成功"
                            }
                        })
                    })
                } else {
                    //如果当前用户之前没有加入过本商品,需要添加进入
                    connection.query('insert into goods_cart (uid,goods_id,name,imgUrl,cprice,num) values ("' + userId + '","' + goods_id + '","' + name + '","' + imgUrl + '","' + cprice + '","' + num + '")', function(err, data) {
                        res.json({
                            data: {
                                success: "加入成功"
                            }
                        })
                    })
                }
            })
        })
    })
})

//删除购物车
router.get("/api/deleteCart", function(req, res, next) {
    let { data } = JSON.parse(JSON.stringify(req.query)),
        list = [];
    JSON.parse(data).forEach((item, index) => {
        let { name, num } = item;
        list[index] = [name, num]
    })
    list.forEach(item => {
        let [name, num] = item
        connection.query("select * from goods_cart where name='" + name + "'", function(err, res, fields) {
            if (err)
                throw err;
            let number = res[0].num;
            if (number == num) {
                connection.query("delete from goods_cart where name='" + name + "'", function(err1, res1, fields1) {
                    if (err1)
                        throw err;
                })
            }
        })
    })

});

//登录
router.post('/api/login', function(req, res, next) {
    //前端给后端的数据
    let params = {
            userName: req.body.userName,
            userPwd: req.body.userPwd
        }
        //查询用户名或者手机号存在不存在
    connection.query(user.queryUserName(params), function(error, results, fields) {
        if (results.length > 0) {
            connection.query(user.queryUserPwd(params), function(err, result) {
                if (result.length > 0) {
                    res.send({
                        data: {
                            success: true,
                            msg: "登录成功",
                            data: result[0]
                        }
                    })
                } else {
                    res.send({
                        data: {
                            success: false,
                            msg: "密码不正确"
                        }
                    })
                }
            })
        } else {
            res.send({
                data: {
                    success: false,
                    msg: "用户名或手机号不存在"
                }
            })
        }
    })
});

//第三方登录
router.post('/api/loginother', function(req, res, next) {
    //前端给后端的数据
    let params = {
        provider: req.body.provider, //登录方式
        openid: req.body.openid, //用户身份id
        nickName: req.body.nickName, //用户昵称
        avatarUrl: req.body.avatarUrl //用户头像
    };
    //查询数据库中有没有此用户
    connection.query(user.queryUserName(params), function(error, results, fields) {
        if (results.length > 0) {
            //数据库中存在      : 读取
            connection.query(user.queryUserName(params), function(e, r) {
                res.send({
                    data: r[0]
                })
            })
        } else {
            //数据库中[不]存在  : 存储 ==>读取
            connection.query(user.insertData(params), function(er, result) {
                connection.query(user.queryUserName(params), function(e, r) {
                    res.send({
                        data: r[0]
                    })
                })
            })
        }
    })

})

//手机号注册
router.post('/api/registered', function(req, res, next) {
    let params = {
        userName: req.body.phone
    }
    connection.query(user.queryUserName(params), function(error, results, fields) {
        if (results.length > 0) {
            res.send({
                data: {
                    success: false,
                    msg: "手机号已被注册",
                }
            })
        } else {
            connection.query(user.insertData(params), function(error, results, fields) {
                res.send({
                    data: {
                        success: true,
                        msg: '注册成功'
                    }
                })
            })
        }
    })
});

//发送验证码
router.post('/api/code', function(req, res, next) {
    //前端给后端的数据
    let params = {
        userName: req.body.userName
    };
    // 短信应用 SDK AppID
    var appid = 1400187558; // SDK AppID 以1400开头
    // 短信应用 SDK AppKey
    var appkey = "dc9dc3391896235ddc2325685047edc7";
    // 需要发送短信的手机号码
    var phoneNumbers = [params.userName];
    // 短信模板 ID，需要在短信控制台中申请
    var templateId = 298000; // NOTE: 这里的模板ID`7839`只是示例，真实的模板 ID 需要在短信控制台中申请
    // 签名
    var smsSign = "三人行慕课"; // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请
    // 实例化 QcloudSms
    var qcloudsms = QcloudSms(appid, appkey);
    // 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
    function callback(err, ress, resData) {
        if (err) {
            throw err
        } else {
            code = ress.req.body.params[0];
            res.send({
                data: {
                    success: true,
                    code: code
                }
            })
        }
    }
    var ssender = qcloudsms.SmsSingleSender();
    var paramss = [Math.floor(Math.random() * (9999 - 1000)) + 1000]; //发送的验证码
    ssender.sendWithParam("86", phoneNumbers[0], templateId,
        paramss, smsSign, "", "", callback);

})

//注册===>增加一条数据
router.post('/api/addUser', function(req, res, next) {
    //前端给后端的数据
    let params = {
        userName: req.body.userName,
        userCode: req.body.code
    };
    if (params.userCode == code) {
        connection.query(user.insertData(params), function(error, results, fields) {
            connection.query(user.queryUserName(params), function(err, result) {
                res.send({
                    data: {
                        success: true,
                        msg: "注册成功",
                        data: result[0]
                    }
                })
            })
        })
    }

})

//商品搜索
router.get('/api/goods/id', function(req, res, next) {
    let id = req.query.id;
    connection.query("select * from goods where id=" + id + " ", function(error, results, fields) {
        if (error) throw error;
        res.send({
            code: "0",
            data: results
        })
    });
});

//商品搜索排序
router.get("/api/goods/search", function(req, res, next) {
    //desc降序     asc升序
    //获取对象的key
    let [goodsName, orderName] = Object.keys(req.query);
    //name参数的值
    let name = req.query.name;
    //orderName的key的值
    let order = req.query[orderName];
    connection.query("select * from goods where name like '%" + name + "%' order by " + orderName + " " + order + "", function(error, results, fields) {
        if (error) throw error;
        res.send({
            code: "0",
            data: results
        })
    });
});

//请求商品图片
router.get('/api/goodsImg/id', function(req, res, next) {
    let id = req.query.id;
    connection.query("select * from goods_recommend where goodId=" + id + " ", function(error, results, fields) {
        if (error) throw error;
        res.send({
            code: "0",
            data: results
        })
    });
});

//看了又看
router.get("/api/goods/look", function(req, res, next) {
    connection.query("select * from goods", function(error, results, fields) {
        if (error) throw error;
        res.send({
            code: "0",
            data: results
        })
    });
});

//生成订单
router.get("/api/generatorOrder", function(req, res, next) {
    let { data } = JSON.parse(JSON.stringify(req.query)),
        list = [];
    JSON.parse(data).forEach((item, index) => {
        let { uid, imgUrl, name, cprice, num } = item;
        list[index] = [uid, imgUrl, name, cprice, num];
    })
    var sql = "INSERT INTO goods_order(`uid`,`imgUrl`,`name`, `cprice`,`num`) VALUES ?";
    connection.query(sql, [list], function(err, rows, fields) {
        if (err) {
            console.log('INSERT ERROR - ', err.message);
            return;
        }
    });
});

//删除商品
router.get("/api/deleteGoods", function(req, res, next) {
    let { data } = JSON.parse(JSON.stringify(req.query)),
        arr = [];
    JSON.parse(data).forEach(item => {
        arr.push(item.id)
    })
    connection.query(`delete from goods_cart where id in(${arr})`, function(err1, res1, fields1) {
        if (err1)
            throw err;
    })
});

//查询价格
router.get("/api/queryPrice", function(req, res, next) {
    let { data } = JSON.parse(JSON.stringify(req.query)),
        arr = [],
        arr1 = [];
    JSON.parse(data).forEach(item => {
        arr.push(item.name);
        arr1.push([item.name, item.cprice])
    })
    connection.query("select name,cprice from goods", function(err, result, fields) {
        if (err)
            throw err;
        let result1 = result.filter(item => {
            return arr.indexOf(item.name) !== -1
        })
        result1.forEach((item, index) => {
            if (arr1[index][1] > item.cprice) {
                item['change'] = 1
            } else if (arr1[index][1] < item.cprice) {
                item['change'] = -1
            } else
                item['change'] = 0
        })
        res.send({
            code: "0",
            // data:result1
            data: [JSON.parse(data), result1]
        })
    })
})

//查询订单
router.get("/api/selectOrder", function(req, res, next) {
    let id = req.query.id;
    connection.query("select * from goods_order where uid=" + id + " ", function(error, results, fields) {
        if (error) throw error;
        res.send({
            code: "0",
            data: results
        })
    });
});

// 获取首页数据
router.get('/api/index_list/data', function(req, res, next) {
    connection.query("select * from goods", function(error, results, fields) {
        if (error) throw error;
        res.send({
            "code": 0,
            "data": {
                topBar: [
                    { id: 1, name: '推荐' },
                    { id: 2, name: '运动户外' },
                    { id: 3, name: '服饰内衣' },
                    { id: 4, name: '鞋靴箱包' },
                    { id: 5, name: '美妆个护' },
                ],
                data: [{
                        type: "swiperList",
                        data: [
                            { imgUrl: '../../static/img/swiper1.jpg' },
                            { imgUrl: '../../static/img/swiper2.jpg' },
                            { imgUrl: '../../static/img/swiper3.jpg' },
                            { imgUrl: '../../static/img/swiper4.jpg' },
                        ]
                    },
                    {
                        type: 'recommendList',
                        data: [{
                                bigUrl: '../../static/img/big.jpg',
                                data: [
                                    { imgUrl: '../../static/img/dg1.jpg' },
                                    { imgUrl: '../../static/img/dg2.jpg' },
                                    { imgUrl: '../../static/img/dg3.jpg' },
                                ]
                            },

                        ]
                    },
                    {
                        type: 'commodityList',
                        data: results
                    }
                ]
            }
        })
    });
});

//获取其他页数据
router.get('/api/index_list/2/data/1', function(req, res, next) {
    let commodityList;
    connection.query("select * from goods where recommend='运动户外'", function(error, results, fields) {
        if (error) throw error;
        commodityList = results;
    });
    connection.query("select * from goods where category='运动户外'", function(error, results, fields) {
        if (error) throw error;
        res.json({
            code: '0',
            data: [{
                    type: "bannerList",
                    imgUrl: '../../static/img/swiper2.jpg'
                },
                {
                    type: "iconsList",
                    data: [{
                            imgUrl: "../../static/img/icons1.png",
                        },
                        {
                            imgUrl: "../../static/img/icons2.png",
                        },
                        {
                            imgUrl: "../../static/img/icons3.png",
                        },
                        {
                            imgUrl: "../../static/img/icons4.png",
                        },
                        {
                            imgUrl: "../../static/img/icons5.png",
                        },
                        {
                            imgUrl: "../../static/img/icons6.png",
                        },
                        {
                            imgUrl: "../../static/img/icons7.png",
                        },
                        {
                            imgUrl: "../../static/img/icons8.png",
                        }
                    ]
                },
                {
                    type: "hotList",
                    data: results
                },

                {
                    type: 'commodityList',
                    data: commodityList
                },

            ]
        })
    })
});

router.get('/api/index_list/3/data/1', function(req, res, next) {
    let commodityList;
    connection.query("select * from goods where recommend='服饰内衣'", function(error, results, fields) {
        if (error) throw error;
        commodityList = results;
    });
    connection.query("select * from goods where category='服饰内衣'", function(error, results, fields) {
        if (error) throw error;
        res.json({
            code: '0',
            data: [{
                    type: "bannerList",
                    imgUrl: '../../static/img/swiper4.jpg'
                },
                {
                    type: "iconsList",
                    data: [{
                            imgUrl: "../../static/img/icons1.png",
                        },
                        {
                            imgUrl: "../../static/img/icons2.png",
                        },
                        {
                            imgUrl: "../../static/img/icons3.png",
                        },
                        {
                            imgUrl: "../../static/img/icons4.png",
                        },
                        {
                            imgUrl: "../../static/img/icons5.png",
                        },
                        {
                            imgUrl: "../../static/img/icons6.png",
                        },
                        {
                            imgUrl: "../../static/img/icons7.png",
                        },
                        {
                            imgUrl: "../../static/img/icons8.png",
                        }
                    ]
                },
                {
                    type: "hotList",
                    data: results
                },

                {
                    type: 'commodityList',
                    data: commodityList
                },

            ]
        })
    })
});

router.get('/api/index_list/4/data/1', function(req, res, next) {
    let commodityList;
    connection.query("select * from goods where recommend='鞋靴箱包'", function(error, results, fields) {
        if (error) throw error;
        commodityList = results;
    });
    connection.query("select * from goods where category='鞋靴箱包'", function(error, results, fields) {
        if (error) throw error;
        res.json({
            code: '0',
            data: [{
                    type: "bannerList",
                    imgUrl: '../../static/img/swiper1.jpg'
                },
                {
                    type: "iconsList",
                    data: [{
                            imgUrl: "../../static/img/icons1.png",
                        },
                        {
                            imgUrl: "../../static/img/icons2.png",
                        },
                        {
                            imgUrl: "../../static/img/icons3.png",
                        },
                        {
                            imgUrl: "../../static/img/icons4.png",
                        },
                        {
                            imgUrl: "../../static/img/icons5.png",
                        },
                        {
                            imgUrl: "../../static/img/icons6.png",
                        },
                        {
                            imgUrl: "../../static/img/icons7.png",
                        },
                        {
                            imgUrl: "../../static/img/icons8.png",
                        }
                    ]
                },
                {
                    type: "hotList",
                    data: results
                },

                {
                    type: 'commodityList',
                    data: commodityList
                },

            ]
        })
    })
});

router.get('/api/index_list/5/data/1', function(req, res, next) {
    let commodityList;
    connection.query("select * from goods where recommend='美妆个护'", function(error, results, fields) {
        if (error) throw error;
        commodityList = results;
    });
    connection.query("select * from goods where category='美妆个护'", function(error, results, fields) {
        if (error) throw error;
        res.json({
            code: '0',
            data: [{
                    type: "bannerList",
                    imgUrl: '../../static/img/swiper3.jpg'
                },
                {
                    type: "iconsList",
                    data: [{
                            imgUrl: "../../static/img/icons1.png",
                        },
                        {
                            imgUrl: "../../static/img/icons2.png",
                        },
                        {
                            imgUrl: "../../static/img/icons3.png",
                        },
                        {
                            imgUrl: "../../static/img/icons4.png",
                        },
                        {
                            imgUrl: "../../static/img/icons5.png",
                        },
                        {
                            imgUrl: "../../static/img/icons6.png",
                        },
                        {
                            imgUrl: "../../static/img/icons7.png",
                        },
                        {
                            imgUrl: "../../static/img/icons8.png",
                        }
                    ]
                },
                {
                    type: "hotList",
                    data: results
                },

                {
                    type: 'commodityList',
                    data: commodityList
                },

            ]
        })
    })
});


//----------------------------------------------------------
//管理员后台
//验证码
router.get('/code', (req, res) => {
    const cap = svgCaptcha.create({
        // 翻转颜色 
        inverse: false,
        // 字体大小 
        fontSize: 36,
        // 噪声线条数 
        noise: 2,
        // 宽度 
        width: 150,
        // 高度 
        height: 30,
        color: true,
        background: '#eee'
    });
    req.session = cap.text.toLowerCase();
    res.cookie('verificationCode', req.session);
    res.type('svg');
    res.send(cap.data)
})

//上传头像
router.post('/uploadAvatar', multer({ dest: 'public/img' }).single('file'), async(req, res) => {
    //修改上传的文件名
    fs.renameSync(req.file.path, `public/img/${req.file.originalname}`)
    let imgUrl = 'http://localhost:3000/' + req.file.originalname,
        { username } = req.body;
    connection.query("update user set imgUrl='" + imgUrl + "' where userName='" + username + "'", (errs, results) => {
        if (errs)
            throw err;
        res.json({ "status": 200, "imgUrl": imgUrl })
    })
})

//获取头像
router.get('/avatar', async(req, res) => {
    const { username } = req.query;
    connection.query("select imgUrl from user where userName='" + username + "'", (err, results) => {
        if (err)
            throw err;
        res.status(200).json({ results })
    })
})

// 注册
router.post('/register', async(req, res) => {
    const { username, password, phone, avatar } = req.body;
    connection.query("select * from user where userName='" + username + "'", (err, result) => {
        if (err)
            throw err;
        else if (result.length)
            return res.status(200).json({ msg: '该用户已存在' });
        else {
            let pwd = bcrypt.hashSync(password, salt);
            connection.query("insert into user set?", { userName: username, userPwd: pwd, phone, imgUrl: avatar, nickName: '超级管理员' }, (error, results) => {
                if (error)
                    throw error;
                res.status(200).json()
            })
        }

    })
})

// 登录
router.post('/login', (req, res) => {
    const { username, password } = req.body
    connection.query("select * from user where userName='" + username + "'", (err, results) => {
        if (err)
            throw err;
        let token = jwt.sign({ username }, username),
            isOk = bcrypt.compareSync(password, results[0].userPwd);
        isOk ? res.status(200).json({ results, token }) : res.status(200).json([])
    })
})

//更新用户
router.post('/updateUser', async(req, res) => {
    let { _id, username, phone, password } = req.body,
        pwd = bcrypt.hashSync(password, salt);
    connection.query("update user set userName='" + username + "',phone='" + phone + "',userPwd='" + pwd + "' where id='" + _id + "'", (err, results) => {
        if (err)
            throw err;
        res.status(200).json()
    })
})

//删除用户
router.get('/deleteUser', async(req, res) => {
    const { _id } = req.query;
    connection.query("delete from user where id='" + _id + "'", (err, results) => {
        if (err)
            throw err;
        res.status(200).json();
    })
})

//获取用户总数
router.get('/allUsers', async(req, res) => {
    connection.query("select * from user", (err, results) => {
        if (err)
            throw err;
        results.length ? res.status(200).json(results.length) : console.log('查询用户总数失败')
    })
})

//获取用户信息
router.get('/users', async(req, res) => {
    let { currentPage, pageSize, username } = req.query;
    let start = (currentPage - 1) * pageSize;
    connection.query(`select * from user where (nickname !="超级管理员" or userName="${username}") limit  ${start} ,${pageSize} `, (err, results) => {
        if (err)
            throw err;
        results ? res.status(200).json(results) : console.log('获取用户信息失败')
    })
})

//获取商品总数
router.get('/allGoods', async(req, res) => {
    let { currentPage, pageSize } = req.query;
    let start = (currentPage - 1) * pageSize;
    connection.query("select * from goods", (err, results) => {
        if (err)
            throw err;
        connection.query(`select * from goods limit  ${start} ,${pageSize} `, (errs, result) => {
            if (errs)
                throw errs;
            result.length ? res.status(200).json({ result, length: results.length }) : console.log('获取商品列表信息失败')
        })
    })
})

//获取商品列表信息
router.get('/goods', async(req, res) => {
    let { currentPage, pageSize } = req.query;
    let start = (currentPage - 1) * pageSize;
    connection.query(`select * from goods limit  ${start} ,${pageSize} `, (err, results) => {
        if (err)
            throw err;
        console.log(results);
        results.length ? res.status(200).json(results) : console.log('获取商品列表信息失败')
    })
})

//增加商品
router.post('/insertGoods', multer({ dest: 'public/img/goods' }).single('file'), (req, res) => {
    fs.renameSync(req.file.path, `public/img/goods/${req.file.originalname}`)
    let imgUrl = 'http://192.168.137.1:3000/goods/' + req.file.originalname;
    let { name, cprice, pprice, category } = req.body,
        discount = Number(cprice / pprice * 10).toFixed(1) + "折";
    connection.query("insert into goods set?", { imgUrl, name, cprice, pprice, discount, category }, (error, results) => {
        if (error)
            throw error;
        res.json({ "status": 200 })
    })
})

//修改商品
router.post('/editGood', multer({ dest: 'public/img/goods' }).single('file'), async(req, res) => {
    fs.renameSync(req.file.path, `public/img/goods/${req.file.originalname}`)
    let imgUrl = 'http://192.168.137.1:3000/goods/' + req.file.originalname;
    let { name, cprice, pprice, category, id } = req.body,
        discount = Number(cprice / pprice * 10).toFixed(1) + "折";
    connection.query("update goods set name='" + name + "',discount='" + discount + "', imgUrl='" + imgUrl + "',cprice='" + cprice + "',pprice='" + pprice + "',category='" + category + "' where id='" + id + "'", (error, results) => {
        if (error)
            throw error;
        res.json({ "status": 200 })
    })
})

//删除商品
router.get('/deleteGood', async(req, res) => {
    const { _id } = req.query;
    connection.query("delete from goods where id='" + _id + "'", (err, results) => {
        if (err)
            throw err;
        res.status(200).json();
    })
})

//查询订单
router.get('/orders', async(req, res) => {
    let { currentPage, pageSize } = req.query;
    let start = (currentPage - 1) * pageSize;
    connection.query("select * from goods_order", (err, results) => {
        if (err)
            throw err;
        connection.query(`select * from goods_order limit  ${start} ,${pageSize} `, (errs, result) => {
            if (errs)
                throw errs;
            result.length ? res.status(200).json({ result, length: results.length }) : console.log('获取订单列表信息失败')
        })
    })
})

//修改订单
router.post('/updateOrder', async(req, res) => {
    const { id, customer, total, pay, date } = req.body
    connection.query(`update  goods_order set customer='${customer}',total=${total},pay=${pay},date=${date} where id=${id} `, (err, result) => {
        if (err)
            throw err;
        res.status(200).json()
    })
})

//删除订单
router.get('/deleteOrder', async(req, res) => {
    connection.query(`delete from goods_order where id=${req.query._id} `, (err, result) => {
        if (err)
            throw err;
        res.status(200).json()
    })
})

//查询最近七次报表
router.get('/queryAllReport', async(err, res) => {
    connection.query(`select * from goods_order order by date desc limit 7  `, (err, result) => {
        if (err)
            throw err;
        res.status(200).json(result)
    })

})

module.exports = router;