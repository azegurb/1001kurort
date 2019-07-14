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
import Checkbox from 'material-ui/Checkbox';


const initialState = {
	logo: '',
	showFrases: true,
	fraseEn: '',
	fraseRu: '',
	frases: [],
	newFrase: true,
	fraseIndex: null
}

const resetNewFrase = {
	newFrase: true,
	fraseIndex: null,
	fraseEn: '',
	fraseRu: ''
}

const setNothingSave = {
	unsavedData: false,
}

const setSomeNeedSave = {
	unsavedData: true,
}

export default class AdminLoadingScreen extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({}, initialState)

		this.axiosGetLoadingScreen = ::this.axiosGetLoadingScreen
		this.saveChanges = ::this.saveChanges
		this.cancelChanges = ::this.cancelChanges
		this.addFrase = ::this.addFrase
		this.updateFrase = ::this.updateFrase
		this.deleteFrase = ::this.deleteFrase
	}

	componentWillMount(){
		this.axiosGetLoadingScreen()
	}

	componentWillUnmount(){
		if(this.state.unsavedData && confirm(this.props.languageId === 0 ? 'to save the changes?' : 'Сохранить изменения?') ) {
			this.saveChanges()
		}
	}

	axiosGetLoadingScreen() {
		axios.get('/api/loading-screen')
			.then(res => res.data.data)
			.then(data => this.setState(data))
			.catch(err => console.log(err))
	}

	saveChanges() {
		const data = {
			logo: this.state.logo,
			showFrases: this.state.showFrases,
			frases: this.state.frases
		}

		axios.put('/api/loading-screen', { data })
			.then(() => {
				this.axiosGetLoadingScreen()
				this.setState(setNothingSave)
			})
			.catch(err => console.log(err))
	}

	cancelChanges() {
		this.axiosGetLoadingScreen()
		this.setState(resetNewFrase, setNothingSave)
	}

	addFrase() {
		const en = this.state.fraseEn,
			  ru = this.state.fraseRu,
			  frases = this.state.frases

		if( !en.length || !ru.length) return;

		 frases.push({ en, ru })

		this.setState(Object.assign({ frases }, resetNewFrase, setSomeNeedSave))
	}

	updateFrase() {
		const frases = this.state.frases,
			  index = this.state.fraseIndex,
			  en = this.state.fraseEn,
			  ru = this.state.fraseRu
		
		if( !en.length || !ru.length) return;
		
		frases[index] = {
		  en,
		  ru
		}

		this.setState(Object.assign({ frases }, resetNewFrase, setSomeNeedSave))
	}
	
	deleteFrase() {
		const frases = this.state.frases,
			  index = this.state.fraseIndex

		frases.splice(index, 1);

		this.setState(Object.assign({ frases }, resetNewFrase, setSomeNeedSave))
	}

	render() {
		const languageId = this.props.languageId - 0;
		const state = this.state;
		console.log(state)

		return(	
			<div>
				<Row>
					<Col style={{ padding: 15 }}>
						<RaisedButton 
							label={languageId === 0 ? 'Save changes' : 'Сохранить изменения'}
							style={{ marginRight: 15 }}
							onClick={this.saveChanges}/>
						<RaisedButton 
							label={languageId === 0 ? 'Cancel changes' : 'Отменить изменения'}
							onClick={this.cancelChanges}/>
					</Col>
				</Row>
				<Row>	
					<Col>
						<h3>{languageId === 0 ? 'Logo' : 'Логотип'}</h3>			
        			</Col>
				</Row>
				<Row>
					<Col>
						<TextField
						  fullWidth
					      floatingLabelText={languageId === 0 ? 'Link of logo': 'Ссылка на логотип'}
					      value={state.logo}
					      onChange={(e, value) => this.setState({ logo: value })}
					    />
					</Col>
				</Row>
				<Row>	
					<Col>
						<h3>{languageId === 0 ? 'Frases' : 'Фразы'}</h3>			
        			</Col>
				</Row>
				<Row>
					<Col>
				        <Checkbox
				          label={languageId === 0 ? 'Show phrases under logo' : 'Показывать фразы под лого'}
				          checked={this.state.showFrases}
				          onCheck={(e,checked) => this.setState(Object.assign({ showFrases: checked }, setSomeNeedSave))}
				          style={{ marginTop: 15, marginBottom: 15 }}
				        />					
        			</Col>
				</Row>
				{state.showFrases &&
				<Row>
					<Col xs={6}>
						<ListItem 
						  primaryText={languageId === 0 ? 'Add frase' : 'Добавить фразу'}
						  onClick={() => this.setState(resetNewFrase)}
						  style={{ marginTop: 20 }}
						  style={ state.fraseIndex === null ? { color: '#49c407' } : {} }/>
						<Divider />
						{state.frases.length
						  ? state.frases.map( (frase, index) =>
							<ListItem 
							  primaryText={languageId === 0 ? frase.en : frase.ru}
							  onClick={() => this.setState({
							  	newFrase: false,
							  	fraseIndex: index,
							  	fraseEn: frase.en,
							  	fraseRu: frase.ru
							  })}
							  style={ index === state.fraseIndex ? { color: '#49c407' } : {} }/>
						  )
						:   <h4 style={{ marginLeft: 15 }}>
							  {languageId === 0 ? 'Empty list' : 'Список пуст'}
							</h4>}	
        			</Col>
					<Col xs={6}>
						<TextField
						  fullWidth
					      multiLine
					      rows={3}
					      floatingLabelText={languageId === 0 ? 'Text En': 'Текст EN'}
					      value={state.fraseEn}
					      onChange={(e, value) => this.setState({ fraseEn: value })}
					    />			
						<TextField
						  fullWidth
					      multiLine
					      rows={3}
					      floatingLabelText={languageId === 0 ? 'Text RU': 'Текст RU'}
					      value={state.fraseRu}
					      onChange={(e, value) => this.setState({ fraseRu: value })}
					    />
					    {state.newFrase 
					    	?	<RaisedButton 
						          label={languageId === 0 ? 'Add frase' : 'Добавить фразу'}
						          onClick={this.addFrase} />
						: <div>
							<RaisedButton 
					          label={languageId === 0 ? 'Update' : 'Обновить'}
					          onClick={this.updateFrase} />
						    <RaisedButton 
					          label={languageId === 0 ? 'Delete' : 'Удалить'}
					          onClick={this.deleteFrase}
					          style={{ marginLeft: 15 }} />
						  </div>}			
        			</Col>
				</Row>}
			</div>
		)
	}

}