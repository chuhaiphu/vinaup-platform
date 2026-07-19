import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const VinaupAddNew = (props: SvgProps & { backgroundColor?: string; iconColor?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z"
      fill={props.backgroundColor || '#005C62'}
    />
    <Path
      d="M8.57141 6.23804C8.57141 5.68575 9.01913 5.23804 9.57141 5.23804H10.4286C10.9808 5.23804 11.4286 5.68575 11.4286 6.23804V13.7618C11.4286 14.3141 10.9808 14.7618 10.4286 14.7618H9.57141C9.01913 14.7618 8.57141 14.3141 8.57141 13.7618V6.23804Z"
      fill={props.iconColor || '#FCBE11'}
    />
    <Path
      d="M5.23804 9.57129C5.23804 9.01901 5.68575 8.57129 6.23804 8.57129H13.7618C14.3141 8.57129 14.7618 9.019 14.7618 9.57129V10.4284C14.7618 10.9807 14.3141 11.4284 13.7618 11.4284H6.23804C5.68575 11.4284 5.23804 10.9807 5.23804 10.4284V9.57129Z"
      fill={props.iconColor || '#FCBE11'}
    />
  </Svg>
);
export default VinaupAddNew;
