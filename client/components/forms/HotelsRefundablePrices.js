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
import Checkbox from 'material-ui/Checkbox'

import axios from 'axios'


const initialState =	{
							rooms: [],
							priceCategories: [],
							discountValue: 0
						}


export default class HotelsRefundablePrices extends Component {


	constructor(props) {
		super(props);

		this.state = initialState

		this.changeDiscountValue = ::this.changeDiscountValue;
		this.createCondition = ::this.createCondition;
	}


	componentWillMount() {
		
		axios.get('/api/profile/hotel/rooms',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			this.setState (
				{ 
					rooms : response.data.data,
				}
			)
		})

		this.setState({ rooms : [] })
		

		axios.get('/api/profile/hotel/price-categories',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			let result = []
			
			response.data.data.map( item => {

				result.push({
					id: item.id,
					label : item.name,
				})
			})

			this.setState({ priceCategories : result })
		})
	}


	changeDiscountValue(event, discountValue ) {
		this.setState({ discountValue : discountValue > 100 ? 100 : discountValue })
	}

	createCondition() {
		this.setState({})
	}
	
	render() {

		const languageId = this.props.languageId - 0;
		
		console.log(this.state)		

		return(
				<div>
					<Row style={{ marginTop: 10 }}>
						
						<Col xs={6} style={{ borderRight : '1px solid black'}}>
							<h4>{ languageId === 0 ? 'Select room type' : 'Выберите тип комнат' }</h4>
						
							{
								this.state.rooms.length ? 

									this.state.rooms.map( (room, index) => (
										<Checkbox key={room.id} label={ room.sname } />
									))

								:
									languageId === 0 ? 'You don`t have any rooms' : 'У вас нет комнат'
							}

							<h4>{ languageId === 0 ? 'Select price category' : 'Выберите ценовую категорию' }</h4>
						
							{
								this.state.rooms.length ? 

									this.state.priceCategories.map( (category, index) => (
										<Checkbox key={category.id} label={ category.label } />
									))

								:
									languageId === 0 ? 'You don`t have any rooms' : 'У вас нет комнат'
							}
						</Col>
					
						<Col xs={6} >
							<h4>{ languageId === 0 ? 'Apply discount' : 'Применить скидку' }</h4>
							<TextField
								hintText={ languageId === 0 ? '...' : '....' } 
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								style={{ width: 50 }}
								value={ this.state.discountValue }
								onChange={ ::this.changeDiscountValue } />
							<label style={{ top: 56, left: 50, position: 'absolute', color: '#333' }}>
								%
							</label>

							<RaisedButton
								label={languageId === 0 ? 'Confirm' : 'Подтвердить'}
								style={{ marginLeft : 20 }} 
								onClick={ ::this.createCondition }/>
						</Col>

					</Row>
					<Row>

						<Col xs={12}>
						</Col>
						
					</Row>
				</div>

		)
	}
}