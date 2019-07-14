import React from 'react';
import ReactDOM from 'react-dom';

import Email from './Email';

/**
 * This file is not used when rendering the email on the server.
 * It's the perfect place to include mock data for development.
 */

const mockData = {
  first_name: 'Slava',
  last_name: 'Mikhailenko',
  email: 'prostoslavan@gmail.com',
  password: '21101997',
  confirmLink: 'https://chingis.herokuapp.com/account/confirm/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X3R5cGUiOjEsImVtYWlsIjoicHJvc3Rvc2xhdmFuQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiMjEiLCJpYXQiOjE1MTE4NTkxMzYsImV4cCI6MTUxMTg3NzEzNn0.Zgnt-C5Vrnlee5P7QI6mU5achYC64W_EYbSOsgCMsVg ',
};

ReactDOM.render(
  <Email data={mockData} />,
  document.getElementById('root')
);

