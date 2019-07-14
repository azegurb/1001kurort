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
}

export default class AdminVideos extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ videos: [] }, initialState)

		this.axiosGetAdminVideos = ::this.axiosGetAdminVideos;
		this.addVideo = ::this.addVideo;
		this.deleteVideo = ::this.deleteVideo;
	}

	componentWillMount(){
		this.axiosGetAdminVideos()
	}

	axiosGetAdminVideos() {
		axios.get('/api/admin/get-videos')
			 .then( response => this.setState({ videos: response.data.data }) )
	}

	addVideo() {
		axios.post('/api/admin/videos/create',{
			url: this.state.newLink,
		}).then( response => {
			this.setState({ newLink: '' })
			this.axiosGetAdminVideos()
		})
	}

	deleteVideo(id) {
		axios.post('/api/admin/videos/delete',{
			id,
		}).then( response => {
			this.axiosGetAdminVideos()
		})
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col>
						<h3>{ languageId === 0 ? 'Insert only ID video from YouTube' : 'Вставляйте только ID видео с ютуба'}</h3>
					</Col>
					<Col xl={6}>
						<TextField
							floatingLabelText={languageId === 0 ? 'ID' : 'ID'} 
							value={this.state.newLink}
							onChange={(e,value) => this.setState({ newLink: value }) }/>
					</Col>
					<Col xl={3} style={{ marginTop: 15 }}>
						<RaisedButton
							label={languageId === 0 ? 'Add' : 'Добавить'}
							style={{ marginTop: 10 }}
							onClick={this.addVideo} />
					</Col>
				</Row>
				<Row style={{ marginTop: 35 }}>
					{ this.state.videos.length 
						? 	this.state.videos.map( video =>
								<Col xs={6}>
									<RaisedButton
										fullWidth
										label={languageId === 0 ? 'Delete' : 'Удалить'}
										onClick={() => this.deleteVideo(video.id)}/>
									<object data={`http://www.youtube.com/embed/${video.url}`}
										width="100%" height="250"></object>
								</Col>
							)
						: 	<Col>{languageId === 0 ? 'No videos' : 'Нету видео'}</Col>
					}
				</Row>
			</div>
		)
	}

}