import React, { Component } from 'react'
import Divider from 'material-ui/Divider'
import AlertContainer from 'react-alert'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'

import AuthForm from '../components/forms/AuthForm'

const  alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'dark',
    time: 4000,
    transition: 'scale'
}

class Auth extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = {
			open: false
		};
		
		this.tryAuthorize = ::this.tryAuthorize;
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

	tryAuthorize(values) {
        const languageId = this.props.profile.languageId - 0;
        const pathname = this.props.location.pathname
        let accountType = 0
        
        if(pathname === '/auth/user'){
        	accountType = 1
        }else if( pathname === '/auth/doctor'){
        	accountType = 2
        }else if ( pathname === '/auth/hotel'){
        	accountType = 3
        }

		axios.get('/api/account/auth',{
			params : {
				type : accountType,
				email : values.email,
				password : values.password
			}
		})
		.then(response =>{
			if(response.status === 200){
				let jwt = response.data.id_token;
				
                this.msg.success(languageId === 0 ? 'Authorisation success': 'Вы успешно зашли');
				this.props.pageActions.loginUser(jwt);
				this.setState({ authError : false });
				
                setTimeout(() => {this.props.history.push('/profile')}, 1000);

			}		
		})
		.catch( err => {
			console.log(err)
			this.msg.error(languageId === 0 ? 'Wrong Email or Password' : 'Неправильная почта или пароль');
			this.setState({ authError : true})
		})

	}



	render() {
        const languageId = this.props.profile.languageId - 0;
        const accountType = this.props.location.pathname === '/auth/user' ? 1 : this.props.location.pathname === '/auth/doctor' ? 2 : this.props.location.pathname === '/auth/hotel' ? 3 : 0

        return(
			<div>
				<Row>
					<Col sm={10} md={8} lg={8} xl={6} offset={{sm: 1, md: 2, lg: 2, xl: 3}}>
						<AuthForm languageId={languageId} onValidSubmit={ (values) => this.tryAuthorize(values) } accountType={accountType}/>
						<AlertContainer ref={a => this.msg = a} {...alertOptions} />				
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Auth));