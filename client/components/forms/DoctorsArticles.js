import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
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

import TextFieldEditor from '../TextFieldEditor'

const regExpYouTube = /[\s\.\?\/\:]+/

const initialState = {	
	requestDone: true,
	creatingArticle: false,
	isBlog: true,
	subject: 0,
	id: null,
	newTitle: '',
	newDescription: 'Example...',
	uploadedImage: '',
}

const cancelCreating = {
	creatingArticle: false,
	isBlog: true,
	subject: 0,
	newTitle: '',
	newDescription: 'Example...',
	tempUploadedName: '',
	uploadedImage: '',
}
export default class DoctorsArticles extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ articles: [], diseaseNames: [] }, initialState)

	    this.axiosGetSingleAuthorArticles = ::this.axiosGetSingleAuthorArticles;
	    this.axiosGetDiseaseNames = ::this.axiosGetDiseaseNames;
	    this.uploadImageToSite = ::this.uploadImageToSite;
	    this.createArticle = ::this.createArticle;
	    this.updateArticle = ::this.updateArticle;
	    this.handleOpenBanner = ::this.handleOpenBanner;
	    this.handleIsBlog = ::this.handleIsBlog;
	    this.handleSubject = ::this.handleSubject;
	}

	componentWillMount(){
		this.axiosGetSingleAuthorArticles()
		this.axiosGetDiseaseNames()
	}

	axiosGetSingleAuthorArticles() {
		axios
			.get('/api/blog/article', { 
				params: {
					author_id: this.props.data.users_id }
			})
			.then(response =>
				this.setState({ articles: response.data.data || [] })
			)
	}

	axiosGetDiseaseNames() {
		axios
			.get('/api/disease-profiles-names')
			.then(response =>
				this.setState({ diseaseNames: response.data.data || [] })
			)
	}

	uploadImageToSite(e) {
		let reader = new FileReader();
		let file = e.target.files[0];

		if (!file) return;

		reader.onload = function(img) {
			const data = new FormData();
			let uploadedImage = img.target.result.replace(/^[^,]*,/,'')

			this.setState({ uploadedImage, tempUploadedName: file.name })

		}.bind(this);
		reader.readAsDataURL(file);
	}

	createArticle() {
		const text_html = this.state.newDescription
		const text = this.state.newDescription.replace(/(<([^>]+)>)/ig, ' ')

		this.setState({ requestDone: false })
		if(this.state.isBlog){
			axios
				.post('https://api.imgur.com/3/image', {
					image : this.state.uploadedImage,
					type: 'base64'
				},{
						headers: { 
							Authorization: 'Client-ID 742e78dbe8f441f',
							Accept: 'application/json'
						}
				})
				.then( response => {

					axios
						.post('/api/blog/article/create',{
							is_blog: true,
							author_id: this.props.data.users_id,
							title: this.state.newTitle,
							text_html: text_html,
							text: text,
							image: [response.data.data.link],
							subject: this.state.subject,
						})
						.then( () => {
							this.axiosGetSingleAuthorArticles()
							this.setState(Object.assign(initialState, { requestDone: true }))
						})
				})
		}else{
			axios
				.post('/api/blog/article/create',{
					is_blog: false,
					author_id: this.props.data.users_id,
					title: this.state.newTitle,
					text_html: text_html,
					text: text,
					video: [this.state.newVlogLink],
					subject: this.state.subject,
				})
				.then( () => {
					this.axiosGetSingleAuthorArticles()
					this.setState(Object.assign(initialState, { requestDone: true }))
				})			
		}
	}

	updateArticle() {
		const text_html = this.state.newDescription
		const text = this.state.newDescription.replace(/(<([^>]+)>)/ig, ' ')
		
		if(this.state.uploadedImage && this.state.isBlog){
			
			axios
				.post('https://api.imgur.com/3/image', {
					image : this.state.uploadedImage,
					type: 'base64'
				},{
						headers: { 
							Authorization: 'Client-ID 742e78dbe8f441f',
							Accept: 'application/json'
						}
				})
				.then( response => {

					axios
						.post('/api/blog/article/update',{
							article_id: this.state.id,
							is_blog: this.state.isBlog,
							author_id: this.props.data.users_id,
							title: this.state.newTitle,
							text_html: text_html,							
							text: text,
							video: [],
							image: [response.data.data.link],
							subject: this.state.subject,
						})
						.then( () => {
							this.axiosGetSingleAuthorArticles()
							this.setState(Object.assign(initialState, { requestDone: true }))
						})
				})

		}else{
			axios
				.post('/api/blog/article/update',{
					article_id: this.state.id,
					is_blog: this.state.isBlog,
					author_id: this.props.data.users_id,
					title: this.state.newTitle,
					text_html: text_html,
					text: text,
					video: this.state.isBlog ? [] : [this.state.newVlogLink],
					image: this.state.isBlog ? [this.state.uploadedImage || this.state.image_url] : [],
					subject: this.state.subject,
				})
				.then( () => {
					this.axiosGetSingleAuthorArticles()
					this.setState(Object.assign(initialState, { requestDone: true }))
				})
		}	
	}

	handleOpenBanner(id) {
		let article = _.find( this.state.articles, { id } )

		this.setState({ 
			creatingArticle: true,
			id: article.id,
			isBlog: article.is_blog,
			subject: article.subject,
			newTitle: article.title,
			newDescription: article.text_html ? article.text_html : article.text,
			image_url: article.is_blog ? article.image[0] : '',
			newVlogLink: !article.is_blog ? article.video[0] : '',
			textDecline: article.decline_text,
			textDeclineDate: article.decline_udpate_date,
		})
	}

	handleIsBlog(event, index, isBlog) {
		this.setState({ isBlog })
	}

	handleSubject(event, index, subject) {
		this.setState({ subject })
	}
	
	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)
		return(	
			<div>
				{
					!this.state.requestDone
				?	<div style={{ textAlign: 'center', marginTop: 30 }}>
						<CircularProgress
							color='#55c908'
							size={50}
							thickness={4} />
					</div>
				: 	<Row style={{ marginTop: 15 }}>
					{ 	!this.state.creatingArticle
						?	<Col sm={12} md={9} xl={6}>
								<ListItem
									primaryText={ languageId === 0 ? 'Add atricle' : 'Новая статья' }
									onClick={ () => this.setState({ creatingArticle: true }) } />
								<Divider />								
								<List width={300} style={{ marginTop: 5 }}>
								{
									this.state.articles.length
									? 	this.state.articles.map( item =>
											<ListItem 
												primaryText={ 
													<p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 20, color: item.approved === 0  ? '#ffb150' : item.approved === 1 ? '#4cc708' : '#b50000' }}> 
														{item.title} { item.decline_text && <i className="fa fa-comment-o" aria-hidden="true" style={{ paddingLeft: 10 }}></i> }
													</p>
												} 
												onClick={ () => this.handleOpenBanner(item.id) } />
										)
									: <p>{ languageId === 0 ? 'You don`t have any articles' : 'У вас нету статей' }</p>
								}
								</List>						
							</Col>
						: 	<Col xs={12}>
								<Row>
									<Col>
									{
										this.state.textDecline && this.state.textDeclineDate 
										? 	<div style={{ background: '#efd5d5', borderRadius: 6, color: '#515151', padding: 10 }}>
												<i className="fa fa-comment-o fa-3x" aria-hidden="true" style={{ float: 'left', display: 'block', padding: 10 }}></i>
												<h4>{ (languageId === 0 ? 'Updated: ' : 'Обновлено: ') + moment(this.state.textDeclineDate).format('DD MMM YYYY')}</h4>
												<p style={{ fontSize: 17 }}>{ (languageId === 0 ? 'Reason: ' : 'Причина: ') + this.state.textDecline}</p>
											</div>
										: 	''
									}
									</Col>
									<Col>
										<TextField
											fullWidth
											floatingLabelText={ languageId === 0 ? 'Title' : 'Название' }
											value={ this.state.newTitle }
											onChange={ (e, value) => this.setState({ newTitle : value }) }/>
									</Col>
								</Row>
								<Row>
									<Col>
										<TextFieldEditor
											value={this.state.newDescription}
											onChange={(newDescription) => this.setState({newDescription})}/>
									</Col>
								</Row>
								<Row>
									<Col sm={12} md={6} xl={6}>
										<SelectField
											floatingLabelText={ languageId === 0 ? 'Type' : 'Тип' }
											value={this.state.isBlog}
											onChange={this.handleIsBlog}
										>
											<MenuItem value={true} primaryText={ languageId === 0 ? 'Blog' : 'Блог' } />
											<MenuItem value={false} primaryText={ languageId === 0 ? 'Vlog' : 'Влог' } />
										</SelectField>
        							</Col>
									<Col sm={12} md={6} xl={6}>
										{
											this.state.isBlog 
										?	<div>
												<label htmlFor='file' style={{ marginTop: 40 }}>{ 
													this.state.tempUploadedName
													? this.state.tempUploadedName
													: this.state.image_url
													? this.state.image_url
													: languageId === 0 ? 'Upload image' : 'Загрузить изображение' 
												}</label>
												<input
													required
													id='file' 
													type='file' 
													style={{ marginTop: 25, opacity: 0, position: 'absolute' }}
													onChange={ ::this.uploadImageToSite } 
													placeholder={ languageId === 0 ? 'Upload image' : 'Загрузить изображение' } />											
											</div>
										: 	<div>
												<TextField
													fullWidth
													errorText={ this.state.errorVlogLink && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
													floatingLabelText={ languageId === 0 ? 'ID video YouTube' : 'ID видео YouTube' }
													value={ this.state.newVlogLink }
													onChange={ (e, value) => this.setState({ newVlogLink : value, errorVlogLink: regExpYouTube.test(value) ? true : false }) }/>										
											</div>
										}
									</Col>
								</Row>
								<Row>
									<Col>
										<SelectField
											floatingLabelText={ languageId === 0 ? 'Subject' : 'Тема' }
											value={this.state.subject}
											onChange={this.handleSubject}
										>
										{
											this.state.diseaseNames.map( item =>
												<MenuItem value={item.id} primaryText={ languageId === 0 ? item.name : item.name_ru } />
											)
										}
												<MenuItem value={0} primaryText={ languageId === 0 ? 'No subject' : 'Без темы' } />
										</SelectField>
									</Col>
								</Row>
								<Row style={{ marginTop: 20 }}>
									<Col xs={6}>
										<RaisedButton 
											label={ languageId === 0 ? 'Back' : 'Назад' }
											onClick={ () => this.setState(cancelCreating) }/>
									</Col>
									<Col xs={6} style={{ textAlign: 'right' }}>
										<RaisedButton
											disabled={
												!( this.state.isBlog ? this.state.image_url || this.state.uploadedImage : this.state.newVlogLink && !this.state.errorVlogLink ) ||
												!this.state.newTitle ||
												!this.state.newDescription
											} 
											label={ languageId === 0 ? 'Send' : 'Отправить' }
											onClick={ this.state.id ? ( () => this.updateArticle() ) : ( () => this.createArticle() ) }/>								
									</Col>
								</Row>
							</Col>
					}
					</Row>
				}
			</div>
		)
	}

}