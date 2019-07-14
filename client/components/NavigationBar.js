import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Hidden} from 'react-grid-system'
import { matchRoutes } from 'react-router-config'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import { Switch, Route, Redirect } from 'react-router-dom'
import {withRouter} from 'react-router-dom'
import _ from 'lodash'
import axios from 'axios'

const queryString = require('query-string');



class NavigationBar extends Component { 

	render() {

		const languageId = this.props.profile.languageId - 0;
		const fullPath = this.props.location.pathname;
        const match = this.props.match;
        const {navPartsNames} = this.props.page;

		return(
            <Hidden xs sm md>
                { fullPath !== '/'

                    ?   <Row style={{ marginLeft: 0, marginRight: 0 }}>
                            <Col xs={12} md={12} lg={8} xl={8}>
                                <Link to ='/'>
                                    <p style={{ fontSize: 22, display: 'inline-block' }}>{ languageId === 0 ? 'Home ' : 'Главная ' }</p>
                                </Link>
                                {
                                    navPartsNames
                                    ?   navPartsNames.map( (path,index) =>
                                            index+1 !== navPartsNames.length
                                            ?   <Link to={path.link}>
                                                    <span 
                                                        style={{ fontSize: 22, display: 'inline-block', paddingLeft: 10 }} 
                                                        title={path.label[languageId]}
                                                    >
                                                        / {  path.label[languageId].length > 14 ? ( path.label[languageId].slice(0, 15) + '...' ) : path.label[languageId] }
                                                    </span>
                                                </Link>
                                            :   <span style={{ fontSize: 22, display: 'inline-block', paddingLeft: 10 }} title={path.label[languageId]}>
                                                    / { path.label[languageId].length > 14 ? ( path.label[languageId].slice(0, 15) + '...' ) : path.label[languageId] }
                                                </span>
                                        )
                                    :   ''
                                }
                            </Col>
                            <Hidden xs sm md>                               
                                <Col xs={12} lg={4} xl={4} className='right-float'>                                
                                    <a target='_blank' href='https://www.youtube.com/1001kurort'>
                                        <FontIcon className="fa fa-youtube" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://vk.com/naftalankurort'>
                                        <FontIcon className="fa fa-vk" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://www.facebook.com/1001kurort/?fref=ts'>
                                        <FontIcon className="fa fa-facebook-official" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://plus.google.com/114439656189343906084'>
                                        <FontIcon className="fa fa-google-plus-official" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://www.instagram.com/1001kurort/'>
                                        <FontIcon className="fa fa-instagram" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://ok.ru/group/54942880169991'>
                                        <FontIcon className="fa fa-odnoklassniki-square" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                </Col>
                            </Hidden>
                        </Row>

                    :   <Row style={{ marginLeft: 0, marginRight: 0 }}>   
                            <Hidden xs sm md lg>
                                <Col xs={12} lg={4} xl={4}>
                                
                                    <a target='_blank' href='https://www.youtube.com/channel/UCK6tFeTqetjMiS-ZmHlTICg'>
                                        <FontIcon className="fa fa-youtube" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://vk.com/naftalankurort'>
                                        <FontIcon className="fa fa-vk" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://www.facebook.com/1001kurort/?fref=ts'>
                                        <FontIcon className="fa fa-facebook-official" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://plus.google.com/114439656189343906084'>
                                        <FontIcon className="fa fa-google-plus-official" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://www.instagram.com/1001kurort'>
                                        <FontIcon className="fa fa-instagram" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                    <a target='_blank' href='https://ok.ru/group/54942880169991'>
                                        <FontIcon className="fa fa-odnoklassniki-square" style={{ fontSize: 35, margin: 10, color: '#525252' }} hoverColor='#49c407' />
                                    </a>
                                </Col>
                            </Hidden>
                            <Hidden xs sm md>
                                <Col xs={12} lg={12} xl={8} className='center'>
                                    <Col xs={4}>
                                        <Link to='/ask_doctor'>
                                            <h4>
                                                { languageId === 0 ? 'Ask doctor' : 'Cпросить врача' }
                                                <i className="fa fa-user-md fa-2x" aria-hidden="true" style={{ marginLeft: 10 }}></i>
                                            </h4>
                                        </Link>
                                    </Col>

                                    <Col xs={4}>
                                        <Link to='/blog'>
                                            <h4>
                                                { languageId === 0 ? 'Blog' : 'Блог' }
                                                <i className="fa fa-file-text-o fa-2x" aria-hidden="true" style={{ marginLeft: 10 }}></i>
                                            </h4>
                                        </Link>
                                    </Col>

                                    <Col xs={4}>
                                        <Link to='/turs'>
                                            <h4>
                                                { languageId === 0 ? 'Turs' : 'Туры' }
                                                <i className="fa fa-suitcase fa-2x" aria-hidden="true" style={{ marginLeft: 10 }}></i>
                                            </h4>
                                        </Link>
                                    </Col>
                                </Col>                   
                            </Hidden>
                            
                        </Row>
                }
			</Hidden>
        )
	}

}

const mapDispatchToProps = (dispatch) => {
    return {
        pageActions: bindActionCreators(pageActions, dispatch)
    }
}

const mapStateToProps = ({ profile, page }) => ({
  profile,
  page
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NavigationBar));