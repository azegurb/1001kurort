import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import TextField from 'material-ui/TextField'
import Avatar from 'material-ui/Avatar'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
import Drawer from 'material-ui/Drawer'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import _ from 'lodash'
import moment from 'moment'

import StarsRating from './StarsRating'

const initialState = {
	showAdd: false,
	open: false,
}

const clearCommentData = {
	showAdd: false,
	overallRat: null,
	treatmRat: null,
	pluses: '',
	minuses: '',
}

export default class SanatoriumPage extends Component {
    
    constructor(props){
        super(props);

        this.state =  initialState

		this.axiosAddComment = ::this.axiosAddComment;
    }

    componentWillMount(){
    	this.setState({ reviews: this.props.reviews || [], commentStats: this.props.commentStats || [] })
    }

    componentWillReceiveProps(nextProps){
    	this.setState({ open: nextProps.open, reviews : nextProps.reviews || [], commentStats: this.props.commentStats && this.props.commentStats[0] || [] })
    }

    axiosAddComment () {
    	this.props.axiosAddComment(this.state.overallRat, this.state.treatmRat, this.state.pluses, this.state.minuses)
    	this.setState({ showAdd: false })
    }

	render() {

    	const languageId = this.props.languageId - 0;

		return(
				<Drawer 
					openSecondary 
					docked={false}
					width='40%' 
					open={this.state.open}
					onRequestChange={(open) => this.setState({open}) }
					containerStyle={{ padding: 15 }}
				>
					<Row>
						<Col className='center'>
							<h2 style={{ color: '#55c901' }}>{ languageId === 0 ? 'Sanatorium reviews' : 'Отзывы о санатории' }</h2>
							<Divider />
						</Col>
					</Row>
					<Row>
						<Col xs={6} className='center'>							

							<h4>
								{ languageId === 0 ? `Total rating: ` : `Общий рейтинг: ` }
								<b style={{ padding: 5, fontSize: 30, color: '#4283b6' }}>{ this.state.commentStats.overal_rat || '0'}</b>
							</h4>								

							<h4>
								{ languageId === 0 ? `Total reviews: ` : `Всего отзывов: ` }
								<b style={{ padding: 5, fontSize: 30, color: '#4283b6' }}>{ this.state.commentStats.total_reviews || '0'}</b>
							</h4>																

						</Col>
						<Col xs={6}>

							<h4>
								{ languageId === 0 ? `Treatment rating: ` : `Рейтинг лечения: ` }
								<b style={{ padding: 5, fontSize: 30, color: '#4283b6' }}>{ this.state.commentStats.treatm_rat || '0'}</b>
							</h4>

						</Col>

					</Row>
					<Row>
						<Col>
							{
								!_.isEmpty(this.props.user)
								?	<RaisedButton
										fullWidth 
										label={ languageId === 0 ? 'Add comment' : 'Оставить отзыв' }
										onClick={ () => this.setState({ showAdd: true }) }/>
								: 	<div style={{ textAlign: 'center', padding: 10 }}>
										<p>{ languageId === 0 ? 'Auth to comment' : 'Авторизуйтесь, чтобы комментировать' }</p>
									</div>
							}
						</Col>
					</Row>
					<Row style={{ marginTop: 20 }}>
						<Col style={{ marginBottom: 10 }}>
							<Divider />
						</Col>
						{
							this.state.showAdd
							? 	<Col>
										<Col xl={6}>
											<h4 style={{ float: 'left', margin: 5, marginRight: 15 }}>
												{ languageId === 0 ? 'Overall ' : 'Общее ' }
											</h4>
											<StarsRating 
												value={this.state.overallRat} 
												onChange={ (overallRat) => this.setState({ overallRat }) } />
										</Col>
										<Col xl={6}>
											<h4 style={{ float: 'left', margin: 5, marginRight: 15 }}>
												{ languageId === 0 ? 'Treatment' : 'Лечение' }
											</h4>										
											<StarsRating
												value={this.state.treatmRat} 
												onChange={ (treatmRat) => this.setState({ treatmRat }) } />										
										</Col>
										<Col>
											<TextField
												fullWidth
												multiLine
												rows={2}
												value = { this.state.pluses}
												floatingLabelText={ languageId === 0 ? 'Pluses' : 'Плюсы' }
												onChange={ (e,pluses) => this.setState({ pluses}) }/>
											<TextField 
												fullWidth
												multiLine
												rows={2}
												value = { this.state.minuses}
												floatingLabelText={ languageId === 0 ? 'Minuses' : 'Минусы' }
												onChange={ (e,minuses) => this.setState({ minuses}) }/>
										</Col>
										<Col xs={6}>
											<RaisedButton
												fullWidth
												label={ languageId === 0 ? 'Назад' : 'Отменить' }
												onClick={ () => this.setState(clearCommentData) } />
										</Col>
										<Col xs={6}>
											<RaisedButton
												fullWidth
												disabled={ !this.state.overallRat || !this.state.treatmRat || !this.state.pluses || !this.state.minuses }
												label={ languageId === 0 ? 'Ok' : 'Ок' }
												onClick={this.axiosAddComment} />
										</Col>
								</Col>
							:  	this.state.reviews.length
								? 	<Col>{
										this.state.reviews.map( review =>
											<Row style={{ marginTop: 10, background: '#f5f5f5', borderRadius: 5 }}>
												<Col xs={6}>
													<ListItem
														disabled={true}
														leftAvatar={
															<Avatar src={review.avatar || '/images/user_default.png'} />
														}
														primaryText={ (review.first_name || review.last_name) 
															? 	`${review.first_name} ${review.last_name}`
															: 	languageId === 0 ? 'No name' : 'Без имени' 
														} 
														secondaryText={moment(review.created).format('DD MMM, YYYY')}/>
													<ListItem
														disabled={true}
														leftAvatar={
															<i className="fa fa-plus" aria-hidden="true" style={{ left: 30, color: '#4cc708' }}></i>
														}
														primaryText={ review.pluses } 
														style={{ fontSize: 13, padding: '6px 5px 5px 72px' }}/>
													<ListItem
														disabled={true}
														leftAvatar={
															<i className="fa fa-minus" aria-hidden="true" style={{ left: 30, color: '#bf3e3e' }}></i>
														}
														primaryText={ review.minuses }
														style={{ fontSize: 13, padding: '6px 5px 5px 72px' }}/>
												</Col>
												<Col xs={6}>
													<ListItem
														disabled 
														primaryText={
															<Row> 
																<Col>	
																	<h4 style={{ float: 'left', margin: 5, color: '#4283b6' }}>
																		{ languageId === 0 ? 'Total:' : 'Общее:' }
																	</h4>
																	<StarsRating 
																		readOnly
																		value={review.overal_rat} />
																</Col>
																<Col>
																	<h4 style={{ float: 'left', margin: 5, color: '#4cc708' }}>
																		{ languageId === 0 ? 'Treatment:' : 'Лечение:' } 
																	</h4>
																	<StarsRating
																		readOnly
																		value={review.treatm_rat} />
																</Col>
															</Row>
														}/>
												</Col>									
											</Row>
										)
									}</Col>
								
								: 	<Col style={{ textAlign: 'center', padding: 10 }}>
										<p>{ languageId === 0 ? 'Not yet commented on' : 'Еще не комментировался' }</p>
									</Col>
						}
					</Row>
				</Drawer>
		)
	}
}    	
