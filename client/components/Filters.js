import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import Open from 'material-ui/svg-icons/content/add-circle-outline';
import Close from 'material-ui/svg-icons/content/remove-circle-outline';
import Slider, { Range } from 'rc-slider';
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'
import _ from 'lodash'

const queryString = require('query-string');

const initialState = {
  timerToUpdateFilters: null,
}

const currency = ['USD', 'RUB', 'AZN', 'KZT', 'EUR']

class Filters extends Component { 
	
	constructor(props) {
		super(props);

		this.state = Object.assign({}, initialState, { values: _.clone(this.props.search.filtersValues) });

		this.setPriceRange = ::this.setPriceRange;
		this.handleStars = ::this.handleStars;
		this.handleDiseasesProfiles = ::this.handleDiseasesProfiles;
		this.handleFacilities = ::this.handleFacilities;
		this.handleTreatmentBase = ::this.handleTreatmentBase;
		this.handleVisiblePriceRange = ::this.handleVisiblePriceRange;
		this.handlePriceFrom = ::this.handlePriceFrom;
		this.handlePriceTo = ::this.handlePriceTo;
		this.handleVisibleStars = ::this.handleVisibleStars;
		this.handleVisibleTreatment = ::this.handleVisibleTreatment;
		this.handleVisibleFacilities = ::this.handleVisibleFacilities;
		this.handleVisibleTreatmentBase = ::this.handleVisibleTreatmentBase;
		this.handleVisibleRoomEquip = ::this.handleVisibleRoomEquip;
		this.handleVisibleForChildren = ::this.handleVisibleForChildren;
		this.handleVisibleFeatures = ::this.handleVisibleFeatures;

	}
	
	componentDidMount(){
		const params = queryString.parse(this.props.params)
		let values = this.state.values

		if( params.priceFrom && params.priceTo ){

			params.priceFrom = params.priceFrom.map( item => parseInt(item) )
			params.priceTo = params.priceTo.map( item => parseInt(item) )
			this.setPriceRange([params.priceFrom[this.props.currencyId], params.priceTo[this.props.currencyId]])
			this.setState({ visiblePriceRange: true })
		}
		if( params.stars ){
			values.stars = Array.isArray(params.stars) ? params.stars.map( item => parseInt(item) ) : [parseInt(params.stars)]
			this.setState({ visibleStars: true })
		}
		if(params.diseasesProfiles){
			values.diseasesProfiles = Array.isArray(params.diseasesProfiles) ? params.diseasesProfiles.map( item => parseInt(item) ) : [parseInt(params.diseasesProfiles)]
			this.setState({ visibleTreatment: true })
		}
		if(params.facilities){
			values.facilities = Array.isArray(params.facilities) ? params.facilities.map( item => parseInt(item) ) : [parseInt(params.facilities)]
			this.setState({ visibleFacilities: true })
		}

		this.setState({ values })
	}

	setPriceRange(priceRange) { 

		let priceFromIntoUSD = null,
			priceToIntoUSD = null,
			values = this.state.values

		switch(this.props.currencyId){
			case 0: 
				priceFromIntoUSD = priceRange[0] / this.props.currencyRates.USD
				priceToIntoUSD = priceRange[1] / this.props.currencyRates.USD
				break 
			case 1: 
				priceFromIntoUSD = priceRange[0] / this.props.currencyRates.RUB
				priceToIntoUSD = priceRange[1] / this.props.currencyRates.RUB
				break 
			case 2: 
				priceFromIntoUSD = priceRange[0] / this.props.currencyRates.AZN
				priceToIntoUSD = priceRange[1] / this.props.currencyRates.AZN
				break
			case 3: 
				priceFromIntoUSD = priceRange[0] / this.props.currencyRates.KZT 
				priceToIntoUSD = priceRange[1] / this.props.currencyRates.KZT
				break
			case 4: 
				priceFromIntoUSD = priceRange[0] / this.props.currencyRates.EUR
				priceToIntoUSD = priceRange[1] / this.props.currencyRates.EUR
				break
		}

		values = Object.assign( values, {
			priceFrom: [
				parseFloat(priceFromIntoUSD.toFixed(2)), 
				parseFloat((priceFromIntoUSD * this.props.currencyRates.RUB).toFixed(2)),
				parseFloat((priceFromIntoUSD * this.props.currencyRates.AZN).toFixed(2)),
				parseFloat((priceFromIntoUSD * this.props.currencyRates.KZT).toFixed(2)),
				parseFloat((priceFromIntoUSD * this.props.currencyRates.EUR).toFixed(2))
			],
			priceTo: [
				parseFloat(priceToIntoUSD.toFixed(2)), 
				parseFloat((priceToIntoUSD * this.props.currencyRates.RUB).toFixed(2)),
				parseFloat((priceToIntoUSD * this.props.currencyRates.AZN).toFixed(2)),
				parseFloat((priceToIntoUSD * this.props.currencyRates.KZT).toFixed(2)),
				parseFloat((priceToIntoUSD * this.props.currencyRates.EUR).toFixed(2))
			]
		})

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)
	}

	handlePriceFrom(e,value) { 

		const priceFrom = parseInt(value || 0);
			
		let priceFromIntoUSD = null,
			values = this.state.values

		switch(this.props.currencyId){
			case 0: 
				priceFromIntoUSD = priceFrom / this.props.currencyRates.USD
				break 
			case 1: 
				priceFromIntoUSD = priceFrom / this.props.currencyRates.RUB
				break 
			case 2: 
				priceFromIntoUSD = priceFrom / this.props.currencyRates.AZN
				break
			case 3: 
				priceFromIntoUSD = priceFrom / this.props.currencyRates.KZT 
				break
			case 4: 
				priceFromIntoUSD = priceFrom / this.props.currencyRates.EUR
				break
		}

		values = Object.assign( values, {
			priceFrom: [
				parseFloat(priceFromIntoUSD.toFixed(2)), 
				parseFloat((priceFromIntoUSD * this.props.currencyRates.RUB).toFixed(2)),
				parseFloat((priceFromIntoUSD * this.props.currencyRates.AZN).toFixed(2)),
				parseFloat((priceFromIntoUSD * this.props.currencyRates.KZT).toFixed(2)),
				parseFloat((priceFromIntoUSD * this.props.currencyRates.EUR).toFixed(2))
			],
		})

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)
	}

	handlePriceTo(e,value) { 

		const priceTo = parseInt(value || 0);
			
		let priceToIntoUSD = null,
			values = this.state.values

		switch(this.props.currencyId){
			case 0: 
				priceToIntoUSD = priceTo / this.props.currencyRates.USD
				break 
			case 1: 
				priceToIntoUSD = priceTo / this.props.currencyRates.RUB
				break 
			case 2: 
				priceToIntoUSD = priceTo / this.props.currencyRates.AZN
				break
			case 3: 
				priceToIntoUSD = priceTo / this.props.currencyRates.KZT 
				break
			case 4: 
				priceToIntoUSD = priceTo / this.props.currencyRates.EUR
				break
		}

		values = Object.assign( values, {
			priceTo: [
				parseFloat(priceToIntoUSD.toFixed(2)), 
				parseFloat((priceToIntoUSD * this.props.currencyRates.RUB).toFixed(2)),
				parseFloat((priceToIntoUSD * this.props.currencyRates.AZN).toFixed(2)),
				parseFloat((priceToIntoUSD * this.props.currencyRates.KZT).toFixed(2)),
				parseFloat((priceToIntoUSD * this.props.currencyRates.EUR).toFixed(2))
			],
		})

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)
	}



	handleStars(checked, id ){
		let values = this.state.values

		if(!values.stars) values.stars = []

		if(checked){ 
			values.stars.push(id) 
		}else {
			let index = values.stars.indexOf(id)
			values.stars.splice(index,1)
		}

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)	
	}

	handleDiseasesProfiles(checked, id ){
		let values = this.state.values

		if(!values.diseasesProfiles) values.diseasesProfiles = []

		if(checked){ 
			values.diseasesProfiles.push(id) 
		}else {
			let index = values.diseasesProfiles.indexOf(id)
			values.diseasesProfiles.splice(index,1)
		}

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)	
	}

	handleFacilities(checked, id ){

		let values = this.state.values

		if(!values.facilities) values.facilities = []

		if(checked){ 
			values.facilities.push(id) 
		}else {
			let index = values.facilities.indexOf(id)
			values.facilities.splice(index,1)
		}

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)	
	}

	handleTreatmentBase(checked, id ) {
		let values = this.state.values

		if(!values.treatmentBase) values.treatmentBase = []

		if(checked){ 
			values.treatmentBase.push(id) 
		}else {
			let index = values.treatmentBase.indexOf(id)
			values.treatmentBase.splice(index,1)
		}

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)	
	}

	handleRoomDetails(checked, id ){

		let values = this.state.values

		if(!values.roomDetails) values.roomDetails = []

		if(checked){ 
			values.roomDetails.push(id) 
		}else {
			let index = values.roomDetails.indexOf(id)
			values.roomDetails.splice(index,1)
		}

		this.setState(values)
		this.props.pageActions.updateSearchFilters(values)	
	}

	handleVisiblePriceRange(event, visiblePriceRange ) {
		this.setState({ visiblePriceRange })
	}

	handleVisibleStars(event, visibleStars ) {
		this.setState({ visibleStars })
	}

	handleVisibleTreatment(event, visibleTreatment ) {
		this.setState({ visibleTreatment })
	}
	
	handleVisibleFacilities(event, visibleFacilities ) {
		this.setState({ visibleFacilities })
	}

	handleVisibleTreatmentBase(event, visibleTreatmentBase ) {
		this.setState({ visibleTreatmentBase })
	}

	handleVisibleRoomEquip(event, visibleRoomEquip ) {
		this.setState({ visibleRoomEquip })
	}

	handleVisibleForChildren(event, visibleForChildren ) {
		this.setState({ visibleForChildren })
	}

	handleVisibleFeatures(event, visibleFeatures ) {
		this.setState({ visibleFeatures })
	}
	
	render() {
		const languageId = this.props.languageId - 0;
		const currencyId = this.props.currencyId - 0;

		return(	
			<Paper zDepth={1} className='paper' style={{ textAlign: 'left', marginTop: 20 }}>
				<Row>
					<Col xs={12}>
						<h4>{ languageId === 0 ? 'Filters :' : 'Фильтры :' }</h4>
						<Divider />
					</Col>
				</Row>
				<Row style={{ marginTop: 10 }}>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							onCheck={ this.handleVisiblePriceRange}
							checked={ this.state.visiblePriceRange }
							label={ languageId === 0 ? 'Price range' : 'Ценовой промежуток'} />

						<div className={ this.state.visiblePriceRange ? 'center' : 'hidden' } style={{ padding: 20 }}>
							
							<Range
								min={0} 
								max={5000} 
								value={[this.state.values.priceFrom[currencyId], this.state.values.priceTo[currencyId]]}
								trackStyle={ [{ backgroundColor: '#4283b6' }] } 
								handleStyle={[
									{ backgroundColor: '#fff', border: '1px solid #aaa', width: 22, height: 22, marginTop: -8 }, 
									{ backgroundColor: '#fff', border: '1px solid #aaa', width: 22, height: 22, marginTop: -8 } 
								]}
								tipFormatter={ value => `${value}` }
								onChange={ this.setPriceRange } />

							<div style={{ padding: 20 }}>
								<TextField
									value={this.state.values.priceFrom[currencyId]}
									onChange={this.handlePriceFrom}
									style={{ width: 50, marginRight: 10 }}/>
								-
								<TextField
									value={this.state.values.priceTo[currencyId]}
									onChange={this.handlePriceTo}
									style={{ width: 50, marginLeft: 10, marginRight: 15  }}/>

								<span>{currency[ currencyId]}</span>
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							onCheck={ this.handleVisibleTreatment}
							checked={ this.state.visibleTreatment }
							label={ languageId === 0 ? 'Treatment profile' : 'Профиль лечения'} />
						
						<div className={ this.state.visibleTreatment ? 'center' : 'hidden' }>
						{this.props.diseasesProfilesNames.map((item,index) =>
							<Checkbox
								checked={ this.state.values.diseasesProfiles && this.state.values.diseasesProfiles.indexOf(item.id) !== -1 ? true : false }
								label={languageId === 0 ? item.name : item.name_ru}
								onCheck={(event,checked) => this.handleDiseasesProfiles(checked, item.id)} />
						)}
						</div>				
					</Col>
				</Row>				
				<Row>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							checked={ this.state.visibleStars }
							onCheck={ this.handleVisibleStars }
							label={ languageId === 0 ? 'Sanatorium stars' : 'Звезды санатория'} />						
						
						<div className={ this.state.visibleStars ? 'center' : 'hidden' }>
							<Checkbox
								checked={ this.state.values.stars && this.state.values.stars.indexOf(1) !== -1 ? true : false }
								label={
									<div>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
									</div>
								}
								onCheck={ (event,checked) => this.handleStars(checked, 1) } />						
							<Checkbox
								checked={ this.state.values.stars && this.state.values.stars.indexOf(2) !== -1 ? true : false }
								label={
									<div>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
									</div>
								}
								onCheck={ (event,checked) => this.handleStars(checked, 2) } />					
							<Checkbox
								checked={ this.state.values.stars && this.state.values.stars.indexOf(3) !== -1 ? true : false }
								label={
									<div>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
									</div>
								}
								onCheck={ (event,checked) => this.handleStars(checked, 3) } />					
							<Checkbox
								checked={ this.state.values.stars && this.state.values.stars.indexOf(4) !== -1 ? true : false }
								label={
									<div>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star-o gold" aria-hidden="true"/>
									</div>
								}
								onCheck={ (event,checked) => this.handleStars(checked, 4) } />
							<Checkbox
								checked={ this.state.values.stars && this.state.values.stars.indexOf(5) !== -1 ? true : false }
								label={
									<div>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
										<i className="fa fa-star yellow" aria-hidden="true"/>
									</div>
								}
								onCheck={ (event,checked) => this.handleStars(checked, 5) } />
							</div>

					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							onCheck={ this.handleVisibleFacilities }
							checked={ this.state.visibleFacilities }
							label={ languageId === 0 ? 'Facilities' : 'Удобства'} />						
						
						<div className={ this.state.visibleFacilities ? 'center' : 'hidden' }>
						{this.props.facilitiesNames.map((item,index) =>
							<Checkbox
								checked={ this.state.values.facilities && this.state.values.facilities.indexOf(item.id) !== -1 ? true : false }
								label={languageId === 0 ? item.fname : item.fname_ru}
								onCheck={(event,checked) => this.handleFacilities(checked, item.id)} />
						)}
						</div>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							onCheck={ this.handleVisibleTreatmentBase }
							checked={ this.state.visibleTreatmentBase }
							label={ languageId === 0 ? 'Treatment base' : 'База лечения'} />						
						
						<div className={ this.state.visibleTreatmentBase ? 'center' : 'hidden' }>
						{this.props.treatmentBaseNames.map((item,index) =>
							item.category === 2 &&
							<Checkbox
								checked={ this.state.values.treatmentBase && this.state.values.treatmentBase.indexOf(item.id) !== -1 ? true : false }
								label={languageId === 0 ? item.name : item.name_ru}
								onCheck={(event,checked) => this.handleTreatmentBase(checked, item.id)} />
						)}
						</div>					
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							onCheck={ this.handleVisibleRoomEquip }
							label={ languageId === 0 ? 'Room equipment' : 'Оборудование номера'} />						
						
						<div className={ this.state.visibleRoomEquip ? 'center' : 'hidden' }>
						{this.props.roomDetailsNames.map((item,index) =>
							<Checkbox
								checked={ this.state.values.roomDetails && this.state.values.roomDetails.indexOf(item.id) !== -1 ? true : false }
								label={languageId === 0 ? item.dname : item.dname_ru}
								onCheck={(event,checked) => this.handleRoomDetails(checked, item.id)} />
						)}						
						</div>						
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							onCheck={ this.handleVisibleForChildren }
							label={ languageId === 0 ? 'For children' : 'Для детей'} />						
						
						<div className={ this.state.visibleForChildren ? 'center' : 'hidden' }>
						</div>						
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<Checkbox
							checkedIcon={<Close />}
							uncheckedIcon={<Open />}
							onCheck={ this.handleVisibleFeatures }
							label={ languageId === 0 ? 'Special features' : 'Особые возможности'} />						
						
						<div className={ this.state.visibleFeatures ? 'center' : 'hidden' }>
						</div>						
					</Col>
				</Row>
			</Paper>
		)
	}

}


const mapDispatchToProps = (dispatch) => {
	return {
		pageActions: bindActionCreators(pageActions, dispatch),
	}
}

const mapStateToProps = ({ search }) => ({
  search,
});

export default connect(mapStateToProps, mapDispatchToProps)(Filters);