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
	bookings: [],
}

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const style = {
	popupRoom: {
		zIndex: 9999,
		top: 10,
	}
}

export default class Blog extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ articlesRes: [], articles: [] }, initialState)

		this.axiosGetBookings = ::this.axiosGetBookings;
		this.handleSort = ::this.handleSort;
		this.handleUpdateStatus = ::this.handleUpdateStatus;
		this.getMailAgree = ::this.getMailAgree;
		this.getAgree = ::this.getAgree;
	}

	componentWillMount(){
		this.axiosGetBookings()
	}

	axiosGetBookings() {
		axios
			.get('/admin/bookings/share')
			.then(response => {
				this.setState({ bookings: response.data.data || [] })
			})
	}

	handleSort(sortKey) {
		let curSortOrder = this.state.curSortKey !== sortKey ? 'asc' : ( this.state.curSortOrder === 'asc' ? 'desc' : 'asc' )

		this.setState({ 
			bookings: curSortOrder === 'asc' ? _.sortBy(this.state.bookings, [sortKey]) : _.sortBy(this.state.bookings, [sortKey]).reverse(), 
			curSortKey: sortKey, 
			curSortOrder
		})
	}

	handleUpdateStatus(orders_id, status, comment, getterEmail) {

		axios.post('/admin/bookings/share/update/status', {
			orders_id,
			status,
			comment,
			getterEmail,
		}).then( response => {
			this.axiosGetBookings() 
			this.setState({ confirmDialog: false })
		})
	}

	getMailAgree(bookingId, firstEmail, secondEmail){
		axios.post('/api/booking/funny-satellite/email/completed', { 
				bookingId,
				firstEmail,
				secondEmail,
			 })
			 .then( () => {
			 	this.axiosGetBookings()
			 })
	}

	getAgree(bookingId, firstEmail, secondEmail) {
		this.getMailAgree(bookingId, firstEmail, secondEmail)
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row style={{ marginTop: 20 }}>
					<Col>
						<table className='table-sanatorium-room'>
							<tbody>
								<tr>
									<th onClick={ () => this.handleSort('orders_id') } style={{ cursor: 'pointer' }}>
										{ languageId === 0 ? 'ID' : 'ИД' }
									</th>
									<th>{ languageId === 0 ? 'Booking details' : 'Детали брони' }</th>
									<th>{ languageId === 0 ? '1-st guest' : '1-ый гость' }</th>
									<th>{ languageId === 0 ? '2-nd guest' : '2-ой гость' }</th>
									<th onClick={ () => this.handleSort('status_id') } style={{ cursor: 'pointer' }}>
										{ languageId === 0 ? 'Status' : 'Статус' }
									</th>
								</tr>
							{
								this.state.bookings.length
								?	this.state.bookings.map( booking =>
										<tr style={{ textAlign: 'left' }}>
											<td>
												<p>{ booking.id }</p>
											</td>
											<td style={{ paddingLeft: 5, paddingRight: 5 }}>
												<p>
													{ languageId === 0 ? 'Rooms: ' : 'Номера: ' }
													{ booking.rooms.map( (room, index) =>  room.s_name + ', ' ) }
												</p>
												<p>
													{ languageId === 0 ? 'Days: ' : 'Дни: ' }
													{ moment(booking.start_date).format('DD.MM.YY') } -
													{ moment(booking.start_date).add(booking.nights_count, 'days').format('DD.MM.YY') },
												</p>
												<p>												
													{ languageId === 0 ? 'Total: ' : 'Всего: ' }
													{ booking.total_price_for_guest } { currency[booking.user_price_currency] }
												</p>
											</td>											
											<td className='hoverable-default-popup'>
												<ul>
													<li>{ booking.guest_contacts.name + ' ' + booking.guest_contacts.lastname }</li>
													<li>{ booking.guest_contacts.email }</li>
													<li>{ booking.guest_contacts.phone }</li>
												</ul>
											</td>
											<td style={{ textAlign: 'center' }}>
												{ booking.satellite_data ?
													<ul>
														<li>{ booking.satellite_data.first_name + ' ' + booking.satellite_data.last_name }</li>
														<li>{ booking.satellite_data.email }</li>
														<li>{ booking.satellite_data.phone }</li>
													</ul>
												 :  <p>{ languageId === 0 ? 'Indefined' : 'Не определен' }</p> }
											</td>
											<td>
												{
													( booking.satellite_data && booking.satellite_data.email ) && booking.guest_contacts.email &&
													<RaisedButton
														disabled={booking.status_id === 1}
														label={ 
															booking.status_id === 1 
															? 	(languageId === 0 ? 'Approved' : 'Подтверждено')
															: 	(languageId === 0 ? 'Get agree' : 'Подтвердить') 
														}
														onClick={ () => this.getAgree(booking.id, booking.guest_contacts.email, booking.satellite_data.email )}/>
												}
											</td>
											<div className='popup-default' style={ style.popupRoom }>К хуям</div>
										</tr>
									)
								: 	<tr>
										<td colSpan={12} className='center'>
											<p>{ languageId === 0 ? 'No bookings' : 'Нет бронирований' }</p>
										</td> 
									</tr>
							}
							</tbody>
						</table>
					</Col>
				</Row>
			</div>
		)
	}

}