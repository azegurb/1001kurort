import React from 'react';
import { Container, Row, Col } from 'react-grid-system';

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
        <Col xs={4} style={{ textAlign: 'center' }}>         
            <p style={style.sanatorium_title}>
              <b style={{ paddingRight: 10 }}>{ data.sanatorium.name || 'Аллах' }</b>
              <b style={ data.sanatorium.stars > 0 ? style.gold_stars : {} }>&#9733;</b>
              <b style={ data.sanatorium.stars > 1 ? style.gold_stars : {} }>&#9733;</b>
              <b style={ data.sanatorium.stars > 2 ? style.gold_stars : {} }>&#9733;</b>
              <b style={ data.sanatorium.stars > 3 ? style.gold_stars : {} }>&#9733;</b>
              <b style={ data.sanatorium.stars > 4 ? style.gold_stars : {} }>&#9733;</b>
            </p>              
            <p style={style.address}>{ data.sanatorium.address || 'Нет адреса' }</p>
            <img src={data.sanatorium.logo} alt='Booked sanatorium logo' style={style.sanatorium_logo} title={data.sanatorium.name}/>
        </Col>
        <Col xs={4} style={{ marginTop: 35 }}>
            <p>Заезд : {data.arrival}</p>
            <p>Выезд : {data.departure}</p>
            <p>Кл-во номеров : {data.rooms}</p>
            <p>Гостей : {data.guests}</p>
            <p>Ночей : {data.nights}</p>
        </Col>
        <Col xs={4} style={{ marginTop: 45 }}>
            <b>1-ый гость</b>
            <p>Почта : {data.contacts1.email ? data.contacts1.email : ' - '}</p>
            <p>Полное имя : {data.contacts1.first_name + ' ' + data.contacts1.last_name}</p>
            <p>Телефон : {data.contacts1.phone ? data.contacts1.phone : ' - '}</p>

            <b>2-ый гость</b>
            <p>Почта : {data.contacts2.email ? data.contacts1.email : ' - '}</p>
            <p>Полное имя : {data.contacts2.first_name + ' ' + data.contacts2.last_name}</p>
            <p>Телефон : {data.contacts2.phone ? data.contacts2.phone : ' - '}</p>
        </Col>
      </Row>

      <Row>
        <Col>
            <h1 style={style.title}>Бронируемые номера</h1>
        </Col>
      </Row>
     
      <Row>
        <Col>
            {data.roomsInfo.map( room =>
              <div>
                <h4>Номер: { room.s_name }</h4>
                <p> 
                  { room.treatment_incl ? 'лечение включено' : 'лечение не включено' },
                  питание: { room.meal_plan.map( item => item === 'breakfast' ? 'Завтрак,' : item === 'dinner' ? 'обед,' : 'ужин' ) }
                </p>
              </div>
            )}
        </Col>
      </Row>
     
      <Row style={{ marginTop: 15 }}>
        <Col>
            { data.tur_data 
              ? <div>
                  <h4>Тур:</h4>
                  <p>{data.tur_data.name} - {data.tur_data.prices[data.currency]} {currency[data.currency]}</p>
                </div>
              : ''
            }
        </Col>
      </Row>
     
      <Row style={{ marginTop: 15 }}>
        <Col>
            { data.transfer_data 
              ? <div>
                  <h4>Трансфер:</h4>
                  <p>{ data.transfer_data.arrival_map && data.transfer_data.arrival_map.name } - { data.transfer_data.departure_map && data.transfer_data.departure_map.name }, {data.transfer_data.prices[data.currency]} {currency[data.currency]}</p>
                </div>
              : ''
            }
        </Col>
      </Row>
      
      <Row>
        <Col>
          <h3 style={{ color: '#55c901' }}>{
            data.share_room
            ?   'Вы можете разделить этот номер с другим гостем, при этом вам нужно будет заплатить 50% общей цены'
            :   ''
          }</h3>
        </Col>
      </Row>

      <Row>
        <Col>
            <h1 style={{ padding: 10, color: '#007db4' }}>Итоговая цена: {data.total_price} {currency[data.currency]}</h1>
            <p style={{ paddingLeft: 10 }}>Способ оплаты: {data.payments === 0 ? 'при поселении' : 'оплата картой' }</p>
        </Col>
      </Row>
      
      <Row>
        <Col style={{ textAlign: 'center' }}>
          <p style={style.strong_black}>
            Ваше бронирование успешно завершено! Благодарим, что пользуетесь услугами 1001kurort
          </p>
        </Col>
      </Row>

    </div>
  );
}

export default Confirm;

