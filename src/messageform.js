"use strict";
import React from 'react'
import styles from './styles.js'

// import socketio from 'socket.io-client'

class MessageForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      logs: []
    }
  }
  
  componentDidMount () {
    // receive chat message
    this.props.socket.on('chat-msg', (msg) => {
      const logs2 = this.state.logs
      msg.key = 'key_' + (this.state.logs.length + 1)
      msg.styleColor = {color: msg.color}
      msg.datetimeJST = new Date(msg.datetime).toLocaleString({ timeZone: 'Asia/Tokyo' })
      console.log(msg)
      logs2.unshift(msg) // add msg
      if(logs2 == null) {
        console.log("warning:messageform:", logs2)
      }
      this.setState({logs: logs2})
    })


  }

  render () {
    // draw log
    const messages = this.state.logs.map(e => (
      <div key={e.key} style={styles.log}>
        <span style={styles.name}>{e.name}</span>
        <span style={styles.msg}><span style={e.styleColor}>: {e.message}</span></span>
        <span style={styles.time}>{e.datetimeJST} {e.ip}</span>
        <p style={{clear: 'both'}} />
      </div>
    ))
    return (
      <div>
        <div>{messages}</div>
      </div>
    )
  }
}
export default MessageForm;