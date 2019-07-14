import React, { Component } from 'react'
import FlatButton from 'material-ui/FlatButton'
//import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import { bindActionCreators } from 'redux' 
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import { Container, Row, Col } from 'react-grid-system'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'

function mapStateToProps(state) {
	return {
		search: state.search
	}
}

function mapDispatchToProps(dispatch) {
	return {
		pageActions: bindActionCreators(pageActions, dispatch)
	}
}

@connect(mapStateToProps, mapDispatchToProps)

export default class SearchOption extends Component {

	constructor(props) {
		super(props)

		this.state = {
			SexValue : 1
		}

		this.onDetailedSearchClick = ::this.onDetailedSearchClick;
		this.searchMinPriceSet = ::this.searchMinPriceSet;
		this.searchMaxPriceSet = ::this.searchMaxPriceSet;
		this.changeSex = ::this.changeSex;
	}

	onDetailedSearchClick() {
		this.props.pageActions.setSearchOptionVis( this.props.search.searchOptionVis == 'hidden' ?  'block' :  'hidden' ) 
	}

	searchMinPriceSet() {
		this.props.pageActions.setSearchMinAgeValue( document.getElementById('searchMinPrice').value )
	}

	searchMaxPriceSet() {
		this.props.pageActions.setSearchMaxAgeValue( document.getElementById('searchMaxPrice').value )
	}
  
	changeSex(event, index, SexValue){ 
		this.setState({SexValue})
	}

	render(){	
		const { search } = this.props

		return(
			<div className='center'>
				<div id='filtersSearch' >
				</div>
				<FlatButton onClick={::this.onDetailedSearchClick}label='Расширенный поиск' className='center' />
				<Divider />
				<div className={'left-align ' + search.searchOptionVis}>
					<Container>
						<Row style={{}}>
							<Col xs={6} sm={5} md={4} xl={4} lg={4} >
								<h4> Пол </h4>
									<SelectField 
										value={this.state.SexValue}
										onChange={ ::this.changeSex}
										style={{ width: 150 }} 
									>
										<MenuItem value={1} primaryText='Любой' />
										<MenuItem value={2} primaryText='Мужской' />
										<MenuItem value={3} primaryText='Женский' />
									</SelectField>
							</Col>
							<Col xs={6} sm={7} md={8} xl={8} lg={8} >
								<h4> Возраст </h4>
								
								<label>От
								<TextField 
									id='searchMinPrice' 
									defaultValue={search.searchMinPrice} 
									style={{ width: 45, padding: 0, marginLeft: '15px', marginRight : '15px' }} 
									onBlur={::this.searchMinPriceSet} /></label>
								<label>От
								<TextField 
									id='searchMaxPrice' 
									defaultValue={search.searchMaxPrice} 
									style={{ width: 45, padding: 0 , marginLeft: '15px', marginRight : '15px' }} 
									onBlur={::this.searchMaxPriceSet} /></label>
							</Col>							
						</Row>						
					</Container>
				</div>
				<Divider />
			</div>
		)
	}
}