import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import Drawer from 'material-ui/Drawer'
import _ from 'lodash'
import { bindActionCreators } from 'redux'
import * as pageActions from '../../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'

import AdminKurorts from './AdminKurorts'
import AdminDiscountBanners from './AdminDiscountBanners'
import AdminBlog from './AdminBlog'
import AdminCoupons from './AdminCoupons'
import DoctorCoupons from './DoctorCoupons'
import AdminApproveBooking from './AdminApproveBooking'
import AdminApproveBookingShare from './AdminApproveBookingShare'
import AdminInvoices from './AdminInvoices'
import AdminTransfer from './AdminTransfer'
import AdminAskDoctor from './AdminAskDoctor'
import AdminAskDoctorFaq from './AdminAskDoctorFaq'
import AdminTurs from './AdminTurs'
import AdminVideos from './AdminVideos'
import AdminHotelComission from './AdminHotelComission'
import AdminEvaluateSanatorium from './AdminEvaluateSanatorium'
import AdminAllowAccounts from './AdminAllowAccounts'
import SitePages from './SitePages'
import Robots from './Robots'
import SiteMap from './SiteMap'
import AdminLoadingScreen from './AdminLoadingScreen'
import MessagesHandler from '../../components/MessagesHandler'

import MenuIcon from 'material-ui/svg-icons/navigation/menu'

const MenuItems =	[
						{ id : 1, label : ['Discount banner','Баннер со скидками'] },
						{ id : 2, label : ['Admin videos','Админ видео'] },
						{ id : 3, label : ['Blog','Блог'] },
						{ id : 4, label : ['Booking with share','Бронирования с подселением'] },
						{ id : 5, label : ['Kurorts','Курорты'] },
						{ id : 6, label : ['Coupons','Купоны'] },
						{ id : 7, label : ['Doctors coupons','Купоны для докторов'] },
						{ id : 8, label : ['Simple bookings','Обычные бронирования'] },
						{ id : 9, label : ['Messages','Сообщения'] },
						{ id : 10, label : ['Ask doctor','Спросить врача'] },
						{ id : 11, label : ['Ask doctor FAQ','Спросить врача FAQ'] },
						{ id : 12, label : ['Invoices','Счета'] },
						{ id : 13, label : ['Transfer','Трансфер'] },
						{ id : 14, label : ['Turs','Туры'] },
						{ id : 15, label: ['Hotel comission', 'Комиссия санатория'] },
						{ id : 16, label: ['Evaluate a sanatorium', 'Оценить санаторий'] },
						{ id : 17, label: ['Site pages', 'Страницы сайта'] },
						{ id : 18, label: ['Robots.txt', 'Robots.txt'] },
						{ id : 19, label: ['Sitemap.xml', 'Sitemap.xml'] },
						{ id : 20, label: ['Accounts of doctors and hotels', 'Аккаунты врачей и отелей'] },
						{ id : 21, label: ['Loading screen', 'Загрузочный экран'] },
					]


class AdminDashboard extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = {
			open: false,
			activeProfileMenuItem: 1,
		}
	}

	componentWillMount() {
        const { history, profile } = this.props;
        if ( _.isEmpty(profile.user) || ( !_.isEmpty(profile.user) && profile.user.account_type !== 0 )) {
            history.replace({ pathname: '/' });
        }
		this.props.pageActions.updateIsLoadingPage(true)
	}

	componentDidMount(){
		this.props.pageActions.updateIsLoadingPage(false)
		this.props.pageActions.setNavigationPathNames([{ label: ['My profile', 'Мой профиль'], link: '/profile'}])
	}

	render() {
		const languageId = this.props.profile.languageId - 0;

		return(
				<div>
					<Row>
						<Drawer
							docked={false}
							width={300}
							open={this.state.open}
							onRequestChange={(open) => this.setState({open})}
							containerStyle = {{ paddingTop : '15px' }}
						>
							<Col> 
								{ languageId === 0 ? 'ADMIN' : 'АДМИН' } : <strong>{this.props.profile.user.login}</strong> 
							</Col>

							<List style={{ marginTop : 50 }} onClick={ () => this.setState({ open: false}) }>	
						
								<Divider />
								<Subheader style={{ fontWeight: 'bold', color: 'black' }}>{languageId === 0 ? 'Home' : 'Главная'}</Subheader>
								  <ListItem value={1} id={1} primaryText={ languageId === 0 ? 'Discount banner' : 'Баннер со скидками' } onClick={ () => this.setState({ activeProfileMenuItem : 1 }) }/>
								  <ListItem value={2} id={2} primaryText={ languageId === 0 ? 'Admin videos' : 'Админ видео' } onClick={ () => this.setState({ activeProfileMenuItem : 2 }) }/>
								
								<Divider />
								<Subheader style={{ fontWeight: 'bold', color: 'black' }}>{languageId === 0 ? 'Blog' : 'Блог'}</Subheader>								
								  <ListItem value={3} id={3} primaryText={ languageId === 0 ? 'Blog' : 'Блог' } onClick={ () => this.setState({ activeProfileMenuItem : 3 }) }/>									
								
								<Divider />
								<Subheader style={{ fontWeight: 'bold', color: 'black' }}>{languageId === 0 ? 'Ask doctor' : 'Спросить врача'}</Subheader>
								  <ListItem value={10} id={10} primaryText={ languageId === 0 ? 'Ask doctor' : 'Спросить врача' } onClick={ () => this.setState({ activeProfileMenuItem : 10 }) }/>
								  <ListItem value={11} id={11} primaryText={ languageId === 0 ? 'Ask doctor FAQ' : 'Спросить врача FAQ' } onClick={ () => this.setState({ activeProfileMenuItem : 11 }) }/>
								
								<Divider />
								<Subheader style={{ fontWeight: 'bold', color: 'black' }}>{languageId === 0 ? 'Bookings' : 'Бронирования'}</Subheader>
								  <ListItem value={8} id={8} primaryText={ languageId === 0 ? 'Simple bookings' : 'Обычные бронирования' } onClick={ () => this.setState({ activeProfileMenuItem : 8 }) }/>
								  <ListItem value={4} id={4} primaryText={ languageId === 0 ? 'Booking with share' : 'Бронирования с подселением' } onClick={ () => this.setState({ activeProfileMenuItem : 4 }) }/>
								  <ListItem value={5} id={5} primaryText={ languageId === 0 ? 'Kurorts' : 'Курорты' } onClick={ () => this.setState({ activeProfileMenuItem : 5 }) }/>
								  <ListItem value={6} id={6} primaryText={ languageId === 0 ? 'Coupons' : 'Купоны' } onClick={ () => this.setState({ activeProfileMenuItem : 6 }) }/>
								  <ListItem value={7} id={7} primaryText={ languageId === 0 ? 'Doctors coupons' : 'Купоны для докторов' } onClick={ () => this.setState({ activeProfileMenuItem : 7 }) }/>
								  <ListItem value={13} id={13} primaryText={ languageId === 0 ? 'Transfer' : 'Трансфер' } onClick={ () => this.setState({ activeProfileMenuItem : 13 }) }/>
								
								<Divider />
								<Subheader style={{ fontWeight: 'bold', color: 'black' }}>{languageId === 0 ? 'Sanatoriums' : 'Санатории'}</Subheader>
								  <ListItem value={15} id={15} primaryText={ languageId === 0 ? 'Hotel comission' : 'Комиссия санатория' } onClick={ () => this.setState({ activeProfileMenuItem : 15 }) }/>
								  <ListItem value={16} id={16} primaryText={ languageId === 0 ? 'Evaluate a sanatorium' : 'Оценить санаторий' } onClick={ () => this.setState({ activeProfileMenuItem : 16 }) }/>
								  <ListItem value={12} id={12} primaryText={ languageId === 0 ? 'Invoices' : 'Счета' } onClick={ () => this.setState({ activeProfileMenuItem : 12 }) }/>
								  
								<Divider />
								<Subheader style={{ fontWeight: 'bold', color: 'black' }}>{languageId === 0 ? 'SEO' : 'SEO'}</Subheader>								  
								  <ListItem value={17} id={17} primaryText={ languageId === 0 ? 'Site pages' : 'Страницы сайта' } onClick={ () => this.setState({ activeProfileMenuItem : 17 }) }/>
								  <ListItem value={18} id={18} primaryText={ languageId === 0 ? 'Robots.txt' : 'Robots.txt' } onClick={ () => this.setState({ activeProfileMenuItem : 18 }) }/>
								  <ListItem value={19} id={19} primaryText={ languageId === 0 ? 'Sitemap.xml' : 'Sitemap.xml' } onClick={ () => this.setState({ activeProfileMenuItem : 19 }) }/>
								
								<Divider />
								<Subheader style={{ fontWeight: 'bold', color: 'black' }}>{languageId === 0 ? 'Other' : 'Другое'}</Subheader>
								  <ListItem value={20} id={20} primaryText={ languageId === 0 ? 'Accounts of doctors and hotels' : 'Аккаунты врачей и отелей' } onClick={ () => this.setState({ activeProfileMenuItem : 20 }) }/>
								  <ListItem value={14} id={14} primaryText={ languageId === 0 ? 'Turs' : 'Туры' } onClick={ () => this.setState({ activeProfileMenuItem : 14 }) }/>
								  <ListItem value={9} id={9} primaryText={ languageId === 0 ? 'Messages' : 'Сообщения' } onClick={ () => this.setState({ activeProfileMenuItem : 9 }) }/>
								  <ListItem value={21} id={21} primaryText={ languageId === 0 ? 'Loading scren' : 'Загрузочный экран' } onClick={ () => this.setState({ activeProfileMenuItem : 21 }) }/>
							
							</List>
						</Drawer>

						<Col  xs={10} offset={{ xs : 1 }}>
							<Row>
								<Col xs={12} >
									<h2 style={{ float : 'right' }}> { _.find( MenuItems, { id : this.state.activeProfileMenuItem }).label[languageId] } </h2>
									<IconButton 
										tooltip={ /* languageId === 0 ? 'Open menu' : 'Открыть меню'*/ '' }
										style={{ width: 64, height: 64, padding: 8 }} 
										iconStyle={{ width: 48, height: 48 }} 
										onClick={ () => this.setState({ open: true }) } >

										<MenuIcon hoverColor='#49c407' color='rgb(158, 158, 158)'/>
									</IconButton>
								</Col>
								<Col xs={12}>
									<Divider style={{ backgroundColor: 'rgb(73, 196, 7)' }} />
								</Col>

							</Row>

							{ this.state.activeProfileMenuItem === 1 && <AdminDiscountBanners data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 2 && <AdminVideos data= {this.props.profile.user} languageId={languageId} account_type={0}/> }
							{ this.state.activeProfileMenuItem === 3 && <AdminBlog data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 4 && <AdminApproveBookingShare data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 5 && <AdminKurorts data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 6 && <AdminCoupons data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 7 && <DoctorCoupons data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 8 && <AdminApproveBooking data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 9 && <MessagesHandler data= {this.props.profile.user} languageId={languageId} account_type={0}/> }
							{ this.state.activeProfileMenuItem === 10 && <AdminAskDoctor data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 11 && <AdminAskDoctorFaq data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 12 && <AdminInvoices data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 13 && <AdminTransfer data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 14 && <AdminTurs data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 15 && <AdminHotelComission data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 16 && <AdminEvaluateSanatorium data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 17 && <SitePages data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 18 && <Robots data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 19 && <SiteMap data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 20 && <AdminAllowAccounts data={this.props.profile.user} languageId={languageId} /> }
							{ this.state.activeProfileMenuItem === 21 && <AdminLoadingScreen data={this.props.profile.user} languageId={languageId} /> }

						</Col>

					</Row>
				</div>

		)
	}
}


const mapDispatchToProps = (dispatch) => {
    return {
        pageActions: bindActionCreators(pageActions, dispatch)
    }
}

const mapStateToProps = ({ profile }) => ({
  profile,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboard);