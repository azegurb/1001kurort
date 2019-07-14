import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import { Link } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import Open from 'material-ui/svg-icons/content/add-circle-outline'
import Close from 'material-ui/svg-icons/content/remove-circle-outline'
import _ from 'lodash'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import moment from 'moment'
import axios from 'axios'

import PrivateMessageForm from '../components/PrivateMessageForm'

const initialState = {
	bloggerInfo: {},
	bloggerArticles: [],
	openPost: false,
	showBlogs: true,
	showVlogs: true,
	openMessageForm: false,
}


class BloggerPage extends Component { 
	  
    static fetchData({ store, params }) {
        return Promise.all([
            store.dispatch(actions.getBloggerPage(params.id)), 
        ])
    }

	constructor(props) {
		super(props);

		this.state = initialState
		
		this.updateSearchResult = ::this.updateSearchResult;
	}

	componentWillMount(){
		const {bloggerInfo} = this.props.asyncData;
		
		this.props.pageActions.updateIsLoadingPage(true);
		this.props.pageActions.setNavigationPathNames([
			{ label: ['Blog', 'Блог'], link: '/blog' },
			{ label: [ (bloggerInfo.last_name || '') + ' ' + (bloggerInfo.first_name || ''), (bloggerInfo.last_name || '') + ' ' + (bloggerInfo.first_name || '') ], link: `/blog/${this.props.match.params.id}` }
		])
	}

	componentDidMount(){
        Promise.all([
            this.props.async.getBloggerPage(parseInt(this.props.match.params.id))
        ]).then( () => {
            this.props.pageActions.updateIsLoadingPage(false)
        })
	}

	componentWillReceiveProps(nextProps){
	  const {bloggerInfo} = nextProps.asyncData;
	  
	  if(!_.isEqual(bloggerInfo, this.props.asyncData.bloggerInfo)){
		this.props.pageActions.setNavigationPathNames([
			{ label: ['Blog', 'Блог'], link: '/blog' },
			{ label: [ (bloggerInfo.last_name || '') + ' ' + (bloggerInfo.first_name || ''), (bloggerInfo.last_name || '') + ' ' + (bloggerInfo.first_name || '') ], link: `/blog/${nextProps.match.params.id}` }
		])
	  }
	}

	updateSearchResult() {
		if(this.state.showBlogs && this.state.showVlogs){
			this.setState({ articles: this.state.articlesData })
		}else if(this.state.showBlogs && !this.state.showVlogs){
			this.setState({ articles: _.filter(this.state.articlesData, { is_blog: true }) })			
		}else if(!this.state.showBlogs && this.state.showVlogs){
			this.setState({ articles: _.filter(this.state.articlesData, { is_blog: false }) })
		}else this.setState({ articles: [] })
	}

	render() {
		const languageId = this.props.profile.languageId - 0;
        const url = process.env.API_URL + this.props.location.pathname
		const {bloggerArticles, bloggerInfo} = this.props.asyncData;

		let articlesShown; 

		if(this.state.showBlogs && this.state.showVlogs){
			articlesShown = bloggerArticles
		}else if(this.state.showBlogs && !this.state.showVlogs){
			articlesShown = _.filter(bloggerArticles, { is_blog: true })		
		}else if(!this.state.showBlogs && this.state.showVlogs){
			articlesShown = _.filter(bloggerArticles, { is_blog: false })
		}else articlesShown = []
		
		return(	
			<div>
				<PrivateMessageForm
					open={ this.state.openMessageForm }
					senderId={ this.props.profile ? this.props.profile.user.users_id : null }
					getterId={ parseInt(this.props.match.params.id) }
					languageId={languageId} 
					resetOpen={() => this.setState({ openMessageForm : false })}/>

				<Row>
					<Col sm={12} md={4} xl={3} className='center'>
						<div style={{ margin: 10, marginTop: 25, padding: 10, backgroundColor: '#fff', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
							<div style={{ height: 180, width: 190, position: 'relative', margin: 'auto' }}>
								<img 
									src={bloggerInfo.avatar} 
									style={{ width: 170, height: 170 }}
									className='avatar-sm' 
									onError={ (e) => (e.currentTarget).src = '/images/doctor_default.png' }/>
							</div>					
							<h3 style={{ color: '#4cc708' }}>{( bloggerInfo.last_name || '') + ' ' + (bloggerInfo.first_name || '')}</h3>
							<p>{ languageId === 0 ? `Speciality: ${bloggerInfo.speciality && bloggerInfo.speciality[languageId]}` : `Специальность: ${bloggerInfo.speciality && bloggerInfo.speciality[languageId]}` }</p>
							<p>{ languageId === 0 ? `Total posts: ${bloggerInfo.total_articles || 0 }` : `Всего постов: ${bloggerInfo.total_articles || 0}` }</p>
							<p>{ languageId === 0 ? `Rating: ${bloggerInfo.rating || 0 }` : `Рейтинг: ${bloggerInfo.rating || 0}` }</p>
							<RaisedButton
								label={ languageId === 0 ? 'Send mail' : 'Отправить сообщение' }
								backgroundColor='#55c901'
								labelStyle={{ color: '#fff' }} 
								onClick={ () => this.setState({ openMessageForm: true }) }/>
						</div>
						<div style={{ margin: 10, marginTop: 25, padding: 10, backgroundColor: '#fff', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
							<h4>{ languageId === 0 ? 'Filter' : 'Фильтровать'}</h4>
							<Divider style={{ marginBottom: 10 }}/>
							<Row>
								<Col xs={6} sm={6} md={12} xl={12}>
									<Checkbox
									label={ languageId === 0 ? 'Blogs' : 'Блоги' }
									checked={this.state.showBlogs}
									onCheck={ (e, checked) => this.setState({ showBlogs: checked }, () => this.updateSearchResult() ) }/>
								</Col>
								<Col xs={6} sm={6} md={12} xl={12}>
									<Checkbox
										label={ languageId === 0 ? 'Vlogs' : 'Влоги' }
										checked={this.state.showVlogs}
										onCheck={ (e, checked) => this.setState({ showVlogs: checked }, () => this.updateSearchResult() ) }/>
								</Col>
							</Row>
						</div>
					</Col>
					<Col xs={12} md={8} xl={9} style={{ marginTop: 10 }}>
						<div style={{ margin: 10 }}>
							<h3 style={{ color: '#4cc708' }}>{ 
								languageId === 0 
								? `Publication of a blogger. Total - ${bloggerInfo.total_articles}` 
								: `Публикации блоггера. Всего -  ${bloggerInfo.total_articles}`
							}</h3>
							<Divider />
							{
								articlesShown.length ?

								articlesShown.map( article =>
									<Col style={{ margin: '10px 0px', padding: '10px 0px 10px', background: '#fff', borderRadius: 5, boxShadow: 'rgba(0, 0, 0, 0.07) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
										<Col sm={12} md={12} xl={4} className='center'>
											<Link to={{ pathname: `/blog/${article.author_id}/${article.id}`, query: { autoLoad: true } }}>{
												article.is_blog
												?	<div style={{ position: 'relative', width: 200, height: 150, cursor: 'pointer', textAlign: 'center', display: 'table-cell', verticalAlign: 'middle' }}>
														<img 
															src={ article.image && article.image[0] } 
															style={{ width: 200, borderRadius: 4 }} />
													</div>
												: 	<div style={{ position: 'relative' }}>
														<div style={{ position: 'absolute', width: '100%', height: 150, background: '#ffffff00', cursor: 'pointer' }} />
														<iframe width='100%' height='150' src={`https://www.youtube.com/embed/${article.video}`} frameBorder="0" allowFullScreen>
														</iframe>
													</div>
											}</Link>
										</Col>
										<Col sm={12} md={12} xl={8}>
											<p style={{ fontSize: 14 }}>{
												( languageId === 0 ? 'Published :' : 'Опубликовано : ' ) +
												moment(article.created).format('DD MMM, YYYY') 
											}</p>
											<h5 style={{ fontWeight: 600, fontSize: 18 }}>{ article.title }</h5>
											<p >{ article.text && article.text.length > 250 ? article.text.slice(0, 250)+ '...' : article.text }</p>
											<div style={{ width: '100%', height: 30 }}>
												<Link to={`/blog/${article.author_id}/${article.id}`}>
													<p style={{ textDecoration: 'underline', color: '#0093c0', cursor: 'pointer', float: 'right' }}>
														{ languageId === 0 ? 'More' : 'Перейти' }
													</p>
												</Link>
											</div>
										</Col>
									</Col>
								)

								: 	<h3>{ languageId === 0 ? 'Nothing found, try changing filters' : 'Ничего не найдено, попробуйте изменить фильтры' }</h3>
							}
						</div>
					</Col>
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

export default connect(mapStateToProps, mapDispatchToProps)(BloggerPage);