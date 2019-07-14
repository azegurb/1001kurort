 import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import { Link } from 'react-router-dom'
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton'
import io from 'socket.io-client';
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton';
import NumberFormat from 'react-number-format'
import MuiGeoSuggest from 'material-ui-geosuggest'
import axios from 'axios'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import SupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import TouchApp from 'material-ui/svg-icons/action/touch-app'
import Business from 'material-ui/svg-icons/communication/business'
import Chat from 'material-ui/svg-icons/communication/chat'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import MoneyOff from 'material-ui/svg-icons/editor/money-off'
import TagFaces from 'material-ui/svg-icons/image/tag-faces'
import ActionDoneall from 'material-ui/svg-icons/action/done-all'
import Call from 'material-ui/svg-icons/communication/call'
import _ from 'lodash'
import moment from 'moment'
import $ from 'jquery';

import BookingForm from '../components/forms/BookingForm'
import NewsBlock from '../components/NewsBlock'
import Shares from '../components/Shares'
import HomeActionTopBar from '../components/HomeActionTopBar'
import Filters from '../components/Filters'
import SearchByTreatment from '../components/SearchByTreatment'
import Search from './Search'
import crypto from 'crypto';
import queryString from 'query-string';




const mapStyle = {
    margin: 10,
    width: 'calc(100% - 20px)',
    height: 300,
    border: '1px solid #bbb9b9'
};

const initialState = {

    openInformUs: false,
    siteStats: {},
    siteStatsOnline: 0,
    newsData: [],
    diseasesProfiles: [],
    countries: [],
    kurorts: [],
    events: [],
};

class Home extends Component {
  
    static fetchData({ store, params }) {        
        return Promise.all([
            store.dispatch(actions.getCountriesAndKurorts()), 
            store.dispatch(actions.getDiseasesProfiles()), 
            store.dispatch(actions.getSiteEvents()), 
            store.dispatch(actions.getSiteStats()), 
        ])
    }

    constructor(props) {
        super(props);

        this.state =  initialState

        this.setOnlineCount = ::this.setOnlineCount;
        this.sputHover = ::this.sputHover;
        this.sputUnHover = ::this.sputUnHover;
        this.handleAdress = ::this.handleAdress;
        this.infromUsNameQuest = ::this.infromUsNameQuest;
        this.handleEmail = ::this.handleEmail;
        this.handlePhone = ::this.handlePhone;
        this.goSearch = ::this.goSearch;
    }

    componentWillMount(){
        this.props.pageActions.updateIsLoadingPage(true);
    }

    componentDidMount(){

        Promise.all([
            this.setOnlineCount(),
            this.props.async.getCountriesAndKurorts(),
            this.props.async.getSiteStats(),
            this.props.async.getDiseasesProfiles(),
            this.props.async.getSiteEvents()
        ]).then( () => {
            this.props.pageActions.updateIsLoadingPage(false)
        })
        
        this.props.pageActions.setNavigationPathNames([])

        /*if( window !== 'undefined'){
            let google = window.google,
                languageId = this.props.profile.languageId;

            axios.get(process.env.API_URL + '/api/map/get-hotels').then( response => {

                let values = { 

                      by_treatm: false, 
                      room: 1, 
                      adults: 2, 
                      childs: 0, 
                      childs_age: [], 
                      start_date: moment(new Date() ).format('YYYY-MM-DD'), 
                      end_date: moment( new Date(), 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD'),
                      nights: 1, 
                      before_arr: 0,
                      shareRoom: false,
                }   

                const stringified = queryString.stringify(values);
                
                response.data.data.map( (hotel,index) => {

                    var contentString = `
                        <div>
                            <h5>${hotel.h_sname}, ${hotel.h_stars} ${languageId === 0 ? 'stars' : 'звезд'}</h5>
                            <img src=${hotel.avatar} height='120' margin='auto' />
                            <div width='100%' margin='10'>
                                <a href=${'/sanatorium?' + stringified + `&country=${hotel.h_country_id}&city=${hotel.h_kurort_id}&id=${hotel.id}`} target='blank'>${languageId === 0 ? 'Go' : 'Перейти'}</a>
                            </div>
                        </div>
                    `

                    var infowindow = new google.maps.InfoWindow({
                      content: contentString
                    });

                    var marker = new google.maps.Marker({ 
                        title: (hotel.h_sname + `, ${hotel.h_stars} stars`), 
                        position: { lng: parseFloat(hotel.map_location && hotel.map_location.lng), lat: parseFloat(hotel.map_location && hotel.map_location.lat) }, 
                        map: this.map,
                        icon: 'images/hotel-map.png',
                    });

                    marker.addListener('click', function() {
                      infowindow.open(this.map, marker);
                    });

                })

            }).catch( err => console.log(err))              

            this.map = new google.maps.Map(this.refs.map, {
                center: {
                    lat: 48.858608,
                    lng: 2.294471
                },          
                zoom: 1
            });
        }
            */
    }

    componentWillUnmount(){
        let {socket} = this.state
        
        if(socket) socket.close() 
    }

    sputHover() {
        $('#sput-main').css('display', 'none')
        $('#sput-desription').css('display', 'block')
    }


    sputUnHover() {
        $('#sput-main').css('display', 'block')
        $('#sput-desription').css('display', 'none')
    }


    handleAdress(event, informUsAdress ) {
        this.setState({ informUsAdress, errorInformUsAdress : !Boolean(event.target.value ) })
    }

    infromUsNameQuest(event, infromUsNameQuest ) {
        this.setState({ infromUsNameQuest })
    }

    handleEmail(event, informUsEmail ) {
        this.setState({ informUsEmail })
 	}

    handlePhone(event, informUsPhone ) {
        this.setState({ informUsPhone, errorInformUsPhone : !Boolean(event.target.value.length === 18 ) })
    }

    goSearch(k_id, kur_or_san) {

        let values = { 
            by_treatm: false,
            kur_or_san: kur_or_san, 
            k_id: k_id, 
            rooms: JSON.stringify([{adults: 2, childs: 0, childs_age: []}]), 
            start_date: moment(new Date() ).format('YYYY-MM-DD'), 
            end_date: moment( new Date(), 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD'),
            nights: 1, 
            before_arr: 0,
            shareRoom: false,
        }   

        const stringified = queryString.stringify(values);
        
        this.props.history.push({ pathname: '/search', search: stringified })
    }

    setOnlineCount() {
        
        const socket = io.connect();

        socket.on('count', msg => { 
            this.setState({ siteStatsOnline: msg.online, socket })
        })
    }

    render() {
        const languageId = this.props.profile.languageId - 0;
        const currencyId = this.props.profile.currencyId - 0;
        const url = process.env.API_URL + this.props.location.pathname
        const {siteStats, events, diseasesProfiles, countries, kurorts } = this.props.asyncData;

        return(
            <div>

                <Row>
                    <Col xs={12} xl={4}>
                        <BookingForm 
                            languageId={ languageId } 
                            additionalSearchFilters={this.state.additionalSearchFilters}/>

                        <Hidden xs sm md>
                            <Paper zDepth={1} className='paper' style={{ border: '1px solid #bbb9b9', marginTop: 30, marginBottom: 30 }}>
                                <NewsBlock languageId={ languageId} events= {events}/>
                            </Paper>

                            
                            {/*<div>
                                <div id='google-maps'>    
                                    <div id='google-map' ref='map' style={mapStyle}>this map show hotels and sanatoriums</div>
                                </div>
                            </div>*/}

                            <Paper zDepth={1} className='paper' style={{ border: '1px solid #bbb9b9', textAlign: 'left', marginTop: 30 }}>
                                <Row>                      
                                    <Col xs={12}>
                                        <SupervisorAccount style={{ float: 'left', background: '#55c901', borderRadius: 250, height: 60, width: 60, color: 'white' }}/>
                                        <p style={{ float: 'left', fontSize: 40, color: '#f3be19', lineHeight: '60px' , padding: '0px 15px' }}>{this.state.siteStatsOnline || 0 }</p>
                                        <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: '1em 0' }}>
                                            { languageId === 0 ? ` choosing sanatoriums right now` : ` выбирают санатории прямо сейчас`}
                                        </p>
                                    </Col>
                                    <Col xs={12}>
                                        <Business style={{ float: 'left', background: '#55c901', borderRadius: 250, height: 60, width: 60, color: 'white' }}/>
                                        <p style={{ float: 'left', fontSize: 40, color: '#f3be19', lineHeight: '60px' , padding: '0px 15px' }}>{siteStats.total_hotels || 0 }</p>
                                        <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: '1em 0' }}>
                                            { languageId === 0 ? ` sanatoriums around the world` : ` санаториев по всему миру`}
                                        </p>
                                    </Col>
                                    <Col xs={12}>
                                        <Chat style={{ float: 'left', background: '#55c901', borderRadius: 250, height: 60, width: 60, color: 'white' }}/>
                                        <p style={{ float: 'left', fontSize: 40, color: '#f3be19', lineHeight: '60px' , padding: '0px 15px' }}>{siteStats.total_reviews || 0 }</p>
                                        <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: '1em 0' }}>
                                            { languageId === 0 ? ` reviews you can trust` : ` отзывов которым можете доверять`}
                                        </p>
                                    </Col>
                                    <Col xs={12}>
                                        <TouchApp style={{ float: 'left', background: '#55c901', borderRadius: 250, height: 60, width: 60, color: 'white' }}/>
                                        <p style={{ float: 'left', fontSize: 40, color: '#f3be19', lineHeight: '60px' , padding: '0px 15px' }}>{siteStats.total_bookings || 0 }</p>
                                        <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: '1em 0' }}>
                                            { languageId === 0 ? ` bookings made by people` : ` бронирований`}
                                        </p>
                                    </Col>
                                </Row>
                            </Paper>                                   
                        </Hidden>

                        <Paper zDepth={1} className='paper' style={{ border: '1px solid #bbb9b9', textAlign: 'left', marginTop: 30 }}>
                            <Row>                      
                                <Col xs={12} className='center'>
                                    <h2 style={{ color: '#525252' }}>{ languageId === 0? 'Why us? ' : 'Почему мы?' }</h2>
                                </Col>
                                <Col xs={12}>
                                    <MoneyOff style={{ float: 'left', marginRight: 15, height: 45, width: 45, color: '#55c901' }}/>
                                    <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: 10 }}>
                                        { languageId === 0 ? 'Prices are lower than in travel agencies' : 'Цены ниже чем в турагенствах' }
                                    </p>
                                </Col>                                            
                                <Col xs={12}>
                                    <TagFaces style={{ float: 'left', marginRight: 15, height: 45, width: 45, color: '#55c901' }}/>
                                    <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: 10 }}>
                                        { languageId === 0 ? 'Flexible pricing conditions' : 'Гибкие ценовые условия' }
                                    </p>
                                </Col>
                                <Col xs={12}>
                                    <ActionDoneall style={{ float: 'left', marginRight: 15, height: 45, width: 45, color: '#55c901' }}/>
                                    <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: 10 }}>
                                        { languageId === 0 ? 'Сhecked sanatoriums' : 'Проверенные санатории' }
                                    </p>
                                </Col>
                                <Col xs={12}>
                                    <Call style={{ float: 'left', marginRight: 15, height: 45, width: 45, color: '#55c901' }}/>
                                    <p style={{ fontSize: '18px', color: '#7d7d7d', height: '60px', padding: 10 }}>
                                        { languageId === 0 ? 'Free medical consultation' : 'Бесплатная консультация врача' }
                                    </p>
                                </Col>
                            </Row>                                        
                        </Paper>                                                                    

                    </Col> 
                    <Col xs={12} xl={8} style={{ marginTop: 10 }}>
                        <Row>
                            <Col>
                                <Hidden xs sm>
                                    <HomeActionTopBar
                                        languageId={languageId}
                                        history={this.props.history} />
                                </Hidden>
                                <Visible xs sm>
                                    <Paper zDepth={1} style={{ margin: '5px 15px', padding: 0 }}>
                                        <div style={{ height: 300 }}>                   
                                            <Shares languageId={languageId} history={this.props.history} />
                                        </div>
                                    </Paper>
                                </Visible>
                            </Col>
                        </Row>
                        <Hidden xs sm md>
                            <Row>
                                <Col>
                                    {countries && countries.map( (country, index) =>

                                            <Col xs={12} md={6} key={index} className='country-div'>
                                                <div style={{ margin: 'auto', maxWidth: 350 }}>
                                                    <img src={country.image} />
                                                    <div className="spec-text">
                                                        { languageId === 0 ? country.country : country.country_ru }
                                                    </div>
                                                    { 
                                                        country.cities.length &&
                                                        <div className="country-cities">                                                                                                       
                                                        {
                                                            country.cities.map( (city, cityIndex) =>
                                                                    <a onClick={() =>this.goSearch(city.id, city.kurort)}>
                                                                        <p>{ languageId === 0 ? city.kurort : city.kurort_ru }</p>
                                                                    </a>
                                                            )
                                                        }
                                                        </div>
                                                    }                                                            
                                                </div>
                                            </Col>
                                    )}
                                </Col>
                            </Row>
                        </Hidden>
                        <Row className='center'>

                            <Col>
                                <Col xs={12} lg={6} style={{ padding: 15 }}>
                                    
                                    <div 
                                        style={{ height: 300, background: '#fff', border: '1px solid #bbb9b9', padding: 40, cursor: 'pointer' }} 
                                        onClick={ () => this.setState({ openInformUs: true })}
                                    >
                                        <img src='/images/24-hours.png' />
                                        <h3>{ languageId === 0 ? 'Do you want to be the first to know about discounts and promotions in the resort you are interested in?' : 'Хотите первыми узнавать о скидках и акциях в интересующем вас курорте?' }</h3>
                                    </div>
                                    
                                    <Dialog
                                        title={ languageId === 0 ? 'Save my contacts' : 'Сохранить мои контакты' }
                                        actions={[
                                            <FlatButton
                                                label={ languageId === 0 ? 'Cancel' : 'Отменить'}
                                                onClick={ () => this.setState({ openInformUs: false }) }/>,
                                            <FlatButton
                                                label={ languageId === 0 ? 'Send' : 'Отправить'}
                                                onClick={ () => this.setState({ openInformUs: false }) }/>,
                                        ]}
                                        modal={false}
                                        open={this.state.openInformUs}
                                        onRequestClose={ () => this.setState({ openInformUs: false }) }
                                    >
                                    <Row>
                                        <Col>
                                            <div style={{ display: 'relative' }}>
                                                <i className='fa fa-search fa-2x' aria-hidden='true' style={{ position: 'absolute', top: 35, fontSize: 21 }}></i>
                                                <MuiGeoSuggest
                                                    fullWidth
                                                    options={{
                                                        types: ['establishment', 'geocode']
                                                    }}
                                                    floatingLabelText={languageId === 0 ? 'Address' : 'Адрес'}                       
                                                    errorText={this.state.errorInformUsAdress && ( languageId === 0 ? 'Invalid value' : 'Неверное значение')}
                                                    onChange={::this.handleAdress} 
                                                    floatingLabelStyle={{ paddingLeft: 40 }}
                                                    inputStyle={{ paddingLeft: 40 }}  />
                                            </div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col md={6}>
                                            <TextField 
                                                fullWidth
                                                floatingLabelText={languageId === 0 ? 'Contact number' : 'Моб. телефон'}
                                                errorText={ this.state.errorInformUsPhone && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                                            >
                                                <NumberFormat
                                                  value={ this.state.informUsPhone && this.state.informUsPhone.formattedValue } 
                                                  format='+##(###)-##-##-###' 
                                                  onChange={ ::this.handlePhone }/>
                                            </TextField>
                                        </Col>
                                        <Col md={6}>
                                            <TextField 
                                                fullWidth
                                                floatingLabelText={ languageId === 0 ? 'Your mail' : 'Ваш email' }
                                                onChange={ this.handleEmail } />                                

                                        </Col>
                                      </Row>
                                    </Dialog>

                                </Col>

                                <Col xs={12} lg={6} style={{ padding: 15 }}>
                                    <div 
                                        style={{ height: 300, background: '#fff', border: '1px solid #bbb9b9', padding: 40 }}
                                        onMouseOver={ this.sputHover }
                                        onMouseOut={ this.sputUnHover}
                                    >
                                        <div id='sput-main'>
                                            <img src='/images/sputnik.png' />
                                            <h3>{ languageId === 0 ? 'The program Funny mate»' : 'Программа «Веселый спутник»' }</h3>
                                        </div>
                                        <div id='sput-desription' style={{ display: 'none' }}>
                                            <p style={{ textAlign: 'justify', fontSize: 14, overflow: 'hidden' }}>
                                                {
                                                    languageId === 0
                                                        ? 'Don\'t like to travel and is treated alone, but with this you can not find the person with whom to go to the resort? Then our program "SPRING SATELLITE", just for you! We will help you to find the person who will make you a company. You will get a fellow traveler, an interlocutor and possibly a friend. And most importantly, a joint organization of rest and treatment will allow you to save on travel and transfer.' 
                                                        : 'Не любите путешествовать и лечится в одиночестве? Тогда наша программа «ВЕСЕЛЫЙ СПУТНИК» поможет вам  приобрести попутчика, собеседника, а возможно и друга. А главное, совместная организация отдыха и лечения позволит вам сэкономить на расходах.'

                                                }
                                            </p>
                                            <Link to='/funny_satellite'>
                                                <p className='right-float' style={{ fontSize: 17 }}>
                                                    { languageId === 0 ? 'Pick up a satellite ' : 'Подобрать спутника ' } 
                                                    <i className="fa fa-angle-double-right" aria-hidden="true" />
                                                </p>
                                            </Link>
                                        </div>
                                    </div>                                                

                                </Col>
                            </Col>

                        </Row>
                        <Row>
                            <Col xs={12} style={{ padding: 30 }}>
                                { diseasesProfiles.length > 1 && 
                                    <SearchByTreatment languageId={languageId} treatmentSearchData={diseasesProfiles} history={this.props.history} kurorts={kurorts}/> }
                            </Col>
                        </Row>

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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
