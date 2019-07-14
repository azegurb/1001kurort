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

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const initialState = {
	creatingTransfer: false,
	detailedCategory: false,
	newDepartment: '',
	newArrival: '',
	newPrice: '',
	newCurrency: '',
	sanatorium_ids: [],
	activeCategoryId: null,
}

export default class AdminTransfer extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ transferList: [], hotelsList: [] }, initialState)

		this.axiosGetTransferList = ::this.axiosGetTransferList;
		this.axiosGetHotelList = ::this.axiosGetHotelList;
		this.createTransfer = ::this.createTransfer;
		this.updateTransfer = ::this.updateTransfer;
		this.deleteTransfer = ::this.deleteTransfer;
	}

	componentWillMount(){
		this.axiosGetTransferList()
		this.axiosGetHotelList()
	}

	axiosGetTransferList() {
		axios.get('/admin/transfer')
			 .then( response => this.setState({ transferList: response.data.data }) )
	}


	axiosGetHotelList() {
		axios.get('/api/hotels-names')
			 .then( response => this.setState({ hotelsList: response.data.data }) )
	}

	createTransfer() {
		axios.post('/admin/transfer/create', {
			departure: this.state.newDepartment,
			arrival: this.state.newArrival,
			oppositeDirection: this.state.oppositeDirection,
			price_value: this.state.newPrice,
			price_currency: this.state.newCurrency,
			sanatorium_ids: [],
		}).then( () => {
			this.axiosGetTransferList() 
			this.setState(initialState)
		})
	}

	updateTransfer() {
		axios.post('/admin/transfer/update', {
			departure: this.state.newDepartment,
			arrival: this.state.newArrival,
			oppositeDirection: this.state.oppositeDirection,
			price_value: this.state.newPrice,
			price_currency: this.state.newCurrency,
			sanatorium_ids: this.state.sanatorium_ids,
			id: this.state.activeCategoryId,		
		}).then( () => {
			this.axiosGetTransferList() 
			this.setState(initialState)
		})
	}

	deleteTransfer() {
		axios.post('/admin/transfer/delete', {
			id: this.state.activeCategoryId,		
		}).then( () => {
			this.axiosGetTransferList() 
			this.setState(initialState)
		})
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row style={{ marginTop: 20 }}>
					<Col style={{ marginBottom: 30 }}>
						<RaisedButton 
							label={ languageId === 0 ? 'Add transfer' : 'Создать трансфер' }
							onClick={ () => this.setState({ creatingTransfer: true, detailedCategory: true }) }/>
					</Col>
					{
						this.state.detailedCategory
						?	<Col xs={6}>
										
								<TextField
									fullWidth
									floatingLabelText={languageId === 0 ? 'Departure' : 'Отправление'}                       
									value={this.state.newDepartment}
									onChange={ (e,value) => this.setState({ newDepartment: value }) } />									

								<TextField 
									fullWidth
									floatingLabelText={languageId === 0 ? 'Arrival' : 'Прибытие'}                       
									value={this.state.newArrival}
									onChange={ (e,value) => this.setState({ newArrival: value }) } />									

								<Checkbox
									label={languageId === 0 ? 'Transfer in the opposite direction' : 'Трансфер в обратную сторону'}
									checked={this.state.oppositeDirection}
									onCheck={(e,checked) => this.setState({ oppositeDirection: checked })}
									style={{ margin: '10px 0px'}}/>

								<TextField 
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Price value' : 'Цена' }
									value={this.state.newPrice}
									onChange={ (e,value) => this.setState({ newPrice: parseInt(value) || 0 }) }/>
								
								<SelectField 
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Currency' : 'Валюта' }									
									value={this.state.newCurrency}
									onChange={ (e,i,value) => this.setState({  newCurrency: value }) } >

										<MenuItem value={0} primaryText="USD" />
										<MenuItem value={1} primaryText="RUB" />
										<MenuItem value={2} primaryText="AZN" />
										<MenuItem value={3} primaryText="KZT" />
										<MenuItem value={4} primaryText="EUR" />
								</SelectField>

								<SelectField 
									fullWidth
									multiple
									floatingLabelText={ languageId === 0 ? 'Available for' : 'Доступно для' }									
									value={this.state.sanatorium_ids}
									onChange={ (e,i,value) => this.setState({  sanatorium_ids: value }) } >
										{ this.state.hotelsList.map( item =>
											<MenuItem 
												key={item.id}
												insetChildren={true}
												checked={this.state.sanatorium_ids && this.state.sanatorium_ids.indexOf(item.id) > -1}
												value={item.id} 
												primaryText={item.h_sname}/>
										)}
								</SelectField>

								{
									this.state.creatingTransfer
									?	<Row style={{ marginTop: 10 }}>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Cancel' : 'Отменить' }
													onClick={ () => this.setState(initialState) } />
											</Col>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Create' : 'Создать' }
													onClick={this.createTransfer} />
											</Col>
										</Row>
									:	<Row style={{ marginTop: 10 }}>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Delete' : 'Удалить' }
													onClick={this.deleteTransfer} />
											</Col>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Change' : 'Изменить' }
													onClick={this.updateTransfer} />
											</Col>
										</Row>
								}
							</Col>
						:	<Col>
								{
									this.state.transferList.length
									?	this.state.transferList.map( (item, index) =>
											<Row style={{ marginTop: 20 }}>
												<Col xs={1}>
													<p>{ index+1 }.</p>
												</Col>
												<Col xs={4}>
													<p>{ item.departure } - { item.arrival } {item.opposite_direction && ` - ${item.departure}`}</p>
												</Col>
												<Col xs={2}>
													<p>{ item.price_value } {currency[item.price_currency]}</p>
												</Col>
												<Col xs={3}>
													{ item.sanatorium_ids.map( id =>
														<p>{ _.find(this.state.hotelsList, { id }) && _.find(this.state.hotelsList, { id }).h_sname }</p>
													)}
												</Col>
												<Col xs={2}>
													<FlatButton 
														label={ languageId === 0 ? 'Change' : 'Изменить' }
														onClick={ () => this.setState({ 
																detailedCategory: true, 
																creatingCategory: false, 
																newArrival: item.arrival, 
																newDepartment: item.departure,
																oppositeDirection: item.opposite_direction,															
																newPrice: item.price_value,
																newCurrency: item.price_currency,
																sanatorium_ids: item.sanatorium_ids,
																activeCategoryId: item.id,
															}) 
														}
														style={{ marginTop: -15 }}/>
												</Col>
											</Row>
										)
									: 	<p>{ languageId === 0 ? 'No available ' : 'Нет доступных' }</p>
								}
							</Col>
					}
				</Row>
			</div>
		)
	}

}