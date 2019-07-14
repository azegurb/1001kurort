import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import DatePicker from 'material-ui/DatePicker'
import Checkbox from 'material-ui/Checkbox'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import _ from 'lodash'

import axios from 'axios'

const weekDaysSelected = [

	{ label : [ 'Monday', 'Понедельник'], key : 'monday', checked : true } ,
	{ label : [ 'Tuesday', 'Вторник'], key : 'tuesday', checked : true } ,
	{ label : [ 'Wednesday', 'Среда'], key : 'wednesday', checked : true } ,
	{ label : [ 'Thursday', 'Четверг'], key : 'thursday', checked : true } ,
	{ label : [ 'Friday', 'Пятница'], key : 'friday', checked : true } ,
	{ label : [ 'Saturday', 'Суббота'], key : 'saturday', checked : true } ,
	{ label : [ 'Sunday', 'Воскресенье'], key : 'sunday', checked : true } 
]

const weekDaysUnSelected = [

	{ label : [ 'Monday', 'Понедельник'], key : 'monday', checked : false } ,
	{ label : [ 'Tuesday', 'Вторник'], key : 'tuesday', checked : false } ,
	{ label : [ 'Wednesday', 'Среда'], key : 'wednesday', checked : false } ,
	{ label : [ 'Thursday', 'Четверг'], key : 'thursday', checked : false } ,
	{ label : [ 'Friday', 'Пятница'], key : 'friday', checked : false } ,
	{ label : [ 'Saturday', 'Суббота'], key : 'saturday', checked : false } ,
	{ label : [ 'Sunday', 'Воскресенье'], key : 'sunday', checked : false } 
]

const priceCategoriesDefault = [

	{ label : [ 'Bed and breakfast', 'Кровать и завтрак'], key : 'bb', checked : false } ,
	{ label : [ 'HB + medical package', 'Половинный завтрак + медицинский пакет'], key : 'hb-mp', checked : false } ,
	{ label : [ 'FB + medical package', 'Полный завтрак + медицинский пакет'], key : 'fb-mp', checked : false } ,
	{ label : [ 'HB + medical package (last minute)', 'Половинный завтрак + медицинский пакет (последняя минута)'], key : 'hb-mp-last', checked : false } ,
	{ label : [ 'FB + medical package (last minute)', 'Полный завтрак + медицинский пакет (последняя минута)'], key : 'fb-mp-last', checked : false } ,
	{ label : [ 'HB (last minute)', 'Половинный завтрак (последняя минута)'], key : 'hb-last', checked : false } ,
	{ label : [ 'FB (last minute)', 'Полный завтрак (последняя минута)'], key : 'fb-last', checked : false } ,
	{ label : [ 'HB + medical package (early reservation)', 'Половинный завтрак + медицинский пакет (ранний бронь)'], key : 'hb-mp-early', checked : false } ,
	{ label : [ 'FB + medical package (early reservation)', 'Полный завтрак + медицинский пакет (ранний бронь)'], key : 'fb-mp-early', checked : false } ,
	{ label : [ 'HB (early reservation)', 'Половинный завтрак (ранний бронь)'], key : 'hb-early', checked : false } ,
	{ label : [ 'FB (early reservation)', 'Полный автрак (ранний бронь)'], key : 'fb-early', checked : false } 
]


const initialState =	{
							weekDays: weekDaysUnSelected,
							priceCategories: []
						}



export default class HotelsCalendar extends Component {
	

	constructor(props) {
		super(props);

		this.state = initialState

		this.selectAllWeekDays = ::this.selectAllWeekDays;
		this.unselectAllWeekDays = ::this.unselectAllWeekDays;
		this.selectAllPriceCategories = ::this.selectAllPriceCategories;
		this.unselectAllPriceCategories = ::this.unselectAllPriceCategories;
		this.selectAllRooms = ::this.selectAllRooms;
		this.unselectAllRooms = ::this.unselectAllRooms;
		this.handleWeekDayChange = ::this.handleWeekDayChange;
		this.handlePriceCategoryChange = ::this.handlePriceCategoryChange;
	}


	componentWillMount() {
		
		axios.get('/api/profile/hotel/rooms', {
			params : {
				users_id : this.props.data.users_id
			}
		}).then( response => {
			this.setState ({ rooms : response.data.data})
		})

		this.setState({ rooms : [] })


		axios.get('/api/profile/hotel/price-categories', {
			params : {
				users_id : this.props.data.users_id
			}
		}).then( response => {

			let result = []
			
			response.data.data.map( item => {

				result.push({
					id: item.category_id,
					label : item.name,
				})
			})

			this.setState({ priceCategories : result })
		})
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

	handleWeekDayChange( e, value, weekDays, id) {


		console.log(id)
		let selectedValues = [],
			newData = []

		weekDays.forEach( day => {

			if( day.key === id ){

				day.checked = value
			}

			if(day.checked) {
				selectedValues.push(day.key);
			}

			newData.push(day);
		})

		this.setState({ weekDays: newData });

	}

	
	handlePriceCategoryChange( e, value, priceCategories, id) {
		console.log(id)

		let selectedValues = [],
			newData = []

		priceCategories.forEach( category => {


			if(category.id === id){

				category.checked = value
			}

			if(category.checked) {
				selectedValues.push(category.key);
			}

			newData.push(category);
		})

		this.setState({ priceCategories: newData });

	}	


	handleRoomsChange( e, value, rooms, id) {
		console.log(id)

		let selectedValues = [],
			newData = []

		rooms.forEach( room => {

			if( room.id ===  parseInt(id) ){

				room.checked = value
			}

			if(room.checked) {
				selectedValues.push(room.id);
			}

			newData.push(room);
		})

		this.setState({ rooms: newData });

	}

	confirmAction() {

	}
	
	render() {
		
		const languageId = this.props.languageId - 0;
		console.log(this.state)

		return(
				<div>
					<Row style={{ marginBottom: 40 }}>

						<Col xs={3}>
							<DatePicker 
								floatingLabelText={languageId === 0 ? 'From' : 'От'}
								container='inline' 
								mode='landscape' />
						</Col>

						<Col xs={3}>
							<DatePicker 
								floatingLabelText={languageId === 0 ? 'To' : 'До'}
								container='inline' 
								mode='landscape' />
						</Col>

					</Row>
					<Row>

						<Col xs={4}>
							<h5>{ languageId === 0 ? 'Select one or more days' : 'Выберите один или больше дней' }</h5>
							<RaisedButton
								label={languageId === 0 ? 'Select all' : 'Выбрать все'}
								labelStyle={{ fontWeight: 600, fontSize: 12}}
								style={{ height: 20, lineHeight: '20px', margin: 10 }}
								onClick={ ::this.selectAllWeekDays }/>
							<RaisedButton
								label={languageId === 0 ? 'Unselect all' : 'Снять все'}
								labelStyle={{ fontWeight: 600, fontSize: 12}}
								style={{ height: 20, lineHeight: '20px', margin: 10 }}
								onClick={ ::this.unselectAllWeekDays }/>
						</Col>

						<Col xs={4}>
							<h5>{ languageId === 0 ? 'For one or more multiple price categories' : 'Для одной или нескольких кратных ценовых категорий' }</h5>
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
						</Col>

						<Col xs={4}>
							<h5>{ languageId === 0 ? 'For one or more multiple room types' : 'Для одного или нескольких типов номеров' }</h5>
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
						</Col>

					</Row>
					<Row style={{ marginTop: 10 }}>

						<Col xs={4}>
							{
								this.state.weekDays.map( (week , index) => ( 
									<Checkbox key={index} label={ week.label[languageId] } checked={ week.checked } onCheck={ (e, checked ) => this.handleWeekDayChange(e, checked, this.state.weekDays, week.key) }/>
								))
							}
						</Col>

						<Col xs={4}>
							{
								this.state.priceCategories.map( (priceCategory , index) => ( 
									<Checkbox key={priceCategory.id} label={ priceCategory.label } checked={ priceCategory.checked } onCheck={ (e, checked ) => this.handlePriceCategoryChange(e, checked, this.state.priceCategories, priceCategory.id) }/>
								))
							}						
						</Col>

						<Col xs={4}>
							{
								this.state.rooms.map( (room , index) => ( 
									<Checkbox key={room.id} label={ room.sname } checked={ room.checked } onCheck={ (e, checked ) => this.handleRoomsChange(e, checked, this.state.rooms, room.id) }/>
								))							
							}
						</Col>

					</Row>					
					<Row style={{ marginTop: 50, marginBottom: 100 }}>

						<Col xs={4}>
							<h4>{ languageId === 0 ? 'Actions:' : 'Действие' }</h4>
							<RadioButtonGroup name='action' defaultSelected='open' style={{ marginTop: 10 }}>
								<RadioButton
									value='open'
									label={ languageId === 0 ? 'Open' : 'Открыть' } />
								<RadioButton
									value='close'
									label={ languageId === 0 ? 'Close' : 'Закрыть' } />
							</RadioButtonGroup>
						</Col>

						<Col xs={4}>
							<RaisedButton
								label={languageId === 0 ? 'Apply' : 'Применить'}
								style={{ marginTop: 45 }}
								onClick={ ::this.confirmAction }/>
						</Col>
					</Row>
				</div>

		)
	}
}