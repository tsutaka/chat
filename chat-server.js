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

const insert_chat_message = (conn, msg, ip) => {
  var sql = 'INSERT INTO ' + 
  '`chat`(`id`, `time`, `name`, `text`, `ip_address`, `color`) ' + 
  'VALUES (NULL,?,?,?,?,?)'
  var now_date = get_now_date();
  // var address = socket.handshake.address;
  var args = [
    now_date, //datetime
    msg['name'], //name
    msg['message'], //text
    ip, //IP
    msg['color']
  ]
  // console.log('insert chat: ' + args)
  conn.query(
    sql, args, function (err, result) {
    if (err) { 
      console.log('err insert query: ' + err)
      return
    } 
  })
}

const update_chat_user = (conn, msg, ip, status) => {
  //chat-user update
  var sql = 'INSERT INTO ' + 
  '`chat_user`(`name`, `ip`, `datetime`, `status`) ' + 
  "VALUES (?,?,?,?) " + //INSERT
  'ON DUPLICATE KEY UPDATE ' + 
  "datetime=?, status=?" //UPDATE
  var now_date = get_now_date();
  var args = [
    msg['name'], //name
    ip, //IP
    now_date, //datetime
    status, //0:entry, 1:room
    now_date, //datetime
    status //0:entry, 1:room
  ]
  // console.log('insert user: ' + args)
  if(msg['name'] !== "System"){
    // console.log('insert: ' + args)
    conn.query(
      sql, args, function (err, result) {
      if (err) { 
        console.log('err user_log query: ' + err)
      } 
    })
  }
}

const select_recent_message = (conn) => {
  var sql = 'SELECT * FROM ' + 
  '(SELECT * from chat ORDER BY time DESC LIMIT 20) AS A ' + 
  'ORDER BY time ASC'
  conn.query(sql, function (err, rows, fields) {
    if (err) { 
      console.log('err select query: ' + err)
    } 
    send_msg(rows)
  })
}

const send_msg = (rows) => {
  for(var i = 0; i < rows.length; i++){
    io.emit('chat-msg', {
      name: rows[i].name,
      message: rows[i].text, 
      color: rows[i].color
    })
  }
}

const select_recent_user = (conn) => {
  var sql = 'SELECT DISTINCT name, ip ' +
  'FROM `chat_user` ' + 
  'WHERE DATE_ADD(datetime, INTERVAL 3 MINUTE) > NOW() AND status != 0'
  conn.query(sql, [], function (err, rows, fields) {
    if (err) { 
      console.log('err select query: ' + err)
    } 
    send_user_info(rows)
  })
}

const send_user_info = (rows) => {
  var people_list = []
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
}

//connection
io.on('connection', (socket) => {
  var address = socket.handshake.address
  var address_temp = address.split(":")
  var ip_address = address_temp[address_temp.length - 1]
  console.log('connection:', socket.client.id, ",", ip_address)
  
  //send old message
  var rows = select_recent_message(connection)

  // recieve message
  socket.on('chat-msg', (msg) => {
    //send all clients
    console.log('message:', msg)
    io.emit('chat-msg', msg)

    //insert db
    insert_chat_message(connection, msg, ip_address)

    //chat-user update
    update_chat_user(connection, msg, ip_address, 1)

  })

  //recieve user message
  socket.on('user-msg', (msg) => {
    //insert db
    update_chat_user(connection, msg, ip_address, msg['status'])
    
    //send all clients
    var rows = select_recent_user(connection)
  })

})
