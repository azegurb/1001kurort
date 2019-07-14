import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import Drawer from 'material-ui/Drawer'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import * as pageActions from '../../redux/actions/PageActions'
import { connect } from 'react-redux'
import _ from 'lodash'
import axios from 'axios'

import UserFormProfileInfo from '../forms/UserFormProfileInfo'
import UsersAskDoctor from '../forms/UsersAskDoctor'
import UserBookings from '../forms/UserBookings'
import UsersFunnySatellite from '../forms/UsersFunnySatellite'
import MessagesHandler from '../MessagesHandler'

const MenuItems =	[
						{id : '0', label : ['My profile','Мой профиль'] },
						{id : '4', label : ['My bookings','Мои бронирования'] },
						{id : '1', label : ['Ask doctor','Спросить врача'] },
						{id : '2', label : ['Funny satellite','Веселый спутник'] },
						{id : '3', label : ['Messages','Сообщения'] },
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

export default class UserDashboard extends Component {
	
	constructor(props) {
		super(props);

		this.state = {
			activeProfileMenuItem : 0,
			open : false,
		};

		this.handleMenuItems = ::this.handleMenuItems;
		this.handleNestedMenuItems = ::this.handleNestedMenuItems;
	}

    componentWillMount() {
        const { history, profile } = this.props;
        if ( _.isEmpty(profile.user) ) {
            history.replace({ pathname: '/' });
        }
    }

	handleMenuItems(event, menuItem, index ) {
		this.setState({ activeProfileMenuItem : index });
	}

	handleNestedMenuItems(id) {
		this.setState({ activeProfileMenuItem : id , open : !this.state.open });
	}
	
	render() {
		
        const languageId = this.props.profile.languageId - 0;
        const user = this.props.data;

		return(
				<div>
					<Row>
						<Drawer
							docked={false}
							width={500}
							open={this.state.open}
							onRequestChange={(open) => this.setState({open})}
							containerStyle = {{ paddingTop : '15px' }}>
						
							<Col> 
								{ languageId === 0 ? 'Name' : 'Название' } : <strong> { (languageId === 0 ? user.first_name : user.first_name ) || 'No name' } </strong> 
							</Col>
							
							<Col> 
								{ languageId === 0 ? 'ID' : 'ИД' } : { user.users_id } 
							</Col>
							<List style={{ marginTop : 50 }}>
								
									<ListItem value={0} primaryText={ languageId === 0 ? 'My profile' : 'Мой профиль' } onClick={ () => this.handleNestedMenuItems(0) }/>
									<ListItem value={1} primaryText={ languageId === 0 ? 'Ask doctor' : 'Спросить врача' } onClick={ () => this.handleNestedMenuItems(1) }/>
									<ListItem value={4} primaryText={ languageId === 0 ? 'My bookings' : 'Мои бронирования' } onClick={ () => this.handleNestedMenuItems(4) }/>
									<ListItem value={2} primaryText={ languageId === 0 ? 'Funny satellite' : 'Веселый спутник' } onClick={ () => this.handleNestedMenuItems(2) }/>
									<ListItem value={3} primaryText={ languageId === 0 ? 'Messages' : 'Сообщения' } onClick={ () => this.handleNestedMenuItems(3) }/>
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
										onClick={ () => this.setState({ open: !this.state.open }) } >

										<MenuIcon hoverColor='#49c407' color='rgb(158, 158, 158)'/>
									</IconButton>
								</Col>
								<Col xs={12}>
									<Divider style={{ backgroundColor: 'rgb(73, 196, 7)' }} />
								</Col>

							</Row>

							{ this.state.activeProfileMenuItem === 0 && <UserFormProfileInfo languageId={languageId}  /> }							
							{ this.state.activeProfileMenuItem === 1 && <UsersAskDoctor data= {this.props.profile.user} languageId={languageId}  /> }
							{ this.state.activeProfileMenuItem === 2 && <UsersFunnySatellite data= {this.props.profile.user} languageId={languageId}  /> }
							{ this.state.activeProfileMenuItem === 3 && <MessagesHandler data= {this.props.profile.user} languageId={languageId} account_type={1}/> }
							{ this.state.activeProfileMenuItem === 4 && <UserBookings data={this.props.profile.user} languageId={languageId}/> }

						</Col>

				</Row>
			</div>
						
		)
	}
}