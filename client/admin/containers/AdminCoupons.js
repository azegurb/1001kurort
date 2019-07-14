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
import DatePicker from 'material-ui/DatePicker'
import Checkbox from 'material-ui/Checkbox'
import CircularProgress from 'material-ui/CircularProgress'

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const initialState = {
	requestDone: true,
	regCouponDiscount: 0,
	errorRegCouponDiscount: false,
	is_limited_date: true,
}

export default class Blog extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ customCoupons: [] }, initialState)

		this.axiosGetCoupons = ::this.axiosGetCoupons;
		this.udpateRegCouponPrice = ::this.udpateRegCouponPrice;
		this.createCustomCuppon = ::this.createCustomCuppon;
		this.deleteCustomCuppon = ::this.deleteCustomCuppon;
		this.giveCoupon = ::this.giveCoupon;
	}

	componentWillMount(){
		this.axiosGetCoupons()
	}

	axiosGetCoupons() {
		axios
			.get('/admin/coupons')
			.then( response => {
				
				this.setState({
					regCouponDiscount: response.data.data[0] && response.data.data[0].percent_discount || 0,
					customCoupons: _.sortBy(response.data.data[1], 'id'),
				})
			})
	}

	udpateRegCouponPrice() {
		this.setState({ requestDone: false })

		axios
			.post('/admin/coupons/registration/percent',{ 
				percent: this.state.regCouponDiscount 
			})
			.then( () => this.setState({ requestDone: true }) )
	}

	createCustomCuppon() {
		axios
			.post('/admin/coupons/custom/create',{
				max_coupons: this.state.newCouponCount,
				percent: this.state.newCouponPercent,
				valid_until: this.state.validUntil,
				is_unlimited_time: this.state.is_limited_date,
			})
			.then( () => {
				this.setState({ requestDone: true })
				this.axiosGetCoupons()
			})		
	}

	deleteCustomCuppon(id) {
		axios
			.post('/admin/coupons/custom/delete', { id })
			.then( () => {
				this.setState({ requestDone: true })
				this.axiosGetCoupons()
			})		
	}

	giveCoupon() {
		let coupon = _.find(this.state.customCoupons, { id: this.state.selectedCoupon })

		axios
			.post('/admin/coupons/give', {
				valid_until: coupon ? coupon.valid_until : null,
				coupon_type: coupon ? coupon.id : null,
				email: this.state.givenCouponEmail
			})
			.then( () => {
				this.setState({ requestDone: true, givenCouponEmail: '', selectedCoupon: null })
				this.axiosGetCoupons()
			})	
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row style={{ marginTop: 40 }}>
					<Col>
						<h4>{ languageId === 0 ? '1. Percent of registration coupon discount' : '1. Процент скидки регистрационного купона' }</h4>
						<Row>
							<Col xs={6}>
								<TextField 
									floatingLabelText={ languageId === 0 ? 'Percent of discount' : 'Процент скидки' }
									errorText={ this.state.errorRegCouponDiscount && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
									value={this.state.regCouponDiscount}
									onChange={ (e, regCouponDiscount) => this.setState({ regCouponDiscount, errorRegCouponDiscount: !Boolean(regCouponDiscount < 100 && regCouponDiscount > 0) }) } />
							</Col>
							<Col xs={6} style={{ textAlign: 'right' }}>
								<RaisedButton
									disabled={ !this.state.regCouponDiscount || this.state.errorRegCouponDiscount }
									label={ languageId === 0 ? 'Confirm' : 'Подтвердить' }
									style={{ marginTop: 28 }}
									onClick={ this.udpateRegCouponPrice }/>							
							</Col>
						</Row>
						
						<h4>{ languageId === 0 ? '2. Custom coupons' : '2. Настраиваемые купоны' }</h4>
						<Row>
							<Col xs={4}>
								<TextField
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Count of coupons' : 'Кл-во купонов' }
									errorText={ this.state.errorNewCouponCount && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
									value={this.state.newCouponCount}
									onChange={ (e, newCouponCount) => this.setState({ newCouponCount, errorNewCouponCount: !Boolean(newCouponCount < 1000 && newCouponCount > 0) }) } />
							</Col>
							<Col xs={4}>
								<TextField 
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Percent of discount' : 'Процент скидки' }
									errorText={ this.state.errorNewCouponPercent && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
									value={this.state.newCouponPercent}
									onChange={ (e, newCouponPercent) => this.setState({ newCouponPercent, errorNewCouponPercent: !Boolean(newCouponPercent < 100 && newCouponPercent > 0) }) } />
							</Col>
						</Row>
						<Row>
							<Col xs={4}>
								<Checkbox
									label={ languageId === 0 ? 'Use until' : 'Использовать до'}
									checked={this.state.is_limited_date}
									onCheck={ (e, check) => this.setState({ is_limited_date: check, validUntil: check ? this.state.validUntil : null }) }
									style={{ marginTop: 35 }}/>
							</Col>
							<Col xs={4}>
								<DatePicker 
									disabled={!this.state.is_limited_date}
									floatingLabelText={ languageId === 0 ? 'Valid coupons to' : 'Валидные до' } 
									container="inline" 
									mode="landscape" 
									onChange={ (a, date) => this.setState({ validUntil: date }) }/>
							</Col>
							<Col xs={4} style={{ textAlign: 'right' }}>
								<RaisedButton
									disabled={ !this.state.newCouponCount || this.state.errorNewCouponCount || !this.state.newCouponPercent || this.state.errorNewCouponPercent || !this.state.requestDone }
									label={ languageId === 0 ? 'Create' : 'Создать' }
									style={{ marginTop: 28 }}
									onClick={ this.createCustomCuppon }/>							
							</Col>
						</Row>
						<Row style={{ marginTop: 50 }}>
							<Col>
								<table className='table-sanatorium-room'>
									<tr>
										<th><p>{ languageId === 0 ? 'Left' : 'Осталось' }</p></th>
										<th><p>{ languageId === 0 ? 'Discount' : 'Скидка' }</p></th>
										<th><p>{ languageId === 0 ? 'Use to' : 'Использовать до' }</p></th>
										<th><p>{ languageId === 0 ? 'Delete ' : 'Удалить ' }<i className="fa fa-trash" aria-hidden="true"/></p></th>
									</tr>
									{
										this.state.customCoupons.length
										? 	this.state.customCoupons.map( item =>
												<tr>
													<td>{ item.left_coupons }</td>
													<td>{ item.percent_discount} % </td>
													<td>{ item.valid_until ?  moment(item.valid_until).format('DD/MM/YYYY') : ' - ' }</td>
													<td>
														<i className="fa fa-trash" aria-hidden="true" onClick={ () => this.deleteCustomCuppon(item.id) } style={{ cursor: 'pointer' }}/> 
													</td>
												</tr>
											)
										: 	<tr>
												<td colSpan={4}>
													<h4 style={{ textAlign: 'center' }}>{ languageId === 0 ? 'Custom coupons: empty list' : 'Настраиваемые купоны: пустой список' }</h4>
												</td>
											</tr>
									}
								</table>
							</Col>
						</Row>
						<Row style={{ marginTop: 50, marginBottom: 50 }}>
							<Col>
								<h4>{ languageId === 0 ? 'Give coupon' : 'Выдать купон' }</h4>
							</Col>
							<Col xs={4}>
								<TextField
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Email' : 'Емейл' }
									errorText={ this.state.errorGivenCouponEmail && ( languageId === 0 ? 'Invalid email' : 'Неверный емейл' ) }
									value={ this.state.givenCouponEmail}
									onChange={ (e, givenCouponEmail) => this.setState({ givenCouponEmail, errorGivenCouponEmail: !regExpEmail.test(givenCouponEmail) })}/>
							</Col>							
							<Col xs={5}>
								<SelectField
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Coupon' : 'Купон' }
									value={this.state.selectedCoupon}
									onChange={ (e,i, value) => this.setState({ selectedCoupon: value }) }
								>
								{ 
									this.state.customCoupons.map( item =>
										<MenuItem 
											value={item.id} 
											primaryText={ 
												languageId === 0 
												? `${item.percent_discount}% , Valid to: ${ item.valid_until ? moment(item.valid_until).format('DD/MM/YYYY') : ' Not limited ' }` 
												: `${item.percent_discount}% , Валидный до: ${ item.valid_until ? moment(item.valid_until).format('DD/MM/YYYY') : ' Не ограничено ' }` 
											} />
									)
								}
								</SelectField>							
        					</Col>						
							<Col xs={3}>
								<RaisedButton
									disabled={ !this.state.givenCouponEmail || this.state.errorGivenCouponEmail || !this.state.selectedCoupon }
									label={ languageId === 0 ? 'Give coupon' : 'Выдать купон' }
									onClick={ this.giveCoupon }
									style={{ marginTop: 25 }}/>
							</Col>
						</Row>
					</Col>
				</Row>
			</div>
		)
	}

}