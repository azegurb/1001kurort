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

import AvatarEditor from '../AvatarEditor'

import axios from 'axios'

import { bindActionCreators } from 'redux';
import * as pageActions from '../../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'

const initalState = {
                      openPaswordModal : false,
                      changingData : false,
                      currentPassword : false,
                      checkCurrentPassword: false
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


export default class HotelsMyProfile extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      openPaswordModal : false,
      changingData : false,

    };

    this.handleSaveData = ::this.handleSaveData;
    this.handleAvatar = ::this.handleAvatar;
    this.handleChangingData = ::this.handleChangingData;
    this.handleEmail = ::this.handleEmail;
    this.handleContactNumber = ::this.handleContactNumber;
    this.handlePassword = ::this.handlePassword;
  }

  componentWillMount(){
      this.setState({ 
              email : this.props.profile.user.email || '',
              contactNumber : {
                                formattedValue : this.props.profile.user.phone || ''
                              },
              password : this.props.profile.user.password || '',
              avatar : this.props.profile.user.avatar,
      })
   
  }

  componentWillReceiveProps(nextProps){

      this.setState({ 
              email : this.props.profile.user.email || '',
              contactNumber : {
                                formattedValue : this.props.profile.user.phone || ''
                              },
              password : this.props.profile.user.password || '',
              avatar : this.props.profile.user.avatar,
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
              email: this.state.email || '',
              phone: this.state.contactNumber.formattedValue,
              avatar: response.data.data.link ,
              password : this.state.password || '',
              account_type : 3
            })
            .then( response => { 

                  this.props.pageActions.loginUser(response.data.id_token)
                  this.props.pageActions.updateUser();

                  this.setState(initalState)
            })
      })
    }else{

      axios.post('/api/profile/info/update' , 
        {
          users_id: this.props.profile.user.users_id,
          email: this.state.email || '',
          phone: this.state.contactNumber.formattedValue ? this.state.contactNumber.formattedValue : this.state.contactNumber,
          avatar: this.state.avatar ,
          password : this.state.password || '',
          account_type : 3
        })
        .then( response => { 

              this.props.pageActions.loginUser(response.data.id_token)
              this.props.pageActions.updateUser();

              this.setState(initalState)
        })      
    }
  }


  handleAvatar(uploadedImage) {
    this.setState({ uploadedImage })
  }

  handleChangingData() {
    this.setState({ changingData: !this.state.changingData }) 
  }

  handleEmail(event, email ) {
    this.setState({ email, errorEmail : !Boolean(email) })
  }

  handleContactNumber(event, index, contactNumber ) {
    this.setState({ contactNumber: event.target.value, errorContactNumber : !Boolean(event.target.value.length === 18 ) })
  }

  handlePassword(event, password) {
    this.setState({ password, errorPassword : !Boolean(password) })
  }

  render(){
    const languageId = this.props.languageId;

    console.log(this.props)
    return(
        <Col sm={10} md={8} lg={8} xl={6} offset={{sm: 1, md: 2, lg: 2, xl: 3}}>    
          <Row> 
            <Col xs={12} xl={6} style={{ marginTop: 20 }}>
                <AvatarEditor 
                disabled={ !this.state.changingData } 
                src={ this.props.data.avatar } 
                handleAvatar = { (uploadedImage ) => ::this.handleAvatar(uploadedImage) }
                account_type={3}/>
            </Col>               
            <Col xs={12} xl={6}>

                <TextField
                  disabled={ !this.state.changingData }
                  value={ this.state.email }
                  floatingLabelText={ languageId === 0 ? 'E-mail' : 'Eмайл' } 
                  onChange={ ::this.handleEmail } />

                <TextField
                  disabled={ !this.state.changingData }
                  floatingLabelText={languageId === 0 ? 'Contact number' : 'Моб. телефон'}
                  errorText={ this.state.errorContactNumber && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
                >
                    <NumberFormat 
                      value={ this.state.contactNumber && this.state.contactNumber.formattedValue } 
                      format='+##(###)-##-##-###' 
                      onChange={ ::this.handleContactNumber }/>
                </TextField> 


                <TextField
                  disabled={ !this.state.changingData }
                  type='password'
                  value={ this.state.password }
                  floatingLabelText={ languageId === 0 ? 'Password' : 'Пароль' } 
                  onChange={ this.handlePassword }/>
                
            </Col>

          </Row>
          <Row className="center" style={{ marginTop: 20 }}>

                  { this.state.changingData ? 
                    
                    <RaisedButton
                      disabled={ this.state.errorEmail || this.state.errorContactNumber }
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