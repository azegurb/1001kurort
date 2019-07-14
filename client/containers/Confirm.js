import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'

import axios from 'axios'

import jwt_decode from 'jwt-decode'

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/



class Confirm extends Component {

	componentWillMount() {
	    this.props.pageActions.updateIsLoadingPage(true);

		axios.post('/api/account/confirm',
			{
				id : this.props.match.params.id,
				is_email: regExpEmail.test(this.props.match.params.id)
			}
		)

	}

	componentDidMount(){
	    this.props.pageActions.updateIsLoadingPage(false);
	}

	render() {
        const languageId = this.props.profile.languageId - 0;
        const url = process.env.API_URL + this.props.location.pathname
		
		return( 
				<Paper zDepth={1} style={{ padding: 10, margin: 'auto', textAlign: 'center', width: 400, minHeight: 200, maxWidth: '80%', marginTop: '10%', marginBottom: '10%' }}>
                    <i className="fa fa-check-circle-o" aria-hidden="true" style={{ fontSize: 90, color: '#4cc708' }}></i>
                    <p>{ languageId === 0 ? 'Your account has been verified!' : 'Ваш аккаунт подтвержден!'}</p> 
                    <Link to='/'>{ languageId === 0 ? 'Go home' : 'На главную' } </Link>
                </Paper>
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

export default connect(mapStateToProps, mapDispatchToProps)(Confirm);
