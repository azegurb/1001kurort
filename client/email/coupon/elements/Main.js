import React from 'react';

import Grid from '../layout/Grid';

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
  }

};


function Confirm({ data }) {

  return (
    <Grid style={style.container}>

      <h2 style={style.title}>
      	Dear, { data.first_name && data.last_name ?  data.first_name + ' ' + data.last_name : 'user' }
      </h2>

      <Grid.Cell>
        <Grid style={style.confirmContainer}>
     		<Grid.Row>
     		    <p>
              Получен купон от 1001 kurort. Вы можете использовать его на последнем этапе бронирования
     		    </p>
     		</Grid.Row>
     		<Grid.Row>
     		    <p style={style.summary}>
					   Скидка: <b style={{ paddingLeft: 15 }}>-{ data.coupon_percent }%</b><br/>
					   Валидный до:  <b style={{ paddingLeft: 15 }}>{data.coupon_expiration ? data.coupon_expiration : 'not limited'}</b>
     		    </p>     		
     		</Grid.Row>
     		<Grid.Row>
     			<p style={style.confirmData}> 
 					Code :
 					<p style={style.coupon}>
 						{data.coupon_code}
 					</p>
     			</p>
     		</Grid.Row>
        </Grid>
      </Grid.Cell>

      <Grid.Cell>
      	<Grid style={style.confirmContainer}>
			<Grid.Row>
				<p style={style.warning}>
					Помните! Вы можете использовать этот купон один раз и только со своего аккаунта
				</p>
			</Grid.Row>
      	</Grid>
      </Grid.Cell>
    </Grid>
  );
}

export default Confirm;

