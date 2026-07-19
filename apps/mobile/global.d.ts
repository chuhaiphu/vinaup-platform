declare module '*.svg' {
  import { FunctionComponent, SVGProps } from 'react';
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.png' {
  const value: {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  };
  export default value;
}

declare module '*.gif' {
  const value: {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  };
  export default value;
}

declare module '*.webm' {
  const value: {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  };
  export default value;
}
