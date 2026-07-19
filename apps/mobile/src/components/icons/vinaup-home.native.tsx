import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupHome = (props: SvgProps) => (
  <Svg viewBox="0 0 29 29" fill="none" {...props}>
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1 14.5 14.5 1 28 14.5M4.375 11.969v14.344A1.687 1.687 0 0 0 6.063 28h5.062v-5.063a1.687 1.687 0 0 1 1.688-1.687h3.374a1.687 1.687 0 0 1 1.688 1.688V28h5.063a1.687 1.687 0 0 0 1.687-1.688V11.97"
    />
  </Svg>
);
export default VinaupHome;
