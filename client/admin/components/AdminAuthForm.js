import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import NumberFormat from 'react-number-format'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Divider from 'material-ui/Divider'
import _ from 'lodash'
import { bindActionCreators } from 'redux';
import * as pageActions from '../../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'


class AdminAuthForm extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
    	login: '',
    	password: '',
    };

    this.handleLogin = ::this.handleLogin;
    this.handlePassword = ::this.handlePassword;
    this.onSubmit = ::this.onSubmit;
  }

  componentWillMount() {
    const { history, profile } = this.props;
    if ( !_.isEmpty(profile.user) ) {
        history.replace({ pathname: '/' });
    }
    this.props.pageActions.updateIsLoadingPage(true)
  }

  componentDidMount(){
    this.props.pageActions.updateIsLoadingPage(false)
    this.props.pageActions.setNavigationPathNames([{ label: ['My profile', 'Мой профиль'], link: '/profile'}])
  }
  
  onSubmit() { 

    let loginValid = Boolean(this.state.login.length >= 6 ),
        passwordValid = Boolean(this.state.password.length >= 6 )

    if( loginValid && passwordValid){
  		axios
        .get('/api/secret-admin/auth',{
  				  params : {
  					login : this.state.login,
  					password : this.state.password
				  }
			  })
  		  .then( response => {

          let jwt = response.data.data.id_token;
          this.props.pageActions.loginUser(jwt);
          this.props.history.push('/secret/dashboard')
          this.setState({ errorAuth: false })
        })
        .catch( err => {
          console.log(err)
          this.setState({ errorAuth: true })
        })   

    } else {

      this.setState({ errorLogin : !loginValid, errorPassword : !passwordValid }) 
    }

  }


  handleLogin(event, login ) {
    this.setState({ login: login || 0, errorLogin : Boolean(login.length < 6 )  })
  }

  handlePassword(event, password ) {
    this.setState({ password: password || 0, errorPassword : Boolean(password.length < 6 ) })
  }

  render(){

    const languageId = this.props.languageId;
    
    console.log(this.state)
    return(
    	<div style={{ marginTop: 100 }}>
            <form onSubmit={ this.onSubmit } className='small-form'>
                  <h5 className='header-text'> {languageId === 0 ? 'Admin panel' : 'Административная панель '} </h5>
                  <Divider />
                    <Row>
                        <Col>
                            <TextField
                              name='email'
                              floatingLabelText={languageId === 0 ? 'Login' : 'Логин'} 
                              errorText={ this.state.errorLogin && ( languageId === 0 ? 'Login must be more than 6 characters' : 'Логин должен быть больше 6  символов') }
                              onChange={ this.handleLogin } />
                        </Col>
                        <Col>
                            <TextField
                              name='password'
                              floatingLabelText={languageId === 0 ? 'Password' : 'Пароль'} 
                              errorText={ this.state.errorPassword && ( languageId === 0 ? 'Password must be more than 6 characters' : 'Пароль должен быть больше 6  символов') }
                              onChange={ this.handlePassword } />
                        </Col>

                        <Col>
                        	<RaisedButton 
                        		label={ languageId === 0 ? 'Go' : 'Войти' }
                        		onClick={ this.onSubmit }/>
                        </Col>
                        
                        <Col>
                        	{ this.state.errorAuth && <p style={{ marginTop: 10, color: 'red' }}>{ languageId === 0 ? 'Login or password invalid' : 'Логин или пароль неверны' }</p> }
                    	</Col>
                    </Row>
            </form>
        </div>
    )
  }
}



const mapDispatchToProps = (dispatch) => {
    return {
        pageActions: bindActionCreators(pageActions, dispatch),
    }
}

const mapStateToProps = ({ profile }) => ({
  profile,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminAuthForm);