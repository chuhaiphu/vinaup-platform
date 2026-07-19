import * as React from 'react';
import Svg, { Rect, Circle, SvgProps } from 'react-native-svg';
const VinaupUserCouple = (props: SvgProps) => (
  <Svg width={14} height={20} viewBox="0 0 14 20" fill="none" {...props}>
    <Rect
      x={0.5}
      y={19.5}
      width={12}
      height={5}
      rx={2.5}
      transform="rotate(-90 0.5 19.5)"
      stroke="#686868"
    />
    <Circle cx={3} cy={3} r={3} transform="rotate(-90 3 3)" fill="#686868" />
    <Rect x={8} y={20} width={13} height={6} rx={3} transform="rotate(-90 8 20)" fill="#686868" />
    <Circle cx={11} cy={3} r={2.5} transform="rotate(-90 11 3)" stroke="#686868" />
  </Svg>
);
export default VinaupUserCouple;
