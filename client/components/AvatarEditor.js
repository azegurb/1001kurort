import React, { Component}  from 'react'
import ReactDom from 'react-dom'

import axios from 'axios'

export default class AvatarEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      img: null,
    }

    this.uploadImageToSite = ::this.uploadImageToSite;

  }

  componentWillMount() {

    this.setState({ 
      img : this.props.src || 
        ( this.props.account_type == 1 && '/images/user_default.png' ) ||
        ( this.props.account_type == 2 && '/images/doctor_default.png' ) ||
        ( this.props.account_type == 3 && '/images/hotel_default.png' )
    }) 
  }

  uploadImageToSite(e) {
    let reader = new FileReader();
    let file = e.target.files[0];

    if (!file) return;

    reader.onload = function(img) {
      const data = new FormData();
      let uploadedImage = img.target.result.replace(/^[^,]*,/,'')

      this.props.handleAvatar(uploadedImage)
      this.setState({ uploadedImage: img.target.result })
    }.bind(this);
    reader.readAsDataURL(file);
  }


  render () {

    const style = {
      
      container: {
        position: 'relative',
        margin: '0 auto',
        paddingTop: 10,
        border: '1px solid',
        height: 200,
        width: 200,
        display: 'table-cell', 
        verticalAlign: 'middle',    
      },

      camera: {
        position: 'absolute',
        left: 60,
        top: 60,
        color: '#00000091',
      },

      img: {
        width: '100%',
      },

    }

    return (
        <div style={style.container}>
          <input className='hidden' id='in' type='file' accept='image/*' onChange={ ::this.uploadImageToSite }/>
          <label htmlFor='in' className={ !this.props.disabled ? '' : 'hidden'} style={style.camera}>
            <i className='fa fa-camera fa-5x'></i>
          </label>
          <img src={this.state.uploadedImage || this.state.img } style={style.img} />
        </div>
    );
  }
}