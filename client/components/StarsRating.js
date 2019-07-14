import React from 'react';
import Star from 'material-ui/svg-icons/toggle/star'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'

const orange = '#f3c20f',
      grey = 'gray'

const styles = {
  editable: {
    cursor: 'pointer',
  },
};

const defaultValues = [2, 4, 6, 8, 10];

const Ch = props => {
  let { checked, hovered, readOnly = false, ...p } = props;
  const st = readOnly ? {} : styles.editable;
  if (checked) return <Star style={st} color={orange} {...p} />;
  else if (hovered)
    return <StarBorder style={st} color={orange} {...p} />;
  else return <StarBorder style={st} color={grey} {...p} />;
};

class Rating extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hoveredIndex: 0,
      checkedIndex: props.value,
    };

  }

  componentWillReceiveProps(nextProps) {
    this.setState({ checkedIndex: nextProps.value });
  }

  onCheck(i, e) {
    this.setState({ checkedIndex: i });
    if (this.props.onChange) this.props.onChange(i);
  }

  onMouseEnter(i, e) {
    this.setState({ hoveredIndex: i });
  }

  onMouseLeave(i, e) {
    this.setState({ hoveredIndex: 0 });
  }

  render() {
    const { hoveredIndex, checkedIndex } = this.state;
    const { readOnly, values = defaultValues } = this.props;
    return (
      <div style={{}}>
        {values.map(i => {
          let onClick = readOnly ? undefined : this.onCheck.bind(this, i),
            onMouseEnter = readOnly
              ? undefined
              : this.onMouseEnter.bind(this, i),
            onMouseLeave = readOnly
              ? undefined
              : this.onMouseLeave.bind(this, i),
            checked = i <= checkedIndex,
            hovered = i <= hoveredIndex;

          if (
            hoveredIndex > 0 &&
            checkedIndex > 0 &&
            i > hoveredIndex &&
            i <= checkedIndex
          ) {
            checked = false;
            hovered = true;
          }

          return (
            <Ch
              checked={checked}
              key={i}
              hovered={hovered}
              readOnly={readOnly}
              onClick={onClick}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
          );
        })}
      </div>
    );
  }
}

export default Rating;