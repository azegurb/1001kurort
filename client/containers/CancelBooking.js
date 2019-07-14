import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import axios from 'axios'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import base64 from 'base-64';

const initialState = {
	requestDone: false				
}


function mapStateToProps(state) {
    return {
        profile: state.profile,
        search: state.search
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(pageActions, dispatch)
    }
}

@connect(mapStateToProps, mapDispatchToProps)

export default class CancellBooking extends Component { 
	
	constructor(props) {
		super(props);

		this.state = initialState
	}

	componentWillMount(){
	    this.props.pageActions.updateIsLoadingPage(true);

	    axios.post('/api/booking/cancel',{
			enc_order_id: this.props.match.params.id
		}).then( response => {

			console.log(response)
			if(response.status === 200){
				this.setState({ requestDone: true, errorCancel: false, order_id: response.data.order_id })
			}else this.setState({ requestDone: true, errorCancel : true })
		})
	}

	componentDidMount(){
	    this.props.pageActions.updateIsLoadingPage(false);

	    axios.post('/api/booking/cancel',{
			enc_order_id: this.props.match.params.id
		}).then( response => {

			console.log(response)
			if(response.status === 200){
				this.setState({ requestDone: true, errorCancel: false, order_id: response.data.order_id })
			}else this.setState({ requestDone: true, errorCancel : true })
		})
	}

	render() {
		const languageId = this.props.profile.languageId - 0;
	    const url = process.env.API_URL + this.props.location.pathname
	
		return(	
			<div style={{ marginTop: 150, textAlign: 'center' }}>
				{
					!this.state.requestDone
					? 	<h1>Запрос обрабатывается...</h1>
					: 	!this.state.errorCancel
						?	<div>
								<h1>
								{
									languageId === 0 
									? 'Reservation canceled successfully'
									: 'Бронирование успешно отменено'
								}
								</h1>
								<p>{ languageId === 0 ? `Order # ${this.state.order_id} is not exist now` : `Заказ # ${this.state.order_id} больше не существует` }</p>
							</div>
						:	<div>
								<h1>{ languageId === 0 ? 'Order not found' : 'Бронирование не найдено' }</h1>
								<p>{ 
									languageId === 0 
									? 'Сheck the correctness of the link or email us at sales@1001kurort.com' 
									: 'Проверьте правильность ссылки или напишите нам на почту sales@1001kurort.com' 
								}</p>
							</div>
				}
			</div>
		)
	}

}