import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
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
import {FacebookShareButton, FacebookIcon} from 'react-share';
import IconButton from 'material-ui/IconButton';

import axios from 'axios'

const initialState = {
	blogPostComments: [],
	blogPostData: {},
	commentText: '',	
}


class BloggerPostPage extends Component { 
	  
    static fetchData({ store, params }) {
        return Promise.all([
            store.dispatch(actions.getBlogPostData(params.bloggerId, params.articleId)), 
            store.dispatch(actions.getBlogPostComments(params.articleId)), 
        ])
    }	

	constructor(props) {
		super(props);

		this.state = initialState

		this.postComment 	  = ::this.postComment;
		this.axiosGetComments = ::this.axiosGetComments;

	}

	componentWillMount(){
		const {blogPostData} = this.props.asyncData;
		
		this.props.pageActions.updateIsLoadingPage(true);
		this.props.pageActions.setNavigationPathNames([
			{ label: ['Blog', 'Блог'], link: '/blog' },
			{ label: [ (blogPostData.last_name || '') + ' ' + (blogPostData.first_name || ''), (blogPostData.last_name || '') + ' ' + (blogPostData.first_name || '') ], link: `/blog/${this.props.match.params.bloggerId}` },
			{ label: [ blogPostData.title || '', blogPostData.title || ''], link: `/blog/${this.props.match.params.bloggerId}/${this.props.match.params.articleId}` }
		])
	}

	componentDidMount(){
        Promise.all([
        	this.props.async.getBlogPostData(this.props.match.params.bloggerId, this.props.match.params.articleId),
			this.props.async.getBlogPostComments(this.props.match.params.articleId)
		]).then( () => {
            this.props.pageActions.updateIsLoadingPage(false)
        })				
	}

	componentWillReceiveProps(nextProps){
	  const {blogPostData} = nextProps.asyncData;

	  if(!_.isEqual(blogPostData, this.props.asyncData.blogPostData)){
		this.props.pageActions.setNavigationPathNames([
			{ label: ['Blog', 'Блог'], link: '/blog' },
			{ label: [ (blogPostData.last_name || '') + ' ' + (blogPostData.first_name || ''), (blogPostData.last_name || '') + ' ' + (blogPostData.first_name || '') ], link: `/blog/${nextProps.match.params.bloggerId}` },
			{ label: [ blogPostData.title || '', blogPostData.title || ''], link: `/blog/${nextProps.match.params.bloggerId}/${nextProps.match.params.articleId}` }
		])
	  }
	}

	axiosGetComments() {
		this.props.async.getBlogPostComments(this.props.match.params.articleId);
	}

	postComment() {

		this.setState({ availablePostComment : false })
		
		if(this.state.commentText.length){
			axios.post('/api/blogger/article/comments/add',{
				article_id: this.props.match.params.articleId,
				author_id: this.props.profile.user.id,
				text: this.state.commentText,
			}).then( () => this.setState({ commentText: '', availablePostComment: true }, () => this.axiosGetComments() ) )
		}
	}

	render() {
		const languageId = this.props.languageId - 0;
		const articleId = this.props.match.params.articleId;
		const bloggerId = this.props.match.params.bloggerId;
        const url = `https://1001kurort.com${this.props.location.pathname}`
		const {blogPostData, blogPostComments} = this.props.asyncData;
		console.log(blogPostData)

		return(	
			<div>

				<Row style={{ margin: 15, marginTop: 25, background: '#fff', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px' }}>
					<Col style={{ marginTop: 10 }}>
						<FlatButton
							fullWidth
							containerElement={ <Link to={`/blog/${bloggerId}`}/>}
							icon= {<i className="fa fa-arrow-circle-left" aria-hidden="true"></i>}
							label={ languageId === 0 ? ' Back' : ' Назад' } />
						<Divider style={{ marginTop: 10, marginBottom: 10 }}/>
					</Col>	
					{
						blogPostData.is_blog
						? 	<Col>
								<div style={{ width: '100%', display: 'block', float: 'left' }}>
									<div className='center'>
										<img 
											src={ blogPostData.image && blogPostData.image[0] } 
											style={{ width: 300, maxWidth: '100%', marginBottom: 10 }} />
									</div>
								</div>

								<div style={{ display: 'inline-block', paddingLeft: 10 }}>
									<p style={{ fontSize: 15 }}>{ moment(blogPostData.created).format('DD MMM, YYYY') }</p>
									<h5 style={{ fontWeight: 600, fontSize: 25 }}>{ blogPostData.title }</h5>
									<div style={{ fontSize: 18 }} dangerouslySetInnerHTML={{ __html: blogPostData.text_html || blogPostData.text }} />
								</div>
							</Col>
						: 	<Col>
								<iframe
									width='100%' 
									height='600' 
									src={`https://www.youtube.com/embed/${blogPostData.video}?autoplay=${this.props.location.query && this.props.location.query.autoLoad ? 1 : 0 }`} 
									frameBorder='0'
									allowFullScreen>
								</iframe>

								<h5 style={{ fontWeight: 600, fontSize: 25 }}>{ blogPostData.title }</h5>
								<p style={{ fontSize: 18 }}>{ moment(blogPostData.created).format('DD MMM, YYYY') }</p>
								<div style={{ fontSize: 18 }} dangerouslySetInnerHTML={{ __html: blogPostData.text_html || blogPostData.text }} />
							</Col>
					}
					<Col>
						<h4>{languageId === 0 ? 'Sharing social' : 'Поделиться соцсети'}</h4>
						<FacebookShareButton url={url} style={{ margin: 10 }}>
							<IconButton><FacebookIcon size={42} round /></IconButton>
						</FacebookShareButton>
					</Col>
					<Col style={{ marginTop: 20, marginBottom: 20, textAlign: 'center' }}>
						<h4>{ languageId === 0 ? 'Comments' : 'Комментарии' }</h4>
						<Divider style={{ marginTop: 10, marginBottom: 10 }}/>
						<Row>
							{
								blogPostComments.length
								? blogPostComments.map( comment =>
										<Col style={{ textAlign: 'left' }}>
											<img src={ comment.avatar || '/images/sputnik.png' } className='avatar-sm' style={{ marginLeft: 15 }}/>
											<p style={{ paddingLeft: 70 }}>
												<b style={{ textDecoration: 'underline', color: '#423f3f' }}>{ 
													comment.first_name || comment.last_name ? `${comment.first_name} ${comment.last_name}` : (languageId === 0 ? 'No name ' : 'Без имени ') 
												}</b>
												<small style={{ paddingLeft: 5 }}>{ moment(comment.date).format('DD MMM, YYYY') }</small>
											</p>
											<p style={{ paddingLeft: 70 }}>{comment.text}</p>
										</Col>
									)
								: 	<Col>
										<p>{ languageId === 0 ? 'This article has not yet been commented on' : 'Эта статья еще не комментировалась' }</p>
									</Col>
							}
						</Row>
						{
							!_.isEmpty(this.props.profile.user)
							?	<div style={{ position: 'relative', background: '#efefef', paddingBottom: 15, borderRadius: 5 }}>
									<img 
										src={ this.props.profile.user.logo || this.props.profile.user.avatar } 
										className='avatar-sm' 
										onError={ (e) => (e.currentTarget).src = '/images/doctor_default.png' }
										style={{ marginTop: 10 }} />
									<TextField
										multiLine
										rows={2}
										style={{ width: '80%' }}
										hintText={ languageId === 0 ? 'Your comment' : 'Ваш комментарий' }
										inputStyle={{ paddingLeft: 40 }}
										hintStyle={{ paddingLeft: 50 }}
										value={this.state.commentText}
										onChange={ (e, value) => this.setState({ commentText: value }) }/>

									<i 	className="fa fa-chevron-circle-right fa-2x" 
										aria-hidden="true" 
										style={{ marginTop: 5, marginLeft: 10, cursor: 'pointer' }}
										onClick={this.postComment} />
								</div>
							: 	<div>
									<Link to='/auth/user'>{ languageId === 0 ? 'You should authorise to comment this post' : 'Вам нужно авторизоваться, чтобы комментировать' }</Link>
								</div>
						}
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

export default connect(mapStateToProps, mapDispatchToProps)(BloggerPostPage);