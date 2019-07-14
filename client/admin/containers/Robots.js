import React, { Component}  from 'react'
import ReactDom from 'react-dom'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import SelectField from 'material-ui/SelectField'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import CircularProgress from 'material-ui/CircularProgress'


const initialState = {
	newRobots: '',
}

export default class Robots extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ robotsStr: '' }, initialState)
		
		this.axiosGetRobots = ::this.axiosGetRobots;
		this.reset = ::this.reset;
		this.update = ::this.update;

	}

	componentDidMount(){
		this.axiosGetRobots();
	}

	axiosGetRobots(){
		axios.get(`/api/robots`)
			 .then( res => this.setState({ robotsStr: res.data.data, newRobots: res.data.data }) )
	}

	reset(){
		this.setState({ newRobots: this.state.robotsStr })
	}

	update(){
		axios.post(`/api/robots/update`, { 
				str: this.state.newRobots
			 })
			 .then( res => this.setState({ robotsStr: this.state.newRobots }) )	
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col>
						<TextField 
							multiLine
							fullWidth
							rows={6}
							floatingLabelText={languageId === 0 ? 'robots.txt' : 'robots.txt'}
							value={this.state.newRobots}
							onChange={(e) => this.setState({ newRobots: e.target.value }) }/>
					</Col>
				</Row>
				<Row>
					<Col>
						<RaisedButton
							label={languageId === 0 ? 'Cancel' : 'Отменить'} 
							onClick={::this.reset}/>

						<RaisedButton
							label={languageId === 0 ? 'Save' : 'Сохранить'}
							style={{ marginLeft: 15 }} 
							onClick={::this.update}/>
					</Col>
				</Row>
			</div>
		)
	}

}