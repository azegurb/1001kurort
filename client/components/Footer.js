import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import Open from 'material-ui/svg-icons/content/add-circle-outline'
import Close from 'material-ui/svg-icons/content/remove-circle-outline'
import { Link } from 'react-router-dom'
import FontIcon from 'material-ui/FontIcon'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'

const initialState = {
                        
}


class Footer extends Component { 
    
    constructor(props) {
        super(props);

        this.state = initialState
    }

    render() {
        const languageId = this.props.profile.languageId - 0;
        
        return( 
                <div className='footer' style={{ background: 'linear-gradient(to top, #c5c5c5, #f5f5f5)', color: '#474c44' }}>
                    <Row style={{ marginLeft: 0, marginRight: 0 }}>
                        
                        <div style={{ maxWidth: '1160px', margin: '40px auto', marginTop: 0 }}>
                            <Row style={{ background:'#f5f5f5', marginLeft: 0 , marginRight: 0 }}>
                                <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                    <h3>{ languageId === 0 ? 'Links' : 'Cсылки' }</h3>
                                    <Divider style={{ backgroundColor: '#55c901', height: 2 }} />
                                    <ul className='footer-links'>
                                        <li><Link to='/ask_doctor'>{ languageId === 0 ? 'Ask the doctor' : 'Спросите доктора' }</Link></li>
                                        <li><Link to='/blog'>{ languageId === 0 ? 'Blog' : 'Блог' }</Link></li>
                                        <li><Link to='/turs'>{ languageId === 0 ? 'Tours' : 'Туры' }</Link></li>
                                        <li><Link to='/'>{ languageId === 0 ? 'FAQ' : 'FAQ' }</Link></li>

                                    </ul>
                                </Col>
                                
                                <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                    <h3>{ languageId === 0 ? 'Partner login' : 'Вход для партнеров' }</h3>
                                    <Divider style={{ backgroundColor: '#55c901', height: 2 }} />
                                    <ul className='footer-links'>
                                        <li><Link to='/auth/hotel'>{ languageId === 0 ? 'Sanatoriums' : 'Санатории' }</Link></li>
                                        <li><Link to='/auth/doctor'>{ languageId === 0 ? 'Consultants' : 'Консультанты' }</Link></li>

                                    </ul>                        
                                </Col>                            
                                
                                <Col xs={12} sm={12} md={12} lg={4} xl={3}>
                                    <h3>{ languageId === 0 ? 'Contacts' : 'Контакты' }</h3>
                                    <Divider style={{ backgroundColor: '#55c901', height: 2 }} />
                                    <ul className='footer-links'>
                                        <li> 
                                            <i className="fa fa-whatsapp" aria-hidden="true" style={{ fontSize: '25px', float: 'left' }}></i> 
                                            <Link to='/' className='footer-contacts'> +994 70 283 0707 </Link> 
                                        </li>
                                        <li> 
                                            <i className="fa fa-telegram" aria-hidden="true" style={{ fontSize: '25px', float: 'left' }}></i> 
                                            <Link to='/' className='footer-contacts'> +994 70 283 0707 </Link> 
                                        </li>
                                        <li>  
                                            <i className="fa fa-envelope-o" aria-hidden="true" style={{ fontSize: '25px', float: 'left' }}></i> 
                                            <Link to='/' className='footer-contacts'> sales@1001kurort.com </Link> 
                                        </li>
                                    </ul>                        
                                </Col>
                                
                                <Col xl={3}>
                                    <h3>{ languageId === 0 ? 'We are in social networks' : 'Мы в соцсетях' }</h3>
                                    <Divider style={{ backgroundColor: '#55c901', height: 2 }} />
                                    <ul className='footer-links'>
                                       
                                        <a target='_blank' href='https://www.facebook.com/1001kurort/?fref=ts'>
                                            <FontIcon className="fa fa-facebook-official" style={{ fontSize: 35, margin: 10 }} color='#969595' hoverColor='#55c901' />
                                        </a>

                                        <a target='_blank' href='https://vk.com/naftalankurort'>
                                            <FontIcon className="fa fa-vk" style={{ fontSize: 35, margin: 10 }} color='#969595' hoverColor='#55c901' />
                                        </a>

                                        <a target='_blank' href='https://ok.ru/group/54942880169991'>
                                            <FontIcon className="fa fa-odnoklassniki-square" style={{ fontSize: 35, margin: 10 }} color='#969595' hoverColor='#55c901' />
                                        </a>

                                        <a target='_blank' href='https://www.youtube.com/1001kurort'>
                                            <FontIcon className="fa fa-youtube" style={{ fontSize: 35, margin: 10 }} color='#969595' hoverColor='#55c901' />
                                        </a>

                                        <a target='_blank' href='https://plus.google.com/114439656189343906084'>
                                            <FontIcon className="fa fa-google-plus-official" style={{ fontSize: 35, margin: 10 }} color='#969595' hoverColor='#55c901' />
                                        </a>

                                        <a target='_blank' href='https://www.instagram.com/1001kurort/'>
                                            <FontIcon className="fa fa-instagram" style={{ fontSize: 35, margin: 10 }} color='#969595' hoverColor='#55c901' />
                                        </a>

                                    </ul>                        
                                </Col>
                            </Row>
                        </div>

                    </Row>
                    <Row className='center' style={{ margin: 0 }}>

                        <Col lg={10} offset={{ lg: 1 }}>
                            <p style={{ color: '#fff' }}>{ languageId === 0 ? 'Copyrights ©. All rights reserved 1001kurort.com 2017' : 'Aвторские права ©. Все права защищены 1001kurort.com 2017' }</p>
                        </Col>
                    
                    </Row>

                </div>
        )
    }

}


const mapStateToProps = ({ profile }) => ({
  profile,
});

export default connect(mapStateToProps,)(Footer);



