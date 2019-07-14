import React, { Component } from 'react'
import {Col, Row, Container} from 'react-grid-system'
import { Link } from 'react-router-dom'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import axios from 'axios'

const style = {
  background: {
    width: '100%',
    height: '-webkit-fill-available',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'auto',
    zIndex: 999999999,
    background: '#58585887',
  },

  outer__container: {
    width: 600,
    height: 600,
    position: 'fixed',
    top: 300,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
  },

  inner__container: {
    padding: 15,
    background: '#fff',
    borderRadius: 3,
  },
}


const initialState = {
  open: false,
}

const resetSend = {
  open: false,
  mesText: '',
}

export default class PrivateMessageForm extends Component {
	
  constructor(props) {
    super(props);

    this.state =  initialState

    this.sendMessage = ::this.sendMessage;
  }

  componentWillMount(){
    const {senderData, getterData} = this.props

    this.setState({ 
      senderData,
      getterData,
    })
  }

  componentWillReceiveProps(nextProps){
    
    if(nextProps.open === true){
      this.setState({ 
        open: true,
      })
      this.props.resetOpen();      
    }

  }

  sendMessage () {
    const { senderId, getterId } = this.props

    axios.post('/api/messages/send',{
      reply: this.state.mesText,
      sender_id: senderId,
      getter_id: getterId, 
    }).then( () => this.setState(resetSend) )
  }

	render() {
    
    const languageId = this.props.languageId;
    const isAuthed = this.props.senderId ? true : false ; 
    console.log(this.props)

		return(
  			<div style={ this.state.open ? style.background : {} }>
          { this.state.open &&
            <div style={style.outer__container}>
              <Row style={style.inner__container}>
                <Col style={{ marginBottom: 10 }}>
                  <h4>{ languageId === 0 ? 'Sending message' : 'Отправка сообщения' }</h4>
                  <Divider />
                </Col>
                <Col>
                { isAuthed 
                  ? <TextField 
                      fullWidth
                      multiLine
                      rows={4}
                      hintText={ languageId === 0 ? 'text message' : 'текст сообщения' }
                      value={this.mesText}
                      onChange={ (e,mesText) => this.setState({ mesText }) } />
                  : <h4>{ languageId === 0 ? 'Sign in to send a message' : 'Авторизуйтесь, чтобы отправить сообщение' }</h4>
                }
                </Col>
                <Col style={{ marginTop: 10, textAlign: 'right' }}>
                  <RaisedButton 
                    label={ languageId === 0 ? 'Cancel': 'Отменить' }
                    onClick={ () => this.setState(resetSend) }
                    style={{ marginRight: 25 }}/>
                  <RaisedButton
                    disabled={ !isAuthed } 
                    label={ languageId === 0 ? 'Send': 'Отправить' }
                    onClick={this.sendMessage}/>

                </Col>
              </Row>
            </div> }
  			</div>
		)
	}
}
