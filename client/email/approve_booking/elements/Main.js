import React from 'react';
import { Row, Col } from 'react-grid-system';

const style = {

  container: {
    padding: '0px 50px',
    color: '#333',
  },

  warning: {
  	fontSize: '20px',
  	color: '#55c901'
  },

  coupon: {
  	display: 'inline-block',
  	color: '#585857',
  	paddingLeft: '10px',
  },

  small: {
    fontSize: 14,
    fontWeight: 700,
  }

};


function Confirm({ data }) {

  return (
    <div style={style.container}>
      <Row>
        <Col>
          <h2 style={{ color: '#55c901' }}>ID заказа: { data.order_id}</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <p style={style.small}>Комментарий администрации: </p>
          <p>{ data.comment }</p>
        </Col>
      </Row>
      <Row>
        <Col style={{ textAlign: 'center' }}>
          <p style={style.small}>
            {
              data.status === 1 
              ? 'Спасибо, что пользуетесь услугами 1001 kurort'
              : 'Бронирование отменено, но вы можете найти другие варианты на 1001 kurort' 
            }
          </p>
        </Col>
      </Row>
    </div>
  );
}

export default Confirm;

