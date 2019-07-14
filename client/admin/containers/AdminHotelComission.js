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
}

export default class AdminHotelComission extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ hotels: [] }, initialState)

		this.axiosGetHotelsComissions = ::this.axiosGetHotelsComissions;
		this.updatePercentComission = ::this.updatePercentComission;
	}

	componentWillMount(){
		this.axiosGetHotelsComissions()
	}

	axiosGetHotelsComissions() {
		
		axios.get('/api/admin/hotel-comissions')
			 .then( res => this.setState({ hotels : res.data.data }))
	}

	updatePercentComission (users_id, comission_percent) {

		axios.post('/api/admin/hotel-comissions/update', {
				users_id,
				comission_percent,
			 })
			 .then( res => this.axiosGetHotelsComissions())	
	}

	render() {
		const languageId = this.props.languageId - 0;
		const {hotels} = this.state;
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col xl={6} style={{ marginTop: 15 }}>
						<h4>{languageId === 0 ? 'Your commission from bookings' : 'Ваша комиссия от бронирований'}</h4>
						{hotels.length 
							?	hotels.map( hotel => 
									<Row>
										<Col xs={6} xl={9}>
											<h3>{hotel.h_sname}</h3>
										</Col>
										<Col xs={6} xl={3}>
											<SelectField
												value={hotel.comission_percent}
												onChange={(e,i,value) => this.updatePercentComission(hotel.users_id, value) }
												style={{ marginTop: 10 }}
											>
												<MenuItem value={0 || null} primaryText='0 %' />
												<MenuItem value={1} primaryText='1 %' />
												<MenuItem value={2} primaryText='2 %' />
												<MenuItem value={3} primaryText='3 %' />
												<MenuItem value={4} primaryText='4 %' />
												<MenuItem value={5} primaryText='5 %' />
												<MenuItem value={6} primaryText='6 %' />
												<MenuItem value={7} primaryText='7 %' />
												<MenuItem value={8} primaryText='8 %' />
												<MenuItem value={9} primaryText='9 %' />
												<MenuItem value={10} primaryText='10 %' />
												<MenuItem value={11} primaryText='11 %' />
												<MenuItem value={12} primaryText='12 %' />
												<MenuItem value={13} primaryText='13 %' />
												<MenuItem value={14} primaryText='14 %' />
												<MenuItem value={15} primaryText='15 %' />
												<MenuItem value={16} primaryText='16 %' />
												<MenuItem value={17} primaryText='17 %' />
												<MenuItem value={18} primaryText='18 %' />
												<MenuItem value={19} primaryText='19 %' />
												<MenuItem value={20} primaryText='20 %' />
											</SelectField>
										</Col>
									</Row>
								) 
							: 	<p>{languageId === 0 ? 'Sanatoriums not found' : 'Санатории не найдены'}</p>
						}
					</Col>
				</Row>
			</div>
		)
	}

}