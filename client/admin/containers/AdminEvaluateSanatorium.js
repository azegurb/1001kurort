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
	detailedHotelID: null,
	newLink: '',
	newPluses: null,
	newMinuses: null,
	newVideos: [],
}

export default class AdminEvaluateSanatorium extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ hotels: [] }, initialState)
		
		this.axiosGetHotels = ::this.axiosGetHotels;
		this.updateNewEvaluates = ::this.updateNewEvaluates;
		this.showDetailsHotel = ::this.showDetailsHotel;
		this.updateHotelEvalutate = ::this.updateHotelEvalutate;
		this.addVideo = ::this.addVideo;
		this.deleteVideo = ::this.deleteVideo;	
	}

	componentWillMount(){
		this.axiosGetHotels()
	}


	axiosGetHotels() {
		
		axios.get('/api/hotels')
			 .then( res => this.setState({ hotels : res.data.data }))
	}

	updateNewEvaluates(){

	}

	showDetailsHotel(id, videos) {
		this.setState(Object.assign(initialState,{ detailedHotelID: id, newVideos: videos }))
	}

	updateHotelEvalutate(){

		axios.post('/api/admin/hotel-evaluate/update', {
				users_id: this.state.detailedHotelID,
				h_pluses: this.state.newPluses,
				h_minuses: this.state.newMinuses,
				h_videos: this.state.newVideos,
			 })
			 .then( res => {
			 	this.axiosGetHotels()
			 	this.setState(initialState)
			 	this.setState({ detailedHotelID: null })
			 })	
	}

	addVideo() {
		let videos = this.state.newVideos

		if(videos.indexOf(this.state.newLink) === -1){
			videos.push(this.state.newLink)
		}

		this.setState({ newVideos: videos, newLink: '' })
	}

	deleteVideo(id) {
		let videos = this.state.newVideos;
		const index = videos.indexOf(id);
		
		videos.splice(index, 1)
		
		this.setState({ newVideos: videos })
	}

	render() {
		const languageId = this.props.languageId - 0;
		const {hotels} = this.state;
		const state = this.state;
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col xl={6} style={{ marginTop: 15 }}>
						{hotels.length 
							?	hotels.map( hotel => 
									<Row>
										<Col>
											<h3 
											 onClick={() => this.showDetailsHotel(hotel.users_id, hotel.h_videos || [])}
											 style={{ cursor: 'pointer', color: this.state.detailedHotelID === hotel.users_id ? '#49c407' : 'inherit' }}
											>
											{hotel.h_sname}
											</h3>
										</Col>
										{this.state.detailedHotelID === hotel.users_id &&
											<Col xs={12}>
												<Row>
													<Col sm={12} md={6} xl={6}>
														<TextField
															fullWidth
															multiLine
															rows={3}
															floatingLabelText={languageId === 0 ? 'Pluses' : 'Плюсы'}
															value={state.newPluses !== null ? state.newPluses : hotel.h_pluses}
															onChange={(e) => this.setState({ newPluses: e.target.value })}
															style={{ marginTop: 10 }}
														/>
													<Col sm={12} md={6} xl={6}>	
													</Col>
														<TextField
															fullWidth
															multiLine
															rows={3}
															floatingLabelText={languageId === 0 ? 'Minuses' : 'Минусы'}
															value={state.newMinuses !== null ? state.newMinuses : hotel.h_minuses}
															onChange={(e) => this.setState({ newMinuses: e.target.value })}
															style={{ marginTop: 10 }}
														/>
													</Col>
												</Row>
												<Row>
													<Col xl={7}>
														<TextField
															floatingLabelText={languageId === 0 ? 'Video ID' : 'Видео ID'} 
															value={this.state.newLink}
															onChange={(e,value) => this.setState({ newLink: value }) }/>
													</Col>
													<Col xl={5} style={{ marginTop: 15 }}>
														<RaisedButton
															label={languageId === 0 ? 'Add' : 'Добавить'}
															style={{ marginTop: 10 }}
															onClick={this.addVideo} />
													</Col>
												</Row>
												<Row>
												
												{ state.newVideos.length
													? 	state.newVideos.map( video =>
															<Col xs={12} style={{ margin: '20px 0px' }}>
																<RaisedButton
																	fullWidth
																	label={languageId === 0 ? 'Delete' : 'Удалить'}
																	onClick={() => this.deleteVideo(video)}/>
																<object data={`http://www.youtube.com/embed/${video}`}
																	width="100%" height="250"></object>
															</Col>
														)
													: 	<Col style={{ padding: 0 }}>
															<p style={{ fontSize: 25,margin: '15px 0px' }}>{languageId === 0 ? 'No videos' : 'Нету видео'}</p>
														</Col>
												}
												</Row>
												<Row>
													<Col>
														<RaisedButton 
															label={languageId === 0 ? 'Update' : 'Обновить'}
															onClick={this.updateHotelEvalutate}/>
													</Col>
												</Row>
											</Col>
										}
									</Row>
								) 
							: 	<p>{languageId === 0 ? 'Sanatoriums not found' : 'Санатории не найдены'}</p>
						}
					</Col>
				</Row>
			</div>
		)
	}

}