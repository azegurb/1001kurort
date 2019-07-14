import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import FullscreenDialog from 'material-ui-fullscreen-dialog'
import TextField from 'material-ui/TextField'
import Popover from 'material-ui/Popover'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import FileDownload from 'material-ui/svg-icons/action/get-app';
import axios from 'axios'
import moment from 'moment'

const initialState = {
	invoices: [],
};

export default class HotelsInvoices extends Component {
	
	constructor(props) {
		super(props);

		this.state = initialState

		this.axiosGetAvailableInvoices = ::this.axiosGetAvailableInvoices;
		this.downloadFile = ::this.downloadFile;
	}

	componentWillMount() {
		this.axiosGetAvailableInvoices()
	}

	axiosGetAvailableInvoices() {
		axios
			.get('/api/invoices',
						{
							params : {
								users_id : this.props.data.users_id
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
	    const {
	    	invoices 
	    } = this.state

		console.log(this.state )		

		return(
				<div>
					<h3>{languageId === 0 ? 'Available invoices': 'Доступные инвойсы'}</h3>
					<Row>
					{ invoices.length ?
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
					: 	<p>{languageId === 0 ? 'Invoices not found': 'Не найдены счета'}</p>}
					</Row>
				</div>

		)
	}
}