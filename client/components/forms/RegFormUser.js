import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import NumberFormat from 'react-number-format'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Divider from 'material-ui/Divider'

import SignInSocial from '../SignInSocial'

import axios from 'axios'

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default class RegFormUser extends Component {

  constructor(props) {
    super(props);
    
    this.state = {};

    this.onSubmit = ::this.onSubmit;
    this.handleEmail = ::this.handleEmail;
    this.handlePassword = ::this.handlePassword;
    this.handleConfPassword = ::this.handleConfPassword;
  }


  onSubmit(){ 

    let emailValid = regExpEmail.test(this.state.email),
        passwordValid = this.state.password && this.state.password.length > 0,
        confPasswordValid = this.state.password === this.state.confPassword,
        values = {}

    if( emailValid && passwordValid && confPasswordValid){
      
      values.email = this.state.email 
      values.password = this.state.password 
      
      this.props.onValidSubmit(values) 
    } else {

      this.setState({ errorEmail : !emailValid, errorPassword : !passwordValid, errorConfPassword : !confPasswordValid }) 
    }

  }


  handleEmail(event, email ){
    this.setState({ email, errorEmail : !regExpEmail.test(email) })
  }

  handlePassword(event, password ){
    this.setState({ password, errorPassword : !Boolean(password ) })
  }

  handleConfPassword(event, confPassword ){
    this.setState({ confPassword, errorConfPassword : !Boolean(confPassword === this.state.password) })
  }

  render(){

    const languageId = this.props.languageId;
    const account_type = this.props.account_type;
    
    console.log(this.state)
    return(

            <form onSubmit={ this.onSubmit } className='small-form'>
                  <h5 className='header-text'> {languageId === 0 ? 'Register as user' : 'Регистрация пользователя '} </h5>
                  <Divider />
                    <Row>

                        <Col>
                            <TextField
                              name='email'
                              floatingLabelText={languageId === 0 ? 'E-mail' : 'Електронная почта'} 
                              errorText={ this.state.errorEmail && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ this.handleEmail } />
                        </Col>
                        <Col>
                            <TextField
                              name='password'
                              floatingLabelText={languageId === 0 ? 'Password' : 'Пароль'} 
                              errorText={ this.state.errorPassword && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ this.handlePassword } />
                        </Col>

                        <Col>
                            <TextField
                              name='confPassword'
                              floatingLabelText={languageId === 0 ? 'Confirm password' : 'Подтверждение пароля'} 
                              errorText={ this.state.errorConfPassword && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ this.handleConfPassword } />
                        </Col>

                    </Row>
                    <Row className="form-button">

                        <RaisedButton
                            label={languageId === 0 ? 'Sign Up' : 'Зарегестрироваться'}
                            onClick={ this.onSubmit } />
                    </Row>
                    <Row>

                      <Col xs={12} style={{ marginTop: 10 }}>
                          <Divider style={{ marginBottom: 10 }}/>
                          <SignInSocial auth={false} account_type={account_type}/>
                      </Col>

                    </Row>
            </form>




    )
  }
}
