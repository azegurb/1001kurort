import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import _ from 'lodash'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'
import moment from 'moment'

import FiberNew from 'material-ui/svg-icons/av/fiber-new';
import HelpOutline from 'material-ui/svg-icons/action/help-outline';
import ThumbDown from 'material-ui/svg-icons/action/thumb-down';
import ThumbUp from 'material-ui/svg-icons/action/thumb-up';

const initialState = {	
	allSpecialitiesEnable: true,
	filteredQuestions: [],
}

const cancelCreating = {

}
export default class DoctorsArticles extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ questions: [] }, initialState)

	    this.axiosGetQuestions = ::this.axiosGetQuestions;
	    this.axiosGetDoctorTypes = ::this.axiosGetDoctorTypes;
	    this.postAnswer = ::this.postAnswer;
	    this.filterQuestions = ::this.filterQuestions;
	}

	componentWillMount(){
		this.axiosGetQuestions()
		this.axiosGetDoctorTypes()
	}

	axiosGetQuestions() {
		axios.get('/api/ask-doctor/question/not-answered', {
				params: {
					doctor_id: this.props.data.users_id,
				}
			})
			 .then( response => {

			 	this.setState({ 
			 		questions: response.data.data || [], 
			 		filteredQuestions: response.data.data || [],
			 	})
			 })
	}

	axiosGetDoctorTypes() {
		axios.get('/admin/doctor-coupons')
			 .then( response => {

				if(this.props.data.d_coupon_type){
					let doctorCategory = _.find(response.data.data, { id: this.props.data.d_coupon_type})
					
					if(!doctorCategory) return;

					this.setState({ doctorCategory })
				}

			 })
	}

	postAnswer() {
		axios.post('/api/ask_doctor/question/answer',{
			question_id: this.state.showDetailedId,
			consultant_id: this.props.data.users_id,
			text: this.state.answer
		}).then( () => {
			this.axiosGetQuestions()
			this.setState({ showDetailedId: null, answer: '' })
		})
	}

	filterQuestions() {
		if(!this.state.allSpecialitiesEnable){
			this.setState({ filteredQuestions: _.filter(this.state.questions, { category: this.props.data.d_category }) })
		}else{
			this.setState({ filteredQuestions: this.state.questions })
		}
	}

	render() {
		const languageId = this.props.languageId - 0;
		const haveSpeciality = this.props.data.d_speciality_id
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col>
						<h2>{ languageId === 0 ? 'This is your coupon. Pass it to the client, in order to confirm that you consulted him :' : 'Это ваш купон. Передайте клиенту его, для того, чтобы подтвердить, что вы его консультировали :' }</h2>
						{this.props.data.d_coupon_code}
						<h2>
							{ this.state.doctorCategory 
								?	languageId === 0 
									? `Your type : ${this.state.doctorCategory.name}, discount: -${this.state.doctorCategory.percent}%`
									: `Ваш тип : ${this.state.doctorCategory.name}, скидка: -${this.state.doctorCategory.percent}%`
								: 	languageId === 0 
									? `While you are not assigned an administrator category, a discount of -0%`
									: `Пока вам не назначил администратор категорию, скидка -0%`
							}
						</h2>
					</Col>
				</Row>
				<Row style={{ marginTop: 40 }}>
					<Col xs={6}>
							<Checkbox
								disabled = { !haveSpeciality }
								label={ languageId === 0 ? `Only my speciality (${this.props.data.d_speciality[languageId]})`: `Только моей специальности (${this.props.data.d_speciality[languageId]})` }
								checked={ !this.state.allSpecialitiesEnable }
								onCheck={ (e, value) => this.setState({ allSpecialitiesEnable: !value }, this.filterQuestions) }/>
							<Checkbox
								label={ languageId === 0 ? 'All specialities': 'Все специальности' }
								checked={this.state.allSpecialitiesEnable}
								onCheck={ (e, value) => this.setState({ allSpecialitiesEnable: haveSpeciality ? value : true }, this.filterQuestions) }/>

					</Col>
					<Col>
						<Divider style={{ marginTop: 10, marginBottom: 10 }}/>
					</Col>
					<Col>
					{
						this.state.filteredQuestions.length
						?	this.state.filteredQuestions.map( item =>

								item.status !== 1 ?
								<Row>
									<Col>
										<div style={{ float: 'left', marginRight: 10, marginTop: 6 }}> 
											<HelpOutline />
										</div>
										{ 
											item.id !== this.state.showDetailedId
											?	<div>
													<h4 style={{ 
														marginTop: 5,
														display: 'inline-block',
														color: '#337ab7',
														cursor: 'pointer',
														borderBottom: '1px dashed #000080'
													}} onClick={ () => this.setState({ showDetailedId: item.id }) }>
														{ item.short_question }
													</h4>
													<p>{ languageId ===  0 ? `Doctor speciality: ${ item.category_name[languageId]}` : `Профиль врача: ${item.category_name[languageId]}` }</p>
												</div>
											: 	<div style={{ marginLeft: 30, marginBottom: 25 }}>
													<h3 style={{ 
														marginTop: 5,
														color: '#55c901',
														cursor: 'pointer',
													}} onClick={ () => this.setState({ showDetailedId: null }) }>
														{ item.question }
													</h3>
													<TextField
														fullWidth
														multiLine
														rows={3}
														floatingLabelText={ languageId === 0 ? 'Answer' : 'Ответ' }
														value={this.state.answer}
														onChange={ (e, value) => this.setState({ answer: value }) }/>
													<RaisedButton
														disabled={ !this.state.answer }
														label={ languageId === 0 ? 'Confirm' : 'Подтвердить' }
														onClick={ this.postAnswer }/>
												</div>
										}
									</Col>
								</Row>
								: ''
							)
						: 	<h4>{ languageId === 0 ? 'There are no unanswered questions' : 'Нету неотвеченных вопросов' }</h4>
					}
					</Col>
				</Row>
			</div>
		)
	}

}