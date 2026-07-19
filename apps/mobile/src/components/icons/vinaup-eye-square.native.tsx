import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupEyeSquare = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M19 15V17C19 17.5304 18.7893 18.0391 18.4142 18.4142C18.0391 18.7893 17.5304 19 17 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V15M19 5V3C19 2.46957 18.7893 1.96086 18.4142 1.58579C18.0391 1.21071 17.5304 1 17 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V5"
      stroke={props.color || '#005C62'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11Z"
      stroke={props.color || '#005C62'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.944 10.33C17.0187 10.1164 17.0187 9.88369 16.944 9.67003C16.381 8.29045 15.4198 7.10985 14.1831 6.27879C12.9463 5.44774 11.4901 5.00391 10 5.00391C8.50998 5.00391 7.05372 5.44774 5.81696 6.27879C4.58021 7.10985 3.61903 8.29045 3.05602 9.67003C2.98133 9.88369 2.98133 10.1164 3.05602 10.33C3.61903 11.7096 4.58021 12.8902 5.81696 13.7213C7.05372 14.5523 8.50998 14.9962 10 14.9962C11.4901 14.9962 12.9463 14.5523 14.1831 13.7213C15.4198 12.8902 16.381 11.7096 16.944 10.33Z"
      stroke={props.color || '#005C62'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default VinaupEyeSquare;
