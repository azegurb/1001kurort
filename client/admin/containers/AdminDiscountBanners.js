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

import BookingCalendar from '../../components/BookingCalendar'

const initialState = {
	creatingBanner: true,
	changingBanner: false,
	requestDone: true,
	tempUploadedName: '',
	newTitleEn: '',
	newTitleRus: '',
	newDescriptionEn: '',
	newDescriptionRus: '',
	newLinkTo: '',
	uploadedImage: '',
	startDate: moment(new Date()).format('YYYY-MM-DD'),
	endDate: moment( new Date(), 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD'),
}

var extractToken = function(hash) {
	var match = hash.match(/access_token=(\w+)/);
	return !!match && match[1];
};

export default class AdminDiscountBanners extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ banners: [] }, initialState)

		this.axiosGetBanners = ::this.axiosGetBanners;
		this.uploadImageToSite = ::this.uploadImageToSite;
		this.createBanner = ::this.createBanner;
		this.toChanging = ::this.toChanging;
		this.changeBanner = ::this.changeBanner;
		this.deleteBanner = ::this.deleteBanner;
		this.handleOpenBanner = ::this.handleOpenBanner;
		this.titleFontSize = ::this.titleFontSize;
		this.descriptionFontSize = ::this.descriptionFontSize;
	}

	componentWillMount(){
		this.axiosGetBanners()
	}

	axiosGetBanners() {
		axios
			.get('/api/banners')
			.then(response =>
				this.setState({ banners: response.data.data })
			)
	}

	uploadImageToSite(e) {
		let reader = new FileReader();
		let file = e.target.files[0];

		if (!file) return;

		reader.onload = function(img) {
			const data = new FormData();
			let uploadedImage = img.target.result.replace(/^[^,]*,/,'')

			this.setState({ uploadedImage, tempUploadedName: file.name })

		}.bind(this);
		reader.readAsDataURL(file);
	}

	createBanner() {
		this.setState({ requestDone: false })

		let validTitleEn = this.state.newTitleEn.length > 1,
			validTitleRus = this.state.newTitleRus.length > 1,
			validDescriptionEn = this.state.newDescriptionEn.length > 1,
			validDescriptionRus = this.state.newDescriptionRus.length > 1,
			validImage = this.state.uploadedImage.length ? true : false,
			validDates = this.state.startDate && this.state.endDate

		if( validTitleEn && validTitleRus && validDescriptionEn && validDescriptionRus && validImage && validDates){

			axios
				.post('https://api.imgur.com/3/image', {
					image : this.state.uploadedImage,
					type: 'base64'
				},{
						headers: { 
							Authorization: 'Client-ID 742e78dbe8f441f',
							Accept: 'application/json'
						}
				})
				.then( response => {

					axios
						.post('/api/banners/create',{
							title: this.state.newTitleEn,
							title_rus: this.state.newTitleRus,
							description: this.state.newDescriptionEn,
							description_rus: this.state.newDescriptionRus,
							image_url: response.data.data.link,
							href_to: this.state.newLinkTo || '',
							date_start: this.state.startDate,
							date_end: this.state.endDate,
						})
						.then( () => {
							this.axiosGetBanners()
							this.setState(Object.assign(initialState,{ requestDone: true }))
						})
				})

		}else{
			this.setState({ errorNewBanner: true, requestDone: true })
		}

		

	}

	toChanging() {
		this.setState( Object.assign(this.state.existBanner, { creatingBanner: false, changingBanner: true, requestDone: true }) )
	}

	changeBanner() {
		this.setState( Object.assign(this.state.existBanner, { creatingBanner: true, requestDone: false }) )
		
		if(this.state.uploadedImage){
			axios
				.post('https://api.imgur.com/3/image', {
					image : this.state.uploadedImage,
					type: 'base64'
				},{
						headers: { 
							Authorization: 'Client-ID 742e78dbe8f441f',
							Accept: 'application/json'
						}
				})
				.then( response => {

					axios
						.post('/api/banners/update',{
							id: this.state.id,
							title: this.state.newTitleEn,
							title_rus: this.state.newTitleRus,
							description: this.state.newDescriptionEn,
							description_rus: this.state.newDescriptionRus,
							image_url: response.data.data.link,
							href_to: this.state.newLinkTo || '',
							date_start: this.state.startDate,
							date_end: this.state.endDate,
						})
						.then( () => {
							this.setState(Object.assign(initialState,{ requestDone: true, showPreview: false, changingBanner: false, creatingBanner: true }))
							this.axiosGetBanners() 
						})
				})

		}else{
			axios
				.post('/api/banners/update', {
								id: this.state.id,
								title: this.state.newTitleEn,
								title_rus: this.state.newTitleRus,
								description: this.state.newDescriptionEn,
								description_rus: this.state.newDescriptionRus,
								image_url: this.state.image_url,
								href_to: this.state.newLinkTo || '',
								date_start: this.state.startDate,
								date_end: this.state.endDate,
				})
				.then( () => {
					this.setState(Object.assign(initialState,{ requestDone: true, showPreview: false, changingBanner: false, creatingBanner: true })) 
					this.axiosGetBanners() 
				})	
		}
	}


	deleteBanner(id) {
		this.setState({ requestDone: false }) 
		axios
			.post('/api/banners/delete', { id} )
			.then( () => {
				this.setState(Object.assign(initialState,{ requestDone: true })) 
				this.axiosGetBanners() 
			})		
	}

	handleOpenBanner(id) {
		let banner = _.find( this.state.banners, { id } )

		this.setState({ 
			existBanner: {
				id: banner.id,
				newTitleEn: banner.title, 
				newTitleRus: banner.title_rus, 
				newDescriptionEn: banner.description, 
				newDescriptionRus: banner.description_rus, 
				newLinkTo: banner.href_to, 
				image_url: banner.image_url, 
				startDate: banner.date_start, 
				endDate: banner.date_end,
			},
			showPreview: true,
			creatingBanner: false,
		})
	}

	titleFontSize(string) {
		const languageId = this.props.languageId - 0;
		let fontSize = 0,
			str = string.length

		if(str <= 10){
			fontSize = 25
		}else if( str > 10 && str <= 15){
			fontSize = 24
		}else if( str > 15 && str <= 20){
			fontSize = 22
		}else fontSize = 20

		return fontSize
	}

	descriptionFontSize(string) {
		const languageId = this.props.languageId - 0;
		let fontSize = 0,
			str = string.length

		if(str <= 15){
			fontSize = 18
		}else if( str > 15 && str <= 30){
			fontSize = 16
		}else if( str > 30 && str <= 60){
			fontSize = 14
		}else fontSize = 12
		
		return fontSize
	}


	render() {
		const languageId = this.props.languageId - 0;
		
		return(	
			<div>
				<Row>
					<Col xl={6} style={{ marginTop: 15 }}>
						
						<ListItem
							primaryText={ languageId === 0 ? 'Add banner' : 'Новый баннер' }
							onClick={ () => this.setState({ creatingBanner: true, showPreview: false, changingBanner: false }) } />
						<Divider />		

						<List width={300} style={{ marginTop: 5 }}>
						{
							this.state.banners.map( item =>
								<ListItem 
									primaryText={ 
										languageId === 0
										? `${item.title},   ${moment(item.date_start).format('YYYY.MM.DD')} - ${moment(item.date_end).format('YYYY.MM.DD')}` 
										: `${item.title_rus},   ${moment(item.date_start).format('YYYY.MM.DD')} - ${moment(item.date_end).format('YYYY.MM.DD')}` 
									} 
									onClick={ () => this.handleOpenBanner(item.id) } />
							)
						}
						</List>

					</Col>
					<Col xl={6}>
						{
							!this.state.requestDone
							?	<div style={{ textAlign: 'center', marginTop: 30 }}>
									<CircularProgress
										color='#55c908'
										size={50}
										thickness={4} />
								</div>
							: this.state.creatingBanner && !this.state.showPreview || this.state.changingBanner
							?	<div>
									<Row>
										<Col>
											<TextField
												fullWidth
												floatingLabelText={ languageId === 0 ? 'Title En' : 'Название En' }
												value={ this.state.newTitleEn }
												onChange={ (e, value) => this.setState({ newTitleEn : value }) }/>
										</Col>
										<Col>
											<TextField
												fullWidth
												floatingLabelText={ languageId === 0 ? 'Title Rus' : 'Название Rus' }
												value={ this.state.newTitleRus }
												onChange={ (e, value) => this.setState({ newTitleRus : value }) }/>
										</Col>
										<Col>
											<TextField
												fullWidth
												multiLine
												rows={4}
												floatingLabelText={ languageId === 0 ? 'Description En' : 'Описание En' }
												value={ this.state.newDescriptionEn }
												onChange={ (e, value) => this.setState({ newDescriptionEn : value }) }/>
										</Col>
										<Col>
											<TextField
												fullWidth
												multiLine
												rows={4}
												floatingLabelText={ languageId === 0 ? 'Description Rus' : 'Описание Rus' }
												value={ this.state.newDescriptionRus }
												onChange={ (e, value) => this.setState({ newDescriptionRus : value }) }/>
										</Col>
										<Col xs={6}>
											<label htmlFor='file' style={{ marginTop: 40 }}>{ 
												this.state.tempUploadedName
												? this.state.tempUploadedName
												: this.state.image_url
												? this.state.image_url
												: languageId === 0 ? 'Upload image' : 'Загрузить изображение' 
											}</label>
											<input
												required
												id='file' 
												type='file' 
												style={{ marginTop: 25, opacity: 0, position: 'absolute' }}
												onChange={ ::this.uploadImageToSite } 
												placeholder={ languageId === 0 ? 'Upload image' : 'Загрузить изображение' } />
										</Col>		
										<Col xs={6}>
											<TextField
												fullWidth 
												floatingLabelText={ languageId === 0 ? 'Link to (not required)' : 'Ссылка (не обязательно)' }
												value={ this.state.newLinkTo }
												onChange={ (e, value) => this.setState({ newLinkTo : value }) }/>
										</Col>
										<Col style={{ marginTop: 10 }}>
											<BookingCalendar 
												showNights={false} 
												languageId={languageId} 
												updateDates={ (startDate,endDate,nights) => this.setState({ 
													startDate: moment(startDate).format('YYYY-MM-DD'), 
													endDate : moment(endDate).format('YYYY-MM-DD'),
												}) }
												params={{ start_date: this.state.startDate, end_date: this.state.endDate }} />
										</Col>
										<Row>
											<Col xs={6}>
												{ this.state.errorNewBanner && <p style={{ color: 'red', paddingLeft: 15, paddingTop: 10 }}>{ languageId === 0 ? 'Check data' : 'Проверьте данные'}</p> }
											</Col>
											<Col xs={6} style={{ textAlign: 'right' }}>
												{ 
													this.state.creatingBanner
													?	<FlatButton 
															label={ languageId === 0 ? 'Create' : 'Создать'} 
															onClick={ this.createBanner } />
													: 	<FlatButton 
															label={ languageId === 0 ? 'Update' : 'Обновить'} 
															onClick={ this.changeBanner } />
												}
											</Col>
										</Row>			
									</Row>
								</div>
							: 	<div>
									<Row>
										<Col style={{ marginBottom: 15 }}>
											<div style={{ width: 600, maxWidth: '100%', marginTop: 15, position: 'relative' }}>
												<div style={{ position: 'absolute', width: 200, height: '100%', background: '#3f4040d1', color: '#fff', padding: 10 }}>
													<h3 style={{ fontSize: this.titleFontSize(languageId === 0 ? this.state.existBanner.newTitleEn : this.state.existBanner.newTitleRus) }}>
														{ languageId === 0 ? this.state.existBanner.newTitleEn : this.state.existBanner.newTitleRus }
													</h3>
													<p style={{ fontSize: this.descriptionFontSize(languageId === 0 ? this.state.existBanner.newDescriptionEn : this.state.existBanner.newDescriptionRus) }}>
														{ languageId === 0 ? this.state.existBanner.newDescriptionEn : this.state.existBanner.newDescriptionRus }
													</p>
													<div style={{ position: 'absolute', bottom: 20, width: '100%', left: 0, textAlign: 'center' }}>
														<RaisedButton 
															label={ languageId === 0 ? 'Go' : 'Перейти' } 
															labelColor='#000000' />
													</div>
												</div>
												<img 
													src={this.state.existBanner.image_url}
													style={{ width: 600, maxWidth: '100%' }} />
											</div>
										</Col>
										<Col xs={6}>
											<FlatButton 
												label={ languageId === 0 ? 'Change' : 'Изменить'} 
												onClick={ () => this.toChanging() } />										
										</Col>
										<Col xs={6}>
											<FlatButton 
												label={ languageId === 0 ? 'Delete' : 'Удалить'} 
												onClick={ () => this.deleteBanner(this.state.existBanner.id) } />										
										</Col>
									</Row>
								</div>
						}
					</Col>
				</Row>
			</div>
		)
	}

}