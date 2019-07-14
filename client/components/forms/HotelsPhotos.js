import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import ReactDom from 'react-dom'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider'
import Dialog from 'material-ui/Dialog'
import Paper from 'material-ui/Paper'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import Delete from 'material-ui/svg-icons/navigation/close'
import Edit from 'material-ui/svg-icons/editor/border-color'
import AddPhoto from 'material-ui/svg-icons/image/photo-camera'

import axios from 'axios'

import _ from 'lodash'

const imgStyle = {
					width : 300,
}

const initialState = {
						deletingPhoto : false,
						deletingPhotoValue : null,
						changingPhoto : false,
						changingPhotoValue : null,
						uploadedImg: null,
						uploadedImgData : null,
						photoCategory : null,
						photoSubCategory : null,
						uploadedImage: null,
						imagePreview: null,
}

export default class HotelsPhotos extends Component {
  	constructor(props) {
		super(props);

		this.state = Object.assign( { images : [], hotelOwnRoomTypes:[] }, initialState )

		this.updateHotelPhotos = ::this.updateHotelPhotos;
		this.getAllPhotos = ::this.getAllPhotos;
		this.handleUploadPhoto = ::this.handleUploadPhoto;
		this.handleCancel = ::this.handleCancel;
		this.handleSaveUploadImage = ::this.handleSaveUploadImage;
		this.handleDeleteImage = ::this.handleDeleteImage;
		this.handleSaveChangedImage = ::this.handleSaveChangedImage;
		this.handleFailLoadImage = ::this.handleFailLoadImage;
		this.handleChangePhotoCategory = ::this.handleChangePhotoCategory;
		this.handleChangePhotoSubCategory = ::this.handleChangePhotoSubCategory;
		this.handleEditPhoto = ::this.handleEditPhoto;
		this.handleDeletePhoto = ::this.handleDeletePhoto;
		this.handleOtherCategory = ::this.handleOtherCategory;
	}


	componentWillMount() {	

		axios.get('/api/profile/hotel/photos',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => 
			this.setState ({ images : response.data.data  })
		)

		axios.get('/api/profile/hotel/rooms',
			{
				params : {
					users_id : this.props.data.users_id
				}
			}
		).then( response => {

			this.setState({ hotelOwnRoomTypes : response.data.data })
		})

	}

	updateHotelPhotos() {		
		this.setState(initialState)
		axios.get('/api/profile/hotel/photos',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {
			this.setState ({ images : response.data.data })
		})

	}

	getAllPhotos(){

		let images  = [] ,
			result = [] ,  
			stateImages = this.state.images,
			handleEditPhoto =  ::this.handleEditPhoto,
			handleDeleteImage = ::this.handleDeletePhoto

		console.log(stateImages)
		_.sortBy(stateImages, 'category' ).map( (item, index) => {
			if(_.isArray( images[item.ext_data.category] ) ) {  
				images[item.ext_data.category].push( { image : item.url , category: item.ext_data.category, subCategory : item.ext_data.sub_category  } )
			}else {
				images[item.ext_data.category] = []
				images[item.ext_data.category].push( { image : item.url , category: item.ext_data.category, subCategory : item.ext_data.sub_category  } )
			}
		})

		for (var imagecategory in images ) {
			result.push(
				<Row key={imagecategory } >
					<Col xs={12}>
						<h3>{ imagecategory !== 'null' ? imagecategory.charAt(0).toUpperCase() + imagecategory.substr(1) : this.props.languageId === 0 ?  'No category' : 'Без категории' }</h3>
						<Divider />
					</Col>
				</Row>
			)
			for (var value in images[imagecategory] ) {
			
				let image = images[imagecategory][value] 

				result.push(
					<Col key={ image.image } xs={3} style={{ margin : '10px'}}>
						<Card key={value.image} >
							<IconButton tooltip='Edit photo' onClick={ () => this.handleEditPhoto(image) } >
								<Edit color='#255409' />
							</IconButton>
							<IconButton tooltip='Delete photo' id={ image.image } style={{ float : 'right' }} onClick={ ::this.handleDeletePhoto } >
								<Delete color='#9e0d0d'  />
							</IconButton>
							<CardMedia
								 overlay=	{ image.subCategory && 
								 								<CardTitle 
								 									title={ image.subCategory }
								 									style={{ padding : '4px' }} 
								 									titleStyle={{ padding : '0px' , fontSize : '12px'  }} /> 
								 			}	
							>								
								<img src={ image.image } style ={imgStyle} alt={ image.image } onError={ ::this.handleFailLoadImage } />
							</CardMedia>
						</Card>
					</Col>
				)
			}

		}

		return result
	}


	handleUploadPhoto(e) {
		let reader = new FileReader();
		let file = e.target.files[0];

		if (!file) return;

		reader.onload = function(img) {
		  const data = new FormData();
		  let uploadedImage = img.target.result.replace(/^[^,]*,/,'')

		  this.setState({ uploadedImage, imagePreview: img.target.result })
		}.bind(this);

		reader.readAsDataURL(file);
	}
  

	handleCancel() {
		this.setState(initialState)
	}

	handleSaveUploadImage() {
      
		axios.post('https://api.imgur.com/3/image', {
		  image : this.state.uploadedImage,
		  type: 'base64'
		},{
		    headers: { 
		      Authorization: 'Client-ID 742e78dbe8f441f',
		      Accept: 'application/json'
		    }
		})
		.then( response => {

			axios.post('/api/profile/hotel/photos/upload-photo' , 
				{
					users_id : this.props.data.users_id,
					url : response.data.data.link,
					sname: this.props.data.sanatorium,
					extData: { category: this.state.photoCategory, sub_category: this.state.photoSubCategory }
				}
			).then( response =>  this.updateHotelPhotos() )
		})
    }


	handleDeleteImage() {
			axios.post('/api/profile/hotel/photos/delete-photo' , {
				users_id: this.props.data.users_id,
				url : this.state.deletingPhotoValue
			}).then( response =>  this.updateHotelPhotos() )
			
	} 


	handleSaveChangedImage() {

		if(this.state.uploadedImage){
		  
		  axios.post('https://api.imgur.com/3/image', {
		      image : this.state.uploadedImage,
		      type: 'base64'
		    },{
		        headers: { 
		          Authorization: 'Client-ID 742e78dbe8f441f',
		          Accept: 'application/json'
		        }
		  })
		  .then( response => {

				axios.post('/api/profile/hotel/photos/change-photo' , {
					existImage : this.state.changingPhotoValue,
					newImage : response.data.data.link,
					imageCategory : this.state.photoCategory,
					imageSubCategory : this.state.photoSubCategory

				}).then( response =>  this.updateHotelPhotos() )
		  })
		}else{

			axios.post('/api/profile/hotel/photos/change-photo' , {
					users_id: this.props.data.users_id,
					existImage : this.state.changingPhotoValue,
					newImage : this.state.changingPhotoValue,
					extData: { category: this.state.photoCategory, sub_category: this.state.photoSubCategory },
			}).then( response =>  this.updateHotelPhotos() )    
		}

	}
	

	handleFailLoadImage(event) {
		event.currentTarget.setAttribute('src', '/images/image-not-found.jpg'); 
	}

	handleChangePhotoCategory(event, index, value) {
		this.setState({ photoCategory : value });
	}

	handleChangePhotoSubCategory(event, index, photoSubCategory) {
		this.setState({ photoSubCategory });
	}

	handleEditPhoto(image) {
		this.setState({ 
			changingPhoto : true, 
			changingPhotoValue : image.image, 
			photoCategory : image.category, 
			photoSubCategory :  image.subCategory, 
		})
	}

	handleDeletePhoto(event) {
		this.setState({ deletingPhoto : true , deletingPhotoValue : event.currentTarget.id  })
	}

	handleOtherCategory(event) {
		this.setState({ photoSubCategory : event.currentTarget.value  })
	}

	render() {

        const languageId = this.props.languageId - 0;
		
		const actionsUpload = [
			<FlatButton
				label={ languageId === 0 ? 'Cancel' : 'Отменить' }
				onClick={ ::this.handleCancel } />,
			<FlatButton
				label={ languageId === 0 ? 'Add' : 'Добавить' }
				onClick={ ::this.handleSaveUploadImage } />
		];	

		const actionsDelete = [
			<FlatButton
				label={ languageId === 0 ? 'Cancel' : 'Отменить' }
				onClick={ ::this.handleCancel } />,
			<FlatButton
				label={ languageId === 0 ? 'Delete' : 'Удалить' }
				onClick={ ::this.handleDeleteImage } />
		];			

		const actionsChange = [
			<FlatButton
				label={ languageId === 0 ? 'Cancel' : 'Отменить' }
				onClick={ ::this.handleCancel } />,
			<FlatButton
				label={ languageId === 0 ? 'Update' : 'Обновить' }
				onClick={ ::this.handleSaveChangedImage } />
		];	

		console.log(this.state)

		return(
				<div>
					<Row>

						<Col  style={{ textAlign : 'center' }}>

							<h3>{ languageId === 0 ? 'Upload new photo by click ' : 'Добавьте новое фото нажатием' }</h3>
							<IconButton 
								containerElement='label' 
								style={{ width :'100px' , height : '100px' }} 
								iconStyle={{ width :'70px' , height : '70px'}}
								tooltip={<p>{ languageId === 0 ? 'Upload' : 'Загрузить' }</p>}
								tooltipStyles={{ top : '60px ' , left : '14px' , fontSize : '15px' }}>
								
								<input ref='in' type='file' accept='image/*' className='hidden' onChange={ ::this.handleUploadPhoto } />
								<AddPhoto />
							</IconButton>

								<Dialog
									title={ this.state.changingPhoto ?  (languageId === 0 ? 'Changing photo' : 'Изменение фото') : (languageId === 0 ? 'Uploading photo' : 'Загрузка фото' ) }
									actions={ this.state.changingPhoto ?  actionsChange : actionsUpload }
									modal={true}
									open={ Boolean( this.state.uploadedImage || this.state.changingPhoto ) }
								>
									<Row>
										
										<Col xs={6}>
										{ 
											this.state.changingPhoto ?

											<IconButton 
												containerElement='label' 
												style={{ width :'auto' , height : '200px' , minWidth: 'auto', maxWidth: '100%' }} 
												iconStyle={{ width :'auto' , height : '200px' , minWidth: 'auto', maxWidth: '100%' }}
												tooltip={<p>{ languageId === 0 ? 'Update photo' : 'Обновить фото' }</p>}
												tooltipStyles={{ top : '-2px ' , left : '20px' , fontSize : '22px' }}>
										
												<input type='file' accept='image/*' className='hidden' onChange={ ::this.handleUploadPhoto } />
												<img 
													src={ this.state.changingPhotoValue || this.state.imagePreview } 
													alt={this.state.changingPhotoValue}
													style={{
														width: 200,
														minHeight: 100 ,
														maxHeight: 200, 
														border : '1px solid black', 
														textAlign : 'center'  
													}} />

											</IconButton>

										:
											
											<img 
												src={ this.state.imagePreview } 
												style={{ 
													width: 200,
													minHeight: 100 ,
													maxHeight: 200, 
													border : '1px solid black', 
													textAlign : 'center' 
												}} />

										}
										</Col>

										<Col xs={6}>
											<SelectField
												floatingLabelText={ languageId === 0 ? 'Tag' : 'Тег' }
												value={this.state.photoCategory}
												onChange={ ::this.handleChangePhotoCategory}
											>
												<MenuItem value={'area'} primaryText={ languageId === 0 ? 'Area' : 'Територия' } />
												<MenuItem value={'room'} primaryText={ languageId === 0 ? 'Room' : 'Комната' } />
												<MenuItem value={'equipment'} primaryText={ languageId === 0 ? 'Equipment' : 'Оборудование' } />
												<MenuItem value={'producers'} primaryText={ languageId === 0 ? 'Procedures' : 'Процедуры' } />
												<MenuItem value={'swimming-pool'} primaryText={ languageId === 0 ? 'Swimming-pool' : 'Басейн' } />
												<MenuItem value={'parking-place'} primaryText={ languageId === 0 ? 'Parking place' : 'Парковка' } />
												<MenuItem value={'restaurant'} primaryText={ languageId === 0 ? 'Restaurant' : 'Ресторан' } />
												<MenuItem value={'other'} primaryText={ languageId === 0 ? 'Other' : 'Другое' } />
											</SelectField>

											{
												this.state.photoCategory === 'room' && 
											
												<SelectField
													floatingLabelText={ languageId === 0 ? 'Type of room' : 'Тип комнаты' }
													value={this.state.photoSubCategory}
													onChange={ ::this.handleChangePhotoSubCategory}
												>
													{
														this.state.hotelOwnRoomTypes.map( item =>
															<MenuItem value={item.sname} primaryText={languageId === 0 ? item.sname : item.sname_rus} />
														)
													}

												</SelectField>		

											||

												this.state.photoCategory === 'equipment' && 
											
												<SelectField
													floatingLabelText={ languageId === 0 ? 'Type of equipment' : 'Тип оборудования' }
													value={this.state.photoSubCategory}
													onChange={ ::this.handleChangePhotoSubCategory}
												>
													<MenuItem value={'Hydromassage bathtubs'} primaryText={ languageId === 0 ? 'Hydromassage bathtubs' : 'Ванны гидромасажа' } />
													<MenuItem value={'Thermal baths'} primaryText={ languageId === 0 ? 'Thermal baths' : 'Термальные ванны' } />
													<MenuItem value={'Baths for mud treatment'} primaryText={ languageId === 0 ? 'Baths for mud treatment' : 'Ванны для грязелечения' } />
													<MenuItem value={'Baths for hydrotherapy'} primaryText={ languageId === 0 ? 'Baths for hydrotherapy' : 'Ванны для гидротерапии' } />
													<MenuItem value={'Baths for underwater spinal traction'} primaryText={ languageId === 0 ? 'Baths for underwater spinal traction' : 'Ванны для подводного вытяжения позвоночника' } />
													<MenuItem value={'Baths dry carbonic'} primaryText={ languageId === 0 ? 'Baths dry carbonic' : 'Ванны сухие углекислые' } />
													<MenuItem value={'Apparatus for hydrocolonotherapy'} primaryText={ languageId === 0 ? 'Apparatus for hydrocolonotherapy' : 'Аппарат для гидроколонтерапии' } />
													<MenuItem value={'Ozone therapy apparatus'} primaryText={ languageId === 0 ? 'Ozone therapy apparatus' : 'Аппарат озон терапии' } />
													<MenuItem value={'Apparatus for fango therapy'} primaryText={ languageId === 0 ? 'Apparatus for fango therapy' : 'Аппарат для фанго-терапии' } />
													<MenuItem value={'Apparatus for mud treatment'} primaryText={ languageId === 0 ? 'Apparatus for mud treatment' : 'Аппарат для грязелечения' } />
													<MenuItem value={'Spa capsule'} primaryText={ languageId === 0 ? 'Spa capsule' : 'Спа капсула' } />
													<MenuItem value={'Massage cot'} primaryText={ languageId === 0 ? 'Massage cot' : 'Койка массажная' } />
													<MenuItem value={'Bunk for manual therapy'} primaryText={ languageId === 0 ? 'Bunk for manual therapy' : 'Койка для мануальной терапии' } />
													<MenuItem value={'Robotic system for supporting motor rehabilitation'} primaryText={ languageId === 0 ? 'Robotic system for supporting motor rehabilitation' : 'Роботическая система для опорнодвигательной реабилитации' } />
													<MenuItem value={'Apparatus for spine traction'} primaryText={ languageId === 0 ? 'Apparatus for spine traction' : 'Аппарат вытяжения позвоночника' } />
													<MenuItem value={'Apparatus for passive mechanotherapy'} primaryText={ languageId === 0 ? 'Apparatus for passive mechanotherapy' : 'Аппарат для пассивной механотерапии' } />
													<MenuItem value={'Apparatus for active mechanotherapy'} primaryText={ languageId === 0 ? 'Apparatus for active mechanotherapy' : 'Аппарат для активной механотерапии' } />
													<MenuItem value={'Stairs'} primaryText={ languageId === 0 ? 'Stairs' : 'Лестница' } />
													<MenuItem value={'Electrotherapy'} primaryText={ languageId === 0 ? 'Electrotherapy' : 'Электротерапия' } />
													<MenuItem value={'Vacuum Therapy'} primaryText={ languageId === 0 ? 'Vacuum Therapy' : 'Вакуум терапия' } />
													<MenuItem value={'Ultrasound therapy'} primaryText={ languageId === 0 ? 'Ultrasound therapy' : 'Ультразвуковая терапия' } />
													<MenuItem value={'Laser therapy'} primaryText={ languageId === 0 ? 'Laser therapy' : 'Лазер терапия' } />
													<MenuItem value={'Shockwave therapy'} primaryText={ languageId === 0 ? 'Shockwave therapy' : 'Ударноволновая терапия' } />
													<MenuItem value={'UHF therapy'} primaryText={ languageId === 0 ? 'UHF therapy' : 'УВЧ терапия' } />
													<MenuItem value={'Shortwave therapy'} primaryText={ languageId === 0 ? 'Shortwave therapy' : 'Коротковолновая терапия' } />
													<MenuItem value={'Darsonval'} primaryText={ languageId === 0 ? 'Darsonval' : 'Дарсонваль' } />
													<MenuItem value={'High Intensive Laser'} primaryText={ languageId === 0 ? 'High Intensive Laser' : 'Высоко Интенсивный Лазер' } />
													<MenuItem value={'Tekar therapy'} primaryText={ languageId === 0 ? 'Tekar therapy' : 'Текар терапия' } />
													<MenuItem value={'Paraffin bath'} primaryText={ languageId === 0 ? 'Paraffin bath' : 'Парафиновая баня' } />
													<MenuItem value={'Lymphatic drainage'} primaryText={ languageId === 0 ? 'Lymphatic drainage' : 'Лимфадренаж' } />
													<MenuItem value={'Magnetotherapy'} primaryText={ languageId === 0 ? 'Magnetotherapy' : 'Магнитотерапия' } />
													<MenuItem value={'Light'} primaryText={ languageId === 0 ? 'Light Therapy' : 'Световая Терапия' } />
													<MenuItem value={'Thermal therapy'} primaryText={ languageId === 0 ? 'Thermal therapy' : 'Тепловая терапия' } />
													<MenuItem value={'CO2 therapy'} primaryText={ languageId === 0 ? 'CO2 therapy' : 'CO2 терапия' } />
													<MenuItem value={'Cryotherapy'} primaryText={ languageId === 0 ? 'Cryotherapy' : 'Криотерапия' } />
													<MenuItem value={'Inhalation'} primaryText={ languageId === 0 ? 'Inhalation' : 'Ингаляция' } />

												</SelectField>		
											
											||
											
												this.state.photoCategory === 'producers' && 
											
												<SelectField
													floatingLabelText={ languageId === 0 ? 'Type of treatment' : 'Тип лечения' }
													value={this.state.photoSubCategory}
													onChange={ ::this.handleChangePhotoSubCategory}
												>
													<MenuItem value={'Hydromassage'} primaryText={ languageId === 0 ? 'Hydromassage' : 'Гидромасаж' } />
													<MenuItem value={'Thermal baths'} primaryText={ languageId === 0 ? 'Thermal baths' : 'Термальные ванны' } />
													<MenuItem value={'Hydrotherapy'} primaryText={ languageId === 0 ? 'Hydrotherapy' : 'Гидротерапия' } />
													<MenuItem value={'Thermal baths'} primaryText={ languageId === 0 ? 'Thermal baths' : 'Термальные ванны' } />
													<MenuItem value={'Underwater spinal traction'} primaryText={ languageId === 0 ? 'Underwater spinal traction' : 'Подводное вытяжение позвоночника' } />						
													<MenuItem value={'Baths dried carbonic'} primaryText={ languageId === 0 ? 'Baths dried carbonic' : 'Ванны сухие углекислые' } />
													<MenuItem value={'Bowel flushing'} primaryText={ languageId === 0 ? 'Bowel flushing' : 'Промывание кишечника' } />
													<MenuItem value={'Ozone Therapy'} primaryText={ languageId === 0 ? 'Ozone Therapy' : 'Озон терапия' } />
													<MenuItem value={'Fango-paraffin applications'} primaryText={ languageId === 0 ? 'Fango-paraffin applications' : 'Фанго-парафиновые аппликазии' } />
													<MenuItem value={'Mud treatment'} primaryText={ languageId === 0 ? 'Mud treatment' : 'Грязевое лечение' } />
													<MenuItem value={'Spa capsule'} primaryText={ languageId === 0 ? 'Spa capsule' : 'Спа капсула' } />
													<MenuItem value={'Classic Massage'} primaryText={ languageId === 0 ? 'Classic Massage' : 'Массаж классический' } />
													<MenuItem value={'Manual therapy'} primaryText={ languageId === 0 ? 'Manual therapy' : 'Мануальная терапия' } />
													<MenuItem value={'Robotic rehabilitation of the musculoskeletal system'} primaryText={ languageId === 0 ? 'Robotic rehabilitation of the musculoskeletal system' : 'Роботическая реабилитация опорно-двигательной системы' } />
													<MenuItem value={'Extension of the spine'} primaryText={ languageId === 0 ? 'Extension of the spine' : 'Вытяжениея позвоночника' } />
													<MenuItem value={'Passive mechanotherapy'} primaryText={ languageId === 0 ? 'Passive mechanotherapy' : 'Пассивная механотерапия' } />
													<MenuItem value={'Active mechanotherapy'} primaryText={ languageId === 0 ? 'Active mechanotherapy' : 'Активная механотерапия' } />
													<MenuItem value={'Electrotherapy'} primaryText={ languageId === 0 ? 'Electrotherapy' : 'Электротерапия' } />
													<MenuItem value={'Vacuum Therapy'} primaryText={ languageId === 0 ? 'Vacuum Therapy' : 'Вакуум терапия' } />
													<MenuItem value={'Ultrasound therapy'} primaryText={ languageId === 0 ? 'Ultrasound therapy' : 'Ультразвуковая терапия' } />
													<MenuItem value={'Laser therapy'} primaryText={ languageId === 0 ? 'Laser therapy' : 'Лазер терапия' } />
													<MenuItem value={'Shockwave therapy'} primaryText={ languageId === 0 ? 'Shockwave therapy' : 'Ударноволновая терапия' } />
													<MenuItem value={'UHF therapy'} primaryText={ languageId === 0 ? 'UHF therapy' : 'УВЧ терапия' } />
													<MenuItem value={'Shortwave therapy'} primaryText={ languageId === 0 ? 'Shortwave therapy' : 'Коротковолновая терапия' } />
													<MenuItem value={'Darsonval'} primaryText={ languageId === 0 ? 'Darsonval' : 'Дарсонваль' } />
													<MenuItem value={'High Intensive Laser Therapy'} primaryText={ languageId === 0 ? 'High Intensive Laser Therapy' : 'Высоко Интенсивный Лазер терапия' } />
													<MenuItem value={'Tekar therapy'} primaryText={ languageId === 0 ? 'Tekar therapy' : 'Текар терапия' } />
													<MenuItem value={'Paraffinotherapy'} primaryText={ languageId === 0 ? 'Paraffinotherapy' : 'Парафин терапия' } />
													<MenuItem value={'Lymphatic drainage'} primaryText={ languageId === 0 ? 'Lymphatic drainage' : 'Лимфадренаж' } />
													<MenuItem value={'Magnetotherapy'} primaryText={ languageId === 0 ? 'Magnetotherapy' : 'Магнитотерапия' } />
													<MenuItem value={'Light Therapy'} primaryText={ languageId === 0 ? 'Light Therapy' : 'Световая Терапия' } />
													<MenuItem value={'Thermal therapy'} primaryText={ languageId === 0 ? 'Thermal therapy' : 'Тепловая терапия' } />
													<MenuItem value={'CO2 therapy'} primaryText={ languageId === 0 ? 'CO2 therapy' : 'CO2 терапия' } />
													<MenuItem value={'Cryotherapy'} primaryText={ languageId === 0 ? 'Cryotherapy' : 'Криотерапия ' } />
													<MenuItem value={'Inhalation'} primaryText={ languageId === 0 ? 'Inhalation' : 'Ингаляция' } />
													<MenuItem value={'Acupuncture'} primaryText={ languageId === 0 ? 'Acupuncture' : 'Акупунктура' } />
													<MenuItem value={'Treatment with leeches'} primaryText={ languageId === 0 ? 'Treatment with leeches' : 'Лечение пиявками' } />
													<MenuItem value={'Reflexology'} primaryText={ languageId === 0 ? 'Reflexology' : 'Рефлексотерапия' } />
													<MenuItem value={'Aromatherapy'} primaryText={ languageId === 0 ? 'Aromatherapy' : 'Ароматерапия' } />
													<MenuItem value={'Exercise therapy'} primaryText={ languageId === 0 ? 'Exercise therapy' : 'ЛФК' } />
													
												</SelectField>	

											||
												this.state.photoCategory === 'other' &&	

													<TextField
														floatingLabelText={languageId === 0 ? 'Comment' : 'Комментарий'} 
														errorText={ this.state.errorWebsite && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
														underlineFocusStyle={{borderColor: '#49c407'}}
														floatingLabelFocusStyle={{color: '#49c407'}}
														onChange={ ::this.handleOtherCategory } />  
											}

										</Col>

									</Row>
								</Dialog>

							{
								this.state.deletingPhoto &&
									
								<Dialog
									title={ languageId === 0 ? 'Deleting photo' : 'Удаление фото' }
									actions={actionsDelete}
									modal={false}
									open={this.state.deletingPhoto }
								>
									{ languageId === 0 ? 'Are you sure you want to delete the photo?' : 'Вы действительно хотите удалить фотографию?' }
								</Dialog>

							}

										

						</Col>

					</Row>
					<Row>

						<Col xs={12} >
						{
							this.state.images.length !== 0 ? 

									::this.getAllPhotos() 

								:

									<Paper zDepth={1} className='paper'>
										{ languageId === 0 ? 'You don`t have any photos' : 'У вас нет фотографий' } 
									</Paper>

						}
						</Col>

					</Row>
				</div>
		)
	}
}