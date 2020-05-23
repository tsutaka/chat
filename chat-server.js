// HTTP server init
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const portNo = 3001
server.listen(portNo, () => {
  console.log('', 'http://localhost:' + portNo)
})

app.use('/public', express.static('./public'))
app.get('/', (req, res) => { 
  res.redirect(302, '/public')
})

//WebSocket server init
const socketio = require('socket.io')
const io = socketio.listen(server)
const mysql = require('mysql')

let fs = require('fs');
let ini = require('ini');
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
//eg. config.ini
//host = "www.xxxx.com"
//user = "xxxx"
//password = "xxxx"
//port = nnnn
//database = "xxxx"
const connection = mysql.createConnection({
	host : config.host,
  user : config.user,
  password : config.password,
  port : config.port,
	database: config.database
})

const get_now_date = () => {
  var dd = new Date()
  var YYYY = dd.getFullYear()
  var MM = dd.getMonth()+1
  var DD = dd.getDate()
  var hh = dd.getHours();
  var mm = dd.getMinutes();
  var ss = dd.getSeconds();
  return YYYY + "-" + MM + "-" + DD + " " + hh + ":" + mm + ":" + ss
}

const update_chat_user = (name, status) => {
  //chat-user update
  var sql = 'INSERT INTO ' + 
  '`chat_user`(`name`, `ip`, `datetime`, `status`) ' + 
  "VALUES (?,?,?,?) " + //INSERT
  'ON DUPLICATE KEY UPDATE ' + 
  "datetime=?, status=?" //UPDATE
  var now_date = get_now_date();
  var args = [
    name, //name
    "0.0.0.0", //IP
    now_date, //datetime
    status, //0:entry, 1:room
    now_date, //datetime
    status //0:entry, 1:room
  ]
  // console.log('insert user: ' + args)
  if(name !== "System"){
    // console.log('insert: ' + args)
    connection.query(
      sql, args, function (err, result) {
      if (err) { 
        console.log('sql: ' + sql)
        console.log('err user_log query: ' + err)
        return
      } 
    })
  }
}

//connection
io.on('connection', (socket) => {
  console.log('connection:', socket.client.id)
  
  //send old message
  connection.query(
      'SELECT * FROM ' + 
      '(SELECT * from chat ORDER BY time DESC LIMIT 50) AS A ' + 
      'ORDER BY time ASC;', 
      function (err, rows, fields) {
    if (err) { 
      console.log('err select query: ' + err)
      return
    } 
    for(var i = 0; i < rows.length; i++){
      // console.log('name: ' + rows[i].name + ', text: ' + rows[i].text);
      io.emit('chat-msg', {
        name: rows[i].name,
        message: rows[i].text
      })
    }
  
  })

  // recieve message
  socket.on('chat-msg', (msg) => {
    //send all clients
    console.log('message:', msg)
    io.emit('chat-msg', msg)

    //insert db
    // console.log(msg['name'] + ": " + msg['message'])
    var sql = 'INSERT INTO ' + 
    '`chat`(`id`, `time`, `name`, `text`, `ip_address`, `color`) ' + 
    'VALUES (NULL,?,?,?,?,?)'
    var now_date = get_now_date();
    // var address = socket.handshake.address;
    var args = [
      now_date, //datetime
      msg['name'], //name
      msg['message'], //text
      "0.0.0.0", //IP
      "#000000"
    ]
    // console.log('insert chat: ' + args)
    connection.query(
      sql, args, function (err, result) {
      if (err) { 
        console.log('err insert query: ' + err)
        return
      } 
    })

    //chat-user update
    update_chat_user(msg['name'], 1)

  })

  //recieve user message
  socket.on('user-msg', (msg) => {
    //insert db
    update_chat_user(msg['name'], msg['status'], connection)
    
    //send all clients
    var sql = 'SELECT DISTINCT name, ip ' +
    'FROM `chat_user` ' + 
    'WHERE DATE_ADD(datetime, INTERVAL 3 MINUTE) > NOW() AND status != 0'
    var people_list = []
    connection.query(sql, [], function (err, rows, fields) {
      if (err) { 
        console.log('err select query: ' + err)
        return
      } 
      for(var i = 0; i < rows.length; i++){
        if(rows[i].name !== '??????'){
          people_list.unshift(String(rows[i].name))
        }
      }
      var str = '{"user": ['
      for(let i = 0; i < people_list.length; i++){
        str = str + '"' + people_list[i] +'", ';  
      }
      if(people_list.length > 0){
        str = str.substr(0, str.length - 2)
      }
      str = str + ']}'
      var res = JSON.parse(str)
      // console.log('user info:', res)
      io.emit('user-msg', res)
    })
  })
})
