import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Slider from 'material-ui/Slider'
import axios from 'axios'
import _ from 'lodash'

const initialState =	{

}


export default class HotelPricingCOndition extends Component {


	constructor(props) {
		super(props);

		this.state = initialState

	    this.axiosGetCancelationPolicy = ::this.axiosGetCancelationPolicy;
	    this.saveChanges = ::this.saveChanges;
	}

	componentWillMount(){
		this.axiosGetCancelationPolicy()
	}

	axiosGetCancelationPolicy () {
		axios.get('/api/hotels/cancelation_policy', {
			params: {
				users_id: this.props.data.users_id
			}
		}).then( response => this.setState(response.data.data[0]) )
	}

	saveChanges () {

		axios.post('/api/hotels/cancelation_policy/update', {
			users_id: this.props.data.users_id,
			prep_needed: this.state.prep_needed,
			days_no_penalts: this.state.days_no_penalts,
			amount_penalt: this.state.amount_penalt,

		}).then( response => this.axiosGetCancelationPolicy() )
	}

	render() {

		const languageId = this.props.languageId - 0;
		console.log(this.state)

		return(
				<div>
					<Row>
						<Col>
							<h1>{ languageId === 0 ? 'Policy, if booking was canceled' : 'Условия, если бронирование было отменено' }</h1>
						</Col>
						<Col>
							<SelectField
								floatingLabelText={ languageId === 0 ? 'Prepayment' :  'Предоплата'}
								value={this.state.prep_needed}
								onChange={ (e,i,value) => this.setState({ prep_needed: value }) }
							>
								<MenuItem value={1} primaryText={ languageId === 0 ? 'Needed' : 'Требуется' } />
								<MenuItem value={0} primaryText={ languageId === 0 ? 'Not needed' : 'Не нужна' } />
							</SelectField>
						</Col>
						<Col>
							{
								this.state.prep_needed
								?	<Row>
										<Col xs={6}>
											<TextField 
												floatingLabelText={ languageId === 0 ? 'Days without penalts' : 'Дней без штрафа'}
												errorText={ this.state.errorDaysNoPenalts && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
												value={this.state.days_no_penalts}
												onChange={ (e, value) => this.setState({ days_no_penalts: value, errorDaysNoPenalts: Boolean(parseInt(value) <= 0) }) }/>
										</Col>
										<Col xs={6}>
											<SelectField
												floatingLabelText={ languageId === 0 ? 'Penalts amount' :  'Размер штрафа'}
												value={this.state.amount_penalt}
												onChange={ (e,i,value) => this.setState({ amount_penalt: value }) }
											>
												<MenuItem value={1} primaryText={ languageId === 0 ? '1 night' : '1 ночь' } />
												<MenuItem value={2} primaryText={ languageId === 0 ? 'Total price' : 'Вся сумма' } />
											</SelectField>
										</Col>								
									</Row>
								: 	<h4>{ languageId === 0 ? 'Cancellation is always without penalties' : 'Отмена всегда без штрафов' }</h4>
							}
						</Col>
						<Col>
							<RaisedButton
								disabled={ this.state.prep_needed && (this.state.errorDaysNoPenalts || !this.state.days_no_penalts) }
								label={ languageId === 0 ? 'Save changes' : 'Сохранить изменения' } 
								onClick={ this.saveChanges }
								style={{ marginTop: 20 }}/>
						</Col>
					</Row>
				</div>

		)
	}
}