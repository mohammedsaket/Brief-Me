declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  
  export const Brain: FC<IconProps>;
  export const MessageSquare: FC<IconProps>;
  export const Loader2: FC<IconProps>;
  export const Moon: FC<IconProps>;
  export const Sun: FC<IconProps>;
  export const Copy: FC<IconProps>;
  export const RefreshCw: FC<IconProps>;
} 