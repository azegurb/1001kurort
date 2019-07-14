import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import { Link } from 'react-router-dom'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import Brightness from 'material-ui/svg-icons/image/brightness-1'
import axios from 'axios'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'
import { connect } from 'react-redux'
import moment from 'moment'
import Slider from 'react-slick';

const queryString = require('query-string');


class SearchByTreatment extends Component {
	
  constructor(props) {
    super(props);

    this.state =  {
    	treatmentSearchData: this.props.treatmentSearchData,
      windowWidth: 770
    }

    this.updateWidth = ::this.updateWidth;
  }

  updateWidth() {
      this.setState({ windowWidth: window.innerWidth });
  }

  componentDidMount() {
    if(window !== 'undefined'){
      this.setState({ windowWidth: window.innerWidth })
      window.addEventListener('resize', this.updateWidth );
    }
  }
    
  componentWillUnmount(){
    window.removeEventListener('resize', this.updateWidth)
  }

	render() {
    const languageId = this.props.languageId - 0;
    var settings = {
      dots: false,
      infinite: true,
      autoplay: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
          }
        },
        {
          breakpoint: 700,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };
    const imgStyle = {
      display: 'block',
      margin: 'auto',
      maxWidth: 200,
      height: 140,
      borderRadius:  7,
    };

    const textStyle = {
      fontSize: 16,
      display: 'block',
      textAlign: 'center',
    };

    let values = { 
        by_treatm: true, 
        k_id: this.props.kurorts[0], 
        kur_or_san: null,
        rooms: JSON.stringify([{adults: 2, childs: 0, childs_age: []}]), 
        start_date: moment(new Date() ).format('YYYY-MM-DD'), 
        end_date: moment( new Date(), 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD'),
        nights: 1, 
        before_arr: 0,
        shareRoom: false,
    }

		return(
  			<div>
          <h3>{ languageId === 0 ? 'Search for sanatoriums by treatment profile' : 'Поиск санаториев по профилю лечения'}</h3>
          <Divider style={{ marginBottom: 10 }}/>

          <div style={{ margin: 20 }}>
            <Slider {...settings}>
              {this.state.treatmentSearchData.map( (data, index) =>
                <div key={index}>
                  <img key={index} src={data.img || ''} style={imgStyle} />
                  <Link to={{ pathname: '/search', search: queryString.stringify(Object.assign({}, values, { t_id: data.id })) }} style={textStyle}>
                    { languageId === 0 ? data.name : data.name_ru }
                  </Link>
                </div>
              )}
            </Slider>
          </div>
        </div>
		)
	}
}

const mapStateToProps = ({ profile, search }) => ({
  profile,
  search
});

export default connect(mapStateToProps, null)(SearchByTreatment);