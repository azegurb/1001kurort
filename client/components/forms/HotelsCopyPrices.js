import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import Toggle from 'material-ui/Toggle';
import _ from 'lodash'

import axios from 'axios'

const months = [
  {value: 1, label: [ 'January', 'Январь'] },
  {value: 2, label: [ 'February', 'Февраль'] },
  {value: 3, label: [ 'March', 'Март'] },
  {value: 4, label: [ 'April', 'Апрель'] },
  {value: 5, label: [ 'May', 'Май'] },
  {value: 6, label: [ 'June', 'Июнь'] },
  {value: 7, label: [ 'July', 'Июль'] },
  {value: 8, label: [ 'August', 'Август'] },
  {value: 9, label: [ 'September', 'Сентябрь'] },
  {value: 10, label: [ 'October', 'Октябрь'] },
  {value: 11, label: [ 'November', 'Ноябрь'] },
  {value: 12, label: [ 'December', 'Декабрь'] },
]

const years = [
  {value: 2017, label: '2017' },
  {value: 2018, label: '2018' },
  {value: 2019, label: '2019' },
  {value: 2020, label: '2020' },
  {value: 2021, label: '2021' },
  {value: 2022, label: '2022' },
  {value: 2023, label: '2023' },
  {value: 2024, label: '2024' },
  {value: 2025, label: '2025' },
  {value: 2026, label: '2026' },
  {value: 2027, label: '2027' },
  {value: 2028, label: '2028' },
  {value: 2029, label: '2029' },
  {value: 2030, label: '2030' },
]

const initialState =	{
							monthStartCopy : '',
							monthEndCopy : '',
							yearStartCopy: '',
							yearEndCopy: '', 
							priceCategories : [],
							rooms: [],
							discountValue: 0
						}



export default class HotelsCalendar extends Component {
	

	constructor(props) {
		super(props);

		this.state = initialState

	    this.updatePrices = ::this.updatePrices;
	    this.handleIsCopyByMonth = ::this.handleIsCopyByMonth;
	    this.handleYearStartCopy = ::this.handleYearStartCopy;
	    this.handleYearEndCopy = ::this.handleYearEndCopy;
	    this.handleMonthStartCopy = ::this.handleMonthStartCopy;
	    this.handleMonthEndCopy = ::this.handleMonthEndCopy;
	    this.changeDiscountValue = ::this.changeDiscountValue;
	    this.selectAllWeekDays = ::this.selectAllWeekDays;
	    this.unselectAllWeekDays = ::this.unselectAllWeekDays;
	    this.selectAllPriceCategories = ::this.selectAllPriceCategories;
	    this.unselectAllPriceCategories = ::this.unselectAllPriceCategories;
	    this.selectAllRooms = ::this.selectAllRooms;
	    this.unselectAllRooms = ::this.unselectAllRooms;
	}


	componentWillMount() {
		
		axios.get('/api/profile/hotel/rooms',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			this.setState ({ rooms : response.data.data })
		})

		axios.get('/api/profile/hotel/price-categories',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			this.setState({ priceCategories : response.data.data })
		})	
	}

	updatePrices() {
		const state = this.state;

		axios.post('/api/profile/copy-prices', {
			category_ids: this.state.category_ids || [],
			rooms_ids: this.state.rooms_ids || [],
			copyByYear: !this.state.isCopyByMonth,
			year: (this.state.yearEndCopy || 0 ).toString(),
			startYear: (this.state.yearStartCopy || 0 ).toString(),
			endYear: (this.state.yearEndCopy || 0 ).toString(),
			startMonth: (this.state.monthStartCopy || 0).toString(),
			endMonth: (this.state.monthEndCopy || 0).toString(),
			percent: this.state.discountValue || 0
		}).then( response => {

		})	
	}

	handleIsCopyByMonth( event, isCopyByMonth ) { 
		this.setState({ isCopyByMonth })
	}

	handleYearStartCopy(event, index, yearStartCopy ) {
		this.setState({ yearStartCopy })
	}

	handleYearEndCopy(event, index, yearEndCopy ) {
		this.setState({ yearEndCopy })
	}

	handleMonthStartCopy(event, index, monthStartCopy ) {
		this.setState({ monthStartCopy })
	}

	handleMonthEndCopy(event, index, monthEndCopy ) {
		this.setState({ monthEndCopy })
	}

	changeDiscountValue(event, discountValue) {
		this.setState({ discountValue : discountValue !== '' ? parseInt(discountValue) : '' })
	}

	selectAllWeekDays() {
		this.setState({ weekDays : _.forEach( this.state.weekDays, item => {  item.checked = true }) })
	}
	
	unselectAllWeekDays() { 
		this.setState({ weekDays : _.forEach( this.state.weekDays, item => {  item.checked = false })  })
	}

	selectAllPriceCategories() {
		this.setState({ priceCategories : _.forEach( this.state.priceCategories, item => {  item.checked = true }) })
	}
	
	unselectAllPriceCategories() {
		this.setState({ priceCategories : _.forEach( this.state.priceCategories, item => {  item.checked = false })  })
	}

	selectAllRooms() {
		this.setState({ rooms : _.forEach( this.state.rooms, item => {  item.checked = true }) })
	}
	
	unselectAllRooms() {
		this.setState({ rooms : _.forEach( this.state.rooms, item => {  item.checked = false })  })
	}

	handleWeekDayChange( e, value, weekDays ) {

		let selectedValues = [],
			newData = []

		weekDays.forEach( day => {

			if( day.id === parseInt(e.target.dataset.key) ){

				day.checked = value
			}

			if(day.checked) {
				selectedValues.push(day.key);
			}

			newData.push(day);
		})

		this.setState({ weekDays: newData });

	}

	
	handlePriceCategoryChange( e, value, id ) {

		let priceCategories = this.state.priceCategories,
			selectedValues = [],
			newData = []

		priceCategories.forEach( category => {


			if( category.category_id === id ){

				category.checked = value
			}

			if(category.checked) {
				selectedValues.push(category.category_id);
			}

			newData.push(category);
		})

		this.setState({ priceCategories: newData, category_ids: selectedValues });

	}	


	handleRoomsChange( e, value, id ) {

		let rooms = this.state.rooms,
			selectedValues = [],
			newData = []

		rooms.forEach( room => {

			if( room.room_id ===  id ){

				room.checked = value
			}

			if(room.checked) {
				selectedValues.push(room.room_id);
			}

			newData.push(room);
		})

		this.setState({ rooms: newData, rooms_ids: selectedValues });

	}


	
	render() {
		
		const languageId = this.props.languageId - 0;
		console.log(this.state)

		return(
				<div>

					<Row>

						<Col xs={4}>
							<Toggle 
								label={ languageId === 0 ? 'Copy by month' : 'Копировать по месяцам' } 
								style={{ marginTop: 10 }}
								onToggle={ this.handleIsCopyByMonth } />						
						</Col>

						<Col xs={4}>
							<h5>{ languageId === 0 ? 'For one or more multiple price categories' : 'Для одной или нескольких кратных ценовых категорий' }</h5>				
						</Col>

						<Col xs={4}>
							<h5>{ languageId === 0 ? 'For one or more multiple room types' : 'Для одного или нескольких типов номеров' }</h5>
						</Col>

					</Row>
					<Row style={{ marginTop: 10 }}>
					{ 
						this.state.isCopyByMonth ?

							<Col xs={4}>
								<h4>{ languageId === 0 ? 'Copy begin' : 'Начать копировать' }</h4>
								<SelectField
									value={ this.state.monthStartCopy }
									onChange={this.handleMonthStartCopy }
									style={{ width: 135 }}
								>
									{
										months.map( (month) => 
											<MenuItem
												key={month.value}
												value={ month.value }
												primaryText={ month.label[languageId] }/>
										)
									}							
								</SelectField>							

								<SelectField
									value={ this.state.yearStartCopy }
									onChange={this.handleYearStartCopy }
									style={{ width: 100, marginLeft: 10 }}
								>
									{
										years.map( (year) => 
											<MenuItem
												key={year.value}
												value={ year.value }
												primaryText={ year.label }/>
										)
									}							
								</SelectField>
								
								<h4>{ languageId === 0 ? 'Сopy end' : 'Копировать до' }</h4>
							
								<SelectField
									value={ this.state.monthEndCopy }
									onChange={this.handleMonthEndCopy }
									style={{ width: 135 }}
								>
									{
										months.map( (month) => 
											<MenuItem
												key={month.value}
												value={ month.value }
												primaryText={ month.label[languageId] }/>
										)
									}							
								</SelectField>

								<SelectField
									value={ this.state.yearEndCopy }
									onChange={this.handleYearEndCopy }
									style={{ width: 100, marginLeft: 10 }}
								>
									{
										years.map( (year) => 
											<MenuItem
												key={year.value}
												value={ year.value }
												primaryText={ year.label }/>
										)
									}							
								</SelectField>
							</Col>

						:

							<Col xs={4}>
								<h4>{ languageId === 0 ? 'Сopy prices all year' : 'Копировать цены всего года' }</h4>

								<SelectField
									value={ this.state.yearEndCopy }
									onChange={this.handleYearEndCopy }
									style={{ width: 100, marginLeft: 10 }}
								>
									{
										years.map( (year) => 
											<MenuItem
												key={year.value}
												value={ year.value }
												primaryText={ year.label }/>
										)
									}							
								</SelectField>								
							</Col>

					}

						<Col xs={4}>
							<RaisedButton
								label={languageId === 0 ? 'Select all' : 'Выбрать все'}
								labelStyle={{ fontWeight: 600, fontSize: 12,}}
								style={{ height: 20, lineHeight: '20px', margin: 10 }}
								onClick={ ::this.selectAllPriceCategories }/>
							<RaisedButton
								label={languageId === 0 ? 'Unselect all' : 'Снять все'}
								labelStyle={{ fontWeight: 600, fontSize: 12 }}
								style={{ height: 20, lineHeight: '20px', margin: 10  }}
								onClick={ ::this.unselectAllPriceCategories }/>							

							{
								this.state.priceCategories.map( (priceCategory , index) => ( 
									<Checkbox key={priceCategory.category_id} label={ priceCategory.name } checked={ priceCategory.checked } onCheck={ (e, checked ) => this.handlePriceCategoryChange(e, checked, priceCategory.category_id ) }/>
								))
							}						
						</Col>

						<Col xs={4}>
							<RaisedButton
								label={languageId === 0 ? 'Select all' : 'Выбрать все'}
								labelStyle={{ fontWeight: 600, fontSize: 12 }}
								style={{ height: 20, lineHeight: '20px', margin: 10 }}
								onClick={ ::this.selectAllRooms }/>
							<RaisedButton
								label={languageId === 0 ? 'Unselect all' : 'Снять все'}
								labelStyle={{ fontWeight: 600, fontSize: 12 }}
								style={{ height: 20, lineHeight: '20px', margin: 10 }}
								onClick={ ::this.unselectAllRooms }/>						
							{
								this.state.rooms.map( (room , index) => ( 
									<Checkbox key={room.room_id} label={ languageId === 0 ? room.sname : room.sname_rus } checked={ room.checked } onCheck={ (e, checked ) => this.handleRoomsChange(e, checked, room.room_id) }/>
								))							
							}
						</Col>

					</Row>					
					<Row style={{ marginTop: 50, marginBottom: 200 }} className='center'>

						<Col xs={6}>
							<h4>
								{ 
									this.state.isCopyByMonth ? 

										(
											languageId === 0 ? 

												`Copy prices ${this.state.monthStartCopy ? this.state.monthStartCopy : '__'} ${this.state.yearStartCopy ? this.state.yearStartCopy : '____'} - ${this.state.monthEndCopy ? this.state.monthEndCopy : '__'} ${this.state.yearEndCopy ? this.state.yearEndCopy : '____'} with an increase`
											:
												`Копировать цены ${this.state.monthStartCopy ? this.state.monthStartCopy : '__'} ${this.state.yearStartCopy ? this.state.yearStartCopy : '____'} - ${this.state.monthEndCopy ? this.state.monthEndCopy : '__'} ${this.state.yearEndCopy ? this.state.yearEndCopy : '____'} с повышением`
										)
									:
										(
											languageId === 0 ?

												`Copy prices ${this.state.yearEndCopy ? this.state.yearEndCopy : '____' } with an increase`
											:
												`Копировать цены ${this.state.yearEndCopy ? this.state.yearEndCopy : '____' } с повышением`
										)
								}
							</h4>
						</Col>

						<Col xs={2} lg={1}>	
							<TextField
								hintText={ languageId === 0 ? '...' : '....' } 
								underlineFocusStyle={{borderColor: '#49c407'}}
								floatingLabelFocusStyle={{color: '#49c407'}}
								style={{ width: 50, top: -5 }}
								value={ this.state.discountValue }
								onChange={ ::this.changeDiscountValue } />
							<label style={{ top: 10, left: 88, position: 'absolute', color: '#333' }}>
								%
							</label>						
						</Col>

						<Col xs={4} lg={2}>
							<RaisedButton
								label={languageId === 0 ? 'Confirm' : 'Подтвердить'}
								style={{ marginLeft : 20 }} 
								onClick={ this.updatePrices }/>
						</Col>

					</Row>
				</div>

		)
	}
}