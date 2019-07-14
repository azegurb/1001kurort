import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Hidden, Visible } from 'react-grid-system'
import {List, ListItem} from 'material-ui/List'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import _ from 'lodash'

import BookingForm from '../components/forms/BookingForm'

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const initialState = {
	activeRequest: [],
}

class FunnySatellite extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ seakersList: [] }, initialState)

		this.axiosGetSeakers = ::this.axiosGetSeakers;
		this.axiosGetActiveRequests = ::this.axiosGetActiveRequests;
		this.cancelRequest = ::this.cancelRequest;
		this.sendRequestToShareRoom = ::this.sendRequestToShareRoom;
	}

	componentWillMount(){
        this.props.pageActions.setNavigationPathNames([
        	{ label: ['Funny satellite', 'Веселый спутник'], link: '/funny_satellite' },
        ])    
	    this.props.pageActions.updateIsLoadingPage(true);
    }
	
	componentDidMount() {
        Promise.all([
        	this.axiosGetSeakers(),
			this.axiosGetActiveRequests()
        ]).then( () => {
            this.props.pageActions.updateIsLoadingPage(false)
        })		
	}

	axiosGetSeakers () {
		axios
		.get('/admin/funny_satellite/bookings')
		.then( response => {
			let seakersList = response.data.data || []

			seakersList.map( item =>
				item.guests_names = JSON.parse(item.guests_names)
			)

			seakersList = _.filter(seakersList, (item) =>  item.users_id !== this.props.profile.user.users_id )

			this.setState({ seakersList }) 
		})
	}

	axiosGetActiveRequests () {
		axios.get('/api/profile/funny-satellite/requests',{
			params: {
				users_id: this.props.profile.user.users_id
			}
		})
		.then( response => this.setState({ activeRequest: response.data.outgoing || [] }) )
	}

	cancelRequest (id) {
		axios.post('/api/profile/funny-satellite/requests/cancel',{
			request_id: id,
			status: 2,
		}).then( response => this.axiosGetActiveRequests() )
	}

	componentWillReceiveProps(nextProps){
	
	}

	sendRequestToShareRoom (id, users_id) {
		axios.post('/api/profile/funny-satellite/requests/create', {
			booking_id: id,
			host_users_id: users_id,
			joiner_id: this.props.profile.user.users_id,
		}).then( () => this.axiosGetActiveRequests() )

	}

	render() {
		const languageId = this.props.profile.languageId - 0;
		const path = this.props.location.pathname
        const url = process.env.API_URL + this.props.location.pathname

		console.log(this.state)
		return(	
			<div style={{ marginTop: 20 }}>
				<Row>
					<Col>
						<h3>{ languageId === 0 ? 'Available to join' : 'Доступные для подселения' }</h3>
						<Divider />
					</Col>
					<Col style={{ marginTop: 15 }}>
					<Hidden xs sm>
						<table className='table-sanatorium-room'>
							<tr>
								<th>{ languageId === 0 ? 'Dates' : 'Даты' }</th>
								<th>{ languageId === 0 ? 'Sanatorium' : 'Санаторий' }</th>
								<th>{ languageId === 0 ? 'Details booking' : 'Детали брони' }</th>
								<th>{ languageId === 0 ? 'Guest name' : 'Имя гостя' }</th>
								<th>{ languageId === 0 ? 'Prefered roommate' : 'Предпочитаемый сожитель' }</th>
								<th>{ languageId === 0 ? 'Accept request' : 'Отправить запрос' }</th>
							</tr>
							{
								this.state.seakersList.length
								? 	this.state.seakersList.map( item =>
										<tr>
											<td>
												{ moment(item.date_start).format('DD.MM.YY') } - { moment(item.date_end).format('DD.MM.YY') }
											</td>
											<td>
												{ item.h_sname }, { languageId === 0 ? item.kurort : item.kurort_ru }
											</td>
											<td>
												{item.rooms && item.rooms.map( room =>
													<p>
														{ languageId === 0 ? `Room: ${room.s_name}` : `Номер: ${room.s_name}` }, <br />
														{ languageId === 0 ? `Meal plan: ${room.meal_plan}` : `Питание: ${room.meal_plan}` }, <br />
														{ languageId === 0 ? `Treatment: ${room.treatm_incl ? 'included' : 'not included' }` : `Лечение: ${room.treatm_incl ? 'включено' : 'не входит' }` }, <br />
														{ languageId === 0 ? 'Total price:' : 'Общая цена' } {item.total_price_default[item.user_price_currency]} {currency[item.user_price_currency]} 
													</p>
												)}
											</td>
											<td>
												<p>
													{ languageId === 0 ? `Email: ${item.guest_contacts.email || '-' }` : `Емейл: ${item.guest_contacts.email || '-' }` }<br />
													{ languageId === 0 ? `Phone: ${item.guest_contacts.phone || '-' }` : `Телефон: ${item.guest_contacts.phone || '-' }` }<br />
													{ languageId === 0 ? `Full name: ${item.guests_names.name} ${item.guests_names.lastname}` : `Полное имя: ${item.guests_names.name} ${item.guests_names.lastname}` }<br />
												</p>
											</td>
											<td>
												{
													item.preferred_satellite
													?	<div>
															{ item.preferred_satellite.sex === 1 ? 
																languageId === 0 ? 'M' : 'M' 
																: languageId === 0 ? 'F' : 'Ж'
															}, 
															{ item.preferred_satellite.language === 1 ? ' En' : ' Rus' },
															{ languageId === 0 
																?	` Age: ${item.preferred_satellite.ageFrom} - ${item.preferred_satellite.ageTo}` 
																:	` Возраст: ${item.preferred_satellite.ageFrom} - ${item.preferred_satellite.ageTo}` 
															}
														</div>
													: 	<div>
															<p>{ languageId === 0 ? 'Not specified' : 'Не указан' }</p>
														</div>
												}
											</td>
											{ !_.isEmpty(this.props.profile.user) ?
												<td>
													{  !_.find(this.state.activeRequest, {booking_id: item.id, joiner_id: this.props.profile.user.users_id }) 
														?	<RaisedButton 
																label={ languageId === 0 ? 'Join' : 'Присоеденится' }
																onClick={ () => this.sendRequestToShareRoom(item.id, item.users_id) }/>
														:	<RaisedButton
																disabled 
																label={ 
																	_.find(this.state.activeRequest, {booking_id: item.id, joiner_id: this.props.profile.user.users_id }).status === 1
																	? (languageId === 0 ? 'Approved' : 'Принят')
																	: _.find(this.state.activeRequest, {booking_id: item.id, joiner_id: this.props.profile.user.users_id }).status === 2
																		? (languageId === 0 ? 'Declined' : 'Отклонен')
																		: (languageId === 0 ? 'In progress' : 'В ожидании')
																}
																onClick={ () => this.cancelRequest(item.id) }/> }
												</td>
											:	<td>
													{ languageId === 0 ? 'Not available' : 'Не доступно' }
												</td>
											}
										</tr>
									)
								: <tr>
										<td colSpan={10} className='center'>
											<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
										</td>
									</tr>
							}
						</table>
					</Hidden>
					<Visible xs sm>
						{this.state.seakersList.length 
							? this.state.seakersList.map( item => 
									<div style={{ margin: 10 }}>
										<Row>
											<Col>
												<span>{ item.h_sname }, { languageId === 0 ? item.kurort : item.kurort_ru }</span>
												<span> ({ moment(item.date_start).format('DD.MM.YY') } - { moment(item.date_end).format('DD.MM.YY') })</span>
											</Col>
										</Row>
										<Row>
											<Col xs={12} sm={6}>
												{item.rooms && item.rooms.map( room =>
													<p>
														{ languageId === 0 ? `Room: ${room.s_name}` : `Номер: ${room.s_name}` }, <br />
														{ languageId === 0 ? `Meal plan: ${room.meal_plan}` : `Питание: ${room.meal_plan}` }, <br />
														{ languageId === 0 ? `Treatment: ${room.treatm_incl ? 'included' : 'not included' }` : `Лечение: ${room.treatm_incl ? 'включено' : 'не входит' }` }, <br />
														<b>{ languageId === 0 ? 'Total price:' : 'Общая цена:' } {item.total_price_default[item.user_price_currency]} {currency[item.user_price_currency]}</b>
													</p>
												)}
											</Col>
											<Col xs={12} sm={6}>
												<p>
													{ languageId === 0 ? `Email: ${item.guest_contacts.email || '-' }` : `Емейл: ${item.guest_contacts.email || '-' }` }<br />
													{ languageId === 0 ? `Phone: ${item.guest_contacts.phone || '-' }` : `Телефон: ${item.guest_contacts.phone || '-' }` }<br />
													{ languageId === 0 ? `Full name: ${item.guests_names.name} ${item.guests_names.lastname}` : `Полное имя: ${item.guests_names.name} ${item.guests_names.lastname}` }<br />
												</p>
												<span>{languageId === 0 ? 'Предпочитаемый спутник' : 'Preferred satellite: '}</span>
												{
													item.preferred_satellite
													?	<div>
															{ item.preferred_satellite.sex === 1 ? 
																languageId === 0 ? 'M' : 'M' 
																: languageId === 0 ? 'F' : 'Ж'
															}, 
															{ item.preferred_satellite.language === 1 ? ' En' : ' Rus' },
															{ languageId === 0 
																?	` Age: ${item.preferred_satellite.ageFrom} - ${item.preferred_satellite.ageTo}` 
																:	` Возраст: ${item.preferred_satellite.ageFrom} - ${item.preferred_satellite.ageTo}` 
															}
														</div>
													: 	<div>
															<p>{ languageId === 0 ? 'Not specified' : 'Не указан' }</p>
														</div>
												}
											</Col>
											<Col>
											{ !_.isEmpty(this.props.profile.user) ?
													!_.find(this.state.activeRequest, {booking_id: item.id, joiner_id: this.props.profile.user.users_id }) 
														?	<FlatButton
																fullWidth 
																label={ languageId === 0 ? 'Join' : 'Подать запрос' }
																onClick={ () => this.sendRequestToShareRoom(item.id, item.users_id) }
																style={{ marginTop: 5 }}/>
														:	<RaisedButton
																fullWidth 
																disabled 
																label={ 
																	_.find(this.state.activeRequest, {booking_id: item.id, joiner_id: this.props.profile.user.users_id }).status === 1
																	? (languageId === 0 ? 'Approved' : 'Принят')
																	: _.find(this.state.activeRequest, {booking_id: item.id, joiner_id: this.props.profile.user.users_id }).status === 2
																		? (languageId === 0 ? 'Declined' : 'Отклонен')
																		: (languageId === 0 ? 'In progress' : 'В ожидании')
																}
																onClick={ () => this.cancelRequest(item.id) }/>
											:	<div>
													{ languageId === 0 ? 'Not available' : 'Не доступно' }
												</div>
											}
											</Col>
										</Row>
									</div>
								)
							: <Row>
									<Col>
											<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
									</Col>
								</Row>
						}
					</Visible>
					</Col>
					<Col style={{ marginTop: 25 }}>
						<p>{ languageId === 0 ? 'Don`t find suitable option for you?' : 'Не нашли подходящий вариант для вас?' }</p>
						<p>{ languageId === 0 ? 'Then lets give oportunity to others to join to you!' : 'Затем дайте возможность другим присоединиться к вам!' }</p>
						<p>{ languageId === 0 ? 'Leave your request now!' : 'Оставьте заявку прямо сейчас!' }</p>
					</Col>
					<Col>
						<h3>{ languageId === 0 ? 'Otherwise' : 'В противном случае' }</h3>
						<Divider />
					</Col>
					<Col xs={12} xl={4}>
						<BookingForm 
                            languageId={ languageId } />
					</Col>
				</Row>			
			</div>
		)
	}

}


const mapDispatchToProps = (dispatch) => {
	return {
		pageActions: bindActionCreators(pageActions, dispatch),
	}
}

const mapStateToProps = ({ profile }) => ({
  profile,
});

export default connect(mapStateToProps, mapDispatchToProps)(FunnySatellite);