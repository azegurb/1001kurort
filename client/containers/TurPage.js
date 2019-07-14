import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import { Link } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton';
import Stage from 'react-stage'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import axios from 'axios'
import _ from 'lodash'
import ImageGallery from 'react-image-gallery'
import moment from 'moment'
import {FacebookShareButton, FacebookIcon} from 'react-share';

import TurComments from '../components/TurComments'
import BookingTurCalendar from '../components/BookingTurCalendar'

const includes = require('../../api/tursData').includes
const subjects = require('../../api/tursData').subjects

const TurBlockStyle = {
	includes__item: {
		margin: 'auto',
		padding: 5,
		textAlign: 'center',
	},

	bold: {
		marginTop: 30,
		font: '900 12px "Lato"',
		textTransform: 'uppercase',
		color: '#474c44',
	},
}

const advantagesStyles = {
	container: {
		background: '#fff',
		display: 'block',
		marginTop: 20,
		padding: '15px 20px 30px',
		WebkitTapHighlightColor: 'rgba(0,0,0,0)',
	},

	ul: {
		paddingTop: 0,
		fontSize: 16,
	},

	li: {
		position: 'relative',
		marginBottom: 10,
	},

	img: {
		width: 20,
		position: 'absolute',
		left: -40,
		top: '50%',
		WebkitTransform: 'translateY(-50%)',
		msTransform: 'translateY(-50%)',
		OTransform: 'translateY(-50%)',
		transform: 'translateY(-50%)',
	},
}

const bookingStyles = {
	container: {
		textAlign: 'right',
		background: '#fff',
		display: 'block',
		marginTop: 20,
		padding: '15px 20px 30px',
		WebkitTapHighlightColor: 'rgba(0,0,0,0)',
	},

	info: {
		margin: 'auto',
		marginTop: 15,
	},

	values: {
		fontWeight: 900,
		color: '#55c901',
	}

}

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const initialState = {
	activeSubPage: 0,
	bookingData: {
		arrivalDate : new Date(),
		departureDate : moment( new Date(), 'YYYY-MM-DD').add(1, 'd').toDate(),
		adults: 2,
		childs: 0,
		babies: 0,
	},	
}

const settings = {
	autoplay: false,
	arrows: false,
	dots: false, 
	autoplaySpeed: 0,
	slidesToShow: 1,
	slidesToScroll: 1,
};


class TurPage extends Component { 
	  
    static fetchData({ store, params }) {
        return Promise.all([
            store.dispatch(actions.getTurPageData(params.id, store.getState().search.currencyRates)), 
            store.dispatch(actions.getTurComments(params.id)), 
        ])
    }

	constructor(props) {
		super(props);

		this.state = Object.assign({}, initialState)

		this.axiosAddComment = ::this.axiosAddComment;
		this.initialiseBookingData = ::this.initialiseBookingData;
		this.handleTurDates = ::this.handleTurDates;
		this.handleAdults = ::this.handleAdults;
		this.goBooking = ::this.goBooking;

	}

	componentWillMount(){
		const {turData} = this.props.asyncData;
		
		this.initialiseBookingData()		    
		this.props.pageActions.setNavigationPathNames([
			{ label: ['Turs', 'Туры'], link: '/turs' },
			{ label: [ turData.name || '', turData.name || '' ], link: `/turs/${this.props.match.params.id}` }
		])
        this.props.pageActions.updateIsLoadingPage(true);
	}

	componentDidMount(){
        Promise.all([
			this.props.async.getTurPageData(this.props.match.params.id, this.props.search.currencyRates),
			this.props.async.getTurComments(this.props.match.params.id)
        ]).then( () => {
            this.props.pageActions.updateIsLoadingPage(false)
        })
	}

	componentWillReceiveProps(nextProps){
	  const {turData} = nextProps.asyncData;

	  if(!_.isEqual(turData, this.props.asyncData.turData)){
		this.props.pageActions.setNavigationPathNames([
			{ label: ['Turs', 'Туры'], link: '/turs' },
			{ label: [ turData.name || '', turData.name || '' ], link: `/turs/${this.props.match.params.id}` }
		])
	  }
	}

    axiosAddComment(overal_rat, treatm_rat, pluses, minuses) {

    	axios.post('/api/turs/comments/add',{
    		tur_id: parseInt(this.props.match.params.tursId),
    		users_id: this.props.profile.user.users_id,
    		overal_rat,
    		treatm_rat,
    		pluses,
    		minuses,
    	}).then( () => this.axiosGetTurComments() )
    }

    initialiseBookingData() {
    	let bookingData = this.props.location.state

    	if(bookingData) this.setState({ bookingData })
    }

    handleTurDates(arrivalDate, departureDate) {
    	let bookingData = this.state.bookingData

    	bookingData.arrivalDate = arrivalDate
    	bookingData.departureDate = departureDate

    	this.setState({ bookingData })
	}

	handleAdults(e, i, value) {

		let bookingData = this.state.bookingData

		bookingData.adults = value

		this.setState({ bookingData })
	}

	goBooking() {
		const { turData } = this.props.asyncData;

		const data = {
			tur_id: parseInt(this.props.match.params.id), 
			hotels_id: null,
			start_date: this.state.bookingData.arrivalDate,
			end_date: moment(this.state.bookingData.arrivalDate).add(turData.days_plan, 'day').toDate(),
			nights: parseInt(turData.days_plan),
			room_number: 0,
			adults: parseInt(this.state.bookingData.adults),
			childs: parseInt(this.state.bookingData.children),
			babies: parseInt(this.state.bookingData.babies),
			childs_ages: [],
			shareRoom: false,
			totalPrice : {
				default_price: turData.price_values[this.state.bookingData.adults-1],
				price_with_discount: turData.price_values[this.state.bookingData.adults-1],
			},
			rooms : [],
		}

		this.props.pageActions.setBookedData(data)		

		this.props.history.push('/booking')
	}

	render() {
		const languageId = this.props.profile.languageId - 0;
		const currencyId = this.props.profile.currencyId - 0;
		const {turData, turReviews, turCommentStats} = this.props.asyncData;
        const url = `http://1001kurort.com${this.props.location.pathname}`
		console.log(turData)

		return(	
			!_.isEmpty(turData) &&
			<div style={{ marginTop: 20 }}>
				<Row>
					<Col xs={12} md={8} xl={8} style={advantagesStyles.container}>
						<ImageGallery
							useBrowserFullscreen={false}
							showPlayButton={false}
							showThumbnails={false}
							items={turData.photos}
							slideInterval={2000}/>

						<Row>
							<Col xs={6}>
								<h4 style={TurBlockStyle.bold}>{ languageId === 0 ? 'Included' : 'Включено' }</h4>
								<Stage {...settings}>
									{ turData.included.map( (includedItem, index) =>
											<div key={index} style={TurBlockStyle.includes__item}>
												{ includedItem.src != 'undefined'
													?	<img src={includedItem.img} />
													: 	''
												}
												<p style={{ marginBottom: 0 }}>{includedItem.src != 'undefined' ? includedItem.label[languageId] : ''}</p>
											</div>
									)}
								</Stage>								
							</Col>
							<Col xs={6}>
								<h4 style={TurBlockStyle.bold}>{ languageId === 0 ? 'Theme of the tour' : 'Тематика тура' }</h4>
								<Stage {...settings}>
									{ turData.subjects.map( (includedItem, index) =>
											<div key={index} style={TurBlockStyle.includes__item}>
												{ includedItem.src != 'undefined'
													?	<img src={includedItem.img} />
													: 	''
												}
												<p style={{ marginBottom: 0 }}>{includedItem.src != 'undefined' ? includedItem.label[languageId] : ''}</p>
											</div>
									)}
								</Stage>							
							</Col>
						</Row>
						<Hidden xs sm>
							<Row style={{ marginTop: 20, marginBottom: 20 }}>
								<Col xs={12} md={4} xl={4}>
									<RaisedButton 
										fullWidth
										label={ languageId === 0 ? 'About' : 'Описание'}
										backgroundColor={ this.state.activeSubPage === 0 ? '#337ab7' : '#fff' }
										labelStyle={{ color: this.state.activeSubPage === 0 ? '#fff' : '#337ab7' }}
										onClick={ () => this.setState({ activeSubPage: 0 }) }/>
								</Col>
								<Col xs={4}>
									<RaisedButton 
										fullWidth
										label={ languageId === 0 ? 'Program' : 'Программа'}
										backgroundColor={ this.state.activeSubPage === 1 ? '#337ab7' : '#fff' }
										labelStyle={{ color: this.state.activeSubPage === 1 ? '#fff' : '#337ab7' }}
										onClick={ () => this.setState({ activeSubPage: 1 }) }/>
								</Col>
								<Col xs={4}>
									<RaisedButton 
										fullWidth
										label={ languageId === 0 ? 'Reviews' : 'Отзывы'}
										backgroundColor={ this.state.activeSubPage === 2 ? '#337ab7' : '#fff' }
										labelStyle={{ color: this.state.activeSubPage === 2 ? '#fff' : '#337ab7' }}
										onClick={ () => this.setState({ activeSubPage: 2 }) }/>
								</Col>
							</Row>
						</Hidden>
						<Row>
							{ 	this.state.activeSubPage === 0 &&
									<Col>
										<p style={{ fontSize: 18 }}>{ languageId === 0 ? turData.about_en : turData.about_ru }</p>
										<Divider />
										<Row>
											<Col xs={6}>
												<h4 style={TurBlockStyle.bold}>{ languageId === 0 ? 'Included' : 'Включено' }</h4>
												<ul>
													{ turData.included.map( item =>
														<li>																			
															<i className="fa fa-check" aria-hidden="true" style={{ color: '#55c907', paddingRight: 15 }}></i>
															{item.label[languageId]}
														</li>
													)}
												</ul>
											</Col>
											<Col xs={6}>
												<h4 style={TurBlockStyle.bold}>{ languageId === 0 ? 'Not included' : 'Не включено' }</h4>
												<ul>
													{ turData.notIncluded.map( item =>
														<li>{item.label[languageId]}</li>
													)}
												</ul>
											</Col>
											<Col>
												<Divider />
											</Col>
										</Row>
										<Row>
											<Col xs={6}>
												<h4 style={TurBlockStyle.bold}>{ languageId === 0 ? 'PAYMENT POLICY' : 'ПОЛИТИКА ОПЛАТЫ' }</h4>
												<p>{ languageId === 0 ? 'Prepay card' : 'Предоплата картой' }</p>
												<p>{ languageId === 0 ? 'Payment upon arrival on the first day of arrival' : 'Оплата при поселении в первый день прибытия' }</p>
											</Col>
											<Col xs={6}>
												<h4 style={TurBlockStyle.bold}>{ languageId === 0 ? 'CANCELLATION POLICY' : 'ПОЛИТИКА ОТМЕНЫ' }</h4>
												<p>{ languageId === 0 ? 'Prepay card' : 'Предоплата картой' }</p>

											</Col>
											<Col>
												<Divider />
											</Col>
										</Row>
										<Row>
											<Col>
												<h4 style={TurBlockStyle.bold}>{ languageId === 0 ? 'TERMS & CONDITIONS' : 'ПРАВИЛА И УСЛОВИЯ' }</h4>
												<p>{ languageId === 0 ? 'Cancellation 3 days before arrival' : 'Отмена брони за 3 дня до прибытия' }</p>
											</Col>
										</Row>
									</Col> 
							 	|| this.state.activeSubPage === 1 &&
									<Col>

									</Col> 	
							 	|| this.state.activeSubPage === 2 &&
									<TurComments 
										languageId={languageId}
										reviews={turReviews}
										commentStats={turCommentStats}
										user={this.props.profile.user}
										axiosAddComment={ (overal_rat, treatm_rat, pluses, minuses) => this.axiosAddComment(overal_rat, treatm_rat, pluses, minuses) } /> 
							}
						</Row>
					</Col>
					<Col xs={12} sm={12} md={4}xl={4}>

						<div style={advantagesStyles.container}>
							<Row>
								<Col>
									<h4>{ languageId === 0 ? 'Period of travel' : 'Период поездки' }</h4>
								</Col>
							</Row>
							<Row>
								<Col>
									<BookingTurCalendar
										languageId={languageId}
										arrival={this.state.bookingData.arrivalDate}
										departure={ moment(this.state.bookingData.arrivalDate).add(this.state.days_plan, 'day').toDate() }
										days={this.state.days_plan}
										onChange={ this.handleTurDates } />

									<Row>
										<Col xs={6}>
											<SelectField
												fullWidth
												floatingLabelText={ languageId === 0 ? 'Adults' : 'Взрослых' }
												errorText={ this.state.errorAdults && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
												value={ this.state.bookingData.adults }
												onChange={ this.handleAdults }
											>
												{ turData.max_guests >= 1 ? <MenuItem value={1} primaryText={1}/> : '' }
												{ turData.max_guests >= 2 ? <MenuItem value={2} primaryText={2}/> : '' }
												{ turData.max_guests >= 3 ? <MenuItem value={3} primaryText={3}/> : '' }
												{ turData.max_guests >= 4 ? <MenuItem value={4} primaryText={4}/> : '' }
												{ turData.max_guests >= 5 ? <MenuItem value={5} primaryText={5}/> : '' }
												{ turData.max_guests >= 6 ? <MenuItem value={6} primaryText={6}/> : '' }
												{ turData.max_guests >= 7 ? <MenuItem value={7} primaryText={7}/> : '' }
												{ turData.max_guests >= 8 ? <MenuItem value={8} primaryText={8}/> : '' }
												{ turData.max_guests >= 9 ? <MenuItem value={9} primaryText={9}/> : '' }
												{ turData.max_guests >= 10 ? <MenuItem value={10} primaryText={10}/> : '' }
												{ turData.max_guests >= 11 ? <MenuItem value={11} primaryText={11}/> : '' }
												{ turData.max_guests >= 12 ? <MenuItem value={12} primaryText={12}/> : '' }
												{ turData.max_guests >= 13 ? <MenuItem value={13} primaryText={13}/> : '' }
												{ turData.max_guests >= 14 ? <MenuItem value={14} primaryText={14}/> : '' }
												{ turData.max_guests >= 15 ? <MenuItem value={15} primaryText={15}/> : '' }
												{ turData.max_guests >= 16 ? <MenuItem value={16} primaryText={16}/> : '' }
												{ turData.max_guests >= 17 ? <MenuItem value={17} primaryText={17}/> : '' }
												{ turData.max_guests >= 18 ? <MenuItem value={18} primaryText={18}/> : '' }
												{ turData.max_guests >= 19 ? <MenuItem value={19} primaryText={19}/> : '' }
												{ turData.max_guests >= 20 ? <MenuItem value={20} primaryText={20}/> : '' }
											</SelectField>										
										</Col>
										<Col xs={6}>
											<p style={{ marginTop: 35, fontSize: 20, color: '#55c901' }}>
											{ turData.price_values[this.state.bookingData.adults-1] ? turData.price_values[this.state.bookingData.adults-1][currencyId] : 0 } { currency[currencyId] }
											</p>										
										</Col>
									</Row>
									<Row>
										<Col xs={6}>
											<SelectField
												fullWidth
												floatingLabelText={ languageId === 0 ? 'Children' : 'Детей' }
												errorText={ this.state.errorChilds && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
												value={ this.state.bookingData.children }
												onChange={ 
													(e, i, value) => this.setState({ 
														bookingData: { 
															arrivalDate: this.state.bookingData.arrivalDate,
															departureDate: this.state.bookingData.departureDate,
															adults: this.state.bookingData.adults,
															children: this.state.bookingData.children, 
															babies: value, 
														} 
													}) 
												}
											>
												<MenuItem value={0} primaryText='0'/>
												<MenuItem value={1} primaryText={1}/>
												<MenuItem value={2} primaryText={2}/>
												<MenuItem value={3} primaryText={3}/>
												<MenuItem value={4} primaryText={4}/>
												<MenuItem value={5} primaryText={5}/>
												<MenuItem value={6} primaryText={6}/>
												<MenuItem value={7} primaryText={7}/>
												<MenuItem value={8} primaryText={8}/>
												<MenuItem value={9} primaryText={9}/>
											</SelectField>	
										</Col>
										<Col xs={6}>
											<p style={{ marginTop: 35, fontSize: 20, color: '#55c901' }}>{ languageId === 0 ? 'Free' : 'Бесплатно' }</p>
										</Col>
									</Row>
									<Row>
										<Col xs={6}>
											<SelectField
												fullWidth
												floatingLabelText={ languageId === 0 ? 'Babies' : 'Младенцов' }
												errorText={ this.state.errorBabies && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
												value={ this.state.bookingData.babies }
												onChange={ 
													(e, i, value) => this.setState({ 
														bookingData: { 
															arrivalDate: this.state.bookingData.arrivalDate,
															departureDate: this.state.bookingData.departureDate,
															adults: this.state.bookingData.adults,
															children: value, 
															babies: this.state.bookingData.babies, 
														} 
													}) 
												}
											>
												<MenuItem value={0} primaryText='0'/>
												<MenuItem value={1} primaryText={1}/>
												<MenuItem value={2} primaryText={2}/>
												<MenuItem value={3} primaryText={3}/>
												<MenuItem value={4} primaryText={4}/>
												<MenuItem value={5} primaryText={5}/>
												<MenuItem value={6} primaryText={6}/>
												<MenuItem value={7} primaryText={7}/>
												<MenuItem value={8} primaryText={8}/>
												<MenuItem value={9} primaryText={9}/>
											</SelectField>											
										</Col>
										<Col xs={6}>
											<p style={{ marginTop: 35, fontSize: 20, color: '#55c901' }}>{ languageId === 0 ? 'Free' : 'Бесплатно' }</p>										
										</Col>
									</Row>
								</Col>
							</Row>
						</div>

						<div style={bookingStyles.container}>
							<Row>
								<Col xs={8}>
									<h4>
										{ languageId === 0 ? 'План пребывания:' : 'План пребывания:' }
									</h4>
								</Col>
								<Col xs={4}>
									<h4 style={bookingStyles.values}>{turData.days_plan}</h4>
								</Col>
							</Row>
							<Row>
								<Col xs={8}>
									<h4>{ languageId === 0 ? 'A discount:' : 'Скидка:' }</h4>							
								</Col>
								<Col xs={4}>
									<h4 style={bookingStyles.values}> -{turData.discount_percent}%</h4>
								</Col>
							</Row>
							<Row>
								<Col xs={8}>
									<h4>Итого:</h4>							
								</Col>
								<Col xs={4}>
									<h4 style={bookingStyles.values}>
									{ turData.price_values[this.state.bookingData.adults-1] ? turData.price_values[this.state.bookingData.adults-1][currencyId] : 0 } {currency[currencyId]}
									</h4>
								</Col>
							</Row>
							<Row style={{ marginTop: 20 }}>
								<Col>
									<RaisedButton
										fullWidth
										label={ languageId === 0 ? 'Book now' : 'Забронировать'} 
										onClick={this.goBooking}/>
								</Col>
								<Col>
									<p style={bookingStyles.info}>{ languageId === 0 ? 'For confirmation, the administration will contact you' : 'Для подтверждения с вами свяжется администрация' }</p>
								</Col>
							</Row>
						</div>
						
						<div style={advantagesStyles.container}>
							<Row>
								<Col>
									<h4 className='center'>{languageId === 0 ? 'Share social': 'Поделиться соцсети'}</h4>
									<Divider />
									<FacebookShareButton url={url} style={{ margin: 10 }}>
										<IconButton><FacebookIcon size={42} round /></IconButton>
									</FacebookShareButton>
								</Col>
							</Row>
						</div>

						<div style={advantagesStyles.container}>
							<h2>{ languageId === 0 ? 'Advantages' : 'Преимущества' }</h2>

							<ul style={advantagesStyles.ul}>
								<li style={advantagesStyles.li}>
									<img src="/images/small-icons/no-cards.png" style={advantagesStyles.img} alt="Бронирование без предоплаты"/>
									<span>{ languageId === 0 ? 'Booking without prepayment' : 'Бронирование без предоплаты' }</span>
								</li>
								<li style={advantagesStyles.li}>
									<img src="/images/small-icons/money.png" style={advantagesStyles.img} alt="Цены на 20% ниже чем в турагентствах"/>
									<span>{ languageId === 0 ? 'Prices are 20% lower than in travel agencies' : 'Цены на 20% ниже чем в турагентствах' }</span>
								</li>
								<li style={advantagesStyles.li}>
									<img src="/images/small-icons/image.png" style={advantagesStyles.img} alt="Отзывы и фотографии"/>
									<span>{ languageId === 0 ? 'Reviews and photos' : 'Отзывы и фотографии' }</span>
								</li>
								<li style={advantagesStyles.li}>
									<img src="/images/small-icons/edit.png" style={advantagesStyles.img} alt="Изменяйте бронирование в любое время"/>
									<span>{ languageId === 0 ? 'Change your reservation at any time' : 'Изменяйте бронирование в любое время' }</span>
								</li>
								<li style={advantagesStyles.li}>
									<img src="/images/small-icons/24online.png" style={advantagesStyles.img} alt="Поддержка 24/7"/>
									<span>{ languageId === 0 ? '24/7 Support' : 'Поддержка 24/7' }</span>
								</li>
							</ul>
						</div>

					</Col>
				</Row>
			</div>
		)
	}

}


const mapDispatchToProps = (dispatch) => {
	return {
		pageActions: bindActionCreators(pageActions, dispatch),
		async: bindActionCreators(actions, dispatch)
	}
}

const mapStateToProps = ({ profile, search, asyncData }) => ({
  profile,
  search,
  asyncData,
});

export default connect(mapStateToProps, mapDispatchToProps)(TurPage);