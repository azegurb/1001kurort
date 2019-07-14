import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Hidden, Visible } from 'react-grid-system'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'

const initialState = {}

class AskDoctorLastQuestions extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign(initialState)
	}

	componentDidMount(){
        this.props.pageActions.setNavigationPathNames([
        	{ label: ['Ask doctor', 'Спросить врача'], link: '/ask_doctor'},
        	{ label: ['Last questions', 'Последние вопросы'], link: '/ask_doctor/faq'},
        ])
	}

	render() {
		const languageId = this.props.languageId - 0;
		const lastQuest = this.props.lastQuest || [];

		return(	
			<div>
				<Row style={{ marginTop: 60 }}>
					<Col>
						{lastQuest.length
							?	lastQuest.map( item =>
									<div>
										{ 
											item.id !== this.state.showDetailedId
											?	<h4 style={{ 
													display: 'inline-block',
													color: '#337ab7',
													cursor: 'pointer',
													borderBottom: '1px dashed #000080'
												}} onClick={ () => this.setState({ showDetailedId: item.id }) }>
													{ item.question } ({ item.category_name[languageId]})
												</h4>
											: 	<div>
													<h4 style={{ 
														color: '#55c901',
														cursor: 'pointer',
													}} onClick={ () => this.setState({ showDetailedId: null }) }>
														{ item.question }
													</h4>
													{item.answers.map( issue =>
														item.answer_id.indexOf(issue.id) > -1 ? 
														<div>
															<p style={{ fontSize: 17 }}>
																{ languageId === 0 ? 'Answer: ' : 'Ответ: ' }
																{issue.text}
															</p>
														</div>
														: ''
													 )}
												</div>
										}
									</div>
								)
							: 	<h4>{ languageId === 0 ? 'No questions found' : 'Не найдены вопросы' }</h4>
						}
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

export default connect(mapStateToProps, mapDispatchToProps)(AskDoctorLastQuestions);