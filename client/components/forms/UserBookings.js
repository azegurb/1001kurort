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

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const initialState = {
}

export default class UserBookings extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ activeBookings: [], previousBookings: [] }, initialState)

		this.axiosGetBookings = ::this.axiosGetBookings;
	}

	componentWillMount(){
		this.axiosGetBookings()
	}

	axiosGetBookings() {
		axios.get('/api/booking/own', {
				params: {
					users_id: this.props.data.users_id,
				}
			})
			 .then( res => {

			 	let activeBookings 	 = [],
			 		previousBookings = [];

			 	res.data.data.map(item => {
			 		if( moment(new Date()).isSameOrAfter(item.date_end) ){
			 			previousBookings.push(item);
			 		} else {
			 			activeBookings.push(item);
			 		}
			 	})

			 	this.setState({ activeBookings, previousBookings })
			 })
	}

	render() {
		const languageId = this.props.languageId - 0;
		const { 
			activeBookings,
			previousBookings
		} = this.state;

		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col xl={6} style={{ marginTop: 15 }}>
						<h4>{languageId === 0 ? 'Active' : 'Активные'}</h4>
						{activeBookings.map(item => 
							<Row>
								<Col xs={12} sm={12} md={6} xl={6}>
									<p>{languageId === 0 ? `Sanatorium: ${item.h_sname}` : `Санаторий: ${item.h_sname}`}</p>
									<p>{languageId === 0 ? `Arrival: ${moment(item.date_start).format('YYYY-MM-DD')}` : `Заезд: ${moment(item.date_start).format('YYYY-MM-DD')}`}</p>
									<p>{languageId === 0 ? `Departure: ${moment(item.date_end).format('YYYY-MM-DD')}` : `Выезд: ${moment(item.date_end).format('YYYY-MM-DD')}`}</p>
									<p>{ languageId === 0 ? `Adults: ${item.adults}, childs: ${item.children}` : `Взрослых: ${item.adults}, детей: ${item.children}` }</p>
									<p>{ languageId === 0 ? `Price: ${item.total_price_for_guest} ${currency[item.user_price_currency]}` : `Цена: ${item.total_price_for_guest} ${currency[item.user_price_currency]}` }</p>
								</Col>
							</Row>
						)}
						<h4>{languageId === 0 ? 'Previous' : 'Предыдущие'}</h4>
						{previousBookings.map(item => 
							<Row>
								<Col xs={12} sm={12} md={6} xl={6}>
									<p>{languageId === 0 ? `Sanatorium: ${item.h_sname}` : `Санаторий: ${item.h_sname}`}</p>
									<p>{languageId === 0 ? `Arrival: ${moment(item.date_start).format('YYYY-MM-DD')}` : `Заезд: ${moment(item.date_start).format('YYYY-MM-DD')}`}</p>
									<p>{languageId === 0 ? `Departure: ${moment(item.date_end).format('YYYY-MM-DD')}` : `Выезд: ${moment(item.date_end).format('YYYY-MM-DD')}`}</p>
									<p>{ languageId === 0 ? `Adults: ${item.adults}, childs: ${item.children}` : `Взрослых: ${item.adults}, детей: ${item.children}` }</p>
									<p>{ languageId === 0 ? `Price: ${item.total_price_for_guest} ${currency[item.user_price_currency]}` : `Цена: ${item.total_price_for_guest} ${currency[item.user_price_currency]}` }</p>
								</Col>
							</Row>						
						)}						
					</Col>
				</Row>
			</div>
		)
	}

}