import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupDoubleCheck = (props: SvgProps) => (
  <Svg width={16} height={9} viewBox="0 0 16 9" fill="none" {...props}>
    <Path
      d="M4.94878 4.49959L8.29971 8L15 1M1 4.49959L4.35093 8M11.052 1L8.50268 3.68698"
      stroke={props.color || '#005C62'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default VinaupDoubleCheck;
