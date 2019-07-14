import React from 'react';

import Grid from '../layout/Grid';

const style = {

  footer: {
    margin: '20px 0',
  },

  p: {
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
    color: '#607D8B',
    textAlign: 'center',
  },

  a: {
    color: '#00a1ef',
  },

  small: {
    cursor: 'pointer',
    textDecoration: 'underline',
  }

};

function Footer() {
  return (
    <Grid style={style.footer}>
      <Grid.Cell style={style.content}>
        <p style={style.p}>
          With respect, team 1001kurort, we ask on <b style={style.small}>sales@1001kurort.com</b>        
        </p>        

      </Grid.Cell>
    </Grid>
  );
}

export default Footer;

