import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import { Link } from 'react-router-dom'
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import moment from 'moment'
import $ from 'jquery';

import { VelocityComponent, VelocityTransitionGroup } from 'velocity-react';

if( typeof window !== 'undefined' ) {
    require('velocity-animate');
    require('velocity-animate/velocity.ui');
}

export default class NewsBlock extends Component {
	
    constructor(props) {
        super(props);

        this.state =  {
        	events: [],
        	numberNews: 0,
            doAnimate: false,
        }

        this.intervalAction = ::this.intervalAction;
        this.startInterval = ::this.startInterval;
        this.stopInterval = ::this.stopInterval;
        this.animate = ::this.animate;
        this.handleNextNew = ::this.handleNextNew;
        this.handlePrevNew = ::this.handlePrevNew;
    }
  
    componentWillMount(){

        let events = this.props.events.map( item => {

            item.title = function(languageId){
                switch(item.type){
                    case 1: 
                        return languageId === 0 ? 'User' : 'Пользователи';
                    
                    case 2: 
                        return languageId === 0 ? 'Room booked' : 'Номер забронирован';
                    
                    default: 
                        return languageId === 0 ? 'Other' : 'Другое';

                }
            };

            item.text = function(languageId){
                switch(item.type){
                    case 1: 
                        return languageId === 0 ? 'The user was registered in the system' : 'В системе был зарегистрирован пользователь';
                    
                    case 2: 
                        return languageId === 0 ? 'Booked room' : 'Забронирован номер';
                    
                    default: 
                        return languageId === 0 ? 'New action' : 'Неизвестное событие';

                }
            };
            return item;
        })

        this.setState({events})
    }

    componentWillReceiveProps(newProps){
        let events = newProps.events.map( item => {

            item.title = function(languageId){
                switch(item.type){
                    case 1: 
                        return languageId === 0 ? 'User' : 'Пользователи';
                    
                    case 2: 
                        return languageId === 0 ? 'Room booked' : 'Номер забронирован';
                    
                    default: 
                        return languageId === 0 ? 'Other' : 'Другое';

                }
            };

            item.text = function(languageId){
                switch(item.type){
                    case 1: 
                        return languageId === 0 ? 'The user was registered in the system' : 'В системе был зарегистрирован пользователь';
                    
                    case 2: 
                        return languageId === 0 ? 'Booked room' : 'Забронирован номер';
                    
                    default: 
                        return languageId === 0 ? 'New action' : 'Неизвестное событие';

                }
            };
            return item;

        })

        this.setState({events})

    }

    componentDidMount(){
       if(typeof window !== 'undefined') {
            this.startInterval();
        }
    }

    componentWillUnmount(){
        this.stopInterval()
    }

    startInterval(){
        let intervalValid = setInterval(  () => this.intervalAction(), 15000 );
        this.setState({ intervalValid })        
    }

    stopInterval(){
        clearInterval( this.state.intervalValid )
    }


    intervalAction() {
        this.setState({ numberNews:  this.state.numberNews + 1 > this.state.events.length - 1 ? 0 : this.state.numberNews + 1, doAnimate: true }, this.animate )
    }

    animate() {
        setTimeout(500, this.setState({ doAnimate: false }) )
    }

    handleNextNew() {
        this.setState({ numberNews:  this.state.numberNews + 1 > this.state.events.length - 1 ? 0 : this.state.numberNews + 1, doAnimate: true }, this.animate )

        this.stopInterval();
        this.startInterval();        
    }


    handlePrevNew() {
        this.setState({ numberNews:  this.state.numberNews + 1 > this.state.events.length - 1 ? 0 : this.state.numberNews + 1, doAnimate: true }, this.animate )

        this.stopInterval();
        this.startInterval();
    }


	render() {
        const languageId = this.props.languageId
        const blockNew = this.state.events[this.state.numberNews]
        
        var animationProps;
        if (this.state.doAnimate) {
        animationProps = {
          duration: 500,
          animation: 'transition.bounceLeftOut'
        };
        } else {
        animationProps = {
          duration: 500, // longer due to swinging
          animation: 'transition.bounceLeftIn'
        };
        }

		return(
			<div style={{ paddingBottom: 20, position: 'relative', minHeight: 150, overflow: 'hidden' }}>
                <VelocityComponent {...animationProps}>
                    <div>
                        <h4 >{ blockNew && blockNew.title(languageId) }</h4>
                        <h4 style={{ fontSize: 16 }}>{moment(blockNew && blockNew.date).format('DD.MM.YYYY, HH:MM')} </h4>
                        <p style={{ tetAlign: 'justify' }} >
                          { blockNew && blockNew.text(languageId) }
                        </p>
                    </div>
                </VelocityComponent>
                <div style={{ position:'absolute', bottom: 0, left: 'calc(50% - 72px)', height: 50 }}>
                    <IconButton 
                        iconStyle={{ width: 36, height: 36 }}
                        style={{ width: 72, height: 72, padding: 16 }}
                        onClick={ this.handlePrevNew }
                    >
                        <ChevronLeft />
                    </IconButton>
                    <IconButton 
                        iconStyle={{ width: 36, height: 36 }}
                        style={{ width: 72, height: 72, padding: 16}}
                        onClick={ this.handleNextNew }
                    >
                        <ChevronRight />
                    </IconButton>
                </div>
			</div>
		)
	}
}