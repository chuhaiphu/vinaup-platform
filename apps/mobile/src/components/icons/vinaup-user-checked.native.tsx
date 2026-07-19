import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupUserChecked = (props: SvgProps) => (
  <Svg width={13} height={15} viewBox="0 0 13 15" fill="none" {...props}>
    <Path
      d="M0.5 14.5V12.9444C0.5 12.1193 0.837142 11.328 1.43726 10.7446C2.03737 10.1611 2.85131 9.83333 3.7 9.83333H6.9M7.7 12.9444L9.3 14.5L12.5 11.3889M2.1 3.61111C2.1 4.43623 2.43714 5.22755 3.03726 5.811C3.63737 6.39445 4.45131 6.72222 5.3 6.72222C6.14869 6.72222 6.96263 6.39445 7.56274 5.811C8.16286 5.22755 8.5 4.43623 8.5 3.61111C8.5 2.78599 8.16286 1.99467 7.56274 1.41122C6.96263 0.827777 6.14869 0.5 5.3 0.5C4.45131 0.5 3.63737 0.827777 3.03726 1.41122C2.43714 1.99467 2.1 2.78599 2.1 3.61111Z"
      stroke={props.color || 'black'}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default VinaupUserChecked;
