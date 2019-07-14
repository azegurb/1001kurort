import React from 'react';
import ReactDOM from 'react-dom';

import Email from './Email';

import '../inlined.css';

/**
 * This file is not used when rendering the email on the server.
 * It's the perfect place to include mock data for development.
 */

const mockData = {
  first_name: 'Slava',
  last_name: 'Mikhailenko',
  coupon_code: 'a590e95009e1e31058f20f3364fe2435',
  coupon_percent: 35,
  coupon_expiration: null,
};

ReactDOM.render(
  <Email data={mockData} />,
  document.getElementById('root')
);

