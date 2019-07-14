import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import FullscreenDialog from 'material-ui-fullscreen-dialog'
import TextField from 'material-ui/TextField'
import Popover from 'material-ui/Popover'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import _ from 'lodash'
import axios from 'axios'
				

const initialState =   {
					open: false,
					openAddService: false,
					listData: [],
					selectedList: [],
					selectedItemsCategory: 'noType',			
}


const customContentStyle = {
  position: 'absolute',
  top: '-64px',
  width: '100%',
  height: '100%',
  minHeight: '100%',
  maxWidth: 'none',
}



export default class HotelsRoomDetails extends Component {


	constructor(props) {
		super(props);

		this.state = initialState

		this.handleSaveChanges = ::this.handleSaveChanges;
		this.buildList = ::this.buildList;
		this.buildCheckboxList = ::this.buildCheckboxList;
		this.handleItemChange = ::this.handleItemChange;
		this.handlePaidItemDetails = ::this.handlePaidItemDetails;
		this.handleOpen = ::this.handleOpen;
		this.handleOpenCreateService = ::this.handleOpenCreateService;
		this.handleCloseOpenCreateService = ::this.handleCloseOpenCreateService;
		this.handleNameService = ::this.handleNameService;
		this.handleClose = ::this.handleClose;
		this.moveItemsToFree = ::this.moveItemsToFree;
		this.moveItemsToPaid = ::this.moveItemsToPaid;
		this.moveItemsToAbsent = ::this.moveItemsToAbsent;
	}


	componentWillMount() {
		
		axios.get('/api/hotels-facilities-names').then( responseNames =>{
			let dataNames = responseNames.data.data
			let data = []

			axios
				.get('/api/hotels-facilities-props', { 
					params: {
						id: this.props.data.users_id
					}
				})
				.then( responseProps => {
					
					dataNames.map( (item,index) => {
						let itemProps = _.find(responseProps.data.data, { facility_id: item.id })
				
						data.push({ 
							id: item.id, 
							label: [item.fname, item.fname_ru ], 
							free: itemProps ? itemProps.is_free : true , 
							available: itemProps ? itemProps.is_available : false ,
							ext_data: itemProps ? itemProps.ext_data || { data: '' } : { data: '' } 
						})
					})
					this.setState({ listData : _.orderBy(data, ['free', 'id'], ['desc', 'asc']) })				
				})
		})
		
	}
	

	handleSaveChanges() {

		axios
			.post('/api/profile/hotels-facilities/update',
				{
					id: this.props.data.users_id,
					listData : this.state.listData,
				}
			)
			.then( response => {
				console.log(response)
			})
	}

	buildList(listData , languageId ) {
		
		let freeList = [],
			paidList = [],
			absentList = [],
			result = []

		listData.map( (item, i) => {

			item.available ?

				(
					item.free ? 

						freeList.push(
						
							<Col xs={4}>
								<h5>{ item.label[languageId] }</h5>
							</Col>
						)
					:
						paidList.push(
							
							<Col xs={4}>
								<h5>{ item.label[languageId] }</h5>
							</Col>
						)
				)

			:

				absentList.push(

					<Col xs={4}>
						<h5>{ item.label[languageId] }</h5>
					</Col>
				)				
		})


		result.push(

					<Row>
						<Col>
							<h4>{ languageId === 0 ? 'Free' : 'Бесплатно' }</h4>
						</Col>
					</Row>
		)

		freeList.length ? 

			result.push( 
				
					<Row>
						<Col>
						 	{ freeList }
						</Col>
					</Row>
			)

		:

			result.push( 
				
					<Row>
						<Col>
						 	<h5 className='center'>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h5>
						</Col>
					</Row>
			)

		result.push(

					<Row>
						<Col>
							<h4>{ languageId === 0 ? 'Paid' : 'Платно' }</h4>
						</Col>
					</Row>
		)	

		paidList.length ? 

			result.push( 
				
					<Row>
						<Col>
						 	{ paidList }
						</Col>
					</Row>
			)

		:

			result.push( 
				
					<Row>
						<Col>
						 	<h5 className='center'>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h5>
						</Col>
					</Row>
			)

		
		result.push(

					<Row>
						<Col>
							<h4>{ languageId === 0 ? 'Absent' : 'Отсутствует' }</h4>
						</Col>
					</Row>
		)	

		absentList.length ? 

			result.push( 
				
					<Row>
						<Col>
						 	{ absentList }
						</Col>
					</Row>
			)

		:

			result.push( 
				
					<Row>
						<Col>
						 	<h5 className='center'>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h5>
						</Col>
					</Row>
			)

		return result			

	}		



	buildCheckboxList(listData , languageId ) {
		
		let freeList = [],
			paidList = [],
			absentList = [],
			result = []

		listData.map( (item, i) => {

			item.available ?

				(
					item.free  ? 

						freeList.push(
							<Col xs={4} style={ item.checked && { background: 'rgba(73, 196, 7, 0.11)' } }>
								<Checkbox 
									key={item.label[languageId]} 
									data-key={item.id} 
									label={ item.label[languageId] } 
									iconStyle={{fill: '#49c407'}} 
									style={{ margin : 15 }}
									checked={ item.checked ? true : false }
									onCheck={ (e, checked ) => this.handleItemChange(item.id, checked, listData) } />
							</Col>
						)  
					:
						paidList.push(
				
								<Col xs={6} style={ item.checked && { background: 'rgba(73, 196, 7, 0.11)' } }>
									<div style={{ float: 'left' }}>
										<Checkbox 
											key={item.label[languageId]}
											label={ item.label[languageId] }
											data-key={item.id}
											checked={ item.checked ? true : false }
											iconStyle={{fill: '#49c407'}}
											style={{ padding: '14px' }}
											onCheck={ (e, checked ) => this.handleItemChange(item.id, checked, listData) } />
									</div>
									<div style={{ float: 'right', marginRight: '10%' }}>
										<TextField 
											key={item.label[languageId]} 
											hintText={ languageId === 0 ? 'Details' : 'Детали' } 
											style={{ float: 'left'}} 
											onChange={ (event,value) => this.handlePaidItemDetails(item.id, value) }/>
									</div>
								</Col>

						)  
				)

			:

				absentList.push(
					<Col xs={4} style={ item.checked && { background: 'rgba(73, 196, 7, 0.11)' } }>
						<Checkbox 
							key={item.label[languageId]} 
							data-key={item.id} 
							label={ item.label[languageId] } 
							iconStyle={{fill: '#49c407'}} 
							style={{ margin : 15 }}
							checked={ item.checked ? true : false }
							onCheck={ (e, checked ) => this.handleItemChange(item.id, checked, listData) } />
					</Col>
				)
							
		})


		result.push(

					<Row style={{ marginBottom : 15 }}>
						<Col>
							<h4 className='center'>{ languageId === 0 ? 'Free' : 'Бесплатно' }</h4>
							<Divider />
						</Col>
					</Row>
		)

		freeList.length ? 

			result.push( 
				
					<Row>
						<Col>
						 	{ freeList }
						</Col>
					</Row>
			)

		:

			result.push( 
				
					<Row>
						<Col>
						 	<h5 className='center'>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h5>
						</Col>
					</Row>
			)

		result.push(

					<Row style={{ marginBottom : 15 }}>
						<Col>
							<h4 className='center'>{ languageId === 0 ? 'Paid' : 'Платно' }</h4>
							<Divider />
						</Col>
					</Row>
		)	

		paidList.length ? 

			result.push( 
				
					<Row>
						<Col>
						 	{ paidList }
						</Col>
					</Row>
			)

		:

			result.push( 
				
					<Row>
						<Col>
						 	<h5 className='center'>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h5>
						</Col>
					</Row>
			)
		
		result.push(

					<Row style={{ marginBottom : 15 }}>
						<Col>
							<h4 className='center'>{ languageId === 0 ? 'Absent' : 'Отсутствует' }</h4>
							<Divider />
						</Col>
					</Row>
		)	
		
		absentList.length ? 

			result.push( 
				
					<Row>
						<Col>
						 	{ absentList }
						</Col>
					</Row>
			)

		:

			result.push( 
				
					<Row>
						<Col>
						 	<h5 className='center'>{ languageId === 0 ? 'Empty list' : 'Список пуст' }</h5>
						</Col>
					</Row>
			)

		return result			

	}	





	handleItemChange( id, value, listData ) {

		let selectedValues = [],
			selectedItemsCategory = this.state.selectedItemsCategory,
			newData = [];

		listData.forEach( item => {
			if( item.id === id ){

				if(selectedItemsCategory === 'noType'){ 
					
					selectedItemsCategory = !item.available ? 'notAvailable' : ( item.free ? 'free' : 'paid')
				}
				item.checked = value
			}

			if(item.checked) {
				selectedValues.push(item.id);
			}
			newData.push(item);
		});

		
		selectedItemsCategory = selectedValues.length === 1 ? selectedItemsCategory : this.state.selectedItemsCategory


		this.setState({ listData: newData, selectedCountItems : selectedValues.length, selectedItemsCategory  });

	}



	handlePaidItemDetails( id, value ) {

		let newData = [];
		this.state.listData.forEach( item => {
			if( item.id === id ){
				item.ext_data = { data : value }
			}
			newData.push(item);
		});
		this.setState({ listData: newData });
	}


	createService() {

	let listData = this.state.listData,
		nameService = this.state.nameService,
		serviceFree = this.state.serviceFree


		if(_.find( listData, item => { return item.label[0] === nameService || item.label[1] === nameService  ? true : false }) ){

			this.setState({ addServiceError : true , errorAddServiceText : ['This service already exist','Этот сервис уже существует'] })
		} else {

			listData.push({ id : null, label : [ nameService, nameService], free: serviceFree  ? true : false, available: true, ext_data: {data: ''} })
			this.setState({ openAddService : false , listData : listData })
		}
 	}


	handleOpen() {
		this.setState({open: true})
	}

	handleOpenCreateService() {
		this.setState({ openAddService : true })
	}

	handleCloseOpenCreateService() {
		this.setState({ openAddService : false })
	}

	handleNameService(event, nameService) {
		this.setState({ nameService })
	}

	handleClose() {
		this.setState({ open: false , listData : _.forEach( this.state.listData, item  => { if(item.checked) item.checked = false } ), selectedCountItems : 0 })
	}
	

	moveItemsToFree() {
		this.setState({ listData : _.forEach( this.state.listData, item  => { if(item.checked){ item.checked = false; item.free = true; item.available = true } }), selectedCountItems : 0, selectedItemsCategory: 'noType' })
	}
	

	moveItemsToPaid() {
		this.setState({ listData : _.forEach( this.state.listData, item  => { if(item.checked){ item.checked = false; item.free = false; item.available = true } }), selectedCountItems : 0, selectedItemsCategory: 'noType' })
	}


	moveItemsToAbsent() {
		this.setState({ listData : _.forEach( this.state.listData, item  => { if(item.checked){ item.checked = false; item.available = false } }), selectedCountItems : 0, selectedItemsCategory: 'noType' })
	}


	render() {

		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(
				<div>

					<Row style={{ padding : '10px 15px' }}>
						<Col xs={6}>
							<RaisedButton 
								label={ languageId === 0 ? 'Change list' : 'Изменить список' }
								style={{ paddingLeft : '0px' , paddingRight: '0px', background: 'none'}} 								
								onClick={this.handleOpen} />
						</Col>
						<Col xs={6} style={{ textAlign: 'right' }}>
							<RaisedButton 
								label={ languageId === 0 ? 'Save changes' : 'Сохранить изменения' }
								style={{ paddingLeft : '0px' , paddingRight: '0px', background: 'none'}} 								
								onClick={this.handleSaveChanges} />
						</Col>
					</Row>
					
					{
							::this.buildList(this.state.listData , languageId)

					}

					<FullscreenDialog
						open={this.state.open}
						onRequestClose={ this.handleClose }
						title={

								!this.state.selectedCountItems  ? 

									languageId === 0 ? 'Select item' : 'Выберите меню'

								:
								
									<div>
										<p style={{ float: 'left', paddingLeft: '10%' }}> 
										{ 

										languageId === 0 ?

											`Selected : ${ this.state.selectedCountItems }` 
										: 
											`Выбрано : ${ this.state.selectedCountItems }`
										} 
										</p>
										{

											this.state.selectedItemsCategory ===  'free' &&

												<div>
													<FlatButton
														label={languageId === 0 ? 'To paid' : 'В платное' }
														style={{ marginLeft: 10  , boxShadow : 'none', backgroundColor: 'white'  }}
														onClick={ ::this.moveItemsToPaid } />

													<FlatButton
														label={languageId === 0 ? 'To absent' : 'В отсутсвующее' }
														style={{ marginLeft: 10 , boxShadow : 'none' , backgroundColor: 'white' }}
														onClick={ ::this.moveItemsToAbsent } />	
												</div>

											|| this.state.selectedItemsCategory === 'paid' &&

												<div>
													<FlatButton
														label={languageId === 0 ? 'To free' : 'В бесплатное' }
														style={{ marginLeft: 10 , boxShadow : 'none' , backgroundColor: 'white' }}
														onClick={ ::this.moveItemsToFree } />

													<FlatButton
														label={languageId === 0 ? 'To absent' : 'В отсутсвующее' }
														style={{ marginLeft: 10 , boxShadow : 'none' , backgroundColor: 'white' }}
														onClick={ ::this.moveItemsToAbsent } />	
												</div>	

											|| this.state.selectedItemsCategory === 'notAvailable' &&
												
												<div>
													<FlatButton
														label={languageId === 0 ? 'To free' : 'В бесплатное' }
														style={{ marginLeft: 10 , boxShadow : 'none' , backgroundColor: 'white' }}
														onClick={ ::this.moveItemsToFree } />

													<FlatButton
														label={languageId === 0 ? 'To paid' : 'В платное' }
														style={{ marginLeft: 10  , boxShadow : 'none', backgroundColor: 'white'  }}
														onClick={ ::this.moveItemsToPaid } />
												</div>	

											}
									</div>

						}
						actionButton={
							<FlatButton
								label={ languageId === 0 ? 'New service' : 'Новая услуга' }
								onClick={ this.handleOpenCreateService }/>
						}
						appBarStyle={{ backgroundColor : '#49c407' }}
						containerStyle={{ padding: 15 }}
					>

						<Popover
							open={this.state.openAddService}
							style={{ width: '100%', marginTop: 60}}
							onRequestClose={ this.handleCloseOpenCreateService }
						>
							<Row style={{ height: 86, marginLeft : 0, marginRight: 0  }}>
								
								<Col xs={4}>
									<TextField
										floatingLabelText={ languageId === 0 ? 'Name of service' : 'Название услуги' } 
										errorText= { this.state.addServiceError && this.state.errorAddServiceText[languageId] }
										style={{ marginLeft : 15 }}
										value = { this.state.nameService }	
										onChange={ (event, nameService) => this.setState({ nameService }) } />
								</Col>
								<Col xs={3}>
									<SelectField
										floatingLabelText={ languageId === 0 ? 'Category' : 'Категория' } 
										value={this.state.serviceFree}
										onChange={ (event, index, serviceFree) => this.setState({ serviceFree }) }
									>
										<MenuItem value={true} primaryText={ languageId === 0 ? 'Free' : 'Бесплатно' } />
										<MenuItem value={false} primaryText={ languageId === 0 ? 'Paid' : 'Платно' } />
									</SelectField>								
								</Col>								
								<Col xs={5} style={{ marginTop: 27 }}>

									

									<RaisedButton
										label={languageId === 0 ? 'Add' : 'Добавить' }
										style={{ float: 'right', marginRight: 30 }}
										onClick={ this.createService } />
									
									<RaisedButton
										label={languageId === 0 ? 'Cancel' : 'Отменить' }
										style={{ float: 'right', marginRight: 15 }}
										onClick={ this.handleCloseOpenCreateService } />
								</Col>
							</Row>
						</Popover>


						{
							::this.buildCheckboxList(this.state.listData , languageId)

						}

					</FullscreenDialog>

				</div>
		)
	}
}