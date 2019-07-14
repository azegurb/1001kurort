import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender} from 'react-grid-system'
import Checkbox from 'material-ui/Checkbox'
import AutoComplete from 'material-ui/AutoComplete'
import Paper from 'material-ui/Paper'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField';
import {withRouter} from 'react-router-dom'
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import { extendMoment } from 'moment-range'
import { bindActionCreators } from 'redux';
import * as pageActions from '../../redux/actions/PageActions'
import * as actions from '../../redux/axiosFunctions' 
import { connect } from 'react-redux'

import BookingCalendar from '../BookingCalendar'

const queryString = require('query-string');
const momentRange = extendMoment(moment)


const default_rooms = [{adults: 2, childs: 0, childs_age: []}];

const initialState = {
    rooms: default_rooms,
    searchByTreatment: false,
    treatmentProfileId: [],
    kurortId: null,
    diseasesProfilesNames: [],
    sanatoriumKurortHotelsNames: [],
    kurortOrSanatorium: null,
    filtersValues: null,
    timerOutToSearch: null,
};

const ages = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];

const childs = [
  ['0','0'],
  ['1','1'],
  ['2','2 '],
  ['3','3'],
  ['4','4'],
  ['5','5+'],
];

class BookingForm extends Component {
   
    constructor(props) {
      super(props);

      this.state = Object.assign({}, initialState, { filtersValues: _.cloneDeep(this.props.search.filtersValues) })
      
      this.handleSearch = ::this.handleSearch;
      this.handleChangeRoomQuantity = ::this.handleChangeRoomQuantity;
      this.handleChangeProfileTreatment = ::this.handleChangeProfileTreatment;
      this.handleChangeKurort = ::this.handleChangeKurort;
      this.handleChangeChildsQuantity = ::this.handleChangeChildsQuantity;
      this.handleChangeAdultsQuantity = ::this.handleChangeAdultsQuantity;
      this.handleChangeChildsAge = ::this.handleChangeChildsAge;
    }

    componentDidMount(){
      
      let sanatoriumKurortHotelsNames = [],
          diseasesProfilesNames = [],
          values = []

      const params = queryString.parse(this.props.location.search)

      axios.all([this.axiosGetCountriesKurortsNames(), this.axiosGetHotelsNames(), this.axiosGetDiseasesProfilesNames()])
        .then(axios.spread( (countriesKurorts, hotels, diseaseProfiles ) => { 
            diseasesProfilesNames = _.sortBy(diseaseProfiles.data.data, this.props.languageId === 0 ? 'name' : 'name_ru' )
            hotels.data.data.map( item => { if(item.h_sname) sanatoriumKurortHotelsNames.push({ id: item.id, name: item.h_sname, name_ru: item.h_sname_ru, is_kurort: false }) })
            countriesKurorts.data.kurorts.map( item => sanatoriumKurortHotelsNames.push({ id: item.id, name: item.kurort, name_ru: item.kurort_ru, is_kurort: true }))

            this.setState({
              searchByTreatment: params.by_treatm ? Boolean(params.by_treatm === 'true') : false, 
              treatmentProfileId: _.isArray(params.t_id) ? params.t_id.map(item => parseInt(item)) : params.t_id ? [parseInt(params.t_id)] : [],
              kurortId: params.k_id ? parseInt(params.k_id) : null,
              kurortOrSanatorium: params.kur_or_san ? params.kur_or_san : null,
              rooms: params.rooms ? JSON.parse(params.rooms) : default_rooms,              
              start_date: params.start_date ? params.start_date : new Date(),
              end_date: params.end_date ? params.end_date : moment( new Date(), 'YYYY-MM-DD').add(1, 'd').toDate(),
              nights: params.start_date && params.end_date ? momentRange.range(params.start_date, params.end_date).diff('days') : 1,
              before_arrive: params.start_date && params.end_date ? moment.range( Date.now() , params.end_date).diff('days') : 0,
              shareRoom: params.childs == 0 && ( params.adults == 2 && params.shareRoom == 'true' ) ? params.shareRoom : false,
              diseasesProfilesNames, 
              sanatoriumKurortHotelsNames,
            })
        }))
        .catch( err => console.log(err))
    }

    componentWillReceiveProps(nextProps){

      if(!_.isEqual(nextProps.search.filtersValues, this.state.filtersValues)){

        clearTimeout(this.state.timerOutToSearch)

        const timerOutToSearch = setTimeout( () =>
          this.handleSearch()
        , 1100 )

        this.setState({ timerOutToSearch, filtersValues: _.cloneDeep(nextProps.search.filtersValues) })
      }

    }

    axiosGetCountriesKurortsNames() {
      return  axios.get(process.env.API_URL || '' + '/api/countries-kurorts-names')
    }

    axiosGetHotelsNames() {
      return  axios.get(process.env.API_URL || '' + '/api/hotels-names')
    }

    axiosGetDiseasesProfilesNames() {
      return  axios.get(process.env.API_URL || '' + '/api/disease-profiles-names')
    }


    handleSearch() {
      let searchByTreatment = this.state.searchByTreatment,
          treatmentProfileId = this.state.treatmentProfileId,
          kurortId = this.state.kurortId,
          kurortOrSanatorium = this.state.kurortOrSanatorium,
          rooms = JSON.stringify(this.state.rooms),
          startDate =  moment(this.state.start_date).format('YYYY-MM-DD'),
          endDate = moment(this.state.end_date).format('YYYY-MM-DD'),
          nights = this.state.nights,
          daysBeforeArrive = this.state.before_arrive || 0 ,
          shareRoom = rooms.length === 1 && rooms[0].childs == 0 && rooms[0].adults == 1 ? this.state.shareRoom : false

      if( rooms && (searchByTreatment && treatmentProfileId && kurortId) || (!searchByTreatment && kurortOrSanatorium) ){
        
        let values = { 
          by_treatm: searchByTreatment, 
          t_id: treatmentProfileId, 
          k_id: kurortId, 
          kur_or_san: kurortOrSanatorium, 
          rooms: rooms, 
          start_date: startDate, 
          end_date: endDate, 
          nights: nights, 
          before_arr: daysBeforeArrive,
          shareRoom: shareRoom,
        }

        Object.assign(values, this.props.search.filtersValues || {} )
        const { history } = this.props
        const stringified = queryString.stringify(Object.assign(values, this.props.search.filtersValues || {} ));

        history.push({ pathname: '/search', search: stringified })

      }else this.setState({ errorMainFilter: true })

    }

    handleChangeRoomQuantity(event, index, value){ 
      let rooms = []
      
      var i = 0;
      while (i < value) {
        rooms.push({
          adults: 2,
          childs: 0,
          childs_age: []
        })
        i++;
      }; 

      this.setState({ 
        rooms,
      });
    }

    handleChangeProfileTreatment(event, index, value){ 
      this.setState({ treatmentProfileId : value });
    }

    handleChangeKurort(event, index, value){
      this.setState({ kurortId : value });
    }

    handleChangeAdultsQuantity(roomIndex, value){
      let { rooms } = this.state

      rooms[roomIndex].adults = value

      this.setState({ rooms });
    }

    handleChangeChildsQuantity(roomIndex, value){
      let { rooms } = this.state;
      
      rooms[roomIndex].childs = value;
      rooms[roomIndex].childs_age = new Array(value).fill(undefined);

      this.setState({ rooms });
    }


    handleChangeChildsAge(roomIndex, index, value){
      let { rooms } = this.state

      rooms[roomIndex].childs_age[index] = value

      this.setState({ rooms })
    }

    menuItemsChilds(childsAge, languageId) {
      return ages.map((name) => (
        <MenuItem
          key={name[languageId]}
          insetChildren={true}
          checked={childsAge && childsAge.indexOf(name[languageId]) > -1}
          value={name[languageId]}
          primaryText={name[languageId]} />
      ));
    }

    render() {

        const languageId = this.props.profile.languageId - 0;
        const { adultsQuantity, childsQuantity, childsAge, rooms } = this.state;
        console.log(this.state)

        return(
                <Paper zDepth={1} className='paper' style={{ margin: 15, background: '#f3be19', border: '1px solid #bbb9b9' }}>
                  {!this.state.searchByTreatment
                    ? <Row>
                        <Col> 
                          <label style={{ display: 'initial' }} >
                            <i className='fa fa-search fa-2x' aria-hidden='true' style={{ top: '13px', position: 'absolute', fontSize: '21px' }} />
                            <AutoComplete
                              fullWidth
                              errorText={ this.state.errorMainFilter && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                              hintText={languageId === 0 ? 'Enter the name of the resort or sanatorium' : 'Введите название курорта или санатория'}
                              searchText={this.state.kurortOrSanatorium}
                              onUpdateInput={ (kurortOrSanatorium) => this.setState({ kurortOrSanatorium, errorMainFilter: false, focusedAutocomplete: false  }) }
                              dataSource={this.state.sanatoriumKurortHotelsNames}
                              dataSourceConfig={{
                                text: ! /[а-я]/i.test(this.state.kurortOrSanatorium) ? 'name' : 'name_ru',
                                value: 'id',
                              }}
                              maxSearchResults={6}
                              filter={AutoComplete.caseInsensitiveFilter}
                              openOnFocus={true}
                              underlineFocusStyle={{ borderColor: '#5d5252' }}
                              underlineStyle={{ borderBottomWidth: 2 }}
                              hintStyle={{ left: '40px' }}
                              inputStyle={{ left: '40px' }}                                     
                            />

                        </label>

                        {this.state.kurortOrSanatorium && this.state.kurortOrSanatorium.length && 
                          <i className="fa fa-2x fa-times" 
                           title='Reset' 
                           aria-hidden="true"
                           style={{ top: 3, right: 20, position: 'absolute', cursor: 'pointer', zIndex: 100, padding: 5 }} 
                           onClick={() => this.setState({ kurortOrSanatorium: '', errorMainFilter: false }) } />}
                        </Col>
                      </Row>
                    : <Row>

                          <Col xs={12}>

                            <label style={{ display: 'initial', maxWidth: '100%' }} >
                                <i className='fa fa-search fa-2x' aria-hidden='true' style={{ top: '13px', position: 'absolute', fontSize: '21px' }}></i>
                                <SelectField
                                  multiple
                                  fullWidth
                                  hintText={languageId === 0 ? 'Treatment profile' : 'Профиль лечения'}
                                  errorText={ this.state.errorMainFilter && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                                  value={ this.state.treatmentProfileId }
                                  onChange={this.handleChangeProfileTreatment}
                                  hintStyle={{ left: '40px' }}
                                >
                                  {
                                    this.state.diseasesProfilesNames.map( (item, index) => 
                                      <MenuItem 
                                        key={item.id}
                                        insetChildren={true}
                                        checked={this.state.treatmentProfileId.indexOf(item.id) > -1}
                                        className="menu-form-item" 
                                        value={item.id} 
                                        primaryText={ languageId === 0 ? item.name : item.name_ru} />
                                    )
                                  }
                                </SelectField>                                

                            </label>

                          </Col>  

                          <Col xs={12}>
                            <label style={{ display: 'initial' }} >
                                <i className='fa fa-search fa-2x' aria-hidden='true' style={{ top: '13px', position: 'absolute', fontSize: '21px' }}></i>
                                
                                <SelectField
                                  fullWidth
                                  hintText={ languageId === 0 ? 'Kurorts' : 'Курорты' }
                                  errorText={ this.state.errorMainFilter && ( languageId === 0 ? 'Invalid value' : 'Неверное значение') } 
                                  value={ this.state.kurortId }
                                  onChange={this.handleChangeKurort}
                                  hintStyle={{ left: '40px' }}
                                >
                                  {
                                    this.state.sanatoriumKurortHotelsNames.map( (item, index) => 
                                      item.is_kurort && <MenuItem 
                                                          key={item.id}
                                                          insetChildren={true}
                                                          checked={this.state.kurortId === item.id }
                                                          className="menu-form-item" 
                                                          value={item.id} 
                                                          primaryText={ languageId === 0 ? item.name : item.name_ru} />
                                    )
                                  }
                                </SelectField>

                            </label>                                
                          </Col>

                      </Row>}
                  <Row>
                    <Col style={{ fontSize: 13, color: 'white', cursor: 'pointer', }}>
                      {
                        !this.state.searchByTreatment 
                          ? <p onClick={ () => this.setState({ searchByTreatment: true, kurortId: null, errorMainFilter: false }) }>
                              { languageId === 0 ? 'Search by treatment profile': 'Поиск по профилю лечения' }
                            </p>
                          : <p onClick={ () => this.setState({ searchByTreatment: false, treatmentProfileId: [], errorMainFilter: false  }) }>
                              { languageId === 0 ? 'Search by kurorts': 'Поиск по курортам' }
                            </p> 
                      }
                    </Col>
                  </Row>                        
                  <BookingCalendar 
                    languageId={languageId}
                    params={ this.props.location.search } 
                    updateDates={ (start_date,end_date, nights) => this.setState({ start_date, end_date, nights }) } />
                  {rooms.length > 1 ?
                  <div>
                  <Row>
                    <Col xs={12}>

                        <SelectField
                          fullWidth
                          style={{ textAlign: 'left' }}
                          value={rooms.length}
                          floatingLabelText={languageId === 0 ? 'Rooms' : 'Номеров'}
                          onChange={this.handleChangeRoomQuantity}
                        >
                            <MenuItem className="menu-form-item" value={1} primaryText={1} />
                            <MenuItem className="menu-form-item" value={2} primaryText={2}/>
                            <MenuItem className="menu-form-item" value={3} primaryText={3} />                                    
                            <MenuItem className="menu-form-item" value={4} primaryText={4} />
                            <MenuItem className="menu-form-item" value={5} primaryText={5} />
                        </SelectField>                                
                    </Col>
                  </Row>
                  {rooms.map( (item,roomIndex) => 
                  <div>  
                    <Row>
                      <Col xl={3}>
                        <p style={{ margin: 10, marginTop: 22 }}>{languageId === 0 ? `Room ${roomIndex+1}`:`Номер ${roomIndex+1}`}</p>
                      </Col>
                      <Col xl={5}>
                          <SelectField
                            key={roomIndex+1}
                            fullWidth
                            style={{ textAlign: 'left' }}
                            value={item.adults}
                            floatingLabelText={languageId === 0 ? 'Adults' : 'Взрослых'}
                            onChange={(event, index, value) => this.handleChangeAdultsQuantity(roomIndex, value)}
                          >
                              <MenuItem className="menu-form-item" value={1} primaryText={1} />
                              <MenuItem className="menu-form-item" value={2} primaryText={2}/>
                              <MenuItem className="menu-form-item" value={3} primaryText={3} />                                    
                              <MenuItem className="menu-form-item" value={4} primaryText={4} />
                              <MenuItem className="menu-form-item" value={5} primaryText={5} />     
                              <MenuItem className="menu-form-item" value={6} primaryText={6} />     
                              <MenuItem className="menu-form-item" value={7} primaryText={7} />     
                              <MenuItem className="menu-form-item" value={8} primaryText={8} />     
                              <MenuItem className="menu-form-item" value={9} primaryText={9} />     
                              <MenuItem className="menu-form-item" value={10} primaryText={10} />                               
                          </SelectField>
                      </Col>
                      <Col xl={4}> 
                          <SelectField
                            key={roomIndex+1}
                            fullWidth
                            style={{ textAlign: 'left' }}
                            floatingLabelText={languageId === 0 ? 'Child\'s' : 'Детей'}
                            value={item.childs}
                            onChange={(event, index, value) => this.handleChangeChildsQuantity(roomIndex, value)}
                          >
                              <MenuItem className="menu-form-item" value={0} primaryText='0' />
                              <MenuItem className="menu-form-item" value={1} primaryText={1} />
                              <MenuItem className="menu-form-item" value={2} primaryText={2}/>
                              <MenuItem className="menu-form-item" value={3} primaryText={3} />                                    
                              <MenuItem className="menu-form-item" value={4} primaryText={4} />
                              <MenuItem className="menu-form-item" value={5} primaryText={5} />                                 
                          </SelectField>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={6} lg={4} offset={{ xs: 6, lg: 8 }}>
                          {item.childs_age && item.childs_age.map( (age,index) => 
                            <SelectField
                              key={index}
                              style={{ width: 80, marginRight: 10 }}
                              value={item.childs_age[index]}
                              onChange={ (event,key,value) => this.handleChangeChildsAge(roomIndex, index, value) }
                            >
                              {ages.map( age => 
                                <MenuItem key={age} value={age} primaryText={age} />
                              )}
                            </SelectField>
                          )}
                      </Col>
                    </Row>
                  </div>
                  )}
                  </div> :
                  <div>
                    <Row>
                      <Col xs={6} lg={4}>
                        <SelectField
                          fullWidth
                          style={{ textAlign: 'left' }}
                          value={rooms.length}
                          floatingLabelText={languageId === 0 ? 'Rooms' : 'Номеров'}
                          onChange={this.handleChangeRoomQuantity}
                        >
                            <MenuItem className="menu-form-item" value={1} primaryText={1} />
                            <MenuItem className="menu-form-item" value={2} primaryText={2}/>
                            <MenuItem className="menu-form-item" value={3} primaryText={3} />                                    
                            <MenuItem className="menu-form-item" value={4} primaryText={4} />
                            <MenuItem className="menu-form-item" value={5} primaryText={'5+'} />
                        </SelectField>                                
                      </Col>
                      <Col xs={6} lg={4}>
                        <SelectField
                          fullWidth
                          style={{ textAlign: 'left' }}
                          value={rooms[0].adults}
                          floatingLabelText={languageId === 0 ? 'Adults' : 'Взрослых'}
                          onChange={(event, index, value) => this.handleChangeAdultsQuantity(0, value)}
                        >
                            <MenuItem className="menu-form-item" value={1} primaryText={1} />
                            <MenuItem className="menu-form-item" value={2} primaryText={2}/>
                            <MenuItem className="menu-form-item" value={3} primaryText={3} />                                    
                            <MenuItem className="menu-form-item" value={4} primaryText={4} />
                            <MenuItem className="menu-form-item" value={5} primaryText={5} />     
                            <MenuItem className="menu-form-item" value={6} primaryText={6} />     
                            <MenuItem className="menu-form-item" value={7} primaryText={7} />     
                            <MenuItem className="menu-form-item" value={8} primaryText={8} />     
                            <MenuItem className="menu-form-item" value={9} primaryText={9} />     
                            <MenuItem className="menu-form-item" value={10} primaryText={10} />                               
                        </SelectField>
                      </Col>
                      <Col xs={6} lg={4}> 
                        <SelectField
                          fullWidth
                          style={{ textAlign: 'left' }}
                          floatingLabelText={languageId === 0 ? 'Child\'s' : 'Детей'}
                          value={rooms[0].childs}
                          onChange={(event, index, value) => this.handleChangeChildsQuantity(0, value)}
                        >
                            <MenuItem className="menu-form-item" value={0} primaryText='0' />
                            <MenuItem className="menu-form-item" value={1} primaryText={1} />
                            <MenuItem className="menu-form-item" value={2} primaryText={2}/>
                            <MenuItem className="menu-form-item" value={3} primaryText={3} />                                    
                            <MenuItem className="menu-form-item" value={4} primaryText={4} />
                            <MenuItem className="menu-form-item" value={5} primaryText={5} />                                 
                        </SelectField>                              
                      </Col>
                      <Col xs={12} style={{ textAlign: 'left' }}>
                        {rooms[0].childs_age ? rooms[0].childs_age.map( (age,index) => 
                          <SelectField
                            key={index}
                            style={{ width: 80, marginRight: 10 }}
                            value={rooms[0].childs_age[index]}
                            onChange={ (event,key,value) => this.handleChangeChildsAge(0, index, value) }
                          >
                            {ages.map( age => 
                               <MenuItem key={age} value={age} primaryText={age} />
                            )}
                          </SelectField>
                        ) : ''}
                      </Col>
                    </Row>
                  </div>}
                  <Row style={{ marginTop: 5 }}>
                      <Col style={{ paddingLeft: 20 }}>
                        <Checkbox
                          disabled={ 
                            !(rooms.length === 1 && rooms[0].adults === 1 && rooms[0].childs === 0) ||
                            _.isEmpty(this.props.profile.user)
                          }
                          label={ languageId === 0 ? 'With population' : 'С подселением' }
                          defaultChecked={ this.state.shareRoom  }
                          onCheck={ (e, checked) =>  this.setState({ shareRoom: checked }) }
                          iconStyle={{ maxWidth: 250, fill: '#525252', marginLeft: -10 }} />
                      </Col>
                      {
                        this.state.childsQuantity == 0 && this.state.adultsQuantity == 1 && this.state.shareRoom
                        ? <p style={{ paddingLeft: 15, paddingRight: 15, fontSize: 13, textAlign: 'left' }}>{
                            languageId === 0
                            ? 'The search is carried out for 2 adults without children'
                            : 'Поиск осуществляется из расчета на 2 взрослых без детей'
                          }</p>
                        : <p style={{ paddingLeft: 15, paddingRight: 15, fontSize: 13, textAlign: 'left' }}>{
                            languageId === 0
                            ? 'Available for 1 adult without children only for authorised users'
                            : 'Доступна для 1 взрослого без детей и только для авторизованных пользователей'
                          }</p>
                      }
                  </Row>                       
                  <Row style={{ marginTop: 10 }}>

                      <Col>
                          <RaisedButton
                            label={languageId === 0 ? 'Search' : 'Поиск'} 
                            onClick={this.handleSearch} />
                      </Col>
                      
                  </Row>                     
              </Paper>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actions, dispatch);
}

const mapStateToProps = ({ profile, search, asyncData }) => ({
  profile,
  search,
  asyncData,
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(BookingForm));