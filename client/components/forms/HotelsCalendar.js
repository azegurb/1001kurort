import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import DatePicker from 'material-ui/DatePicker'
import {List, ListItem} from 'material-ui/List'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import _ from 'lodash'
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import Edit from 'material-ui/svg-icons/editor/border-color'
import axios from 'axios'
import moment from 'moment'
import { extendMoment } from 'moment-range'
import $ from 'jquery';

import BookingCalendar from '../BookingCalendar'

const momentRange = extendMoment(moment)
const DateTimeFormat = global.Intl.DateTimeFormat;

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const roomTypePeople = {

	1: { label : [ 'Single', 'Для одного'] } ,
	2: { label : [ 'Double/ Twin', 'Для двоих'], key : 2 } ,
	3: { label : [ 'Triple', 'Для троих'], key : 3 } ,
	4: { label : [ 'Quadruple', 'Для четверых'], key : 4 } ,
	5: { label : [ 'Five', 'Для пяти'], key : 5 } ,
	6: { label : [ 'Six', 'Для шести'], key : 6 } ,
	7: { label : [ 'Seven', 'Для семи'], key : 7 } ,
	8: { label : [ 'Eight', 'Для восьми'], key : 7 } ,
	9: { label : [ 'Nine', 'Для девятерых'], key : 9 } ,
	10: { label : [ 'Ten', 'Для десятерых'], key : 10 },
	11: { label : [ 'For 11', 'Для 11'], key : 11 } ,
	12: { label : [ 'For 12', 'Для 12'], key : 12 } ,
	13: { label : [ 'For 13', 'Для 13'], key : 13 } ,
	14: { label : [ 'For 14', 'Для 14'], key : 14 } ,
	15: { label : [ 'For 15', 'Для 15'], key : 15 } ,
}

const initialState =	{
							openChangingItem: false,
							isChangingAvailableRooms : false,
							changingCategoryLabel: null,
							changingRoomData: [],
							changingRoomPrices: [],
							calendar: [],
							days: [],
							roomFields: [],
							rooms: [],
							dateStart: moment( new Date).toDate(),
							dateEnd: moment( new Date).add(1, 'month').toDate(),
							dateRangeError: false
						}


export default class HotelsCalendar extends Component {
	

	constructor(props) {
		super(props);

		this.state = initialState

	    this.getDaysArray = ::this.getDaysArray;
	    this.handleNextMonth = ::this.handleNextMonth;
	    this.handlePreviousMonth = ::this.handlePreviousMonth;
	    this.changeShowDates = ::this.changeShowDates;
	    this.handleChangeAvailableRooms = ::this.handleChangeAvailableRooms;
	    this.handleChangingStartFromDate = ::this.handleChangingStartFromDate;
	    this.handlChangingeEndToDate = ::this.handlChangingeEndToDate;
	    this.handleChangeRoomPrice = ::this.handleChangeRoomPrice;
	    this.handleOpenChangingItemPrice = ::this.handleOpenChangingItemPrice;
	    this.handleCurrency = ::this.handleCurrency;
	    this.handleRoomMaxPeople = ::this.handleRoomMaxPeople;
	    this.handleTypeChangingPrice = ::this.handleTypeChangingPrice;
	    this.updateItem = ::this.updateItem;
	}


	componentWillMount() {

		axios.get('/api/profile/hotel/rooms',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			this.setState ({ rooms : response.data.data }) 
		})

		axios.get('/api/profile/hotel/price-categories',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			let result = []
			
			result.push({ id: -1 , label: this.props.languageId === 0 ? 'Rooms to sell' : 'Комнат для сдачи'})

			response.data.data.map( item => {

				result.push({
					id: item.category_id,
					label : item.name,
					room_ids : item.rooms_id
				})
			})

			this.setState({ roomFields : result })
		})		


		this.getDaysArray()

	}

	getDaysArray() {

		let days = [],
			dateStart = this.state.dateStart,
			dateEnd = this.state.dateEnd

		axios.get('/api/profile/hotel/calendar',
			{
				params : {
					users_id : this.props.data.users_id,
					date_start: moment(dateStart).format('YYYY-MM-DD'),
					date_end: moment(dateEnd).format('YYYY-MM-DD'),
				}
			}
		).then( response => {
			
			response.data.days.map( item =>
				days.push({ 
					date: item.g, 
					short_date: moment(item.g).format('DD MMM'), 
					full_date: moment(item.g).format('YYYY-MM-DD'), 
				})
			)

			_.sortBy( response.data.calendar, 'sname')

			this.setState({ days, calendar: response.data.calendar },
				() => {
					$( '.scrolable-table' ).scroll( (index) => {
						$(index.currentTarget).find('.popup').css('marginLeft', -$(index.currentTarget).scrollLeft()) 
					});
					$(window).scroll( () => $('.popup').css('marginTop', -$(window).scrollTop() ) )
				} 
			)
		})
	}

	handleNextMonth(){
	
		let nextStartDate = moment(this.state.dateEnd, 'YYYY-MM-DD').add(1, 'day').toDate(),
			nextEndDate = moment(nextStartDate, 'YYYY-MM-DD').add(1, 'month').toDate()

		this.setState({ dateStart: nextStartDate, dateEnd: nextEndDate }, () => this.getDaysArray())
	}

	handlePreviousMonth(){
	
		let nextStartDate = moment(this.state.dateStart, 'YYYY-MM-DD').add(-1, 'day').add(-1, 'month').toDate(),
			nextEndDate = moment(nextStartDate, 'YYYY-MM-DD').add(1, 'month').toDate()

		this.setState({ dateStart: nextStartDate, dateEnd: nextEndDate }, () => this.getDaysArray())	
	}

	changeShowDates( event, dateStart ) { 
		this.setState({ dateStart, dateEnd: moment(dateStart, 'YYYY-MM-DD').add( 1, 'month').format('YYYY-MM-DD') }, () => this.getDaysArray())	
	}
	
	handleChangeAvailableRooms(event, availableRooms ) {
		this.setState({ availableRooms : parseInt(availableRooms) || 0 })
	}

	handleChangingStartFromDate( event, changingStartFromDate ) {
		this.setState({ changingStartFromDate, changingDateRangeError:  moment(changingStartFromDate, 'YYYY-MM-DD').isAfter( moment(this.state.changingEndToDate, 'YYYY-MM-DD') )  })
	}

	handlChangingeEndToDate( event, changingEndToDate ) {
		this.setState({ changingEndToDate, changingDateRangeError:  moment(changingEndToDate, 'YYYY-MM-DD').isBefore( moment(this.state.changingStartFromDate, 'YYYY-MM-DD') ) })
	}

	handleChangeRoomPrice(index, value) {
		let changingRoomPrices = this.state.changingRoomPrices
			changingRoomPrices[index] = parseInt(value)

		this.setState({ changingRoomPrices })
	}

	handleOpenChangingItemPrice(category_id, id, label) {

		let room = _.find( this.state.rooms, { room_id: id }),
			emptyArr = []

		console.log(room)

			for( var i=0 ; i < room.max_adults; i++)
				emptyArr.push(0)

		this.setState({ 
			openChangingItem : true , 
			isChangingAvailableRooms: false, 
			changingRoomPrices: emptyArr,
			changingRoomData : room,
			changingCategoryId: category_id,
			changingCategoryLabel: label,
			currency: 0,
		})
	}

	handleOpenChangingItemRooms(id) {
		let room = _.find( this.state.rooms, { room_id: id })
		this.setState({ 
			openChangingItem : true , 
			isChangingAvailableRooms: true, 
			changingRoomData : room,
		})
	}
	
	handleCurrency(event, index, currency) {
		this.setState({ currency })
	}

	handleRoomMaxPeople(event, index, roomMaxPeople) {
		this.setState({ roomMaxPeople })
	}

	handleTypeChangingPrice(event, index, typeChangingPrice) {
		this.setState({ typeChangingPrice })
	}
	
	updateItem() {
		let startDate = moment(this.state.changingStartFromDate).format('YYYY-MM-DD'),
			endToDate = moment(this.state.changingEndToDate).format('YYYY-MM-DD')

		this.setState({ openChangingItem : false })

		this.state.isChangingAvailableRooms 
		?	axios.post('/api/profile/hotel/calendar/update/max-rent' , 
				{
					items_id : this.state.changingRoomData.room_id,
					category_id: -1,
					users_id : this.props.data.users_id,
					dates : Array.from(moment.range(startDate, endToDate).by('day', { step: 1 })),
					max_rooms_rent: this.state.availableRooms,
					basic_price_value: 0,
					basic_price_currency: 0,
				}
			).then( () => this.getDaysArray(this.state.dateStart, this.state.dateEnd) )
		
		:	axios.post('/api/profile/hotel/calendar/update/price' , 
				{
					category_id: this.state.changingCategoryId,
					dates : Array.from(moment.range(startDate, endToDate).by('day', { step: 1 })),
					price_value : this.state.changingRoomPrices,
					currency: this.state.currency,
					items_id : this.state.changingRoomData.room_id,
				}
			).then( () => this.getDaysArray(this.state.dateStart, this.state.dateEnd) )
	}


	render() {
		
		const languageId = this.props.languageId - 0;
		console.log(this.state)

		return(
				<div>
					<Row>

						<Col xs={4} xl={8}>
							<DatePicker 
								floatingLabelText={languageId === 0 ? 'Show from' : 'Показать с'}
								container='inline' 
								mode='landscape'
								defaultDate={ this.state.dateStart }
								onChange={ ::this.changeShowDates } />
						</Col>

						<Col xs={8} xl={4} style={{ textAlign: 'right' }}>
		                    <IconButton 
		                        tooltip={languageId === 0 ? 'Previous month' : 'Предыдущий месяц'}
		                        iconStyle={{ width: 36, height: 36 }}
		                        style={{ width: 72, height: 72, padding: 16 }}
		                        onClick={this.handlePreviousMonth}
		                    >
		                        <ChevronLeft />
		                    </IconButton>
		                    <IconButton 
		                        tooltip={languageId === 0 ? 'Next month' : 'Следующий месяц'}
		                        iconStyle={{ width: 36, height: 36 }}
		                        style={{ width: 72, height: 72, padding: 16}}
		                        onClick={this.handleNextMonth}
		                    >
		                        <ChevronRight />
		                    </IconButton>						
						</Col>

					</Row>
					<Row>
						<Col>
							<h4>
							{
								languageId === 0 
								? `Period from ${ moment(this.state.dateStart).format('DD MMM YYYY')} to ${moment(this.state.dateEnd).format('DD MMM YYYY')}` 
								: `Период с ${ moment(this.state.dateStart).format('DD MMM YYYY')} до ${moment(this.state.dateEnd).format('DD MMM YYYY')}`
							}
							</h4>
						</Col>
					</Row>
					<Row>
						<Col xs={12} >
						{
							this.state.rooms.length && this.state.calendar.length ?

								this.state.calendar.map( (calendarItem, calendarIndex) => (
								<div className='scrolable-table'>
									<table>
										<tbody>
											<tr>

												<td className='headcol' style={{ padding: 0 }}>
													<strong style={{ fontSize: 15 }}>{ languageId === 0 ? calendarItem.sname : calendarItem.sname }</strong><br/>
													{ languageId === 0 ? `For 1 - ${calendarItem.max_adults} people` : `Для 1 - ${calendarItem.max_adults} человек` }
												</td>
												
													{
														this.state.days.map( (date, roomIndex) => 
															<td style={{ padding: '10px' }} >
																{ date.short_date } 
															</td>
														)
													}												

											</tr>
											<tr>
												<td className='headcol'>															
													<ListItem 
														key={-1}																			
														primaryText={ languageId === 0 ? 'Rooms rent' : 'Комнат для сдачи' }  
														onClick={ () => this.handleOpenChangingItemRooms(calendarItem.id) }
														innerDivStyle={{ padding: 13 }}/>
												</td>
												{
													calendarItem.max_rent.map( max_rent =>
														<td style={{ background : max_rent || 0 ? '#4cc708': '#b98d84', height: 40, color: '#fff', position: 'relative' }}>
														{max_rent || 0}
														</td>
													)
												}
											</tr>
											{
												calendarItem.categories && calendarItem.categories.map( (category, categoryIndex) =>
													
													<tr>
														<td className='headcol'>
															<ListItem
																key={categoryIndex}																			
																primaryText={ 
																	_.find( this.state.roomFields, { id: category.category_id })
																	? _.find( this.state.roomFields, { id: category.category_id }).label
																	: 'Not found' }
																onClick={ 
																	() => 	this.handleOpenChangingItemPrice(
																				category.category_id, 
																				calendarItem.id, 
																				_.find( this.state.roomFields, { id: category.category_id })
																				? _.find( this.state.roomFields, { id: category.category_id }).label
																				: 'Not found'
																			) 
																}
																innerDivStyle={{ padding: 13 }}/>
														</td>
														{ 
															category.days.map( (day,dayIndex) =>

																<td style={{ background : calendarItem.max_rent[dayIndex] ? '#4cc708': '#b98d84', height: 40, color: '#fff', position: 'relative' }}>
																	<div className='td-hoverable-popup'></div>
																	<div className='popup'>
																		<ul style={{ paddingLeft: 0 }}>
																		{ 
																			day && day.price_value
																			? 	day.price_value.map( (price,index) =>
																					<li>{ `${roomTypePeople[index+1].label[languageId]} = ${day.price_value[index] || 0 } ${currency[day.currency]}` }</li>
																				)
																			: 	<li>{ languageId === 0 ? 'No information about prices' : 'Нет информации о ценах' }</li>
																		}
																		</ul>
																		<hr style={{ border: '1px solid' }}/>
																		<ul style={{ marginTop: 5, paddingLeft: 0 }}>
																			<li>{ languageId === 0 ? `Boooked : ${calendarItem.booked && calendarItem.booked[dayIndex] || 0}` : `Зарезервировано : ${calendarItem.booked && calendarItem.booked[dayIndex] || 0}`}</li>
																			<li>{ languageId === 0 ? `Left : ${calendarItem.left_room && calendarItem.left_room[dayIndex] || 0}` : `Осталось : ${calendarItem.left_room && calendarItem.left_room[dayIndex] || 0}`}</li>
																		</ul>
																	</div>																																	
																</td>
															)
														}
													</tr>
												)
											}										
										</tbody>
									</table>
								</div>
								))



							:
								<div className='paper'>
									<h5>{ languageId === 0 ? 'You do not have any rooms available' : 'У вас нету доступных комнат' }</h5>
								</div>

						}
						</Col>
					</Row>
					
					<Dialog
						autoScrollBodyContent
						open={this.state.openChangingItem }
						title={
							languageId === 0 
							? `Room : ${this.state.changingRoomData.sname} ${ this.state.changingCategoryLabel ? `(${this.state.changingCategoryLabel})` : '' }` 
							: `Номер : ${this.state.changingRoomData.sname_rus} ${ this.state.changingCategoryLabel ? `(${this.state.changingCategoryLabel})` : '' }`
						}
						actions={[ 
									<FlatButton
										label={languageId === 0 ? 'Change' : 'Изменить'} 
										onClick={ ::this.updateItem } />
						]}						
						onRequestClose={ () => this.setState({ openChangingItem: false, changingCategoryLabel: null }) }
					>
						<Row style={{ marginLeft: 0, marginRight: 0 }}>
							<Col>				
								<BookingCalendar 
									showNights={false} 
									languageId={languageId} 
									updateDates={ (startDate,endDate,nights) => this.setState({ 
										changingStartFromDate: moment(startDate).format('YYYY-MM-DD'), 
										changingEndToDate : moment(endDate).format('YYYY-MM-DD'),
									}) } />
							</Col>
						</Row>
						<Row style={{ marginTop: 10 }}>

							<Col>
								<h4>
									{ 
										this.state.isChangingAvailableRooms ?

											languageId === 0 ? 'Take every day' : 'Сдавать каждый день'
										: 
											languageId === 0 ? 'Price ' : 'Цена'
									}
								</h4>
								<Divider />
							</Col>
						
						</Row>
						{
							this.state.isChangingAvailableRooms ?

								<Row style={{ marginTop: 10 }}>

									<Col xs={4} style={{ marginTop : 12 }} offset={{ xs : 2 }}>
										<b>{ languageId === 0 ? 'How much rooms ?' : 'Cколько номеров ?' }</b>
									</Col>
									<Col xs={4} >
										<TextField
											fullWidth
											hintText={100}
											value = { this.state.availableRooms }	 
											onChange={ this.handleChangeAvailableRooms } />
							
									</Col>
									{ 
										this.state.availableRooms > this.state.changingRoomData.rooms_in_hotel ?
										<Col xs={12}>
											<h4 style={{ textAlign: 'center', color: '#b70006' }}>
											{
												languageId === 0 ? `WARNING! You have only - ${this.state.changingRoomData.rooms_in_hotel} rooms` : `Осторожно! У вас есть всего ${this.state.changingRoomData.rooms_in_hotel} номеров`
											}
											</h4> 
										</Col>
										: ''
									}
								</Row>							

							:
								<Row style={{ marginTop: 10 }}>
									<Col xs={3} xl={3} offset={{ xs: 9, xl: 9 }}>
										<h5>{ languageId === 0 ? 'Choose currency' : 'Выберите валюту' }</h5>
										<SelectField value={ this.state.currency } onChange={ this.handleCurrency } style={{ width : 100 }}>
											<MenuItem value={0} primaryText='USD' />
											<MenuItem value={1} primaryText='RUB' />
											<MenuItem value={2} primaryText='AZN' />
											<MenuItem value={3} primaryText='KZT' />
											<MenuItem value={4} primaryText='EUR' />
										</SelectField>
									</Col>
									{ 
										this.state.changingRoomPrices.map( (item, index) => 
												<Col>
													<Col xs={6}>
														<h5 style={{ lineHeight: '28px' }}>{ roomTypePeople[index+1].label[languageId] }</h5>
													</Col>
													<Col xs={3}>
														<TextField
															fullWidth
															hintText={100}
															value= { this.state.changingRoomPrices[index] }	 
															onChange={ (event, value) => this.handleChangeRoomPrice(index, value) } />													
													</Col>
												</Col>
									 	)
									}
								</Row>
						}
					</Dialog>

				</div>

		)
	}
}