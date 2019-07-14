import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import AlertContainer from 'react-alert'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import {indigo50} from 'material-ui/styles/colors'
import { Link } from 'react-router-dom'

import axios from 'axios'

import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'

import RegFormUser from '../components/forms/RegFormUser'
import RegFormHotel from '../components/forms/RegFormHotel'
import RegFormDoctor from '../components/forms/RegFormDoctor'

const alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'dark',
    time: 4000,
    transition: 'scale'
}

class Register extends Component {

	constructor(props) {
		super(props);
		
		this.state = {
			open: false,
			FreeLogin : true,
			LoginValid : false,
			PasswordValid : false,
			EmailValid : false
		};

		this.regAccount = ::this.regAccount;

	}

    componentWillMount() {
        const { history, profile } = this.props;
        if ( !_.isEmpty(profile.user) ) {
            history.replace({ pathname: '/' });
        }
	    
	    this.props.pageActions.updateIsLoadingPage(true);
    }

	componentDidMount(){
	    this.props.pageActions.updateIsLoadingPage(false);
	}
	
  	updateAccountProfileProps(id_token){
  		
  	}

	regAccount(values, account_type) {
		
		console.log(values,account_type)
		
		// 0 - admin  
		// 1 - user
		// 2 - doctor  
		// 3 - hotel 

        const languageId = this.props.profile.languageId - 0;

        axios
        .post('/api/account/reg', Object.assign({ account_type }, values) )
		.then( response => {
			if(response.status === 200){
                let jwt = response.data.id_token;

                this.msg.success(languageId === 0 ? 'You have been successfully registered' : 'Вы были успешно зарегестрированы');
				this.props.pageActions.loginUser(jwt);
                setTimeout(() => {this.props.history.push('/profile')}, 3000);

			} else this.msg.error(languageId === 0 ? response.data.error[languageId] : response.data.error[languageId]);
		})

	}

	render() {

		const languageId = this.props.profile.languageId - 0;
		const pathname = this.props.location.pathname
		const accountName = this.props.location.pathname === '/register/user' ? 'user' : this.props.location.pathname === '/register/doctor' ? 'doctor' : this.props.location.pathname === '/register/hotel' ? 'hotel' : 0
		const account_type = this.props.location.pathname === '/register/user' ? 1 : this.props.location.pathname === '/register/doctor' ? 2 : this.props.location.pathname === '/register/hotel' ? 3 : 0
		
		return(
			<div>
				<Row>

					<Col sm={10} md={8} lg={8} xl={6} offset={{sm: 1, md: 2, lg: 2, xl: 3}}>
						{ pathname === '/register/user' && <RegFormUser languageId={languageId} account_type={account_type} onValidSubmit={ (values) => { ::this.regAccount(values, account_type ) } } /> }
						{ pathname === '/register/doctor' && <RegFormDoctor languageId={languageId} account_type={account_type} onValidSubmit={ (values) => { ::this.regAccount(values, account_type ) } }/> }
						{ pathname === '/register/hotel' && <RegFormHotel languageId={languageId} account_type={account_type} onValidSubmit={ (values) => { ::this.regAccount(values, account_type) } }/> }
						<Link to={`/auth/${accountName}`} className='center'><p style={{ marginTop : '20px'}}> {languageId === 0 ? 'Sign in to your account' : 'Войти в аккаунт'}</p></Link>
						<AlertContainer ref={a => this.msg = a} {...alertOptions} style={{width: '100%', textAlign: 'center'}}/>
					</Col>

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

export default connect(mapStateToProps, mapDispatchToProps)(Register);