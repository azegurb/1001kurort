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
import _ from 'lodash'

import Edit from 'material-ui/svg-icons/editor/border-color'
import Delete from 'material-ui/svg-icons/navigation/close'


import axios from 'axios'


const initialState =	{
							openDeleteDialog: false,
							activePageAdding: 'nightsQuantity',
							itemEditing: null,
							itemDeleting: null,
							open: false,
							conditionName: '',
							discountValue: 0,
							raiseValue: 0,
							from: 0,
							to: 1,
							minFrom: 0,
							maxFrom: 60,
							minTo: 1,
							maxTo: 120,
							isDiscount: true,
						}


export default class HotelPricingCOndition extends Component {


	constructor(props) {
		super(props);

		this.state = Object.assign({ pricingConditionsList : [] },initialState )

		this.axiosGetPricingConditions = ::this.axiosGetPricingConditions;
		this.createCondition = ::this.createCondition;
		this.changeCondition = ::this.changeCondition;
		this.deleteCondition = ::this.deleteCondition;
		this.openConditionForm = ::this.openConditionForm;
		this.handlePageToNightsQuantity = ::this.handlePageToNightsQuantity;
		this.handlePageToBookingTime = ::this.handlePageToBookingTime;
		this.handleOpenDeleteDialog = ::this.handleOpenDeleteDialog;
		this.handleConditionName = ::this.handleConditionName;
		this.handleFrom = ::this.handleFrom;
		this.handleTo = ::this.handleTo;
		this.handleisDiscount = ::this.handleisDiscount;
		this.changeDiscountValue = ::this.changeDiscountValue;
		this.changeRaiseValue = ::this.changeRaiseValue;
		this.handleOpenEditCondition = ::this.handleOpenEditCondition;
	}


	componentWillMount() {

		this.axiosGetPricingConditions()
	}


	axiosGetPricingConditions() {
		axios.get('/api/profile/hotel/price-conditions',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {
			let result = []
			
			response.data.data.map( item => {

				result.push({
					id: item.condition_id,
					name: item.name,
					min_days: item.min_days,
					max_days: item.max_days,
					changingPrice: item.percent,
					isDiscount : item.is_discount,
					isByDayCount : item.is_by_days_count,
				})
			})
			this.setState({ pricingConditionsList : result })
		})
	}

	createCondition() {

		let pricingConditionsList = this.state.pricingConditionsList,
			conditionName = this.state.conditionName,
			conditionTimeRange = [ this.state.from, this.state.to ],
			isDiscount = this.state.isDiscount,
			changingPrice = this.state.isDiscount ? this.state.discountValue : this.state.raiseValue

		axios.post('/api/profile/hotel/price-conditions/add-info',
				{
					users_id : this.props.data.users_id,
					name : conditionName ,
					min_days : conditionTimeRange[0],
					max_days : conditionTimeRange[1],
					percent : changingPrice,
					is_discount : isDiscount,
					is_by_days_count: this.state.activePageAdding === 'nightsQuantity' ? true : false

				}
			).then( response => {

				this.setState(initialState)
				this.axiosGetPricingConditions()
			})



	}	


	changeCondition() {

		let pricingConditionsList = this.state.pricingConditionsList,
			conditionName = this.state.conditionName,
			conditionTimeRange = [ this.state.from, this.state.to ],
			isDiscount = this.state.isDiscount, 
			changingPrice = this.state.isDiscount ? this.state.discountValue : this.state.raiseValue
					
			axios.post('/api/profile/hotel/price-conditions/update',
							{
								name : conditionName ,
								min_days : conditionTimeRange[0],
								max_days : conditionTimeRange[1],
								percent : changingPrice,
								is_discount : isDiscount,
								users_id : this.props.data.users_id,
								condition_id : this.state.itemEditing,
								is_by_days_count: this.state.activePageAdding === 'nightsQuantity' ? true : false
							}
			).then( response => {
				
				this.setState(initialState)
				this.axiosGetPricingConditions()
			})

	}


	deleteCondition() {

		axios.post('/api/profile/hotel/price-conditions/delete',{
				users_id : this.props.data.users_id,
				condition_id : this.state.itemDeleting,						
		}).then( response => {
			this.setState(initialState)
			this.axiosGetPricingConditions()
		})
	}
	


	openConditionForm() {
		this.setState({ open : true })
	}
	
	handlePageToNightsQuantity() { 
		this.setState({ activePageAdding : 'nightsQuantity' })
	}

	handlePageToBookingTime() {
		this.setState({ activePageAdding : 'bookingTime' })
	}

	handleOpenDeleteDialog(id) {
		this.setState({ openDeleteDialog : true, itemDeleting: id })
	}
	
	handleConditionName(event, conditionName) {
		this.setState({ conditionName })
	}

	handleFrom(event, from) {
		this.setState({ from : ( from >= this.state.minFrom &&  from < this.state.to && from < this.state.maxFrom ? from : this.state.from ), value : ( from >= this.state.minFrom && from < this.state.to ? from : parseInt(this.state.to - 1) ) })	
	}
	
	handleTo(event, to) {
		this.setState({ to : ( to >= this.state.minTo && to < this.state.maxTo ? to : this.state.maxTo ), from : ( this.state.from >= to ? parseInt(to -1) : this.state.from ), value : ( to >= this.state.minTo && to < this.state.maxTo ? to : parseInt(this.state.maxTo) )  })	
	}

	handleisDiscount(event, isDiscount ) {
		this.setState({ isDiscount, raiseValue: 0, discountValue: 0 })	
	}

	changeDiscountValue(event, discountValue ) {
		this.setState({ discountValue : discountValue > 99 ? 99 : discountValue })
	}

	changeRaiseValue(event, raiseValue ) {
		this.setState({ raiseValue : raiseValue > 99 ? 99 : raiseValue })
	}

	handleOpenEditCondition(id) {

		let item = _.find( this.state.pricingConditionsList, (item) => { return item.id == id } )

		this.setState(
			{ 
				open : true , 
				itemEditing : id,
				conditionName: item.name,
				discountValue: item.isDiscount ? item.changingPrice : '' ,
				raiseValue: !item.isDiscount ? item.changingPrice : '' ,
				isDiscount: item.isDiscount,
				activePageAdding: item.isByDayCount ? 'nightsQuantity' : 'bookingTime',
				from: item.min_days,
				to: item.max_days,

			}
		)
	}


	render() {

		const languageId = this.props.languageId - 0;
	    	
		console.log(this.state )

		return(
				<div>

					<Row>
					
						<Col xs={12} className='center' style={{ margin : '10px' }}>
							{ 
								this.state.pricingConditionsList.length ? 
							
									<div style={{ marginTop: 20 }}>
										<Row>

											<Col xs={3}>
												<h4>{ languageId === 0 ? 'The name' : 'Название' }</h4>
											</Col>
											
											<Col xs={3}>
												<h4>{ languageId === 0 ? 'Condition' : 'Условие' }</h4>
											</Col>
											
											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Price relating change' : 'Изменение цены' }</h4>
											</Col>
											
											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Editing' : 'Изменение' }</h4>
											</Col>	

											<Col xs={2}>
												<h4>{ languageId === 0 ? 'Delete' : 'Удаление' }</h4>
											</Col>

										</Row>
										{
											this.state.pricingConditionsList.map( (item,index)  => (
												<Row key={index} style={{ lineHeight: '45px' }}>

													<Col xs={3}>
														{ item.name.length ? item.name : (languageId === 0 ? 'No name' : 'Без названия') }
													</Col>
													
													<Col xs={3}>
														<p className='first-letter-upper'>
															{ 
																`${ item.isDiscount ? (languageId === 0 ? 'discount ' : 'скидка' ) : ( languageId === 0 ? 'raise ' : 'повышение цены ' ) } 
																 ${ item.isByDayCount 
																 	? (languageId === 0 ? `IF NIGHTS >= ${item.min_days} AND <= ${item.max_days}` : `ЕСЛИ НОЧЕЙ >= ${item.min_days} И <= ${item.max_days}`)
																 	: (languageId === 0 ? `BEFORE ARRIVE days >= ${item.min_days} AND <= ${item.max_days}` : `ПЕРЕД ЗАЕЗДОМ >= ${item.min_days} И <= ${item.max_days}`) 
																}`
															}
															
														</p>
													</Col>
													
													<Col xs={2}>
														{ item.isDiscount  ? ' -' :  ' +' }{ item.changingPrice + ' %' }
													</Col>
													
													<Col xs={2}>
														<IconButton tooltip={languageId === 0 ? 'Edit' : 'Изменить'} onClick={ () => this.handleOpenEditCondition(item.id) } >
															<Edit />
														</IconButton>
													</Col>													

													<Col xs={2}>
														<IconButton tooltip={languageId === 0 ? 'Delete' : 'Удалить'} onClick={ () => this.handleOpenDeleteDialog(item.id) } >
															<Delete />
														</IconButton>
													</Col>

												</Row>
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
							<Divider />
							<RaisedButton
								disabled={ this.state.errorEmail || this.state.errorContactNumber }
								label={languageId === 0 ? 'Add condition' : 'Добавить условие'}
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
										onClick={ ::this.deleteCondition } />
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
						title={ this.state.itemEditing ? languageId === 0 ? 'Edit condition' : 'Изменение условия' : languageId === 0 ? 'New condition' : 'Новое условие'} 
						actions={
									this.state.itemEditing ?
										
										<FlatButton
											label={languageId === 0 ? 'Change' : 'Изменить'} 
											onClick={ ::this.changeCondition } />
									:

										<FlatButton
											label={languageId === 0 ? 'Confirm' : 'Подтвердить'} 
											onClick={ ::this.createCondition } />
						}
						modal={false}
						open={this.state.open}
						onRequestClose={ () => this.setState(initialState) }
					>
							<Row>
								<Col xs={6} style={{ paddingLeft : '0px', paddingRight : '0px' }}>
									<RaisedButton
										fullWidth
										backgroundColor={ this.state.activePageAdding === 'nightsQuantity' ? 'rgba(146, 220, 107, 0.3)' : ''  }
										label={languageId === 0 ? 'Nights quantity' : 'Количество ночей'}
										style={{ paddingLeft : '0px' , paddingRight: '0px' }} 
										onClick={ ::this.handlePageToNightsQuantity }/>
								</Col>
								<Col xs={6}>
									<RaisedButton
										fullWidth
										backgroundColor={ this.state.activePageAdding === 'bookingTime' ? 'rgba(146, 220, 107, 0.3)' : '' }
										label={languageId === 0 ? 'Booking time' : 'Время резервирования'}
										style={{ paddingLeft : '0px' , paddingRight: '0px' }} 
										onClick={ ::this.handlePageToBookingTime }/>
								</Col>
							</Row>
							<Row>
								<Col xs={12} style={{ marginTop : '10px' }}>
									<Divider />
									<TextField
										fullWidth
										name='conditionName'	
										floatingLabelText={ languageId === 0 ? 'Condition name' : 'Название условия' } 
										underlineFocusStyle={{borderColor: '#49c407'}}
										floatingLabelFocusStyle={{color: '#49c407'}}
										value={ this.state.conditionName }
										onChange={ ::this.handleConditionName } />
								</Col>
							</Row>
							<Row>
								
								<Col xs={5} style={{ top: '40px' }}>
										<div>
											<TextField
												floatingLabelText={ languageId === 0 ? 'Min' : 'Мин' } 
												underlineFocusStyle={{borderColor: '#49c407'}}
												floatingLabelFocusStyle={{color: '#49c407'}}
												value={ this.state.from}
												style={{ width: 40, float: 'left', top : -17, marginRight: 10 }} 
												onChange={ ::this.handleFrom }/>	
											<Slider 
												min={this.state.minFrom}
												max={60} 
												step={1}
												axis="x" 
												style={{ width: 150, float: 'left' }}
												sliderStyle={{ color: '#49c407', trackColor : '#49c407', selectionColor: '#49c407' }}
												value={ this.state.from }
												onChange={ ::this.handleFrom } />
    									</div>

    							</Col>
								<Col xs={5} offset={{ xs: 2 }} style={{ top: '40px' }}>    									
    									<div>
											<TextField
												floatingLabelText={ languageId === 0 ? 'Max' : 'Макс' } 
												underlineFocusStyle={{borderColor: '#49c407'}}
												floatingLabelFocusStyle={{color: '#49c407'}}
												value={ this.state.to}
												style={{ width : 40 , float: 'left', top : -17, marginRight: 10 }}
												onChange={ ::this.handleTo }/>											
											<Slider 
												min={1} 
												max={ this.state.maxTo } 
												step={1}												
												axis="x" 
												style={{width: 150, float: 'left' }} 
												value={ this.state.to }
												onChange={ ::this.handleTo }/>
    									</div>
										
								</Col>

							</Row>
							<Row style={{  height: 180 }}>

								<Col xs={6}>
									<RadioButtonGroup name='isDiscount' defaultSelected={this.state.isDiscount} onChange={ ::this.handleisDiscount }>
										<RadioButton
											value={true}
											label={languageId === 0 ? 'Discount' : 'Скидка'}
											iconStyle={{ fill: '#49c407' }}
											style={{ color: '#F44336', marginTop : 40 }} />
										<RadioButton
											value={false}
											label={languageId === 0 ? 'Raise' : 'Повышение'} 
											iconStyle={{ fill: '#49c407' }}
											style={{ color: '#F44336', paddingTop : 40 }} />
									</RadioButtonGroup>
								</Col>

								<Col xs={6} style={{ marginTop : 24 }}>
									<div className={ !this.state.isDiscount ? 'hidden' : '' } style={{ marginTop: 0, width: 'fit-content', position: 'relative' }}>
										<p style={{ position: 'absolute', right: 10, top: 12, color: '#5d5151', fontSize: 18 }}>%</p>
										<TextField
											name='discountValue'
											hintText={100}
											inputStyle={{ paddingRight: 35 }}
											underlineFocusStyle={{borderColor: '#49c407'}}
											floatingLabelFocusStyle={{color: '#49c407'}}
											value = { this.state.discountValue}	
											onChange={ ::this.changeDiscountValue } 
											style={{ width: 100 }} />
									</div>
									<div className={ this.state.isDiscount ? 'hidden' : '' } style={{ marginTop: 75, width: 'fit-content', position: 'relative' }}>
										<p style={{ position: 'absolute', right: 10, top: 12, color: '#5d5151', fontSize: 18 }}>%</p>
										<TextField
											name='raiseValue'	
											hintText={100}	
											inputStyle={{ paddingRight: 35 }}
											underlineFocusStyle={{borderColor: '#49c407'}}
											floatingLabelFocusStyle={{color: '#49c407'}} 
											value = { this.state.raiseValue }	
											onChange={ ::this.changeRaiseValue } 
											style={{ width: 100 }}/>
									</div>							
								</Col>

							</Row>
							<Row>

								<Col xs={12} style={{ paddingLeft : 0, paddingRight : 0 }}>
									<h3 style={{ marginLeft : 5 }}>{languageId === 0 ? 'Preview : ' : 'Предпросмотр'}</h3>
									
									{
										this.state.activePageAdding === 'nightsQuantity' ? 

											<pre>
												{
													languageId === 0 ? 

														`Condition name : ${ this.state.conditionName ? this.state.conditionName : 'No name' } \n` +
														`Booking nights : ${ this.state.from } - ${ this.state.to } n. \n` +  
														`Changing in price : ${ this.state.isDiscount ? ' -' + this.state.discountValue  : ' +' + this.state.raiseValue }%`

													:
														`Название условия : ${this.state.conditionName ? this.state.conditionName : 'Без названия' } \n` +
														`Количество ночей : ${ this.state.from } - ${ this.state.to } н. \n` +  
														`Изменения в цене : ${ this.state.isDiscount ? ' -' + this.state.discountValue  : ' +' + this.state.raiseValue }%` 
												}

											</pre>

										:

											<pre>
												{
													languageId === 0 ? 

														`Condition name : ${ this.state.conditionName ? this.state.conditionName : 'No name' } \n` +
														`Booking in advance (days): ${ this.state.from } - ${ this.state.to } d. \n` +  
														`Changing in price : ${ this.state.isDiscount ? ' -' + this.state.discountValue  : ' +' + this.state.raiseValue }%` 

													:
														`Название условия : ${ this.state.conditionName ? this.state.conditionName : 'Без названия' } \n` +
														`Резервация заранее (дни) : ${ this.state.from } - ${ this.state.to } д. \n` +  
														`Изменения в цене : ${ this.state.isDiscount ? ' -' + this.state.discountValue  : ' +' + this.state.raiseValue } %` 
												}

											</pre>
									
									}
									
								</Col>

							</Row>
					</Dialog>

							
				</div>

		)
	}
}