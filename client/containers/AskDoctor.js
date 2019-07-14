import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Hidden, Visible } from 'react-grid-system'
import {List, ListItem} from 'material-ui/List'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import axios from 'axios'
import _ from  'lodash'

import AskDoctorFillForm from '../components/AskDoctorFillForm'
import AskDoctorFaq from '../components/AskDoctorFaq'
import AskDoctorLastQuestions from '../components/AskDoctorLastQuestions'

const specialities = require(`../../api/doctorsSpecialities`).specialities

const initialState = {
	categories: [],
	consultants: [],
}


class Ask_doctor extends Component { 
	  
    static fetchData({ store, params }) {
        return Promise.all([
            store.dispatch(actions.getDiseasesProfiles()), 
            store.dispatch(actions.getDoctorsList()), 
            store.dispatch(actions.getBlogFaqs()), 
            store.dispatch(actions.getBlogLastQuestionsClosed()), 
        ])
    }

	constructor(props) {
		super(props);

		this.state = initialState
		
		this.filterQuestions = ::this.filterQuestions;

	}

    componentWillMount(){
        this.props.pageActions.updateIsLoadingPage(true);
    }

	componentDidMount(){
        Promise.all([
			this.props.async.getDiseasesProfiles(),
			this.props.async.getDoctorsList(),
			this.props.async.getBlogFaqs(),
			this.props.async.getBlogLastQuestionsClosed()
		]).then( () => {
            this.props.pageActions.updateIsLoadingPage(false)			
		})
        
        this.props.pageActions.setNavigationPathNames([
        	{ label: ['Ask doctor', 'Спросить врача'], link: '/ask_doctor'},
        	{ label: ['Last questions', 'Последние вопросы'], link: '/ask_doctor/faq'},
        ])	

        this.setState({ lastQuest: this.props.asyncData.blogLastQuestions, lastQuestConst: this.props.asyncData.blogLastQuestions })
    }


	filterQuestions(id) {
		this.setState({ lastQuest: _.filter(this.state.lastQuestConst, { category: id }) })
	}

	render() {
		const languageId = this.props.profile.languageId - 0;
		const path = this.props.location.pathname;
        const url = process.env.API_URL + this.props.location.pathname
		const {doctorsList, blogFaqs, blogLastQuestions, diseasesProfiles} = this.props.asyncData;
		console.log(this.state)

		return(	
			<div style={{ marginTop: 20 }}>
				<Row style={{ margin: 0 }}>

					<Hidden xs sm>
						<Col md={4} lg={3} xl={3} style={{ marginTop: 10 }}>
							<Paper zDepth={2} style={{ padding: 10 }}>
								<h3 className='center' style={{ marginTop: 13 }}>{ languageId === 0 ? 'Categories' : 'Категории' }</h3>
								<Divider style={{ marginBottom: 10 }}/>
								<ListItem 
									primaryText={ languageId === 0 ? 'All' : 'Все' } 
									onClick={() => this.setState({ lastQuest: this.state.lastQuestConst })} 
									innerDivStyle={{ padding: 10 }}/>

								{diseasesProfiles.map( category =>
									<ListItem 
										primaryText={ languageId === 0 ? category.name : category.name_ru } 
										onClick={ () => this.filterQuestions(category.id) } 
										innerDivStyle={{ padding: 10 }}/>
								)}
							</Paper>
						</Col>
					</Hidden>

					<Col xs={12} md={8} lg={6} xl={6}>
					{ 
						path !== '/ask_doctor/questions/new' &&
						<div>	
							<Row>
								<Col xs={6}>
									<h4>{ languageId === 0 ? 'Have a question? ask a specialist' : 'Есть вопрос? спросите специалиста' }</h4>
								</Col>
								<Col xs={6}>
									<RaisedButton
										fullWidth
										label={ languageId === 0 ? 'Ask' : 'Спросить' }
										containerElement={ <Link to='/ask_doctor/questions/new'/> }
										labelColor='#fff'
										backgroundColor='#55c901'
										style={{ marginTop: 10 }} />								
								</Col>
							</Row>
							<Row>
								<Col>
									<Divider style={{ marginTop: 10, marginBottom: 10 }}/>
								</Col>
							</Row>

							<Row>
								<Col xs={12} sm={6} xl={6} style={{ paddingRight: 1 }}>
									<RaisedButton
										fullWidth
										label={ languageId === 0 ? 'Recent questions' : 'Последние вопросы' }
										containerElement={ <Link to='/ask_doctor/questions'/> }
										style={{ marginBottom: 10 }}
										backgroundColor={ 
											path === '/ask_doctor/questions' || path === '/ask_doctor'
											  ? '#337ab7' : 'initial'
										}
										labelColor={ 
											path === '/ask_doctor/questions' || path === '/ask_doctor'
											  ? '#fff' : 'initial'
										}/>
								</Col>
								<Col xs={12} sm={6} xl={6} style={{ paddingLeft: 0 }}>
									<RaisedButton
										fullWidth
										label={ languageId === 0 ? 'FAQ' : 'FAQ' }
										containerElement={ <Link to='/ask_doctor/faq'/> }
										backgroundColor={ 
											path === '/ask_doctor/faq'
											  ? '#337ab7' : 'initial'
										}
										labelColor={ 
											path === '/ask_doctor/faq'
											  ? '#fff' : 'initial'
										}/>
								</Col>
							</Row>
						</div>
					}
					{
						(path === '/ask_doctor/questions' || path === '/ask_doctor') &&
						
						<AskDoctorLastQuestions
							languageId={languageId}
							lastQuest={this.state.lastQuest} />
						
						|| path === '/ask_doctor/faq' &&

						<AskDoctorFaq
							languageId={languageId} 
							faqList={blogFaqs} />
						
						|| path === '/ask_doctor/questions/new' && 
						<AskDoctorFillForm
							user={this.props.profile.user}
							languageId={languageId} 
							specialities={diseasesProfiles} />
					}
					</Col>

					<Hidden xs sm md>
						<Col lg={3} xl={3} style={{ marginTop: 13 }}>
							<h3 className='center'>{ languageId === 0 ? 'Consultants' : 'Консультанты' }</h3>
							<Divider style={{ marginBottom: 10 }}/>
							{
								doctorsList.map( consultant =>
									<ListItem 
										containerElement={ 
											<Link to={`/blog/${consultant.users_id}`} /> 
										}
										leftAvatar={ <img src={consultant.avatar} className='avatar-sm' onError={ (e) => (e.currentTarget).src = '/images/doctor_default.png' }/> }
										primaryText={ (consultant.last_name || '') + ' ' + (consultant.first_name || '') }
										secondaryText={ languageId === 0 ? `Cpeciality: ${consultant.d_speciality || 'not specified'}` : `Специальность: ${consultant.d_speciality || 'не указана' }` } /> 									
								)
							}				
						</Col>
					</Hidden>

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

export default connect(mapStateToProps, mapDispatchToProps)(Ask_doctor);