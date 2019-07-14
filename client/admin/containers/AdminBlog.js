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
	selectedFilter: 1,
	showArticle: false,
	requestDone: true,
	declineText: '',
}

export default class Blog extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ articlesRes: [], articles: [] }, initialState)

		this.axiosGetArticles = ::this.axiosGetArticles;
		this.axiosGetDiseaseNames = ::this.axiosGetDiseaseNames;
		this.handleOpenBanner = ::this.handleOpenBanner;
		this.handleSelectedFilter = ::this.handleSelectedFilter;
		this.apprDeclArticle = ::this.apprDeclArticle;
		this.deleteArticle = ::this.deleteArticle;
	}

	componentWillMount(){
		this.axiosGetArticles()
		this.axiosGetDiseaseNames()
	}

	axiosGetArticles() {
		axios
			.get('/api/blog/article')
			.then(response =>
				this.setState({ articlesRes: response.data.data || [], articles: response.data.data || [] })
			)
	}

	axiosGetDiseaseNames() {
		axios
			.get('/api/disease-profiles-names')
			.then(response =>
				this.setState({ diseaseNames: response.data.data || [] })
			)
	}

	handleOpenBanner(id) {
		let article = _.find( this.state.articles, { id } )

		this.setState({ showArticle: true, articleShownData: article, showDeclineCommentPage: false })
	}

	handleSelectedFilter(event, index, selectedFilter) {
		let articles = this.state.articlesRes
		if(selectedFilter === 2){
			articles = _.filter( this.state.articlesRes, { approved: 2 })
		}else if(selectedFilter === 3 ){
			articles = _.filter( this.state.articlesRes, { approved: 1 })
		}

		this.setState({ selectedFilter, articles })
	}

	apprDeclArticle(article_id, approved) {
		axios
			.post('/api/blog/article/approve/update', { article_id, approved, decline_text: approved === 2 ? this.state.declineText || '' : '' })
			.then( () => {
				this.axiosGetArticles() 
				this.setState({ articleShownData: {}, showArticle: false, declineText: '' })
			})
	}

	deleteArticle(article_id) {

		axios
			.post('/api/admin/blog/delete', { article_id })
			.then( () => {
				this.axiosGetArticles() 
				this.setState({ articleShownData: {}, showArticle: false, declineText: '' })
			})
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col xl={6} style={{ marginTop: 15 }}>
						
						<SelectField
							floatingLabelText={ languageId === 0 ? 'Select filters' : 'Выбрать фильтры' }
							value={this.state.selectedFilter}
							onChange={ this.handleSelectedFilter }
						>
							<MenuItem 
								value={1} 
								primaryText={ languageId === 0 ? 'All articles' : 'Все статьи' } />							
							<MenuItem 
								value={2} 
								primaryText={ languageId === 0 ? 'Waiting' : 'Ожидающие' } />
							<MenuItem 
								value={3} 
								primaryText={ languageId === 0 ? 'Confirmed' : 'Подтвержденные' } />						
						</SelectField>	

						<Divider />		

						<List width={300} style={{ marginTop: 5 }}>
						{
							this.state.articles
							? 	this.state.articles.map( item =>
									<ListItem 
										primaryText={
											<p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: item.approved === 0  ? '#ffb150' : item.approved === 1 ? '#4cc708' : '#b50000' }}> 
												{item.title} { item.decline_text && <i className="fa fa-comment-o" aria-hidden="true" style={{ paddingLeft: 10 }}></i> }
											</p>											
										} 
										onClick={ () => this.handleOpenBanner(item.id) } />
								)
							: 	''
						}
						</List>

					</Col>
					<Col xl={6} style={{ marginTop: 15 }}>
						{
							!this.state.requestDone
							?	<div style={{ textAlign: 'center', marginTop: 30 }}>
									<CircularProgress
										color='#55c908'
										size={50}
										thickness={4} />
								</div>
							: 	<div>
								{
									this.state.showArticle
									?	!this.state.showDeclineCommentPage
										? 	<Row style={{ background: '#ececec', color: '#7f7f7f', paddingTop: 10, paddingBottom: 10 }}>
												<Col>
													<RaisedButton
														label={ languageId === 0 ? 'Delete' : 'Удалить' }
														backgroundColor='#ef4f10'
														style={{ float: 'right' }}
														labelStyle={{ color: '#fff' }}
														onClick={() =>this.deleteArticle(this.state.articleShownData.id)} />
													<h3>{ this.state.articleShownData.title }</h3>
												</Col>
												<Col>
													<h3>{ 
														_.find(this.state.diseaseNames ,this.state.articleShownData.treatment_name_id)
														?	languageId === 0 ? _.find(this.state.diseaseNames ,this.state.articleShownData.treatment_name_id).name : _.find(this.state.diseaseNames ,this.state.articleShownData.treatment_name_id).name_ru 
														: 	languageId === 0 ? 'No subject' : 'Без темы'  
													}</h3>
												</Col>
												{ 
													this.state.articleShownData.is_blog
												? 	<Col>
													{
														this.state.articleShownData.image ?
															this.state.articleShownData.image.map( image =>
																<img src={image} style={{ width: '100%' }}/>
															)
														: <p>{ languageId === 0 ? 'No foto' : 'Без фото' }</p>
													}
													</Col>
												: 	<Col>
													{
														this.state.articleShownData.video ?
															this.state.articleShownData.video.map( video =>
																<iframe width='100%' height='400' src={`https://www.youtube.com/embed/${video}`} frameBorder="0" allowFullScreen>
																</iframe>
															)
														: <p>{ languageId === 0 ? 'No video' : 'Без видео' }</p>
													}
													</Col>
												}
												<Col style={{ marginTop: 10 }}>
													<div dangerouslySetInnerHTML={{ __html: this.state.articleShownData.text.replace(/(?:\r\n|\r|\n)/g, '<br />') }} />
												</Col>
												<Col>
													<Divider />
												</Col>	
												<Col style={{ marginTop: 10, textAlign: 'right' }}>
													<RaisedButton
														label={ languageId === 0 ? 'Decline' : 'Отклонить' }
														onClick={ () => this.setState({ showDeclineCommentPage: true }) }
														style={{ marginRight: 20 }}/>													
													<RaisedButton
														label={ languageId === 0 ? 'Approve' : 'Подтвердить' }
														onClick={ () => this.apprDeclArticle(this.state.articleShownData.id, 1) }/>												
												</Col>
											</Row>
										: 	<Row>
												<Col>
													<h3>{ languageId === 0 ? 'Will you comment decline ? ' : 'Прокомментируете отмену ?' }</h3>
												</Col>
												<Col>
													<TextField
														id='decline'
														fullWidth
														multiLine
														rows={3}
														value={ this.state.declineText }
														onChange={ (e, value) => this.setState({ declineText : value }) }/>										
												</Col>
												{ 
													this.state.articleShownData.decline_text && this.state.articleShownData.decline_udpate_date &&
													<Col style={{ marginTop: 10, marginBottom : 10 }}>
														<h4>{ languageId === 0 ? 'Previous decline : ' : 'Предыдущая отмена ' }</h4>
														<p>{ 
															languageId === 0 ? 'Date: ' : 'Дата: ' +
															moment(this.state.articleShownData.decline_udpate_date).format('DD MMM YYYY') +
															' . '  + 
															this.state.articleShownData.decline_text 
														}</p>
													</Col>

												}
												<Col>
													<RaisedButton
														label={ languageId === 0 ? 'OK' : 'OK' }
														onClick={ () => this.apprDeclArticle(this.state.articleShownData.id, 2) } />												
												</Col>
											</Row>
									: ''
								}
								</div>
						}
					</Col>
				</Row>
			</div>
		)
	}

}