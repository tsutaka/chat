"use strict";
import React from 'react'
import styles from './styles.js'

class EntryForm extends React.Component {
  constructor (props) {
    super(props)
    var temp = String(decodeURIComponent(document.cookie).split(";")[0])
    temp = ((temp + ';').match("name" + '=([^¥S;]*)')||[])[1]
    if(temp == null) {
      console.log("warning:entryform")
    }
    this.state = { 
      name: temp
    }
  }

  componentDidMount () {
    this.interval = setInterval(this.tick, 1000)

    this.refs['name_text'].focus(); // init focus
  }

  nameChanged (e) {
    this.setState({name: e.target.value})
  }
  
  login () {
    if(this.state.name === ""){
      console.log("empty name")
      return
    }
    this.props.loginChat(this.state.name)
    console.log("login")
  }

  onKeyDownEnter (e) {
    if(e.keyCode == 13){ //Enter
      this.login()
    }
  }

  render () {
    return (
      <div style={styles.form}>
        名前(必須入力):
        <input value={this.state.name}
          onChange={e => this.nameChanged(e)}
          onKeyDown={e => this.onKeyDownEnter(e)} 
          ref="name_text" />
        <button onClick={e => this.login()}>入室</button>
      </div>
    )
  }
}
export default EntryForm;
