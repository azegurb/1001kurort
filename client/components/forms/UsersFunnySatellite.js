import React, { Component}  from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import { Link } from 'react-router-dom'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import CircularProgress from 'material-ui/CircularProgress'
import * as pageActions from '../../redux/actions/PageActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'

import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const initialState = {
	
}

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

export default class UsersFunnyStatellite extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ outgoing: [], incoming: [] }, initialState)

		this.axiosGetActiveRequests = ::this.axiosGetActiveRequests;
		this.getPrefferredSatelite = ::this.getPrefferredSatelite;
		this.cancelRequest = ::this.cancelRequest;
		this.declineRequest = ::this.declineRequest;
		this.approveRequest = ::this.approveRequest;
		this.updatePreferredSatelite = ::this.updatePreferredSatelite;
	}

	componentWillMount(){
		this.axiosGetActiveRequests()
		this.getPrefferredSatelite()
	}

	componentWillReceiveProps(nextProps){
		if( !_.isEqual(nextProps.data, this.props.data) ){
			this.getPrefferredSatelite()
		} 
	}

	axiosGetActiveRequests() {
		axios.get('/api/profile/funny-satellite/requests',{
			params: {
				users_id: this.props.data.users_id
			}
		})
		.then( response => this.setState({ incoming: response.data.incoming || [], outgoing: response.data.outgoing || [] }) )
	}

	getPrefferredSatelite() {
		this.setState({
			sex: this.props.data.preferred_satellite && this.props.data.preferred_satellite.sex,
			language: this.props.data.preferred_satellite && this.props.data.preferred_satellite.language,
			ageFrom: this.props.data.preferred_satellite && this.props.data.preferred_satellite.ageFrom,
			ageTo: this.props.data.preferred_satellite && this.props.data.preferred_satellite.ageTo,
		})
	}

	cancelRequest(id) {
		axios.post('/api/profile/funny-satellite/requests/cancel',{
			request_id: id,
			status: 2,
		}).then( response => this.axiosGetActiveRequests() )
	}

	declineRequest(request_id) {
		axios.post('/api/profile/funny-satellite/requests/status/decline',{
			request_id,
		}).then( response => this.axiosGetActiveRequests() )
	}

	approveRequest(item) {
		let satellite_id = item.joiner_id,
			booking_id = item.booking_id,
			request_id = item.id,
			satellite_data = {
				first_name: item.first_name,
				last_name: item.last_name,
				email: item.email,
				phone: item.phone,
			} 

		axios.post('/api/profile/funny-satellite/requests/status/approve',{
			request_id,
			booking_id,
			satellite_id,
			satellite_data,
		}).then( response => this.axiosGetActiveRequests() )
	}

	updatePreferredSatelite() {

		axios.post('/api/profile/funny-satellite/preferred/update', {
			users_id: this.props.data.users_id,
			satelliteData: {
				sex: this.state.sex,
				language: this.state.language,
				ageFrom: this.state.ageFrom,
				ageTo: this.state.ageTo,
			}		
		}).then( response => {
			this.props.pageActions.loginUser(response.data.id_token)
			this.getPrefferredSatelite() 
		})
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)
		return(	
			<div>
				<Row>
					<Col>
						<h3>{ languageId === 0 ? 'Preferred satellite' : 'Предпочитаемый спутник' }</h3>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} xl={6}>
						<SelectField
							floatingLabelText={ languageId === 0 ? 'Sex' : 'Пол' }
							value={this.state.sex}
							onChange={ (e,i, value) => this.setState({ sex: value }) }
						>
							<MenuItem value={0} primaryText={ languageId === 0 ? 'No matter' : 'Не важно'} />
							<MenuItem value={1} primaryText={ languageId === 0 ? 'Male' : 'Мужской' } />
							<MenuItem value={2} primaryText={ languageId === 0 ? 'Female' : 'Женский' } />
						</SelectField>
					</Col>
					<Col xs={12} sm={6} xl={6}>
						<SelectField
							floatingLabelText={ languageId === 0 ? 'Language' : 'Язык' }
							value={this.state.language}
							onChange={ (e,i, value) => this.setState({ language: value }) }
						>
							<MenuItem value={0} primaryText={ languageId === 0 ? 'No matter' : 'Не важно'} />
							<MenuItem value={1} primaryText={ languageId === 0 ? 'English' : 'Английский' } />
							<MenuItem value={2} primaryText={ languageId === 0 ? 'Russian' : 'Русский' } />
						</SelectField>					
					</Col>
					<Col xs={12} sm={6} xl={6}>
						<TextField
							errorText={ this.state.errorAgeFrom && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
							floatingLabelText={ languageId === 0 ? 'Age from' : 'Возраст от' }
							value={this.state.ageFrom}
							onChange={ (e,value) => this.setState({ ageFrom: parseInt(value) || '', errorAgeFrom: !_.inRange(value, 0, 100) || Boolean(parseInt(value) > (this.state.ageTo || 100)) }) }/>
					</Col>
					<Col xs={12} sm={6} xl={6}>
						<TextField
							errorText={ this.state.errorAgeTo && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
							floatingLabelText={ languageId === 0 ? 'Age to' : 'Возраст до' }
							value={this.state.ageTo}
							onChange={ (e,value) => this.setState({ ageTo: parseInt(value) || '', errorAgeTo: !_.inRange(value, 0, 100) || Boolean(parseInt(value) < this.state.ageFrom || 0) }) }/>
					</Col>
				</Row>
				<Row>
					<Col xs={6} offset={{ xs: 6 }}>
						<RaisedButton
							disabled={ 
								this.state.errorAgeFrom ||
								this.state.errorAgeTo || (
									this.state.sex === (this.props.data.preferred_satellite && this.props.data.preferred_satellite.sex) &&
									this.state.language === (this.props.data.preferred_satellite && this.props.data.preferred_satellite.language) &&
									this.state.ageFrom === (this.props.data.preferred_satellite && this.props.data.preferred_satellite.ageFrom) &&
									this.state.ageTo === (this.props.data.preferred_satellite && this.props.data.preferred_satellite.ageTo)
								)
							}
							label={ languageId === 0 ? 'Update' : 'Обновить' }
							onClick={ this.updatePreferredSatelite }/>
					</Col>
				</Row>
				<Row>
					<Col>
						<h3>{ languageId === 0 ? 'Your requests for accommodation to guests' : 'Ваши заявки на подселение к гостям' }</h3>
						<Divider />
					</Col>
				</Row>
				<Row>
					<Col>
						<Hidden xs sm>
						{
							this.state.outgoing.length
							?	<table className='table-sanatorium-room'>
									<tr>
										<th>{ languageId === 0 ? 'Booking' : 'Бронирование' }</th>
										<th>{ languageId === 0 ? 'Creator name' : 'Имя создателя' }</th>
										<th>{ languageId === 0 ? 'Cancel' : 'Отменить' }</th>
									</tr>
									{
										this.state.outgoing.length
										? 	this.state.outgoing.map( item =>
												<tr style={{ textAlign: 'left' }}>
													<td style={{ paddingLeft: 10 }}>
														{item.rooms && item.rooms.map( room =>
															<p>
																{ languageId === 0 ? `Room: ${room.s_name}` : `Номер: ${room.s_name}` }, <br />
																{ languageId === 0 ? `Meal plan: ${room.meal_plan}` : `Питание: ${room.meal_plan}` }, <br />
																{ languageId === 0 ? `Treatment: ${room.treatm_incl ? 'included' : 'not included' }` : `Лечение: ${room.treatm_incl ? 'включено' : 'не входит' }` }, <br />
																{ languageId === 0 ? `TOTAL PRICE: ${item.price} ${currency[item.currency]}` : `Общая цена: ${item.price} ${currency[item.currency]}` } 
															</p>
														)}														
													</td>
													<td style={{ paddingLeft: 10 }}>
														<p>
															{ languageId === 0 ? `Email: ${item.guest_contacts.email || '-'}` : `Емейл: ${item.guest_contacts.email || '-'}` }<br />
															{ languageId === 0 ? `Phone: ${item.guest_contacts.phone || '-'}` : `Телефон: ${item.guest_contacts.phone || '-'}` }<br />
															{ languageId === 0 ? `Full name: ${item.guest_contacts.name || '-'} ${item.guest_contacts.lastname || '-'}` : `Полное имя: ${item.guest_contacts.name || '-'} ${item.guest_contacts.lastname || '-'}` }<br />
														</p>
														
													</td>
													<td style={{ textAlign: 'center' }}>
														<RaisedButton 
															label={ languageId === 0 ? 'Cancel' : 'Отменить' }
															onClick={ () => this.cancelRequest(item.request_id) }/>
													</td>
												</tr>
											)
										: 	<tr>
												<td colSpan={10} className='center'>
													<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
												</td>
											</tr>
									}
								</table>
							: 	<div>
									<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
								</div>
						}
						</Hidden>

						<Visible xs sm>
						{
							this.state.incoming.length
							?	this.state.outgoing.map( item =>
									<Row style={{ marginTop: 10, padding: 10, background: item.status === 1 ? '#e3f9e2' : item.status === 2 ? '#ecd7d7' : '#f5f5f5' }}>
										<Col xs={12}>
											{item.rooms && item.rooms.map( room =>
												<p>
													{ languageId === 0 ? `Room: ${room.s_name}` : `Номер: ${room.s_name}` }, <br />
													{ languageId === 0 ? `Meal plan: ${room.meal_plan}` : `Питание: ${room.meal_plan}` }, <br />
													{ languageId === 0 ? `Treatment: ${room.treatm_incl ? 'included' : 'not included' }` : `Лечение: ${room.treatm_incl ? 'включено' : 'не входит' }` }, <br />
													{ languageId === 0 ? `TOTAL PRICE: ${item.price} ${currency[item.currency]}` : `Общая цена: ${item.price} ${currency[item.currency]}` } 
												</p>
											)}
											<p>
												{ languageId === 0 ? `Email: ${item.guest_contacts.email || '-'}` : `Емейл: ${item.guest_contacts.email || '-'}` }<br />
												{ languageId === 0 ? `Phone: ${item.guest_contacts.phone || '-'}` : `Телефон: ${item.guest_contacts.phone || '-'}` }<br />
												{ languageId === 0 ? `Full name: ${item.guest_contacts.name || '-'} ${item.guest_contacts.lastname || '-'}` : `Полное имя: ${item.guest_contacts.name || '-'} ${item.guest_contacts.lastname || '-'}` }<br />
											</p>
										</Col>
										<Col xs={12}>
											<RaisedButton 
												label={ languageId === 0 ? 'Cancel' : 'Отменить' }
												onClick={ () => this.cancelRequest(item.request_id) }/>
										</Col>
									</Row>
								)
							: 	<Row>
									<Col>
										<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
									</Col>
								</Row>
						}						
						</Visible>						
					</Col>
				</Row>
				<Row>
					<Col>
						<h3>{ languageId === 0 ? 'Active applications for accommodation to you' : 'Активные заявки на подселение к вам' }</h3>
						<Divider />
					</Col>
				</Row>
				<Row>
					<Col>
						<Hidden xs sm>
						{
							this.state.incoming.length
							?	<table className='table-sanatorium-room'>
									<tr>
										<th>{ languageId === 0 ? 'Booking' : 'Бронирование' }</th>
										<th>{ languageId === 0 ? 'Creator name' : 'Имя создателя' }</th>
										<th>{ languageId === 0 ? 'Cancel' : 'Отменить' }</th>
										<th>{ languageId === 0 ? 'Approve' : 'Подтвердить' }</th>
									</tr>
									{
										this.state.incoming.length
										? 	this.state.incoming.map( item =>
												<tr style={{ background: item.status === 1 ? '#e3f9e2' : item.status === 2 ? '#ecd7d7' : '#f5f5f5' }}>
													<td style={{ paddingLeft: 10 }}>
														ID: {item.id}												
													</td>
													<td style={{ paddingLeft: 10 }}>
														<p>
															{ languageId === 0 ? `Email: ${item.email || '-'}` : `Емейл: ${item.email || '-'}` }<br />
															{ languageId === 0 ? `Phone: ${item.phone || '-'}` : `Телефон: ${item.phone || '-'}` }<br />
															{ languageId === 0 ? `Full name: ${item.first_name || '-'} ${item.last_name || '-'}` : `Полное имя: ${item.first_name || '-'} ${item.last_name || '-'}` }<br />
														</p>
													</td>
													<td>
														<RaisedButton
															disabled={item.status} 
															label={ languageId === 0 ? 'Decline' : 'Отклонить' }
															onClick={ () => this.declineRequest(item.id) }/>
													</td>
													<td>
														<RaisedButton 
															disabled={item.status} 
															label={ languageId === 0 ? 'Approve' : 'Подтвердить' }
															onClick={ () => this.approveRequest(item) }/>
													</td>
												</tr>
											)
										: 	<tr>
												<td colSpan={10} className='center'>
													<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
												</td>
											</tr>
									}
								</table>
							: 	<div>
									<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
								</div>
						}
						</Hidden>
						<Visible xs sm>
						{
							this.state.incoming.length
							?	this.state.incoming.map( item =>
									<Row style={{ marginTop: 10, padding: 10, background: item.status === 1 ? '#e3f9e2' : item.status === 2 ? '#ecd7d7' : '#f5f5f5' }}>
										<Col xs={12}>
											ID: {item.id}												
											<p>
												{ languageId === 0 ? `Email: ${item.email || '-'}` : `Емейл: ${item.email || '-'}` }<br />
												{ languageId === 0 ? `Phone: ${item.phone || '-'}` : `Телефон: ${item.phone || '-'}` }<br />
												{ languageId === 0 ? `Full name: ${item.first_name || '-'} ${item.last_name || '-'}` : `Полное имя: ${item.first_name || '-'} ${item.last_name || '-'}` }<br />
											</p>
										</Col>
										<Col xs={6}>
											<RaisedButton
												disabled={item.status} 
												label={ languageId === 0 ? 'Decline' : 'Отклонить' }
												onClick={ () => this.declineRequest(item.id) }/>
										</Col>
										<Col xs={6}>
											<RaisedButton 
												disabled={item.status} 
												label={ languageId === 0 ? 'Approve' : 'Подтвердить' }
												onClick={ () => this.approveRequest(item) }/>
										</Col>
									</Row>
								)
							: 	<Row>
									<Col>
										<h4>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h4>
									</Col>
								</Row>
						}						
						</Visible>
					</Col>
				</Row>
			</div>
		)
	}

}