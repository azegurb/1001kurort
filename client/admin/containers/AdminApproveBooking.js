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
import Checkbox from 'material-ui/Checkbox';


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
		this.handleSettled = ::this.handleSettled;
	}

	componentWillMount(){
		this.axiosGetBookings()
	}

	axiosGetBookings() {
		axios
			.get('/admin/bookings/no-share')
			.then(response => {
				console.log(response)
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

		axios.post('/admin/bookings/no-share/update/status', {
			orders_id,
			status,
			comment,
			getterEmail,
		}).then( response => {
			this.axiosGetBookings() 
			this.setState({ confirmDialog: false })
		})
	}

	handleSettled(id, is_settled) {

		axios.post('/admin/booking/status/settled/update', {
			id,
			is_settled,
		}).then( response => {
			this.axiosGetBookings() 
			this.setState({ confirmDialog: false })
		})
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
									<th>{ languageId === 0 ? 'Full name' : 'ФИО' }</th>
									<th onClick={ () => this.handleSort('h_sname') } style={{ cursor: 'pointer' }}>
										{ languageId === 0 ? 'Sanatorium' : 'Санаторий' }
									</th>
									<th>{ languageId === 0 ? 'Details' : 'Детали' }</th>
									<th onClick={ () => this.handleSort('created') } style={{ cursor: 'pointer' }}>
									{ languageId === 0 ? 'Booked' : 'Забронирован' }
									</th>
									<th onClick={ () => this.handleSort('status_id') } style={{ cursor: 'pointer' }}>
										{ languageId === 0 ? 'Status' : 'Статус' }
									</th>
								</tr>
							{
								this.state.bookings.length
								?	this.state.bookings.map( booking =>
										<tr>
											<td>
												<p>{ booking.id }</p>
											</td>
											<td className='hoverable-default-popup'>
												<p>{ booking.guest_contacts.name + ' ' + booking.guest_contacts.lastname }</p>
											</td>
											<td>
												<p>{ booking.h_sname }, { languageId === 0 ? booking.kurort : booking.kurort_ru }</p>
											</td>
											<td style={{ textAlign: 'left' }}>
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
													{ booking.total_price_for_guest } { currency[booking.user_price_currency] };
												</p>
												<p>{ languageId === 0 ? 'Email:' : 'Емейл' } { booking.guest_contacts.email }</p>
												<p>{ languageId === 0 ? 'Tel:' : 'Тел.' } { booking.guest_contacts.phone }</p>
											</td>
											<td>
												<p>{ moment(booking.created).format('DD/MM/YY') }</p>
											</td>
											<td>
												{ booking.status_id === 1
													? <Checkbox checked={languageId === 0 ? 'Settled' : 'Заселился'} onCheck={(e,value) => this.handleSettled(booking.id, booking.guests_is_settled)} />
													: ( !this.state.confirmDialog || (this.state.confirmDialog && this.state.confirm_id !== booking.id)
														?	<SelectField
																disabled={ booking.status_id === 1 }
																value={booking.status_id}
																onChange={ (e,i,status) => this.setState({ confirmDialog: true, confirm_id: booking.id, confirm_status: status, getterEmail: booking.guest_contacts.email }) }
															>
																<MenuItem value={-1} primaryText={ languageId === 0 ? 'Decline' : 'Отклонить' } />
																<MenuItem value={1} primaryText={ languageId === 0 ? 'Approve' : 'Подтвердить' } />
																<MenuItem value={0} primaryText={ languageId === 0 ? 'Not confirmed' : 'Не подтвержден' } />
															</SelectField>
														: 	<Row>
																<Col>
																	<TextField
																		fullWidth
																		multiLine
																		rows={3}
																		hintText={ languageId === 0 ? 'Comment action' : 'Прокомментируйте действие' }
																		value={this.state.commentAction}
																		onChange={ (e, commentAction) => this.setState({ commentAction}) }
																		style={{ paddingLeft: 15, paddingRight: 15 }}/>
																</Col>
																<Col xs={6}>
																	<i 
																		className="fa fa-times"
																		aria-hidden="true" 
																		style={{ color: 'red', cursor: 'pointer' }}
																		onClick={ () => this.setState({ confirmDialog: false, confirm_id: null, confirm_status: null }) }
																	></i>
																</Col>
																<Col xs={6}>
																	<i 
																		className="fa fa-check" 
																		aria-hidden="true" 
																		style={{ color: '#55c901', cursor: 'pointer' }}
																		onClick={ () => this.handleUpdateStatus(this.state.confirm_id, this.state.confirm_status, this.state.commentAction, this.state.getterEmail) }
																	></i>
																</Col>
															</Row>
													)
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