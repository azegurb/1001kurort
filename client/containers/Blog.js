import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import { Link } from 'react-router-dom'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import Open from 'material-ui/svg-icons/content/add-circle-outline'
import Close from 'material-ui/svg-icons/content/remove-circle-outline'
import _ from 'lodash'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import moment from 'moment'

import axios from 'axios'

const initialState = {
	all_articles: [],
	top_bloggers: [],
	random_bloggers: [],
	latest_blog: {},
	latest_vlog: {},
	popular_blog: {},
	filterProfiles: []
}


class Blog extends Component { 
	  
    static fetchData({ store, params }) {
        return Promise.all([
            store.dispatch(actions.getBlogsPage()), 
            store.dispatch(actions.getDiseasesProfiles()), 
        ])
    }	
    
	constructor(props) {
		super(props);

		this.state = initialState
	}

	componentWillMount(){
		this.props.pageActions.updateIsLoadingPage(true);
	}

	componentDidMount(){
		Promise.all([
			this.props.async.getBlogsPage(),
		]).then( () => {
			this.props.pageActions.updateIsLoadingPage(false)
		})
		
		this.props.pageActions.setNavigationPathNames([{ label: ['Blog', 'Блог'], link: '/blog'}])
	}

	filterArticles(id){
		let {filterProfiles } = this.state;
		let index = filterProfiles.indexOf(id)

		if(index === -1){
			filterProfiles.push(id)
		}
		else{
			filterProfiles.splice(index,1)
		}
		this.setState({filterProfiles})
	}

	render() {
		const languageId = this.props.profile.languageId - 0;
        const url = process.env.API_URL + this.props.location.pathname
		const {
			all_articles, 
			random_bloggers, 
			top_bloggers, 
			latest_blog, 
			latest_vlog, 
			popular_blog,
			diseasesProfiles
		} = this.props.asyncData;

		let articles;

		if(this.state.filterProfiles.length){
			articles = _.filter(all_articles, item => this.state.filterProfiles.indexOf( item.subject) > -1 ? true : false);
		}
		else {
			articles = all_articles;
		}
		console.log(all_articles)

		return(	
			<div>

				<Row className='center'>
					<Col xs={12} md={6} lg={4} xl={4}>
						<div style={{ height: 300, position: 'relative' }}>
						{
							!_.isEmpty(latest_blog)
							?	<div style={{ height: '100%' }}>
									<h3 style={{ color: '#057bb2' }}>{ languageId === 0 ? 'Latest post' : 'Последний пост' }</h3>
									<Divider />
									<div style={{ marginTop: 15, position: 'relative', width: '100%', height: 130 }}>
										<Link to={{ pathname: `/blog/${latest_blog.author_id}/${latest_blog.id}`, query: { autoLoad: true } }}>
											<img 
												src={ latest_blog.image} 
												style={{ width: 200, maxHeight: 130, borderRadius: 4 }} />
										</Link>
									</div>
									<p title={ latest_blog.title.slice(0, 100) + '...' } style={{ fontSize: 20 }}>
										{ latest_blog.title && latest_blog.title.length > 100 ? latest_blog.title.slice(0, 100)+ '...' : latest_blog.title }
									</p>
									<Link to={`/blog/${latest_blog.author_id}/${latest_blog.id}`}>
										{languageId === 0 ? 'Read more' : 'Читать далее'}
									</Link>
								</div>
							: 	<div style={{ height: '100%' }}>
									<h3>{ languageId === 0 ? 'Latest post' : 'Последний пост' }</h3>
									<Divider />
									<p style={{ paddingTop: 80, fontSize: 20 }}>{ languageId === 0 ? 'Empty' : 'Пустой' }</p>
								</div>
						}
						</div>
					</Col>
					<Col xs={12} md={6} lg={4} xl={4}>
						<div style={{ height: 300, position: 'relative' }}>
						{
							!_.isEmpty(latest_vlog)
							?	<div style={{ height: '100%' }}>
									<h3 style={{ color: '#057bb2' }}>{ languageId === 0 ? 'Latest vlog' : 'Последний влог' }</h3>
									<Divider />
									<div style={{ position: 'relative', width: 200, height: 130, margin: '15px auto' }}>
										<Link to={{ pathname: `/blog/${latest_vlog.author_id}/${latest_vlog.id}`, query: { autoLoad: true } }}>
										<div style={{ position: 'absolute', width: 200, height: 130, background: '#ffffff00', cursor: 'pointer' }} />
										  <iframe width='200' height='130' src={`https://www.youtube.com/embed/${latest_vlog.video[0]}`} frameBorder="0" allowFullScreen>
										</iframe>
										</Link>
									</div>
									<p title={ latest_vlog.title.slice(0, 100) + '...' } style={{ fontSize: 20 }}>
										{ latest_vlog.title && latest_vlog.title.length > 100 ? latest_vlog.title.slice(0, 100)+ '...' : latest_vlog.title }
									</p>
									<Link to={`/blog/${latest_vlog.author_id}/${latest_vlog.id}`}>
										{languageId === 0 ? 'Read more' : 'Читать далее'}
									</Link>
								</div>
							: 	<div style={{ height: '100%' }}>
									<h3 >{ languageId === 0 ? 'Latest vlog' : 'Последний влог' }</h3>
									<Divider />
									<p style={{ paddingTop: 80, fontSize: 20 }}>{ languageId === 0 ? 'Empty' : 'Пустой' }</p>
								</div>
						}
						</div>
					</Col>
					<Col xs={12} md={6} lg={4} xl={4}>
						<div style={{ height: 300, position: 'relative' }}>
						{
							!_.isEmpty(popular_blog)
							?	<div style={{ height: '100%' }}>
									<h3 style={{ color: '#057bb2' }}>{ languageId === 0 ? 'Popular post' : 'Популярный пост' }</h3>
									<Divider />
									<div style={{ marginTop: 15, position: 'relative', width: '100%', height: 130 }}>
										<Link to={{ pathname: `/blog/${popular_blog.author_id}/${popular_blog.id}`, query: { autoLoad: true } }}>
										<img 
											src={ popular_blog.image} 
											style={{ width: 200, maxHeight: 130, borderRadius: 4 }} />
										</Link>
									</div>
									<p title={ popular_blog.title.slice(0, 100) + '...' } style={{ fontSize: 20 }}>
										{ popular_blog.title && popular_blog.title.length > 100 ? popular_blog.title.slice(0, 100)+ '...' : popular_blog.title }
									</p>
									<Link to={`/blog/${popular_blog.author_id}/${popular_blog.id}`}>
										{languageId === 0 ? 'Read more' : 'Читать далее'}
									</Link>
								</div>
							: 	<div style={{ height: '100%' }}>
									<h3>{ languageId === 0 ? 'Popular post' : 'Популярный пост' }</h3>
									<Divider />
									<p style={{ paddingTop: 80, fontSize: 20 }}>{ languageId === 0 ? 'Empty' : 'Пустой' }</p>
								</div>
						}
						</div>
					</Col>
				</Row>
				<Row>
					<Hidden xs sm>
						<Col sm={12} sm={12} md={4} xl={4}>
							<div style={{ margin: 10, marginTop: 80, padding: 10, backgroundColor: '#fff', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
								<h4>{ languageId === 0 ? 'Filter' : 'Фильтровать'}</h4>
								<Divider style={{ marginBottom: 10 }}/>
								<Row>
									{diseasesProfiles.map( item => 
										<Col xs={6} sm={6} md={12} xl={12}>
											<Checkbox
											label={ languageId === 0 ? item.name : item.name_ru }
											checked={this.state.filterProfiles.indexOf(item.id) !== -1 ? true : false}
											onCheck={ (e, checked) => this.filterArticles(item.id) }/>
										</Col>
									)}
								</Row>
							</div>
							{
								top_bloggers.length
								? 	<Row>
										<Col>
											<h2 style={{ textAlign: 'center' }}>{ languageId === 0 ? 'Top bloggers' : 'Топ блоггеры' }</h2>
											<Divider />
										</Col>
										<Col>
										{	top_bloggers.map( blogger =>
												<ListItem 
													containerElement={ 
														<Link to={`/blog/${blogger.author_id}`} /> 
													}
													leftAvatar={ <img src={blogger.avatar} className='avatar-sm' onError={ (e) => (e.currentTarget).src = '/images/doctor_default.png' }/> }
													primaryText={ (blogger.last_name || '') + ' ' + (blogger.first_name || '') }
													secondaryText={ languageId === 0 ? `Posts: ${blogger.count}` : `Постов: ${blogger.count}` } /> 
											)
										}
										</Col>
									</Row>
								: 	<p>{ languageId === 0 ? 'No blogers' : 'Отсутствуют блоггеры' }</p>
							}
						</Col>
					</Hidden>
					<Col sm={12} md={12} lg={8} xl={8}>
						<Col style={{ marginBottom: 10 }}>
							<h2 style={{ textAlign: 'center', color: '#55c901' }}>{ languageId === 0 ? 'All articles' : 'Все статьи' }</h2>
							<Divider />
						</Col>						
						{
							articles.length
							? 	articles.map( article =>
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
							: 	<p className='center' style={{ marginTop: 10 }}>{ languageId === 0 ? 'Nothing found' : 'Ничего не найдено' }</p>
						}
					</Col>
				</Row>
				<Row style={{ marginBottom: 40 }}>
					<Col style={{ marginBottom: 5 }}>
						<h3 className='center'>{ languageId === 0 ? 'Random bloggers' : 'Случайные блоггеры' }</h3>
						<Divider />
					</Col>
					{
						random_bloggers.length
						?	random_bloggers.map( blogger =>
								<Col xs={6} md={4} xl={3}>
									<ListItem 
										containerElement={ <Link to={`/blog/${blogger.author_id}`} /> }
										leftAvatar={ <img src={blogger.avatar} className='avatar-sm' onError={ (e) => (e.currentTarget).src = '/images/doctor_default.png' }/> }
										primaryText={ (blogger.last_name || '') + ' ' + (blogger.first_name || '') } /> 
								</Col>
							)
						: 	<p className='center'>{ languageId === 0 ? 'Empty list' : 'Пустой список' }</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(Blog);