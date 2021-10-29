const express = require('express')
//模板引擎
const mustacheExpress = require('mustache-express');
const multer = require('multer')
const fs = require('fs')
const path = require("path")
const os = require("os")
//dest 设置保存到哪个文件夹下
const upload = multer({ dest: '/uploads' });
const app = express()
const port = 3000
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
//添加中间件用于解析表单请求体 json与x-www-form-urlencoded的格式
app.use(express.json())
app.use(express.urlencoded())
const mysql = require('mysql')

app.get('/',(req,res)=>{
  res.render('user')
})

app.get('/user',(req,res)=>{
  res.render('user')
})

app.get('/getpic/:id', (req, res) => {
  fs.readFile(`./uploads/${req.params.id}`, (err, data) => {
    res.set('Content-Type', 'image/jpeg')
    res.send(data)
  })
})

// 对应name叫做file的
app.post('/addpic', upload.single('file'), (req, res) => {
  //连接数据库
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'picture_database'
  })
  var imges = req.file
  //读取图片的数据流
  fs.readFile(imges.path, (err, data) => {
    if (err) {
      console.log("图片上传失败")
      return;
    }
    //给图片设置一个不会重复的名字
    var imgesori = imges.originalname
    var radname = Date.now() + parseInt(Math.random() * 999)
    var oriname = imgesori.lastIndexOf('.')
    var hzm = imgesori.substring(oriname, oriname.length)
    var pic = radname + hzm
    //图片写入文件夹
    fs.writeFile(path.join(__dirname, './uploads/' + pic), data, (err) => {
      if (err) {
        console.log("图片写入失败！")
        res.send({
          code: -1,
          msg: "图片上传失败！"
        })
        return
      }
      const couter = os.networkInterfaces()
      for (var cm in couter) {
        var cms = couter[cm]
      }
      var picPath = "http://" + cms[1].address + ':3000' + '/getpic/' + pic
      var post = { http_src: picPath, pic_name: pic };
      connection.connect()
      connection.query("INSERT INTO pic_store SET ?", post, function (
        error,
        results,
        fields
      ) {
        res.render('home', { url: picPath })
      });
      connection.end()
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})