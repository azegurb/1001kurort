import React, { Component } from 'react'

import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'

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

export default class Logout extends Component {
    componentWillMount() {
        const { history } = this.props;
        this.props.logoutUser().then( () => {
            history.replace({ pathname: '/auth' });
        })
    }

    render() {

        return(

            <div/>
        )
    }
}