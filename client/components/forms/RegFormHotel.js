import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import NumberFormat from 'react-number-format'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Divider from 'material-ui/Divider'
import MuiGeoSuggest from 'material-ui-geosuggest'
import AutoComplete from 'material-ui/AutoComplete'
import _ from 'lodash'
import axios from 'axios'

import SignInSocial from '../SignInSocial'

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


export default class RegFormUser extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      countryId: -1,
      kurortId: -1,
      countriesNames: [],
      kurortsNames: [],
    };

    this.onSubmit = ::this.onSubmit;
    this.handleAdress = ::this.handleAdress;
    this.handleSanatorium = ::this.handleSanatorium;
    this.handleKurort = ::this.handleKurort;
    this.handleCountry = ::this.handleCountry;
    this.handleCategory = ::this.handleCategory;
    this.handleEmail = ::this.handleEmail;
    this.handleWebsite = ::this.handleWebsite;
    this.handleContactNumber = ::this.handleContactNumber;
    this.handlePassword = ::this.handlePassword;
    this.handleConfPassword = ::this.handleConfPassword;
  }

  componentWillMount(){
    axios.get('/api/countries-kurorts-names').then( response => {
        this.setState({ 
            countriesNames: _.sortBy(response.data.countries, this.props.languageId === 0 ? 'country' : 'country_ru'),
            kurortsNames: _.sortBy(response.data.kurorts, this.props.languageId === 0 ? 'kurort' : 'kurort_ru'),
         })
    })
  }

  onSubmit() { 

    let sanatoriumValid = this.state.sanatorium && this.state.sanatorium.length > 0,
        categoryValid = this.state.category !== undefined ,
        kurortId = this.state.kurortId > 0,
        countryId = this.state.countryId > 0,
        websiteValid = this.state.website && this.state.website.length > 0,
        emailValid = regExpEmail.test(this.state.email),
        contactNumberValid = this.state.contactNumber && this.state.contactNumber.formattedValue.length === 18,
        passwordValid = this.state.password && this.state.password.length > 0,
        confPasswordValid = this.state.password === this.state.confPassword,
        values = {}

    if( sanatoriumValid && categoryValid && websiteValid && emailValid && contactNumberValid && passwordValid && confPasswordValid && kurortId && countryId){
      
      values.h_sname = this.state.sanatorium 
      values.h_sname_ru = this.state.sanatorium 
      values.h_stars = this.state.category 
      values.h_country_id = this.state.countryId
      values.h_kurort_id = this.state.kurortId
      values.h_website = this.state.website
      values.email = this.state.email 
      values.phone = this.state.contactNumber.formattedValue
      values.password = this.state.password 
      values.google_map = { lat: this.state.lat, lng: this.state.lng }      

      this.props.onValidSubmit(values) 
    } else {

      this.setState({ errorSanatorium : !sanatoriumValid, errorCategory : !categoryValid, errorKurortId: !kurortId, errorCountryId: !countryId, errorWebsite: !websiteValid, errorEmail : !emailValid, errorContactNumber : !contactNumberValid, errorPassword : !passwordValid, errorConfPassword : !confPasswordValid }) 
    }

  }


  handleAdress( result ) {

      let adress = result.formatted_address,
          lat = result.geometry.location.lat(),
          lng = result.geometry.location.lng()

      this.setState({ adress, lat, lng })
  }


  handleSanatorium(event, sanatorium) {
    this.setState({ sanatorium, errorSanatorium: !Boolean(event.currentTarget.value) })
  }

  handleKurort(event, index, kurortId) {
    this.setState({ kurortId, errorKurortId : !Boolean(kurortId) });
  }

  handleCountry(event, index, countryId) {
    this.setState({ countryId, errorCountryId : !Boolean(countryId) });
  }
  
  handleCategory(event, category ) { 
    this.setState({ category, errorCategory : !Boolean(category) })
  }
  
  handleEmail(event, email ) {
    this.setState({ email, errorEmail : !regExpEmail.test(email) })
  }
  
  handleWebsite(event, website ) {
    this.setState({ website, errorWebsite : !Boolean(event.target.value ) })
  }
  
  handleContactNumber(event, contactNumber ) {
    this.setState({ contactNumber, errorContactNumber : !Boolean(event.target.value.length === 18 ) })
  }

  handlePassword(event, password ) {
    this.setState({ password, errorPassword : !Boolean(event.target.value ) })
  }

  handleConfPassword(event, confPassword ) {
    this.setState({ confPassword, errorConfPassword : !Boolean(event.target.value === this.state.password) })
  }
  
  render(){

    const languageId = this.props.languageId;
    const account_type = this.props.account_type;
    
    console.log(this.state)
    return(

            <form onSubmit={ ::this.onSubmit } className='small-form'>
                  <h5 className='header-text'> {languageId === 0 ? 'Register as sanatorium' : 'Регистрация санатория '} </h5>
                  <Divider />

                    <Row>

                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'Sanatorium name' : 'Названия санатория'}
                              errorText={ this.state.errorSanatorium && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              onChange={ ::this.handleSanatorium } />
                        </Col>

                        <Col  xs={12} sm={6}>
                            <SelectField 
                              floatingLabelText={languageId === 0 ? 'Category' : 'Категория'}
                              errorText={ this.state.errorCategory && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              value={ this.state.category }
                              onChange={ ::this.handleCategory }
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

                    </Row>
                    <Row>

                        <Col  xs={12} sm={6}>
                            <SelectField
                              floatingLabelText={languageId === 0 ? 'Country' : 'Страна'}
                              value={ this.state.countryId }
                              errorText={ this.state.errorCountryId && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              floatingLabelStyle={{ left: 0 }}
                              onChange={this.handleCountry}
                            >
                              {
                                this.state.countriesNames.map( (item, index) => 
                                  <MenuItem 
                                    key={index}
                                    value={item.id} 
                                    primaryText={ languageId === 0 ? item.country : item.country_ru} />
                                )
                              }
                            </SelectField>                            

                        </Col>

                        <Col  xs={12} sm={6}>
                            <SelectField
                              disabled={ this.state.countryId === -1 }
                              floatingLabelText={languageId === 0 ? 'Kurort' : 'Курорт'}
                              value={ this.state.kurortId }
                              errorText={ this.state.errorKurortId && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              floatingLabelStyle={{ left: 0 }}
                              onChange={this.handleKurort}
                            >
                              {
                                this.state.kurortsNames.map( (item, index) => 
                                  item.country_id === this.state.countryId &&
                                  <MenuItem 
                                    key={index}
                                    value={item.id} 
                                    primaryText={ languageId === 0 ? item.kurort : item.kurort_ru} />
                                )
                              }
                            </SelectField>
                        </Col>

                    </Row>
                    <Row>
                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'Business Website' : 'Бизнес-сайт'} 
                              errorText={ this.state.errorWebsite && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              onChange={ ::this.handleWebsite } />                        
                        </Col>


                        <Col xs={6}>
                            <TextField 
                              floatingLabelText={languageId === 0 ? 'Contact number' : 'Моб. телефон'}
                              errorText={ this.state.errorContactNumber && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                            >
                                <NumberFormat 
                                  value={ this.state.contactNumber && this.state.contactNumber.formattedValue } 
                                  format='+##(###)-##-##-###' 
                                  onChange={ ::this.handleContactNumber }/>
                            </TextField>                    
                        </Col>
                    
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <TextField
                            floatingLabelText={languageId === 0 ? 'E-mail' : 'Електронная почта'} 
                            errorText={ this.state.errorEmail && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                            onChange={ this.handleEmail } />

                        </Col>
                    </Row>
                    <Row>

                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'Password' : 'Пароль'} 
                              errorText={ this.state.errorPassword && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ ::this.handlePassword }
                              results={ this.getCoords } />
                        </Col>

                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'Confirm password' : 'Подтверждение пароля'} 
                              errorText={ this.state.errorConfPassword && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ ::this.handleConfPassword } />
                        </Col>

                    </Row>
                    <Row className="form-button">

                        <RaisedButton
                            label={languageId === 0 ? 'Sign Up' : 'Зарегестрироваться'}
                            onClick={ ::this.onSubmit } />
                    </Row>
                    <Row>

                      <Col xs={12} style={{ marginTop: 10 }}>
                          <Divider style={{ marginBottom: 10 }}/>
                          <SignInSocial auth={false} account_type={account_type}/>
                      </Col>

                    </Row>
            </form>




    )
  }
}
