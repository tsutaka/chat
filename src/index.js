"use strict";
import React from 'react'
import ReactDOM from 'react-dom'
import EntryForm from './entryform.js'
import ChatForm from './chatform.js'
import UserList from './userlist.js'
import MessageForm from './messageform.js'
import host from './config.js'

import socketio from 'socket.io-client'
const socket = socketio.connect('http://' + host + ':3001')
// const socket = socketio.connect('http://localhost:3001')


// define main component
class ChatApp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showEntryForm: true, 
      showChatForm: false,
      name: ''
    }
    this.loginChat = this.loginChat.bind(this)
    this.logoffChat = this.logoffChat.bind(this)
    
  }
  loginChat (value){
    this.setState({
      showEntryForm: false, 
      showChatForm: true,
      name: value
    })
    socket.emit('chat-msg', {
      name: 'System',
      message: '★★★「' + value + '」さんが入室しました★★★'
    })
    socket.emit('user-msg', {
      name: value, 
      status: 1
    })
    //set cookie
    document.cookie = //"name=riki;"
      "name=" + encodeURIComponent(value) + ";max-age=36000;"

    console.log("cookie:", decodeURIComponent(document.cookie).split(";"))
  }
  logoffChat (){
    this.setState({
      showEntryForm: true, 
      showChatForm: false, 
      name:""
    })
  }
  render () {
    return (
      <div>
        {this.state.showEntryForm ? 
          <EntryForm 
            loginChat={this.loginChat} 
            /> 
          : null}
        {this.state.showChatForm ? 
          <ChatForm 
            logoffChat={this.logoffChat} 
            name={this.state.name} 
            socket={socket} 
            /> 
          : null}
        <UserList 
          name={this.state.name}
          showEntryForm={this.state.showEntryForm} 
          socket={socket} 
          />
        <MessageForm 
        socket={socket} />
      </div>
    )
  }
}

// write to DOM
ReactDOM.render(
  <ChatApp />,
  document.getElementById('root'))
