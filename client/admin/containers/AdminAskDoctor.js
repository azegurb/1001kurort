import React, { Component}  from 'react'
import { Link } from 'react-router-dom'
import ReactDom from 'react-dom'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import SelectField from 'material-ui/SelectField'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import CircularProgress from 'material-ui/CircularProgress'
import HelpOutline from 'material-ui/svg-icons/action/help-outline';
import ThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ThumbDown from 'material-ui/svg-icons/action/thumb-down';

const initialState = {
	creatingFaq: true,
	requestDone: true,
	shortQuestEn: '',
	shortQuestRu: '',
	fullQuestEn: '',
	fullQuestRu: '',
	answerEn: '',
	answerRu: '',
	evaluatedAnswers: [],
	evaluatedConsultants: [],
}

export default class AdminDiscountBanners extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ questions: [] }, initialState)

		this.axiosGetQuestions = ::this.axiosGetQuestions;
		this.evaluateAnswers = ::this.evaluateAnswers;
		this.onCheckAnswer = ::this.onCheckAnswer;
		this.deleteQuestion = ::this.deleteQuestion;
	}

	componentWillMount(){
		this.axiosGetQuestions()
	}


	axiosGetQuestions() {
		axios.get('/api/admin/ask-doctor/questions')
		.then( response => this.setState({ questions: response.data.data || [], showDetailedId: null }) )
	}	


	evaluateAnswers() {
		let currentQuestion = _.find(this.state.questions, {id: this.state.showDetailedId})

		console.log(currentQuestion)
		axios.post('/api/admin/ask-doctor/questions',{
			question_id: currentQuestion.id,
			answers_id: this.state.evaluatedAnswers,
			consultants_id: this.state.evaluatedConsultants,
			status: currentQuestion.status
		}).then( () => this.axiosGetQuestions() )
	}


	onCheckAnswer(id, cons_id) {
		let evaluatedAnswers = this.state.evaluatedAnswers,
			evaluatedConsultants = this.state.evaluatedConsultants;

		evaluatedAnswers.indexOf(id) > -1 ? evaluatedAnswers.splice(evaluatedAnswers.indexOf(id)) : evaluatedAnswers.push(id)
		evaluatedConsultants.indexOf(cons_id) > -1 ? evaluatedConsultants.splice(evaluatedConsultants.indexOf(cons_id)) : evaluatedConsultants.push(cons_id)

		this.setState({ evaluatedAnswers, evaluatedConsultants })
	}

	handleOpenCloseQuestion(item, index) {
		let questions = this.state.questions

		questions[index].status = item.status === 1 ? 0 : 1

		this.setState({ questions })
	}

	deleteQuestion(id) {
		axios.post('/api/admin/ask_doctor/delete', { id })
		  .then( () => this.axiosGetQuestions() )
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col>
						<h3>{ languageId === 0 ? 'Questions' : 'Вопросы' }</h3>
					</Col>
				</Row>
				<Row>
					<Col>
						{
							this.state.questions.length
							?	this.state.questions.map( (item, index) =>
									<Row>
										<Col>
											<div style={{ float: 'left', marginRight: 10, marginTop: 6 }}> 
												<HelpOutline />
											</div>
											{ 
												item.id !== this.state.showDetailedId
												?	<div>
														<h3 style={{ 
															marginTop: 5,
															display: 'inline-block',
															color: item.status === 1 ? 'green' : '#337ab7',
															cursor: 'pointer',
															borderBottom: '1px dashed #000080'
														}} onClick={ () => this.setState({ showDetailedId: item.id, evaluatedAnswers: item.answer_id, evaluatedConsultants: item.answer_cons_id }) }>
															{ item.short_question }
														</h3>
													</div>
												: 	<div style={{ 
													  marginLeft: 35,
													}}>
														<h3 style={{ 
															marginTop: 5,
															color: '#55c901',
															cursor: 'pointer',
														}} onClick={ () => this.setState({ showDetailedId: null }) }>
															{ item.short_question }
														</h3>
														<p>{languageId === 0 ? `Question: ${item.question}` : `Вопрос: ${item.question}`}</p>
														<div style={{ 
															position: 'relative',
															background: '#fff', 
															borderRadius: 3,
															border: '1px solid black',
															padding: 10 
														}}>
															<h3 style={{ marginLeft: 20 }}>{languageId === 0 ? `Status: ${item.status === 1 ? 'open' : 'closed'}` : `Статус: ${item.status === 1 ? 'закрыт' : 'открыт'}`}</h3>
															<span 
															  style={{ position: 'absolute', top: 28, right: 50, fontSize: 22, color: '#4283b6', textDecoration: 'underline', cursor: 'pointer' }}
															  onClick={() => this.handleOpenCloseQuestion(item, index)}
															>
															{   item.status === 1 
																?  (languageId === 0 ? 'Open' : 'Открыть')
																:  (languageId === 0 ? 'Close' : 'Закрыть')}
															</span>
															<hr/>
														{
															item.answers[0] != null
															?	item.answers.map( answer => 
																	<div>
																		<p style={{ marginLeft: 20, marginBottom: 0, fontSize: 20 }}>
																			<b>{ languageId === 0 ? `Consultant #${answer.consultant_id}: ` : `Консультант #${answer.consultant_id}: ` }</b>
																			{ answer.text }
																		</p>
																		<FlatButton
																			label={this.state.evaluatedAnswers && this.state.evaluatedAnswers.indexOf(answer.id) > -1 ? 'Решение' : 'Не решение'}
																			icon={this.state.evaluatedAnswers && this.state.evaluatedAnswers.indexOf(answer.id) > -1 ? <ThumbUp/> : <ThumbDown/>} 
																			style={{ margin: 10 }}
																			onClick={() => this.onCheckAnswer(answer.id, answer.consultant_id)}/>
																	</div>
																)
															: 	<div>
																	<h4 style={{ marginLeft: 20 }}>{ languageId === 0 ? 'You have not yet responded' : 'Вам еще не ответили' }</h4>
																</div>
														}
														<div style={{ textAlign: 'right' }}>
															<FlatButton 
																label={languageId === 0 ? 'Update' : 'Обновить'}
																onClick={this.evaluateAnswers}/>

															<FlatButton 
																label={languageId === 0 ? 'Delete' : 'Удалить'}
																onClick={() =>this.deleteQuestion(this.state.showDetailedId)}/>	
														</div>
													  </div>	
													</div>
											}
										</Col>
									</Row>								
								)
							: 	<h4>
									{ languageId === 0 ? 'No questions found' : 'Вопросы не найдены' }
								</h4>
						}
					</Col>
				</Row>
			</div>
		)
	}

}