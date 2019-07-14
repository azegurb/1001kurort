import React from 'react';

import Grid from './layout/Grid';
import Header from './elements/Header';
import Title from './elements/Title';
import Body from './elements/Body';
import Main from './elements/Main';
import Footer from './elements/Footer';

const style = {

  container: {
    backgroundColor: '#fff',
    padding: '20px 0',
    fontFamily: 'sans-serif',
  },

  main: {
    maxWidth: '1000px',
    width: '100%',
  },

};

function Email({ data }) {
  return (
    <center style={style.container}>
      <Grid style={style.main}>
        <Header />
        <Body>
          <Title> Бронирование с подселением </Title>
          <Main data={data} />
        </Body>
        <Footer />
      </Grid>
    </center>
  );
}

export default Email;

