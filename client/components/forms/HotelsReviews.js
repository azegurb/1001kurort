import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox'
import Avatar from 'material-ui/Avatar'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import FullscreenDialog from 'material-ui-fullscreen-dialog'
import TextField from 'material-ui/TextField'
import Popover from 'material-ui/Popover'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import LinearProgress from 'material-ui/LinearProgress'
import axios from 'axios'
import moment from 'moment'

import StarsRating from '../StarsRating' 

const initialState =	{
							comments: [],
						}



export default class HotelsReviews extends Component {
  	
  	constructor(props) {
		super(props);

		this.state = initialState
	}


	componentWillMount() {

		axios.get('/api/hotels/comments', {
			params: {
				hotels_id: this.props.data.users_id
			}
		}).then( response => {
			console.log(response.data)
			this.setState( Object.assign(response.data.stats[0], { comments: response.data.comments || [] }) ) 
		})
	}


	render() {
		
		const languageId = this.props.languageId - 0;
		const stars = parseInt(this.props.data.h_stars)

		console.log(this.state)
		return(
				<div>
					<Row style={{ marginTop: 30 }}>

						<Col xs={8} className='center' >
							<h5>{ languageId === 0 ? 'History of comments' : 'История комментариев' }</h5>
							<Divider />
							{ 
								this.state.comments.length ?

									this.state.comments.map( comment => 
										<Row style={{ marginTop: 10, background: '#f5f5f5', borderRadius: 5, border: '1px solid' }}>
											<Col xs={6}>
												<ListItem
													disabled={true}
													leftAvatar={
														<Avatar src={comment.avatar || '/images/user_default.png'} />
													}
													primaryText={ (comment.first_name || comment.last_name) 
														? 	`${comment.first_name} ${comment.last_name}`
														: 	languageId === 0 ? 'No name' : 'Без имени' 
													} 
													secondaryText={moment(comment.created).format('DD MMM, YYYY')}/>
												<ListItem
													disabled={true}
													leftAvatar={
														<i className="fa fa-plus" aria-hidden="true" style={{ left: 30, color: '#4cc708' }}></i>
													}
													primaryText={ comment.pluses } 
													style={{ fontSize: 13, padding: '6px 5px 5px 72px' }}/>
												<ListItem
													disabled={true}
													leftAvatar={
														<i className="fa fa-minus" aria-hidden="true" style={{ left: 30, color: '#bf3e3e' }}></i>
													}
													primaryText={ comment.minuses }
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
																	value={comment.overal_rat} />
															</Col>
															<Col>
																<h4 style={{ float: 'left', margin: 5, color: '#4cc708' }}>
																	{ languageId === 0 ? 'Treatment:' : 'Лечение:' } 
																</h4>
																<StarsRating
																	readOnly
																	value={comment.treatm_rat} />
															</Col>
														</Row>
													}/>
											</Col>									
										</Row>
									)
								:
									<h6> { languageId === 0 ? 'You have not yet received ratings' : 'Вы пока не получали оценок' } </h6>

							}
						</Col>
		
						<Col xs={4} className='center'>
							<div style={{ border : '1px solid black', borderBottom: 0}}>
								<h4> { languageId === 0 ? 'Your hotel' : 'Ваш отель' } : <strong style={{ fontSize: 24 }}>{ this.props.data.h_sname }</strong> </h4>

								<div>
									<i className={ stars >= 1 ? 'fa fa-star yellow' : 'fa fa-star-o gold' } aria-hidden='true'/>
									<i className={ stars >= 2 ? 'fa fa-star yellow' : 'fa fa-star-o gold' } aria-hidden='true'/>
									<i className={ stars >= 4 ? 'fa fa-star yellow' : 'fa fa-star-o gold' } aria-hidden='true'/>
									<i className={ stars >= 5 ? 'fa fa-star yellow' : 'fa fa-star-o gold' } aria-hidden='true'/>
									<i className={ stars === 5 ? 'fa fa-star yellow' : 'fa fa-star-o gold' } aria-hidden='true'/>
								</div>
							</div>
							<div style={{ marginTop : 30 }} style={{ border : '1px solid black' }}>

								<Row>
									
									<Col xs={5}>
										<h5> { languageId === 0 ? 'Cleanliness' : 'Чистота' } </h5>
									</Col>
									
									<Col xs={5}>
										<LinearProgress 
											mode='determinate' 
											value={ this.state.cleanness }
											min={0}
											max={10}
											color='#49c407'
											style={{ height: 16, width: '100%' , marginTop : 10 }}/>
									</Col>								
									
									<Col xs={1}>
										<h5 style={{ fontSize: 24, margin: 4 }}> { this.state.cleanness }</h5>
									</Col>

								</Row>
								<Row>
									
									<Col xs={5}>
										<h5> { languageId === 0 ? 'Comfort' : 'Комфорт' } </h5>
									</Col>
									
									<Col xs={5}>
										<LinearProgress 
											mode='determinate' 
											value={ this.state.comfort }
											min={0}
											max={10}
											color='#49c407'
											style={{ height: 16, width: '100%' , marginTop : 10 }}/>
									</Col>								
									
									<Col xs={1}>
										<h5 style={{ fontSize: 24, margin: 4 }}> { this.state.comfort }</h5>
									</Col>

								</Row>
								<Row>
									
									<Col xs={5}>
										<h5> { languageId === 0 ? 'Restaurant' : 'Ресторан' } </h5>
									</Col>
									
									<Col xs={5}>
										<LinearProgress 
											mode='determinate' 
											value={ this.state.restaurant }
											min={0}
											max={10}
											color='#49c407'
											style={{ height: 16, width: '100%' , marginTop : 10 }}/>
									</Col>								
									
									<Col xs={1}>
										<h5 style={{ fontSize: 24, margin: 4 }}> { this.state.restaurant }</h5>
									</Col>

								</Row>
								<Row>
									
									<Col xs={5}>
										<h5> { languageId === 0 ? 'Service' : 'Обслуживание' } </h5>
									</Col>
									
									<Col xs={5}>
										<LinearProgress 
											mode='determinate' 
											value={ this.state.service }
											min={0}
											max={10}
											color='#49c407'
											style={{ height: 16, width: '100%' , marginTop : 10 }}/>
									</Col>								
									
									<Col xs={1}>
										<h5 style={{ fontSize: 24, margin: 4 }}> { this.state.service }</h5>
									</Col>

								</Row>
								<Row>
									
									<Col xs={5}>
										<h5> { languageId === 0 ? 'Price and quality' : 'Цена и качество' } </h5>
									</Col>
									
									<Col xs={5}>
										<LinearProgress 
											mode='determinate' 
											value={ this.state.priceAndQuality }
											min={0}
											max={10}
											color='#49c407'
											style={{ height: 16, width: '100%' , marginTop : 10 }}/>
									</Col>								
									
									<Col xs={1}>
										<h5 style={{ fontSize: 24, margin: 4 }}> { this.state.priceAndQuality }</h5>
									</Col>

								</Row>
								<Row>
									
									<Col xs={5}>
										<h5> { languageId === 0 ? 'Location ant teritory' : 'Расположение и территория' } </h5>
									</Col>
									
									<Col xs={5}>
										<LinearProgress 
											mode='determinate' 
											value={ this.state.area }
											min={0}
											max={10}
											color='#49c407'
											style={{ height: 16, width: '100%' , marginTop : 10 }}/>
									</Col>								
									
									<Col xs={1}>
										<h5 style={{ fontSize: 24, margin: 4 }}> { this.state.area }</h5>
									</Col>

								</Row>
								<Row>
									
									<Col xs={5}>
										<h5> { languageId === 0 ? 'Treatment' : 'Лечение' } </h5>
									</Col>
									
									<Col xs={5}>
										<LinearProgress 
											mode='determinate' 
											value={ this.state.treatm_rat }
											min={0}
											max={10}
											color='#49c407'
											style={{ height: 16, width: '100%' , marginTop : 10 }}/>
									</Col>								
									
									<Col xs={1}>
										<h5 style={{ fontSize: 24, margin: 4 }}> { this.state.treatm_rat }</h5>
									</Col>

								</Row>

							</div>
						</Col>

					</Row>
				</div>

		)
	}
}
