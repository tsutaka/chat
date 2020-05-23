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
    this.props.socket.on('chat-msg', (obj) => {
      const logs2 = this.state.logs
      obj.key = 'key_' + (this.state.logs.length + 1)
      // console.log(obj)
      logs2.unshift(obj) // add msg
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
        <span style={styles.msg}>: {e.message}</span>
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