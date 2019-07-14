import React, { Component}  from 'react'
import ReactDom from 'react-dom'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import SelectField from 'material-ui/SelectField'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import CircularProgress from 'material-ui/CircularProgress'
import Checkbox from 'material-ui/Checkbox';

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const initialState = {
	account_type: 1,
}

export default class AdminTransfer extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ hotels: [], doctors: [] }, initialState)

		this.axiosGetHotels = ::this.axiosGetHotels;
		this.axiosGetDoctors = ::this.axiosGetDoctors;
	}

	componentWillMount(){
		this.axiosGetHotels()
		this.axiosGetDoctors()
	}

	axiosGetHotels() {
		axios.get('/api/hotels')
			 .then( response => this.setState({ hotels: response.data.data }) )
	}


	axiosGetDoctors() {
		axios.get('/api/doctors')
			 .then( response => this.setState({ doctors: response.data.data }) )
	}

	approveAccount(id) {
		axios.post('/api/admin/account/approve', {id})
			 .then( res => {
			 	this.axiosGetHotels()
				this.axiosGetDoctors()
			 })
	}

	blockAccount(id) {
		axios.post('/api/admin/account/block', {id})
			 .then( res => {
			 	this.axiosGetHotels()
				this.axiosGetDoctors()
			 })

	}

	render() {
		const languageId = this.props.languageId - 0;
		const usersList = this.state.account_type === 1 ? this.state.doctors : this.state.hotels; 
		
		console.log(this.state)

		return(	
			<div>
				<Row style={{ marginTop: 20 }}>
					<Col style={{ marginBottom: 30 }}>
						<SelectField
							floatingLabelText={languageId === 0 ? 'Account type' : 'Тип аккаунта' }
							value={this.state.account_type}
							onChange={(e,i,value) => this.setState({ account_type : value })}
						>
							<MenuItem value={1} primaryText={languageId === 0 ? 'Doctors' : 'Врачи'} />
							<MenuItem value={2} primaryText={languageId === 0 ? 'Sanatoriums' : 'Санатории'} />						
						</SelectField>
					</Col>
					<Col>
						{usersList.map( (item, index) =>
							<Row>
								<Col xs={6}>
									<p style={{ marginTop: 10, color: item.admin_approved === 1 ? '#55c901' : item.admin_approved === -1 ? '#f9886b' : 'inherit' }}>
										{index+1}. {item.account_type === 2 ? `${item.first_name} ${item.last_name}, ${item.email}` : `${item.h_sname}, ${item.email}`}
									</p>
								</Col>
								<Col xs={6}>
									{ (item.admin_approved === 0 || item.admin_approved === -1) &&
										<RaisedButton 
											label={languageId === 0 ? 'Approve' : 'Подтвердить'}
											onClick={() => this.approveAccount(item.users_id)} /> }
									{ item.admin_approved === 1 && 
										<RaisedButton 
											label={languageId === 0 ? 'Block' : 'Заблокировать'}
											onClick={() => this.blockAccount(item.users_id)} /> }
								</Col>
							</Row>
						)}
					</Col>
				</Row>
			</div>
		)
	}

}