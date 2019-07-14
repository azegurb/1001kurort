import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'


class TermsAndConditions extends Component {

    componentWillMount() {
	    this.props.pageActions.updateIsLoadingPage(true);
    }

	componentDidMount(){
	    this.props.pageActions.updateIsLoadingPage(false);
	}

	render() {
		return(
				<Paper zDepth={1} className='paper'>
					Правила бронирования 1001kurorts
				</Paper>

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

export default connect(mapStateToProps, mapDispatchToProps)(TermsAndConditions);