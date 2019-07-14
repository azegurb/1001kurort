const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');
const Path = require('path');




const STYLE_TAG = '%STYLE%';
const CONTENT_TAG = '%CONTENT%';


function getFile(relativePath) {
  return new Promise((resolve, reject) => {
    const path = Path.join(__dirname, relativePath);

    return fs.readFile(path, { encoding: 'utf8' }, (err, file) => {
      if (err) return reject(err);
      return resolve(file);
    })
  });
}


function createEmail(data, emailType) {
  return Promise.all([
    getFile('../../client/email/inlined.css'),
    getFile('./email.html'),
  ])
  .then(([style, template]) => {

    let Email = '../../client/email/confirm_reg/index';

    if(emailType === 'reg-confirm'){
      Email = '../../client/email/confirm_reg/Email';
    }else if( emailType === 'get-coupon'){
      Email = '../../client/email/coupon/Email';        
    }else if( emailType === 'create-booking'){
      Email = '../../client/email/booking/Email'
    }else if( emailType === 'approve-booking'){
      Email = '../../client/email/approve_booking/Email'
    }else if( emailType === 'approve-booking-share'){
      Email = '../../client/email/approve_booking_share/Email'      
    }else if( emailType === 'book-tur'){
      Email = '../../client/email/book-tur/Email'
    }

      Email = require(Email).default

      const emailElement = React.createElement(Email, { data });
      const content = ReactDOMServer.renderToStaticMarkup(emailElement);

      // Replace the template tags with the content
      let emailHTML = template;
      emailHTML = emailHTML.replace(CONTENT_TAG, content);
      emailHTML = emailHTML.replace(STYLE_TAG, style);

      return emailHTML;
  })

}

module.exports = createEmail;
