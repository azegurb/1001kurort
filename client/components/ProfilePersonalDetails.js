import React, { Component } from 'react'
import UserFormProfileInfo from './forms/UserFormProfileInfo'
import DoctorFormProfileInfo from './forms/DoctorFormProfileInfo'
import HotelsMyProfile from './forms/HotelsMyProfile'

import axios from 'axios'

import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'

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

export default class ProfilePersonalDetails extends Component {

    componentWillMount() {
        const { history, profile } = this.props;
        if ( _.isEmpty(profile.user) ) {
            history.replace({ pathname: '/auth' });
        }
    }

	updateProfile(values) {
		
		axios.post('/api/profile/info/update',
			{
				firstname : values.firstname,
				lastname : values.lastname,
				password : values.password,
				email : values.email,
				contactnumber : values.contactnumber
			}
		)
		.then(response =>{
			if(response.status === 200){
                this.msg.success('Yuo have been successfully registered');
				let jwt = response.data.id_token;
				this.props.pageActions.loginUser(jwt);
				this.setState({ authError : false });
				
                setTimeout(() => {this.props.history.push('/')}, 1000);

			} else {
				this.msg.error('Failed operation');
				this.setState({ authError : true})
			}			
		})
		
	}
	
	render() {
		
        const languageId = this.props.profile.languageId - 0;
        const userType = this.props.profile.user.userType

		return(

			<div>
						

				{ userType === 1 &&  <UserFormProfileInfo 
											onValidSubmit= { (values) => { ::this.updateProfile( values, userType ) } }  
											data= {this.props.profile.user}
											languageId={languageId}  /> }

				{ userType === 2 &&  <DoctorFormProfileInfo 
											onValidSubmit= { (values) => { ::this.updateProfile( values, userType ) } }  
											data= {this.props.profile.user}
											languageId={languageId}  /> }

				{ userType === 3 &&  <DoctorFormProfileInfo 
											onValidSubmit= { (values) => { ::this.updateProfile( values, userType ) } }  
											data= {this.props.profile.user}
											languageId={languageId}  /> }

			</div>
		)
	}
}