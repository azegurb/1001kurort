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
	creatingCategory: false,
	detailedCategory: false,
	newLabel: '',
	newPercent: '',
	activeCategoryId: null,
}

export default class DoctorCoupons extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ couponsTypes: [], listDoctors: [] }, initialState)

		this.axiosGetDoctorTypes = ::this.axiosGetDoctorTypes;
		this.axiosGetDoctorsList = ::this.axiosGetDoctorsList;
		this.createCategoryType = ::this.createCategoryType;
		this.updateCategoryType = ::this.updateCategoryType;
		this.deleteCategoryType = ::this.deleteCategoryType;
		this.changeDoctorsType = ::this.changeDoctorsType;
	}

	componentWillMount(){
		this.axiosGetDoctorTypes()
		this.axiosGetDoctorsList()
	}

	axiosGetDoctorTypes() {
		axios.get('/admin/doctor-coupons')
			 .then( response => this.setState({ couponsTypes: response.data.data }) )
	}


	axiosGetDoctorsList() {
		axios.get('/api/doctors')
			 .then( response => this.setState({ listDoctors: response.data.data }) )
	}

	createCategoryType() {
		axios.post('/admin/doctor-coupons/create', {
			name: this.state.newLabel,
			percent: this.state.newPercent
		}).then( () => {
			this.axiosGetDoctorTypes() 
			this.setState(initialState)
		})
	}

	updateCategoryType() {
		axios.post('/admin/doctor-coupons/update', {
			name: this.state.newLabel,
			percent: this.state.newPercent,
			id: this.state.activeCategoryId,		
		}).then( () => {
			this.axiosGetDoctorTypes() 
			this.setState(initialState)
		})
	}

	deleteCategoryType() {
		axios.post('/admin/doctor-coupons/delete', {
			id: this.state.activeCategoryId,		
		}).then( () => {
			this.axiosGetDoctorTypes() 
			this.setState(initialState)
		})
	}

	changeDoctorsType(doctor_id, category) {
		axios.post('/admin/doctor-coupons/category/change',{
			doctor_id,
			category,
		}).then( response => this.axiosGetDoctorsList() )
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row style={{ marginTop: 20 }}>
					<Col style={{ marginBottom: 30 }}>
						<RaisedButton 
							label={ languageId === 0 ? 'Add category doctors' : 'Создать категорию врачей' }
							onClick={ () => this.setState({ creatingCategory: true, detailedCategory: true }) }/>
					</Col>
					{
						this.state.detailedCategory
						?	<Col xs={6}>
								<TextField
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Name' : 'Название' }
									value={this.state.newLabel}
									onChange={ (e,value) => this.setState({ newLabel: value }) }/>
								<TextField 
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Percent discount' : 'Процент скидки' }
									value={this.state.newPercent}
									onChange={ (e,value) => this.setState({ newPercent: value }) }/>
								{
									this.state.creatingCategory
									?	<Row style={{ marginTop: 10 }}>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Cancel' : 'Отменить' }
													onClick={ () => this.setState(initialState) } />
											</Col>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Create' : 'Создать' }
													onClick={this.createCategoryType} />
											</Col>
										</Row>
									:	<Row style={{ marginTop: 10 }}>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Delete' : 'Удалить' }
													onClick={this.deleteCategoryType} />
											</Col>
											<Col xs={6}>
												<RaisedButton
													label={ languageId === 0 ? 'Change' : 'Изменить' }
													onClick={this.updateCategoryType} />
											</Col>
										</Row>
								}
							</Col>
						:	<Col>
								{
									this.state.couponsTypes.length
									?	this.state.couponsTypes.map( (item, index) =>
											<Row>
												<Col xs={1}>
													<p>{ index+1 }.</p>
												</Col>
												<Col xs={4}>
													<p>{ item.name }</p>
												</Col>
												<Col xs={2}>
													<p>{ item.percent } %</p>
												</Col>
												<Col xs={4}>
													<FlatButton 
														label={ languageId === 0 ? 'Change' : 'Изменить' }
														onClick={ () => this.setState({ 
																detailedCategory: true, 
																creatingCategory: false, 
																newLabel: item.name, 
																newPercent: item.percent,
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
				<Row style={{ marginTop: 40 }}>
					<Col>
						<table id='booking' className='table-sanatorium-room'>
							<tr>
								<th>{ languageId === 0 ? 'Full name' : 'Полное имя' }</th>
								<th>{ languageId === 0 ? 'Contacts' : 'Контакты' }</th>
								<th>{ languageId === 0 ? 'Speciality' : 'Специальность' }</th>
								<th>{ languageId === 0 ? 'Category' : 'Категория' }</th>
							</tr>
						{
							this.state.listDoctors.length
							?	this.state.listDoctors.map( item =>
									<tr>
										<td>
											{ (item.first_name || item.last_name) ? `${item.first_name} ${item.last_name}` : 'No name' }
										</td>
										<td>
											<p>{ item.email ? item.email : '-' }</p>
											<p>{ item.phone ? item.phone : '-' }</p>
										</td>
										<td >
											{ item.d_speciality ? item.d_speciality[languageId] : '-' }
										</td>
										<td>
											<SelectField
												value={item.d_coupon_type}
												onChange={ (e,i,value) => this.changeDoctorsType(item.id, value) }
											>
											{
												this.state.couponsTypes.map( type =>
													<MenuItem value={type.id} primaryText={`${type.name} (-${type.percent}%)`} />
												)
											}
											</SelectField>									
										</td>
									</tr>
								)
							: 	<tr>
									<td colSpan={10}>{ languageId === 0 ? 'No doctors' : 'Нету врачей' }</td>
								</tr>
						}
						</table>
					</Col>
				</Row>
			</div>
		)
	}

}