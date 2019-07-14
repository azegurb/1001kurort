import React from 'react';

import Grid from '../layout/Grid';
import Img from './Img';

const style = {

  container: {
    color: '#333',
  },

  confirmContainer: {
    width: 'auto',
    margin: '0 auto',
  },

  title: {
    fontSize: '16px',
    margin: '20px 0 10px 0',
    textAlign: 'center',
  },

  link: {
  	padding: '0px 5px',
  	color: '#007eb4',
  },

  confirmData: {
  	width: '100%',
  	fontSize: '15px',
  	textAlign: 'left'
  },

  warning: {
  	fontSize: '20px',
  	color: '#55c901'
  }

};


function Confirm({ data }) {

  return (
    <Grid style={style.container}>

      <h2 style={style.title}>
      	Здравствуйте, { data.first_name && data.last_name ?  data.first_name + ' ' + data.last_name : 'пользователь' }
      </h2>

      <Grid.Cell>
        <Grid style={style.confirmContainer}>
     		<Grid.Row>
     			<p style={style.confirmData}> 
     				<b style={style.warning}>Не теряйте ваши данные ! </b><br/>
     				 Емейл: <b>{data.email}</b> <br/>
     				 Пароль: <b>{data.password}</b>
     			</p>
     		</Grid.Row>
     		<Grid.Row>
     		    <p>
     		    	Аккаунт успешно создан. Для подтверждения регистрации перейдите по  
     		    	 <a href={data.confirmLink} style={style.link}>ссылке</a>.
     		    </p>
     		</Grid.Row>
        </Grid>
      </Grid.Cell>

      <Grid.Cell>
      </Grid.Cell>
    </Grid>
  );
}

export default Confirm;

