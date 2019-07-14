import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import FullscreenDialog from 'material-ui-fullscreen-dialog'
import TextField from 'material-ui/TextField'
import Popover from 'material-ui/Popover'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import NumberFormat from 'react-number-format'

import axios from 'axios'

const initialState = {}

export default class HotelsPaymentMethods extends Component {

	constructor(props) {
		super(props);

		this.state = initialState

		this.saveChanges = ::this.saveChanges;
		this.handleAvailVisa = ::this.handleAvailVisa;
		this.handleAvailMaestro = ::this.handleAvailMaestro;
		this.handleAvailMaster = ::this.handleAvailMaster;
		this.handleAvaiCheckInPay = ::this.handleAvaiCheckInPay;
		this.handleVisaNumber = ::this.handleVisaNumber;
		this.handleMasterNumber = ::this.handleMasterNumber;
		this.handleMaestroNumber = ::this.handleMaestroNumber;
	}
    
    componentWillMount(){
		axios.get('/api/profile/hotel/payments', {
			params: {
				users_id: this.props.data.users_id
			}
		}).then( response => 
			this.setState({
				visaNumber: { value : response.data.data.h_payments_visa, floatValue: parseInt(response.data.data.h_payments_visa), formattedValue: response.data.data.h_payments_visa },
				masterNumber: { value : response.data.data.h_payments_master, floatValue: parseInt(response.data.data.h_payments_master), formattedValue: response.data.data.h_payments_master },
				maestroNumber: { value : response.data.data.h_payments_maestro, floatValue: parseInt(response.data.data.h_payments_maestro), formattedValue: response.data.data.h_payments_maestro },
				availVisa: Boolean(parseInt(response.data.data.h_payments_visa)),
				availMaster: Boolean(parseInt(response.data.data.h_payments_master)),
				availMaestro: Boolean(parseInt(response.data.data.h_payments_maestro)),
				availCheckInPay: response.data.data.h_payments_checkin,
			})
		)
	}

	saveChanges() {
		let visaNumber = this.state.visaNumber && this.state.visaNumber.value,
			masterNumber = this.state.masterNumber && this.state.masterNumber.value,
			maestroNumber = this.state.maestroNumber && this.state.maestroNumber.value

			axios.post('/api/profile/hotel/payments/update', {
				payments_visa : visaNumber || 0,
				hpayments_master: masterNumber || 0,
				payments_maestro: maestroNumber || 0,
				payments_checkin: this.state.availCheckInPay,
				users_id: this.props.data.users_id,
			})
	}

	handleAvailVisa(event, value) {
		this.setState({ availVisa : value})
	}

	handleAvailMaster(event, value) {
		this.setState({ availMaster : value })
	}

	handleAvailMaestro(event, value) {
		this.setState({ availMaestro : value })
	}

	handleAvaiCheckInPay(event, value) {
		this.setState({ availCheckInPay : value })
	}

	handleVisaNumber(event, visaNumber ) {
		this.setState({ visaNumber, errorVisaNumber : !Boolean(event.target.value.length === 19 ) })
	}

	handleMasterNumber(event, masterNumber ) {
		this.setState({ masterNumber, errorMasterNumber : !Boolean(event.target.value.length === 19 ) })
	}

	handleMaestroNumber(event, maestroNumber ) {
		this.setState({ maestroNumber, errorMaestroNumber : !Boolean(event.target.value.length === 19 ) })
	}
	
	render() {
		
		const languageId = this.props.languageId - 0;
		console.log(this.state)
		return(
				<div>
					<Row style={{ marginTop: 20 }}>
						<Col xs={12} xl={6}>
							<Checkbox
								checked={ this.state.availVisa }
								label={ languageId === 0 ? 'VISA' : 'VISA' }
								onCheck={ ::this.handleAvailVisa } />							

							<Checkbox
								checked={ this.state.availMaster }
								label={ languageId === 0 ? 'Master' : 'Master' } 
								onCheck={ ::this.handleAvailMaster } />
							
							<Checkbox
								checked={ this.state.availMaestro }
								label={ languageId === 0 ? 'Maestro' : 'Maestro' } 
								onCheck={ ::this.handleAvailMaestro } />							
							
							<Checkbox
								checked={ this.state.availCheckInPay }
								label={ languageId === 0 ? 'Payment at check-in' : 'Оплата при заселении' } 
								onCheck={ ::this.handleAvaiCheckInPay } />
						</Col>
						<Col xs={12} xl={6} style={{ textAlign: 'right' }}>
							<RaisedButton
								disabled={ 
									this.state.errorVisaNumber || 
									this.state.errorMasterNumber || 
									this.state.errorMaestroNumber || 
									(!this.state.availVisa && !this.state.availMaestro && !this.state.availMaster && !this.state.availCheckInPay) 
								}
								label={ languageId === 0 ? 'Save' : 'Сохранить' } 
								onClick={ this.saveChanges }/>
							{ 
								(this.state.errorVisaNumber || this.state.errorMasterNumber || this.state.errorMaestroNumber) && 
								<h5 style={{ color: '#f44336' }}>{ languageId === 0 ? 'Please, check card numbers' : 'Пожалуйста, проверьте номера карт' }</h5>
								|| (!this.state.availVisa && !this.state.availMaestro && !this.state.availMaster && !this.state.availCheckInPay) && 
								<h5 style={{ color: '#f44336' }}>{ languageId === 0 ? 'Please, select at least 1 item' : 'Пожалуйста, выберите как минимум 1 пункт' }</h5>								
							}
						</Col>
					</Row>
					<Row>	
						<Col className={ this.state.availVisa ? '' : 'hidden' }>
							<Paper zDepth={1} style={{ padding: 15, marginTop : 15 }}>
								<h4>Visa</h4>
								<TextField 
									hintText='#### #### #### ####'
									errorText={ this.state.errorVisaNumber && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
								>
									<NumberFormat 
										value={ this.state.visaNumber && this.state.visaNumber.formattedValue } 
										format='#### #### #### ####' 
										onChange={ ::this.handleVisaNumber }/>
								</TextField> 
							</Paper>
						</Col>
						
						<Col className={ this.state.availMaster ? '' : 'hidden' }>
							<Paper zDepth={1} style={{ padding: 15, marginTop : 15 }}>
								<h4>Master</h4>
								<TextField 
									hintText='#### #### #### ####'
									errorText={ this.state.errorMasterNumber && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
								>
									<NumberFormat 
										value={ this.state.masterNumber && this.state.masterNumber.formattedValue } 
										format='#### #### #### ####' 
										onChange={ ::this.handleMasterNumber }/>
								</TextField> 
							</Paper>
						</Col>
						
						<Col className={ this.state.availMaestro ? '' : 'hidden' }>
							<Paper zDepth={1} style={{ padding: 15, marginTop : 15 }}>
								<h4>Maestro</h4>
								<TextField 
									hintText='#### #### #### ####'
									errorText={ this.state.errorMaestroNumber && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') }
								>
									<NumberFormat 
										value={ this.state.maestroNumber && this.state.maestroNumber.formattedValue } 
										format='#### #### #### ####' 
										onChange={ ::this.handleMaestroNumber }/>
								</TextField> 
							</Paper>
						</Col>
					</Row>
				</div>
		)
	}
}