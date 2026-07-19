import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupArrowWithTail = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
    <Path
      d="M1.00011 10.8422L1.00008 17L7.15805 17M1.00008 17L8.64436 9.35594M16.9893 5.73963L12.2495 5.73964L12.2495 0.999999"
      stroke={props.color || '#02696F'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default VinaupArrowWithTail;
