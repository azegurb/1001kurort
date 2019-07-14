import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Divider from 'material-ui/Divider'
import { Link } from 'react-router-dom'

import SignInSocial from '../SignInSocial'

import axios from 'axios'

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const initialState = {
  email: '',
  password: '',
}

export default class AuthForm extends Component {

  constructor(props) {
    super(props);
    
    this.state = initialState;

    this.onSubmit = ::this.onSubmit;
  }

  componentWillMount() {

  }

  onSubmit(){

    this.props.onValidSubmit({
      email: this.state.email,
      password: this.state.password,
    })
  }

  render() {
    
    const languageId = this.props.languageId;
    const accountType = this.props.accountType;
    const accountPath = accountType === 1 ? 'user' : accountType === 2 ? 'doctor' : 'hotel' 

    return(

        <form onSubmit={ this.onSubmit } className='small-form'>
          <h5 className='header-text'>{
            languageId === 0 
            ? `Login as ${accountType === 1 ? 'user' : accountType === 2 ? 'doctor' : 'sanatorium' }` 
            : `Войти как ${accountType === 1 ? 'пользователь' : accountType === 2 ? 'врач-консультант' : 'санаторий' }`
          }</h5>
          <Divider />
          <Row>

              <Col  xs={12} sm={6}>
                  <TextField
                      value={this.state.email}
                      errorText={ this.state.errorEmail && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                      onChange={ (e,value) => this.setState({ email: value, errorEmail: !Boolean(regExpEmail.test(value)) })}
                      floatingLabelText={languageId === 0 ? 'E-mail' : 'Електронная почта'} />
              </Col>
              <Col  xs={12} sm={6}>
                  <TextField
                      value={this.state.password}
                      errorText={ this.state.errorPassword && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                      onChange={ (e,value) => this.setState({ password: value, errorPassword: !Boolean(value) })}                      
                      floatingLabelText={languageId === 0 ? 'Password' : 'Пароль'} />
              </Col>

          </Row>
          <Row>
              <Col>
                <RaisedButton
                  disabled={ !this.state.email || this.state.errorEmail || !this.state.password || this.state.errorPassword }
                  label={languageId === 0 ? 'Log in' : 'Войти'}
                  onClick={ this.onSubmit } />
              </Col>
          </Row>
          <Row>

              <Col style={{ marginTop: 10 }}>
                <Divider style={{ marginBottom: 10 }}/>
                <SignInSocial auth={true} languageId={languageId} userType={accountType}/>
              </Col>
         
          </Row>
          <Row>

              <Col xs={12}>
                <Link to={`/register/${accountPath}`}><p style={{ marginTop : '20px'}}> {languageId === 0 ? 'Don`t have account? Register right now' : 'Еще нет аккаунта? Зарегестрируйтесь прямо сейчас'}</p></Link>
              </Col>

          </Row>
        </form>
    )
  }

}
