import React, { Component } from 'react'
import {Col, Row, Container} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import { Link } from 'react-router-dom'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import SendIcon from 'material-ui/svg-icons/content/send'
import CheckIcon from 'material-ui/svg-icons/action/spellcheck'
import AutoComplete from 'material-ui/AutoComplete'
import Badge from 'material-ui/Badge'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import axios from 'axios'
import moment from 'moment'
import _ from 'lodash'

const styles = {
  smallIcon: {
    width: 18,
    height: 18,
  },
  small: {
    width: 36,
    height: 36,
    padding: 8,
  },
};


const dialogs = {
	container: {
		height: 500,
		marginBottom: 120,
		background: '#fff',
		overflow: 'hidden',
		boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
		borderRadius: 3,
	},

	title: { 
		paddingLeft: 10,
		fontWeight: 400,
		color: '#49c407', 
	},
}


const messages = {
	container: {
		height: 500,
		position: 'relative',
		marginBottom: 100,
		padding: 0,
		overflowY: 'scroll',
		borderRadius: 3,
		background: '#fbfbfb',
		boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
	},

	title: { 
		paddingLeft: 10,
		fontWeight: 400,
		color: '#49c407', 
	},

	message__form__container: {
		position: 'absolute',
		width: 'calc(100% - 30px)',
		padding: 10,
		bottom: 20,
		left: 15,
		background: '#f7f7f7',
		border: '1px solid',
		borderRadius: 4,
		boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
	},

	user__name: {
		fontWeight: 600,
		marginBottom: 0,
	},

	message__text: {
		width: '100%',
		paddingLeft: 10,
		wordWrap: 'break-word',
	}
}


const resetSend = {
  mesText: '',
}

const initialState = {
	showedAccountData: null,
	watchAsAdmin: false,
	listAccountsType: 1,
}


export default class PrivateMessageForm extends Component {
	
  constructor(props) {
    super(props);

    this.state =  Object.assign(initialState, { usersList: [], doctorsList: [], hotelsList: [], messagesList: [], dialogsList: [] })

	this.getUserListDialogs = ::this.getUserListDialogs;
	this.axiosGetListDoctors = ::this.axiosGetListDoctors;
	this.axiosGetListAllUsers = ::this.axiosGetListAllUsers;
	this.axiosGetListAllHotels = ::this.axiosGetListAllHotels;
	this.axiosGetDialogsMessages = ::this.axiosGetDialogsMessages;
	this.sendMessage = ::this.sendMessage;
	this.addDialog = ::this.addDialog;
	this.filterListByAccountType = ::this.filterListByAccountType;
  }

	componentWillMount(){
		this.getUserListDialogs()

		if(this.props.account_type === 0){
			this.axiosGetListAllUsers()
		}

		if(this.props.account_type === 1){
			this.axiosGetListDoctors()
		}

		if(this.props.account_type === 1){
			this.axiosGetListAllHotels()
		}	
	}


	getUserListDialogs(users_id = null) {
			axios
				.get('/api/messages/list-dialogs', {
					params: {
						users_id: users_id ? users_id : (this.props.account_type === 0 ? 0 : this.props.data.users_id),
					}
				})
				.then( response => this.setState({ dialogsList: response.data.data }) )
	}


	axiosGetListDoctors() {

		axios.get('/api/doctors')
			 .then( response => {
			 	let doctorsList = response.data.data.map( item => {
			 		item.text = item.first_name + ' ' + item.last_name
			 		return item;
			 	}) 
			 	this.setState({ doctorsList }) 
			 })		
	}


	axiosGetListAllUsers() {

		axios.get('/api/users/without-admins')
			 .then( response => {
    			
    			const languageId = this.props.languageId;

			 	response.data.data.map( item =>
			 		item.text = 
			 			(item.account_type === 1 && 
							(item.first_name || item.last_name ?  `${item.last_name} ${item.first_name}` : (languageId === 0 ? 'No name' : 'Без имени'))
						 || item.account_type === 2 && 
						 	(item.first_name || item.last_name ?  `${item.last_name} ${item.first_name}` : (languageId === 0 ? 'No name' : 'Без имени'))
						 || item.account_type === 3 && 
						 	(item.h_sname ?  `${item.h_sname}` : (languageId === 0 ? 'No name' : 'Без названия')) ) + `, ${item.email}`
			 	)

			 	this.setState({ constUsersList: response.data.data, usersList: response.data.data }) 
			  })
			
	}


	axiosGetListAllHotels() {

		axios.get('/api/hotels')
			 .then( response => this.setState({ hotelsList: response.data.data }) )
	}


	axiosGetDialogsMessages(dialog_id, second_users_id){

		axios.get('/api/messages/dialog', {
			params: {
				dialog_id,
				users_id: this.props.account_type === 0 ? 0 : this.props.data.users_id,
			}
		}).then( response => this.setState({ messagesList: response.data.data, activeDialogId: dialog_id, second_users_id: second_users_id }) )
	}


	sendMessage() {

		if(this.state.mesText){
			axios.post('/api/messages/send',{
				reply: this.state.mesText,
				sender_id: this.props.account_type === 0 ? 0 : this.props.data.users_id,
				getter_id: this.state.second_users_id, 
			}).then( () => {
				this.axiosGetDialogsMessages(this.state.activeDialogId, this.state.second_users_id)
				this.setState(resetSend) 
			})
		}
	}


	addDialog() {

		if(this.state.newDialogPersonId){
			axios.post('/api/messages/dialogs/create',{
				sender_id: this.props.account_type === 0 ? 0 : this.props.data.users_id,
				getter_id: this.state.newDialogPersonId, 
			}).then( () => {
				this.getUserListDialogs() 
			})
		}
		this.getUserListDialogs()
		this.setState({ newDialogPersonName: '' })

	}


	filterListByAccountType() {
		this.setState({ usersList: _.filter(this.state.constUsersList, { account_type: this.state.listAccountsType }) })
	}

	render() {
    
    const languageId = this.props.languageId;
    const showedAccountData = this.state.showedAccountData;
    console.log(this.state)

		return(
  			<div>
  				<Row style={{ marginTop: 25 }}>
  					{ this.props.account_type === 0 &&
  						<Col style={{ padding: 15 }}>
  							{this.state.watchAsAdmin
  								?	<FlatButton 
  										label={ languageId === 0 ? 'To private messages' : 'К личным сообщениям' }
  										onClick={ () => this.setState({ watchAsAdmin: false, dialogsList: [], messagesList: [], showedAccountData: null }, this.getUserListDialogs) } />
								:	<FlatButton 
  										label={ languageId === 0 ? 'As administator' : 'Как администратор' }
  										onClick={ () => this.setState({ watchAsAdmin: true, dialogsList: [], messagesList: [], showedAccountData: null }, this.getUserListDialogs) } />
							}
						</Col>
  					}

  					<Col sm={12} md={3} xl={3} style={dialogs.container}>
						{this.state.watchAsAdmin 
						?	<div>
								<SelectField
									fullWidth
									floatingLabelText={languageId === 0 ? 'Account type': 'Тип аккаунта'}
									value={this.state.listAccountsType}
									onChange={(event, index, value) => this.setState({ listAccountsType: value, showedAccountData: null }, this.filterListByAccountType )}
								>
									<MenuItem value={1} primaryText={languageId === 0 ? 'Users' : 'Пользователи'} />
									<MenuItem value={2} primaryText={languageId === 0 ? 'Doctors' : 'Врачи'} />
									<MenuItem value={3} primaryText={languageId === 0 ? 'Hotels' : 'Санатории'} />
								</SelectField>

								{ showedAccountData && 
								<div>
									<p> 
									{languageId === 0 ? 'Name: ': 'Пользователь: '}
									{ showedAccountData.account_type === 1 && 
										(showedAccountData.first_name || showedAccountData.last_name ?  `${showedAccountData.last_name} ${showedAccountData.first_name}` : (languageId === 0 ? 'No name' : 'Без имени'))
									 || showedAccountData.account_type === 2 && 
									 	(showedAccountData.first_name || showedAccountData.last_name ?  `${showedAccountData.last_name} ${showedAccountData.first_name}` : (languageId === 0 ? 'No name' : 'Без имени'))
									 || showedAccountData.account_type === 3 && 
									 	(showedAccountData.h_sname ?  `${showedAccountData.h_sname}` : (languageId === 0 ? 'No name' : 'Без названия'))}
									</p>
									<p>{languageId === 0 ? `Email : ${showedAccountData.email}` : `Емейл : ${showedAccountData.email}`}</p>

									<FlatButton
										fullWidth 
										label={languageId === 0 ? 'Back': 'Назад'}
										onClick={() => this.setState({ showedAccountData: null, messagesList: [] })}/>
								</div>} 

								{!showedAccountData && 
									<div style={{height: 420, overflowY: 'scroll'}}>


									{this.state.listAccountsType === 1 && this.state.usersList.map( user =>
										user.account_type === 1 &&
	    								<ListItem
											key={user.id}
											primaryText={ user.first_name || user.last_name ?  `${user.last_name} ${user.first_name}` : (languageId === 0 ? 'No name' : 'Без имени') }
											secondaryText={user.email}
											innerDivStyle={{ padding: '10px 0px' }}
											onClick={() => this.setState({ showedAccountData: user, messagesList: [] }, this.getUserListDialogs(user.id))}/>
									)}

									{this.state.listAccountsType === 2 && this.state.usersList.map( doctor =>
										doctor.account_type === 2 &&
	    								<ListItem
											key={doctor.id}
											primaryText={ doctor.first_name || doctor.last_name ?  `${doctor.last_name} ${doctor.first_name}` : (languageId === 0 ? 'No name' : 'Без имени') }
											secondaryText={doctor.email}
											innerDivStyle={{ padding: '10px 0px' }}
											onClick={() => this.setState({ showedAccountData: doctor, messagesList: [] }, this.getUserListDialogs(doctor.id))}/>

									)}

									{this.state.listAccountsType === 3 && this.state.usersList.map( hotel =>
										hotel.account_type === 3 &&
	    								<ListItem
											key={hotel.id}
											primaryText={ hotel.h_sname ?  `${hotel.h_sname}` : (languageId === 0 ? 'No name' : 'Без названия') }
											secondaryText={hotel.email}
											innerDivStyle={{ padding: '10px 0px' }}
											onClick={() => this.setState({ showedAccountData: hotel, messagesList: [] }, this.getUserListDialogs(hotel.id))}/>
									)}
									</div>
								}
							</div>
						: 	<div>
								<h3 style={dialogs.title}>{ languageId === 0 ? 'Messages' : 'Диалоги' }</h3>
		  						<Divider style={{ margin: 10 }}/>
		  						<div style={{ marginBottom: 15, marginTop: 5 }}>

		                            { (this.props.account_type === 0 || this.props.account_type === 1) && 
		                             <div style={{ position: 'relative' }} >
		                                  <CheckIcon
		                                  	hoverColor='#49c407'
		                                  	style={{ top: 10, right: -5, position: 'absolute', cursor: 'pointer', zIndex: 2 }} 
		                                  	onClick={ this.addDialog }/>
		                                  
		                                  <AutoComplete
		                                    fullWidth
		                                    hintText={languageId === 0 ? 'Add' : 'Добавить'}
		                                    searchText={this.state.newDialogPersonName}
		                                    onNewRequest={newDialogPersonObj => this.setState({ newDialogPersonName: newDialogPersonObj.text, newDialogPersonId: newDialogPersonObj.users_id })}
		                                    dataSource={
		                                    	this.props.account_type === 0 ? this.state.usersList: [] ||
		                                    	this.props.account_type === 1 ? this.state.doctorsList : []
		                                    }
		                                    dataSourceConfig={{
		                                    	text: 'text',
		                                    	value: 'id'
		                                    }}
		                                    maxSearchResults={10}
		                                    filter={AutoComplete.fuzzyFilter}
		                                    openOnFocus={true}
		                                    textFieldStyle={{ width: 500, paddingRight: 320 }}
		                                    menuStyle={{width: 500}}
		                                    style={{width: 500}}                                  
		                                  />
		                              </div>
		                          	}
		                        </div>
		                    </div>
		                }

  						{ this.state.dialogsList.length ?
  							this.state.dialogsList.map( item =>

								<div style={{ position: 'relative' }}>
									{ item.count_unread != '0'  && 
										<Badge
											badgeContent={item.count_unread}
											secondary={true}
											style={{ position: 'absolute', right: 0, top: 0 }} /> }
    								<ListItem
										key={item.id}
										leftAvatar={ 
											<img 
												className='avatar-sm'  
												src={ item.account_type === 0 ? '/images/administrator.png' : item.avatar || '/images/user_default.png' } 
												onError={ (e) => (e.currentTarget).src = '/images/user_default.png' } /> 
										}
										primaryText={ 
											item.account_type === 1 && 
											(item.first_name || item.last_name ?  `${item.last_name} ${item.first_name}` : (languageId === 0 ? 'No name' : 'Без имени'))
											|| item.account_type === 2 && 
											(item.first_name || item.last_name ?  `${item.last_name} ${item.first_name}` : (languageId === 0 ? 'No name' : 'Без имени'))
											|| item.account_type === 3 && 
											(item.h_sname ?  `${item.h_sname}` : (languageId === 0 ? 'No name' : 'Без названия'))
										}
										secondaryText={ 
											item.account_type === 0 && (languageId === 0 ? 'Administator' : 'Администратор') ||
											item.account_type === 1 && (languageId === 0 ? 'User' : 'Пользователь') ||
											item.account_type === 2 && (languageId === 0 ? 'Doctor' : 'Врач') ||
											item.account_type === 3 && (languageId === 0 ? 'Sanatorium' : 'Санаторий')
										} 
										onClick={ () => this.axiosGetDialogsMessages(item.c_id, item.users_id) }
										style={ item.c_id === this.state.activeDialogId ? { backgroundColor: '#9fdd7e2e' } : {} }/>
								</div>
  							)
  						: <h4>{ languageId === 0 ? 'Empty list' : 'Пустой список' }</h4> }


  					</Col>
  					<Col sm={12} md={9} xl={9} style={messages.container}>
						{ this.state.messagesList.length ?
							this.state.messagesList.map( (item, index) =>
							<div style={{ background: item.status === 0 ? '#f1f1f1' : 'initial' }}>
								<div style={messages.user__name}>
									{  (this.state.showedAccountData ? (item.users_id === this.state.showedAccountData.id ) : item.users_id === 0 && this.props.data.account_type === 0 ) || item.users_id === this.props.data.users_id 
										? <b style={{ color: '#49c407' }}>{ languageId === 0 ? 'YOU :' : 'ВЫ :' }</b> 
										: <b style={{ color: 'gray' }}>{ languageId === 0 ? 'He: ': 'Он:' }</b>
									}												
									<p style={{ float: 'right' }}>{ moment(item.time).format('YYYY.MM.DD') }</p>
								</div>
								<p style={messages.message__text}>
									{item.reply}
								</p>								
							</div>
							)
						: <h4 style={{ marginTop: 0, padding: 20 }}>{ 
							!this.state.activeDialogId ? (languageId === 0 ? 'Select dialog' : 'Выберите диалог')
							: (languageId === 0 ? 'No messages' : 'Сообщений нет') }</h4> }
							
						{ !this.state.watchAsAdmin && 
							<div style={messages.message__form__container} className={ !this.state.second_users_id && 'hidden' }>
								<Row>
									<Col xs={10}>
										<TextField
											fullWidth
											multiLine={true}
											rowsMax={4}
											hintText={ languageId === 0 ? 'Message' : 'Сообщение' }
											value={this.state.mesText}
											onChange={ (e,value) => this.setState({ mesText: value }) }
											style={{ marginBottom: 0 }} />
									</Col>
									<Col xs={2}>
										<IconButton
											iconStyle={styles.smallIcon}
											style={styles.small}
											onClick={ this.sendMessage }
											style={{ marginBottom: 0 }} 
										>
											<SendIcon />
										</IconButton>
									</Col>
								</Row>
							</div>
						}
  					</Col>
  				</Row>
  			</div>
		)
	}
}
