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
	activePageID: null,
	pages: []
}

const resetState = {
	activePageTitleEN: '',
	activePageTitleRU: '',
	activePageDescriptionEN: '',
	activePageDescriptionRU: '',
	activePageKeywords: ''
}

export default class SitePages extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ pages: [] }, initialState)

		this.handleActivePage = ::this.handleActivePage;
		this.axiosGetPages = ::this.axiosGetPages;
		this.reset = ::this.reset;
		this.update = ::this.update;
	}

	componentWillMount(){
		this.axiosGetPages();
	}

	axiosGetPages(){
		axios.get(`/api/site-pages`)
			 .then( res => this.setState({ pages: res.data.pages }) )
			 .catch( err => console.log(err))
	}

    handleActivePage(e,i,path) {
    	let metaData = _.find(this.state.pages, { path })

    	let activeMetaData = resetState

    	if(metaData){
    		activeMetaData = {
    			label: metaData.label || ['Unknown', 'Безымянная'],
    			activePageTitleEN: metaData.titleEN || '',
    			activePageTitleRU: metaData.titleRU || '',
    			activePageDescriptionEN: metaData.descriptionEN || '',
    			activePageDescriptionRU: metaData.descriptionRU || '',
    			activePageKeywords: metaData.keywords || ''
    		}
    	}

    	this.setState(Object.assign({ activePageID: path }, activeMetaData))
	}

	reset(){
		this.setState(resetState)
	}

	update(){
		let {
			pages,
			label,
			activePageID, 
			activePageTitleEN, 
			activePageTitleRU, 
			activePageDescriptionEN, 
			activePageDescriptionRU, 
			activePageKeywords
		} = this.state;

		let metaData = {
			path: activePageID,
			label: label,
			titleEN: activePageTitleEN,
			titleRU: activePageTitleRU,
			descriptionEN: activePageDescriptionEN,
			descriptionRU: activePageDescriptionRU,
			keywords: activePageKeywords
		} 

		let index = _.findIndex(pages, { path: activePageID})

		if(index > -1){
			pages[index] = metaData
		}
		else{
			pages.push(metaData);
		}


		axios.post('/api/site-pages/update', {
			pages,
		})
		.then( () => this.axiosGetPages() )
		.catch( err => console.log(err))
	}


	render() {
		const languageId = this.props.languageId - 0;
		const {activePageID} = this.state;
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col xs={6}>
						<SelectField
							floatingLabelText={languageId === 0 ? 'Pages' : 'Страницы'}
							value={this.state.activePageID}
							onChange={this.handleActivePage}
						>
							{this.state.pages.map( (item, index) =>
								item.label &&
								<MenuItem key={index} value={item.path} primaryText={item.label[languageId]}/>
							)}
						</SelectField>
					</Col>
					<Col xs={6}>
						<div style={{ marginTop: 35 }}>
						{activePageID 
							? <h3>{languageId === 0 ? `PATH: ${activePageID}`: `ПУТЬ: ${activePageID}`}</h3>
							: <h3>{languageId === 0 ? `Select page`: `Выберите страницу`}</h3>
						}
						</div>
					</Col>
					<Col>
						{this.state.activePageID &&
							<div>
								<Row>
									<Col>
										<TextField 
											multiLine
											fullWidth
											rows={2}
											floatingLabelText={languageId === 0 ? 'Page title (tag title) - in English' : 'Название страницы (тег title) - на английском'}
											value={this.state.activePageTitleEN}
											onChange={(e) => this.setState({ activePageTitleEN: e.target.value })}/>
									</Col>
									<Col>
										<TextField 
											multiLine
											fullWidth
											rows={2}
											floatingLabelText={languageId === 0 ? 'Page title (tag title) - in Russian' : 'Название страницы (meta description) - по русски'}
											value={this.state.activePageTitleRU}
											onChange={(e) => this.setState({ activePageTitleRU: e.target.value })}/>
									</Col>
									<Col>
										<TextField 
											multiLine
											fullWidth
											rows={2}
											floatingLabelText={languageId === 0 ? 'Page description (meta description) - in English' : 'Описание страницы (meta description) - на английском'}
											value={this.state.activePageDescriptionEN}
											onChange={(e) => this.setState({ activePageDescriptionEN: e.target.value })}/>
									</Col>
									<Col>
										<TextField 
											multiLine
											fullWidth
											rows={2}
											floatingLabelText={languageId === 0 ? 'Page description (meta description) - in Russian' : 'Описание страницы (meta description) - по русски'}
											value={this.state.activePageDescriptionRU}
											onChange={(e) => this.setState({ activePageDescriptionRU: e.target.value })}/>
									</Col>
									<Col>
										<TextField 
											multiLine
											fullWidth
											rows={2}
											floatingLabelText={languageId === 0 ? 'Page keywords (meta keywords)' : 'Ключевые слова страницы (meta keywords)'}
											value={this.state.activePageKeywords}
											onChange={(e) => this.setState({ activePageKeywords: e.target.value })}/>
									</Col>
									<Col>
										<RaisedButton
											label={languageId === 0 ? 'Reset' : 'Сбросить'} 
											onClick={::this.reset}/>

										<RaisedButton
											label={languageId === 0 ? 'Save' : 'Сохранить'}
											style={{ marginLeft: 15 }} 
											onClick={::this.update}/>
									</Col>
								</Row>
							</div>
						}
					</Col>
				</Row>
			</div>
		)
	}

}