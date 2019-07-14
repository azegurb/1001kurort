import React from 'react';

import Grid from '../layout/Grid';

const style = {

  content: {
    backgroundColor: '#f7f7f7',
    padding: '20px',
  },

};

function Body({ children }) {
  return (
    <Grid>
      <Grid.Cell style={style.content}>
        {children}
      </Grid.Cell>
    </Grid>
  );
}

export default Body;

