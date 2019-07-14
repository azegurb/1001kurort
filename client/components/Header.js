import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Hidden, Visible} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton'
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu';
import PersonOutline from 'material-ui/svg-icons/social/person-outline';
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton';
import {withRouter} from 'react-router-dom'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'
import axios from 'axios'
import Cookies from 'universal-cookie';
import AlertContainer from 'react-alert'
import $ from 'jquery';

import SignInSocial from './SignInSocial'

const alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'dark',
    time: 4000,
    transition: 'scale'
}

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

class Header extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = {
			skypeNumber: 'kurort1001',
			phoneNumber: '+994702830707',
			showAccountMenu: false,
			showAuthForm: false,
			email: '',
			password: '',
			openDropDown: false,
			doAnimate: false,
		}

		this.handleCurrency = ::this.handleCurrency;
		this.handleChangeLanguage = ::this.handleChangeLanguage;
		this.tryAuthorize = ::this.tryAuthorize;
		this.logout = ::this.logout;
        this.startInterval = ::this.startInterval;
        this.intervalAction = ::this.intervalAction;

	}

	componentWillMount() {

		this.props.pageActions.updateUser();
    }
	
	componentDidMount() {
        
        if(typeof window !== 'undefined') {
        	$('#reg-banner').css('display', 'none')
            this.startInterval();
        }

	}

    startInterval(){
        let intervalValid = setInterval(  () => this.intervalAction(), 30000 );
        this.setState({ intervalValid })        
    }

    intervalAction(){
    	this.setState({ doAnimate: true }, () => setTimeout(500, this.setState({ doAnimate: false }) ) )
    }

	logout() {
		this.setState({ showAccountMenu: false, showAuthForm: false })
		this.props.pageActions.logoutUser()
	}

    handleChangeLanguage(event, index, value) {
        this.props.pageActions.changeLanguage(value);
    }

	handleCurrency(event, index, value) {
        this.props.pageActions.changeCurrency(value);
    }

	tryAuthorize() {
		this.setState({ showAccountMenu: false, showAuthForm: false })
        const languageId = this.props.profile.languageId - 0;

		axios.get('/api/account/auth',{
			params : {
				type: 1,
				email : this.state.email,
				password : this.state.password,
			}
		})
		.then(response =>{

			if(response.status === 200){
				let jwt = response.data.id_token;
				
                this.msg.success(languageId === 0 ? 'Authorisation success': 'Вы успешно зашли');
				this.setState({ showAccountMenu: false, authError : false });
				this.props.pageActions.loginUser(jwt);
				
			} 
		})
		.catch( err => {
		
			this.msg.error(languageId === 0 ? 'Wrong Email or Password' : 'Неправильная почта или пароль');
			this.setState({ showAccountMenu: false, authError : true });
			console.log(err);
		})

	}

	render() {
		let {user} = this.props.profile;
		let photo = user && (user.avatar  ? user.avatar : '/images/men.jpg' );
        const languageId = this.props.profile.languageId - 0;
		const currencyId = this.props.profile.currencyId - 0;

        return(
        	
        		<div className='header'>
        			<AlertContainer ref={a => this.msg = a} {...alertOptions} />

					<Row style={{ maxWidth: '1160px', margin: '0 auto' }}>


						<Col xs={4} sm={4} lg={2} xl={2} className='center'>
							<Link to='/' > 
								<img src='/images/logo-no-fon.png' style={{ width: '200px', padding: 4 }}/>
							</Link>
						</Col>

						<Hidden xs >
							<Col sm={5} md={4} lg={3} xl={3}>
								<DropDownMenu
									menuStyle={{ backgroundColor: 'rgb(243, 243, 243)' }}
									selectedMenuItemStyle={{ color: 'rgb(73, 196, 7)' }}
									menuItemStyle={{ color: '#000', fontSize: '15px' }}
									labelStyle={{ color: '#373f47', fontSize: '15px' }}
									underlineStyle={{ borderTop: 0 }}
									value={languageId}
									onChange={this.handleChangeLanguage} >

										<MenuItem value={0} primaryText="Eng" />
										<MenuItem value={1} primaryText="Рус" />
								</DropDownMenu>					
								<DropDownMenu 
									menuStyle={{ backgroundColor: 'rgb(243, 243, 243)' }}
									selectedMenuItemStyle={{ color: 'rgb(73, 196, 7)' }}
									menuItemStyle={{ color: '#000', fontSize: '15px' }}
									labelStyle={{ color: '#373f47', fontSize: '15px' }}
									underlineStyle={{ borderTop: 0 }}
									value={currencyId}
									onChange={this.handleCurrency} >

										<MenuItem value={0} primaryText="USD" />
										<MenuItem value={1} primaryText="RUB" />
										<MenuItem value={2} primaryText="AZN" />
										<MenuItem value={3} primaryText="KZT" />
										<MenuItem value={4} primaryText="EUR" />
								</DropDownMenu>
							</Col>
						</Hidden>

						<Hidden xs sm md>
							<Col lg={3} xl={3} style={{ marginTop: 10 }}>
								<i className='fa fa-phone fa-2x' aria-hidden="true" style={{ float: 'left', marginTop: 15 }}></i>
								<small style={{ marginLeft: 15 }}>{ languageId === 0 ? 'Mobile phone' : 'Мобильный тел.' }</small><br/>
								<a href={ 'tel:' + this.state.phoneNumber }>
									<FlatButton
										label={this.state.phoneNumber} 
										style={{ height: 20, lineHeight: 0 }}/>
								</a>
							</Col>

							<Col lg={3} xl={2} style={{ marginTop: 10 }}>
								<i className='fa fa-skype fa-2x' aria-hidden="true" style={{ float: 'left', marginTop: 15 }}></i>
								<small style={{ marginLeft: 15 }}>{ languageId === 0 ? 'Skype' : 'Skype' }</small><br/>
								<a href="skype:kurort1001?call">
									<FlatButton 
										label={this.state.skypeNumber} 
										style={{ height: 20, lineHeight: 0 }}/>	
								</a>						
							</Col>
						</Hidden>					
						
						<Hidden xs sm md lg>
						{ user && (user.id || user.account_type === 0) ?
							
							<Col lg={2} xl={2} style={{ textAlign: 'right', paddingLeft: 0, paddingRight: 0 }}>
								<div style={{ height: 64, maxHeight: 64, float: 'right', cursor: 'pointer' }}>
									<i className="fa fa-user-circle fa-2x" aria-hidden="true" style={{ lineHeight: '64px' }}></i>
									<p 
										style={{ float: 'right', lineHeight: '64px', padding: '0 20px', textTransform: 'uppercase', textDecoration: 'underline' }} 
										onClick={ (event) => this.setState({ showAccountMenu : true, anchorEl: event.currentTarget }) }
									>
										{ 
											(user.first_name || user.h_sname || user.login || 'No name' ).length > 10 
											? `${ (user.first_name || user.h_sname || user.login || 'No name' ).slice(0, 10) }...` 
											: (user.first_name || user.h_sname || user.login || 'No name' )
										}
									</p>
								</div>
								<Popover
									open={this.state.showAccountMenu }
									anchorEl={this.state.anchorEl}
									anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
									targetOrigin={{horizontal: 'left', vertical: 'top'}}
									onRequestClose={ () => this.setState({ showAccountMenu : false }) }
								>
									<Menu>
										<Link to={ user.account_type === 0 ? '/secret/dashboard' : '/profile' } >
											<MenuItem primaryText={ languageId === 0 ? 'Profile' : 'Профиль' } />
										</Link>
										<MenuItem onClick={ ::this.logout } primaryText={ languageId === 0 ? 'Logout' : 'Выйти' } /> 
									</Menu>
								</Popover>
							</Col>
						:
							
							<Col lg={2} xl={2} style={{ marginTop: 15, position: 'relative', textAlign: 'right', paddingLeft: 0, paddingRight: 0 }}>
								<FlatButton 
									label={ languageId === 0 ? 'Log In' : 'Войти' } 
									icon={  <i className="fa fa-user-circle fa-2x" aria-hidden="true" style={{ marginLeft: 10 }}/> }
									labelStyle={{ fontSize: '12px' }}
									style={{ float: 'right' }}
									onClick={ (event) => this.setState({ showAuthForm : true, anchorElAuth: event.currentTarget }) }/>
								
								<div id='reg-banner'>
									<p className='speech'>
										{ languageId === 0 ? 'Register and get discount up ' : 'Регистрируйтесь и получите скидку ' } 
										<b>{ languageId === 0 ? 'to' : 'до' } 35% </b>
									</p>
								</div>					
							</Col>	

						}
						</Hidden>

						<Visible xs sm md lg>
								<IconMenu
									iconButtonElement={
										<IconButton 
											iconStyle={{ width: 48, height: 48 }} 
											style={{ width: 60, height: 60, padding: 8 }}
											onClick={() => this.setState({ openDropDown: !this.state.openDropDown })}
										>
											<MenuIcon hoverColor='#4283b6' />
										</IconButton>
									}
									anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
									targetOrigin={{horizontal: 'left', vertical: 'top'}}
									style={{ float: 'right', right: '5%' }}
									open={this.state.openDropDown}
								>							
							
									<Visible xs sm md>
										<small style={{ padding: '0 20px', float: 'right' }}>{ languageId === 0 ? 'Links' : 'Ссылки' }</small>
										<Divider style={{ backgroundColor: '#4283b6' }}/>
										<Link to='/ask_doctor'> 
											<MenuItem 
												insetChildren
												primaryText={ languageId === 0 ? 'Ask doctor' : 'Спросить врача' }
												onClick={() => this.setState({ openDropDown: false })} /> 
										</Link>
										<Link to='/blog'> 
											<MenuItem 
												insetChildren
												primaryText={ languageId === 0 ? 'Blog' : 'Блог' }
												onClick={() => this.setState({ openDropDown: false })} /> 
										</Link>
										<Link to='/turs'> 
											<MenuItem 
												insetChildren
												primaryText={ languageId === 0 ? 'Turs' : 'Туры' }
												onClick={() => this.setState({ openDropDown: false })} /> 
										</Link>	
									</Visible>

									<small style={{ padding: '0 20px', float: 'right' }}>{ languageId === 0 ? 'Account' : 'Аккаунт' }</small>
									<Divider style={{ backgroundColor: '#4283b6' }}/>									
									{ !(user && user.id) ?
										<Link to='/register/user'> 
											<MenuItem 
												insetChildren 
												rightIcon={ <i className="fa fa-user-circle fa-2x" aria-hidden="true" style={{ top: -3 }}/>  } 
												primaryText={ languageId === 0 ? 'Sign Up' : 'Зарегистрироваться' }
												onClick={() => this.setState({ openDropDown: false })} /> 
										</Link>
									: 	<Link to={ user.account_type === 0 ? '/secret/dashboard' : '/profile' } >
											<MenuItem 
												insetChildren
												primaryText={ languageId === 0 ? 'Profile' : 'Профиль' }
												onClick={() => this.setState({ openDropDown: false })} /> 
										</Link>
									}
									{ !(user && user.id) ?
										<Link to='/auth/user'> 
											<MenuItem 
												insetChildren
												primaryText={ languageId === 0 ? 'Log In' : 'Войти' }
												onClick={() => this.setState({ openDropDown: false })} /> 
										</Link>
									: 	<MenuItem onClick={ ::this.logout } insetChildren primaryText={ languageId === 0 ? 'Logout' : 'Выйти' } /> 
									}
									<Visible xs sm md >
										<div style={{ marginTop: 10, marginBottom: 10 }}>
										</div>
											<small style={{ padding: '0 20px', float: 'right', marginTop: -10 }}>{ languageId === 0 ? 'Call us' : 'Позвоните нам' }</small>
											<Divider style={{ backgroundColor: '#4283b6' }}/>	
										<div style={{ marginTop: 10, marginBottom: 10 }}>
										</div>											<a href={ 'tel:' + this.state.phoneNumber }> 
												<MenuItem 
													insetChildren 
													rightIcon={ <i className="fa fa-phone fa-2x" aria-hidden="true" style={{ top: -3 }}/>  }											
													primaryText={ languageId === 0 ? 'Mobile phone' : 'Мобильный тел.' }
													onClick={() => this.setState({ openDropDown: false })} /> 
											</a>
											<a href="skype:mslava97?call"> 
												<MenuItem 
													insetChildren 
													rightIcon={ <i className="fa fa-skype fa-2x" aria-hidden="true" style={{ top: -3 }}/>  }										
													primaryText={ languageId === 0 ? 'Skype' : 'Skype' }
													onClick={() => this.setState({ openDropDown: false })} /> 
											</a>
									</Visible>

									<Visible xs sm>
										<div style={{ marginTop: 20, marginBottom: 10 }}>
										</div>
											<small style={{ padding: '0 20px', float: 'right', marginTop: -10 }}>{ languageId === 0 ? 'Language' : 'Язык' }</small>
											<Divider style={{ backgroundColor: '#4283b6' }}/>	
										<div style={{ marginTop: 10, marginBottom: 10, paddingLeft: 70}}>
											<div style={{ cursor: 'pointer' }} onClick={() => this.setState({ openDropDown: false }, this.props.pageActions.changeLanguage(0))}>
												<img src='/images/EN.png' className="flag" /> En
											</div>

											<div style={{ cursor: 'pointer' }} onClick={() => this.setState({ openDropDown: false }, this.props.pageActions.changeLanguage(1))}>
												<img src='/images/RU.png' className="flag" /> Рус
											</div>
										</div>
									</Visible>
									<Visible xs sm>
										<div style={{ marginTop: 20, marginBottom: 10 }}>
										</div>
											<small style={{ padding: '0 20px', float: 'right', marginTop: -10 }}>{ languageId === 0 ? 'Currency' : 'Валюта' }</small>
											<Divider style={{ backgroundColor: '#4283b6' }}/>	
										<div style={{ marginTop: 10, marginBottom: 10, paddingLeft: 70}}>
											<div style={{ cursor: 'pointer' }} onClick={() => this.setState({ openDropDown: false }, this.handleCurrency(null, null, 0))}>
												<p>USD</p>
											</div>
											<div style={{ cursor: 'pointer' }} onClick={() => this.setState({ openDropDown: false }, this.handleCurrency(null, null, 1))}>
												<p>RUB</p>
											</div>
											<div style={{ cursor: 'pointer' }} onClick={() => this.setState({ openDropDown: false }, this.handleCurrency(null, null, 2))}>
												<p>AZN</p>
											</div>
											<div style={{ cursor: 'pointer' }} onClick={() => this.setState({ openDropDown: false }, this.handleCurrency(null, null, 3))}>
												<p>KZT</p>
											</div>
											<div style={{ cursor: 'pointer' }} onClick={() => this.setState({ openDropDown: false }, this.handleCurrency(null, null, 4))}>
												<p>EUR</p>
											</div>
										</div>
									</Visible>
								</IconMenu>
						</Visible>

						<Popover
							open={this.state.showAuthForm }
							anchorEl={this.state.anchorElAuth }
							anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
							targetOrigin={{horizontal: 'left', vertical: 'top'}}
							onRequestClose={ () => this.setState({ showAuthForm : false }) }
							style={{ width: 300, marginTop: 11 }}
						>
							<Row style={{ marginLeft: 0, marginRight: 0 }}>
								<Col>
									<TextField
										floatingLabelText={ languageId === 0 ? 'Email' : 'Емейл' }
										errorText={ this.state.errorEmail && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
										value={ this.state.email }
										onChange={ (e,email) => this.setState({ email, errorEmail: !regExpEmail.test(email) }) }/>
								</Col>
								<Col>
									<TextField
										floatingLabelText={ languageId === 0 ? 'Password' : 'Пароль' }
										erorText={ this.state.errorPassword && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
										value={ this.state.password }
										type='password'
										onChange={ (e,password) => this.setState({ password, errorPassword: !Boolean(password) }) }/>

								</Col>
								<Col>
									<FlatButton
										fullWidth
										disabled={ !this.state.email || this.state.errorEmail || !this.state.password || this.state.errorPassword }
										label={ languageId === 0 ? 'Log in' : 'Войти' }
										onClick={this.tryAuthorize} />
								</Col>
								<Col>
									<Divider style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}/>
								</Col>
								<Col style={{ marginTop: 10, marginBottom: 10, textAlign: 'center' }}>
									<SignInSocial auth={true} languageId={languageId} userType={1}/>
								</Col>
								<Col className='center' style={{ paddingTop: 10, paddingBottom: 33 }}>
									<Link to='/register/user' style={{ textDecoration: 'underline' }}>
										<p>
                                        	{ languageId === 0 ? 'Register account now' : 'Зарегистрироваться сейчас' }
                                        </p>
									</Link>
								</Col>
							</Row>
						</Popover>
					</Row>
				</div>		
		)
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        pageActions: bindActionCreators(pageActions, dispatch)
    }
}

const mapStateToProps = ({ profile }) => ({
  profile,
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);