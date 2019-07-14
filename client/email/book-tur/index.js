import React from 'react';
import ReactDOM from 'react-dom';

import Email from './Email';

import './inlined.css';

/**
 * This file is not used when rendering the email on the server.
 * It's the perfect place to include mock data for development.
 */

const mockData = {
  roomsInfo: [
    { sname: 'Люкс', category_name: 'BB', treatment_incl: false, meal_plan: ['breakfast'] },
    { sname: 'Cтандарт', category_name: 'BB + treatment', treatment_incl: true, meal_plan: ['breakfast', 'dinner', 'supper'] }
  ],
  sanatorium:{
  	name: 'Аллах',
  	stars: 4,
  	address: 'Азербайджан, Баку',
  	logo: 'https://i.ytimg.com/vi/UsoYA94Aeig/maxresdefault.jpg',
  },
  contacts: {
  	email: 'prostoslavan@gmail.com',
  	first_name: 'Slava',
  	last_name: 'Mikhailenko',
  	phone: '+38(063)-33-49-269',
  },
  arrival: '20-10-2018',
  departure: '24-10-2018',
  rooms: 2,
  nights: 4,
  link_cancel_order: 'http://localhost:3000',
  total_price: 440,
  currency: 0,
  payments: 0,
  share_room: 0,
};

ReactDOM.render(
  <Email data={mockData} />,
  document.getElementById('root')
);

