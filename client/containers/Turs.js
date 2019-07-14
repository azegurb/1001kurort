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
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import Stage from 'react-stage';
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'

import BookingCalendar from '../components/BookingCalendar'

const subjects = require('../../api/tursData').subjects
const queryString = require('query-string');

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const settings = {
	autoplay: false,
	arrows: false,
	dots: false, 
	autoplaySpeed: 0,
	slidesToShow: 1,
	slidesToScroll: 1,
};

const TurBlockStyle = {

	container: {
		backgroundColor: '#FFF',
		border: '1px solid #9e9f9f',
		paddingLeft: 0,
		paddingRight: 0,
		margin: 15,
	},

	title: {
		height: 80,
		color: '#337ab7'
	},

	header__container: {
		paddingLeft: 15,
		paddingRight: 15,
	},

	package__header__details: {
		position: 'relative',
	},

	package__nights: {
		display: 'inline-block',
		fontWeight: 700,
	},

	stars: {
		position: 'absolute',
		left: '50%',
    	marginTop: 10,		
    	WebkitTransform: 'translate(-50%, -50%)',
		MsTransform: 'translate(-50%, -50%)',
		OTransform: 'translate(-50%, -50%)',
		transform: 'translate(-50%, -50%)',
		color: '#F8C007',
	},

	package__reviews: {
		float: 'right',
	},

	package__preview: {
		marginTop: 5,
    	position: 'relative',
    	height: 300,
    	display: 'table-cell',
    	verticalAlign: 'middle',
	},

	img__avatar: {
    	display: 'table-cell',
    	verticalAlign: 'middle',    	
    	width: '100%',
	},

	package__body: {
		padding: 15,
		paddingBottom: 0,
	},

	destination: {
		fontSize: 16,
	},

	package__includes: {
		marginTop: 20,
	},

	includes__item: {
		margin: 'auto',
		padding: 5,
		textAlign: 'center',
	},

	package__place: {
		display: 'inline-block',
		paddingLeft: 10,
	},

	package__price: {
		marginTop: 30,
		font: '900 12px "Lato"',
		textTransform: 'uppercase',
		color: '#474c44',
	},

	pullRight: {
		float: 'right',
	},

	small: {
		display: 'block',
		marginTop: 10,
		font: '13px "Arial"',
		textTransform: 'none',
	},

	price: {
		float: 'right',
		fontSize: 24,
		color: '#f3be19',
		display: 'inline-block',
		verticalAlign: 'middle',
		marginTop: -6,
	},

	discount: {
		color: '#aaa',
		fontSize: 16,
		marginRight: 10,
		float: 'none',
		textDecoration: 'line-through',
	},

	package__more: {
		marginTop: 20,
		padding: 15,
	},
}

const iconStyles = {
  smallIcon: {
    width: 36,
    height: 36,
  },
  mediumIcon: {
    width: 48,
    height: 48,
  },
  largeIcon: {
    width: 60,
    height: 60,
  },
  small: {
    width: 72,
    height: 72,
  },
  medium: {
    width: 96,
    height: 96,
  },
  large: {
    width: 120,
    height: 120,
  },
};

const initialState = {
	indexBgSlider: 0,
	tursTypes: subjects,
	arrivalDate : new Date(),
	departureDate : moment( new Date(), 'YYYY-MM-DD').add(1, 'd').toDate(),
	activeTursTypes: 0,
	adults: 2,
	childs: 0,
	babies: 0,	
}



class Turs extends Component { 
	  
    static fetchData({ store, params }) {
        return Promise.all([
            store.dispatch(actions.getTurs(store.getState().search.currencyRates)), 
        ])
    }

	constructor(props) {
		super(props);

		this.state = Object.assign({ turs: [], constTurs: [] }, initialState)
		
		this.initialiseState = ::this.initialiseState;
		this.confirmFilterTurs = ::this.confirmFilterTurs;
	}

	componentWillMount(){
		this.initialiseState()

        this.props.pageActions.updateIsLoadingPage(true);			
	}

	componentDidMount(){
        
        Promise.all([
			this.props.async.getTurs(this.props.search.currencyRates)
        ]).then( () => {
            this.props.pageActions.updateIsLoadingPage(false)
        })

		this.props.pageActions.setNavigationPathNames([{ label: ['Turs', 'Туры'], link: '/turs'}])
	}

	initialiseState() {
		let params = queryString.parse(this.props.location.search)

		if(!params) return;

		this.setState({ 
			arrivalDate: params.arrivalDate || this.state.arrivalDate,
			departureDate: params.departureDate || this.state.departureDate,
			adults: parseInt(params.adults) || this.state.adults,
			childs: parseInt(params.childs) || this.state.childs,
		})
	}

	confirmFilterTurs() {
		let turs = []

		if(this.state.activeTursTypes){
			turs = _.filter(this.state.constTurs, item => item.subjects.indexOf(this.state.activeTursTypes) > -1 )
			
			this.setState({ turs })
		}else{
			this.setState({ turs: this.state.constTurs })
		}
	}

	render() {
		const languageId = this.props.profile.languageId - 0;
		const currencyId = this.props.profile.currencyId - 0;
        const url = process.env.API_URL + this.props.location.pathname

		const searchState = {
			arrivalDate: moment(this.state.arrivalDate, 'YYYY-MM-DD').toDate(),
			departureDate: moment(this.state.departureDate, 'YYYY-MM-DD').toDate(),
			adults: this.state.adults,
			children: this.state.childs,
			babies: this.state.babies,		
		}
		const {turs} = this.props.asyncData; 
		console.log(this.state)

		return(	
			<div style={{ marginTop: 20, padding: 25, position: 'relative' }}>
                				
				<div id='bg__slider__turs' style={{
					position: 'absolute',
					top: 25,
					left: 0,
					width: '100%', 
					height: 400, 
					zIndex: 0, 
					backgroundImage: `url(${turs[this.state.indexBgSlider] && turs[this.state.indexBgSlider].avatar})`,
					backgroundSize: 'cover', 
				}} />

				<Hidden xs sm>
					<div style={{
						position: 'absolute',
						width: 'calc(100% - 20px)',
						height: 100,
						verticalAlign: 'middle',
						zindex: 6,
						left: 10,
						top: 175, 
					}}>
						
						<div style={{ float: 'right' }}>
							<IconButton 
								iconStyle={Object.assign(iconStyles.largeIcon, { border: '1px solid #fff', borderRadius: 60 })}
								style={iconStyles.medium}
								children={
									<ChevronRight color='#fff' hoverColor='#3594c0'/>
								} 
								onClick={ () => this.setState({ indexBgSlider: this.state.indexBgSlider === turs.length -1 ? 0 : this.state.indexBgSlider +1 }) }/>
						</div>
						<div style={{ float: 'left' }}>
							<IconButton 
								iconStyle={Object.assign(iconStyles.largeIcon, { border: '1px solid #fff', borderRadius: 60 })}
								style={iconStyles.medium}
								children={
									<ChevronLeft color='#fff' hoverColor='#3594c0'/>
								} 
								onClick={ () => this.setState({ indexBgSlider: this.state.indexBgSlider === 0 ? turs.length -1 : this.state.indexBgSlider -1 }) }/>
						</div>

					</div>
				</Hidden>

				<Row style={{ paddingTop: 70, paddingBottom: 20, background: '#e8e8e8', height: 400 }}>
					
					<Col xs={12} sm={12} md={5} lg={5} xl={5} offset={{ md: 1, lg: 1, xl: 1 }}>
						<div style={{ 
							padding: 10, 
							background: '#f3be19', 
							color: '#525252', 
							WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
							boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
							borderRadius: 3,
							zIndex: 5,
						}}>
						    <SelectField
                                    fullWidth
                                    hintText={ languageId === 0 ? 'Turs type' : 'Тип тура' }
                                    errorText={ this.state.errorActiveTursTypes && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                                    value={ this.state.activeTursTypes }
                                    onChange={ (e, i, value) => this.setState({ activeTursTypes: value }) }
                                  >
                                    <MenuItem value={0} primaryText={ languageId === 0 ? 'All turs' : 'Все туры' } />
                                    {
                                      this.state.tursTypes.map( (item, index) => 
                                        <MenuItem 
											key={item.id}
											value={item.id} 
											primaryText={ item.label[languageId] } />
                                      )
                                    }
                            </SelectField>								
							<div style={{ textAlign: 'center' }}>
								<BookingCalendar 
									languageId={languageId}
									showNights={false}
									updateDates={ (arrivalDate,departureDate, nights) => this.setState({ arrivalDate, departureDate, nights }) } />
							</div>
							<Row>
								<Col xs={6}>
									<SelectField
										fullWidth
										floatingLabelText={ languageId === 0 ? 'Adults' : 'Взрослых' }
										errorText={ this.state.errorAdults && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
										value={ this.state.adults }
										onChange={ (e, i, value) => this.setState({ adults: value }) }
									>
										<MenuItem value={1} primaryText={1}/>
										<MenuItem value={2} primaryText={2}/>
										<MenuItem value={3} primaryText={3}/>
										<MenuItem value={4} primaryText={4}/>
										<MenuItem value={5} primaryText={5}/>
										<MenuItem value={6} primaryText={6}/>
										<MenuItem value={7} primaryText={7}/>
										<MenuItem value={8} primaryText={8}/>
										<MenuItem value={9} primaryText={9}/>
										<MenuItem value={10} primaryText={10}/>
										<MenuItem value={11} primaryText={11}/>
										<MenuItem value={12} primaryText={12}/>
									</SelectField>									
								</Col>
								<Col xs={6}>
									<SelectField
										fullWidth
										floatingLabelText={ languageId === 0 ? 'Children' : 'Детей' }
										errorText={ this.state.errorChilds && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
										value={ this.state.childs }
										onChange={ (e, i, value) => this.setState({ childs: value }) }
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
									<SelectField
										fullWidth
										floatingLabelText={ languageId === 0 ? 'Babies' : 'Младенцов' }
										errorText={ this.state.errorBabies && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
										value={ this.state.babies }
										onChange={ (e, i, value) => this.setState({ babies: value }) }
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
							</Row>

							<RaisedButton
								fullWidth
								backgroundColor='#6f6f6f'
								labelStyle={{ color: '#fff' }}
								label={ languageId === 0 ? 'Confirm' : 'Подтвердить' }
								onClick={ this.confirmFilterTurs }/>
						</div>
					</Col>
				</Row>
				<Row style={{ textAlign: 'center', marginTop: 70, height: 60 }}>
					<Col>
						<Hidden xs sm>
							<div style={{ position: 'absolute', width: '1000%', left: '-450%', top: -70, background: '#efefef', WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}>
								<h1 style={{ color: '#55c901', margin: '40px 0' }} className='center'>
									{ languageId === 0 ? 'ONLINE BOOOKING TURS' : 'БРОНИРОВАНИЕ ТУРОВ ОНЛАЙН' }
								</h1>
							</div>
						</Hidden>
					</Col>
				</Row>
				<Row style={{ marginTop: 50 }}>
					{
						turs.length
						?	turs.map( item =>
								<Col md={6} xl={4}>
									<div style={TurBlockStyle.container}>
										<div style={TurBlockStyle.header__container}>
											<h2 style={TurBlockStyle.title}>{item.name}</h2>
											
											<div style={TurBlockStyle.package__header__details}>
												<div style={TurBlockStyle.package__nights}>
													<i className="fa fa-moon-o"></i> {item.days_plan}
												</div>

												<span style={TurBlockStyle.stars}>
												{ 
													item.stars === 1 && <b>&#9733;</b> ||
													item.stars === 2 && <b>&#9733;&#9733;</b> ||
													item.stars === 3 && <b>&#9733;&#9733;&#9733;</b> ||
													item.stars === 4 && <b>&#9733;&#9733;&#9733;&#9733;</b> ||
													item.stars === 5 && <b>&#9733;&#9733;&#9733;&#9733;&#9733;</b>
												}
												</span>
												
												<div style={TurBlockStyle.package__reviews}>
													<Link to={{ pathname: `/turs/${item.id}`, state: searchState }}>{ item.comments_count || '0' } { languageId === 0 ? 'comments' : 'комментариев'}</Link>
												</div>
											</div>
										</div>

										<div style={TurBlockStyle.package__preview}>
											<Link to={{ pathname: `/turs/${item.id}`, state: searchState }}>
												<img src={item.avatar} alt="" style={TurBlockStyle.img__avatar}/>
											</Link>
										</div>

										<div style={TurBlockStyle.package__body}>
											<div style={ TurBlockStyle.destination}>
												<i className="fa fa-map-marker" aria-hidden="true"></i>
												<div style={TurBlockStyle.package__place}>
													<span>
														{ item.arrival_map.vicinity}
														{ item.departure_map.vicinity !== item.arrival_map.vicinity ?
															` - ${item.departure_map.vicinity}` : ``
														}
													</span>
												</div>
											</div>

											<div style={TurBlockStyle.package__includes}>
												<p style={TurBlockStyle.package__price}>{ languageId === 0 ? 'Includes:' : 'Включено:' }</p>
												<Stage {...settings}>
													{ item.included.map( (includedItem, index) =>
															<div key={index} style={TurBlockStyle.includes__item}>
																{ includedItem.src !== 'undefined'
																	?	<img src={includedItem.img} />
																	: 	''
																}
																<p style={{ marginBottom: 0 }}>{includedItem.src != 'undefined' ? includedItem.label[languageId] : ''}</p>
															</div>
													)}
												</Stage>
											</div>

											<div style={TurBlockStyle.package__price}>
												<span>{ languageId === 0 ? 'PRICE FROM:' : 'ЦЕНА ОТ:' }</span>
												<div style={TurBlockStyle.pullRight}>
													{ item.discount_percent ? <span style={TurBlockStyle.discount}>{ item.totalPriceNoDiscount[currencyId] } { currency[currencyId] }</span> : '' }
													<span style={TurBlockStyle.price}>{ item.discount_percent ? item.totalPriceDiscount[currencyId] : item.totalPriceNoDiscount[currencyId] } { currency[currencyId] }</span>
												</div>

												<small style={TurBlockStyle.small}>{ languageId === 0 ? 'For one person with double occupancy' : 'За одного человека при двухместном заселении' }</small>
											</div>
										</div>

										<div style={TurBlockStyle.package__more}>
											<RaisedButton
												fullWidth
												containerElement={ <Link to={{ pathname: `/turs/${item.id}`, state: searchState }} />}
												label={ languageId === 0 ? 'More' : 'Подробнее' } 
												backgroundColor='#55c901' 
												labelStyle={{ color: '#fff' }} />
										</div>
									</div>
								</Col>
							)
						: ''
					}
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

export default connect(mapStateToProps, mapDispatchToProps)(Turs);