import React, { Component } from 'react'
import DayPicker, { DateUtils } from 'react-day-picker'
import FlatButton from 'material-ui/FlatButton'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField'
import DateRange from 'material-ui/svg-icons/action/date-range';
import axios from 'axios'
import moment from 'moment'
import { extendMoment } from 'moment-range'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import $ from 'jquery';

//import 'react-day-picker/lib/style.css'

const momentRange = extendMoment(moment)
const queryString = require('query-string');

const initialState = {
  nights: 1,
  from: new Date(),
  to: moment( new Date(), 'YYYY-MM-DD').add(1, 'd').toDate(),
  enteredTo: moment( new Date(), 'YYYY-MM-DD').add(1, 'd').toDate()
}

function mapStateToProps(state) {
    return {
        search: state.search
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(pageActions, dispatch)
    }
}

@connect(mapStateToProps, mapDispatchToProps)

export default class BookingCalendar extends Component {

  constructor(props) {
    super(props);

    this.state = initialState

    this.handleDayClick = ::this.handleDayClick;
    this.isValidInterval = ::this.isValidInterval;
    this.validateArriveDate = ::this.validateArriveDate;
    this.handleDayMouseEnter = ::this.handleDayMouseEnter;
    this.reset = ::this.reset;
    this.handleTouchTap = ::this.handleTouchTap;
    this.handleRequestClose = ::this.handleRequestClose;
  }

  componentWillMount(){
    let params = queryString.parse(this.props.params)
    if(!params){
      params = this.props.params
    }

    if(params){
      this.setState({ 
        from : params.start_date ? moment(params.start_date, 'YYYY-MM-DD').toDate() : new Date(),
        to : params.end_date ? moment(params.end_date, 'YYYY-MM-DD').toDate() : moment( new Date(), 'YYYY-MM-DD').add(1, 'd').toDate(),
        nights : params.start_date && params.end_date ? momentRange.range(params.start_date, params.end_date).diff('days') : 1,
        enteredTo : params.end_date ? moment(params.end_date, 'YYYY-MM-DD').toDate() : moment( new Date(), 'YYYY-MM-DD').add(1, 'd').toDate(),
      })
    }
  }

  isValidInterval(start, end) {
    const valid = moment(start).isBefore(end);

    if(!valid) this.changeInterval()
    return ;
  }

  validateArriveDate(start,end){
    if(moment(start).isSameOrAfter(end, 'day')) {
      return moment(start, 'YYYY-MM-DD').add(1, 'd').toDate()
    }

    return end;
  }

  handleDayClick(day, modifiers) {
    let { from, to, enteredTo } = this.state;

    if(modifiers.disabled){
      // if clicked on disabled day nothing to do
      return;
    }

    if(moment(day).isBefore(new Date())) return;

    // entered start date
    if(!from) {
      // if interval valid update date
      // if(!this.isValidInterval(day, to)) return;

      from = day;
      to = this.validateArriveDate(day, to);
      enteredTo = day

      console.log(from, to)
    }
    
    // entered end date
    if(!to) {
      // if interval valid update date
      // if(!this.isValidInterval(from, day)) return;
      
      to = day;
      enteredTo = day;
    }
    
    if(moment(from).isSame(to, 'day')) return;

    if(from && to){
        this.setState({
          open : false,
          from: from,
          to: to,
          enteredTo: day,
          nights: momentRange.range(from, to).diff('days'),
        });
        
        this.props.updateDates(from, to, momentRange.range(from, to).diff('days') )
      }
  }

  handleDayMouseEnter(day) {
    const { from, to } = this.state;

    this.setState({
      enteredTo: day,
    });
  }

  reset() {
    this.setState(initialState);
  }

  handleTouchTap(event, partOfCalendar) {
    const anchorEl = document.getElementById('calendar-anchor');
    //event.preventDefault();

    const { from, to } = this.state;

    if(partOfCalendar === 1) {
      this.setState({ tempTo: to, to: null })
    }
    if(partOfCalendar === 0) {
      this.setState({ tempFrom: from, from: null })
    }

    this.setState({
      open: true,
      anchorEl,
    });
  }

  handleRequestClose() {

    if(!this.state.from){
      this.setState({ from: this.state.tempFrom, tempFrom: null })
    }

    if(!this.state.to){
      this.setState({ to: this.state.tempTo, tempTo: null, enteredTo: this.state.tempTo })
    }

    this.setState({
      open: false,
    });
  }


  render() {

      const languageId = this.props.languageId;

      const { from, to, enteredTo } = this.state;
      const disabledDays = [
        {before: new Date()},
        !to && from && {before: from}
      ];
      const isSelectingFromDate = !from; 
      const initialMonth = isSelectingFromDate ? to : from;

      let selectedDays = [from, { from, to: enteredTo }];
      let modifiers = { start: from, end: enteredTo };
      
      if(isSelectingFromDate) {
        selectedDays = [enteredTo, { from: enteredTo, to }];
        modifiers = { start: enteredTo, end: to }
      }

      let isMobile = false;

      if(typeof document !== 'undefined') isMobile = window.innerWidth <= 700 ? true : false;

      //console.log(selectedDays, modifiers)
      //console.log(from, to, enteredTo)

      return (

           <div>
              <Row>
                <Col xs={6} lg={6}>
                    <DateRange style={{ position: 'absolute', top: 10 }}/>
                    <TextField
                        id='calendar-anchor'
                        fullWidth
                        disabled={this.state.open}
                        hintText={languageId === 0 ? 'Arrival' : 'Приезд'}
                        value={from ? moment(from).format('DD-MM-YYYY') : ''}   
                        onClick={(e) => this.handleTouchTap(e,0)} 
                        underlineFocusStyle={{ borderColor: '#5d5252' }}
                        inputStyle={{ left: 30 }}
                        hintStyle={{ left: 30 }} />
                
                </Col>
                <Col xs={6} lg={6}>   
                    <DateRange style={{ position: 'absolute', top: 10 }}/>                
                    <TextField
                        fullWidth
                        disabled={this.state.open}
                        hintText={languageId === 0 ? 'Departure' : 'Отьезд'}
                        value={to ? moment(to).format('DD-MM-YYYY') : ''}   
                        onClick={(e) => this.handleTouchTap(e,1)}
                        underlineFocusStyle={{ borderColor: '#5d5252' }}
                        inputStyle={{ left: 30 }}
                        hintStyle={{ left: 30 }} />
                </Col>
              </Row>
              <Row>
                <Col style={{ width: '100%' }}>
                    <Popover
                        open={this.state.open}
                        anchorEl={this.state.anchorEl}
                        anchorOrigin={{
                          horizontal: 'left',
                          vertical: 'bottom'
                        }}
                        targetOrigin={{
                          horizontal: 'left', 
                          vertical: 'top'
                        }}
                        onRequestClose={this.handleRequestClose}
                        className='booking-calendar'
                    >
                      <DayPicker
                          pagedNavigation
                          disabledDays={disabledDays}
                          className="Selectable"
                          numberOfMonths={isMobile ? 1 : 2}
                          initialMonth={initialMonth}
                          selectedDays={selectedDays}
                          modifiers={modifiers}
                          onDayClick={this.handleDayClick}
                          onDayMouseEnter={this.handleDayMouseEnter}
                        />

                      {this.state.from && (this.state.enteredTo || this.state.to) &&
                        <p style={{ marginLeft: 10, fontSize: 16 }}>
                          {languageId === 0 ? 'Total nights: ': 'Всего ночей: '}
                          {momentRange.range(this.state.from, this.state.enteredTo || this.state.to).diff('days')}
                        </p>}

                    </Popover>
                </Col>
              </Row>
              { 
                (this.props.showNights != undefined ? this.props.showNights : true)
                ?   <Row>
                      <Col xs={12} style={{ height: 25 }}>
                        { this.state.from && this.state.to && (
                            languageId === 0 
                              ? <p>
                                  <i className="fa fa-moon-o" aria-hidden="true"/> Term of stay: { this.state.nights } nights 
                                  <i className="fa fa-times" 
                                     title='Reset' 
                                     aria-hidden="true"
                                     style={{ color: 'red', paddingLeft: 10, cursor: 'pointer' }} 
                                     onClick={ this.reset } />
                                </p>
                              : <p>
                                  <i className="fa fa-moon-o" aria-hidden="true"/> Срок пребывания: { this.state.nights } н. 
                                  <i className="fa fa-times" 
                                     title='Reset' 
                                     aria-hidden="true"
                                     style={{ color: 'red', paddingLeft: 10, cursor: 'pointer' }} 
                                     onClick={ this.reset } />                          
                                </p>
                          )
                        }
                      </Col>
                    </Row>
                : ''
              }
          </div>

      )
  }
}