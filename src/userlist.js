"use strict";
import React from 'react'

import socketio from 'socket.io-client'

class UserList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      users: [], 
      secondsElapsed: 0
    }
    this.tick = this.tick.bind(this)
  }
  
  componentDidMount () {
    // receive user message
    this.props.socket.on('user-msg', (obj) => {
      const users2 = []
      for(let i = 0; i < obj.user.length; i++){
        var temp_obj = {}
        temp_obj.name = obj.user[i]
        temp_obj.key = 'key_' + (users2.length + 1)
        users2.unshift(temp_obj) // add user
      }
      // console.log("user info:", users2)
      if(users2 == null) {
        console.log("warning:userlist:", )
      }
      this.setState({users: users2})
    })

    // set timer
    this.interval = setInterval(this.tick, 1000)
  }

  tick() {
    if(this.state.secondsElapsed >= 3 * 60){
    // if(this.state.secondsElapsed >= 10){
      this.setState({
        secondsElapsed: 0
      })
    }
    if(this.state.secondsElapsed === 0){
      var temp_name = this.props.name
      var temp_status = 1
      if(this.props.showEntryForm){
        temp_name = '??????'
        temp_status = 0
      }

      // send user message
      console.log('alive:', temp_name, temp_status)
      this.props.socket.emit('user-msg', {
        name: temp_name, 
        status: temp_status
      })

    }
    if(this.state.secondsElapsed == null) {
      console.log("warning:userlist:", this.state.secondsElapsed)
    }
    this.setState({
      secondsElapsed: parseInt(this.state.secondsElapsed) + 1
    })
  }

  render () {
    // write user
    const user_list = this.state.users.map(e => (
      <span key={e.key}>{e.name}　</span>
    ))
    return (
      <div>入室者：{user_list}</div>
    )
  }
}
export default UserList;