import React, { Component}  from 'react'
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

const initialState = {
	creatingFaq: true,
	requestDone: true,
	shortQuestEn: '',
	shortQuestRu: '',
	fullQuestEn: '',
	fullQuestRu: '',
	answerEn: '',
	answerRu: '',
}

export default class AdminDiscountBanners extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ listFaqs: [] }, initialState)

		this.axiosGetFaqs = ::this.axiosGetFaqs;
		this.createFaq = ::this.createFaq;
		this.changeFaq = ::this.changeFaq;
		this.deleteFaq = ::this.deleteFaq;
		this.handleOpenBanner = ::this.handleOpenBanner;
	}

	componentWillMount(){
		this.axiosGetFaqs()
	}

	axiosGetFaqs() {
		axios
			.get('/admin/ask-doctor/faq')
			.then(response =>
				this.setState(Object.assign({ listFaqs: response.data.data, requestDone: true }, initialState ) )
			)
	}

	createFaq() {
		axios.post('/admin/ask-doctor/faq/create', {
			question_short: this.state.shortQuestEn, 
			question: this.state.fullQuestEn, 
			answer: this.state.answerEn, 
			question_short_ru: this.state.shortQuestRu, 
			question_ru: this.state.fullQuestRu, 
			answer_ru: this.state.answerRu, 
		}).then( () => this.axiosGetFaqs() )

	}


	changeFaq() {
		this.setState({ requestDone: false, creatingFaq: true })
		
		axios.post('/admin/ask-doctor/faq/update', {
			id: this.state.id,
			question_short: this.state.shortQuestEn, 
			question: this.state.fullQuestEn, 
			answer: this.state.answerEn, 
			question_short_ru: this.state.shortQuestRu, 
			question_ru: this.state.fullQuestRu, 
			answer_ru: this.state.answerRu, 
		}).then( () => this.axiosGetFaqs() )
	}


	deleteFaq() {
		this.setState({ requestDone: false, creatingFaq: true }) 
		axios
			.post('/admin/ask-doctor/faq/delete', { id: this.state.id } )
			.then( () => this.axiosGetFaqs() )	
	}

	handleOpenBanner(id) {
		let faq = _.find( this.state.listFaqs, { id } )

		this.setState({ 
			id: faq.id,
			shortQuestEn: faq.question_short, 
			fullQuestEn: faq.question, 
			answerEn: faq.answer, 
			shortQuestRu: faq.question_short_ru, 
			fullQuestRu: faq.question_ru, 
			answerRu: faq.answer_ru, 
			creatingFaq: false,
		})
	}



	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)
		return(	
			<div>
				<Row>
					<Col xl={6} style={{ marginTop: 15 }}>
						
						<ListItem
							primaryText={ languageId === 0 ? 'Add item' : 'Новый пункт' }
							onClick={ () => this.setState({ 
								creatingFaq: true, 
								id: 0,
								shortQuestEn: '', 
								fullQuestEn: '', 
								answerEn: '', 
								shortQuestRu: '', 
								fullQuestRu: '', 
								answerRu: '', 
							}) } />
						<Divider />		

						<List autoWidth={false} width={300} style={{ marginTop: 5 }}>
						{
							this.state.listFaqs.map( item =>
								<ListItem 
									primaryText={ 
										languageId === 0
										?	item.question_short
										: 	item.question_short_ru
									} 
									onClick={ () => this.handleOpenBanner(item.id) } />
							)
						}
						</List>

					</Col>
					<Col xl={6}>
						{
							!this.state.requestDone
							?	<div style={{ textAlign: 'center', marginTop: 30 }}>
									<CircularProgress
										color='#55c908'
										size={50}
										thickness={4} />
								</div>
							: 	<div>
									<Row>
										<Col>
											<TextField
												fullWidth
												floatingLabelText={ languageId === 0 ? 'Short question EN' : 'Короткий вопрос EN' }
												value={ this.state.shortQuestEn }
												onChange={ (e, value) => this.setState({ shortQuestEn : value }) }/>
										</Col>
										<Col>
											<TextField
												fullWidth
												floatingLabelText={ languageId === 0 ? 'Short question RU' : 'Короткий вопрос RU' }
												value={ this.state.shortQuestRu }
												onChange={ (e, value) => this.setState({ shortQuestRu : value }) }/>
										</Col>
										<Col>
											<TextField
												multiLine
												fullWidth
												rows={4}
												floatingLabelText={ languageId === 0 ? 'Question EN' : 'Вопрос EN' }
												value={ this.state.fullQuestEn }
												onChange={ (e, value) => this.setState({ fullQuestEn : value }) }/>
										</Col>
										<Col>
											<TextField
												multiLine
												fullWidth
												rows={4}
												floatingLabelText={ languageId === 0 ? 'Question RU' : 'Вопрос RU' }
												value={ this.state.fullQuestRu }
												onChange={ (e, value) => this.setState({ fullQuestRu : value }) }/>
										</Col>
										<Col>
											<TextField
												multiLine
												fullWidth
												rows={4}
												floatingLabelText={ languageId === 0 ? 'Unswer EN' : 'Ответ EN' }
												value={ this.state.answerEn }
												onChange={ (e, value) => this.setState({ answerEn : value }) }/>
										</Col>
										<Col>
											<TextField
												multiLine
												fullWidth
												rows={4}
												floatingLabelText={ languageId === 0 ? 'Unswer RU' : 'Ответ RU' }
												value={ this.state.answerRu }
												onChange={ (e, value) => this.setState({ answerRu : value }) }/>
										</Col>
										<Row>
											<Col xs={6}>
												{ this.state.errorNewBanner && <p style={{ color: 'red', paddingLeft: 15, paddingTop: 10 }}>{ languageId === 0 ? 'Check data' : 'Проверьте данные'}</p> }
											</Col>
											<Col xs={6} style={{ textAlign: 'right' }}>
												{ 
													this.state.creatingFaq
													?	<FlatButton
															disabled={
																!this.state.shortQuestEn ||
																!this.state.shortQuestRu ||
																!this.state.fullQuestEn ||
																!this.state.fullQuestRu ||
																!this.state.answerEn ||
																!this.state.answerRu
															}
															label={ languageId === 0 ? 'Create' : 'Создать'} 
															onClick={ this.createFaq } />
													: 	[
														<FlatButton															
															label={ languageId === 0 ? 'Delete' : 'Удалить'} 
															onClick={ this.deleteFaq } />,
														<FlatButton 
															disabled={
																!this.state.shortQuestEn ||
																!this.state.shortQuestRu ||
																!this.state.fullQuestEn ||
																!this.state.fullQuestRu ||
																!this.state.answerEn ||
																!this.state.answerRu
															}															
															label={ languageId === 0 ? 'Update' : 'Обновить'} 
															onClick={ this.changeFaq } />,
														]
												}
											</Col>
										</Row>			
									</Row>
								</div>
						}
					</Col>
				</Row>
			</div>
		)
	}

}