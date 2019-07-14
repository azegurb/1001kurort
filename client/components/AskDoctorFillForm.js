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
import _ from 'lodash'

const regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const initialState = {
	full_name: '',
	short_question: '',
	email: '',
	question: '',
	category: -1				
}


class AskDoctorFillForm extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ sendSuccesfull: false }, initialState)

		this.createQuestion = ::this.createQuestion;
	}

	componentWillMount(){
		this.setState({ specialities: _.sortBy(this.props.specialities || [], 'label') })
	}

	componentDidMount(){
		this.props.pageActions.setNavigationPathNames([
        	{ label: ['Ask doctor', 'Спросить врача'], link: '/ask_doctor'},
        	{ label: ['New question', 'Новый вопрос'], link: '/ask_doctor/questions/new'},
        ])
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.specialities != this.state.specialities){
			this.setState({ specialities: nextProps.specialities || [] })
		}
	}

	createQuestion() {
		axios.post('/api/ask-doctor/question/create',{
			asker_id: this.props.user.users_id,
			full_name: this.state.full_name,
			email: this.state.email,
			short_question: this.state.short_question, 
			question: this.state.question, 
			category: this.state.category,
		}).then( response =>
			this.setState( Object.assign({ sendSuccesfull: true }, initialState))
		)
	}

	render() {
		const languageId = this.props.languageId - 0;

		console.log(this.props)
		return(	
			<div>
				<Row>
					<Col xs={6}>
						<FlatButton 
							label={ languageId === 0 ? 'Back' : 'Назад' }
							containerElement={ <Link to='/ask_doctor'/> }
							style={{ marginTop: 15 }}/>
					</Col>
					<Col xs={6}>
						<h3 style={{ marginTop: 20 }}>{ languageId === 0 ? 'New question' : 'Новый вопрос' }</h3>
					</Col>
					<Col>
						<Divider style={{ marginBottom: 10 }}/>
					</Col>
				</Row>
				{ !_.isEmpty(this.props.user)
				?	<div>
						<Row>
							<Col xs={6}>
								<TextField
									errorText={ this.state.errorFullName && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
									floatingLabelText={ languageId === 0 ? 'Full name' : 'Имя фамилия'}
									value={ this.state.full_name}
									onChange={ (e,full_name) => this.setState({ full_name, errorFullName: !Boolean(full_name) }) }/>
							</Col>
							<Col xs={6}>
								<TextField
									errorText={ this.state.errorEmail && ( languageId === 0 ? 'Invalid value' : 'Неверное значение' ) }
									floatingLabelText={ languageId === 0 ? 'Contact email' : 'Контактная почта'}
									value={ this.state.email}
									onChange={ (e,email) => this.setState({ email, errorEmail: !Boolean(regExpEmail.test(email)) }) }/>
							</Col>
							<Col>
								<TextField
									fullWidth
									errorText={ this.state.errorShortQuest && ( languageId === 0 ? 'Too short' : 'Слишком коротко' ) }
									floatingLabelText={ languageId === 0 ? 'Explain question in short. Ex. `How treat fever` ?' : 'Объясните вопрос короче. Напр. «Как лечить лихорадку»?'}
									value={ this.state.short_question}
									onChange={ (e,short_question) => this.setState({ short_question, errorShortQuest: !Boolean(short_question.length > 5 ) }) }/>
							</Col>
							<Col>
								<TextField
									fullWidth
									multiLine
									rows={4}
									errorText={ this.state.errorQuestion && ( languageId === 0 ? 'Too short' : 'Слишком коротко' ) }
									floatingLabelText={ languageId === 0 ? 'Question ?' : 'Вопрос'}
									value={ this.state.question}
									onChange={ (e,question) => this.setState({ question, errorQuestion: !Boolean(question.length > 10 ) }) }/>
							</Col>
						</Row>
						<Row>
							<Col>
								<SelectField
									fullWidth
									floatingLabelText={ languageId === 0 ? 'Select doctor speciality' : 'Выберите специальность врача' }
									value={ this.state.category }
									onChange={ (e,i, value) => this.setState({ category: value }) }
								>
									{
										this.state.specialities.map( category =>
											<MenuItem value={category.id} primaryText={ languageId === 0 ? category.name : category.name_ru } />
										)
									}
								</SelectField>
							</Col>
							<Col xs={6}>
								
							</Col>
						</Row>
						<Row>
							<Col xs={6}>

							</Col>

							<Col xs={6} style={{ textAlign: 'right' }}>
								<RaisedButton 
									disabled={ 
										!this.state.full_name || this.state.errorFullName || 
										!this.state.email || this.state.errorEmail || 
										!this.state.short_question || this.state.errorShortQuest ||
										!this.state.question || this.state.errorQuestion ||
										!( this.state.category >= 0 )
									}
									labelColor='#fff'
									backgroundColor='#55c901'							
									label={ languageId === 0 ? 'Ok' : 'Ок' }
									onClick={this.createQuestion} />					
							</Col>
						</Row>
					</div>		
				: 	<div>
						<Row>
							<Col style={{ marginTop: 25, textAlign: 'center' }}>
								<h4>
									{ languageId === 0 ? 'To ask a doctor-adviser you need to log in' : 'Чтобы спросить врача-консультанта вам нужно авторизоваться' }
								</h4>
							</Col>
						</Row>
					</div>
				}
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

export default connect(mapStateToProps, mapDispatchToProps)(AskDoctorFillForm);