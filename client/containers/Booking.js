import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import TextField from 'material-ui/TextField'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import NumberFormat from 'react-number-format'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'
import _ from 'lodash'
import AlertContainer from 'react-alert'
import {Helmet} from 'react-helmet';

import PaypalButton from '../components/PaypalButton';

const queryString = require('query-string');

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const includes = require('../../api/tursData').includes

const  alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'dark',
    time: 4000,
    transition: 'scale'
}

const initialState = {
    images: [],
    transferList: [],
    turs: [],
    guestsNames: [],
    generalInfoHotel: {},
    cancelationPolicy: {},
    paymentMethod: 0,
    contactName: '',
    contactLastname: '',
    contactNumber: {},
    contactEmail: '',
    bookingFinished: false,
    bookingNotFound: false,
    agreeRules: false,
    allDataValid: false,
    activatedCoupons: [],
    totalCouponsDiscount: 0,
}

function format(value, pattern) {
    var i = 0,
        v = value.toString();
    return pattern.replace(/#/g, _ => v[i++]);
}


class Booking extends Component {

    constructor(props) {
        super(props);

        this.state = initialState

        this.createBooking = ::this.createBooking;
        this.checkCard = ::this.checkCard;
        this.handleNameGuest = ::this.handleNameGuest;
        this.handleLastNameGuest = ::this.handleLastNameGuest;
        this.validateAllData = ::this.validateAllData;
        this.tryActivatePromoCode = ::this.tryActivatePromoCode;
        this.handleCardName = ::this.handleCardName;
        this.handleCardNumber = ::this.handleCardNumber;
        this.handleCardExpiry = ::this.handleCardExpiry;
        this.handleCardLastname = ::this.handleCardLastname;
        this.handleNameCont = ::this.handleNameCont;
        this.handleLastnameCont = ::this.handleLastnameCont;
        this.handleContactNumber = ::this.handleContactNumber;
        this.handleEmailCont = ::this.handleEmailCont;
        this.handleChangePaymentMethod = ::this.handleChangePaymentMethod;
        this.handleChangeShareRoom = ::this.handleChangeShareRoom;
    }


    componentWillMount(){
        this.props.pageActions.updateIsLoadingPage(true);
        this.props.pageActions.setNavigationPathNames([{ label: ['Booking', 'Бронирование'], link: '/booking'}])

    }

    componentDidMount(){
        this.props.pageActions.updateIsLoadingPage(false);

        let promises = []

        if(this.props.booking.details.tur_id) {
          promises = [
            this.getPropsBookingDetails(),
            this.axiosGetTurs(),
            this.axiosGetTransferList()
          ]
        } else {
          promises = [
            this.getPropsBookingDetails(),
            this.axiosGetHotelsPhotos(),
            this.axiosGetPreviewData(),
            this.axiosGetCancelationPolicy(),
            this.axiosGetTurs(),
            this.axiosGetTransferList()
          ]  
        }
        
        Promise.all(promises).then( () => {
            this.props.pageActions.updateIsLoadingPage(false);
        })

        if(_.isEmpty(this.props.booking.details)){
            this.setState({ bookingNotFound: true })
        }
    }

    getPropsBookingDetails() {
        const bookedData = this.props.booking.details
        const user = this.props.profile.user && 
                        ( this.props.profile.user.account_type === 1 || this.props.profile.user.account_type === 2) 
                        ? this.props.profile.user 
                        : {}

        let guestsNames = new Array(bookedData.adults)

        if(bookedData.shareRoom && bookedData.adults === 1 ){
            guestsNames.length = 1
        }

        _.fill(guestsNames, { name: '', lastname: '' } );

        this.setState({ 
            guestsNames, 
            contactName: user.first_name || '', 
            contactLastname: user.last_name || '',
            contactEmail: user.email || '',
            contactNumber: {
                formattedValue: user.phone || '',
            },
        })        

    }

    axiosGetHotelsPhotos() {
        axios.get('/api/profile/hotel/photos',
                {
                    params : {
                        users_id : this.props.booking.details.hotels_id
                    }
                }
        ).then(
            response => this.setState ({ images : response.data.data  }) 
        )
    }

    axiosGetCancelationPolicy() {
        axios.get('/api/hotels/cancelation_policy', {
            params: {
                users_id: this.props.booking.details.hotels_id
            }
        }).then( response => this.setState({  cancelationPolicy: response.data.data[0] || {} }) )
    } 

    axiosGetPreviewData() {
        axios.get('/api/booking/preview-data',{
            params: {
                users_id: this.props.booking.details.hotels_id
            }
        }).then( response =>
            this.setState({ generalInfoHotel: response.data.data })
        )
    }

    axiosGetTurs() {
        axios.get('/api/turs')
             .then( response => {

                response.data.data = response.data.data.map( item => {

                    let prices = [],
                        adults = this.props.booking.details.adults,
                        price_values_length = item.price_values.length,
                        defaultPriceIntoUSD = null,
                        priceWithDiscountIntoUSD = null

                    let defaulPrice = ( adults > price_values_length  
                        ?  Math.floor(adults / price_values_length ) * item.price_values[price_values_length -1] 
                           + (adults % price_values_length ? item.price_values[adults % price_values_length -1] : 0 )
                        :  item.price_values[price_values_length -1]
                    )

                    switch(item.price_currency){
                        case 0: 
                            defaultPriceIntoUSD = defaulPrice / this.props.search.currencyRates.USD
                            break 
                        case 1: 
                            defaultPriceIntoUSD = defaulPrice / this.props.search.currencyRates.RUB
                            break 
                        case 2: 
                            defaultPriceIntoUSD = defaulPrice / this.props.search.currencyRates.AZN
                            break
                        case 3: 
                            defaultPriceIntoUSD = defaulPrice / this.props.search.currencyRates.KZT
                            break
                        case 4: 
                            defaultPriceIntoUSD = defaulPrice / this.props.search.currencyRates.EUR
                            break
                    }

                    priceWithDiscountIntoUSD = defaultPriceIntoUSD * (100 - item.discount_percent)/ 100;

                    item.prices = prices = [
                        parseFloat((priceWithDiscountIntoUSD || 0).toFixed(2)), 
                        parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.RUB || 0).toFixed(1)),
                        parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.AZN || 0).toFixed(1)),
                        parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.KZT || 0).toFixed(1)),
                        parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.EUR || 0).toFixed(1))
                    ]                   

                    return item
                })

                this.setState({ turs: response.data.data }) 
             })
    }

    axiosGetTransferList() {
        axios.get('/admin/transfer/sanatorium',{
            params: {
                id: this.props.booking.details.hotels_id
            }
        })
        .then( response => {

            response.data.data = response.data.data.map( item => {

                let prices = [],
                    defaultPriceIntoUSD = null,
                    priceWithDiscountIntoUSD = null

                switch(item.price_currency){
                    case 0: 
                        defaultPriceIntoUSD = item.price_value / this.props.search.currencyRates.USD
                        priceWithDiscountIntoUSD = item.price_value / this.props.search.currencyRates.USD
                        break 
                    case 1: 
                        defaultPriceIntoUSD = item.price_value / this.props.search.currencyRates.RUB
                        priceWithDiscountIntoUSD = item.price_value / this.props.search.currencyRates.RUB
                        break 
                    case 2: 
                        defaultPriceIntoUSD = item.price_value / this.props.search.currencyRates.AZN
                        priceWithDiscountIntoUSD = item.price_value / this.props.search.currencyRates.AZN
                        break
                    case 3: 
                        defaultPriceIntoUSD = item.price_value / this.props.search.currencyRates.KZT
                        priceWithDiscountIntoUSD = item.price_value / this.props.search.currencyRates.KZT
                        break
                    case 4: 
                        defaultPriceIntoUSD = item.price_value / this.props.search.currencyRates.EUR
                        priceWithDiscountIntoUSD = item.price_value / this.props.search.currencyRates.EUR
                        break
                }

                item.prices = prices = [
                    parseFloat((priceWithDiscountIntoUSD || 0).toFixed(2)), 
                    parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.RUB || 0).toFixed(1)),
                    parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.AZN || 0).toFixed(1)),
                    parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.KZT || 0).toFixed(1)),
                    parseFloat((priceWithDiscountIntoUSD * this.props.search.currencyRates.EUR || 0).toFixed(1))
                ]                   

                return item
            })

            this.setState({ transferList: response.data.data }) 
        })
    }

    createBooking (finalPrice, daily_price_default, total_price_default) {

        if(!this.props.booking.details.tur_id){
            axios.post('/api/booking/reserve',{
                users_id: this.props.profile.user.users_id || -1,
                hotels_id: this.props.booking.details.hotels_id,
                items_id: this.props.booking.details.items_id,
                category_id: this.props.booking.details.category_id,
                start_date: this.props.booking.details.start_date,
                end_date: this.props.booking.details.end_date,
                nights: this.props.booking.details.nights,
                rooms: this.props.booking.details.rooms,
                rooms_number: this.props.booking.details.room_number,
                adults: this.props.booking.details.adults,
                childs: this.props.booking.details.childs,
                childs_age: _.isArray(this.props.booking.details.childs_ages) ? this.props.booking.details.childs_ages : null,
                payments: this.state.paymentMethod,
                guest_names: this.state.guestsNames,
                guest_contacts: {
                    name: this.state.contactName,
                    lastname: this.state.contactLastname,
                    email: this.state.contactEmail,
                    phone: this.state.contactNumber.value,
                },
                discount_percent: this.state.totalCouponsDiscount,
                total_price_for_guest: finalPrice,
                currency: this.props.profile.currencyId,
                daily_price_default: daily_price_default,
                total_price_default: total_price_default,
                generalInfoHotel: this.state.generalInfoHotel,
                payedAmount: this.state.payedAmount,
                payedCurrency: this.state.payedCurrency,
                shareRoom: this.props.booking.details.shareRoom ? 1 : 0,
                transfer_id: this.state.selectedTransferId,
                tur_id: this.state.selectedTurId,
                transfer_data: this.state.selectedTransferData,
                tur_data: this.state.seletedTurData,
            })
        }else {
            axios.post('/api/booking/tur/reserve',{
                users_id: this.props.profile.user.users_id || -1,
                tur_id: this.props.booking.details.tur_id,
                start_date: this.props.booking.details.start_date,
                end_date: this.props.booking.details.end_date,
                nights: this.props.booking.details.nights,
                adults: this.props.booking.details.adults,
                children: this.props.booking.details.childs,
                babies: this.props.booking.details.babies,
                guest_names: this.state.guestsNames,
                guest_contacts: {
                    name: this.state.contactName,
                    lastname: this.state.contactLastname,
                    email: this.state.contactEmail,
                    phone: this.state.contactNumber.value,
                },
                price: finalPrice,
                currency: this.props.profile.currencyId,
            })
        }

        this.setState({ bookingFinished: true }, () => {
            window.$('html, body').animate({ scrollTop: 0 }, 1000)
        })

        this.props.pageActions.deleteBookingData()


    }

    checkCard() {
        axios.post('https://gwapi.demo.securenet.com/api/Payments/Authorize',
             { 
                AccessControlAllowOrigin: '*', 
            }
        ).then( response => console.log(response) )
    }

    handleNameGuest(index, name) {
        let guestsNames = []

        this.state.guestsNames.map( (item, i) => {
            if(index === i ){
                guestsNames.push({ name: name, lastname: item.lastname })
            }else guestsNames.push(item)
        })
        this.setState({ guestsNames }, this.validateAllData )
    }

    handleLastNameGuest(index, lastname) {
        let guestsNames = []

        this.state.guestsNames.map( (item, i) => {
            if(index === i ){
                guestsNames.push({ name: item.name, lastname: lastname })
            }else guestsNames.push(item)
        })     
        this.setState({ guestsNames }, this.validateAllData )
    }

    validateAllData() {
        let allDataValid = true
            
        this.state.guestsNames.map( item => {
            if(item.name == '' || item.lastname == '')
                allDataValid = false
        })

        if( 
            !Boolean(this.state.contactName.length > 0) ||
            !Boolean(this.state.contactLastname.length > 0) ||
            !Boolean(this.state.contactNumber.formattedValue.length === 18 ) ||
            !regExpEmail.test(this.state.contactEmail)
        ) allDataValid = false
        
        this.setState({ allDataValid })
    }

    tryActivatePromoCode() {
        
        axios.get('/api/booking/coupon/check-available', {
            params: {
                coupon_code: this.state.newCouponCode,
            }
        }).then( response => {

            console.log(response.data)

            let couponData = null,
                activatedCoupons = this.state.activatedCoupons || {},
                totalCouponsDiscount = 0

            if(response.data.other_coupon[0] && !_.find(activatedCoupons.other, { id: response.data.other_coupon[0].id }) ){
                couponData = response.data.other_coupon
                
                if(activatedCoupons.other){ 
                    activatedCoupons.other.push(response.data.other_coupon[0])
                }else{
                    activatedCoupons.other = [response.data.other_coupon[0]]
                }

            }

            if(response.data.doctor_coupon[0] && !activatedCoupons.doctor_coupon ){
                couponData = response.data.doctor_coupon[0]
                activatedCoupons.doctor_coupon = couponData
            }

            if(couponData){
                this.state.activatedCoupons.other && this.state.activatedCoupons.other.map( item =>
                    totalCouponsDiscount += item.percent_discount
                )

                if(this.state.activatedCoupons.doctor_coupon){
                    totalCouponsDiscount += couponData.percent
                }
            }

            if(!couponData){
                this.msg.error(this.props.profile.languageId === 0 ? 'Not valid coupon' : 'Неверный промокод')
                return;
            }

            this.msg.success(this.props.profile.languageId === 0 ? 'Promotional code successfully applied' : 'Промокод успешно применен')
            this.setState({ 
                newCouponCode: '', 
                activatedCoupons, 
                totalCouponsDiscount,
            })
        })

    }

    handleCardName(event, cardName ) {
        this.setState({ cardName })
    }

    handleCardNumber(event, cardNumber ) {
        this.setState({ cardNumber })
    }

    handleCardExpiry(event, cardExpiry ) {
        this.setState({ cardExpiry })
    }

    handleCardLastname(event, cardLastname ) {
        this.setState({ cardLastname })
    }

    handleNameCont(event, contactName ) {
        this.setState({ contactName, errorContactName : !Boolean(contactName.length > 0) }, this.validateAllData )
    }

    handleLastnameCont(event, contactLastname ) {
        this.setState({ contactLastname, errorContactLastname : !Boolean(contactLastname.length > 0) }, this.validateAllData )
    }

    handleContactNumber(event, contactNumber ) {
        this.setState({ contactNumber, errorContactNumber : !Boolean(event.target.value.length === 18 ) }, this.validateAllData )
    }

    handleEmailCont(event, contactEmail ) {
        this.setState({ contactEmail, errorContactEmail : !regExpEmail.test(contactEmail) }, this.validateAllData )
    }

    handleChangePaymentMethod(event, index, paymentMethod) {
        this.setState({ paymentMethod })
    }

    handleChangeShareRoom(e, checked){
        let bookedData = this.props.booking.details
        
        bookedData.shareRoom = checked

        this.props.pageActions.setBookedData(bookedData)
    }

    render() {
        console.log(this.props.booking)
        
        const languageId = this.props.profile.languageId - 0;
        const currencyId = this.props.profile.currencyId - 0;
        const stars = [
            <div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/></div>,
            <div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
            <div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
            <div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
            <div className='hotel-stars'><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>,
        ]        
        const bookedData = this.props.booking.details || {}
        const stringifiedPropsToTurs = queryString.stringify({
            arrivalDate: bookedData.start_date,
            departureDate: bookedData.end_date,
            adults: bookedData.adults,
            childs: bookedData.childs,
            babies: 0,
        })
        const finalPrice =  bookedData.totalPrice && bookedData.totalPrice.price_with_discount[currencyId] * 
                            (100 - this.state.totalCouponsDiscount || 0 )/100 + 
                            ((this.state.seletedTurData && this.state.seletedTurData.prices[currencyId] || 0 ) +
                            (this.state.selectedTransferData && this.state.selectedTransferData.prices[currencyId] || 0 ));

        const daily_price_default = bookedData.totalPrice &&  bookedData.totalPrice.price_with_discount.map(price => price / bookedData.nights),
              total_price_default = bookedData.totalPrice &&  bookedData.totalPrice.price_with_discount.map(price => price);
        const url = process.env.API_URL + this.props.location.pathname

        // PAYPAL CONFIG
        const CLIENT = {
          sandbox: 'AeXgNhCdJsoVGdc_qIAUW4ScsOtVbnMYbgzivTDE39Zwd4H0jEUrAm4JmiSk-zrBBtRDiT2AhxnU0TQo',
          production: '',
        }
        const ENV = 'sandbox'

        let PaypalTotal, PaypalCurrency;

        if(!_.isEmpty(this.props.booking.details)){
            PaypalTotal = this.props.booking.details.totalPrice.price_with_discount[this.props.profile.currencyId]/10 * (100 - this.state.totalCouponsDiscount || 0 )/100 
            PaypalCurrency = currency[this.props.profile.currencyId]
        }

        const onSuccess = (payment) =>
          this.msg.success(languageId === 0 ? 'Successfull payed!' : 'Успешно оплачено!')

        const onError = (error) =>
          this.msg.error(languageId === 0 ? 'Error! Not payed' : 'Ошибка! Не оплачено')

        const onCancel = (data) =>
          this.msg.error(languageId === 0 ? 'Canceled by user!' : 'Отменено пользователем')
        
        //------------------------------------------------------------------------------

        console.log(this.state.turs)

        return(
            <div>
                <Helmet>
                    <title>{languageId === 0 ? 'Booking 1001kurort': 'Бронирование 1001kurort'}</title>
                </Helmet>

            { !this.state.bookingNotFound ? <AlertContainer ref={a => this.msg = a} {...alertOptions} /> : '' }             
            { 
                !this.state.bookingFinished && !this.state.bookingNotFound
            ?   <div>
                   <Row style={{ margin: 0 }}>
                        <Col sm={12} xl={6}>
                            <Paper zDepth={1} style={{ padding: 10 }}>
                                <h4 className='center' >{ languageId === 0 ? 'Your data' : 'Ваши данные' }</h4>
                                {
                                    this.state.guestsNames.map( (guest, index) =>
                                        <div>
                                            <Hidden lg xl>
                                                <Row>
                                                    <Col md={12} xl={5}>
                                                        <h4 style={{ marginTop: 42, textAlign: 'center' }}>{ languageId === 0 ? `Guest #${index +1}` : `Гость #${index +1}` }</h4>
                                                        <TextField
                                                            fullWidth
                                                            floatingLabelText={ languageId === 0 ? 'Name' : 'Имя' } 
                                                            onChange={ (event, name) => this.handleNameGuest(index, name) }/>                                            
                                                    </Col>                    
                                                </Row>
                                                <Row>
                                                    <Col md={12} xl={5}>
                                                        <TextField
                                                            fullWidth
                                                            floatingLabelText={ languageId === 0 ? 'Surname' : 'Фамилия' } 
                                                            onChange={ (event, surname) => this.handleLastNameGuest(index, surname) }/> 
                                                    </Col>
                                                </Row>
                                            </Hidden>
                                            <Visible lg xl>
                                                <Row>
                                                    <Col xs={1} md={2} xl={2}>
                                                        <h4 style={{ marginTop: 42, textAlign: 'center' }}>{index +1}.</h4>
                                                    </Col>

                                                    <Col xs={11} md={5} xl={5}>
                                                        <TextField
                                                            fullWidth
                                                            floatingLabelText={ languageId === 0 ? 'Name' : 'Имя' } 
                                                            onChange={ (event, name) => this.handleNameGuest(index, name) }/>                                            
                                                    </Col>  
                                                    <Col xs={11} md={5} xl={5}>
                                                        <TextField
                                                            fullWidth
                                                            floatingLabelText={ languageId === 0 ? 'Surname' : 'Фамилия' } 
                                                            onChange={ (event, surname) => this.handleLastNameGuest(index, surname) }/> 
                                                    </Col>
                                                </Row>
                                            </Visible>
                                        </div>
                                    )
                                }
                                <Row>

                                    <Col>
                                        <h4 className='center' >{ languageId === 0 ? 'To stay connected' : 'Оставаться на связи' }</h4>
                                    </Col>
                               
                                    <Col xs={12} md={6} xl={5} offset={{ xl: 2 }}>
                                        <TextField
                                            fullWidth
                                            errorText={ this.state.errorContactName && ( languageId === 0 ? 'Wrong value' : 'Неверное значение')}
                                            value={this.state.contactName }
                                            floatingLabelText={ languageId === 0 ? 'Name' : 'Имя' }
                                            onChange={ this.handleNameCont } />                                            
                                    </Col>                    

                                    <Col xs={12} md={6} xl={5}>
                                        <TextField
                                            fullWidth
                                            errorText={ this.state.errorContactLastname && ( languageId === 0 ? 'Wrong value' : 'Неверное значение')}
                                            value={this.state.contactLastname }
                                            floatingLabelText={ languageId === 0 ? 'Surname' : 'Фамилия' } 
                                            onChange={  this.handleLastnameCont } /> 
                                    </Col> 
                               
                                    <Col xs={12} md={6} xl={5} offset={{ xl: 2 }}>
                                        <TextField 
                                            fullWidth
                                            errorText={ this.state.errorContactNumber && ( languageId === 0 ? 'Wrong value' : 'Неверное значение')}
                                            floatingLabelText={languageId === 0 ? 'Contact number' : 'Моб. телефон'}
                                        >
                                            <NumberFormat 
                                                value={ this.state.contactNumber && this.state.contactNumber.formattedValue } 
                                                format='+##(###)-##-##-###' 
                                                onChange={ ::this.handleContactNumber }/>
                                        </TextField>                                            
                                    </Col>                    

                                    <Col xs={12} md={6} xl={5}>
                                        <TextField
                                            fullWidth
                                            errorText={ this.state.errorContactEmail && ( languageId === 0 ? 'Wrong value' : 'Неверное значение')}
                                            floatingLabelText={ languageId === 0 ? 'E-mail' : 'E-mail' }
                                            value={this.state.contactEmail }
                                            onChange={  this.handleEmailCont } /> 
                                    </Col>

                                    <Col md={6} xl={5}  offset={{ md: 6, xl: 7 }}>
                                        <h5>{ languageId === 0 ? 'We will send a booking confirmation to this address' : 'Мы пришлем подтверждение бронирования на этот адрес' }</h5>
                                    </Col>                                
                                </Row>
                            </Paper>


                            { !bookedData.tur_id && 
                                <Paper zDepth={1} style={{ marginTop: 15, padding: 10 }}>
                                    <h4 className='center' >{ languageId === 0 ? 'Booking includes' : 'Бронирование включает' }</h4>
                                    <h5>{ languageId === 0 ? this.state.generalInfoHotel.sname : this.state.generalInfoHotel.sname_ru }{ stars[this.state.generalInfoHotel.stars-1] }</h5>
                                    <Row>
                                        <Col xs={12} xl={4}>
                                            <img 
                                                src={ this.state.generalInfoHotel.avatar || '/images/image-not-found.jpg' } 
                                                style={{
                                                    width: 150 
                                                }}/>
                                        </Col>
                                        <Col xs={12} xl={8}>
                                            <p style={{ float: 'right'}}>{ bookedData.start_date }</p>
                                            <p>{ languageId === 0 ? 'Arrive:' : 'Заезд:'}</p>
                                            <p style={{ float: 'right'}}>{ bookedData.end_date }</p>
                                            <p>{ languageId === 0 ? 'Departure:' : 'Выезд:'}</p>
                                            <p style={{ float: 'right'}}>{ bookedData.room_number }</p>
                                            <p>{ languageId === 0 ? 'Rooms number:' : 'Кл-во номеров:'}</p>
                                            <p style={{ float: 'right'}}>
                                                { languageId === 0 ? `Adults: ${bookedData.adults}, childs: ${bookedData.childs}` : `Взрослых: ${bookedData.adults}, детей: ${bookedData.childs}` }
                                            </p>
                                            <p>{ languageId === 0 ? 'Guests:' : 'Гостей:'}</p>
                                            <p style={{ float: 'right'}}>{ bookedData.nights }</p>
                                            <p>{ languageId === 0 ? 'Booking (nights):' : 'Бронирование (ночей):'}</p>                                    
                                        </Col>
                                    </Row>
                                </Paper> }

                            { !bookedData.tur_id && 
                                <Paper zDepth={1} style={{ marginTop: 15, padding: 10 }}>
                                    <h4 className='center' >{ languageId === 0 ? 'Reserved rooms' : 'Бронируемые номера' }</h4>
                                    {bookedData.rooms.map( (room,index) =>
                                            <Row>
                                                <Col xs={12} sm={12} md={3} xl={3} className='center'>
                                                    <img 
                                                        src={ 
                                                            _.find(this.state.images, { id: room.photos && room.photos[0] }) 
                                                            ? _.find(this.state.images, { id: room.photos && room.photos[0] }).url
                                                            : '/images/image-not-found.jpg' } 
                                                        style={{ width: 120 }}/>                                                
                                                </Col>

                                                <Col sm={12} md={9} xl={9}>
                                                    <b>{languageId === 0 ? 'Room: ' : 'Номер: '}{room.sname}</b>
                                                    {_.map(new Array(bookedData.room_number > 1 ? bookedData.guests[index].adults : bookedData.guests[0].adults), (guest, i) => 
                                                        <div>
                                                            <p style={{ textDecoration: 'underline' }}>{ languageId === 0 ? ' Adult Guest ' : ' Взрослый Гость ' }{index+1}</p>
                                                            <p style={{ paddingLeft: 10 }}>
                                                            {languageId === 0 ? 'Meal plan : ' : 'Питание : ' }
                                                            {room.meal_plan.length ?
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
                                                            : (languageId === 0 ? ` not included` : ` не включено`)} ; 
                                                            {
                                                                room.treatment_incl
                                                                ? languageId === 0 
                                                                    ? ` Treatment: ${room.daily_procedures} procedures daily`
                                                                    : ` Лечение : ${room.daily_procedures} процедур каждый день`
                                                                : languageId === 0
                                                                    ? ` Treatment: not included`
                                                                    : ` Лечение : не включено` 
                                                            }
                                                            </p>
                                                        </div>
                                                    )}
                                                </Col>
                                            </Row>
                                        )
                                    }
                                </Paper>
                            }

                        </Col>

                        <Col sm={12} xl={6}>   
                            
                            { !bookedData.tur_id ?
                                <Paper zDepth={1} style={{ padding: 10 }}>
                                    <h4 className='center' >{ languageId === 0 ? 'Total price' : 'Итоговая цена'}</h4>
                                    <p style={{ float: 'right'}}>{ bookedData.totalPrice.default_price[currencyId] } { currency[currencyId] }</p>
                                    <p>{ languageId === 0 ? 'Default price: ' : 'Стандартная цена: ' }</p>
                                    <p style={{ float: 'right', color: '#49c407' }}>{ this.state.totalCouponsDiscount ? `-${this.state.totalCouponsDiscount}%` : '' }</p>
                                    {this.state.totalCouponsDiscount ? <p>{ languageId === 0 ? 'Coupons: ' : 'Купоны: ' }</p> : '' }
                                    <b style={{ float: 'right', color: this.state.totalCouponsDiscount ? '#49c407' : '#525252' }}>
                                    { finalPrice } { currency[currencyId] }
                                    </b>
                                    <b>{ languageId === 0 ? 'FINAL PRICE: ' : 'К ОПЛАТЕ: ' }</b>
                                    <Divider style={{ marginTop: 20 }}/>
                                    <Checkbox
                                        labelPosition='left'
                                        label={ languageId === 0 ? 'Transfer' : 'Трансфер' }
                                        onCheck={ (e, checked) => this.setState({ need_transfer :checked, selectedTransferId: !checked ? null : this.state.selectedTransferId, selectedTransferData: !checked ? null : this.state.selectedTransferData  }) }
                                        style={{ marginTop:10 }}/>
                                    {
                                        this.state.need_transfer
                                        ?   <div>
                                                <SelectField
                                                    fullWidth
                                                    floatingLabelText={ languageId === 0 ? 'Choose' : 'Выберите' }
                                                    value={this.state.selectedTransferId}
                                                    onChange={ (e,i,value) => this.setState({ selectedTransferId: value, selectedTransferData: _.find(this.state.transferList, { id: parseInt(value) }) }) }
                                                >
                                                    {this.state.transferList.map( (item,index) =>
                                                        <MenuItem 
                                                            value={item.id} 
                                                            primaryText={ 
                                                                <p>{ item.departure } - { item.arrival } {item.opposite_direction && ` - ${item.departure}`}, {item.prices[currencyId]} {currency[currencyId]} </p>
                                                            }/>
                                                    )}
                                                </SelectField>
                                            </div>
                                        :   ''
                                    }                                
                                    <Divider style={{ marginTop: 20 }}/>
                                    <Checkbox
                                        labelPosition='left'
                                        label={ languageId === 0 ? 'Turs' : 'Туры' }
                                        onCheck={ (e, checked) => this.setState({ tursChecked :checked, selectedTurId: !checked ? null : this.state.selectedTurId, seletedTurData: !checked ? null : this.state.seletedTurData  }) }
                                        style={{ marginTop:10 }}/>
                                    {
                                        this.state.tursChecked
                                        ?   <div>
                                                <SelectField
                                                    fullWidth
                                                    floatingLabelText={ languageId === 0 ? 'Choose' : 'Выберите' }
                                                    value={this.state.selectedTurId}
                                                    onChange={ (e,i,value) => this.setState({ selectedTurId: value, seletedTurData: _.find(this.state.turs, { id: parseInt(value) }) }) }
                                                >
                                                    <MenuItem 
                                                        value={0} 
                                                        primaryText={ 
                                                            <a href={'/turs?' + stringifiedPropsToTurs} target='blank'style={{ width: '100%', display: 'block'}}>
                                                                {languageId === 0 ? 'Show all' : 'Показать все' }
                                                            </a>
                                                        }/>
                                                    {this.state.turs.map( (item,index) =>
                                                        <MenuItem value={item.id} primaryText={`${item.name} - ${item.prices[currencyId]} ${currency[currencyId]}`} />
                                                    )}
                                                </SelectField>
                                            </div>
                                        :   ''
                                    }
                                    <Divider style={{ marginTop: 10 }}/>                                
                                    <Checkbox
                                        disabled={bookedData.room_number > 1 || bookedData.adults > 1}
                                        labelPosition='left'
                                        label={ languageId === 0 ? 'Share room' : 'Делить комнату' }
                                        checked={ bookedData.shareRoom }
                                        onCheck={this.handleChangeShareRoom}
                                        style={{ marginTop:10 }}/>
                                    <p>
                                        { languageId === 0 ? 'Divide the room with a program ' : 'Разделите комнату по программе ' }
                                        <a target='blank' href='/funny_satellite'>{ languageId === 0 ? ` Funny satellite ` : ` Веселый спутник ` }</a> 
                                        { languageId === 0 ? ' and save until 50%' : ' и економьте до 50%' }
                                    </p>
                                    <Divider style={{ marginTop: 20, marginBottom: 10 }}/>
                                    {
                                        !this.state.showCouponAdd
                                        ?   <b onClick={ () => this.setState({ showCouponAdd: true }) } style={{ cursor: 'pointer' }}>
                                            { languageId === 0 ? 'Use promocode' : 'Применить промокод' }
                                            </b>
                                        :   <b onClick={ () => this.setState({ showCouponAdd: false }) } style={{ cursor: 'pointer' }}>
                                            { languageId === 0 ? 'Close' : 'Свернуть' }
                                            </b>
                                    }
                                    <Row style={{ display: this.state.showCouponAdd ? 'block' : 'none' }}>
                                        <Col xs={7}>
                                            <TextField
                                                floatingLabelText={ languageId === 0 ? 'Coupon' : 'Купон' }
                                                value={this.state.newCouponCode}
                                                onChange={ (e, value) => this.setState({ newCouponCode: value }) } />
                                        </Col>
                                        <Col xs={5}>
                                            <RaisedButton 
                                                label={ languageId === 0 ? 'Ok' : 'Ок' }
                                                style={{ marginTop: 20 }}
                                                onClick={ this.tryActivatePromoCode }/>
                                        </Col>
                                    </Row>
                                    {
                                        this.state.activatedCoupons && this.state.activatedCoupons.doctor_coupon &&
                                        <h4 style={{ color: '#55c901' }}>{ languageId === 0 
                                            ? `Coupon is activated -${this.state.activatedCoupons.doctor_coupon.percent}%` 
                                            : `Активирован купон -${this.state.activatedCoupons.doctor_coupon.percent}%` 
                                        }</h4>
                                    }
                                    {
                                        this.state.activatedCoupons && this.state.activatedCoupons.other &&
                                        this.state.activatedCoupons.other.map( item =>
                                            <h4 style={{ color: '#55c901' }}>{ languageId === 0 
                                                ? `Coupon is activated -${item.percent_discount}%` 
                                                : `Активирован купон -${item.percent_discount}%` 
                                            }</h4>                                    
                                        )

                                    }
                                    <Divider style={{ marginTop: 10 }}/>
                                    <b style={{ display: 'block', marginTop: 10 }}>{ languageId === 0 ? 'Cancellation policy' : 'Условия анулирования' }</b>
                                    <p>{ 
                                        this.state.cancelationPolicy.prep_needed 
                                        ?   languageId === 0 
                                            ? `Prepayment required! Days before arrive without penalts: ${ this.state.cancelationPolicy.days_no_penalts}, Amount of penal: ${this.state.cancelationPolicy.amount === 1 ? '1 night' : 'all price'}` 
                                            : `Предоплата обязательна! Дней перед заездом без штрафа: ${ this.state.cancelationPolicy.days_no_penalts}, Сумма штрафа: ${this.state.cancelationPolicy.amount === 1 ? '1 ночь' : 'вся сумма'}`
                                        :   languageId === 0 ? 'Prepayment not required. Cancellation anytime without penalts' : 'Предоплата не обязательна. Отмена брони в любое время без штрафов'
                                    }</p>
                                </Paper>
                            :   <Paper zDepth={1} style={{ marginTop: 15, padding: 10 }}>
                                    <h4 className='center' >{ languageId === 0 ? 'Total price' : 'Итоговая цена'}</h4>
                                    <p style={{ float: 'right'}}>{ bookedData.totalPrice.default_price[currencyId] } { currency[currencyId] }</p>
                                    <p>{ languageId === 0 ? 'Default price: ' : 'Стандартная цена: ' }</p>
                                </Paper>
                            }
                           
                            { !bookedData.tur_id && 
                                <Paper zDepth={1} style={{ marginTop: 15, padding: 10 }}>
                                    <h4 className='center' >{ languageId === 0 ? 'Payment method' : 'Способ оплаты' }</h4>
                                    <SelectField
                                        fullWidth
                                        value={this.state.paymentMethod}
                                        onChange={this.handleChangePaymentMethod}
                                    >
                                        {
                                            this.state.generalInfoHotel.h_payments_checkin && !this.state.cancelationPolicy.prep_needed &&
                                            <MenuItem value={0} primaryText={ languageId === 0 ? 'Pay at the check-in' : 'Оплатить при поселении'} /> 
                                        }
                                        {
                                            parseInt(this.state.generalInfoHotel.h_payments_visa) 
                                            &&    <MenuItem value={1} primaryText={ languageId === 0 ? 'Sanatorium accepts payments VISA' : 'Санаторий принимает платежи VISA'} />
                                        }
                                        {
                                            parseInt(this.state.generalInfoHotel.h_payments_master) 
                                            &&    <MenuItem value={2} primaryText={ languageId === 0 ? 'Sanatorium accepts payments MASTER' : 'Санаторий принимает платежи MASTER'} />
                                        }
                                        {
                                            parseInt(this.state.generalInfoHotel.h_payments_maestro) 
                                            &&    <MenuItem value={3} primaryText={ languageId === 0 ? 'Sanatorium accepts payments MAESTRO' : 'Санаторий принимает платежи MAESTRO'} />
                                        }                                
                                    </SelectField>                                
                                    <div className='center'>
                                        <div style={ this.state.paymentMethod !== 0 ? {} : { display: 'none' } }>
                                            <p>{ languageId === 0 ? 'To confirm the reservation you can pay 10% of the amount in advance, the remaining 90% - at settlement' : 'Для подтверждение бронирования вы можете оплатить 10% суммы заранее,  остальные 90% - при поселении'}</p>                                 
                                        </div>
                                        <p  style={ this.state.paymentMethod === 0 && !this.state.cancelationPolicy.prep_needed ? {} : { display: 'none' } }>
                                            { languageId === 0 ? 'Pay all in settlement' : 'Оплатить всю сумму при поселении'}
                                        </p>

                                        <span style={{ verticalAlign: 'middle' }}>{ languageId == 0 ? `Pay ${ finalPrice/10 } ${ currency[currencyId] }` : `Оплатить  ${ finalPrice/10 } ${ currency[currencyId] }`}</span>
                                       
                                        <PaypalButton
                                          client={CLIENT}
                                          env={ENV}
                                          commit={true}
                                          currency={PaypalCurrency}
                                          total={PaypalTotal}
                                          onSuccess={onSuccess}
                                          onError={onError}
                                          onCancel={onCancel}
                                        />                                  
                                    </div>
                                </Paper> 
                            }
                            
                            <Paper zDepth={1} style={{ marginTop: 15, padding: 10, textAlign: 'center' }}>
                                <div style={{ height: 30, margin: 'auto'  }}>
                                    <Checkbox 
                                        checked={this.state.agreeRules} 
                                        label={
                                          languageId === 0 
                                          ? <p>I agree with the <a target='blank' href='/terms-and-conditions'>terms and conditions of booking</a> online portal 1001kurorts</p>
                                          : <p>Согласен с <a target='blank' href='/terms-and-conditions'>условиями бронирования</a> онлайн портала 1001kurorts</p>
                                        }
                                        onClick={ () => this.setState({ agreeRules: !this.state.agreeRules }, this.validateAllData )} /> 
                                </div>
                                <RaisedButton
                                    disabled={ 
                                        (!this.state.agreeRules || 
                                        !this.state.allDataValid || 
                                        this.state.cancelationPolicy.prep_needed && !this.state.payedAmount) && !bookedData.tur_id
                                        || !this.state.agreeRules
                                    }
                                    label={ languageId === 0 ? 'Book' : 'Забронировать'}
                                    onClick={ () => this.createBooking(finalPrice, daily_price_default, total_price_default) }
                                    labelColor='#fff'
                                    backgroundColor='#55c901'
                                    labelStyle={{ fontWeight: 600, fontSize: 24 }}
                                    style={{ height: 60, lineHeight: '60px', width: 300, marginTop: 20  }} />
                                <p style={{ textAlign: 'center', marginTop: 15 }}>{ 
                                    languageId === 0 
                                    ? 'The reservation will be valid immediately after clicking the "Book" button, additional confirmation will be sent to you by e-mail.' 
                                    : 'Бронь будет действительна сразу после нажатия на кнопку «Забронировать», дополнительное подтверждение будет отправлено вам на e-mail.'
                                }</p>                           
                            </Paper>                            
                        </Col>
                    
                    </Row>
                </div>

            :  '' ||
            this.state.bookingFinished 
            ?   <Paper zDepth={1} style={{ padding: 10, margin: 'auto',  marginTop: 80, textAlign: 'center', width: 400, minHeight: 200, maxWidth: '80%' }}>
                    <div id='finished'>
                      <i className="fa fa-check-circle-o" aria-hidden="true" style={{ fontSize: 90, color: '#4cc708' }}></i>
                      <p>{ languageId === 0 ? 'The reservation was successfully completed. A confirmation has been sent to the specified mail' : 'Бронирование успешно завершено. На указанную почту отправлено подтверждение'}</p> 
                      <Link to='/'>{ languageId === 0 ? 'Go home' : 'На главную' } </Link>
                    </div>
                </Paper>
            : ''
            || this.state.bookingNotFound
                &&  <div className='center' style={{ marginTop: 40 }}>
                        <h2>{ languageId === 0 ? 'No data. You do not have a booking' : 'Данных нет. У вас нету бронирования' }</h2>
                    </div>
            }
            </div>
        )
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        pageActions: bindActionCreators(pageActions, dispatch),
    }
}

const mapStateToProps = ({ profile, booking, search, asyncData }) => ({
  profile,
  booking,
  search,
  asyncData,
});

export default connect(mapStateToProps, mapDispatchToProps)(Booking);