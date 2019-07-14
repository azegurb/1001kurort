import React, { Component } from 'react'
import UserDashboard from './dashboards/UserDashboard'
import DoctorDashboard from './dashboards/DoctorDashboard'
import HotelDashboard from './dashboards/HotelDashboard'

import axios from 'axios'

import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'


class ProfilePersonalDetails extends Component {

    componentWillMount() {
        const { history, profile } = this.props;
        if ( _.isEmpty(profile.user) || profile.user.account_type === 0 ) {
            history.replace({ pathname: '/auth/user' });
        }
		
		this.props.pageActions.updateIsLoadingPage(true);
    }

	componentDidMount(){
		this.props.pageActions.updateIsLoadingPage(false)
		this.props.pageActions.setNavigationPathNames([{ label: ['My profile', 'Мой профиль'], link: '/profile'}])
	}
	
	

	render() {
		
        const languageId = this.props.profile.languageId - 0;
        const userType = this.props.profile.user.account_type - 0;

        console.log(this.props)
		return(

			<div>
				{userType === 1 &&  <UserDashboard  data={this.props.profile.user} languageId={languageId}  />}
				{userType === 2 &&  <DoctorDashboard  data={this.props.profile.user} languageId={languageId}  />}
				{userType === 3 &&  <HotelDashboard  data={this.props.profile.user} languageId={languageId}  />}
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePersonalDetails);
