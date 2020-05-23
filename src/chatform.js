"use strict";
import React from 'react'
import styles from './styles.js'

// import socketio from 'socket.io-client'

class ChatForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = { message: '' }
    // console.log("child", this.props.name)
  }

  componentDidMount () {
    this.interval = setInterval(this.tick, 1000)

    this.refs['msg_text'].focus(); // init focus
  }
  
  messageChanged (e) {
    if(e.target.value == null) {
      console.log("warning:chatform")
    }
    this.setState({message: e.target.value})
  }
  
  send () {
    if(this.state.message !== ""){
      this.props.socket.emit('chat-msg', {
        name: this.props.name,
        message: this.state.message,
        color: '#000000'
      })
      this.setState({message: ''}) // clear field
    }
  }

  onKeyDownEnter (e) {
    if(e.keyCode == 13){ //Enter
      this.send()
    }
  }

  logoff () {
    this.props.logoffChat()
    this.props.socket.emit('chat-msg', {
      name: 'System',
      message: '★★★「' + this.props.name + '」さんが退室しました★★★'
    })
    this.props.socket.emit('user-msg', {
      name: this.props.name, 
      status: 0
    })
    // console.log("logoff")
  }

  render () {
    return (
      <div style={styles.form}>
        名前:
        { this.props.name }　
        メッセージ:
        <input value={this.state.message}
          onKeyDown={e => this.onKeyDownEnter(e)}
          onChange={e => this.messageChanged(e)}
          ref="msg_text" />
        <button onClick={e => this.send()}>送信</button><br />
        <button onClick={e => this.logoff()}>退室</button><br />
      </div>
    )
  }
}
export default ChatForm;