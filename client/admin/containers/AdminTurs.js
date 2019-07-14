import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import _ from 'lodash'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'
import moment from 'moment'
import MuiGeoSuggest from 'material-ui-geosuggest'

import Delete from 'material-ui/svg-icons/navigation/cancel'
import AvatarFont from 'material-ui/svg-icons/content/font-download'

const regExpYouTube = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((?:\w|-){11})(?:&list=(\S+))?$/

const styles= {
      
  container: {
    position: 'relative',
    margin: '0 auto',
    paddingTop: 10,
    height: 200,
    width: 200,
    display: 'table-cell', 
    verticalAlign: 'middle',    
  },

  img: {
  	cursor: 'pointer',
    width: '100%',
  },

  deletBtnImg: {
  	position: 'absolute',
  	right: 5,
  	top: 0,
  },

  avatarBtnImg: {
  	position: 'absolute',
  	left: 5,
  	top: 0,
  },
}

const initialState = {	
	requestDone: true,
	creatingTur: false,
	openTur: false,
	turName: '',
	adressDepart:  '',
	adressDepartObj: {},
	adressArrival:  '',
	adressArrivalObj: {},
	planStay: '',
	includes: [],
	subjects: [],
	aboutEn: '',
	aboutRu: '',
	maxGuests: '',
	prices: [],
	currencyPrice: '',
	discount: '',
	photos: [],
	avatar: null,
	stars: null,
}

const cancelCreating = {
	requestDone: true,
	creatingTur: false,
	openTur: false,
}

const includes = require('../../../api/tursData').includes

const subjects = require('../../../api/tursData').subjects

export default class DoctorsArticles extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ turs: [] }, initialState)

		this.removePhoto = ::this.removePhoto;
		this.handlePrice = ::this.handlePrice;
		this.axiosGetTurs = ::this.axiosGetTurs;
		this.createTur = ::this.createTur;
		this.updateTur = ::this.updateTur;
		this.handleOpenBanner = ::this.handleOpenBanner;
		this.deleteTur = ::this.deleteTur;
	}

	componentWillMount(){
		this.axiosGetTurs()
	}

	removePhoto (value) {
		let photos = this.state.photos.filter(e => e !== value)
		this.setState({ photos })
	}

    handlePrice(index, value) {

        let prices = this.state.prices
            prices[index] = parseInt(value) || ''

        this.setState({ prices })
    }

    axiosGetTurs() {
		axios.get('/api/turs')
			 .then( response => {
			 	this.setState(initialState)
			 	this.setState({ turs: response.data.data }) 
			 })    	
    }

    createTur() {
		axios.post('/admin/turs/create', {
			name: this.state.turName,
			departure: this.state.adressDepart,
			departure_map: this.state.adressDepartObj,
			arrival: this.state.adressArrival,
			arrival_map: this.state.adressArrivalObj,
			days_plan: this.state.planStay,
			included: this.state.includes,
			subjects: this.state.subjects,
			about_en: this.state.aboutEn,
			about_ru: this.state.aboutRu,
			max_guests: this.state.maxGuests,
			price_values: this.state.prices,
			price_currency: this.state.currencyPrice,
			discount_percent: this.state.discount,
			photos: this.state.photos,
			avatar: this.state.avatar || this.state.photos && this.state.photos[0],
			stars: this.state.stars,	

		}).then( () => {
			this.axiosGetTurs()
			this.setState(initialState) 
		})
    }

    updateTur() {
		axios.post('/admin/turs/update', {
			id: this.state.showingTurId,
			name: this.state.turName,
			departure: this.state.adressDepart,
			departure_map: this.state.adressDepartObj,
			arrival: this.state.adressArrival,
			arrival_map: this.state.adressArrivalObj,
			days_plan: this.state.planStay,
			included: this.state.includes,
			subjects: this.state.subjects,
			about_en: this.state.aboutEn,
			about_ru: this.state.aboutRu,
			max_guests: this.state.maxGuests,
			price_values: this.state.prices,
			price_currency: this.state.currencyPrice,
			discount_percent: this.state.discount,
			photos: this.state.photos,
			avatar: this.state.avatar,			
			stars: this.state.stars,	

		}).then( () => {
			this.axiosGetTurs()
			this.setState(initialState) 
		})
    }

    handleOpenBanner(item) {
    	
    	this.setState({
    		openTur: true,
    		creatingTur: false,
    		showingTurId: item.id,
			turName: item.name,
			adressDepart: item.departure,
			adressDepartObj: item.departure_map,
			adressArrival: item.arrival,
			adressArrivalObj: item.arrival_map,
			planStay: item.days_plan,
			includes: item.included,
			subjects: item.subjects,
			aboutEn: item.about_en,
			aboutRu: item.about_ru,
			maxGuests: item.max_guests,
			prices: item.price_values,
			currencyPrice: item.price_currency,
			discount: item.discount_percent,
			photos: item.photos,
			avatar: item.avatar,
			stars: item.stars,	
    	})

    }

    deleteTur(){

		axios.post('/api/turs/delete', {
			id: this.state.showingTurId,
		}).then( () => {
			this.axiosGetTurs()
			this.setState(initialState) 
		})
    }

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)
		return(	
			<div>
				{
					!this.state.requestDone
				?	<div style={{ textAlign: 'center', marginTop: 30 }}>
						<CircularProgress
							color='#55c908'
							size={50}
							thickness={4} />
					</div>
				: 	<Row style={{ marginTop: 15 }}>
					{ 	!this.state.openTur
						?	<Col xs={6}>
								<ListItem
									primaryText={ languageId === 0 ? 'Add tur' : 'Новый тур' }
									onClick={ () => this.setState({ creatingTur: true, openTur: true }) } />
								<Divider />								
								<List width={300} style={{ marginTop: 5 }}>
								{
									this.state.turs.length
									? 	this.state.turs.map( item =>
											<ListItem 
												primaryText={ 
													<p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}> 
														{item.name}
													</p>
												} 
												onClick={ () => this.handleOpenBanner(item) } />
										)
									: <h4>{ languageId === 0 ? 'No turs' : 'Нету туров' }</h4>
								}
								</List>						
							</Col>
						: 	<Col xs={12}>
								<Row>
									<Col>
										<RaisedButton
											fullWidth
											label={ languageId === 0 ? 'Delete' : 'Удалить' }
											backgroundColor='#ef4f10'
											labelStyle={{ color: '#fff' }}
											onClick={this.deleteTur} />
									</Col>
								</Row>
								<Row>
									<Col>
										<h3>{ languageId === 0 ? 'General' : 'Общее' }</h3>
									</Col>
								</Row>
								<Row>
									<Col xs={6}>
										<TextField
											fullWidth
											floatingLabelText={ languageId === 0 ? 'Tur name' : 'Название тура' }
											value={ this.state.turName }
											onChange={ (e, value) => this.setState({ turName : value }) }/>
										
										<MuiGeoSuggest
											fullWidth
											name='depart'
											options={{
												types: ['(cities)']
											}}
											floatingLabelText={languageId === 0 ? 'Departure' : 'Отправление'}                       
											value={this.state.adressDepart}
											onChange={ (e,value) => this.setState({ adressDepart: value }) }
											onPlaceChange={ adressDepartObj => this.setState({ adressDepartObj, adressDepart: adressDepartObj.formatted_address }) } />	

										<MuiGeoSuggest 
											fullWidth
											name='arrival'
											options={{
												types: ['(cities)']
											}}
											floatingLabelText={languageId === 0 ? 'Arrival' : 'Прибытие'}                       
											value={this.state.adressArrival}
											onChange={ (e,value) => this.setState({ adressArrival: value }) }
											onPlaceChange={ adressArrivalObj => this.setState({ adressArrivalObj, adressArrival: adressArrivalObj.formatted_address }) } />									

									</Col>
									<Col xs={6}>
										<TextField
											fullWidth
											errorText={ this.state.errorPlanStay && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
											floatingLabelText={ languageId === 0 ? 'Plan of stay (days)' : 'План пребывания (дней)' }
											value={ this.state.planStay }
											onChange={ (e, value) => this.setState({ planStay : value, errorPlanStay: parseInt(value) < 0 }) }/>									

										<SelectField  
											fullWidth
											multiple
											floatingLabelText={ languageId === 0 ? 'Included' : 'Включено' }
											value={this.state.includes}
											onChange={ (event, index, values) => this.setState({ includes: values }) }
										>
											{ includes.map( item => 
												<MenuItem 
												insetChildren
												value={item.id} 
												primaryText={ item.label[languageId] } 
												checked={this.state.includes && this.state.includes.indexOf(item.id) > -1}/>
											)}

										</SelectField>

										<SelectField  
											fullWidth
											multiple
											floatingLabelText={ languageId === 0 ? 'Subjects' : 'Тематика' }
											value={this.state.subjects}
											onChange={ (event, index, values) => this.setState({ subjects: values }) }
										>
											{ subjects.map( item => 
												<MenuItem 
												insetChildren
												value={item.id} 
												primaryText={ item.label[languageId] } 
												checked={this.state.subjects && this.state.subjects.indexOf(item.id) > -1}/>
											)}

										</SelectField>
										
										<SelectField 
											floatingLabelText={languageId === 0 ? 'Stars' : 'Звезды'}
											value={ this.state.stars }
											onChange={ (e,i,value) => this.setState({ stars: value }) }
											floatingLabelStyle={{ left: 0 }} 
										>
											<MenuItem value={0} primaryText={languageId === 0 ? 'No category' : 'Без категории'} />
											<MenuItem value={1} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
											<MenuItem value={2} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
											<MenuItem value={3} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
											<MenuItem value={4} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
											<MenuItem value={5} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>} />
										</SelectField>	

                           			</Col>
									<Col>
										<TextField
											fullWidth
											multiLine
											rows={4}
											errorText={ this.state.errorAboutEn && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
											floatingLabelText={ languageId === 0 ? 'About En' : 'Описание En' }
											value={ this.state.aboutEn }
											onChange={ (e, aboutEn) => this.setState({ aboutEn, errorAboutEn: !Boolean(aboutEn) }) }/>
									</Col>
									<Col>
										<TextField
											fullWidth
											multiLine
											rows={4}
											errorText={ this.state.errorAboutRu && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
											floatingLabelText={ languageId === 0 ? 'About En' : 'Описание Ru' }
											value={ this.state.aboutRu }
											onChange={ (e, aboutRu) => this.setState({ aboutRu, errorAboutRu: !Boolean(aboutRu) }) }/>
									</Col>
								</Row>
								<Row>
									<Col>
										<h3>{ languageId === 0 ? 'Prices' : 'Цены' }</h3>
									</Col>
								</Row>
								<Row>
									<Col xs={6}>
										<TextField
											floatingLabelText={ languageId === 0 ? 'Maximum guests' : 'Максимум гостей' }
											errorText={ this.state.errorMaxGuests && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
											value={ this.state.maxGuests}
											onChange={ (e,value) => this.setState({ maxGuests: parseInt(value || 0), errorMaxGuests: Boolean( parseInt(value) > 30 ) }) }/>
									
										{ this.state.prices.map( (item,index) =>
											<TextField 
												floatingLabelText={ languageId === 0 ? `Price for ${index + 1}` : `Цена для ${index + 1}` }
												value={this.state.prices[index]}
												onChange={ (e, value) => this.handlePrice(index,value) }/>
										)}
									</Col>
									<Col xs={6}>
										<RaisedButton
											disabled={  this.state.errorMaxGuests || !this.state.maxGuests }
											label={ languageId === 0 ? 'Confirm' : 'Подтвердить' }
											style={{ marginTop: 25 }}
											onClick={ () => this.setState({ prices: _.fill(new Array(this.state.maxGuests), '' )}) } /><br/>

										<SelectField
											floatingLabelText={ languageId === 0 ? 'Currency' : 'Валюта' }
											value={this.state.currencyPrice}
											onChange={ (e,value) => this.setState({ currencyPrice: value }) } 
										>
											<MenuItem value={0} primaryText="USD" />
											<MenuItem value={1} primaryText="RUB" />
											<MenuItem value={2} primaryText="AZN" />
											<MenuItem value={3} primaryText="KZT" />
											<MenuItem value={4} primaryText="EUR" />
										</SelectField>
										
										<TextField
											floatingLabelText={ languageId === 0 ? 'Discount, %' : 'Скидка, %' }
											value={ this.state.discount }
											onChange={ (e, value) => this.setState({ discount : parseInt(value) }) }/>									
									</Col>

								</Row>
								<Row>
									<Col>
										<h3>{ languageId === 0 ? 'Photos' : 'Фото' }</h3>
									</Col>
								</Row>
								<Row style={{ marginBottom: 20 }}>
									<Col xs={6}>
										<TextField 
											hintText={ languageId === 0 ? 'Link to photo' : 'Ссылка на фото' }
											value={ this.state.newPhoto }
											onChange={ (e, newPhoto) => this.setState({ newPhoto }) } />
									</Col>
									<Col xs={6}>
										<RaisedButton
											disabled={!this.state.newPhoto} 
											label={ languageId === 0 ? 'Add photo' : 'Добавить фото' }
											onClick={ () => this.setState({ photos: _.concat(this.state.photos, this.state.newPhoto), newPhoto: '' }) }
											style={{ marginTop: 5 }}/>
									</Col>
								</Row>
								<Row>
									{ this.state.photos.map( (item, index) =>
										<Col xs={6} sm={4} md={3} xl={3}>
											<Card>
												<IconButton 
													tooltip={ this.state.avatar === item ? ( languageId === 0 ? 'It`s tour avatar' : 'Это аватар тура' ) : ( languageId === 0 ? 'Not tur avatar' : 'Не аватар тура' ) } 
													onClick={ () => this.setState({ avatar: item }) }
												>
													<AvatarFont color={ this.state.avatar === item ? '#1181b5' : '#9e0d0d' }  />
												</IconButton>											
												<IconButton tooltip='Delete photo' style={{ float: 'right' }} onClick={ () => this.removePhoto(item) }>
													<Delete color='#9e0d0d'  />
												</IconButton>
												<CardMedia>								
													<img src={item} style={styles.img} title={item}/>
												</CardMedia>
											</Card>
										</Col>
									)}
								</Row>
								<Row style={{ marginTop: 40 }}>
									<Col>
										{
											this.state.creatingTur
											?	<RaisedButton
													fullWidth 
													label={ languageId === 0 ? 'Create' : 'Создать' }
													backgroundColor='#55c901'
													labelStyle={{ color: '#fff' }}
													onClick={ this.createTur }/>
											:	<RaisedButton 
													fullWidth 
													label={ languageId === 0 ? 'Change' : 'Изменить' }
													backgroundColor='#55c901'
													labelStyle={{ color: '#fff' }}
													onClick={ this.updateTur }/>
										}
									</Col>
								</Row>
							</Col>
					}
					</Row>
				}
			</div>
		)
	}

}