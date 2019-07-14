import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Hidden, Visible} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'
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

export default class Header extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = {
		}
	}

	componentWillMount() {

	}

	render() {
        const languageId = this.props.profile.languageId - 0;
        const style = {
        	container: {
        		position: 'absolute',
        		top: 45,
        		width: '100%',

        	},

        	innerContainer: {
        		margin: 'auto',
        		maxWidth: '1130px',
        		textAlign: 'center',
        		padding: 7,
        		color: '#fff',
        		fontWeight: 800,
        	},
        }

        return(
        	
        		<div style={style.container}>
        			<div style={style.innerContainer} className='in-dev-background'>
        					<h1>{ languageId === 0 ? 'This is a test version, in the near future we will launch production' : 'Это тестовая версия, в ближайшее время мы запустим production'}</h1>
        			</div>
				</div>		
		)
	}
}