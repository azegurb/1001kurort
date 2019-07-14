import React, { Component } from 'react'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import $ from 'jquery';

import Shares from './Shares'
import VideoYouTube from '../components/VideoYouTube'

const menuItems = [
	{ label: ['How to choose a sanatorium?', 'Как выбрать санаторий?'] },
	{ label: ['Promotions', 'Акции'] },
	{ label: ['Registration', 'Регистрация'] },
	{ label: ['FAQ', 'Часто задаваемые вопросы'] },
	{ label: ['Videos', 'Видео'] },
]

const initialState = {
	activePage: 0,
	doAnimate: false,
}


export default class HomeActionTopBar extends Component {
    constructor(props) {
        super(props);

        this.state =  initialState


        this.intervalAction = ::this.intervalAction;
        this.startInterval = ::this.startInterval;
        this.stopInterval = ::this.stopInterval;
        this.restartInterval = ::this.restartInterval;
        this.animate = ::this.animate;		
        this.titleFontSize = ::this.titleFontSize;
		this.descriptionFontSize = ::this.descriptionFontSize;
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

    restartInterval(){
    	this.stopInterval();
    	this.startInterval();
    }

    intervalAction() {
        this.setState({ activePage:  this.state.activePage + 1 > menuItems.length - 1 ? 0 : this.state.activePage + 1, doAnimate: true }, this.animate )
    }

    animate() {
        setTimeout(500, this.setState({ doAnimate: false }) )
    }

	titleFontSize(string) {
		const languageId = this.props.languageId - 0;
		let fontSize = 0,
		  str = string.length

		if(str <= 10){
		  fontSize = 25
		}else if( str > 10 && str <= 15){
		  fontSize = 24
		}else if( str > 15 && str <= 20){
		  fontSize = 22
		}else fontSize = 20

		return fontSize
	}

	descriptionFontSize(string) {
		const languageId = this.props.languageId - 0;
		let fontSize = 0,
		  str = string.length

		if(str <= 15){
		  fontSize = 18
		}else if( str > 15 && str <= 30){
		  fontSize = 16
		}else if( str > 30 && str <= 60){
		  fontSize = 14
		}else fontSize = 12

		return fontSize
	}


	render() {
    
    	const languageId = this.props.languageId
        
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
			<Paper zDepth={1} style={{ margin: '5px 15px', padding: 0 }}>
	            <div style={{ height: 300 }}>					
	            	<div id='content' style={{ height: 300 }}>
	            	{
						this.state.activePage === 0 &&
						    <div style={{ 
						    	width: '100%', 
						    	height: '100%', 
						    	maxWidth: '100%',
						    	position: 'relative', 
						    	background: `url(/images/choose-sanatorium.jpg) 0% 0% / cover no-repeat` 
						    }}>
								<div style={{ position: 'absolute', width: 200, height: '100%', background: '#3f4040d1', color: '#fff', padding: 10 }}>
									<h3 style={{ fontSize: this.titleFontSize(languageId === 0 ? 'How to choose a sanatorium?' : 'Как выбрать санаторий?') }}>
										{ languageId === 0 ? 'How to choose a sanatorium?' : 'Как выбрать санаторий?' }
									</h3>
									<p style={{ fontSize: this.descriptionFontSize(languageId === 0 ? '...' : '...') }}>
										{ languageId === 0 ? '...' : '...' }
									</p>
									<div style={{ position: 'absolute', bottom: 20, width: '100%', left: 0, textAlign: 'center' }}>

									</div>
								</div>
							</div> ||
						this.state.activePage === 1 &&
							<Shares languageId={languageId} history={this.props.history} /> ||
						this.state.activePage === 2 &&
						    <div style={{ 
						    	width: '100%', 
						    	height: '100%', 
						    	maxWidth: '100%',
						    	position: 'relative', 
						    	background: `url(/images/registration.jpg) 0% 0% / cover no-repeat` 
						    }}>
								<div style={{ position: 'absolute', width: 200, height: '100%', background: '#3f4040d1', color: '#fff', padding: 10 }}>
									<h3 style={{ fontSize: this.titleFontSize(languageId === 0 ? 'Регистрация' : 'Регистрация') }}>
										{ languageId === 0 ? 'Registration' : 'Регистрация' }
									</h3>
									<p style={{ fontSize: this.descriptionFontSize(languageId === 0 ? 'Sign up and get -30% for the next booking' : 'Регистрируйтесь и получите -30% к следущему бронированию') }}>
										{ languageId === 0 ? 'Sign up and get -30% for the next booking' : 'Регистрируйтесь и получите -30% к следущему бронированию' }
									</p>
									<div style={{ position: 'absolute', bottom: 20, width: '100%', left: 0, textAlign: 'center' }}>
				                        <a href='/register/user' target='blank'>
				                        <RaisedButton 
				                          label={ languageId === 0 ? 'Go' : 'Перейти' } 
				                          labelColor='#000000'
				                          labelStyle={{ fontSize: 18 , top: -6 }}                          
				                          style={{ height: 30, lineHeight: '30px', margin: 10 }}
				                          />
				                        </a>									
									</div>
								</div>
							</div> ||					
						this.state.activePage === 3 &&
						    <div style={{ 
						    	width: '100%', 
						    	height: '100%', 
						    	maxWidth: '100%',
						    	position: 'relative', 
						    	background: `url(/images/faqs.jpg) 0% 0% / cover no-repeat` 
						    }}>
								<div style={{ position: 'absolute', width: 200, height: '100%', background: '#3f4040d1', color: '#fff', padding: 10 }}>
									<h3 style={{ fontSize: this.titleFontSize(languageId === 0 ? 'FAQ' : 'Часто задаваемые вопросы') }}>
										{ languageId === 0 ? 'FAQ' : 'Часто задаваемые вопросы' }
									</h3>
									<p style={{ fontSize: this.descriptionFontSize(languageId === 0 ? 'How to use the service 1001kurort' : 'Как пользоваться сервисом 1001kurort') }}>
										{ languageId === 0 ? 'How to use the service 1001kurort' : 'Как пользоваться сервисом 1001kurort' }
									</p>
									<div style={{ position: 'absolute', bottom: 20, width: '100%', left: 0, textAlign: 'center' }}>
				                        <a href='/ask_doctor/faq' target='blank'>
				                        <RaisedButton 
				                          label={ languageId === 0 ? 'Go' : 'Перейти' } 
				                          labelColor='#000000'
				                          labelStyle={{ fontSize: 18 , top: -6 }}                          
				                          style={{ height: 30, lineHeight: '30px', margin: 10 }}
				                          />
				                        </a>
									</div>
								</div>
							</div> ||					
						this.state.activePage === 4 &&
							<div>
								<VideoYouTube languageId={languageId} />
							</div>
					}
					</div>
				</div>
				<ul className='home-top-bar-ul'>
					{
						menuItems.map( (item, index) =>
							<li key={index} className={ this.state.activePage === index ? 'active' : '' } onClick={ () => this.setState({ activePage : index }, () => this.stopInterval() ) }>
								{ item.label[languageId] }
							</li> 
						)
					}
				</ul>
			</Paper>
		)
	}
}