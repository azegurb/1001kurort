import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import { Link } from 'react-router-dom'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import Brightness from 'material-ui/svg-icons/image/brightness-1'
import Stage from 'react-stage';
import axios from 'axios'
import { bindActionCreators } from 'redux';
import * as actions from '../redux/axiosFunctions' 
import { connect } from 'react-redux'

class Shares extends Component {
	
  constructor(props) {
    super(props)
    this.state = {}

    this.titleFontSize = ::this.titleFontSize;
    this.descriptionFontSize = ::this.descriptionFontSize;
  }
  
  componentWillMount(){
    this.props.async.getShares()
  }
    
  titleFontSize(string) {
    const languageId = this.props.languageId - 0;
    let fontSize = 0,
      str = string.length

    if(str <= 10){
      fontSize = 25
    }else if( str > 10 && str <= 15){
      fontSize = 24
    }else if( str > 15 && str <= 20){
      fontSize = 22
    }else fontSize = 20

    return fontSize
  }

  descriptionFontSize(string) {
    const languageId = this.props.languageId - 0;
    let fontSize = 0,
      str = string.length

    if(str <= 15){
      fontSize = 18
    }else if( str > 15 && str <= 30){
      fontSize = 16
    }else if( str > 30 && str <= 60){
      fontSize = 14
    }else fontSize = 12
    
    return fontSize
  }

	render() {
    
    const languageId = this.props.languageId
    const settings = {
      autoplay: true,
      arrows: false,
      dots: false, 
      arrowPrev: '<',
      arrowNext: '>',
      autoplaySpeed: 10000,
      slidesToShow: 1,
      slidesToScroll: 1,
      speed: 500
    };
    const { shares } = this.props.asyncData;

		return(
  			<div>
          <Stage { ...settings }>
              {
                shares.map( (data, index) =>

                  <div style={{ 
                      width: '100%', 
                      height: 300, 
                      position: 'relative', 
                      background: `url(${data.image_url}) 0% 0% / cover no-repeat` 
                    }}>
                    <div style={{ position: 'absolute', width: 200, height: '100%', background: '#3f4040d1', color: '#fff', padding: 10 }}>
                      <h3 style={{ fontSize: this.titleFontSize(languageId === 0 ? data.title : data.title_rus) }}>
                        { languageId === 0 ? data.title : data.title_rus }
                      </h3>
                      <p style={{ fontSize: this.descriptionFontSize(languageId === 0 ? data.description : data.description_rus), wordWrap: 'break-word' }}>
                        { languageId === 0 ? data.description : data.description_rus }
                      </p>
                      <div style={{ position: 'absolute', bottom: 20, width: '100%', left: 0, textAlign: 'center' }}>
                        <a href={data.href_to ? data.href_to : undefined} target='blank'>
                        <RaisedButton 
                          label={ languageId === 0 ? 'Go' : 'Перейти' } 
                          labelColor='#000000'
                          labelStyle={{ fontSize: 18 , top: -6 }}                          
                          style={{ height: 30, lineHeight: '30px', margin: 10 }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>                
                )
              }
          </Stage>
  			</div>
		)
	}
}


const mapDispatchToProps = (dispatch) => {
    return {
        async: bindActionCreators(actions, dispatch)
    }
}

const mapStateToProps = ({ profile, search, asyncData }) => ({
  asyncData,
});

export default connect(mapStateToProps, mapDispatchToProps)(Shares);
