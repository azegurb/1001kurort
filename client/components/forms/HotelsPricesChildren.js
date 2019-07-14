import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Slider from 'material-ui/Slider'
import Checkbox from 'material-ui/Checkbox'
import Edit from 'material-ui/svg-icons/editor/border-color'
import Delete from 'material-ui/svg-icons/navigation/close'
import _ from 'lodash'

import axios from 'axios'

const ages = [
	{ value: 1, label: [ '1 year', '1 год'] },
	{ value: 2, label: [ '2 year', '2 года'] },
	{ value: 3, label: [ '3 year', '3 года'] },
	{ value: 4, label: [ '4 year', '4 года'] },
	{ value: 5, label: [ '5 year', '5 лет'] },
	{ value: 6, label: [ '6 year', '6 лет'] },
	{ value: 7, label: [ '7 year', '7 лет'] },
	{ value: 8, label: [ '8 year', '8 лет'] },
	{ value: 9, label: [ '9 year', '9 лет'] },
	{ value: 10, label: [ '10 year', '10 лет'] },
	{ value: 11, label: [ '11 year', '11 лет'] },
	{ value: 12, label: [ '12 year', '12 лет'] },
	{ value: 13, label: [ '13 year', '13 лет'] },
	{ value: 14, label: [ '14 year', '14 лет'] },
	{ value: 15, label: [ '15 year', '15 лет'] },
	{ value: 16, label: [ '16 year', '16 лет'] },
	{ value: 17, label: [ '17 year', '17 лет'] },
	{ value: 18, label: [ '18 year', '18 лет'] },
]

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const initialState =	{
							openDeleteDialog: false,
							open: false,
							changingAges: [],
							pricingCategoryList: [],
							category: null,
							currency: null,
							itemEditing: null,
							itemDeleting: null,
						}


export default class HotelsPricingCategories extends Component {


	constructor(props) {
		super(props);

		this.state = Object.assign( { pricingCategoriesNames: [], childrenPricingList : [] }, initialState )

		this.getChildrenList = ::this.getChildrenList;
		this.createCategory = ::this.createCategory;
		this.changeCategory = ::this.changeCategory;
		this.deleteCategory = ::this.deleteCategory;
		this.openConditionForm = ::this.openConditionForm;
		this.handleOpenDeleteDialog = ::this.handleOpenDeleteDialog;
		this.handleCategory = ::this.handleCategory;
		this.handleCurrency = ::this.handleCurrency;
		this.handleChangeAgePrice = ::this.handleChangeAgePrice;
		this.handleAllAgesPrice = ::this.handleAllAgesPrice;
		this.handleEditOpen = ::this.handleEditOpen;

	}


	componentWillMount() {
		let changingAges = []

		for( var i=0 ; i < 18; i++)
			changingAges.push(0)

		this.setState({ changingAges })

		axios
			.get('/api/profile/hotel/price-categories',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
			).then( response => {

				let pricingCategoriesNames = []
			
				response.data.data.map( item => {

					pricingCategoriesNames.push({
						id: item.category_id,
						categoryName : item.name
					})
				})

				this.setState({ pricingCategoriesNames })
			})
		this.getChildrenList()	
	}

	getChildrenList() {
		axios
			.get('/api/profile/hotel/price-children',
						{
							params : {
								users_id : this.props.data.users_id
							}
						}
			).then( response =>
				this.setState({ childrenPricingList: response.data.data })
			)
	}


	createCategory() {
		axios
			.post('/api/profile/hotel/rooms-children/add-info',
			{
				users_id: this.props.data.users_id,
				category_id: this.state.category,
				surcharge_value: this.state.changingAges,
				currency: this.state.currency
			})
			.then( () => this.getChildrenList() )

		this.setState({ initialState })
		this.setState({ open: false })
	}	


	changeCategory() {
		axios
			.post('/api/profile/hotel/price-children/update',
			{
				category_id: this.state.itemEditing,
				surcharge_value: this.state.changingAges,
				currency: this.state.currency
			})
			.then( () => this.getChildrenList() )
		
		this.setState({ initialState})
		this.setState({ open: false, openDeleteDialog: false })
	}

	deleteCategory() {
		axios
			.post('/api/profile/hotel/price-children/delete',
			{
				category_id: this.state.itemDeleting
			})
			.then( () => this.getChildrenList() )
		
		this.setState({ initialState})
		this.setState({ openDeleteDialog: false })
	}

	openConditionForm() {
		this.setState({ open : true })
	}

	handleOpenDeleteDialog (event) {
		this.setState({ openDeleteDialog : true, itemDeleting: parseInt(event.currentTarget.dataset.key) })
	}

	handleCategory(event, index, category) {
		this.setState({ category })
	}

	handleCurrency(event, index, currency) {
		this.setState({ currency })
	}

	handleChangeAgePrice(index, value) {
		let changingAges = this.state.changingAges
			changingAges[index] = parseInt(value)

		this.setState({ changingAges })
	}

	handleAllAgesPrice(index, value) {
		let changingAges = [],
			intValue = parseInt(value)

		for( var i=0 ; i < 18; i++)
			changingAges.push(intValue)

		this.setState({ changingAges })
	}

	handleEditOpen(id) {
		let row = _.find( this.state.childrenPricingList, { category_id: id})

		this.setState({ open: true, itemEditing: id, category: row.category_id, currency: row.currency, changingAges: row.surcharge_value })
	}

	
	render() {

		const languageId = this.props.languageId - 0;
	    	
		console.log(this.state )

		return(
				<div>
					<Row>
					
						<Col xs={12} className='center' style={{ margin : '10px' }}>
							{ 
								this.state.childrenPricingList.length ? 
							
									<div style={{ marginTop: 20 }}>
										<Row>

											<Col xs={3}>
												<h4>{ languageId === 0 ? 'Pricing category' : 'Ценовая категория' }</h4>
											</Col>
											
											<Col xs={3}>
												<h4>{ languageId === 0 ? 'Age/surcharge' : 'Возраст/доплата' }</h4>
											</Col>	

											<Col xs={3}>
												<h4>{ languageId === 0 ? 'Change' : 'Изменить' }</h4>
											</Col>											
											<Col xs={3}>

												<h4>{ languageId === 0 ? 'Delete' : 'Удалить' }</h4>
											</Col>

										</Row>
										<Row>
											<Col>
												<Divider />
											</Col>
										</Row>
									</div>

								:

									<div>
										<h5>{ languageId === 0 ? 'The conditions are absent' : 'Условия отсутствуют' }</h5>
									</div>
							}
						</Col>
					
					</Row>
					<Row style={{ marginBottom : 30 }}>

						<Col xs={12} className='center'>
							{ 
								this.state.childrenPricingList.length ?

									this.state.childrenPricingList.map( (item, index) =>
										_.find(this.state.pricingCategoriesNames, { id: item.category_id }) &&
										<Row>

											<Col xs={3}>
												<h4>{ _.find(this.state.pricingCategoriesNames, { id: item.category_id }).categoryName }</h4>
											</Col>
											
											<Col xs={3}>
												<ul style={{ listStyleType: 'none' }}>
												{ 
													item.surcharge_value.map( (value, index) =>
														<li>{`${ages[index].label[languageId]} / ${value+currency[item.currency]} `}</li>
													) 
												}
												</ul>
											</Col>

											<Col xs={3}>
												<IconButton tooltip={languageId === 0 ? 'Edit' : 'Изменить'} data-key={item.id} onClick={ () => this.handleEditOpen(item.category_id) } >
													<Edit />
												</IconButton>
											</Col>

											<Col xs={3}>
												<IconButton tooltip={languageId === 0 ? 'Delete' : 'Удалить'} data-key={item.id} onClick={ () => this.setState({ openDeleteDialog: true, itemDeleting: item.category_id }) } >
													<Delete />
												</IconButton>											
											</Col>

											<Col>
												<Divider />
											</Col>
										</Row>										
									)
								: 
									''
							}
						</Col>

					</Row>
					<Row>
						
						<Col>
							<RaisedButton
								disabled={ this.state.errorEmail || this.state.errorContactNumber }
								label={languageId === 0 ? 'Add condition' : 'Добавить условие'}
								style={{ marginTop: 10 }} 
								onClick={ this.openConditionForm } />
						</Col>

					</Row>

					<Dialog
						autoScrollBodyContent
						title={ this.state.itemEditing ? languageId === 0 ? 'Edit category' : 'Изменение категории' : languageId === 0 ? 'New condition' : 'Новое условие'} 
						actions={
									this.state.itemEditing ?
										
										<FlatButton
											label={languageId === 0 ? 'Change' : 'Изменить'}
											disabled={ this.state.errorRangeAge }
											onClick={ this.changeCategory } />
									:

										<FlatButton
											label={languageId === 0 ? 'Confirm' : 'Подтвердить'} 
											disabled={ this.state.errorRangeAge }
											onClick={ this.createCategory } />
						}
						modal={false}
						open={this.state.open}
						onRequestClose={ () => this.setState({ open: false }) }
					>
						<Row>

							<Col xs={6}>
								<SelectField 
									floatingLabelText={ languageId === 0 ? 'Choose one category' : 'Выберите категорию'}
									value={ this.state.category } 
									onChange={ ::this.handleCategory }>
									{
										this.state.pricingCategoriesNames.length ? 

											this.state.pricingCategoriesNames.map( (item, index) => 
												<MenuItem 
													key={item.id} 
													value={item.id} 
													primaryText={ item.categoryName.length ? item.categoryName : languageId === 0 ? 'No name' : 'Без названия' } />
											)

										:

											<p>{languageId === 0 ? 'You don`t have conditions' : 'У вас нету условий'}</p>
									}										
								</SelectField>									
							</Col>	
							<Col xs={6}>
								<SelectField value={ this.state.currency } onChange={ this.handleCurrency } floatingLabelText={ languageId === 0 ? 'Choose currency' : 'Выберите валюту' }>
									<MenuItem value={0} primaryText='USD' />
									<MenuItem value={1} primaryText='RUB' />
									<MenuItem value={2} primaryText='AZN' />
									<MenuItem value={3} primaryText='KZT' />
									<MenuItem value={4} primaryText='EUR' />
								</SelectField>
							</Col>

						</Row>
						<Row>
							<Col xs={6}>
								<h5 style={{ lineHeight: '28px', paddingTop: 20 }}>{ languageId === 0 ? 'All ages' : 'Все возраста' }</h5>
							</Col>
							<Col xs={3}>	
							
								<TextField
									fullWidth 
									floatingLabelText={ languageId === 0 ? 'Surcharge' : 'Доплата' }
									onChange={ this.handleAllAgesPrice } />

							</Col>			
						</Row>							
						{
							ages.map ( (item, index) =>
								<Row key={index} >
									<Col xs={6}>
										<h5 style={{ lineHeight: '28px' }}>{ item.label[languageId] }</h5>
									</Col>
									<Col xs={3}>
										<TextField
											fullWidth
											hintText={100}
											value= { this.state.changingAges[index] }	 
											onChange={ (event, value) => this.handleChangeAgePrice(index, value) } />													
									</Col>
								</Row>	
							)

						}
					</Dialog>

					<Dialog
						autoScrollBodyContent
						title={ languageId === 0 ? 'Delete this condition ? ' : 'Удалить это условие ? ' }
						actions={[ 
									<FlatButton
										label={languageId === 0 ? 'Cancel' : 'Отменить'} 
										onClick={ () => this.setState(initialState) } />,
									<FlatButton
										label={languageId === 0 ? 'Delete' : 'Удалить'} 
										onClick={ ::this.deleteCategory } />
						]}
						modal={true}
						open={this.state.openDeleteDialog}
					>
						<Row className='center' >
							{ languageId === 0 ? 'This action can not be returned' : 'Это действие нельзя будет вернуть' }
						</Row>
					</Dialog>

				</div>

		)
	}
}