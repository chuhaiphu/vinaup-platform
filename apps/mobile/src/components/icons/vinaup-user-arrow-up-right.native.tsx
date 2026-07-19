import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupUserArrowUpRight = (props: SvgProps) => (
  <Svg width={12} height={15} viewBox="0 0 12 15" fill="none" {...props}>
    <Path
      d="M0.5 13.7632V12.2895C0.5 11.5078 0.809047 10.7581 1.35915 10.2054C1.90926 9.65263 2.65536 9.34211 3.43333 9.34211H5.63333M7.83333 14.5L11.5 10.8158M11.5 10.8158V14.1316M11.5 10.8158H8.2M1.96667 3.44737C1.96667 4.22906 2.27571 4.97873 2.82582 5.53147C3.37593 6.08421 4.12203 6.39474 4.9 6.39474C5.67797 6.39474 6.42407 6.08421 6.97418 5.53147C7.52429 4.97873 7.83333 4.22906 7.83333 3.44737C7.83333 2.66568 7.52429 1.916 6.97418 1.36326C6.42407 0.810525 5.67797 0.5 4.9 0.5C4.12203 0.5 3.37593 0.810525 2.82582 1.36326C2.27571 1.916 1.96667 2.66568 1.96667 3.44737Z"
      stroke={props.color || 'black'}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default VinaupUserArrowUpRight;
