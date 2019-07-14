import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import NumberFormat from 'react-number-format'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import MuiGeoSuggest from 'material-ui-geosuggest'
import { bindActionCreators } from 'redux';
import * as pageActions from '../../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'
import _ from 'lodash'

import AvatarEditor from '../AvatarEditor'

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const specialities = require(`../../../api/doctorsSpecialities`).specialities

const initalState = {
                      openPaswordModal : false,
                      changingData : false,
                      currentPassword : false,
                      checkCurrentPassword: false,
                    }


function mapStateToProps(state) {
  return {
    profile: state.profile
  }
}

function mapDispatchToProps(dispatch) {
  return {
    pageActions: bindActionCreators(pageActions, dispatch)
  }
}

@connect(mapStateToProps, mapDispatchToProps)


export default class DoctorsMyProfile extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      openPaswordModal : false,
      changingData : false,
      first_name : this.props.profile.user.first_name || '', 
      last_name :this.props.profile.user.last_name || '',
      email : this.props.profile.user.email || '',
      phone : {
        formattedValue : this.props.profile.user.phone || ''
      },
      password : this.props.profile.user.password || '',
      avatar : this.props.profile.user.avatar,
      formatted_address: this.props.profile.user.address,
      speciality_id: this.props.profile.user.d_speciality_id || 0      
    };
      
    this.handleChangingData = ::this.handleChangingData;
    this.handleFirstName = ::this.handleFirstName;
    this.handleLastName = ::this.handleLastName;
    this.handleEmail = ::this.handleEmail;
    this.handlePhone = ::this.handlePhone;
    this.handlePassword = ::this.handlePassword;
    this.handleAdress = ::this.handleAdress;
    this.handleAvatar = ::this.handleAvatar;
    this.handleSpeciality = ::this.handleSpeciality;
  }

  componentWillReceiveProps(nextProps){

      this.setState({ 
        first_name : nextProps.profile.user.first_name || '', 
        last_name :nextProps.profile.user.last_name || '',
        email : nextProps.profile.user.email || '',
        contactNumber : {
          formattedValue : nextProps.profile.user.phone || ''
        },
        password : nextProps.profile.user.password || '',
        avatar : nextProps.profile.user.avatar,
        formatted_address: this.props.profile.user.address,
        speciality_id: this.props.profile.user.d_speciality_id || 0,  
      })    
  }

  handleSaveData() { 
    
    if(this.state.uploadedImage){
      
      axios.post('https://api.imgur.com/3/image', {
          image : this.state.uploadedImage,
          type: 'base64'
        },{
            headers: { 
              Authorization: 'Client-ID 742e78dbe8f441f',
              Accept: 'application/json'
            }
      })
      .then( response => {

          axios.post('/api/profile/info/update' , 
            {
              users_id: this.props.profile.user.users_id,
              first_name: this.state.first_name,
              last_name: this.state.last_name,
              email: this.state.email,
              phone: this.state.phone.formattedValue,
              avatar: response.data.data.link,
              password : this.state.password,
              address: this.state.formatted_address,        
              location_json: this.state.location_json,
              d_speciality_id: this.state.speciality_id,      
              d_speciality_: this.state.speciality,      
              user_type : 2
            }
          )
          .then( response =>  {
                this.props.pageActions.loginUser(response.data.id_token)
                this.props.pageActions.updateUser();

                this.setState(initalState)
          })
      })
    }else{

      axios.post('/api/profile/info/update' , 
        {
          users_id: this.props.profile.user.users_id,
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          email: this.state.email,
          phone: this.state.phone.formattedValue ? this.state.phone.formattedValue : this.state.phone,
          avatar: this.state.avatar,
          password : this.state.password,
          address: this.state.formatted_address,        
          location_json: this.state.location_json,
          d_speciality_id: this.state.speciality_id,      
          d_speciality_: this.state.speciality,      
          user_type : 2
        }
      )
      .then( response =>  {
            this.props.pageActions.loginUser(response.data.id_token)
            this.props.pageActions.updateUser();

            this.setState(initalState)
      })     
    }
  }


  handleChangingData() { 
    this.setState({ changingData: !this.state.changingData }) 
  }

  handleFirstName(event, first_name ) {
    this.setState({ first_name, errorFistName : !Boolean(first_name) })
  }

  handleLastName(event, last_name ) {
    this.setState({ last_name, errorLastName : !Boolean(last_name) })
  }

  handleEmail(event, email ) { 
    this.setState({ email, errorEmail : !Boolean(regExpEmail.test(email)) })
  }

  handlePhone(event, phone ) {
    this.setState({ phone, errorPhone : !Boolean(phone.formattedValue.length === 18 ) })
  }

  handlePassword(event, password) { 
    this.setState({ password, errorPassword : !Boolean(password) })
  }

  handleAdress(result) {
    this.setState({ formatted_address: result.formatted_address || result, location_json: { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() } })
  }

  handleAvatar(uploadedImage) {
    this.setState({ uploadedImage })
  }

  handleSpeciality(speciality_id) { 
    this.setState({ speciality_id, speciality: _.find(specialities, { id: speciality_id}).label, errorSpeciality : !Boolean(speciality_id) })
  }
  
  render(){
    const languageId = this.props.languageId;
    console.log(this.state)

    return(
        <Col sm={10} md={8} lg={8} xl={6} offset={{sm: 1, md: 2, lg: 2, xl: 3}}>    
          <Row> 
            <Col xs={12} sm={6} style={{ marginTop: 20 }}>     
                <AvatarEditor 
                  disabled={ !this.state.changingData } 
                  src={ this.props.profile.user.avatar } 
                  handleAvatar = { (uploadedImage ) => ::this.handleAvatar(uploadedImage) }
                  account_type={2}/>            
              </Col>               
            <Col xs={12} sm={6}>

                <TextField
                  disabled={ !this.state.changingData }
                  value={ this.state.first_name }
                  floatingLabelText={ languageId === 0 ? 'First name' : 'Имя' } 
                  onChange={ this.handleFirstName } />
                
                <TextField
                  disabled={ !this.state.changingData }
                  value={ this.state.last_name }
                  floatingLabelText={ languageId === 0 ? 'Last name' : 'Фамилия' } 
                  onChange={ this.handleLastName } />                
                
                <SelectField  
                  disabled={ !this.state.changingData }
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
                
                <TextField
                  disabled={ !this.state.changingData }
                  value={ this.state.email }
                  floatingLabelText={ languageId === 0 ? 'E-mail' : 'Eмайл' } 
                  onChange={ this.handleEmail } />            
                
                <MuiGeoSuggest
                  disabled={ !this.state.changingData }
                  options={{
                    types: ['geocode']
                  }}
                  floatingLabelText={languageId === 0 ? 'Address' : 'Адрес'}
                  value={this.state.formatted_address}
                  onChange={ (e,value) => this.setState({ formatted_address: value }) }                    
                  onPlaceChange={ this.handleAdress } />

                <TextField
                  disabled={ !this.state.changingData }
                  floatingLabelText={languageId === 0 ? 'Contact number' : 'Моб. телефон'}
                  errorText={ this.state.errorPhone && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                >
                    <NumberFormat 
                      value={ this.state.phone && this.state.phone.formattedValue } 
                      format='+##(###)-##-##-###' 
                      onChange={ this.handlePhone }/>
                </TextField> 

                <TextField
                  disabled={ !this.state.changingData }
                  type='password'
                  value={ this.state.password }
                  floatingLabelText={ languageId === 0 ? 'Password' : 'Пароль' } 
                  onChange={ this.handlePassword }/>

            </Col>

          </Row>
          <Row className="center">

                  { this.state.changingData ? 
                    
                    <RaisedButton
                      disabled={ this.state.errorEmail || this.state.errorPhone || this.state.errorPassword || this.state.errorFistName || this.state.errorLastName}
                      label={languageId === 0 ? 'Update' : 'Обновить'}
                      onClick={ this.handleSaveData } />  
                    
                    :
                    
                    <RaisedButton
                      label={languageId === 0 ? 'Change' : 'Изменить'}
                      onClick={ this.handleChangingData } />
                  }
          </Row>
        </Col>
    )
  }
}