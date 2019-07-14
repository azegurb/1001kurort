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

class NotFound extends Component {

    componentWillMount() {
	    this.props.pageActions.updateIsLoadingPage(true);
    }

	componentDidMount(){
	    this.props.pageActions.updateIsLoadingPage(false);
	}

	render() {
        const languageId = this.props.profile.languageId - 0;

	  	return (
		    <Route render={({ staticContext }) => {
		      if (staticContext) {
		        staticContext.status = 404;
		      }

		      return (
				<div style={styles.wrapper}>
					<h2 style={styles.title}>{languageId === 0 ? 'Error 404' : 'Ошибка 404' }</h2>
					<img src='/images/error404.png' />
					<h3>{languageId === 0 ? 'Page does not exist, check the address' : 'Страница не существует, проверьте корректность адреса' }</h3>
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

export default connect(mapStateToProps, mapDispatchToProps)(NotFound);