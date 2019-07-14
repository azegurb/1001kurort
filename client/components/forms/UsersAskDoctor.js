import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import { Link } from 'react-router-dom'
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

}

const cancelCreating = {

}
export default class DoctorsArticles extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ questions: [] }, initialState)

		this.axiosGetQuestions = ::this.axiosGetQuestions;
	}

	componentWillMount() {
		this.axiosGetQuestions()
	}

	axiosGetQuestions() {
		axios.get('/api/profile/ask-doctor/question',{
			params: {
				users_id: this.props.data.users_id
			}
		})
		.then( response => this.setState({ questions: response.data.data || [] }) )
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
							?	this.state.questions.map( item =>
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
														}} onClick={ () => this.setState({ showDetailedId: item.id }) }>
															{ item.short_question }
														</h3>
													</div>
												: 	<div style={{ marginLeft: 35 }}>
														<h3 style={{ 
															marginTop: 5,
															color: '#55c901',
															cursor: 'pointer',
														}} onClick={ () => this.setState({ showDetailedId: null }) }>
															{ item.short_question }
														</h3>
														{
															item.answers[0] != null
															?	item.answers.map( answer => 
																	<div>
																		<p>{languageId === 0 ? `Question: ${item.question}` : `Вопрос: ${item.question}`}</p>
																		<p style={{ marginLeft: 20, marginBottom: 0, fontSize: 20 }}>{ languageId === 0 ? `Consultant #${answer.consultant_id}: ` : `Консультант #${answer.consultant_id}: ` }{ answer.text }</p>
																	</div>
																)
															: 	<div>
																	<p>{languageId === 0 ? `Question: ${item.question}` : `Вопрос: ${item.question}`}</p>
																	<h4 style={{ marginLeft: 20 }}>{ languageId === 0 ? 'You have not yet responded' : 'Вам еще не ответили' }</h4>
																</div>
														}
													</div>
											}
										</Col>
									</Row>								
								)
							: 	<h4>
									{ languageId === 0 ? 'You have not asked anything yet. You can ask ' : 'Вы еще ничего не спрашивали. Спросить можно ' }
									<Link to='/ask_doctor/questions/new'>{ languageId === 0 ? 'here' : 'тут' }</Link>
								</h4>
						}
					</Col>
				</Row>
			</div>
		)
	}

}