import React, { Component } from 'react'
import { Route } from 'react-router-dom';
import { Link } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'

const styles = {

	wrapper: {
		margin: '100px auto',
		padding: 15,
		textAlign: 'center',
		background: '#a8cadf',
	},

	title: { 
		fontSize: 24,
	},
}

class ErrorPage extends Component {

    componentWillMount(){
        this.props.pageActions.updateIsLoadingPage(true);
    }

	componentDidMount(){
	    this.props.pageActions.updateIsLoadingPage(false);
	}

	render() {
        const languageId = this.props.profile.languageId - 0;
        const url = process.env.API_URL + this.props.location.pathname

	  	return (
		    <Route render={({ staticContext }) => {
		      if (staticContext) {
		        staticContext.status = 500;
		      }

		      return (
				<div style={styles.wrapper}>
					<h1 style={styles.title}>{languageId === 0 ? 'Error 500' : 'Ошибка 500' }</h1>
					<img src='/images/logo-no-fon.png' />
					<h3>{languageId === 0 ? 'Internal server error, try again later' : 'Внутренняя ошибка сервера, попробуйте позже' }</h3>
				</div>
		      )
		    }}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(ErrorPage);
