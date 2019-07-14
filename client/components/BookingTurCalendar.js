import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import DayPicker, { DateUtils } from 'react-day-picker'
import moment from 'moment'


export default class BookingTurCalendar extends Component {

	constructor(props) {
		super(props);

		this.state = {}

		this.updateDate = ::this.updateDate;
	}

	componentWillMount(){
		const { days, arrival, departure } = this.props

		this.setState({ days, arrival, departure })
	}

	componentWillReceiveProps(nextProps){
		const { days, arrival, departure } = nextProps		

		this.setState({ days, arrival, departure })

	}

	updateDate(day) {
		const arrival   = day,
			  departure = moment(day).add(this.state.days, 'day').toDate()

		this.setState({ arrival, departure })
		this.props.onChange(arrival, departure)
	}

	render() {

		const languageId = this.props.languageId;
		
		return (
			<div className='center'>
				<DayPicker 
					disabledDays={[
						{ before: new Date() },
					]}
					month={this.state.arrival}
					onDayClick={this.updateDate}
					selectedDays={[this.state.arrival, { from: this.state.arrival, to: this.state.departure }]} />
				<p style={{ fontSize: 17, color: '#337ab7' }}>
					{ this.state.arrival && this.state.departure
						? `${moment(this.state.arrival).format('DD.MM.YYYY')} - ${moment(this.state.departure).format('DD.MM.YYYY')}`
						: ''
					}
				</p>
			</div>
		)
	}
}