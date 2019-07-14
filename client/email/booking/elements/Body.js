import React from 'react';

import Grid from '../layout/Grid';

const style = {

  content: {
    backgroundColor: '#f7f7f7',
    padding: '20px',
  },

  children: {
    maxWidth: 550,
    margin: 'auto'
  },

};

function Body({ children }) {
  return (
    <Grid>
      <Grid.Cell style={style.content}>
        <div style={style.children}>{children}</div>
      </Grid.Cell>
    </Grid>
  );
}

export default Body;

