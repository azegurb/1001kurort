import React from 'react';

import Grid from '../layout/Grid';
import Img from './Img';

const logoSrc = 'https://ipic.su/img/img7/fs/logo-big.1511864255.png';

const style = {

  header: {
    margin: '10px auto 20px auto',
    width: 'auto',
  },

  img: {
    height: '200px',
  },

};

function Header() {
  return (
    <Grid style={style.header}>
      <Img style={style.img} src={logoSrc} alt="logo" />
    </Grid>
  );
}

export default Header;

