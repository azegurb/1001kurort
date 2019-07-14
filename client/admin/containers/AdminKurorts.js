import React, { Component}  from 'react'
import TextField from 'material-ui/TextField'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import {List, ListItem,  makeSelectable } from 'material-ui/List'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import _ from 'lodash'
import axios from 'axios'
import CircularProgress from 'material-ui/CircularProgress'

import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

const initialState = {	
	requestDone: true,
	activeCountry: null,
	activeKurort: null,
	newCNameEn : '',
	newCNameRus: '',
	newKNameEn : '',
	newKNameRus: '',
}

export default class AdminKurorts extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({ countries: [], kurorts: [] }, initialState)

		this.axiosGetCountriesAndKurorts = ::this.axiosGetCountriesAndKurorts;
		this.addCountry = ::this.addCountry;
		this.addKurort = ::this.addKurort;
		this.updateCountry = ::this.updateCountry;
		this.updateKurort = ::this.updateKurort;
		this.deleteCountry = ::this.deleteCountry;
		this.deleteKurort = ::this.deleteKurort;
		this.handleActiveCountry = ::this.handleActiveCountry;
		this.handleActiveKurort = ::this.handleActiveKurort;
		this.uploadImageToSite = ::this.uploadImageToSite;
	}

	componentWillMount(){
		this.axiosGetCountriesAndKurorts()
	}

	axiosGetCountriesAndKurorts() {
		axios
			.get('/api/countries-kurorts-names')
			.then(response =>
				this.setState({ countries: response.data.countries, kurorts: response.data.kurorts })
			)
	}

	addCountry() {
		this.setState({ requestDone: false })
		let validNewCountry = !_.find( this.state.countries, { country: this.state.newCNameEn, country_ru: this.state.newCNameRus })

		if(validNewCountry && this.state.newCNameEn && this.state.newCNameRus){

			if( this.state.uploadedImage){
				axios
					.post('https://api.imgur.com/3/image', {
						image : this.state.uploadedImage,
						type: 'base64'
					},{
							headers: { 
								Authorization: 'Client-ID 742e78dbe8f441f',
								Accept: 'application/json'
							}
					})
					.then( response => 

						axios.post('/api/countries-kurorts-names/add-country',{
							cname: this.state.newCNameEn,
							cname_ru: this.state.newCNameRus,
							image: response.data.data.link,
						}).then( () => {
							this.axiosGetCountriesAndKurorts() 
							this.setState({ 
								newCNameEn: '', 
								newCNameRus: '',
								uploadedImage: '',
								tempUploadedName: '',
								errorNewCountry: false, 
								errorNewCountryEnLabel: false,
								errorNewCountryRusLabel: false,
								errorCountryImage: false,
								requestDone: true,
							})
						})
					)
				}else if(this.state.activeImage){
					axios.post('/api/countries-kurorts-names/add-country',{
						cname: this.state.newCNameEn,
						cname_ru: this.state.newCNameRus,
						image: this.state.activeImage,
					}).then( () => {
						this.axiosGetCountriesAndKurorts() 
						this.setState({ 
							newCNameEn: '', 
							newCNameRus: '',
							tempUploadedName: '',
							errorNewCountry: false, 
							errorNewCountryEnLabel: false,
							errorNewCountryRusLabel: false,
							errorCountryImage: false,
							requestDone: true,
						})
					})					
				}else{
					this.setState({ 
						errorCountryImage: true,
						requestDone: true 
					})
				}
		}else{
			this.setState({ 
				errorNewCountry: !validNewCountry,
				errorNewCountryEnLabel: this.state.newCNameEn.length ? false : true,
				errorNewCountryRusLabel: this.state.newCNameRus.length ? false : true,
				requestDone: true,
			})
		}
	}

	addKurort() {
		this.setState({ requestDone: false })
		let validNewKurort = !_.find( this.state.kurorts, { country: this.state.newKNameEn, country_ru: this.state.newKNameRus })

		if(validNewKurort){
			axios.post('/api/countries-kurorts-names/add-kurort',{
				newKNameEn: '', 
				newKNameRus: '',				
				country_id: this.state.activeCountry,
				sname: this.state.newKNameEn,
				sname_ru: this.state.newKNameRus,
			}).then( () => {
				this.axiosGetCountriesAndKurorts() 
				this.setState({
					errorNewKurort: false,
					errorNewKurortEnLabel: false,
					errorNewKurortRusLabel: false,
					requestDone: true,
				})
			})
		}else{
			this.setState({ 
				errorNewKurort: !validNewKurort,
				errorNewKurortEnLabel: this.state.newKNameEn.length ? false : true,
				errorNewKurortRusLabel: this.state.newKNameRus.length ? false : true,
				requestDone: true,
			 })
		}
	}

	updateCountry() {
		this.setState({ requestDone: false })
		let validNewCountry = !_.find( this.state.countries, (item) => item.country === this.state.activeCountryLabel[0] && item.country_ru === this.state.activeCountryLabel[1] && item.id !== this.state.activeCountry )
			
		if(validNewCountry && this.state.activeCountryLabel[0] && this.state.activeCountryLabel[1]){
			if( this.state.uploadedImage){
				axios
					.post('https://api.imgur.com/3/image', {
						image : this.state.uploadedImage,
						type: 'base64'
					},{
							headers: { 
								Authorization: 'Client-ID 742e78dbe8f441f',
								Accept: 'application/json'
							}
					})
					.then( response => 

						axios.post('/api/countries-kurorts-names/update-country',{
							id: this.state.activeCountry,
							cname: this.state.activeCountryLabel[0],
							cname_ru: this.state.activeCountryLabel[1],
							image: response.data.data.link,
						}).then( () => {
							this.axiosGetCountriesAndKurorts() 
							this.setState({ 
								newCNameEn: '', 
								newCNameRus: '',
								uploadedImage: '',
								tempUploadedName: '',
								errorNewCountry: false, 
								errorNewCountryEnLabel: false,
								errorNewCountryRusLabel: false,
								errorCountryImage: false,
								requestDone: true,
							})
						})
					)
			}else if(this.state.activeImage){
				axios.post('/api/countries-kurorts-names/update-country',{
					id: this.state.activeCountry,
					cname: this.state.activeCountryLabel[0],
					cname_ru: this.state.activeCountryLabel[1],
					image: this.state.activeImage,
				}).then( () => {
					this.axiosGetCountriesAndKurorts() 
					this.setState({ 
						newCNameEn: '', 
						newCNameRus: '',
						tempUploadedName: '',
						errorNewCountry: false, 
						errorNewCountryEnLabel: false,
						errorNewCountryRusLabel: false,
						errorCountryImage: false,
						requestDone: true,
					})
				})					
			}else{
				this.setState({ 
					errorCountryImage: true,
					requestDone: true 
				})				
			}

		}else{
			this.setState({ 
				errorCountry: !validNewCountry,
				errorCountryEnLabel: this.state.activeCountryLabel[0].length ? false : true,
				errorCountryRusLabel: this.state.activeCountryLabel[1].length ? false : true,
				requestDone: true,
			})
		}
	}

	updateKurort() {
		this.setState({ requestDone: false })
		const languageId = this.props.languageId - 0;		
		let validNewKurort = !_.find( this.state.kurorts, { country: this.state.kNameEn, country_ru: this.state.kNameRus })

		if(validNewKurort && this.state.kNameEn && this.state.kNameRus){
			axios.post('/api/countries-kurorts-names/update-country',{
				id: this.state.activeCountry,
				cname: this.state.kNameEn,
				cname_ru: this.state.kNameRus,
			}).then( () => {
				this.axiosGetCountriesAndKurorts() 
				this.setState({ 
					errorKurort: false, 
					errorKurortEnLabel: false,
					errorKurortRusLabel: false,
					requestDone: true,
				})
			})
		}else{
			this.setState({ 
				errorKurort: !validNewKurort,
				errorKurortEnLabel: this.state.kNameEn.length ? false : true,
				errorKurortRusLabel: this.state.kNameRus.length ? false : true,
				requestDone: true,
			})
		}
	}	

	deleteCountry() {
		this.setState({ requestDone: false })
			axios.post('/api/countries-kurorts-names/delete-country',{
				id: this.state.activeCountry,
			}).then( () => {
				this.axiosGetCountriesAndKurorts() 
				this.setState({
					activeCountry: null, 
					cNameEn: '', 
					cNameRus: '',
					errorCountry: false, 
					errorCountryEnLabel: false,
					errorCountryRusLabel: false,
					requestDone: true,
				})
			})		
	}

	deleteKurort() {
		this.setState({ requestDone: false })
			axios.post('/api/countries-kurorts-names/delete-country',{
				id: this.state.activeKurort,
			}).then( () => {
				this.axiosGetCountriesAndKurorts() 
				this.setState({
					activeCountry: null, 
					kNameEn: '', 
					kNameRus: '',
					errorKurort: false, 
					errorKurortEnLabel: false,
					errorKurortRusLabel: false,
					requestDone: true,
				})
			})		
	}

	handleActiveCountry(e, i, activeCountry) {
		let country = _.find(this.state.countries, { id: activeCountry })

		if(country){
			this.setState({
				activeCountry,
				activeKurort: null,
				activeCountryLabel: [country.country, country.country_ru],
				activeKurortLabel: ['',''],
				activeImage: country.image,
				errorCountryEnLabel: false,
				errorCountryRusLabel: false,
			})
		}else{
			this.setState({ 
				activeCountry, 
				activeKurort: null,
				activeCountryLabel: ['',''],
				activeKurortLabel: ['',''],
				activeImage: null,
				errorCountryEnLabel: false,
				errorCountryRusLabel: false,

			})
		}
	}	

	handleActiveKurort(e, i, activeKurort) {

		let kurorts = _.find(this.state.kurorts, { id: activeKurort })

		console.log(kurorts)
		if(kurorts){
			this.setState({
				activeKurort,
				activeKurortLabel: [kurorts.kurort, kurorts.kurort_ru],
				activeCountryLabel: ['',''],
				errorKurortEnLabel: false,
				errorKurortyRusLabel: false,
			})
		}else{
			this.setState({ 
				activeKurort, 
				activeKurortLabel: ['',''],
				activeCountryLabel: ['',''],
				errorKurortEnLabel: false,
				errorKurortyRusLabel: false,
 
			})
		}
	}

	uploadImageToSite(e) {
		let reader = new FileReader();
		let file = e.target.files[0];

		if (!file) return;

		reader.onload = function(img) {
			const data = new FormData();
			let uploadedImage = img.target.result.replace(/^[^,]*,/,'')

			this.setState({ uploadedImage, tempUploadedName: file.name })

		}.bind(this);
		reader.readAsDataURL(file);
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		console.log(this.state)
		return(	
			<div>
				<Row>

					<Col xs={6}>
						<SelectField
							floatingLabelText={ languageId === 0 ? 'Country' : 'Страна' }
							value={this.state.activeCountry}
							onChange={ this.handleActiveCountry }
						>
							{ 	
								this.state.countries.map( country =>
									<MenuItem 
										value={country.id} 
										primaryText={ languageId === 0 ? country.country : country.country_ru }
									/>
								)
							}
							<MenuItem 
								rightIcon={<i className="fa fa-plus" aria-hidden="true" style={{ top: 9, right: 18 }}></i>}
								value={-1} 
								primaryText={ languageId === 0 ? 'Add country' : 'Добавить страну' } />
						</SelectField>	

						<SelectField
							disabled={ !this.state.activeCountry }
							floatingLabelText={ languageId === 0 ? 'kurort' : 'Курорт' }
							value={this.state.activeKurort}
							onChange={ this.handleActiveKurort }
						>
							{ 	
								this.state.kurorts.map( kurort =>
									kurort.country_id === this.state.activeCountry &&
									<MenuItem 
										value={kurort.id} 
										primaryText={ languageId === 0 ? kurort.kurort : kurort.kurort_ru }
									/>
								)
							}
							<MenuItem 
								rightIcon={<i className="fa fa-plus" aria-hidden="true" style={{ top: 9, right: 18 }}></i>}
								value={-1} 
								primaryText={ languageId === 0 ? 'Add kurort' : 'Добавить курорт' } />
						</SelectField>	
					</Col>
					{
						!this.state.requestDone
						?	<div style={{ textAlign: 'center', marginTop: 30 }}>
								<CircularProgress
									color='#55c908'
									size={50}
									thickness={4} />
							</div>					
						: 
						<Col xs={6}>
						{
							this.state.activeCountry === -1 &&
							<Row className='center' style={{ marginTop: 20 }}>
								<Col>
									<h4>{ languageId === 0 ? 'New country' : 'Новая страна' }</h4>
								</Col>
								<Col>
									<TextField
	    								errorText={ this.state.errorNewCountryEnLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								floatingLabelText={ languageId === 0 ? 'Name EN' : 'Название EN' }
	    								value={ this.state.newCNameEn }
	    								onChange={ 
	    									(e, newCNameEn ) => this.setState({ 
	    										newCNameEn,
	    										errorNewCountryEnLabel: newCNameEn.length < 1
	    									}) 
	    								}/>
								</Col>
								<Col>
									<TextField
	    								errorText={ this.state.errorNewCountryRusLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								floatingLabelText={ languageId === 0 ? 'Name RUS' : 'Название RUS' }
	    								value={ this.state.newCNameRus }
	    								onChange={ 
	    									(e, newCNameRus ) => this.setState({ 
	    										newCNameRus,
	    										errorNewCountryRusLabel: newCNameRus.length < 1
	    									}) 
	    								}/>
								</Col>
								<Col>
									{ this.state.errorCountryImage && <p style={{ color: 'red' }}>{ languageId === 0 ? 'Invalid value' : 'Неверное значение' }</p> }
									<label htmlFor='file' style={{ marginTop: 10, marginBottom: 10 }}>{ 
										this.state.tempUploadedName
										? this.state.tempUploadedName
										: this.state.activeImage
										? this.state.activeImage
										: languageId === 0 ? 'Upload image' : 'Загрузить изображение' 
									}</label>
									<input
										required
										id='file' 
										type='file' 
										style={{ marginTop: 10, marginBottom: 10, opacity: 0, position: 'absolute' }}
										onChange={ ::this.uploadImageToSite } 
										placeholder={ languageId === 0 ? 'Upload image' : 'Загрузить изображение' } />
								</Col>	
								<Col>
									<RaisedButton
										disabled={ this.state.errorNewCountryEnLabel || this.state.errorNewCountryRusLabel }
	    								label={ languageId === 0 ? 'Add' : 'Добавить' }
	    								onClick={ this.addCountry }
									/>
								</Col>
								<Col>
									{ this.state.errorNewCountry && <p style={{ color: 'red' }}>{ languageId === 0 ? 'This counrtry already exist' : 'Эта страна уже существует' }</p> }
								</Col>
							</Row>
						||
							this.state.activeKurort === -1 &&
							<Row className='center' style={{ marginTop: 20 }}>
								<Col>
									<h4>{ languageId === 0 ? 'New kurort' : 'Новый курорт' }</h4>
								</Col>
								<Col>
									<TextField
	    								errorText={ this.state.errorNewKurortEnLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								floatingLabelText={ languageId === 0 ? 'Name EN' : 'Название EN' }
	    								value={ this.state.newKNameEn }
	    								onChange={ 
	    									(e, newKNameEn ) => this.setState({ 
	    										newKNameEn,
	    										errorNewKurortEnLabel: newKNameEn.length < 1
	    									})
	    								}
									/>
								</Col>
								<Col>
									<TextField
	    								errorText={ this.state.errorNewKurortRusLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								floatingLabelText={ languageId === 0 ? 'Name RUS' : 'Название RUS' }
	    								value={ this.state.newKNameRus }
	    								onChange={ 
	    									(e, newKNameRus ) => this.setState({ 
	    										newKNameRus,
	    										errorNewKurortRusLabel: newKNameRus.length < 1
											}) 
	    								}
									/>
								</Col>
								<Col>
									<RaisedButton
	    								label={ languageId === 0 ? 'Add' : 'Добавить' }
	    								onClick={ this.addKurort }
									/>
								</Col>
								<Col>
									{ this.state.errorNewCountry && <p style={{ color: 'red' }}>{ languageId === 0 ? 'This counrtry already exist' : 'Эта страна уже существует' }</p> }
								</Col>
							</Row>
						||
							this.state.activeCountry > 0 && !this.state.activeKurort &&					
							<Row className='center' style={{ marginTop: 20 }}>
								<Col>
									<h4>
									{ languageId === 0 
										? `Country: ${this.state.activeCountryLabel[languageId]}` 
										: `Страна: ${this.state.activeCountryLabel[languageId]}` 
									}
									</h4>
								</Col>
								<Col>
									<TextField
	    								floatingLabelText={ languageId === 0 ? 'Name EN' : 'Название EN' }
	    								errorText={ this.state.errorCountryEnLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								value={ this.state.activeCountryLabel[0] }
	    								onChange={ 
	    									(e, cNameEn ) => this.setState({ 
	    										activeCountryLabel: [cNameEn, this.state.activeCountryLabel[1] ],
	    										errorCountryEnLabel: cNameEn.length < 1
	    									}) 
	    								}/>
								</Col>
								<Col>
									<TextField
	    								floatingLabelText={ languageId === 0 ? 'Name RUS' : 'Название RUS' }
	    								errorText={ this.state.errorCountryRusLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								value={ this.state.activeCountryLabel[1] }
	    								onChange={ 
	    									(e, cNameRus ) => this.setState({ 
	    										activeCountryLabel: [this.state.activeCountryLabel[0], cNameRus ],
	    										errorCountryRusLabel: cNameRus.length < 1 
	    									}) 
	    								}/>
								</Col>
								<Col>
									{ this.state.errorCountryImage && <p style={{ color: 'red' }}>{ languageId === 0 ? 'Invalid value' : 'Неверное значение' }</p> }
									<label htmlFor='file' style={{ marginTop: 10, marginBottom: 10 }}>{ 
										this.state.tempUploadedName
										? this.state.tempUploadedName
										: this.state.activeImage
										? this.state.activeImage
										: languageId === 0 ? 'Upload image' : 'Загрузить изображение' 
									}</label>
									<input
										required
										id='file' 
										type='file' 
										style={{ marginTop: 10, marginBottom: 10,  opacity: 0, position: 'absolute' }}
										onChange={ ::this.uploadImageToSite } 
										placeholder={ languageId === 0 ? 'Upload image' : 'Загрузить изображение' } />
								</Col>	
								<Col>
									<RaisedButton
										disabled={ this.state.errorCountryEnLabel || this.state.errorCountryRusLabel }
	    								label={ languageId === 0 ? 'Update' : 'Обновить' }
	    								onClick={ this.updateCountry }
									/>
								</Col>
								<Col>
									<h5 onClick={ this.deleteCountry } style={{ textDecoration: 'underline', cursor: 'pointer', marginTop: 15 }}>
										<i className="fa fa-trash-o" aria-hidden="true" style={{ paddingRight: 10 }}></i>
										{ languageId === 0 ? 'Delete' : 'Удалить'}
									</h5>
								</Col>
							</Row>						
						||
							this.state.activeCountry > 0 && this.state.activeKurort &&				
							<Row className='center' style={{ marginTop: 20 }}>
								<Col>
									<h4>
									{ languageId === 0 
										? `Kurort: ${this.state.activeKurortLabel[languageId]}` 
										: `Курорт: ${this.state.activeKurortLabel[languageId]}` 
									}
									</h4>
								</Col>
								<Col>
									<TextField
	    								floatingLabelText={ languageId === 0 ? 'Name EN' : 'Название EN' }
	    								errorText={ this.state.errorKurortEnLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								value={ this.state.activeKurortLabel[0] }
	    								onChange={ 
	    									(e, kNameEn ) => this.setState({ 
	    										activeKurortLabel: [kNameEn, this.state.activeKurortLabel[1] ],
	    										errorKurortEnLabel: kNameEn.length < 1
	    									}) 
	    								}/>
								</Col>
								<Col>
									<TextField
	    								floatingLabelText={ languageId === 0 ? 'Name RUS' : 'Название RUS' }
	    								errorText={ this.state.errorKurortRusLabel && (languageId === 0 ? 'Invalid value' : 'Неверное значение') }
	    								value={ this.state.activeKurortLabel[1] }
	    								onChange={ 
	    									(e, kNameRus ) => this.setState({ 
	    										activeKurortLabel: [this.state.activeKurortLabel[0], kNameRus ],
	    										errorKurortRusLabel: kNameRus.length < 1 
	    									}) 
	    								}/>
								</Col>
								<Col>
									<RaisedButton
										disabled={ this.state.errorKurortEnLabel || this.state.errorKurortRusLabel }
	    								label={ languageId === 0 ? 'Update' : 'Обновить' }
	    								onClick={ this.updateCountry }
									/>
								</Col>
								<Col>
									<h5 onClick={ this.deleteKurort } style={{ textDecoration: 'underline', cursor: 'pointer', marginTop: 15 }}>
										<i className="fa fa-trash-o" aria-hidden="true" style={{ paddingRight: 10 }}></i>
										{ languageId === 0 ? 'Delete' : 'Удалить'}
									</h5>
								</Col>
							</Row>

						}
					</Col>
				}
				</Row>
			</div>
		)
	}

}