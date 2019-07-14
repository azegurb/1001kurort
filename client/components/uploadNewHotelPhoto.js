import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import ReactDom from 'react-dom'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Dialog from 'material-ui/Dialog'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import axios from 'axios'

import AddPhoto from 'material-ui/svg-icons/image/photo-camera'

const initialState = {
						img: null,
						imgData : null,
						photoCategory : null,
						photoSubCategory : null
					}


class FileUpload extends Component {

	handleFile(e) {
		let reader = new FileReader();
		let file = e.target.files[0];

		if (!file) return;

		reader.onload = function(img) {
			ReactDom.findDOMNode(this.refs.in).value = '';
			this.props.handleFileChange(img.target.result , file );
		}.bind(this);
		reader.readAsDataURL(file);
	}

  render() {
    return (
      <input ref='in' type='file' accept='image/*' id='addPhoto' style={{ display: 'none' }}  onChange={ ::this.handleFile } />
    )
  }
}

export default class HotelsPhotos extends Component {
  	constructor(props) {
		super(props);

		this.state = initialState
	}

	handleFileChange = (dataURI, imgData ) => {
		
		const data = new FormData();
		data.append('file', imgData)

		this.setState({ img: dataURI || '' , imgData : data }) 
	} 

	handleCancelUploadImage() {
		this.setState(initialState)
	}

	handleSaveUploadImage() {
		axios.post('/files', this.state.imgData).then((response) => {

			console.log(response)
			axios.post('/api/profile/hotel/photos/upload-photo' , {
				hotelEmail : this.props.data.email,
				image : response.data.data,
				imageCategory : this.state.photoCategory,
				imageSubCategory : this.state.photoSubCategory
			}).then(
				this.setState(initialState)
			)

		});
		
	} 
	
	handleChangePhotoCategory(event, index, photoCategory) {
		this.setState({ photoCategory : photoCategory });
	}

	handleChangePhotoSubCategory(event, index, value) {
		this.setState({ photoSubCategory : value });
	}

	render() {

        const languageId = this.props.languageId - 0;
		
		const actions = [
			<FlatButton
			label={ languageId === 0 ? 'Cancel' : 'Отменить' }
			primary={true}
			onClick={ this.handleCancelUploadImage } />,
			<FlatButton
			label={ languageId === 0 ? 'Add' : 'Добавить' }
			primary={true}
			onClick={ this.handleSaveUploadImage } />
		];	

		return(
					<Row>
						<Col xs={12} style={{ textAlign : 'center' }}>

							<h3>{ languageId === 0 ? 'Upload new photo by click ' : 'Добавьте новое фото нажатием' }</h3>
							<IconButton 
								containerElement='label' 
								style={{ width :'100px' , height : '100px' }} 
								iconStyle={{ width :'70px' , height : '70px'}}
								tooltip={<p>{ languageId === 0 ? 'Upload' : 'Загрузить' }</p>}
								tooltipStyles={{ top : '60px ' , left : '14px' , fontSize : '15px' }}>

								< AddPhoto />
								<FileUpload handleFileChange={ ::this.handleFileChange} />
							</IconButton>

							{
								this.state.img && 

								<Dialog
									title={ languageId === 0 ? 'Uploading photo' : 'Загрузка фото' }
									actions={actions}
									modal={true}
									open={ Boolean(this.state.img) }
								>
									<Row>
										
										<Col xs={6}>
											<img src={this.state.img} style={{width: '200px' , maxHeight: '200px' , border : '1px solid black' , textAlign : 'center'}}/>
										</Col>

										<Col xs={6}>
											<SelectField
												floatingLabelText={ languageId === 0 ? 'Tag' : 'Тег' }
												value={this.state.photoCategory}
												onChange={this.handleChangePhotoCategory}
											>
												<MenuItem value={'area'} primaryText={ languageId === 0 ? 'Area' : 'Територия' } />
												<MenuItem value={'room'} primaryText={ languageId === 0 ? 'Room' : 'Комната' } />
												<MenuItem value={'equipment'} primaryText={ languageId === 0 ? 'Equipment' : 'Оборудование' } />
												<MenuItem value={'producers'} primaryText={ languageId === 0 ? 'Procedures' : 'Процедуры' } />
												<MenuItem value={'swimming-pool'} primaryText={ languageId === 0 ? 'Swimming-pool' : 'Басейн' } />
												<MenuItem value={'parking-place'} primaryText={ languageId === 0 ? 'Parking place' : 'Парковка' } />
												<MenuItem value={'restaurant'} primaryText={ languageId === 0 ? 'Restaurant' : 'Ресторан' } />
											</SelectField>

											{
												this.state.photoCategory === 'room' && 
											
												<SelectField
													floatingLabelText={ languageId === 0 ? 'Type of room' : 'Тип комнаты' }
													value={this.state.photoSubCategory}
													onChange={this.handleChangePhotoSubCategory}
												>
													<MenuItem value={1} primaryText={ languageId === 0 ? 'супериор' : 'супериор' } />
													<MenuItem value={2} primaryText={ languageId === 0 ? 'стандард' : ' стандард' } />
													<MenuItem value={3} primaryText={ languageId === 0 ? 'делюкс' : 'делюкс' } />
													<MenuItem value={4} primaryText={ languageId === 0 ? 'президентские апартаменты' : 'президентские апартаменты' } />

												</SelectField>		
											}

											{
												this.state.photoCategory === 'equipment' && 
											
												<SelectField
													floatingLabelText={ languageId === 0 ? 'Type of equipment' : 'Тип оборудования' }
													value={this.state.photoSubCategory}
													onChange={this.handleChangePhotoSubCategory}
												>
													<MenuItem value={1} primaryText={ languageId === 0 ? 'Носки' : 'Носки' } />
													<MenuItem value={2} primaryText={ languageId === 0 ? 'ТВ' : 'ТВ' } />
													<MenuItem value={3} primaryText={ languageId === 0 ? 'Посудомойка' : 'Посудомойка' } />

												</SelectField>		
											}

											{
												this.state.photoCategory === 'treatment' && 
											
												<SelectField
													floatingLabelText={ languageId === 0 ? 'Type of treatment' : 'Тип лечения' }
													value={this.state.photoSubCategory}
													onChange={this.handleChangePhotoSubCategory}
												>
													<MenuItem value={1} primaryText={ languageId === 0 ? 'Простатит' : 'Простатит' } />
													<MenuItem value={2} primaryText={ languageId === 0 ? 'Кровь из носа' : 'Кровь из носа' } />
													<MenuItem value={3} primaryText={ languageId === 0 ? 'рак' : 'рак' } />

												</SelectField>		
											}

										</Col>

									</Row>
								</Dialog>
							}
						</Col>
					</Row>

		)
	}
}