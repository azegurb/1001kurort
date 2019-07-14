import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import { Link } from 'react-router-dom'
import Divider from 'material-ui/Divider'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton'
import WatchLater from 'material-ui/svg-icons/action/watch-later'
import VerifiedUser from 'material-ui/svg-icons/action/verified-user'
import Alarm from 'material-ui/svg-icons/action/alarm'
import CompareArrows from 'material-ui/svg-icons/action/assessment'
import DeleteSweep from 'material-ui/svg-icons/content/delete-sweep'
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward'
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import _ from 'lodash'
import axios from 'axios'
import $ from 'jquery';

import BookingForm from '../components/forms/BookingForm'
import Filters from '../components/Filters'

const queryString = require('query-string');

const initialState = {
	comparingSanatoriums: [],
	diseasesProfilesNames: [],
	facilitiesNames: [],
	treatmentBaseNames: [],
	sanatoriums: [],
	activeSort: 'price',
	showAddingToCompare: false,
	loadMoreReady: true,
}

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']


class Search extends Component { 
	  
    static fetchData({ store, params, query}) {        
        return Promise.all([
            store.dispatch(actions.getSanatoriums(query, store.getState().search.currencyRates)), 
            store.dispatch(actions.getDiseasesProfiles()), 
            store.dispatch(actions.getFacilitiesNames()), 
            store.dispatch(actions.getTreatmentBaseNames()), 
            store.dispatch(actions.getRoomDetailsNames()), 
        ])
    }

	constructor(props) {
		super(props);

		this.state = initialState
        
        this.sortSanatoriums = ::this.sortSanatoriums;
        this.addToCompare = ::this.addToCompare;
        this.removeFromCompare = ::this.removeFromCompare;
        this.loadMoreSanatoriums = ::this.loadMoreSanatoriums;
        this.handleFailLoadImage = ::this.handleFailLoadImage;
	}


	componentWillMount(){
    	this.props.pageActions.updateIsLoadingPage(true);			
		this.props.pageActions.setNavigationPathNames([{ label: ['Search', 'Поиск'], link: '/search'}])
	}

	componentDidMount(){
		const params = queryString.parse(this.props.location.search) || {};
        
    	Promise.all([
			this.props.async.getSanatoriums(params, this.props.search.currencyRates),
			this.props.async.getDiseasesProfiles(),
			this.props.async.getFacilitiesNames(),
			this.props.async.getTreatmentBaseNames(),
			this.props.async.getRoomDetailsNames()
	    ]).then( () => {
	      	this.props.pageActions.updateIsLoadingPage(false)
	    })
        
    	const ids = params.ids 
		  ? Array.isArray(params.ids)
		    ? params.ids.map(id => parseInt(id))
		  : [parseInt(params.ids)]
		: []

    	const comparingSanatoriums = _.filter(this.props.asyncData.sanatoriums, item => ids.indexOf(item.id) > -1 ? true : false )
		
		this.setState({ sanatoriums: this.props.asyncData.sanatoriums, comparingSanatoriums: comparingSanatoriums }, this.scrollTo('sanatoriums'))
	}

	componentWillReceiveProps(nextProps){

	    if(nextProps.location.search !== this.props.location.search){
	      	const params = queryString.parse(nextProps.location.search)
	      	this.props.async.getSanatoriums(params, this.props.search.currencyRates);
	    }

	    if(!_.isEqual(nextProps.asyncData.sanatoriums, this.props.asyncData.sanatoriums)) {
	      	this.setState({ sanatoriums: nextProps.asyncData.sanatoriums }, this.scrollTo('sanatoriums'))
	   	}

	}

	sortSanatoriums(sortBy) {
		let sanatoriums = this.state.sanatoriums

		if( sortBy === 'general'){
			sanatoriums = _.sortBy( sanatoriums, 'general_rating')
		}else if(sortBy === 'treatment'){
			sanatoriums = _.sortBy( sanatoriums, 'treatment_rating')
		}else if( sortBy === 'price'){
			sanatoriums = _.sortBy( sanatoriums, 'totalPrice')			
		}else if( sortBy === 'discount'){
			sanatoriums = _.sortBy( sanatoriums, 'totalPercent')		
		}

		this.setState({ activeSort: sortBy, sanatoriums })
	}

	addToCompare(id) {
		let comparingSanatoriums = this.state.comparingSanatoriums,
			sanatoriumData = _.find(this.state.sanatoriums, { id : id});

		comparingSanatoriums.push(sanatoriumData)
		this.setState({ comparingSanatoriums, showAddingToCompare: true })
	}

	removeFromCompare(id) {
		let comparingSanatoriums = this.state.comparingSanatoriums
			
			comparingSanatoriums = _.filter(comparingSanatoriums, item => { return item.id != id });
			this.setState({ comparingSanatoriums, showAddingToCompare: true })
	}

	loadMoreSanatoriums() {
		this.setState({ loadMoreReady: false })
		setTimeout( () => this.setState({ loadMoreReady: true}), 4000 )
	}
	
	handleFailLoadImage(event) {
		event.currentTarget.setAttribute('src', '/images/image-not-found.jpg')
	}
   
    scrollTo(id) {

    	const scrollHeight = window.$(`#${id}`).offset().top - 80
	
      	if(scrollHeight > 20) {
      		window.$('html, body').animate({ scrollTop: scrollHeight }, 1000)
      	}
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
		]
		const guest = [
			<div style={{ color: '#fff', letterSpacing: 2, float: 'left' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /></div>,
			<div style={{ color: '#fff', letterSpacing: 2, float: 'left' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /></div>,
			<div style={{ color: '#fff', letterSpacing: 2, float: 'left' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /></div>,
		]
		const verifiedBookText = languageId === 0 ? 'Instant confirmation of booking' : 'Мгновенное подтверждение брони' 
		const notVerifiedBookText = languageId === 0 ? 'Booking confirmation on request' : 'Подтверждение брони по запросу' 
		const params = queryString.parse(this.props.location.search) || {};
		const compariumIds = this.state.comparingSanatoriums.map(item => item.id);
		const compareSeacrhStr = queryString.stringify(Object.assign({}, params, { ids: compariumIds}));
		const { diseasesProfiles, facilitiesNames, treatmentBaseNames, room_details_names, dataLoaded } = this.props.asyncData;
		const roomsParams = params.rooms ? JSON.parse(params.rooms) : {}
		const { sanatoriums } = this.state;
		console.log(sanatoriums)

		return(	
            <div>
                <Row>
                    <Col xs={12} xl={4}>			
                        <BookingForm />

                        <Filters 
                            languageId={languageId} 
                            currencyId={currencyId}
                            currencyRates={this.props.search.currencyRates}  
                            diseasesProfilesNames={diseasesProfiles}
                            treatmentBaseNames={treatmentBaseNames}
                            facilitiesNames={facilitiesNames}
                            roomDetailsNames={room_details_names}
                            params={this.props.location.search}/>                    
                    </Col> 
                    
                    <Col xs={12} xl={8} style={{ marginTop: 15 }} className='center'>
		 				<Hidden xs sm>
		 					<hr style={{ margin: 0, borderTop: '2px solid rgba(82, 82, 82, 0.39)' }}/>
							<Row>
								<Col className='row-sort'>
									<ul>
										<li><p style={{ margin: 0 }}>{ languageId === 0 ? 'Sort by:' : 'Сортировать по:' }</p></li>
										<li className={ this.state.activeSort === 'recomendations' ? 'row-sort-active' : ''} onClick={ () => this.sortSanatoriums('recomendations') }>
											{ languageId === 0 ? 'Our recomendations' : 'Мы рекомендуем' }
										</li>
										<li className={ this.state.activeSort === 'price' ? 'row-sort-active' : ''} onClick={ () => this.sortSanatoriums('price') }>
											{ languageId === 0 ? 'Lowest price' : 'Самая низкая цена ' }
										</li>
										<li className={ this.state.activeSort === 'treatment' ? 'row-sort-active' : ''} onClick={ () => this.sortSanatoriums('treatment') }>
											{ languageId === 0 ? 'Treatment rating' : 'Рейтинг лечения' }
										</li>
										<li className={ this.state.activeSort === 'general' ? 'row-sort-active' : ''} onClick={ () => this.sortSanatoriums('general') }>
											{ languageId === 0 ? 'General rating' : 'Общий рейтинг' }
										</li>
										<li className={ this.state.activeSort === 'discount' ? 'row-sort-active' : ''} onClick={ () => this.sortSanatoriums('discount') }>
											{ languageId === 0 ? 'Discount rate' : 'Уровень скидки' }
										</li>
									</ul>
								</Col>
							</Row>
						</Hidden>		 				
						<Visible xs sm>
							<Row style={{margin: 0}}>
								<Col xs={4}>
									<p style={{marginTop: 7, fontSize: 20, color: '#353535'}}>{languageId === 0 ? 'Sort by' : 'Сортировать'}</p>
								</Col>
								<Col xs={8}>
									<SelectField
										fullWidth
										value={this.state.activeSort}
										onChange={(e,i,value) => this.sortSanatoriums(value)}
									>
										<MenuItem value='recomendations' primaryText={ languageId === 0 ? 'Our recomendations' : 'Мы рекомендуем' } />
										<MenuItem value='price' primaryText={ languageId === 0 ? 'Lowest price' : 'Самая низкая цена ' } />
										<MenuItem value='treatment' primaryText={ languageId === 0 ? 'Treatment rating' : 'Рейтинг лечения' } />
										<MenuItem value='general' primaryText={ languageId === 0 ? 'General rating' : 'Общий рейтинг' } />
										<MenuItem value='discount' primaryText={ languageId === 0 ? 'Discount rate' : 'Уровень скидки' } />
									</SelectField>								
        						</Col>
							</Row>
						</Visible>
						<div id='sanatoriums'>
						{dataLoaded ?
						<Row>
							{sanatoriums.length ? 
									
								<Col>
									{
										this.state.comparingSanatoriums.length 
										?	<Row id='comparingBlock' style={{ padding: '5px 10px', marginBottom: 30, marginLeft: 0, marginRight: 0, textAlign: 'center' }}>
												<h4 style={{ color: '#303030', textDecoration: 'underline' }}>{languageId === 0 ? 'Selected sanatoriums' : 'Выбранные санатории'}</h4>
												{ 
													this.state.comparingSanatoriums.map( (sanatorium, index) =>
														<Col xs={3}>
															<div className='add-comparing' key={index}>
																<p>{languageId === 0 ? sanatorium.h_sname : sanatorium.h_sname}</p>
																<i className='fa fa-trash-o' aria-hidden='true' onClick={ () => this.removeFromCompare(sanatorium.id) }></i>
																<img src={sanatorium.avatar || '/images/image-not-found.jpg'} style={{ borderRadius: '0px 0px 5px 5px', height:100, width:150 }} />
															</div>
														</Col>
													)
												}
												<Col xs={3} style={{ bottom: '-65px' }}>
													<RaisedButton
														label={ languageId === 0 ? 'Compare' : 'Сравнить' } 
														containerElement={
															<Link to={{
																pathname: `/comparing`,
																search: compareSeacrhStr
															}} />
														}/>
												</Col>
											</Row>
										: '' 
									}
									<Snackbar
										open={this.state.showAddingToCompare}
										message={ 
											<span style={{ color: 'white' }}>
												{ languageId === 0 
													? this.state.comparingSanatoriums.length + '/ 3 in comparing'							          	
												: this.state.comparingSanatoriums.length + '/ 3 в сравнении'}
											</span>
										}
										action={<ArrowUpward color='#f3be19' onClick={ () => $('html, body').animate({ scrollTop: $('#comparingBlock' ).offset().top - 100 }, 1000) }/>}
										autoHideDuration={6000}
										onRequestClose={ () => this.setState({ showAddingToCompare : false })}
										bodyStyle={{ height: 40, color: 'white' }}/>

									<div>
									{sanatoriums.map( (sanatorium,index) => 
										<div> 
											<Hidden xs sm >
												<div key={index} className='hotel-block'>
													<div className='hotel-left'>
														<div style={{ paddingLeft: 25 }}>
															<Link to={{ pathname :`/sanatorium`, search: this.props.location.search + `&country=${sanatorium.country}&city=${sanatorium.kurort}&id=${sanatorium.id}` }}>
															<p className='hotel-title'>{languageId === 0 ? sanatorium.h_sname : sanatorium.h_sname}  { stars[sanatorium.h_stars-1] }</p></Link>
															{
																!_.find(this.state.comparingSanatoriums, { id : sanatorium.id })  
																?	this.state.comparingSanatoriums.length < 3 
																	?	<IconButton 
																			tooltip={ languageId === 0 ? 'Add to compare' : 'Добавить к сравнению' }
																			data-id={sanatorium.id} 
																			onClick={ () => this.addToCompare(sanatorium.id) }
																			iconClassName="fa fa-balance-scale" 
																			iconStyle={{ fontSize: 20 }}/>
																	: ''

																:	<IconButton 
																		tooltip={ languageId === 0 ? 'Remove from comparing' : 'Убрать из сравнения' }
																		data-id={sanatorium.id} 
																		onClick={ () => this.removeFromCompare(sanatorium.id) }
																		iconClassName="fa fa-balance-scale gold" 
																		iconStyle={{ fontSize: 20 }}/>
															}
														</div>										
														<div style={{ position: 'relative' }}>
															<img src={ sanatorium.avatar || '/images/image-not-found.jpg'} onError={ this.handleFailLoadImage } alt={ `${sanatorium.name}, ${sanatorium.room}`}/>
															{ sanatorium.chipest_room && sanatorium.chipest_room.map( room =>
																room.percent < 0
																	?	<span className='discount-banner'>
																			{`${parseFloat(room.percent).toFixed(1)} %`}
																		</span>
																	:	<span className='raising-price discount-banner' style={{ display: 'none' }}>
																			{`+${parseFloat(room.percent).toFixed(1)} %`}
																		</span>
																: ''
															)}
														</div>

														<div className='hotel-room'>
															<b style={{ paddingLeft: 40 }}>{ languageId === 0? 'Main profile of treatment:' : 'Основной профиль лечения:' }</b>  
															<ul className='list-treatment' style={{ textAlign: 'left' }}>
																{ 
																	sanatorium.treatments_profiles 
																	? 	sanatorium.treatments_profiles.map( (profile,key) => <li key={key}>{ languageId === 0 ? profile.name : profile.name_ru }</li>)
																	: 	<p>{ languageId === 0 ? 'No treatment profile': 'Нет профиля лечения'}</p> 
																}
															</ul>
														</div>
														<div className='hotel-room'>
															<b style={{ paddingLeft: 40 }}>{ languageId === 0? 'Room: ': 'Номер: ' }</b> 
															<p style={{ color: '#55c908', textAlign: 'left' }}> 
																{sanatorium.chipest_room.length ?
																	<ul className='list-treatment'>
																	  {sanatorium.chipest_room.map( (room,i) =>
																		<li>
																			{room.max_adults > 3
																				?	<span style={{ float:'left', color: '#55c908', paddingRight: 10 }}><i className="fa fa-male" aria-hidden="true"/> x { room.max_adults }</span>
																				: 	guest[roomsParams[i].adults -1]
																			}
																			{room.sname}
																		</li>															
																	  )}
																	</ul>
																  : <span style={{ display: 'flex', paddingLeft: 40, color: '#ff0600' }}>
																  		{languageId === 0 ? 'No available rooms for the selected dates' : 'Нет свободных номеров на выбранные даты'}
																  	</span>
																 }
															</p>
														</div>
														<div className='hotel-facilities center'>
															<hr style={{ width: '80%', borderTop: '1px solid #9d9d9d' }}/>
															<h4>{ languageId === 0 ? 'The price includes' : 'В цену включено'}</h4>
															{sanatorium.chipest_room.map( (room,index) =>
															<Row style={{ marginTop: 20 }}>
																<Col>
																	{sanatorium.chipest_room.length > 1 &&
																		<p>{languageId === 0 ? `Room ${index+1} - ${room.sname}` : `Номер ${index+1} - ${room.sname}`}</p>}
																</Col>
																<Col xs={3}>
																	<i className="fa fa-cutlery fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ room && room.meal_plan && room.meal_plan.length || 0 }
																	<p>{ languageId === 0 ? 'meal' : 'питание'}</p>
																</Col>
																<Col xs={3}>
																	<i className="fa fa-shower fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ room && room.daily_procedures || 0 }
																	<p>{ languageId === 0 ? 'procedures' : 'процедуры'}</p>
																</Col>
																<Col xs={3}>
																	<i className="fa fa-user-md fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ room && room.daily_doctor_vis || 0 }
																	<p>{ languageId === 0 ? 'doctors visits' : 'осмотр врача'}</p>
																</Col>
																<Col xs={3}>
																	<i className="fa fa-sign-language fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ room && room.daily_physioter || 0 }
																	<p>{ languageId === 0 ? 'physioterapia' : 'физиотерапия'}</p>
																</Col>
															</Row>
															)}
														</div>
													</div>
													<div className='hotel-right center'>
														<div className="sanatorium_rating">
															<div className="graph">
																<div className="graph1" style={{ height: `${sanatorium.general_rating*10}%` }}><span>{ sanatorium.general_rating ? parseFloat(sanatorium.general_rating).toFixed(1) : '0.0' }</span></div>
																<div className="graph2" style={{ height: `${sanatorium.general_rating*10}%` }}><span>{ sanatorium.treatment_rating ? parseFloat(sanatorium.treatment_rating).toFixed(1) : '0.0' }</span></div>
															</div>
															<div className="table">
																<div className="table1">{ languageId === 0 ? 'general rating' : 'общий рейтинг' }</div>
																<div className="table2">{ languageId === 0 ? 'treatment rating' : 'рейтинг лечения' }</div>
															</div>
															<Link to={{ pathname : '/sanatorium', search: this.props.location.search + `&country=${sanatorium.country}&city=${sanatorium.kurort}&id=${sanatorium.id}` }}>{ languageId === 0 ? `Reviews: ${sanatorium.reviews_count}` : `Отзывы: ${sanatorium.reviews_count}` }</Link>
														</div>
														<div style={{ marginTop: 100, textAlign: 'center' }}>
														  <div className='center'>
															<div className='discount'>

															  <p style={{ margin: 0, fontSize: 14, color: '#fabd00' }}>
															  {languageId === 0 ? `${sanatorium.chipest_room.length} room(s), ${params.nights} night(s)` : `${sanatorium.chipest_room.length} номер(а), ${params.nights} ночь(и)`}
															  </p>															
															  {sanatorium.chipest_room.length ?
																sanatorium.chipest_room.map( room =>
																	<div>
																		<p className='noDiscount' style={room.percent < 0 ? { margin: 0 } : { margin: 0, display: 'none' } }>
																			{room.percent < 0 ? ` ${room.default_price[currencyId]} ${currency[currencyId]} ` : ``}
																		</p>
																		<p style={{ margin: 0 }}>{ 
																			` ${room.price_with_discount && room.price_with_discount[currencyId] || room.default_price[currencyId]} 
																			  ${currency[currencyId]} ` 
																		}</p>															
																		<p style={{ margin: 0, fontSize: 14, color: '#fabd00' }}>{ 
																			params.shareRoom == 'true'
																			? ( languageId === 0 ? 'You pay 50% of the amount' : 'Вы платите 50% от суммы' )
																			: ''
																		}</p>															
																	</div>
																)
															  : <p style={{ color: '#ff0600' }}>
															  		{ languageId === 0 ? 'No available rooms for the selected dates' : 'Нет свободных номеров на выбранные даты'}
															  	</p>
															  }																		
															</div>
														  </div> 									
														</div>
														<div style={{ position: 'absolute', bottom: 0, right: 0, textAlign: 'center' }}>
															<RaisedButton
																containerElement={ <Link to={{ pathname : `/sanatorium`, search: this.props.location.search + `&country=${sanatorium.country}&city=${sanatorium.kurort}&id=${sanatorium.id}` }} /> }
																label={languageId === 0 ? 'Choose room' : 'Выбрать номер'}
																style={{ marginBottom: 15, width: 'calc(100% - 30px)' }} />										
															{
																sanatorium.isAutoBookingApprove
																	? <VerifiedUser id='autoBook' color='#55c908' style={{ float: 'right', margin: 7 }}/>
																	: <WatchLater id='autoBook' color='#f3be19' style={{ float: 'right', margin: 7 }}/>
															}
															<p id='autoBookText'>
																{ sanatorium.isAutoBookingApprove ? verifiedBookText : notVerifiedBookText }
															</p>
														</div>
													</div>
												</div>
											</Hidden>

											<Visible xs sm >
												<div key={index} className='hotel-block' style={{ margin: 10 }}>
													<div className='hotel-mobile'>
														<div style={{ padding: 25 }}>
															<Link to={{ pathname :`/sanatorium`, search: this.props.location.search + `&country=${sanatorium.country}&city=${sanatorium.kurort}&id=${sanatorium.id}` }}>
															<p className='hotel-title'>{languageId === 0 ? sanatorium.h_sname : sanatorium.h_sname}  { stars[sanatorium.h_stars-1] }</p></Link>
														</div>										
														<div style={{ position: 'relative', width: '100%' }}>
															<img src={ sanatorium.avatar || '/images/image-not-found.jpg'} onError={ this.handleFailLoadImage } alt={ `${sanatorium.name}, ${sanatorium.room}`}/>
															{ sanatorium.chipest_room && sanatorium.chipest_room.percent
																?	sanatorium.chipest_room.percent < 0
																	?	<span className='discount-banner'>
																			{`${parseFloat(sanatorium.chipest_room.percent).toFixed(1)} %`}
																		</span>
																	:	<span className='raising-price discount-banner' style={{ display: 'none' }}>
																			{`+${parseFloat(sanatorium.chipest_room.percent).toFixed(1)} %`}
																		</span>
																: ''
															}
														</div>
														
														<div>
						
															<div style={{ marginTop: 20, marginBottom: 10, textAlign: 'center' }}>
																{sanatorium.chipest_room.length ?
																	<div style={{ background: '#057bb2' }}>
																		<div className='discount'>
																			<p style={{ margin: 0, fontSize: 14, color: '#fff'  }}>
																			{languageId === 0 ? `${sanatorium.chipest_room.length} room(s), ${params.nights} night(s)` : `${sanatorium.chipest_room.length} номер(а), ${params.nights} ночь(и)`}
																			</p>
																			{sanatorium.chipest_room.map( room =>
																				<div>
																					<p className='noDiscount' style={ sanatorium.chipest_room.percent && sanatorium.chipest_room.percent < 0 ? { margin: 0, color: '#fff'  } : { margin: 0, display: 'none', color: '#fff'  } }>
																					  {room.percent < 0 ? ` ${room.default_price[currencyId]} ${currency[currencyId]} ` : ``}
																					</p>
																					<p style={{ margin: 0, color: '#fff' }}>{ 
																						` ${room.price_with_discount && room.price_with_discount[currencyId] || room.default_price[currencyId]} 
																						  ${currency[currencyId]} ` 
																					}</p>																					
																				</div>
																			)}
																			<p style={{ margin: 0, fontSize: 14, color: '#fff' }}>{ 
																				params.shareRoom == 'true'
																				? ( languageId === 0 ? 'You pay 50% of the amount' : 'Вы платите 50% от суммы' )
																				: ''
																			}</p>															
																		</div>
																	</div> 
																  : <p style={{ color: '#ff0600' }}>
																  		{ languageId === 0 ? 'No available rooms for the selected dates' : 'Нет свободных номеров на выбранные даты'}
																  	</p>
																}
															</div>
															<RaisedButton
																fullWidth
																containerElement={ <Link to={{ pathname : `/sanatorium`, search: this.props.location.search + `&country=${sanatorium.country}&city=${sanatorium.kurort}&id=${sanatorium.id}` }} /> }
																label={languageId === 0 ? 'Choose room' : 'Выбрать номер'}
																style={{ marginBottom: 15, width: 'calc(100% - 30px)' }} />										
														</div>
														
														<Row>
															<Col xs={6}>
																<p style={{ color: '#097db3' }}>{ languageId === 0 ? `general rating: ${sanatorium.general_rating ? parseFloat(sanatorium.general_rating).toFixed(1) : '0.0'}` : `общий рейтинг: ${sanatorium.general_rating ? parseFloat(sanatorium.general_rating).toFixed(1) : '0.0'}` }</p>
															</Col>
															<Col xs={6}>
																<p style={{ color: '#55c908' }}>{ languageId === 0 ? `treatment rating: ${ sanatorium.treatment_rating ? parseFloat(sanatorium.treatment_rating).toFixed(1) : '0.0' }` : `рейтинг лечения: ${ sanatorium.treatment_rating ? parseFloat(sanatorium.treatment_rating).toFixed(1) : '0.0' }` }</p>
															</Col>
														</Row>

														<div className='hotel-room'>
															<b style={{ paddingLeft: 40 }}>{ languageId === 0? 'Main profile of treatment:' : 'Основной профиль лечения:' }</b>  
															<ul className='list-treatment' style={{ textAlign: 'left' }}>
																{ 
																	sanatorium.treatments_profiles 
																	? 	sanatorium.treatments_profiles.map( (profile,key) => <li key={key}>{ languageId === 0 ? profile.name : profile.name_ru }</li>)
																	: 	<p>{ languageId === 0 ? 'No treatment profile': 'Нет профиля лечения'}</p> 
																}
															</ul>
														</div>
														<div className='hotel-room'>
															<b style={{ paddingLeft: 40 }}>{ languageId === 0? 'Room: ': 'Номер: ' }</b> 
															<p style={{ color: '#55c908', textAlign: 'left' }}> 
																{ sanatorium.chipest_room ?
																	<ul className='list-treatment'>
																		<li>
																			{ sanatorium.chipest_room.max_adults > 3
																				?	<p style={{ float:'left', color: '#55c908', paddingRight: 10 }}><i className="fa fa-male" aria-hidden="true"/> x { sanatorium.chipest_room.max_adults }</p>
																				: 	guest[params.adults -1]
																			}
																			{ languageId === 0 ? sanatorium.chipest_room.sname : sanatorium.chipest_room.sname }
																		</li>															
																	</ul>
																  : <p style={{ display: 'flex', paddingLeft: 40, color: '#ff0600' }}>
																  		{ languageId === 0 ? 'No available rooms for the selected dates' : 'Нет свободных номеров на выбранные даты'}
																  	</p>
																}
															</p>
														</div>

														<div className='hotel-facilities center'>
															<hr style={{ width: '80%', borderTop: '1px solid #9d9d9d' }}/>
															<h4>{ languageId === 0 ? 'The price includes' : 'В цену включено'}</h4>
															<Row style={{ marginTop: 20 }}>
																<Col xs={6}>
																	<i className="fa fa-cutlery fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ sanatorium.chipest_room && sanatorium.chipest_room.meal_plan && sanatorium.chipest_room.meal_plan.length || 0 }
																	<p>{ languageId === 0 ? 'meal' : 'питание'}</p>
																</Col>
																<Col xs={6}>
																	<i className="fa fa-shower fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ sanatorium.chipest_room && sanatorium.chipest_room && sanatorium.chipest_room.daily_procedures || 0 }
																	<p>{ languageId === 0 ? 'procedures' : 'процедуры'}</p>
																</Col>
															</Row>
															<Row>
																<Col xs={6}>
																	<i className="fa fa-user-md fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ sanatorium.chipest_room && sanatorium.chipest_room && sanatorium.chipest_room.daily_doctor_vis || 0 }
																	<p>{ languageId === 0 ? 'doctors visits' : 'осмотр врача'}</p>
																</Col>
																<Col xs={6}>
																	<i className="fa fa-sign-language fa-2x" aria-hidden="true" style={{ marginRight: 7 }}></i>
																	x{ sanatorium.chipest_room && sanatorium.chipest_room && sanatorium.chipest_room.daily_physioter || 0 }
																	<p>{ languageId === 0 ? 'physioterapia' : 'физиотерапия'}</p>
																</Col>
															</Row>
														</div>
													</div>
												</div>
											</Visible>												
										</div>
									)}
									</div>
								</Col>
							:
								<Col style={{ padding: 20 }} className='center'>
									<div>
									{ languageId === 0 
										? <h3> Nothing found. Try changing search parameters </h3>
										: <h3> Ничего не найдено. Попробуйте изменить параметры поиска </h3>
									}
									</div>
								</Col>							
							}				
						</Row>
						: 	<div>
								<h3>{languageId === 0 ? 'Loading...' : 'Загрузка...'}</h3>
							</div>
						}					
					</div>
				  </Col>
				</Row>
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

const mapStateToProps = ({ profile, page, search, asyncData }) => ({
  profile,
  page,
  search,
  asyncData,
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);