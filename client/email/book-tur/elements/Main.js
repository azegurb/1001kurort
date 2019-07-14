import React from 'react';
import { Container, Row, Col } from 'react-grid-system';
import moment from 'moment'

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

const style = {

  container: {
    color: '#333',
  },

  confirmContainer: {
    width: 'auto',
  },

  title: {
    fontSize: '16px',
    margin: '20px 0 10px 0',
    textAlign: 'center',
  },

  link: {
    color: '#007eb4',
  },

  confirmData: {
    width: '100%',
    color: 'inherit',
    fontSize: '17px',
    textAlign: 'left',
    paddingLeft: '15px',  
  },

  warning: {
    fontSize: '20px',
    color: '#55c901'
  },

  summary: {
    paddingLeft: '15px',    
    fontSize: '14px',
    color: '#007db4'
  },

  coupon: {
    display: 'inline-block',
    color: '#585857',
    paddingLeft: '10px',
  },

  sanatorium_title: {
    margin: '0px',
    fontSize: '20px',
  },

  address: {
    marginTop: '2px',
    fontSize: '14px',
  },

  gold_stars: {
    color: '#ffa430'
  },

  sanatorium_logo: {
    maxHeight: 300,
    width: '100%',
  },

  strong_black: {
    color: '#000',
    fontWeight: '800',
  },

};


function Confirm({ data }) {

  return (
    <div style={style.container}>
      <Row>
        <Col xs={12}>         
          <h4 style={{ textAlign: 'center' }}>{data.turData.name}</h4>
          <p>Взрослых - {data.adults}, детей - {data.children}, младенцев - {data.babies}</p>
          <p>Даты: {moment(data.arrival).format('DD.MM.YYYY')} - {moment(data.departure).format('DD.MM.YYYY')} </p>
          <p>Цена: {data.total_price} {currency[data.currency]}</p>
        </Col>
      </Row>

    </div>
  );
}

export default Confirm;

