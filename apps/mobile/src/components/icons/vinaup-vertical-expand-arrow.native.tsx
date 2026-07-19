import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupVerticalExpandArrow = (props: SvgProps) => (
  <Svg width={13} height={13} viewBox="0 0 13 13" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.838 0L5.676 2.602L5 3.339L3.338 1.815V10.541L5 9.017L5.676 9.754L2.838 12.356L0 9.754L0.676 9.017L2.338 10.541V1.815L0.676 3.339L0 2.602L2.838 0ZM12.338 2.678H7.338V1.678H12.338V2.678ZM12.338 6.678H7.338V5.678H12.338V6.678ZM12.338 10.678H7.338V9.678H12.338V10.678Z"
      fill="#036D74"
    />
  </Svg>
);
export default VinaupVerticalExpandArrow;
