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
	newSiteMap: '',
}

export default class SiteMap extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ siteMapStr: '' }, initialState)

	}

	componentDidMount(){
		this.axiosGetSiteMap();
	}

	axiosGetSiteMap(){
		axios.get(`/api/sitemap`)
			 .then( res => this.setState({ siteMapStr: res.data.data, newSiteMap: res.data.data }) )
	}

	reset(){
		this.setState({ newSiteMap: this.state.siteMapStr })
	}

	update(){
		axios.post(`/api/sitemap/update`, { 
				str: this.state.newSiteMap
			 })
			 .then( res => this.setState({ siteMapStr: this.state.newSiteMap }) )	
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
							floatingLabelText={languageId === 0 ? 'sitemap.xml' : 'sitemap.xml'}
							value={this.state.newSiteMap}
							onChange={(e) => this.setState({ newSiteMap: e.target.value }) }/>
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