import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import NumberFormat from 'react-number-format'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Divider from 'material-ui/Divider'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import MuiGeoSuggest from 'material-ui-geosuggest'
import axios from 'axios'
import _ from 'lodash'

import SignInSocial from '../SignInSocial'


const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const specialities = require(`../../../api/doctorsSpecialities`).specialities


export default class RegFormDoctor extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      categories: [],
    };

    this.axiosGetTreatmentCategories = ::this.axiosGetTreatmentCategories;
    this.onSubmit = ::this.onSubmit;
    this.handleFirstName = ::this.handleFirstName;
    this.handleLastName = ::this.handleLastName;
    this.handleEmail = ::this.handleEmail;
    this.handleContactNumber = ::this.handleContactNumber;
    this.handlePassword = ::this.handlePassword;
    this.handleConfPassword = ::this.handleConfPassword;
    this.handleSpeciality = ::this.handleSpeciality;
    this.handleAdress = ::this.handleAdress;
  }

  componentWillMount(){
    this.axiosGetTreatmentCategories()
  }

  axiosGetTreatmentCategories() {
    axios.get('/api/disease-profiles-names')
       .then( response => this.setState({ categories: (response.data.data || [] ).concat({ id: 0, name: 'Other', name_ru: 'Другое' }) }) )
  }

  onSubmit() { 

    let firstNameValid = this.state.firstName && this.state.firstName.length > 0,
      lastNameValid = this.state.lastName && this.state.lastName.length > 0,
      emailValid = regExpEmail.test(this.state.email),
      contactNumberValid = this.state.contactNumber && this.state.contactNumber.formattedValue.length === 18,      
      specialityValid = this.state.speciality_id !== undefined,
      categoryValid = this.state.category !== undefined,
      adressValid = this.state.formatted_address && this.state.formatted_address.length > 0,
      passwordValid = this.state.password && this.state.password.length > 0,
      confPasswordValid = this.state.password === this.state.confPassword,
      values = {}

    if( firstNameValid && specialityValid && categoryValid && lastNameValid && emailValid && contactNumberValid && passwordValid && confPasswordValid){
      
      values.first_name = this.state.firstName 
      values.last_name = this.state.lastName 
      values.email = this.state.email 
      values.phone = this.state.contactNumber.formattedValue
      values.password = this.state.password 
      values.d_speciality = this.state.speciality
      values.d_speciality_id = this.state.speciality_id
      values.d_category = this.state.category
      values.adress = this.state.formatted_address
      
      this.props.onValidSubmit(values) 
    } else {

      this.setState({ errorFirstName : !firstNameValid, errorLastName : !lastNameValid, errorEmail : !emailValid, errorContactNumber : !contactNumberValid, errorSpeciality: !specialityValid, errorAdress: !adressValid, errorPassword : !passwordValid, errorConfPassword : !confPasswordValid }) 
    }

  }


  handleFirstName(event, firstName ) {
    this.setState({ firstName, errorFirstName : !Boolean(event.target.value ) })
  }

  handleLastName(event, lastName ) {
    this.setState({ lastName, errorLastName : !Boolean(event.target.value ) })
  }

  handleEmail(event, email ) {
    this.setState({ email, errorEmail : !regExpEmail.test(email) })
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

  handleSpeciality(speciality_id) {
    this.setState({ speciality_id, speciality: _.find(specialities, { id: speciality_id}).label, errorSpeciality : !Boolean(speciality_id) })
  }

  handleAdress(result) {
    this.setState({ formatted_address: result.formatted_address || result, location_json: { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() } })
  }

  render(){

    const languageId = this.props.languageId;
    const account_type = this.props.account_type;
    console.log(this.state)

    return(

            <form onSubmit={ ::this.onSubmit } className='small-form'>
                  <h5 className='header-text'> {languageId === 0 ? 'Register as doctor' : 'Регистрация врача-консультанта '} </h5>
                  <Divider />

                    <Row>

                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'First name' : 'Имя'} 
                              errorText={ this.state.errorFirstName && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              onChange={ ::this.handleFirstName } />
                        </Col>

                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'Last name' : 'Фамилия'}
                              errorText={ this.state.errorLastName && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ ::this.handleLastName } />
                              
                        </Col>

                        <Col xs={12} sm={6}>
                            <SelectField  
                              floatingLabelText={languageId === 0 ? 'Category' : 'Категория'}
                              errorText={ this.state.errorCategory && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              value={ this.state.category }
                              floatingLabelStyle={{ left :'0px' }}
                              menuItemStyle={{ textAlign : 'center' }}
                              onChange={ (e,i,value) => this.setState({ category: value }) } >
                              {
                                this.state.categories.map( category =>
                                  <MenuItem value={category.id} key={category.id} primaryText={ languageId === 0 ? category.name : category.name_ru} />

                                )
                              }
                            </SelectField>
                        </Col>

                        <Col xs={12} sm={6}>
                            <SelectField  
                              floatingLabelText={languageId === 0 ? 'Speciality' : 'Специальность'}
                              errorText={ this.state.errorSpeciality && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              value={ this.state.speciality_id }
                              floatingLabelStyle={{ left :'0px' }}
                              menuItemStyle={{ textAlign : 'center' }}
                              onChange={ (e,i,value) => this.handleSpeciality(value ) } >
                              {
                                specialities.map( item => 
                                  <MenuItem value={item.id} key={item.id} primaryText={item.label[languageId]} />
                                )
                              }  
                            </SelectField>
                        </Col>

                        <Col xs={12} sm={6}>
                            <MuiGeoSuggest 
                              options={{
                                types: ['(cities)']
                              }}
                              floatingLabelText={languageId === 0 ? 'Home adress' : 'Адрес проживания'}                       
                              errorText={ this.state.errorAdress && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ (e,value) => this.setState({ formatted_address: value }) }                    
                              onPlaceChange={ this.handleAdress } />
                        </Col>

                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'E-mail' : 'Електронная почта'} 
                              errorText={ this.state.errorEmail && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ this.handleEmail } />
                        </Col>

                        <Col  xs={12} sm={6}>
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

                        <Col  xs={12} sm={6}>
                            <TextField
                              floatingLabelText={languageId === 0 ? 'Password' : 'Пароль'} 
                              errorText={ this.state.errorPassword && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                              onChange={ ::this.handlePassword } />
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
                          <SignInSocial auth={false} account_type={account_type} />
                      </Col>

                    </Row>
            </form>




    )
  }
}
