import React, { Component } from 'react'
import NumberFormat from 'react-number-format'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Badge from 'material-ui/Badge'
import IconButton from 'material-ui/IconButton'
import CheckCircle from 'material-ui/svg-icons/action/check-circle'
import _ from 'lodash'
import axios from 'axios'


const imgStyle =    {
						height : '200px',
						width : 'auto',
						minWidth: 'auto',
						maxWidth: '250px',
						padding: 10
					}


const initialState =   {
							attachPhotosOpen : false,
							changeRoomOpen : false,
							deleteRoomOpen : false,
							availableAttachPhoto : [],
							selectedPhotos : [],
							name : '',
							totalRooms : '',
							totalArea : '',
							maxAdults : '',
							numberBeds : '',
							countSameRooms: '',
						}


export default class HotelsRoomsDetails extends Component {


	constructor(props) {
		super(props);

		this.state = Object.assign({ rooms: [], images: [] },initialState)

		this.axiosGetRooms = ::this.axiosGetRooms;
		this.buildTableOfRooms = ::this.buildTableOfRooms;
		this.handleOpenChanging = ::this.handleOpenChanging;
		this.handleOpenDeleting = ::this.handleOpenDeleting;
		this.getAvailablePhotos = ::this.getAvailablePhotos;
		this.createRoom = ::this.createRoom;
		this.attachPhotos = ::this.attachPhotos;
		this.handleAttachPhotosOpen = ::this.handleAttachPhotosOpen;
		this.handleAttachSelectedPhotos = ::this.handleAttachSelectedPhotos;
		this.handleSelectImage = ::this.handleSelectImage;
		this.changeRoom = ::this.changeRoom;
		this.deleteRoom = ::this.deleteRoom;
		this.handleCancel = ::this.handleCancel;
		this.handleFailLoadImage = ::this.handleFailLoadImage;
		this.changeName = ::this.changeName;
		this.changeTotalRooms = ::this.changeTotalRooms;
		this.changeTotalArea = ::this.changeTotalArea;
		this.changeMaxAdults = ::this.changeMaxAdults;
		this.changeNumberBeds = ::this.changeNumberBeds;
		this.changeCountSameRooms = ::this.changeCountSameRooms;
		this.resetAddForm = ::this.resetAddForm;
	}


	componentWillMount() {
		
		this.axiosGetRooms()
		
		axios.get('/api/profile/hotel/photos',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => 
			this.setState ({ images : response.data.data  })
		)
	}


	axiosGetRooms() {
		axios.get('/api/profile/hotel/rooms',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			this.setState ({ rooms : response.data.data })
		})		
	}

	buildTableOfRooms() {
		let rooms = this.state.rooms,
			photos = [],
			results = []

		rooms.map( index => {
			results.push(
				<Paper zDepth={1} className='paper'>
					<Row style={{ padding : '10px' }}>

						<Col xs={3} >
							<strong> {this.props.languageId === 0 ? index.sname : index.sname_rus } </strong>
						</Col>

						<Col xs={3} >
							<strong> {index.total_rooms} </strong> { this.props.languageId === 0 ? ' rooms' : ' комнаты'}
						</Col>					

						<Col xs={2} >
							<strong> {index.max_adults} </strong> { this.props.languageId === 0 ? 'people' : 'чел.'}
						</Col>	

						<Col xs={2} >
							<strong> {index.total_area} </strong> { this.props.languageId === 0 ? '(sq. m.)' : '( кв. м. )'}
						</Col>							
						<Col xs={3} >
							<strong> {index.number_beds} </strong> { this.props.languageId === 0 ? 'beds' : 'кровати'}
						</Col>								
						<Col xs={3} >
							<strong> {index.rooms_in_hotel} </strong> { this.props.languageId === 0 ? 'same' : 'таких же'}
						</Col>					
					</Row>
					<Row>

						<Col xs={12} style={{ padding : '10px' }} >
							<Divider />
							<FlatButton
								label={ this.props.languageId === 0 ? 'Attach photos' : 'Прикрепить фото' }
								style={{ marginTop : '12px', fontSize : '13px' }}
								onClick={ () => this.handleAttachPhotosOpen(index.room_id) }/>
						</Col>

					</Row>						
					<Row>

						<Col xs={12} style={{ padding : '10px' }} >
							{ 
								index.assets_ids ? 

									index.assets_ids.map( image => 
										<img 
											src={ (_.find(this.state.images, { id: image}) ? _.find(this.state.images, { id: image}).url : 0 ) } 
											id={ image } 
											style={ imgStyle } 
											onError={ ::this.handleFailLoadImage } />
									)

								:

									<h4>{ this.props.languageId === 0 ? 'This number is not attached to photos' : 'За этим номером не закреплены фотографии' }</h4>
							}								
						</Col>

					</Row>					
					<Row>

						<Col xs={3} offset={{ xs : 6 }}>
							<RaisedButton
								label={ this.props.languageId === 0 ? 'Change' : 'Изменить' }
								style={{ marginTop : '24px' }}
								onClick={ () => this.handleOpenChanging(index.id, index.room_id) }/>
						</Col>

						<Col xs={3} >
							<RaisedButton
								label={ this.props.languageId === 0 ? 'Delete' : 'Удалить' }
								style={{ marginTop : '24px' }}
								onClick={ () => this.handleOpenDeleting(index.id, index.room_id) }/>
						</Col>
					</Row>
				</Paper>
			)
		})

		return results
	} 

	handleOpenChanging(id) {
		let itemChanging = _.find( this.state.rooms, { id } )

		this.setState({ 
			changeRoomOpen: true, 
			changingRoomId: id, 
			name : itemChanging.sname,
			totalRooms : itemChanging.total_rooms,
			totalArea : itemChanging.total_area,
			maxAdults : itemChanging.max_adults,
			numberBeds : itemChanging.number_beds,
			countSameRooms: itemChanging.rooms_in_hotel,
			errorName: false,
			errorTotalRooms: false,
			errorTotalArea: false,
			errorMaxAdults: false,
			errorNumberBeds: false,
			errorCountSameRooms: false,
		})
	}

	handleOpenDeleting(itemCatasId, roomId) {

		this.setState({ 
			deleteRoomOpen : true,
			deletingItemCatsRoomId : itemCatasId,
			deletetingRoomId: roomId
		})
	}

	getAvailablePhotos() {

			let data = this.state.availableAttachPhoto,
				photos = []


			data.map( index => {

				photos.push(
					<Col xs={12} sm={6} lg={4} xl={3} style={{ margin : 'auto', textAlign: 'center' }} >
						<Badge
							badgeContent={
								<IconButton
									className= { this.state.selectedPhotos.indexOf(index.id) ===  -1 ?  'hidden' : '' }
									style={{ width :'100px', height : '100px', top: '50px', right: '50px' }} 
									iconStyle={{ width :'70px', height : '70px' , color : '#49c407' }}
								>
									<CheckCircle />
								</IconButton>
							}
						>
							<img 
								src={ index.url } 
								id={ index.id } 
								style={ imgStyle } 
								onClick={ () => this.handleSelectImage(index.id) } 
								className= { this.state.selectedPhotos.indexOf(parseInt(index.id)) ===  -1 ?  '' : 'selected' }
								onError={ this.handleFailLoadImage } />
						</Badge>
					</Col>
				)
			})

			return photos.length ? photos : <h3> { this.props.languageId === 0 ? 'No foto available. You should upload them first' : 'Нет доступных фотографий. Вы должны сначала загрузить их' } </h3> 
	}


	createRoom() {

		let totalRoomsValid = parseInt(this.state.totalRooms) > 0,
			totalAreaValid = parseInt(this.state.totalArea) > 0,
			nameValid = this.state.name.length > 0,
			maxAdultsValid = parseInt(this.state.maxAdults) > 0 && parseInt(this.state.maxAdults) < 16,
			numberBedsValid = parseInt(this.state.numberBeds) > 0,
			countSameRoomsValid = parseInt(this.state.countSameRooms) > 0

		if( totalRoomsValid && totalAreaValid && nameValid && maxAdultsValid && numberBedsValid && countSameRoomsValid){
			
			axios.post('/api/profile/hotel/rooms/add-room',
				{
					users_id : this.props.data.users_id,
					sname : this.state.name,
					sname_rus : this.state.name,
					total_rooms : this.state.totalRooms,
					total_area : this.state.totalArea,
					max_adults : this.state.maxAdults,
					number_beds : this.state.numberBeds,
					count_same_rooms : this.state.countSameRooms,
				}
			).then( response => {
				this.axiosGetRooms()
				this.resetAddForm()
			})

		} else {

			this.setState({ errorName : !nameValid, errorTotalRooms : !totalRoomsValid, errorTotalArea : !totalAreaValid, errorMaxAdults : !maxAdultsValid , errorNumberBeds : !numberBedsValid, errorCountSameRooms: !countSameRoomsValid }) 
		}
	}


	attachPhotos() {

	}


	handleAttachPhotosOpen(id) {

		axios.get('/api/profile/hotel/photos',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {
			
			let room = _.find(this.state.rooms, { room_id: id})

			this.setState ({ 
					availableAttachPhoto : response.data.data,
					attachPhotosOpen : true,
					selectedPhotos: room ? room.assets_ids || [] : [],
					room_id : id
			})
		})

	}


	handleAttachSelectedPhotos() {

		axios.post('/api/profile/hotel/rooms/attach-photo',
			{
				items_id : this.state.room_id,
				assets_ids : this.state.selectedPhotos
			}
		).then( response => {
			this.setState( initialState )
			this.axiosGetRooms()

		})

	}


	handleSelectImage(id) {

		let selectedPhotos = this.state.selectedPhotos
		selectedPhotos.indexOf(id) ===  -1 ? selectedPhotos.push(id) : selectedPhotos.splice( selectedPhotos.indexOf(id) , 1 )

		this.setState({ selectedPhotos : selectedPhotos })
	}


	changeRoom() {
		axios.post('/api/profile/hotel/rooms/change-room',
			{
				users_id : this.props.data.users_id,
				changingRoomId : this.state.changingRoomId,
				sname : this.state.name,
				sname_rus : this.state.name,
				total_rooms : this.state.totalRooms,
				total_area : this.state.totalArea,
				max_adults : this.state.maxAdults,
				number_beds : this.state.numberBeds,
				count_same_rooms : this.state.countSameRooms,
			}
		).then( response => {
			this.setState( initialState )
			this.axiosGetRooms()
		})

	}


	deleteRoom() {

		axios.post('/api/profile/hotel/rooms/delete-room',
			{
				users_id : this.props.data.users_id,
				deletingItemCatsRoomId : this.state.deletingItemCatsRoomId ,
				deletetingRoomId: this.state.deletetingRoomId			
			}
		).then( response => {
			this.setState( initialState )
			this.axiosGetRooms()
			this.resetAddForm()

		})
	}


	handleCancel() {
		this.setState( initialState )
	}

	handleFailLoadImage(event) {
		event.currentTarget.setAttribute('src', '/images/image-not-found.jpg'); 
	}

	changeName(event, name) {
		this.setState({ name, errorName : !Boolean(event.target.value ) })
	}

	changeTotalRooms(event, totalRooms) {
		this.setState({ totalRooms, errorTotalRooms : !Boolean( parseInt(event.target.value) > 0 ) })
	}

	changeTotalArea(event, totalArea) {
		this.setState({ totalArea, errorTotalArea : !Boolean( parseInt(event.target.value) > 0 )  })
	}

	changeMaxAdults(event, maxAdults) {
		this.setState({ maxAdults, errorMaxAdults : !Boolean( parseInt(event.target.value) > 0 ) && Boolean( parseInt(event.target.value) < 16 )  })
	}

	changeNumberBeds(event, numberBeds) {
		this.setState({ numberBeds, errorNumberBeds : !Boolean( parseInt(event.target.value) > 0 )  })
	}

	changeCountSameRooms(event, countSameRooms) {
		this.setState({ countSameRooms, errorCountSameRooms : !Boolean( parseInt(event.target.value) > 0 )  })
	}

	resetAddForm() {
		this.setState( initialState )
	}

	render() {

		const languageId = this.props.languageId - 0;

		const actionsAttach = [
			<FlatButton
				label={ languageId === 0 ? 'Cancel' : 'Отмена' }
				onClick={ this.handleCancel } />,
			<FlatButton
				label={ languageId === 0 ? 'Attach selected' : 'Прикрепить выбранные' }
				onClick={ this.handleAttachSelectedPhotos } />
		]		

		const actionsDelete = [
			<FlatButton
				label={ languageId === 0 ? 'Cancel' : 'Отмена' }
				onClick={ this.handleCancel } />,
			<FlatButton
				label={ languageId === 0 ? 'Delete' : 'Удалить' }
				onClick={ this.deleteRoom } />
		]
		
		const actionsChange = [
			<FlatButton
				label={ languageId === 0 ? 'Cancel' : 'Отмена' }
				onClick={ this.handleCancel } />,
			<FlatButton
				label={ languageId === 0 ? 'Change' : 'Изменить' }
				onClick={ this.changeRoom } />
		]
		console.log(this.state)

		return(
				<div>
					<Dialog
						autoScrollBodyContent
						title={ languageId === 0 ? 'Select photos' : 'Выберите фото' }
						actions={actionsAttach}
						onRequestClose={ () => this.setState(initialState) }
						modal={false}
						open={this.state.attachPhotosOpen}
						contentStyle={{ width: '90%', maxWidth: 'none' }}
					>
						<Row className='center' >
							{ ::this.getAvailablePhotos() }
						</Row>
					</Dialog>
					<Dialog
						autoScrollBodyContent
						title={ languageId === 0 ? 'Delete this room ? ' : 'Удалить эту комнату ? ' }
						actions={actionsDelete}
						modal={true}
						open={this.state.deleteRoomOpen}
					>
						<Row className='center' >
							{ languageId === 0 ? 'This action can not be returned' : 'Это действие нельзя будет вернуть' }
						</Row>
					</Dialog>
					<Dialog
						autoScrollBodyContent
						title={ languageId === 0 ? 'Changing Room' : 'Изменение комнаты' }
						actions={actionsChange}
						modal={false}
						open={this.state.changeRoomOpen }
						contentStyle={{ width: '90%', maxWidth: 'none' }}
					>
						<Row className='center' >

							<Col xs={6}>
								<TextField
									floatingLabelText={languageId === 0 ? 'Name' : 'Название'}
									underlineFocusStyle={{borderColor: '#49c407'}}
									floatingLabelFocusStyle={{color: '#49c407'}}
									errorText = { this.state.errorName && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
									value = { this.state.name }
									onChange= { ::this.changeName } />
							</Col>						

							<Col xs={6}>
								<TextField
									floatingLabelText={languageId === 0 ? 'Number of rooms in room' : 'Количество комнат в номере'} 
									underlineFocusStyle={{borderColor: '#49c407'}}
									floatingLabelFocusStyle={{color: '#49c407'}}
									errorText = { this.state.errorTotalRooms && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
									value = { this.state.totalRooms }
									onChange = { ::this.changeTotalRooms } />
							</Col>

							<Col xs={6}>
								<TextField
									floatingLabelText={languageId === 0 ? 'Total area (sq. m.)' : 'Общая площадь ( кв. м. )'} 
									underlineFocusStyle={{borderColor: '#49c407'}}
									floatingLabelFocusStyle={{color: '#49c407'}}
									errorText = { this.state.errorTotalArea && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
									value = { this.state.totalArea }
									onChange = { ::this.changeTotalArea } />
							</Col>							

							<Col xs={6}>
								<TextField
									floatingLabelText={languageId === 0 ? 'Max people in room' : 'Максимум людей в комнате'} 
									underlineFocusStyle={{borderColor: '#49c407'}}
									floatingLabelFocusStyle={{color: '#49c407'}}
									errorText = { this.state.errorMaxAdults && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
									value = { this.state.maxAdults }
									onChange = { ::this.changeMaxAdults } />
							</Col>
						
							<Col xs={6}>
								<TextField
									floatingLabelText={languageId === 0 ? 'Number of beds' : 'Количество кроватей'} 
									underlineFocusStyle={{borderColor: '#49c407'}}
									floatingLabelFocusStyle={{color: '#49c407'}}
									errorText = { this.state.errorNumberBeds && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
									value = { this.state.numberBeds }
									onChange = { ::this.changeNumberBeds } />
							</Col>

							<Col xs={6}>
								<TextField
									floatingLabelText={languageId === 0 ? 'How many of the same rooms ? ' : 'Сколько таких же комнат ? '} 
									underlineFocusStyle={{borderColor: '#49c407'}}
									floatingLabelFocusStyle={{color: '#49c407'}}
									errorText = { this.state.errorCountSameRooms && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
									value = { this.state.countSameRooms }
									onChange = { ::this.changeCountSameRooms } />
							</Col>
						</Row>
					</Dialog>					

					<Row>
						
						<Col xs={4}>
							<TextField
								floatingLabelText={languageId === 0 ? 'Name (room type)' : 'Name (тип комнаты)'}
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								errorText = { this.state.errorName && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
								value = { this.state.name }
								onChange= { ::this.changeName } />
						</Col>						

						<Col xs={4}>
							<TextField
								floatingLabelText={languageId === 0 ? 'Number of rooms in room' : 'Количество комнат в номере'} 
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								errorText = { this.state.errorTotalRooms && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
								value = { this.state.totalRooms }
								onChange = { ::this.changeTotalRooms } />
						</Col>

						<Col xs={4}>
							<TextField
								floatingLabelText={languageId === 0 ? 'Total area (sq. m.)' : 'Общая площадь ( кв. м. )'} 
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								errorText = { this.state.errorTotalArea && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
								value = { this.state.totalArea }
								onChange = { ::this.changeTotalArea } />
						</Col>			

						<Col xs={4}>
							<TextField
								floatingLabelText={languageId === 0 ? 'Max people in room' : 'Максимум людей в комнате'} 
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								errorText = { this.state.errorMaxAdults && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
								value = { this.state.maxAdults }
								onChange = { ::this.changeMaxAdults } />
						</Col>

						<Col xs={4}>
							<TextField
								floatingLabelText={languageId === 0 ? 'Number of beds' : 'Количество кроватей'} 
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								errorText = { this.state.errorNumberBeds && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
								value = { this.state.numberBeds }
								onChange = { ::this.changeNumberBeds } />
						</Col>

					</Row>
					<Row>

						<Col xs={8}>
							<TextField
								floatingLabelText={languageId === 0 ? 'How many of the same rooms ? ' : 'Сколько таких же комнат ? '} 
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								errorText = { this.state.errorCountSameRooms && ( languageId === 0 ? 'Invalid data' : 'Неправильное значение' ) }
								name='countSameRooms'
								value = { this.state.countSameRooms }
								onChange = { ::this.changeCountSameRooms } />
						</Col>							
						<Col xs={4}>
							<RaisedButton
								label={languageId === 0 ? 'Add' : 'Добавить'}
								style={{ marginTop : '24px' }}
								onClick={ ::this.createRoom }/>
						</Col>

					</Row>
					
						{
							this.state.rooms.length ? 

								::this.buildTableOfRooms()

								:

								<Paper zDepth={1} className='paper'>
									{ languageId === 0 ? 'You don`t have any rooms' : 'У вас нет комнат' } 
								</Paper>
						}
				</div>

		)
	}
}