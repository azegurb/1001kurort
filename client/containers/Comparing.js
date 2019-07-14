import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import Open from 'material-ui/svg-icons/content/add-circle-outline';
import Close from 'material-ui/svg-icons/content/remove-circle-outline';
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import { Link } from 'react-router-dom'
import axios from 'axios'
import _ from 'lodash'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'

import BookingCalendar from '../components/BookingCalendar'

const queryString = require('query-string');

const comparingFields = [
	{ key: 1, label: ['Sanatorium', 'Санаторий'] },
	{ key: 2, label: ['Country', 'Страна'] },
	{ key: 3, label: ['Kurort name', 'Название курорта'] },
	{ key: 4, label: ['Overall rating', 'Общий рейтинг'] },
	{ key: 5, label: ['Treatment rating', 'Рейтинг лечения'] },
	{ key: 6, label: ['Total comments', 'Всего комментариев'] },
	{ key: 7, label: ['Main treatment profile', 'Основной профиль лечения'] },
	{ key: 8, label: ['Secondary treatment profile', 'Второстепенный профиль лечения'] },
	{ key: 9, label: ['Meal plan', 'Питание'] },
	{ key: 10, label: ['Daily doctor visits', 'Осмотров врача в день'] },
	{ key: 11, label: ['Daily physioterapies', 'Физиотерапий в день'] },
	{ key: 12, label: ['Daily procedures', 'Процедур в день'] },
	{ key: 13, label: ['Price from', 'Цена'] },
]

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const styles = {
	field: {
		margin: '0px 10px' , 
		borderBottom: '1px dashed', 
		borderWidth: '90%', 
		height: 45
	}
}

const initialState = {
	sanatoriums: []
}

class Comparing extends Component { 
	
	constructor(props) {
		super(props);

		this.state = initialState

		this.updateSearchDays = ::this.updateSearchDays;
        this.removeFromCompare = ::this.removeFromCompare;
	}

	componentWillMount(){
        this.props.pageActions.setNavigationPathNames([
        	{ label: ['Ask doctor', 'Спросить врача'], link: '/ask_doctor'},
        	{ label: ['New question', 'Новый вопрос'], link: '/ask_doctor/questions/new'},
        ])	
		this.props.pageActions.updateIsLoadingPage(true);
    }

    componentDidMount(){
		let params = queryString.parse(this.props.location.search)

		Promise.all([
			this.props.async.getComparingSanatoriums(params),
		]).then( () => {

			this.setState({ sanatoriums: this.props.asyncData.comparingSanatoriums })
			this.props.pageActions.updateIsLoadingPage(false)
		})
    }

	updateSearchDays() {

	}
	
	removeFromCompare(id) {
		let sanatoriums = this.state.sanatoriums
			
			sanatoriums = _.filter(sanatoriums, item => { return item.id != id });
			this.setState({ sanatoriums, showAddingToCompare: true })
	}

	render() {
		const languageId = this.props.profile.languageId - 0;
		const currencyId = this.props.profile.currencyId - 0;
		const search = queryString.parse(this.props.location.search)
		const paramsStr = queryString.stringify(search)
        const url = process.env.API_URL + this.props.location.pathname
        const { sanatoriums } = this.state;
        console.log(sanatoriums)

		return(	
			<div>
				<Row>
					<Col>
						<h3 className='center'>{ languageId === 0 ? 'Compare of sanatoriums' : 'Сравнение санаториев' }</h3>
						<hr style={{ border: '1px solid gray' }}/>
					</Col>
				</Row>
				<Row className='center'>
					<Col xl={4} offset={{ xl: 3}} >
							<BookingCalendar languageId={languageId} />
					</Col>
					<Col xl={2}>
	                        <RaisedButton
	                            label={languageId === 0 ? 'Choose days' : 'Выбрать дни'} 
	                            onClick={ this.updateSearchDays } />						
					</Col>
				</Row>
				<Row className='center' style={{  margin: 0, marginTop: 50}}>
					<Col xs={6} xl={3} style={{ marginTop: 180, paddingLeft: 0, paddingRight: 0 }}>
						{
							comparingFields.map( (field,index) => 
								<div style={{ borderBottom: '1px dashed', borderWidth: '90%', color: '#585858', fontWeight: 'bold', padding: 2, textAlign: 'left', height: 45 }}>
									{ field.label[languageId]}
								</div>
							)
						}
					</Col>
					{
						sanatoriums.map( (sanatorium, index) =>
							<Col xs={4} xl={3}> 								
								<div className='add-comparing' key={index} style={{ margin: '0px 15px 20px', width: 'calc(100% - 30px)', height: 160, marginBottom: 20 }}>
									<p style={{ background: '#fff', borderBottom: 0 }}>{ sanatorium.sname || sanatorium.sname_ru }</p>
									<i className='fa fa-trash-o' aria-hidden='true' onClick={ () => this.removeFromCompare(sanatorium.id) }></i>
									<img 
										src={sanatorium.avatar || '/images/hotel_default.png'} 
										onError={ (e) => (e.currentTarget).src = '/images/hotel_default.png' }
										style={{ width: '100%' }}/>
								</div>
								<div className='compare-sanatoriums'>
									<div style={styles.field}>
										{ languageId === 0 ? sanatorium.h_sname : sanatorium.h_sname }
									</div>									
									<div style={styles.field}>
										{ languageId === 0 ? sanatorium.country[languageId] : sanatorium.country[languageId] }
									</div>									
									<div style={styles.field}>
										{ languageId === 0 ? sanatorium.kurort[languageId] : sanatorium.kurort[languageId] }
									</div>
									<div style={styles.field}>
										{ languageId === 0 ? sanatorium.general_rating || 'Not rated' : sanatorium.general_rating || 'Не оценен' }
									</div>
									<div style={styles.field}>
										{ languageId === 0 ? sanatorium.treatment_rating || 'Not rated' : sanatorium.treatment_rating || 'Не оценен' }
									</div>
									<div style={styles.field}>
										{ sanatorium.reviews_count }
									</div>
									<div style={styles.field}>
										{  sanatorium.treatments_profiles
											?	sanatorium.treatments_profiles.map( (item,index) => 
													languageId === 0 
													? `${item.name} ${ index+1 !== sanatorium.treatments_profiles.length ? ', ' : '' }`
													: `${item.name_ru} ${ index+1 !== sanatorium.treatments_profiles.length ? ', ' : '' }`
													
												)
											:  	languageId === 0 ? 'Not specified' : 'Не указан' 
										}
									</div>
									<div style={styles.field}>
										{  sanatorium.secondary_profile
											?	sanatorium.secondary_profile.map( (item,index) => 
													languageId === 0 
													? `${item.name} ${ index+1 !== sanatorium.secondary_profile.length ? ', ' : '' }`
													: `${item.name_ru} ${ index+1 !== sanatorium.secondary_profile.length ? ', ' : '' }`
													
												)
											:  	languageId === 0 ? 'Not specified' : 'Не указан' 
										}									
									</div>
									<div style={styles.field}>
										{ 
											sanatorium.chipest_room && sanatorium.chipest_room.meal_plan.map( (item, index) =>
												item === 'breakfast' && (
													languageId === 0 ? `Breakfast${ index+1 !== sanatorium.chipest_room.meal_plan.length ? ',' : ''}` : `Завтрак${ index+1 !== sanatorium.chipest_room.meal_plan.length ? ',' : ''}`
												) ||
												item === 'dinner' && (
													languageId === 0 ? `Dinner${ index+1 !== sanatorium.chipest_room.meal_plan.length ? ',' : ''}` : `Обед${ index+1 !== sanatorium.chipest_room.meal_plan.length ? ',' : ''}`
												) ||
												item === 'supper' && (
													languageId === 0 ? `Supper${ index+1 !== sanatorium.chipest_room.meal_plan.length ? ',' : ''}` : `Ужин${ index+1 !== sanatorium.chipest_room.meal_plan.length ? ',' : ''}`
												)
											) 
										}
									</div>
									<div style={styles.field}>
										{ sanatorium.chipest_room ? sanatorium.chipest_room.daily_doctor_vis : '-' }
									</div>
									<div style={styles.field}>
										{ sanatorium.chipest_room ? sanatorium.chipest_room.daily_physioter : '-' }
									</div>
									<div style={styles.field}>
										{ sanatorium.chipest_room ? sanatorium.chipest_room.daily_procedures : '-' }
									</div>
									<div style={styles.field}>
										{ sanatorium.chipest_room 
											?	<p>
													{sanatorium.chipest_room.price_with_discount >  sanatorium.chipest_room.default_price ? sanatorium.chipest_room.price_with_discount : sanatorium.chipest_room.default_price} {currency[sanatorium.chipest_room.currency]}
												</p>
											: 	languageId === 0 ? 'All rooms are occupied' : 'Все комнаты заняты'
										}
									</div>

		                            <div style={{ marginTop: 15, padding: 15, background: '#55c907' }}>	                        		
		                            	<FlatButton
		                            		label={languageId === 0 ? 'This is my choise' : 'Это мой выбор'} 
		                            		labelStyle={{ color: '#fff', fontWeight: 'bold' }}
		                            		containerElement={ 
		                            			<Link to={{ 
		                            				pathname: '/sanatorium',
		                            				search: paramsStr + '&id=' + sanatorium.id,  
		                            			}} /> 
		                            		}/>
									</div>								
								</div>

							</Col>
						)
					}
					{
						sanatoriums.length < 3 &&
							<Col xs={4} xl={3}>
								<Link to={{ pathname: '/search', search: paramsStr }} >
									<p style={{ fontSize: 20 }}>{languageId === 0 ? 'Add sanatorium' : 'Добавить санаторий'}</p>
									<div style={{ margin: '0 auto', height: 100, width: 100, paddingTop: 23, background: '#fff', border: '1px solid', borderRadius: 250 }}>
										<i className='fa fa fa-plus fa-4x' aria-hidden='true'/>
									</div>
								</Link>							
							</Col>					
					}
				</Row>
			</div>
		)
	}

}


const mapDispatchToProps = (dispatch) => {
	return {
		pageActions: bindActionCreators(pageActions, dispatch),
		async: bindActionCreators(actions, dispatch)
	}
}

const mapStateToProps = ({ profile, asyncData }) => ({
  profile,
  asyncData,
});

export default connect(mapStateToProps, mapDispatchToProps)(Comparing);
