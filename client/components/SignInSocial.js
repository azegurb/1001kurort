import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import FacebookLogin from 'react-facebook-login'
import GoogleLogin from 'react-google-login'
import {withRouter} from 'react-router-dom'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'

function mapStateToProps(state) {
	return {
		profile: state.profile
	}
}

function mapDispatchToProps(dispatch) {
	return {
		pageActions: bindActionCreators(pageActions, dispatch)
	}
}

@connect(mapStateToProps, mapDispatchToProps)

 class SignInSocial extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = {}

		this.responseSocial = ::this.responseSocial;
	}	

	responseSocial(response, auth_via, userType ){
		let getParams = {},
			postParams = {}

		if(auth_via === 'facebook'){
			getParams = {
				params : {
					auth_via : auth_via,
					social_id : response.userID ,
				}
			}
			postParams = {
				account_type: userType,
				auth_via : auth_via,
				social_id : response.userID,
				first_name : response.first_name || '',
				last_name: response.last_name || '',
				email: response.email || '',
				picture: response.picture ? response.picture.url : ''
			}
		}else if( auth_via === 'google'){
			getParams = {
				params : {
					auth_via : auth_via,
					social_id : response.profileObj.googleId ,
				}
			}
			postParams = {
				account_type: userType,
				auth_via : auth_via,
				social_id : response.profileObj.googleId ,
				first_name : response.profileObj.givenName || '',
				last_name: response.profileObj.familyName || '',
				email: response.profileObj.email || '',
				picture: response.profileObj.imageUrl ? response.profileObj.imageUrl : ''
			}			
		}

		if( this.props.auth){

			console.log('reg by social')
			console.log(postParams)			
			axios
				.get('/api/account/auth',getParams)
				.then( response => {
					let jwt = response.data.id_token;

					this.props.pageActions.loginUser(jwt);
					this.setState({ authError : false });
	                setTimeout(() => {this.props.history.push('/profile')}, 1000);
				})	
		}else{

			console.log('reg by social')
			console.log(postParams)
			axios
				.post('/api/account/reg',postParams)
				.then( response => {

					let jwt = response.data.id_token;

					this.props.pageActions.loginUser(jwt);
					setTimeout(() => {this.props.history.push('/profile')}, 3000);	
				})			
		}

	}

	render() {

		const languageId = this.props.languageId - 0;
		console.log(this.props)

		return(
			<div >
				<div>
					<Row>
						<Col>
							<FacebookLogin
								appId='123715308261227'
								autoLoad={true}
								fields='first_name,last_name,picture,email'
								callback={ (res) => this.responseSocial(res, 'facebook', this.props.account_type) }
								cssClass='facebook'
							/>						
						</Col>
					</Row>
					<Row style={{ marginTop: 10 }}>
						<Col>
							<GoogleLogin
								clientId='633761574590-tlkg49j9ds12auqv766purvjtnmqo72b.apps.googleusercontent.com'
								buttonText='Login with Google+'
								onSuccess={ (res) => this.responseSocial(res, 'google', this.props.account_type) }
								onFailure={ (err) => { console.log(err) } }
							/>							
						</Col>
					</Row>



				</div>
				
				<div  id='status'/>			
			</div>
		)
	}
}

export default withRouter(SignInSocial)