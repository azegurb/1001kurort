import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import Drawer from 'material-ui/Drawer'
import { Link } from 'react-router-dom'

import HotelsMyProfile from '../forms/HotelsMyProfile'
import HotelsGeneralInfo from '../forms/HotelsGeneralInfo'
import HotelsPhotos from '../forms/HotelsPhotos'
import HotelsTreatment from '../forms/HotelsTreatment'
import HotelsFacilitiesServices from '../forms/HotelsFacilitiesServices'
import HotelsRoomsTypes from '../forms/HotelsRoomsTypes'
import HotelsRoomsDetails from '../forms/HotelsRoomsDetails'
import HotelsPaymentMethods from '../forms/HotelsPaymentMethods'
import HotelsCalendar from '../forms/HotelsCalendar'
import HotelsCopyPrices from '../forms/HotelsCopyPrices'
import HotelsOpenCloseRooms from '../forms/HotelsOpenCloseRooms'
import HotelsPricingCategories from '../forms/HotelsPricingCategories'
import HotelsPricesChildren from '../forms/HotelsPricesChildren'
import HotelsPricingCondition from '../forms/HotelsPricingCondition'
import HotelsRefundablePrices from '../forms/HotelsRefundablePrices'
import HotelsCancellationPolicies from '../forms/HotelsCancellationPolicies'
import MessagesHandler from '../MessagesHandler'
import HotelsReviews from '../forms/HotelsReviews'
import HotelsInvoices from '../forms/HotelsInvoices'

import RemoveRedEye from 'material-ui/svg-icons/image/remove-red-eye';
import AccountBox from 'material-ui/svg-icons/action/account-box';
import Favorite from 'material-ui/svg-icons/action/favorite';
import Payment from 'material-ui/svg-icons/action/payment';
import Assignment from 'material-ui/svg-icons/action/assignment';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Build from 'material-ui/svg-icons/action/build';
import Mail from 'material-ui/svg-icons/content/mail';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import MonetizationOn from 'material-ui/svg-icons/editor/monetization-on';
import CamerAlt from 'material-ui/svg-icons/image/camera-alt';
import AttachMoney from 'material-ui/svg-icons/editor/attach-money';
import MoneyOff from 'material-ui/svg-icons/editor/money-off';
import LocalOffer from 'material-ui/svg-icons/maps/local-offer';
import LocalBar from 'material-ui/svg-icons/maps/local-bar';
import LocalHospital from 'material-ui/svg-icons/maps/local-hospital';
import Hotel from 'material-ui/svg-icons/maps/hotel';
import Close from 'material-ui/svg-icons/navigation/close';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import Business from 'material-ui/svg-icons/communication/business';
import Public from 'material-ui/svg-icons/social/public';
import ChildCare from 'material-ui/svg-icons/places/child-care';

import axios from 'axios'

import { bindActionCreators } from 'redux';
import * as pageActions from '../../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'


let SelectableList = makeSelectable(List);

const MenuItems =	[
						{id : '0', label : ['My profile','Мой профиль'] },
						{id : '11', label : ['General info','Общая информация'] },
						{id : '12', label : ['Photos','Фото'] },
						{id : '13', label : ['Treatment','Лечение'] },
						{id : '14', label : ['Facilities & Services','Удобства и сервис'] },
						{id : '15', label : ['Rooms types','Типы комнат'] },
						{id : '16', label : ['Rooms details','Детали комнат'] },
						{id : '17', label : ['Payment methods','Способы оплаты'] },
						{id : '21', label : ['Calendar','Календарь'] },
						{id : '22', label : ['Copy early prices','Скопировать старые цены'] },
						{id : '23', label : ['Open/Close rooms for sale','Открыть/Закрыть комнату для сдачи'] },
						{id : '24', label : ['Pricing categories','Ценовые категории'] },
						{id : '25', label : ['Prices for children','Цены для детей'] },
						{id : '26', label : ['Add pricing conditions','Добавить ценовые условия'] },
						{id : '27', label : ['Non refundable prices','Невозвращаемые цены'] },
						{id : '28', label : ['Cancellation policies','Политика аннулирования'] },
						{id : '3', label : ['Mails','Сообщения'] },
						{id : '4', label : ['Reviews and Feedback','Просмотры и отзывы'] },
						{id : '5', label : ['Invoices','Счета'] }
					]


function mapStateToProps(state) {
	return {
		profile: state.profile
	}
}

function mapDispatchToProps(dispatch) {
	return {
		pageActions: bindActionCreators(pageActions, dispatch)
	}
}

@connect(mapStateToProps, mapDispatchToProps)

export default class ProfilePersonalDetails extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeProfileMenuItem : 0,
			open : false
		};

		this.handleToggle = ::this.handleToggle;
		this.handleMenuItems = ::this.handleMenuItems;
		this.handleNestedMenuItems = ::this.handleNestedMenuItems;
	}

	componentWillMount() {
		const { history, profile } = this.props;

		if ( _.isEmpty(profile.user) ) {
			history.replace({ pathname: '/auth/hotel' });
		}
	}

 	handleToggle() { 
 		this.setState({open: !this.state.open});
	}

	handleMenuItems(event, menuItem, index ) {
		this.setState({ activeProfileMenuItem : index });
	}

	handleNestedMenuItems(e) {
		this.setState({ activeProfileMenuItem : parseInt(e.currentTarget.id) , open : !this.state.open });
	}
	
	render() {
		
        const languageId = this.props.profile.languageId - 0;
        const user = this.props.profile.user;

		return(

			 
				<Row>
					<Drawer
						docked={false}
						width={500}
						open={this.state.open}
						onRequestChange={(open) => this.setState({open})}
						containerStyle = {{ paddingTop : '15px' }}>
					
						<Col> 
							{ languageId === 0 ? 'Name' : 'Название' } : <strong> { ( languageId === 0 ? user.h_sname : user.h_sname ) || 'No name' } </strong> 
						</Col>
						
						<Col> 
							{ languageId === 0 ? 'ID' : 'ИД' } : { user.users_id } 
						</Col>
						<List style={{ marginTop : 50 }}>
							
								<ListItem value={0} id={0} primaryText={ languageId === 0 ? 'My profile' : 'Мой профиль' } leftIcon={<AccountBox />} onClick={ ::this.handleNestedMenuItems }/>
								<ListItem
									primaryTogglesNestedList 
									value={1} 
									primaryText={ languageId === 0 ? 'Sanatorium details' : 'Санаторий детали' } 
									leftIcon={<Business />} 
									nestedItems={[

										<ListItem key={1} id={11} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'General info' : 'Общая информация' } leftIcon={<Public />} />,
										<ListItem key={2} id={12} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Photos' : 'Фото' } leftIcon={<CamerAlt />} />,
										<ListItem key={3} id={13} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Treatment' : 'Лечение' } leftIcon={<LocalHospital />} />,
										<ListItem key={4} id={14} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Facilities & Services' : 'Удобства и сервис' } leftIcon={<LocalBar />} />,
										<ListItem key={5} id={15} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Rooms types' : 'Типы комнат' } leftIcon={<Hotel />} />,
										<ListItem key={6} id={16} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Rooms details' : 'Детали комнат' } leftIcon={<Assignment />} />,
										<ListItem key={7} id={17} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Payment methods' : 'Способы оплаты' } leftIcon={<Payment />} />
									]}/>
								<ListItem
									primaryTogglesNestedList 
									value={2} 
									primaryText={ languageId === 0 ? 'Hotels and available rooms' : 'Отели и свободные комнаты' } 
									leftIcon={<RemoveRedEye />} 
									nestedItems={[
										<ListItem key={1} id={21} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Calendar' : 'Календарь' } leftIcon={<Calendar />} />,
										<ListItem key={2} id={22} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Copy early prices' : 'Скопировать старые цены' } leftIcon={<ContentCopy />} />,
										<ListItem key={3} id={23} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Open/Close rooms for sale' : 'Открыть/Закрыть комнату для сдачи' } leftIcon={<Build />} />,
										<ListItem key={4} id={24} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Pricing categories' : 'Ценовые категории' } leftIcon={<AttachMoney />} />,
										<ListItem key={5} id={25} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Prices for children' : 'Цены для детей' } leftIcon={<ChildCare />} />,
										<ListItem key={6} id={26} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Add pricing conditions' : 'Добавить ценовые условия' } leftIcon={<MoneyOff />} />,
										<ListItem key={7} id={27} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Non refundable prices' : 'Невозвращаемые цены' } leftIcon={<LocalOffer />} />,
										<ListItem key={8} id={28} onTouchTap={ ::this.handleNestedMenuItems } primaryText={ languageId === 0 ? 'Cancellation policies' : 'Политика аннулирования' } leftIcon={<Close />} />
									]}/>
								<ListItem value={3} id={3} primaryText={ languageId === 0 ? 'Mails' : 'Сообщения' } leftIcon={<Mail />} onClick={ ::this.handleNestedMenuItems }/>
								<ListItem value={4} id={4}  primaryText={ languageId === 0 ? 'Reviews and Feedback' : 'Просмотры и отзывы' } leftIcon={<Favorite />} onClick={ ::this.handleNestedMenuItems }/>
								<ListItem value={5} id={5}  primaryText={ languageId === 0 ? 'Invoices' : 'Счета' } leftIcon={<MonetizationOn />} onClick={ ::this.handleNestedMenuItems }/>
						</List>

					</Drawer>
					

					<Col  xs={10} offset={{ xs : 1 }}>
						<Row>
							<Col xs={12} >
								<h2 style={{ float : 'right' }}> { _.find(MenuItems, [ 'id',this.state.activeProfileMenuItem.toString() ]).label[languageId] } </h2>
								<IconButton 
									tooltip={ /* languageId === 0 ? 'Open menu' : 'Открыть меню'*/ '' }
									style={{ width: 64, height: 64, padding: 8 }} 
									iconStyle={{ width: 48, height: 48 }} 
									onClick={this.handleToggle} >

									<MenuIcon hoverColor='#49c407' color='rgb(158, 158, 158)'/>
								</IconButton>
							</Col>
							<Col xs={12}>
								<Divider style={{ backgroundColor: 'rgb(73, 196, 7)' }} />
							</Col>

						</Row>

						{ this.state.activeProfileMenuItem === 0 && <HotelsMyProfile data= {this.props.profile.user} languageId={languageId} /> }

						{ this.state.activeProfileMenuItem === 11 && <HotelsGeneralInfo data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 12 && <HotelsPhotos data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 13 && <HotelsTreatment data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 14 && <HotelsFacilitiesServices data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 15 && <HotelsRoomsTypes data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 16 && <HotelsRoomsDetails data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 17 && <HotelsPaymentMethods data= {this.props.profile.user} languageId={languageId} /> }

						{ this.state.activeProfileMenuItem === 21 && <HotelsCalendar data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 22 && <HotelsCopyPrices data= {this.props.profile.user} languageId={languageId} /> }						
						{ this.state.activeProfileMenuItem === 23 && <HotelsOpenCloseRooms data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 24 && <HotelsPricingCategories data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 25 && <HotelsPricesChildren data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 26 && <HotelsPricingCondition data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 27 && <HotelsRefundablePrices data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 28 && <HotelsCancellationPolicies data= {this.props.profile.user} languageId={languageId} /> }

						{ this.state.activeProfileMenuItem === 3 && <MessagesHandler data= {this.props.profile.user} languageId={languageId} account_type={3}/> }
						{ this.state.activeProfileMenuItem === 4 && <HotelsReviews data= {this.props.profile.user} languageId={languageId} /> }
						{ this.state.activeProfileMenuItem === 5 && <HotelsInvoices data= {this.props.profile.user} languageId={languageId} /> }

					</Col>

				</Row>

		)
	}
}