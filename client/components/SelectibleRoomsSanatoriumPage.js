import React, { Component}  from 'react'
import ReactDom from 'react-dom'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

export default class selectibleRooms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRooms: [],
      indexSelectRoom: null,
      openSelectRoom: false
    }

    this.handleOpenSelectRoom = ::this.handleOpenSelectRoom;
    this.handleClose = ::this.handleClose;
    this.updateRoomSelect = ::this.updateRoomSelect;
    this.handleNextSelectRoom = ::this.handleNextSelectRoom;
  }

  componentDidMount() {
    const paramsRooms = JSON.parse(this.props.params.rooms)

    const selectedRooms = new Array(paramsRooms.length).fill(null)
  
    this.setState({ selectedRooms })
  }

  handleOpenSelectRoom(i) {
    this.setState({ indexSelectRoom: i, openSelectRoom: true })
  }

  handleClose() {
    this.setState({ indexSelectRoom: null, openSelectRoom: false })

  }

  handleNextSelectRoom(indexSelectRoom) {
    const rooms_length = JSON.parse(this.props.params.rooms).length
    
    if(indexSelectRoom + 1 >= rooms_length || this.state.selectedRooms[indexSelectRoom+1]) return;
      
    indexSelectRoom++;
    setTimeout(() => this.setState({ indexSelectRoom, openSelectRoom: true }), 300)    
  }

  updateRoomSelect(room) {
    const { rooms } = this.props;
    const { selectedRooms, indexSelectRoom } = this.state 

    selectedRooms[indexSelectRoom] = room;

    this.setState({ indexSelectRoom: null, openSelectRoom: false }, this.handleNextSelectRoom(indexSelectRoom))
    
    this.props.updateRooms(selectedRooms)
  }

  render () {
    const { rooms, params, currencyId, languageId } = this.props;
    const {selectedRooms, openSelectRoom, indexSelectRoom } = this.state;

    const paramsRooms = JSON.parse(params.rooms)

    const actions = [
      <FlatButton
        label={languageId === 0 ? 'Close' : 'Закрыть'}
        primary={true}
        onClick={this.handleClose}
      />,
    ];
    const guest = [
      <div style={{ color: '#fff', letterSpacing: 2, float: 'left', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /></div>,
      <div style={{ color: '#fff', letterSpacing: 2, float: 'left', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /><i className="fa fa-male" aria-hidden="true" style={{ 'WebkitTextStroke' : '1px #55c908' }} /></div>,
      <div style={{ color: '#fff', letterSpacing: 2, float: 'left', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}}/><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /><i className="fa fa-male" aria-hidden="true" style={{ color: '#55c908'}} /></div>,
    ]
    console.log(this.state)

    return (
      !this.props.isMobile ?
      <tbody>
        {paramsRooms.map( (room,i) => 
          selectedRooms[i] ? 
           <tr>
              <td style={{ textAlign: 'left', paddingLeft: 15, textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.props.onClick(selectedRooms[i].items_cats_id, selectedRooms[i].id)}>
                {i+1}.
                {selectedRooms[i].max_adults > 3
                        ? <span style={{ float:'left', color: '#55c908', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true"/> x { selectedRooms[i].max_adults }</span>
                        :   guest[room.adults -1] }
                {selectedRooms[i].sname}
              </td>
              <td>{selectedRooms[i].treatment_incl ? <i className="fa fa-check" aria-hidden="true"/> : <i className="fa fa-times" aria-hidden="true"/>}</td>
              <td>
                {selectedRooms[i].meal_plan && selectedRooms[i].meal_plan.map( (item, index) =>
                  item === 'breakfast' && (
                    languageId === 0 ? `Breakfast${index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}` : `Завтрак${ index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}`
                  ) ||
                  item === 'dinner' && (
                    languageId === 0 ? `Dinner${index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}` : `Обед${ index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}`
                  ) ||
                  item === 'supper' && (
                    languageId === 0 ? `Supper${index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}` : `Ужин${ index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}`
                  )
                )}
              </td>
              <td>{selectedRooms[i].category_name}</td>
              <td>{ (selectedRooms[i] && selectedRooms[i].price_with_discount[this.props.currencyId] || selectedRooms[i].default_price && selectedRooms[i].default_price[this.props.currencyId]) + ' ' + currency[this.props.currencyId] }</td>
              <td onClick={() => this.handleOpenSelectRoom(i)} style={{ cursor: 'pointer' }}>
                {languageId === 0 ? 'Change' : 'Изменить'}
              </td>
            </tr>
          : <tr>
              <td colSpan={8} style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleOpenSelectRoom(i)}>
              {languageId === 0 
                ? `Room #${i+1} (For ${room.adults} adults, ${room.childs} childs)` 
                : `Номер #${i+1} (Для ${room.adults} взрослых, ${room.childs} детей)`}
              </td>
            </tr>
        )}
        {indexSelectRoom !== null ? 
        <Dialog
          modal
          title={
            languageId === 0 
              ? `Room #${indexSelectRoom+1} (For ${paramsRooms[indexSelectRoom].adults} adults, ${paramsRooms[indexSelectRoom].childs} childs)` 
              : `Номер #${indexSelectRoom+1} (Для ${paramsRooms[indexSelectRoom].adults} взрослых, ${paramsRooms[indexSelectRoom].childs} детей)`
          }
          actions={actions}
          open={openSelectRoom}
          onRequestClose={this.handleClose}
        >
          <p>{languageId === 0 ? 'Available rooms:' : 'Доступные номера:'}</p>
          {rooms[indexSelectRoom].map( (item, i) =>
            <ListItem primaryText={
              <span>
              {item.max_adults > 3
                ? <span style={{ float:'left', color: '#55c908', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true"/> x { item.max_adults } </span>
                :   guest[paramsRooms[indexSelectRoom].adults -1] }
              {languageId === 0 
              ? `${item.sname}, ${item.treatment_incl ? 'with treatment' : 'no treatment'} - ${item.price_with_discount[currencyId]} ${currency[currencyId]}`
              : `${item.sname}, ${item.treatment_incl ? 'с лечением' : 'без лечения'} - ${item.price_with_discount[currencyId]} ${currency[currencyId]}`}
              </span>
            } onClick={() => this.updateRoomSelect(item)}/>
          )}
        </Dialog> : ''}
      </tbody>
      : 
      <div>
        {paramsRooms.map( (room,i) => 
          selectedRooms[i] ? 
           <Row style={{ margin: 0, padding: 10, background: '#eeeeee', marginBottom: 6 }}>
              <Col style={{ textAlign: 'left', paddingLeft: 15, textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.props.onClick(selectedRooms[i].items_cats_id, selectedRooms[i].id)}>
                {languageId === 0 ? 'Room: ' : 'Номер: '}
                {i+1}.
                {selectedRooms[i].max_adults > 3
                        ? <span style={{ float:'left', color: '#55c908', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true"/> x { selectedRooms[i].max_adults }</span>
                        :   guest[room.adults -1] }
                {selectedRooms[i].sname}
              </Col>
              <Col>
                {languageId === 0 ? 'Treatment: ' : 'Лечение: '}
                {selectedRooms[i].treatment_incl ? <i className="fa fa-check" aria-hidden="true"/> : <i className="fa fa-times" aria-hidden="true"/>}
              </Col>
              <Col>
                {languageId === 0 ? 'Meal plan: ' : 'План питания: '}                
                {selectedRooms[i].meal_plan && selectedRooms[i].meal_plan.map( (item, index) =>
                  item === 'breakfast' && (
                    languageId === 0 ? `Breakfast${index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}` : `Завтрак${ index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}`
                  ) ||
                  item === 'dinner' && (
                    languageId === 0 ? `Dinner${index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}` : `Обед${ index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}`
                  ) ||
                  item === 'supper' && (
                    languageId === 0 ? `Supper${index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}` : `Ужин${ index+1 !== selectedRooms[i].meal_plan.length ? ',' : ''}`
                  )
                )}
              </Col>
              <Col>
                {selectedRooms[i].category_name}
              </Col>
              <Col>
                {languageId === 0 ? 'Price: ' : 'Цена: '}
                { (selectedRooms[i] && selectedRooms[i].price_with_discount[this.props.currencyId] || selectedRooms[i].default_price && selectedRooms[i].default_price[this.props.currencyId]) + ' ' + currency[this.props.currencyId] }
              </Col>
              <Col onClick={() => this.handleOpenSelectRoom(i)} style={{ marginTop: 10, textDecoration: 'underline', cursor: 'pointer' }}>
                {languageId === 0 ? 'Change' : 'Изменить'}
              </Col>
            </Row>
          : <Row style={{ margin: 0, padding: 10, background: '#eeeeee', marginBottom: 6 }}>
              <Col style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleOpenSelectRoom(i)}>
              {languageId === 0 
                ? `Room #${i+1} (For ${room.adults} adults, ${room.childs} childs)` 
                : `Номер #${i+1} (Для ${room.adults} взрослых, ${room.childs} детей)`}
              </Col>
            </Row>
        )}
        {indexSelectRoom !== null ? 
        <Dialog
          modal
          fullWidth
          title={
            languageId === 0 
              ? `Room #${indexSelectRoom+1} (For ${paramsRooms[indexSelectRoom].adults} adults, ${paramsRooms[indexSelectRoom].childs} childs)` 
              : `Номер #${indexSelectRoom+1} (Для ${paramsRooms[indexSelectRoom].adults} взрослых, ${paramsRooms[indexSelectRoom].childs} детей)`
          }
          actions={actions}
          open={openSelectRoom}
          onRequestClose={this.handleClose}
        >
          <p>{languageId === 0 ? 'Available rooms:' : 'Доступные номера:'}</p>
          {rooms[indexSelectRoom].map( (item, i) =>
            <ListItem 
              primaryText={
                <div>
                  {item.max_adults > 3
                    ? <span style={{ float:'left', color: '#55c908', padding: '0px 5px' }}><i className="fa fa-male" aria-hidden="true"/> x { item.max_adults } </span>
                    :   guest[paramsRooms[indexSelectRoom].adults -1] }
                  {languageId === 0 
                  ? ` ${item.sname}, ${item.treatment_incl ? 'with treatment' : 'no treatment'}`
                  : ` ${item.sname}, ${item.treatment_incl ? 'с лечением' : 'без лечения'}`}
                  <br/>
                  <span>{languageId === 0 ? 'Price: ': 'Цена: '}{`${item.price_with_discount[currencyId]} ${currency[currencyId]}`}</span>
                </div>
              } 
              style={{ background: i%2 ? '#fcfcfc' : '#f5f5f5' }}
              onClick={() => this.updateRoomSelect(item)}/>
          )}
        </Dialog> : ''}
      </div>

    )
  }
}