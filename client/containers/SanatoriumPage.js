import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import ImageGallery from 'react-image-gallery'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import Avatar from 'material-ui/Avatar'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
import Stage from 'react-stage';
import Drawer from 'material-ui/Drawer'
import axios from 'axios'
import _ from 'lodash'
import CircularProgress from 'material-ui/CircularProgress'
import Dialog from 'material-ui/Dialog'
import moment from 'moment'
import $ from 'jquery';

import BookingForm from '../components/forms/BookingForm'
import SanatoriumReviews from '../components/SanatoriumReviews'
import YouTubeSlider from '../components/YouTubeSlider'
import SelectibleRooms from '../components/SelectibleRoomsSanatoriumPage'

const queryString = require('query-string');

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const mapStyle = {
	allowfullscreen: true,
	margin: 10,
    frameborder: 0,
    width: 'calc(100% - 20px)',
    height: 300,
    border: '1px solid #bbb9b9'
}

const youTubeOpt = {
    frameBorder: 0, 
    allowFullScreen: true,
    width: '100%',
    height: 500,
}

const settings = {
      autoplay: true,
      arrows: true,
      dots: false, 
      arrowPrev: '<',
      arrowNext: '>',
      autoplaySpeed: 422422000,
      slidesToShow: 1,
      slidesToScroll: 1,
      speed: 500
}


const initialState = {
	dataLoaded: false,
	openDrawer: false,
	visRoomDetails: false,
	roomDetails: {},
	sanatoriumData: {},
	freeItems: [],
	paidItems: [],
	selectedRooms: [],
}

class SanatoriumPage extends Component {

    static fetchData({ store, params, query}) {        
        return Promise.all([
            store.dispatch(actions.getSanatoriumPage(query, store.getState().search.currencyRates)), 
            store.dispatch(actions.getSanatoriumComments(query.id)), 
        ])
    }

    constructor(props){
        super(props);

        this.state =  initialState

        this.axiosAddComment = ::this.axiosAddComment;
        this.handleSelectRoom = ::this.handleSelectRoom;
        this.updateBookedData = ::this.updateBookedData;
        this.showRoomDetails = ::this.showRoomDetails;
        this.handleSelectedRoom = ::this.handleSelectedRoom;
    }

    componentWillMount(){
        this.props.pageActions.updateIsLoadingPage(true);
		this.setState({ selectedRooms: null })
    }

    componentDidMount(){
       	const query = queryString.parse(this.props.location.search)

        Promise.all([		
        	this.props.async.getSanatoriumPage(query,this.props.search.currencyRates),
			this.props.async.getSanatoriumComments(query.id)
        ]).then( () => {
           	this.props.pageActions.updateIsLoadingPage(false)
		   	this.scrollTo('booking')
        }).catch( () => this.props.pageActions.updateIsLoadingPage(false) )
        
    	const {general} = this.props.asyncData.sanatoriumData;

		this.props.pageActions.setNavigationPathNames([
			{ label: ['Search', 'Поиск'], link: '/search?' + queryString.stringify(_.omit( queryString.parse(this.props.location.search), ['id', 'country', 'city'] )) },
			{ label: [ general ? general.h_sname : '', general ? general.h_sname : ''], link: `/search/${this.props.match.params.id}` }
		])

    }

	componentWillReceiveProps(nextProps){
	  const {general} = nextProps.asyncData.sanatoriumData;

	  if(!_.isEqual(general, this.props.asyncData.sanatoriumData.general)){
		this.props.pageActions.setNavigationPathNames([
			{ label: ['Search', 'Поиск'], link: '/search?' + queryString.stringify(_.omit( queryString.parse(this.props.location.search), ['id', 'country', 'city'] )) },
			{ label: [ general ? general.h_sname : '', general ? general.h_sname : ''], link: `/search/${this.props.match.params.id}` }
		])
	  }
	}

	componentWillUnmount() {
		this.setState({ selectedRooms: null })
	}

	axiosGetHotelComments() {
       	const query = queryString.parse(this.props.location.search)
		
		this.props.async.getSanatoriumComments(query.id);
	}

    axiosAddComment (overal_rat, treatm_rat, pluses, minuses) {

    	axios.post('/api/hotels/comments/add',{
    		hotels_id: queryString.parse(this.props.location.search).id,
    		users_id: this.props.profile.user.users_id,
    		overal_rat,
    		treatm_rat,
    		pluses,
    		minuses,
    	}).then( () => this.axiosGetHotelComments() )
    }


	scrollTo(id) {
		if(window.$(`#${id}`).offset()) $('html, body').animate({ scrollTop: $(`#${id}`).offset().top - 70 }, 1000);
	}

	handleSelectRoom(room) {

		let selectedRooms = this.state.selectedRooms || [],
			totalDefaultPrice = [0,0,0,0,0],
			totalPriceWithDiscount = [0,0,0,0,0]
		
		!_.find(selectedRooms, { items_id: room.items_id, category_id: room.category_id }) 
		? selectedRooms.push({
			items_id: room.items_id,
			room_id: room.id, 
			sname: room.sname,
			meal_plan: room.meal_plan,
			treatment_incl: room.treatment_incl,
			daily_procedures: room.daily_procedures,
			count_rooms: room.count_rooms,
			category_name: room.category_name,
			category_id: room.category_id, 
			default_price: room.default_price,
			price_with_discount: room.price_with_discount,
			photos: room.photos
		  }) 
		: _.remove( selectedRooms, { items_id: room.items_id, category_id: room.category_id }) 
		
		selectedRooms.map( item => {
			for(let i=0; i< 5; i++){
				totalPriceWithDiscount[i] += item.price_with_discount[i] || item.default_price[i]
				totalDefaultPrice[i] += item.default_price[i]
			}
		})

		this.setState({ selectedRooms, totalPrice: { default_price: totalDefaultPrice, price_with_discount: totalPriceWithDiscount } })
	}

	updateBookedData() {

	    const searchProps = queryString.parse(this.props.location.search)
	    const roomsParams = JSON.parse(searchProps.rooms)

	    let adults = 0, 
	    	childs = 0;

	    roomsParams.map( item => {
	    	adults += item.adults;
	    	childs += item.childs;
	    })

		//console.log('---------------------')
		//console.log(roomsParams)

		this.props.pageActions.setBookedData({ 
			guests: roomsParams,
			adults,
			childs,
			hotels_id: parseInt(searchProps.id),
			start_date: searchProps.start_date,
			end_date: searchProps.end_date,
			nights: parseInt(searchProps.nights),
			room_number: parseInt(JSON.parse(searchProps.rooms).length),
			shareRoom: Boolean(searchProps.shareRoom == 'true'),
			totalPrice : this.state.totalPrice,
			rooms : this.state.selectedRooms,
		})

		this.props.history.push('/booking')
	}

	showRoomDetails(id, room_id) {
		axios.get('/api/items-details-names').then( responseNames =>{
			let dataNames = responseNames.data.data

			axios
				.get('/api/profile/hotel/rooms-props', { 
					params: {
						items_id: room_id
					}
				})
				.then( responseProps => {
					let freeItems = [], paidItems = [];

					dataNames && dataNames.map( (item,index) => {
						let itemProps = _.find(responseProps.data.data, { detail_id: item.id })

						const data = { 
							id: item.id, 
							label: [item.dname, item.dname_ru ], 
							free: itemProps ? itemProps.is_free : true , 
							available: itemProps ? itemProps.is_available : false ,
							ext_data: itemProps ? itemProps.ext_data : { data: '' } 
						}

						if(itemProps && itemProps.is_available) {
							if(itemProps.is_free) {
								freeItems.push(data)
							}
							else {
								paidItems.push(data)
							}
						}
					})
					this.setState({ freeItems, paidItems })				
				})
		})

		let room = _.find(this.props.asyncData.sanatoriumData.rooms_details, { id }) || {}

		if(room.photos){
			room.photos = room.photos.map( (photo,index) => { return { id: index, original: photo, thumbnail: photo } })
		}

		this.setState({ visRoomDetails: true, roomDetails: room })		
	}

	handleSelectedRoom(rooms) {

		let totalDefaultPrice = [0,0,0,0,0],
			totalPriceWithDiscount = [0,0,0,0,0],
			selectedRooms = rooms;

		selectedRooms.map( item => {
			for(let i=0; i< 5; i++){
				totalPriceWithDiscount[i] += item.price_with_discount && item.price_with_discount[i] || item.default_price[i]
				totalDefaultPrice[i] += item.default_price[i]
			}
		})

		this.setState({ selectedRooms: selectedRooms, totalPrice: { default_price: totalDefaultPrice, price_with_discount: totalPriceWithDiscount } })
	}

	render() {
        const languageId = this.props.profile.languageId - 0;
        const currencyId = this.props.profile.currencyId - 0;
		const stars = [
			<div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/></div>,
			<div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
			<div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
			<div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
			<div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
		];
	    const guest = [
	      <div style={{ color: '#fff', letterSpacing: 2, float: 'left', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /></div>,
	      <div style={{ color: '#fff', letterSpacing: 2, float: 'left', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /></div>,
	      <div style={{ color: '#fff', letterSpacing: 2, float: 'left', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /></div>,
	    ] 
		const searchProps = queryString.parse(this.props.location.search);
		const roomsParams = JSON.parse(searchProps.rooms || {})
    	const {sanatoriumData, sanatoriumComments, sanatoriumCommentsStats} = this.props.asyncData;
        const url = process.env.API_URL + this.props.location.pathname;
        
    	if(this.props.page.loading === false && _.isEmpty(sanatoriumData)){
    		console.log('redirect')
    		//console.log(this.props.history.push('/sanatorium-not-found'))
    	}

    	const countRooms = JSON.parse(searchProps.rooms).length
    	console.log(this.state)

    	return(
			!_.isEmpty(sanatoriumData) &&
			<div>
				<Row style={{ marginLeft: 0, marginRight: 0 }}>

					<Col xs={12} xl={4} style={{ paddingLeft: 0, paddingRight: 0 }}>
						<BookingForm />
						<Hidden xs sm>
							<iframe
								style={mapStyle}
								src={ 
									sanatoriumData.general && sanatoriumData.general.map_location 
									? `https://www.google.com/maps/embed/v1/place?key=AIzaSyCkXiB7TrHN3IXwgHw1n1hzgr4KSkJQ3fM
										&q=${sanatoriumData.general.map_location.lat},${sanatoriumData.general.map_location.lng}`
									: `https://www.google.com/maps/embed/v1/place?key=AIzaSyCkXiB7TrHN3IXwgHw1n1hzgr4KSkJQ3fM
										&q=Space+Needle,Seattle+WA`
								}>
							</iframe>

							<Paper id='reviews' zDepth={1} style={{ background: '#fff', padding: '2px 10px', margin: 10, marginTop: 0 }}>
								<h3 style={{ textAlign: 'center' }}>Reviews</h3>
								<Divider />
								{sanatoriumComments.length
									?
										sanatoriumComments.map( (review, index) =>
											
											index <= 10 ?
												<div style={{ marginTop: 10, background: '#f5f5f5', borderRadius: 5 }}>	
													<ListItem
														disabled={true}
														leftAvatar={
															<Avatar src={review.avatar || '/images/user_default.png'} />
														}
														primaryText={ (review.first_name || review.last_name) 
															? 	`${review.first_name} ${review.last_name}`
															: 	languageId === 0 ? 'No name' : 'Без имени' 
														} 
														secondaryText={moment(review.created).format('DD MMM, YYYY')}/>
													<ListItem
														disabled={true}
														leftAvatar={
															<i className="fa fa-plus" aria-hidden="true" style={{ left: 30, color: '#4cc708' }}></i>
														}
														primaryText={ review.pluses } 
														style={{ fontSize: 13, padding: '6px 5px 5px 72px' }}/>
													<ListItem
														disabled={true}
														leftAvatar={
															<i className="fa fa-minus" aria-hidden="true" style={{ left: 30, color: '#bf3e3e' }}></i>
														}
														primaryText={ review.minuses }
														style={{ fontSize: 13, padding: '6px 5px 5px 72px' }}/>
												</div>
											: <div/>
										)							
									: 	<div>
											<p>{ languageId === 0 ? 'Not yet commented on' : 'Еще не комментировался' }</p>
										</div>
								}
								<RaisedButton
									fullWidth 
									label={ languageId === 0 ? 'More reviews' : 'Больше отзывов' } 
									style={{ margin: '10px 0px' }}
									onClick={ () => this.setState({ openDrawer: true }) }/>
								
							</Paper>									
						</Hidden>
					</Col>						

					<Col xs={12} xl={8} id='main'>
						<Hidden xs sm>
							<div style={{ marginTop: 15 }}>
								<ul className='horizontal-ul'>
									<li className='sanatorium-menu' onClick={ () => this.scrollTo('booking') }>{ languageId === 0 ? 'Booking' : 'Бронирование'}</li>
									<li className='sanatorium-menu' onClick={ () => this.setState({ openDrawer: true }) }>{ languageId === 0 ? 'Reviews' : 'Отзывы'}</li>
									<li className='sanatorium-menu' onClick={ () => this.scrollTo('medical-base') }>{ languageId === 0 ? 'Medical base' : 'Медицинская база'}</li>
									<li className='sanatorium-menu' onClick={ () => this.scrollTo('treatment-profile') }>{ languageId === 0 ? 'Profile of treatments' : 'Профиль лечения'}</li>
									<li className='sanatorium-menu' onClick={ () => this.scrollTo('videos') }>{ languageId === 0 ? 'Videos' : 'Видео'}</li>
								</ul>
							</div>
						</Hidden>
						<Paper zDepth={1} style={{ background: '#fff', marginTop: 15, padding: 5 }}>
							<Hidden xs sm>
								<Row style={{ margin: '15px 0px', marginTop: 60, height: 85 }}>
									<Col xs={9}>
										<h3 style={{ textDecoration: 'underline' }}>
											{languageId ? sanatoriumData.general && sanatoriumData.general.h_sname : sanatoriumData.general && sanatoriumData.general.h_sname_ru }
											{stars[sanatoriumData.general && sanatoriumData.general.h_stars-1]}
										</h3>
									</Col>
									<Col xs={3}>
										<div className="sanatorium_rating" style={{ position: 'relative', width: '100%' }}>
											<div className="graph">
												<div className="graph1" style={{ height: `${sanatoriumData.general.general_rating*10}%` }}><span>{ ( sanatoriumData.general.general_rating || 0).toFixed(1) }</span></div>
												<div className="graph2" style={{ height: `${sanatoriumData.general.treatment_rating*10}%` }}><span>{ ( sanatoriumData.general.treatment_rating || 0).toFixed(1) }</span></div>
											</div>
											<div className="table">
												<div className="table1">общий рейтинг</div>
												<div className="table2">рейтинг лечения</div>
											</div>
										</div>
									</Col>
								</Row>
							</Hidden>

							<Visible xs sm>
								<Row style={{ margin: '15px 0px' }}>
									<Col xs={12}>
										<h3 style={{ textDecoration: 'underline' }}>
											{languageId ? sanatoriumData.general.h_sname : sanatoriumData.general.h_sname_ru }
											{stars[sanatoriumData.general.h_stars-1]}
										</h3>
									</Col>
									<Col xs={6}>
										<p style={{ color: '#097db3' }}>{ languageId === 0 ? `general rating: ${sanatoriumData.general.general_rating ? parseFloat(sanatoriumData.general.general_rating).toFixed(1) : '0.0'}` : `общий рейтинг: ${sanatoriumData.general.general_rating ? parseFloat(sanatoriumData.general.general_rating).toFixed(1) : '0.0'}` }</p>
									</Col>
									<Col xs={6}>
										<p style={{ color: '#55c908' }}>{ languageId === 0 ? `treatment rating: ${ sanatoriumData.general.treatment_rating ? parseFloat(sanatoriumData.general.treatment_rating).toFixed(1) : '0.0' }` : `рейтинг лечения: ${ sanatoriumData.general.treatment_rating ? parseFloat(sanatoriumData.general.treatment_rating).toFixed(1) : '0.0' }` }</p>
									</Col>
								</Row>
							</Visible>

							<Row style={{ margin: '10px 0px' }}>
								<Col xs={12}>
									{
										sanatoriumData.photos.length
										?	<ImageGallery
												useBrowserFullscreen={false}
												showPlayButton={false}
												showThumbnails={false}
												items={sanatoriumData.photos}
												slideInterval={2000}/>
										: 	<div style={{ height: 50, textAlign: 'center' }}>
												<h3>{ languageId === 0 ? 'No photos available' : 'Отсутствуют фотографии' }</h3>
											</div>
									}
								</Col>
							</Row>
							<Row style={{ margin: '10px 0px' }}>
							<Hidden xs sm>
								<Col xs={12}>
									<table id='booking' className='table-sanatorium-room'>
										<tr>
											<th>{ languageId === 0 ? 'Room type' : 'Тип номера' }</th>
											<th>{ languageId === 0 ? 'Treatment incl.' : 'Лечение вкл.' }</th>
											<th>{ languageId === 0 ? 'Meal plan' : 'План питания' }</th>
											<th>{ languageId === 0 ? 'Category' : 'Категория' }</th>
											<th>{ languageId === 0 ? 'Total price' : 'Общая цена' }</th>
											<th>{ languageId === 0 ? 'Room selection' : 'Выбор номера' }</th>
										</tr>
										{sanatoriumData.rooms
											? 	countRooms === 1
												? 	sanatoriumData.rooms[0].map( (room,i) =>
														<tr>
															<td style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={ () => this.showRoomDetails(room.items_cats_id, room.id) }>
																{room.max_adults > 3
																				?	<span style={{ float:'left', color: '#55c908', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true"/> x { room.max_adults }</span>
																				: 	guest[roomsParams[0].adults -1]
																}
																{ room.sname }
															</td>
															<td>{ room.treatment_incl ? <i className="fa fa-check" aria-hidden="true"/> : <i className="fa fa-times" aria-hidden="true"/> }</td>
															<td>
																{room.meal_plan ?
																	room.meal_plan.map( (item, index) =>
																		item === 'breakfast' && (
																			languageId === 0 ? `Breakfast${ index+1 !== room.meal_plan.length ? ',' : ''}` : `Завтрак${ index+1 !== room.meal_plan.length ? ',' : ''}`
																		) ||
																		item === 'dinner' && (
																			languageId === 0 ? `Dinner${ index+1 !== room.meal_plan.length ? ',' : ''}` : `Обед${ index+1 !== room.meal_plan.length ? ',' : ''}`
																		) ||
																		item === 'supper' && (
																			languageId === 0 ? `Supper${ index+1 !== room.meal_plan.length ? ',' : ''}` : `Ужин${ index+1 !== room.meal_plan.length ? ',' : ''}`
																		)
																	) 
																: <i className="fa fa-times" aria-hidden="true"/>}
															</td>
															<td>{ room.category_name }</td>
															<td>{ (room.price_with_discount && room.price_with_discount[this.props.profile.currencyId] || room.default_price && room.default_price[this.props.profile.currencyId]) + ' ' + currency[this.props.profile.currencyId] }</td>
															<td>														
																<RaisedButton 
																	label={ 
																		!_.find(this.state.selectedRooms, { items_id: room.items_id, category_id: room.category_id }) 
																		? languageId === 0 ? 'Select' : 'Выбрать' 
																		: languageId === 0 ? 'Unselect' : 'Снять'
																	}
																	backgroundColor={ 
																		!_.find(this.state.selectedRooms, { items_id: room.items_id, category_id: room.category_id }) 
																		? '#bdbdbd'
																		: '#4cc708'
																	}
																	labelStyle={{ color: '#fff' }}
																	onClick={ () => this.handleSelectRoom(room) }/>
															</td>
														</tr>
													)
												: 	<SelectibleRooms
														  isMobile={false}
														  languageId={languageId}
														  currencyId={currencyId}
														  params={searchProps} 
														  rooms={sanatoriumData.rooms}
														  updateRooms={this.handleSelectedRoom} 
                              onClick={(items_cats_id, id) => this.showRoomDetails(items_cats_id, id)}/>
											: 	<tr>
													<td colSpan={10}>{ languageId === 0 ? 'All numbers are occupied' : 'Все номера заняты' }</td>
												</tr>
										}
									</table>
								</Col>
								<Col xs={12} style={{ textAlign: 'right', marginTop: 10 }}>
									<div>
										{
										this.state.totalPrice
										?	<div style={{ display: 'inline-block', verticalAlign: 'top', marginRight: 15 }}>
												<p className='noDiscount' style={{ paddingTop: 5 }}>
													{
														this.state.totalPrice.default_price > this.state.totalPrice.price_with_discount 
														? this.state.totalPrice.default_price[this.props.profile.currencyId] + ' ' + currency[this.props.profile.currencyId] 
														: ''
													}
												</p>
												<p className='discount' style={{ paddingTop: 5 }}>
													{ 
														this.state.totalPrice.price_with_discount !== this.state.totalPrice.default_price[this.props.profile.currencyId] 
														&& this.state.totalPrice.price_with_discount[this.props.profile.currencyId] + ' ' + currency[this.props.profile.currencyId]
													}
												</p>
												<p style={{ color: '#fabd00' }}>{
													searchProps.childs == 0 && searchProps.adults == 2 && searchProps.shareRoom == 'true'
													?	(
															languageId === 0
															? 'You pay 50% of the amount'
															: 'Вы платите 50% от суммы'
														)
													: 	''
												}</p>
											</div>
										: ''
										}
										<RaisedButton 
											disabled={ !(this.state.totalPrice && this.state.totalPrice.default_price[0] && this.state.totalPrice.price_with_discount[0]) }
											label={ languageId === 0 ? 'Book now' : 'Забронировать' }
											backgroundColor='#f3be19'
											labelStyle={{ color: '#fff' }} 
											onClick={ this.updateBookedData } />
									</div>
								</Col>
							</Hidden>
							<Visible xs sm>
								<h3  id='booking'>{languageId === 0 ? 'Available rooms:' : 'Доступные комнаты:'}</h3>
								{sanatoriumData.rooms
								  ? countRooms === 1
									? 	sanatoriumData.rooms[0].map( (room,i) =>
											<Row style={{ marginTop: 15 }}>
												<Col xs={8}> 
													<p style={{ textDecoration: 'underline' }}>
														{room.max_adults > 3
															?	<span style={{ float:'left', color: '#55c908', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true"/> x { room.max_adults }</span>
															: 	guest[roomsParams[0].adults -1]
														}
														{room.sname}
													</p>
													<p>
													{room.meal_plan ?
													room.meal_plan.map( (item, index) =>
														item === 'breakfast' && (
															languageId === 0 ? `Breakfast${ index+1 !== room.meal_plan.length ? ',' : ''}` : `Завтрак${ index+1 !== room.meal_plan.length ? ',' : ''}`
														) ||
														item === 'dinner' && (
															languageId === 0 ? `Dinner${ index+1 !== room.meal_plan.length ? ',' : ''}` : `Обед${ index+1 !== room.meal_plan.length ? ',' : ''}`
														) ||
														item === 'supper' && (
															languageId === 0 ? `Supper${ index+1 !== room.meal_plan.length ? ',' : ''}` : `Ужин${ index+1 !== room.meal_plan.length ? ',' : ''}`
														)
													)
													: <i className="fa fa-times" aria-hidden="true"/>}
													</p>
													<p>{languageId === 0 ? 'Treatment' : 'Лечение'} { room.treatment_incl ? <i className="fa fa-check" aria-hidden="true"/> : <i className="fa fa-times" aria-hidden="true"/> }</p>
												</Col>
												<Col xs={4}>
													<span>{ (room.price_with_discount && room.price_with_discount[this.props.profile.currencyId] || room.default_price && room.default_price[this.props.profile.currencyId]) + ' ' + currency[this.props.profile.currencyId] }</span>
												</Col>
												<Col xs={12}>
													<RaisedButton 
														fullWidth
														label={ 
															!_.find(this.state.selectedRooms, { items_id: room.items_id, category_id: room.category_id }) 
															? languageId === 0 ? 'Select' : 'Выбрать' 
															: languageId === 0 ? 'Unselect' : 'Снять'
														}
														backgroundColor={ 
															!_.find(this.state.selectedRooms, { items_id: room.items_id, category_id: room.category_id }) 
															? '#bdbdbd'
															: '#4cc708'
														}
														labelStyle={{ color: '#fff' }}
														onClick={ () => this.handleSelectRoom(room) }/>
												</Col>
											</Row>
										)
									: 	<SelectibleRooms 
											isMobile={true}
											languageId={languageId}
											currencyId={currencyId}
											params={searchProps} 
											rooms={sanatoriumData.rooms}
											updateRooms={this.handleSelectedRoom}
                      onClick={(items_cats_id, id) => this.showRoomDetails(items_cats_id, id)} />
								  : <Row>
										<Col>{ languageId === 0 ? 'All numbers are occupied' : 'Все номера заняты' }</Col>
									</Row>
								}
								<Row>
									<Col xs={12} style={{ marginTop: 20 }}>
										<RaisedButton
											fullWidth 
											disabled={ !(this.state.totalPrice && this.state.totalPrice.default_price[0] && this.state.totalPrice.price_with_discount[0]) }
											label={ 
												!this.state.totalPrice ? languageId === 0  ? 'Book now - 0 USD' : 'Забронировать - 0 USD' :
												languageId === 0 
												? `Book now - ${
														this.state.totalPrice.default_price > this.state.totalPrice.price_with_discount 
														? this.state.totalPrice.default_price[this.props.profile.currencyId] + ' ' + currency[this.props.profile.currencyId] 
														: this.state.totalPrice.price_with_discount !== this.state.totalPrice.default_price[this.props.profile.currencyId] 
															&& this.state.totalPrice.price_with_discount[this.props.profile.currencyId] + ' ' + currency[this.props.profile.currencyId]
												}` 
												: `Забронировать - ${
														this.state.totalPrice.default_price > this.state.totalPrice.price_with_discount 
														? this.state.totalPrice.default_price[this.props.profile.currencyId] + ' ' + currency[this.props.profile.currencyId] 
														: this.state.totalPrice.price_with_discount !== this.state.totalPrice.default_price[this.props.profile.currencyId] 
															&& this.state.totalPrice.price_with_discount[this.props.profile.currencyId] + ' ' + currency[this.props.profile.currencyId]
												}` 
											}
											backgroundColor='#f3be19'
											labelStyle={{ color: '#fff' }} 
											onClick={ this.updateBookedData } />
									</Col>
								</Row>
							</Visible>
							</Row>
							<Row>
								<Col>
									<h3 className='sanatorium-page-title'>{ languageId === 0 ? 'Description' : 'Описание'}</h3>
									<div className='sanatorium-page-content'>
										{
											languageId === 0 && sanatoriumData.general.h_about || languageId !== 0 && sanatoriumData.general.h_about_ru ? 
												<p>{ languageId === 0 ? sanatoriumData.general.h_about : sanatoriumData.general.h_about_ru }</p>
											: 	<p>{ languageId === 0 ? 'No information' : 'Информация отсутствует' }</p>
										}
									</div>
								</Col>
							</Row>

							<Row>
								<Col>
									<h3 className='sanatorium-page-title'>{ languageId === 0 ? 'Medical base' : 'Лечебная база'}</h3>
									<div className='sanatorium-page-content' id='medical-base'>
									{
										sanatoriumData.treatmentData.length 
										?	sanatoriumData.treatmentData.map( (item, index) =>
												<div>
													<h4 style={{ color: '#3e3e3e' }}>{ item.category[languageId] }</h4>
													{
														item.values.length

													?	<Row>
																{item.values.map( (label, labelIndex) =>
																	<Col xs={12} sm={6} lg={4} style={{ position: 'relative' }}>
																		<i className="fa fa-check" aria-hidden="true" style={{ color: '#55c907', position: 'absolute' }}></i>
																		<p style={{ paddingLeft: 25 }}>{ label.label[languageId] }</p>
																	</Col>
																)}
														</Row>
													: <p className='center'>{ languageId === 0 ? 'No data' : 'Нет данных'}</p>
													}
												</div>
											)
										: <p>{ languageId === 0 ? 'No information' : 'Информация отсутствует' }</p>
									}
									</div>
								</Col>
							</Row>
							<Row>
								<Col>
									<h3 className='sanatorium-page-title'>{ languageId === 0 ? 'Treatment profile' : 'Профиль лечения'}</h3>
									<div className='sanatorium-page-content' id='treatment-profile'>
									{
										sanatoriumData.treatmentProfile.length 
										?	sanatoriumData.treatmentProfile.map( (item, index) =>
												<div>
													<h4 style={{ color: '#3e3e3e' }}>{ item.category[languageId] }</h4>
													{
														item.values.length
														?	<Row>
																{item.values.map( (label, labelIndex) =>
																	<Col xs={12} sm={6} lg={4} style={{ position: 'relative' }}>
																		<i className="fa fa-check" aria-hidden="true" style={{ color: '#55c907', position: 'absolute' }}></i>
																		<p style={{ paddingLeft: 25 }}>{ languageId === 0 ? label.name : label.name_ru }</p>
																	</Col>
																)}
															</Row>
														: <p className='center'>{ languageId === 0 ? 'No data' : 'Нет данных'}</p>
													}
												</div>
											
											)
										: <p>{ languageId === 0 ? 'No information' : 'Информация отсутствует' }</p>
									}
									</div>
								</Col>
							</Row>
							<Row>
								<Col>
									<h3 className='sanatorium-page-title'>{ languageId === 0 ? 'Facilitites and services' : 'Удобства и сервис'}</h3>
									<div className='sanatorium-page-content' id='advantagesDisadvantages'>
										<div>
											<h4 style={{ color: '#3e3e3e' }}>{ languageId === 0 ? 'Free' : 'Бесплатно' }</h4>
											{		
												sanatoriumData.facilities.free
													?	<Row>
															{sanatoriumData.facilities.free.map( (label, labelIndex) =>
																<Col xs={12} sm={6} lg={4} style={{ position: 'relative' }}>
																	<i className="fa fa-check" aria-hidden="true" style={{ color: '#55c907', position: 'absolute' }}></i>
																	<p style={{ paddingLeft: 25 }}>{ languageId === 0 ? label.fname : label.fname_ru }</p>
																</Col>
															)}
														</Row>
												: <p className='center'>{ languageId === 0 ? 'No data' : 'Нет данных'}</p>
											}
											<h4 style={{ color: '#3e3e3e' }}>{ languageId === 0 ? 'Paid' : 'Платно' }</h4>
											{		
												sanatoriumData.facilities.paid
													?	<Row>
															{sanatoriumData.facilities.paid.map( (label, labelIndex) =>
																<Col xs={12} sm={6} lg={4} style={{ position: 'relative' }}>
																	<i className="fa fa-check" aria-hidden="true" style={{ color: '#55c907', position: 'absolute' }}></i>
																	<p style={{ paddingLeft: 25 }}>
																		{ languageId === 0 ? label.fname : label.fname_ru }
																		{ label.ext_data.data ? `(${ label.ext_data.data})` : '' }
																	</p>													
																</Col>
															)}
														</Row>
												: <p className='center'>{ languageId === 0 ? 'No data' : 'Нет данных'}</p>
											}														
										</div>
									</div>
								</Col>
							</Row>
							<Row>
								<Col>
									<h3 className='sanatorium-page-title'>{ languageId === 0 ? 'Advantages and disadvantages' : 'Плюсы и минусы'}</h3>
									<div className='sanatorium-page-content' id='advantagesDisadvantages'>
										{ sanatoriumData.plusesMinuses.pluses && sanatoriumData.plusesMinuses.minuses 
										?	<div>
												<div style={{ position: 'relative' }}>
													<i className="fa fa-plus" aria-hidden="true" style={{ color: '#55c907', position: 'absolute', top: 4 }}></i>
													<p className='sanatorium-page-ul'>{ sanatoriumData.plusesMinuses.pluses }</p>
												</div>
												<div style={{ position: 'relative' }}>
													<i className="fa fa-minus" aria-hidden="true" style={{ color: '#d00606', position: 'absolute', top: 4 }}></i>
													<p className='sanatorium-page-ul'>{ sanatoriumData.plusesMinuses.minuses }</p>
												</div>
											</div>
										: 	<p>{ languageId === 0  ? 'This sanatorium has not yet been evaluated by the administration' : 'Этот санаторий еще не оценен администрацией'}</p>
										}
									</div>
								</Col>
							</Row>
							<Row>
								<Col>
									<h3 className='sanatorium-page-title'>{ languageId === 0 ? 'Videos' : 'Видео'}</h3>
									<div className='sanatorium-page-content' id='videos'>
									{sanatoriumData.videos.length ?
										<YouTubeSlider videos={sanatoriumData.videos} height={500} languageId={languageId}/>
									: 	<p>{ languageId === 0 ? 'No information' : 'Информация отсутствует' }</p>}
									</div>
								</Col>
							</Row>							
						</Paper>
					</Col>
				</Row>

				<SanatoriumReviews 
					languageId={languageId}
					reviews={sanatoriumComments}
					commentStats={sanatoriumCommentsStats}
					open={this.state.openDrawer}
					user={this.props.profile.user}
					axiosAddComment={ (overal_rat, treatm_rat, pluses, minuses) => this.axiosAddComment(overal_rat, treatm_rat, pluses, minuses) }/>
				
				<Dialog
					autoScrollBodyContent
					title={ languageId === 0 ? `Room: ${this.state.roomDetails.sname}` : `Комната: ${this.state.roomDetails.sname}` }
					actions={[]}
					modal={false}
					open={this.state.visRoomDetails}
					onRequestClose={ () => this.setState({ visRoomDetails: false, roomDetails: {} }) }
					contentStyle={{ width: '90%' }}
				>
					<Row>
						<Col xs={12} style={{ marginBottom: 15 }}>
							{this.state.roomDetails.photos && this.state.roomDetails.photos.length ?
								<ImageGallery
									useBrowserFullscreen={false}
									showPlayButton={false}
									showThumbnails={false}
									items={this.state.roomDetails.photos}
									slideInterval={2000}/>
							: 	<p>{languageId === 0 ? 'No photos' : 'Нет фотографий'}</p>}
						</Col>
						<Col xs={6}>
							<p>{languageId === 0 ? `Numbers room: ${this.state.roomDetails.total_rooms}` : `Количество комнат: ${this.state.roomDetails.total_rooms}`}</p>
						</Col>
						<Col xs={6}>
							<p>{languageId === 0 ? `Room area: ${this.state.roomDetails.total_area}` : `Площадь номера: ${this.state.roomDetails.total_area}`}</p>
						</Col>
						<Col xs={6}>
							<p>{languageId === 0 ? `Max guests: ${this.state.roomDetails.max_adults}` : `Максимум гостей: ${this.state.roomDetails.max_adults}`}</p>
						</Col>
						<Col xs={6}>
							<p>{languageId === 0 ? `Max children: ${this.state.roomDetails.max_chields}` : `Максимум детей: ${this.state.roomDetails.max_chields}`}</p>
						</Col>
						<Col xs={6}>
							<p>{languageId === 0 ? `Beds: ${this.state.roomDetails.number_beds}` : `Кроватей: ${this.state.roomDetails.number_beds}`}</p>
						</Col>
					</Row>
					<Row>
						<Col>
							<h4 style={{ color: '#3e3e3e' }}>{ languageId === 0 ? 'Free' : 'Бесплатно' }</h4>
							{		
								this.state.freeItems.length
									?	<Row>
											{this.state.freeItems.map( (item, index) =>
												<Col xs={12} sm={6} lg={4} style={{ position: 'relative' }}>
													<i className="fa fa-check" aria-hidden="true" style={{ color: '#55c907', position: 'absolute' }}></i>
													<p style={{ paddingLeft: 25 }}>{item.label[languageId]}</p>
												</Col>
											)}
										</Row>
								: <p className='center'>{ languageId === 0 ? 'No data' : 'Нет данных'}</p>
							}
							<h4 style={{ color: '#3e3e3e' }}>{ languageId === 0 ? 'Paid' : 'Платно' }</h4>
							{		
								this.state.paidItems.length
									?	<Row>
											{this.state.paidItems.map( (item, index) =>
												<Col xs={12} sm={6} lg={4} style={{ position: 'relative' }}>
													<i className="fa fa-check" aria-hidden="true" style={{ color: '#55c907', position: 'absolute' }}></i>
													<p style={{ paddingLeft: 25 }}>{item.label[languageId]}</p>												
												</Col>
											)}
										</Row>
								: <p className='center'>{ languageId === 0 ? 'No data' : 'Нет данных'}</p>
							}	
						</Col>
					</Row>
				</Dialog>
			</div>
		)
	}
}



const mapDispatchToProps = (dispatch) => {
    return {
    	async: bindActionCreators(actions, dispatch),
    	pageActions: bindActionCreators(pageActions, dispatch),
    }
}

const mapStateToProps = ({ profile, search, page, asyncData }) => ({
  profile,
  page,
  search,
  asyncData,
});

export default connect(mapStateToProps, mapDispatchToProps)(SanatoriumPage);