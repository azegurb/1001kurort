import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox'
import Paper from 'material-ui/Paper'
import Popover from 'material-ui/Popover'
import Divider from 'material-ui/Divider'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import _ from 'lodash'

import axios from 'axios'

const initialState =	{
							openAddService: false,
							menuItem : 0,
							listData: [],
							selectedDesiaseProfiles: [],
						}


export default class NotFound extends Component {


	constructor(props) {
		super(props);

		this.state = initialState

		this.saveChanges = ::this.saveChanges;
		this.handleCheckItem = ::this.handleCheckItem;
		this.createService = ::this.createService;
		this.handleOpenAddService = ::this.handleOpenAddService;
		this.handleNameService = ::this.handleNameService;
		this.handleCategoryService = ::this.handleCategoryService;
		this.handleMenuItem = ::this.handleMenuItem;
		this.handleMainDiseaseProfiles = ::this.handleMainDiseaseProfiles;
	}


	componentWillMount() {
		axios.get('/api/hotels-treatments-names').then( responseNames =>{
			let dataNames = responseNames.data.data
			let data = []

			axios
				.get('/api/hotels-treatments-props', { 
					params: {
						users_id: this.props.data.users_id
					}
				})
				.then( responseProps => {
					
					dataNames.map( (item,index) => {
						let itemProps = _.find(responseProps.data.data, { treatment_name_id: item.id })
				
						data.push({ 
							label: [item.name, item.name_ru ],
							category: item.category,
							id: item.id, 
							checked: itemProps ? itemProps.value : false,
						})
					})
					this.setState({ listData : _.orderBy(data, ['category', 'name'], ['asc', 'asc']), mainDiseaseProfiles: this.props.data.h_main_treatment_profile_id })				
				})
		})
	}

	saveChanges() {
		axios
			.post('/api/profile/hotels-treatments/update',
				{
					users_id: this.props.data.users_id,
					listData : this.state.listData,
					mainDiseaseProfiles: this.state.mainDiseaseProfiles,
				}
			)
			.then( response =>{
				console.log(this.props)
			})		
	}

	handleCheckItem( id, value ) {
		let listData = this.state.listData
		
		_.forEach(listData, (item,key) => {
			if(item.id === id ){
				item.checked = value
			}
		})

		this.setState({ listData })

	}


	createService() {

	let listData = this.state.listData,
		nameService = this.state.nameService,
		categoryService = this.state.categoryService

		if(_.find( listData, item => { return item.label[0] === nameService || item.label[1] === nameService  ? true : false }) ){

			this.setState({ addServiceError : true , errorAddServiceText : ['This service already exist','Этот сервис уже существует'] })
		} else {

			listData.push({ label : [ nameService, nameService], id: listData.length + 1 })
			
			this.setState({ openAddService : false , errorAddServiceText : [], listData })
		}
 	}


	handleOpenAddService(event) {
		this.setState({ openAddService : !this.state.openAddService, anchorEl: event.currentTarget })
	}

	handleNameService(event, nameService) {
		this.setState({ nameService })
	}

	handleCategoryService(event, index, categoryService) {
		this.setState({ categoryService })
	}

	handleMenuItem(event, index, menuItem) { 
		this.setState({ menuItem });
	}
	
	handleMainDiseaseProfiles(event, index, mainDiseaseProfiles) {
		this.setState({ mainDiseaseProfiles });
	}

	render() {
		
		const languageId = this.props.languageId - 0;
		console.log(this.props)
		return(
				<div>
					<Row>
						
						<Col xs={12} >

							<SelectField
								value={this.state.menuItem}
								onChange={ ::this.handleMenuItem }
								floatingLabelText={ languageId === 0 ? 'section' : 'Раздел' }
								style={{ width : '350px' }}
							>
								<MenuItem value={0} primaryText={ languageId === 0 ? 'Surveys' : 'Обследования' } />
								<MenuItem value={1} primaryText={ languageId === 0 ? 'Healing procedures' : 'Лечебные процедуры' } />
								<MenuItem value={2} primaryText={ languageId === 0 ? 'Equipment' : 'Оборудования' } />
								<MenuItem value={3} primaryText={ languageId === 0 ? 'Disease profiles' : 'Профили заболеваний' } />
								<MenuItem value={4} primaryText={ languageId === 0 ? 'Natural curative product' : 'Натуральный лечебный продукт' } />
							</SelectField>

							<RaisedButton
								label={ languageId ===0 ? 'Save changes' : 'Сохранить изменения' }
								style={{ float: 'right', margin: 28 }}
								onClick={ ::this.saveChanges } />

							<RaisedButton
								label={ this.state.openAddService ? languageId ===0 ? 'Close' : 'Закрыть' : languageId === 0 ? 'Add item' : 'Добавить пункт' }
								style={{ float: 'right', margin: 28 }}
								onClick={ ::this.handleOpenAddService } />							

							<Popover
								open={this.state.openAddService }
								anchorEl={this.state.anchorEl}
								anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
								targetOrigin={{horizontal: 'left', vertical: 'top'}}
								style={{ marginTop: 8, paddingLeft: 30, paddingRight: 30 }}
								onRequestClose={ () => this.setState({ openAddService : false }) }
							>
								<Row style={{ height: 86, width: '100%'}}>
									<Col xs={3}>
										<TextField
											floatingLabelText={ languageId === 0 ? 'Name of service' : 'Название услуги' } 
											errorText= { this.state.addServiceError && this.state.errorAddServiceText[languageId] }
											underlineFocusStyle={{borderColor: '#49c407'}}
											floatingLabelFocusStyle={{color: '#49c407'}}
											style={{ paddingLeft : 0 }}
											value = { this.state.nameService }	
											onChange={ ::this.handleNameService } />
									</Col>

									<Col xs={3} offset={{ xs: 2 }}>
										<SelectField
											floatingLabelText={ languageId === 0 ? 'Category' : 'Категория' } 
											value={this.state.categoryService}
											onChange={this.handleCategoryService}
										>
											<MenuItem value={0} primaryText={ languageId === 0 ? 'Surveys' : 'Обследования' } />
											<MenuItem value={1} primaryText={ languageId === 0 ? 'Healing procedures' : 'Лечебные процедуры' } />
											<MenuItem value={2} primaryText={ languageId === 0 ? 'Equipment' : 'Оборудования' } />
											<MenuItem value={3} primaryText={ languageId === 0 ? 'Disease profiles' : 'Профили заболеваний' } />
											<MenuItem value={4} primaryText={ languageId === 0 ? 'Natural curative product' : 'Натуральный лечебный продукт' } />

										</SelectField>								
									</Col>	

									<Col xs={3} offset={{ xs: 1}} style={{ marginTop: 27 }}>
										<RaisedButton
											label={languageId === 0 ? 'Add' : 'Добавить' }
											style={{ float: 'right' }}
											onClick={ ::this.createService } />
									</Col>

								</Row>
							</Popover>

						</Col>

						<Col xs={12}>
							<Divider />
						</Col>

					</Row>
					
					<Row style={{ margin : '15px', marginBottom: 200 }} >
						<Col xs={6}>
						{
							this.state.listData.map( (item, index) => 
								item.category === this.state.menuItem &&
								<Checkbox
									key={item.id}
									label={ item.label[languageId] } 
									checked={item.checked}
									onCheck={ (e, checked) => this.handleCheckItem(item.id, checked) } />								
							)
						}
						</Col>
						<Col xs={6}>
						{ this.state.menuItem === 3 &&
							<SelectField
								multiple
								fullWidth
								floatingLabelText={ languageId === 0 ? 'Main profile' : 'Основной профиль' }
								value={this.state.mainDiseaseProfiles}
								onChange={this.handleMainDiseaseProfiles}
							>
								{
									this.state.listData.map( item =>
										item.category === 3 && item.checked &&
											<MenuItem value={item.id} primaryText={ item.label[languageId] } />
									)
								}
							</SelectField>	
						}					
						</Col>
					</Row>						
				</div>
		)
	}
}