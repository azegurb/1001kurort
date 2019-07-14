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
import FileDownload from 'material-ui/svg-icons/action/get-app';
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import CircularProgress from 'material-ui/CircularProgress'


const initialState = {
	hotels: [],
	invoices: [],
	activeSanatoriumId: null
};

export default class AdminInvoices extends Component { 
	
	constructor(props) {
		super(props);

		this.state = initialState
	}

	componentWillMount(){
		this.axiosGetHotels();
	}

	axiosGetHotels() {
		axios
			.get('/api/hotels')
			.then( res => this.setState({ hotels: res.data.data }))
	}

	axiosGetInvoices() {
		axios
			.get('/api/invoices',
						{
							params : {
								users_id : this.state.activeSanatoriumId
							}
						}
			).then( response => this.setState({ invoices: response.data.data }) )
	}

	downloadFile(hotelData, fileName) {
		axios
			.get(`/api/invoices/${hotelData.inv_id}`, {
				params: {
					hotel_id: hotelData.hotel_id,
					start_date: hotelData.start_date,
					end_date: hotelData.end_date,
				},
				responseType: 'arraybuffer',
			})
			.then( response => {
				
				console.log(response.data)

				var a = document.createElement('a');
				var blob = new Blob([response.data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
				url = window.URL.createObjectURL(blob);
				a.href = url;
				a.download = `${fileName}.xlsx`;
				a.click();

			})
	}

	render() {
		const languageId = this.props.languageId - 0;
		
		const { hotels, invoices } = this.state;
		console.log(this.state)

		return(	
			<div>
				<Row>
					<Col xl={6} style={{ marginTop: 15 }}>

						<SelectField
							fullWidth
	          	floatingLabelText={languageId === 0 ? 'Select sanatorium': 'Выберите санаторий'}
	          	value={this.state.activeSanatoriumId}
	          	onChange={(e,i,value) => this.setState({ activeSanatoriumId: value }, this.axiosGetInvoices)}
	          >
	          	{hotels.map( item =>
	          		item.is_verified === 1 &&
	          		<MenuItem primaryText={`${item.h_sname || 'Без названия'}, ${item.email}`} value={item.users_id}/>
	          	)}
	        	</SelectField>
	        </Col>
	      </Row>
				<Row>
				{invoices.length ?
					invoices.map( invoice => 
						<Col xs={4} md={3} xl={2}>
							<FlatButton 
								icon={<FileDownload/>}
								onClick={() => this.downloadFile(invoice, `Report ${moment(`01/${invoice.month}/${invoice.year}}`, 'DD/MM/YYYY').format('MM.YYYY')}`)}
							>
								{languageId === 0 ? 'Report ' : 'Отчет ' +  moment(`01/${invoice.month}/${invoice.year}}`, 'DD/MM/YYYY').format('MM.YYYY')}
							</FlatButton>
						</Col>
					)
				: <Col>
						<p>{languageId === 0 ? 'Invoices not found': 'Не найдены счета'}</p>
					</Col>
				}
				</Row>
			</div>
		)
	}

}