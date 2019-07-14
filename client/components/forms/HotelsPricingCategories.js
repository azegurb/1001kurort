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
import _ from 'lodash'

import axios from 'axios'

import Edit from 'material-ui/svg-icons/editor/border-color'
import Delete from 'material-ui/svg-icons/navigation/close'

const initialState =	{
							openDeleteDialog: false,
							open: false,
							selectedConditions: [],
							selectedRooms: [],
							categoryName: '',
							mealPlane: [],
							policy: '',
							itemEditing: null,
							itemDeleting: null
						}


export default class HotelsPricingCategories extends Component {


	constructor(props){
		super(props);

		this.state = Object.assign( { pricingCategoryList : [], rooms: [], pricingConditionsList: [] }, initialState )

		this.axiosGetRooms = ::this.axiosGetRooms;
		this.axiosGetPricingConditions = ::this.axiosGetPricingConditions;
		this.axiosGetPricingCategories = ::this.axiosGetPricingCategories;
		this.getPricingCategories = ::this.getPricingCategories;
		this.createCategory = ::this.createCategory;
		this.changeCategory = ::this.changeCategory;
		this.deleteCategory = ::this.deleteCategory;
		this.handleRoomChange = ::this.handleRoomChange;
		this.handleConditionChange = ::this.handleConditionChange;
		this.openConditionForm = ::this.openConditionForm;
		this.handleOpenEditCategory = ::this.handleOpenEditCategory;
		this.handleOpenDeleteDialog = ::this.handleOpenDeleteDialog;
		this.handleCategoryName = ::this.handleCategoryName;
		this.handleDailyProcedures = ::this.handleDailyProcedures;
		this.handleDailyDoctorVis = ::this.handleDailyDoctorVis;
		this.handleDailyPhysioter = ::this.handleDailyPhysioter;
		this.handleMealPlane = ::this.handleMealPlane;
		this.handleTreatmIncl = ::this.handleTreatmIncl;
		this.handlePolicy = ::this.handlePolicy;

	}


	componentWillMount(){
		this.getPricingCategories()
	}


	axiosGetRooms() {
		return 	axios.get('/api/profile/hotel/rooms',
						{
							params : {
								users_id : this.props.data.users_id
							}
						}
					)
	}

	axiosGetPricingConditions() {
		return 	axios.get('/api/profile/hotel/price-conditions',
						{
							params : {
								users_id : this.props.data.users_id
							}
						}
					)
	}

	axiosGetPricingCategories() {
		axios
			.get('/api/profile/hotel/price-categories',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
			).then( response => {

				let pricingCategoryList = []
			
				response.data.data.map( item => {

					pricingCategoryList.push({
						id: item.category_id,
						categoryName : item.name,
						mealPlane: item.meal_plan,
						policy: item.is_nonrefundable,
						treatmIncl: item.treatment_incl,
						dailyDoctorVis: item.daily_doctor_vis,
						dailyProcedures: item.daily_procedures,
						dailyPhysioter: item.daily_physioter,
						rooms: _.filter(this.state.rooms, room => { return _.indexOf( item.rooms_id , room.room_id) > -1 ? true : false } ).map( room => { return { id: room.room_id, label : room.sname } }),
						conditions : _.filter(this.state.pricingConditionsList, condition => { return _.indexOf( item.conditions_id , condition.id) > -1 ? true : false } ).map( condition => { return { id: condition.id, label : condition.name } })
					})
				})

				this.setState({ pricingCategoryList })
			})
	}

	getPricingCategories() {
		axios
			.all([this.axiosGetRooms(), this.axiosGetPricingConditions()])
			.then(axios.spread( (roomsRes, conditionsRes) => {
					let rooms = [],
						pricingConditionsList = []

					rooms = roomsRes.data.data

					conditionsRes.data.data.map( item => {

						pricingConditionsList.push({
							id: item.condition_id,
							name: item.name,
							timeRange: [item.min_days,item.max_days],
							changingPrice: item.changing_value,
							changingPriceType: item.changing_currency,
							isDiscount : item.is_discount
						})
					})

					this.setState({ rooms, pricingConditionsList })
					
				})
			).then( () => this.axiosGetPricingCategories() )
	}

	createCategory() {

		let pricingCategoryList = this.state.pricingCategoryList, 
			categoryName = this.state.categoryName,
			mealPlane = this.state.mealPlane,
			treatmIncl = this.state.treatmIncl,
			dailyProcedures = treatmIncl ? this.state.dailyProcedures : 0,
			dailyDoctorVis = treatmIncl ? this.state.dailyDoctorVis : 0,
			dailyPhysioter = treatmIncl ? this.state.dailyPhysioter : 0,
			policy = this.state.policy,
			rooms = this.state.selectedRooms,
			conditions = this.state.selectedConditions,
			idRooms = rooms.map( item => item.id ),
			idConditions = conditions.map( item => item.id )

		axios.post('/api/profile/hotel/rooms-categories/add-info',
				{
					users_id: this.props.data.users_id,
					name : categoryName ,
					is_nonrefundable : policy,
					meal_plan : mealPlane,
					treatment_incl: treatmIncl,
					rooms_id: idRooms,
					conditions_id : idConditions,
					daily_procedures: dailyProcedures,
					daily_doctor_vis: dailyDoctorVis,
					daily_physioter: dailyPhysioter,
				}
			).then( response => {

				this.setState(initialState)
				this.axiosGetPricingCategories()
			})


	}	


	changeCategory() {

		let pricingCategoryList = this.state.pricingCategoryList,
			categoryName = this.state.categoryName,
			mealPlane = this.state.mealPlane,
			treatmIncl = this.state.treatmIncl,
			dailyProcedures = treatmIncl ? this.state.dailyProcedures : 0,
			dailyDoctorVis = treatmIncl ? this.state.dailyDoctorVis : 0,
			dailyPhysioter = treatmIncl ? this.state.dailyPhysioter : 0,
			policy = this.state.policy,
			rooms = this.state.selectedRooms,
			conditions = this.state.selectedConditions,
			idRooms = rooms.map( item => item.id ),
			idConditions = conditions.map( item => item.id )

			axios.post('/api/profile/hotel/price-categories/update',{
				users_id: this.props.data.users_id,
				name : categoryName ,
				is_nonrefundable : policy,
				meal_plan : mealPlane,
				treatment_incl: treatmIncl,
				rooms_id: idRooms,
				conditions_id : idConditions,
				category_id: this.state.itemEditing,
				daily_procedures: dailyProcedures,
				daily_doctor_vis: dailyDoctorVis,
				daily_physioter: dailyPhysioter,
			}).then( response => {
				this.setState(initialState)
				this.axiosGetPricingCategories()		
			})


	}


	deleteCategory() {
		
		axios.post('/api/profile/hotel/price-categories/delete',
			{
				id : this.state.itemDeleting
			}
		).then( response => {

			this.setState(initialState)
			this.axiosGetPricingCategories()
		})

	}



	handleRoomChange( e, value ) {

		let id = parseInt(e.currentTarget.dataset.key),
			label = e.currentTarget.dataset.label,
			selectedRooms = this.state.selectedRooms

		if( value){

			selectedRooms.push({ id: id , label: label})
		}else {

			selectedRooms = _.filter( selectedRooms, item => { return item.id === id ? false : true })
		}		

		this.setState({ selectedRooms })
	}



	handleConditionChange( e, value) {

		let selectedConditions = this.state.selectedConditions,
			id = parseInt(e.currentTarget.dataset.key),
			label = e.currentTarget.dataset.label

		if( value){

			selectedConditions.push({ id: id , label: label})
		}else {

			selectedConditions = _.filter( selectedConditions, item => { return item.id === id ? false : true })
		}		

		this.setState({ selectedConditions })
	}



	openConditionForm() {
		this.setState({ open : true })
	}

	handleOpenEditCategory(id ) {

		let item = _.find( this.state.pricingCategoryList , { id })

		this.setState	({ 
							open : true , 
							itemEditing : id, 
							categoryName: item.categoryName, 
							mealPlane : item.mealPlane,
							treatmIncl: item.treatmIncl,
							dailyProcedures: item.treatmIncl ? item.dailyProcedures : 0,
							dailyDoctorVis: item.treatmIncl ? item.dailyDoctorVis : 0,
							dailyPhysioter: item.treatmIncl ? item.dailyPhysioter : 0,
							policy: item.policy,
							selectedRooms: item.rooms,
							selectedConditions: item.conditions
						}) 
	}


	handleOpenDeleteDialog(id) {
		this.setState({ openDeleteDialog : true, itemDeleting: id })
	}
	
	handleCategoryName(event, categoryName) {
		this.setState({ categoryName })
	}

	handleDailyProcedures(event, dailyProcedures) {
		this.setState({ dailyProcedures: parseInt(dailyProcedures) > 0 ? parseInt(dailyProcedures) : 1 })
	}

	handleDailyDoctorVis(event, dailyDoctorVis) {
		this.setState({ dailyDoctorVis: parseInt(dailyDoctorVis) > 0 ? parseInt(dailyDoctorVis) : 1 })
	}
	
	handleDailyPhysioter(event, dailyPhysioter) {
		this.setState({ dailyPhysioter: parseInt(dailyPhysioter) > 0 ? parseInt(dailyPhysioter) : 1 })
	}

	handleMealPlane(event, index, mealPlane) {
		this.setState({ mealPlane })
	}

	handleTreatmIncl(event, index, treatmIncl) {
		this.setState({ treatmIncl })
	}

	handlePolicy(event, index, policy) {
		this.setState({ policy })
	}

	render() {

		const languageId = this.props.languageId - 0;
	    
	    console.log(this.state)

		return(
				<div>
					<Row>

						<Col xs={12}>
							{ 	languageId === 0 ? 
									<h4>Here you can add, manage and delete the price categories.<br />Here you also can apply additional conditions from the page «Pricing conditions»</h4>
								:
									<h4>Здесь вы можете добавлять, управлять и удалять ценовые категории.<br />Здесь вы также можете применить дополнительные условия со страницы «Ценовые условия»</h4> 
							}	
						</Col>
					
					</Row>
					<Row>
					
						<Col xs={12} className='center' style={{ margin : '10px' }}>
							{ 
								this.state.pricingCategoryList.length ? 
							
									<div style={{ marginTop: 20 }}>
										<Row>

											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Price name' : 'Название цены' }</h4>
											</Col>

											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Policy / Conditions' : 'Политика / Условия' }</h4>
											</Col>	

											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Treatment' : 'Лечение' }</h4>
											</Col>											
											
											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Meal plan' : 'План питания' }</h4>
											</Col>											
											
											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Rooms' : 'Комнаты' }</h4>
											</Col>
											
											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Pricing cond.' : 'Ценовые усл.' }</h4>
											</Col>

											<Col>
												<Divider />
											</Col>
											``
										</Row>
										{
											this.state.pricingCategoryList.map( (item,index)  => (
												
													[<Row key={index} style={{ lineHeight: '45px', fontSize: 12 }}>

														<Col xs={2}>
															{ item.categoryName ? item.categoryName : (languageId === 0 ? 'No name' : 'Без названия') }
														</Col>


														<Col xs={2}>
															{ !item.policy ? languageId === 0 ? 'General' : 'Общие' : languageId === 0 ? 'Non-refundable' : 'Неизменяемые цены' }
														</Col>
														
														<Col xs={2}>
															{ 
																item.treatmIncl ?
																	<div>
																		<p>{ languageId === 0 ? `Procedures/day : ${item.dailyProcedures || 0}` : `Процедур/день : ${item.dailyProcedures || 0}` }</p>
 																		<p>{ languageId === 0 ? `Doctor visits/day : ${item.dailyDoctorVis || 0}` : `Осмотр врача/день : ${item.dailyDoctorVis || 0}` }</p>
 																		<p>{ languageId === 0 ? `Physiotherapy/day : ${item.dailyPhysioter || 0}` : `Физиотерапий/день : ${item.dailyPhysioter || 0}` }</p>
																	</div>
																: 	<p>{ languageId === 0 ? 'Treatment not included' : 'Лечение не включено' }</p>
															}
														</Col>
														
														<Col xs={2}>
															{ item.mealPlane.map( item => { return item + ' ' } ) }
														</Col>
														
														<Col xs={2}>
															{ 	item.rooms.length
																? 	item.rooms.map( item => <p>{item.label}</p> )
																: 	<p>{ languageId === 0 ? 'No rooms' : 'Нет номеров' }</p>
															}
														</Col>

														<Col xs={2}>
															{ 	item.conditions.length
																? 	item.conditions.map( item => <p>{item.label}</p> )
																: 	<p>{ languageId === 0 ? 'No conditions' : 'Нет условий' }</p>
															}														
														</Col>

														<Col style={{ textAlign: 'right' }}>
															<RaisedButton
																label={ this.props.languageId === 0 ? 'Change' : 'Изменить' }
																onClick={ () => this.handleOpenEditCategory(item.id) }
																style={{ margin: '0px 10px' }}/>

															<RaisedButton
																label={ this.props.languageId === 0 ? 'Delete' : 'Удалить' }
																onClick={ () => this.handleOpenDeleteDialog(item.id) }
																style={{ margin: '0px 10px' }}/>															

														</Col>
														<Col style={{ margin: '15px 0px' }}>
															<Divider />
														</Col>													
													</Row>]

											))
										}
									</div>

								:

									<div>
										<h5>{ languageId === 0 ? 'The price conditions are absent' : 'Ценовые условия отсутствуют' }</h5>
									</div>
							}
						</Col>
					
					</Row>
					<Row>
						
						<Col>
							<RaisedButton
								disabled={ this.state.errorEmail || this.state.errorContactNumber }
								label={languageId === 0 ? 'Add pricing category' : 'Добавить ценовую категорию'}
								style={{ marginTop: 10 }} 
								onClick={ ::this.openConditionForm } />
						</Col>

					</Row>

					<Dialog
						autoScrollBodyContent
						title={ languageId === 0 ? 'Delete this condition ? ' : 'Удалить это условие ? ' }
						actions={[ 
									<FlatButton
											label={languageId === 0 ? 'Cancel' : 'Отменить'} 
											onClick={ () => this.setState(initialState) } />,
									<FlatButton
										label={languageId === 0 ? 'Delete' : 'Удалить'} 
										onClick={ ::this.deleteCategory  } />
						]}
						modal={true}
						open={this.state.openDeleteDialog}
					>
						<Row className='center' >
							{ languageId === 0 ? 'This action can not be returned' : 'Это действие нельзя будет вернуть' }
						</Row>
					</Dialog>

					<Dialog
						autoScrollBodyContent
						title={ this.state.itemEditing ? languageId === 0 ? 'Edit category' : 'Изменение категории' : languageId === 0 ? 'New pricing category' : 'Новая ценовая категория'} 
						actions={
									this.state.itemEditing ?
										
										<FlatButton
											label={languageId === 0 ? 'Change' : 'Изменить'} 
											onClick={ ::this.changeCategory } />
									:

										<FlatButton
											label={languageId === 0 ? 'Confirm' : 'Подтвердить'} 
											onClick={ ::this.createCategory } />
						}
						modal={false}
						open={this.state.open}
						onRequestClose={ () => this.setState(initialState) }
					>
							<Row>

								<Col xs={12}>
									<TextField
										fullWidth
										name='conditionName'	
										floatingLabelText={ languageId === 0 ? '1.Category name' : '1.Название категории' } 
										underlineFocusStyle={{borderColor: '#49c407'}}
										floatingLabelFocusStyle={{color: '#49c407'}}
										style={{ top: -10 }}
										value={ this.state.categoryName }
										onChange={ ::this.handleCategoryName } />
								</Col>

							</Row>
							<Row>

								<Col xs={6}>
									<p>{ languageId === 0 ? '2.Policy / conditions' : '2.Политика / Условия' }</p>
								</Col>

							</Row>
							<Row>

								<Col xs={6}>
									<SelectField value={ this.state.policy } onChange={ this.handlePolicy }>
										<MenuItem value={false} primaryText={languageId === 0 ? 'General' : 'Общие'} />
										<MenuItem value={true} primaryText={languageId === 0 ? 'Non refundable' : 'Не возмещается'} />
									</SelectField>	
								</Col>

							</Row>
							<Row>

								<Col xs={6}>
									<p>{ languageId === 0 ? '3.Meal plane' : '3.Питание' }</p>
								</Col>

								<Col xs={6}>
									<p>{ languageId === 0 ? '4.Treatment included' : '4.Лечение включено' }</p>
								</Col>

							</Row>								
							<Row>

								<Col xs={6}>
									<SelectField multiple value={ this.state.mealPlane } onChange={ this.handleMealPlane }>
										<MenuItem insetChildren value='breakfast' checked={this.state.mealPlane && this.state.mealPlane.indexOf('breakfast') > -1} primaryText={languageId === 0 ? 'Breakfast' : 'Завтрак'} />
										<MenuItem insetChildren value='dinner'checked={this.state.mealPlane && this.state.mealPlane.indexOf('dinner') > -1}  primaryText={languageId === 0 ? 'Dinner' : 'Обед'} />
										<MenuItem insetChildren value='supper'checked={this.state.mealPlane && this.state.mealPlane.indexOf('supper') > -1}  primaryText={languageId === 0 ? 'Supper' : 'Ужин'} />
									</SelectField>									
								</Col>

								<Col xs={6}>
									<SelectField value={ this.state.treatmIncl } onChange={ this.handleTreatmIncl }>
										<MenuItem insetChildren value={true} checked={ this.state.treatmIncl } primaryText={languageId === 0 ? 'Included' : 'Включено'} />
										<MenuItem insetChildren value={false} checked={ !this.state.treatmIncl }  primaryText={languageId === 0 ? 'Not included' : 'Не включено'} />
									</SelectField>									
								</Col>								



							</Row>							
							<Row>

								<Col xs={6}>
									<p>{ languageId === 0 ? '5.Apply to room category' : '5.Применить к категории номеров' }</p>
								</Col>

								<Col xs={6}>
									<p>{ languageId === 0 ? '6.Additonal pricing conditons' : '6.Дополнительные ценовые условия' }</p>
								</Col>

							</Row>							
							<Row>

								<Col xs={6}>
									{
										this.state.rooms.length ? 

											this.state.rooms.map( (item, index) => 
												<Checkbox 
													key={item.room_id} 
													data-key={item.room_id} 
													data-label={ item.sname } 
													label={  item.sname ? item.sname : languageId === 0 ? 'No name' : 'Без названия' } 
													defaultChecked={ _.find(this.state.selectedRooms , { id : item.room_id }) ? true : false }
													onCheck={ (e, checked) => this.handleRoomChange(e, checked)} />
											)

										:

											languageId === 0 ? 'You don`t have conditions' : 'У вас нету условий'
									}										
								</Col>								

								<Col xs={6}>
									{
										this.state.rooms.length ? 

											this.state.pricingConditionsList.map( (item, index) => 
												
												<Checkbox 
													key={item.id} 
													data-key={item.id} 
													data-label={ item.name } 
													data-label={ item.name } 
													label={ item.name.length ? item.name : languageId === 0 ? 'No name' : 'Без названия' }
													defaultChecked={ _.find(this.state.selectedConditions , { id : item.id }) ? true : false } 
													onCheck={ (e, checked) => this.handleConditionChange(e, checked)} />
											)

										:

											languageId === 0 ? 'You don`t have conditions' : 'У вас нету условий'
									}							
								</Col>

							</Row>
							<Row>
								<Col xs={6}>
									
									{
										this.state.treatmIncl 
										? [ <p>{ languageId === 0 ? '7.Daily procedures' : '7.Процедур в день' }</p>,
											<TextField
												fullWidth
												hintText={ languageId === 0 ? '1' : '1' } 
												underlineFocusStyle={{borderColor: '#49c407'}}
												style={{ top: -10 }}
												value={ this.state.dailyProcedures }
												onChange={ ::this.handleDailyProcedures } /> ]
										: 	''
									}
								</Col>
								<Col xs={6}>
									
									{
										this.state.treatmIncl 
										? [ <p>{ languageId === 0 ? '8.Doctor\'s examinations per day' : '8.Осмотров врача в день' }</p>,
											<TextField
												fullWidth
												hintText={ languageId === 0 ? '1' : '1' } 
												underlineFocusStyle={{borderColor: '#49c407'}}
												style={{ top: -10 }}
												value={ this.state.dailyDoctorVis }
												onChange={ ::this.handleDailyDoctorVis } /> ]
										: 	''
									}
								</Col>

								<Col xs={6}>
									
									{
										this.state.treatmIncl 
										? [ <p>{ languageId === 0 ? '9.Physiotherapy daily' : '9.Физиотерапий в день' }</p>,
											<TextField
												fullWidth
												hintText={ languageId === 0 ? '1' : '1' } 
												underlineFocusStyle={{borderColor: '#49c407'}}
												style={{ top: -10 }}
												value={ this.state.dailyPhysioter }
												onChange={ ::this.handleDailyPhysioter } /> ]
										: 	''
									}
								</Col>
							</Row>						

						</Dialog>

							
				</div>

		)
	}
}