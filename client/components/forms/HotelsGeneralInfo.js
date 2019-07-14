import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import MuiGeoSuggest from 'material-ui-geosuggest'
import _ from 'lodash'
import axios from 'axios'

const initialState =	{
							sname: '',
							stars: '',
							website: '',
							countryId: -1,
							kurortId: -1,
							countriesNames: [],
							kurortsNames: [],
							about: '',
							about_ru: '',
						}


export default class HotelsGeneralInfo extends Component {


	constructor(props) {
		super(props);

		this.state = initialState

		this.handleSanatorium = ::this.handleSanatorium;
		this.handleKurort = ::this.handleKurort;
		this.handleCountry = ::this.handleCountry;
		this.handleCategory = ::this.handleCategory;
		this.handleWebsite = ::this.handleWebsite;
		this.handleAdress = ::this.handleAdress;
		this.handleSaveData = ::this.handleSaveData;
	}


	componentWillMount() {
	    axios.get('/api/countries-kurorts-names').then( response => {
	        this.setState({ 
	            countriesNames: _.sortBy(response.data.countries, this.props.languageId === 0 ? 'country' : 'country_ru'),
	            kurortsNames: _.sortBy(response.data.kurorts, this.props.languageId === 0 ? 'kurort' : 'kurort_ru'),
	         })
	    })

		axios.get('/api/profile/hotel/general-info',
				{
					params : {
						users_id : this.props.data.users_id
					}
				}
		).then( response => {

			console.log(response)
			this.setState (
				{ 
					sname: response.data.data.h_sname || '',
					countryId: response.data.data.h_country_id || '',
					kurortId: response.data.data.h_kurort_id || '',
					stars: parseInt(response.data.data.h_stars) || '',
					website: response.data.data.h_website || '',
					about: response.data.data.h_about || '',
					about_ru: response.data.data.h_about_ru || '',
					formatted_address: response.data.data.address || '',
					location_json: response.data.data.h_location || {},
				}
			)
		})

	}


  	handleSanatorium(event, sname) {
  		this.setState({ sname, errorSname: !Boolean(sname) })
  	}

  	handleKurort(event, index, kurortId) {
  		this.setState({ kurortId, errorKurortId : !Boolean(kurortId) });
  	}

  	handleCountry(event, index, countryId) {
  		this.setState({ countryId, errorCountryId : !Boolean(countryId) });
	}

	handleCategory(event, index, stars) {
		this.setState({ stars })
	}

	handleWebsite(event, website) {
		this.setState({ website })
	}

    handleAdress(result) {
    	this.setState({ formatted_address: result.formatted_address || result, location_json: { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() } })
	}

	handleSaveData() { 

		axios.post('/api/profile/hotel/general-info/update' , 
			{
				users_id: this.props.data.users_id,
				sname: this.state.sname,
				address: this.state.formatted_address,
				location_json: this.state.location_json,
				countryId: this.state.countryId || '',
				kurortId: this.state.kurortId || '',				
				stars: this.state.stars,
				website: this.state.website,
				about: this.state.about,
				about_ru: this.state.about_ru
			}
		)
		.then( response => { } )


	}

	render() {
		
		const languageId = this.props.languageId - 0;
		console.log(this.state)
		return(
				<div>

					<Row style={{ margin : '10px' }} className='center' >
					
						<Col xs={6}>

							<TextField
								fullWidth
								name='sanatorium'	
								floatingLabelText={ languageId === 0 ? 'Sanatorium name' : 'Название санатория' } 
								value={ this.state.sname }
								onChange={ ::this.handleSanatorium } />

						</Col>

						<Col xs={6}>

                            <MuiGeoSuggest
                            	fullWidth
								options={{
									types: ['establishment', 'geocode']
								}}
								floatingLabelText={languageId === 0 ? 'Address' : 'Адрес'}
								value={this.state.formatted_address}
								onChange={ (e,value) => this.setState({ formatted_address: value }) }                    
								onPlaceChange={ this.handleAdress } />

						</Col>
						
                        <Col  xs={6}>
                            <SelectField
							  fullWidth
                              floatingLabelText={languageId === 0 ? 'Country' : 'Страна'}
                              value={ this.state.countryId }
                              errorText={ this.state.errorCountryId && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              floatingLabelStyle={{ left: 0 }}
                              onChange={this.handleCountry}
                              style={{ textAlign: 'left' }}
                            >
                              {
                                this.state.countriesNames.map( (item, index) => 
                                  <MenuItem 
                                    key={index}
                                    value={item.id} 
                                    primaryText={ languageId === 0 ? item.country : item.country_ru} />
                                )
                              }
                            </SelectField>                            

                        </Col>

                        <Col  xs={6}>
                            <SelectField
							  fullWidth
                              disabled={ this.state.countryId === -1 }
                              floatingLabelText={languageId === 0 ? 'Kurort' : 'Курорт'}
                              value={ this.state.kurortId }
                              errorText={ this.state.errorKurortId && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              floatingLabelStyle={{ left: 0 }}
                              onChange={this.handleKurort}
                              style={{ textAlign: 'left' }}
                            >
                              {
                                this.state.kurortsNames.map( (item, index) => 
                                  item.country_id === this.state.countryId &&
                                  <MenuItem 
                                    key={index}
                                    value={item.id} 
                                    primaryText={ languageId === 0 ? item.kurort : item.kurort_ru} />
                                )
                              }
                            </SelectField>
                        </Col>

						<Col xs={6}>
							
							<SelectField 
								fullWidth
								floatingLabelText={languageId === 0 ? 'Category' : 'Категория'}
								value={ this.state.stars}
								floatingLabelStyle={{ left :'0px' }}
								menuItemStyle={{ textAlign : 'center' }}
								onChange={ ::this.handleCategory } 
                            	style={{ textAlign: 'left' }}
							>

								<MenuItem value={0} primaryText={languageId === 0 ? 'No category' : 'Без категории'} />
								<MenuItem value={1} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
								<MenuItem value={2} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
								<MenuItem value={3} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
								<MenuItem value={4} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star-o gold" aria-hidden="true"/></div>} />
								<MenuItem value={5} primaryText={<div><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/><i className="fa fa-star yellow" aria-hidden="true"/></div>} />
							
							</SelectField>

						</Col>

						<Col xs={6}>

							<TextField
								fullWidth
								value={ this.state.website }
								floatingLabelText={languageId === 0 ? 'Business Website' : 'Бизнес-сайт'} 
								onChange={ ::this.handleWebsite } />

						</Col>

						<Col xs={12}>

							<TextField
								fullWidth
								multiLine
								rows={4}
								floatingLabelText={languageId === 0 ? 'About sanatorium(EN)' : 'О санатории(EN)'} 
								value={ this.state.about }
								onChange={ (e, value) => this.setState({ about: value }) } />

						</Col>

						<Col xs={12}>

							<TextField
								fullWidth
								multiLine
								rows={4}								
								floatingLabelText={languageId === 0 ? 'About sanatorium(RU)' : 'О санатории(RU)'} 
								value={ this.state.about_ru }
								onChange={ (e, value) => this.setState({ about_ru: value }) } />

						</Col>

					</Row>					
					<Row style={{ margin : '10px' }}>
					
						<Col xs={12} className='center'>

								<RaisedButton
									disabled={ this.state.errorEmail || this.state.errorContactNumber || !this.state.stars }
									label={languageId === 0 ? 'Update' : 'Обновить'}
									onClick={ this.handleSaveData } />

						</Col>
					
					</Row>
				</div>
		)
	}
}