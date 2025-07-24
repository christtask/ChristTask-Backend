/// <reference types="vite/client" />

// Global React declaration
declare global {
  namespace React {
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    
    interface ReactNode {
      // This allows any type to be used as ReactNode
    }
    
    interface JSXElementConstructor<P> {
      (props: P): ReactElement<P, any> | null;
    }
    
    type Key = string | number;
  }
  
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-router-dom' {
  export * from 'react-router-dom';
  
  // Common react-router-dom exports
  export const useNavigate: any;
  export const useLocation: any;
  export const useParams: any;
  export const useSearchParams: any;
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const NavLink: any;
  export const Navigate: any;
  export const Outlet: any;
}

declare module 'lucide-react' {
  export * from 'lucide-react';
  
  // Common lucide-react exports
  export const X: any;
  export const Home: any;
  export const MessageSquare: any;
  export const BookOpen: any;
  export const DollarSign: any;
  export const Info: any;
  export const ChevronRight: any;
  export const Shield: any;
  export const Zap: any;
  export const ArrowRight: any;
  export const Star: any;
  export const Brain: any;
  export const Cross: any;
  export const Video: any;
  export const Mic: any;
  export const Calendar: any;
  export const CheckCircle: any;
  export const Users: any;
  export const ExternalLink: any;
  export const Heart: any;
  export const Globe: any;
  export const Book: any;
  export const Send: any;
  export const MicOff: any;
  export const Download: any;
  export const Share2: any;
  export const ThumbsUp: any;
  export const ThumbsDown: any;
  export const Bot: any;
  export const User: any;
  export const Clock: any;
  export const CreditCard: any;
}

declare module 'react' {
  export * from 'react';
  
  // Common React exports
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useCallback: any;
  export const useMemo: any;
  export const useContext: any;
  export const createContext: any;
  export const ReactNode: any;
  export const ReactElement: any;
  export const Component: any;
  export const Fragment: any;
  export const forwardRef: any;
  export const memo: any;
  export const lazy: any;
  export const Suspense: any;
  export const Children: any;
  export const cloneElement: any;
  export const isValidElement: any;
  export const createElement: any;
}

declare module 'react/jsx-runtime' {
  import { ReactElement, ReactNode } from 'react';
  
  export function jsx(
    type: any,
    props: any,
    key?: string | number | null
  ): ReactElement;
  
  export function jsxs(
    type: any,
    props: any,
    key?: string | number | null
  ): ReactElement;
  
  export const Fragment: unique symbol;
}

declare module 'react/jsx-dev-runtime' {
  import { ReactElement } from 'react';
  
  export function jsxDEV(
    type: any,
    props: any,
    key?: string | number | null,
    isStaticChildren?: boolean,
    source?: any,
    self?: any
  ): ReactElement;
  
  export const Fragment: unique symbol;
}

// Global module declarations for common packages
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.gif' {
  const content: any;
  export default content;
}

declare module '*.webp' {
  const content: any;
  export default content;
} 