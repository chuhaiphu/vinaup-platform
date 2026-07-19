import * as React from 'react';
import Svg, { Rect, Circle, SvgProps } from 'react-native-svg';
const VinaupUtilityShape = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Rect
      x={19.5}
      y={5.5}
      width={12}
      height={5}
      rx={2.5}
      transform="rotate(-180 19.5 5.5)"
      stroke={props.color || '#005C62'}
    />
    <Rect x={0.5} y={14.5} width={12} height={5} rx={2.5} stroke={props.color || '#005C62'} />
    <Circle cx={3} cy={3} r={3} transform="rotate(-180 3 3)" fill={props.color || '#005C62'} />
    <Circle cx={17} cy={17} r={3} fill={props.color || '#005C62'} />
    <Circle cx={17} cy={10} r={2.5} stroke={props.color || '#005C62'} />
    <Circle cx={3} cy={10} r={2.5} stroke={props.color || '#005C62'} />
    <Circle cx={10} cy={10} r={2.5} stroke={props.color || '#005C62'} />
  </Svg>
);
export default VinaupUtilityShape;
