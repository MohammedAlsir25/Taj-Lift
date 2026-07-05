import React from 'react';
import { useProfile } from './ProfileContext';

export interface TamaguiBaseProps {
  children?: React.ReactNode;
  className?: string;
  p?: number | string;
  px?: number | string;
  py?: number | string;
  pt?: number | string;
  pb?: number | string;
  pl?: number | string;
  pr?: number | string;
  m?: number | string;
  mx?: number | string;
  my?: number | string;
  mt?: number | string;
  mb?: number | string;
  gap?: number | string;
  ai?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline';
  jc?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  bg?: string;
  borderColor?: string;
  br?: number | string;
  opacity?: number;
  flex?: number | string;
  h?: number | string;
  w?: number | string;
  onClick?: (e: React.MouseEvent<any>) => void;
  id?: string;
}

function getStyleFromProps(props: TamaguiBaseProps) {
  const style: React.CSSProperties = {};

  // Padding
  if (props.p !== undefined) style.padding = typeof props.p === 'number' ? `${props.p * 4}px` : props.p;
  if (props.px !== undefined) {
    const pxVal = typeof props.px === 'number' ? `${props.px * 4}px` : props.px;
    style.paddingLeft = pxVal;
    style.paddingRight = pxVal;
  }
  if (props.py !== undefined) {
    const pyVal = typeof props.py === 'number' ? `${props.py * 4}px` : props.py;
    style.paddingTop = pyVal;
    style.paddingBottom = pyVal;
  }
  if (props.pt !== undefined) style.paddingTop = typeof props.pt === 'number' ? `${props.pt * 4}px` : props.pt;
  if (props.pb !== undefined) style.paddingBottom = typeof props.pb === 'number' ? `${props.pb * 4}px` : props.pb;
  if (props.pl !== undefined) style.paddingLeft = typeof props.pl === 'number' ? `${props.pl * 4}px` : props.pl;
  if (props.pr !== undefined) style.paddingRight = typeof props.pr === 'number' ? `${props.pr * 4}px` : props.pr;

  // Margin
  if (props.m !== undefined) style.margin = typeof props.m === 'number' ? `${props.m * 4}px` : props.m;
  if (props.mx !== undefined) {
    const mxVal = typeof props.mx === 'number' ? `${props.mx * 4}px` : props.mx;
    style.marginLeft = mxVal;
    style.marginRight = mxVal;
  }
  if (props.my !== undefined) {
    const myVal = typeof props.my === 'number' ? `${props.my * 4}px` : props.my;
    style.marginTop = myVal;
    style.marginBottom = myVal;
  }
  if (props.mt !== undefined) style.marginTop = typeof props.mt === 'number' ? `${props.mt * 4}px` : props.mt;
  if (props.mb !== undefined) style.marginBottom = typeof props.mb === 'number' ? `${props.mb * 4}px` : props.mb;

  // Layout & Sizing
  if (props.gap !== undefined) style.gap = typeof props.gap === 'number' ? `${props.gap * 4}px` : props.gap;
  if (props.flex !== undefined) style.flex = props.flex;
  if (props.h !== undefined) style.height = typeof props.h === 'number' ? `${props.h}px` : props.h;
  if (props.w !== undefined) style.width = typeof props.w === 'number' ? `${props.w}px` : props.w;

  // Borders & Radii
  if (props.br !== undefined) {
    style.borderRadius = typeof props.br === 'number' ? `${props.br * 4}px` : props.br;
  }
  if (props.borderColor) {
    style.borderColor = props.borderColor;
  }

  // Background & Opacity
  if (props.bg) {
    style.background = props.bg;
  }
  if (props.opacity !== undefined) style.opacity = props.opacity;

  return style;
}

const alignMap = {
  center: 'items-center',
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyMap = {
  center: 'justify-center',
  'flex-start': 'justify-start',
  'flex-end': 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
};

// YStack (Vertical Layout)
export const YStack = React.forwardRef<HTMLDivElement, TamaguiBaseProps>(
  ({ children, className = '', ai, jc, onClick, id, ...props }, ref) => {
    const customStyle = getStyleFromProps(props);
    const classes = [
      'flex',
      'flex-col',
      ai ? alignMap[ai] : '',
      jc ? justifyMap[jc] : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div id={id} ref={ref} style={customStyle} className={classes} onClick={onClick}>
        {children}
      </div>
    );
  }
);

YStack.displayName = 'YStack';

// XStack (Horizontal Layout)
export const XStack = React.forwardRef<HTMLDivElement, TamaguiBaseProps>(
  ({ children, className = '', ai, jc, onClick, id, ...props }, ref) => {
    const customStyle = getStyleFromProps(props);
    const classes = [
      'flex',
      'flex-row',
      ai ? alignMap[ai] : '',
      jc ? justifyMap[jc] : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div id={id} ref={ref} style={customStyle} className={classes} onClick={onClick}>
        {children}
      </div>
    );
  }
);

XStack.displayName = 'XStack';

// ZStack (Layered Overlapping Layout)
export const ZStack = React.forwardRef<HTMLDivElement, TamaguiBaseProps>(
  ({ children, className = '', onClick, id, ...props }, ref) => {
    const customStyle = getStyleFromProps(props);
    const classes = ['relative', className].filter(Boolean).join(' ');

    return (
      <div id={id} ref={ref} style={{ ...customStyle, display: 'grid' }} className={classes} onClick={onClick}>
        {React.Children.map(children, (child, i) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement<any>, {
            style: {
              gridArea: '1 / 1 / 2 / 2',
              zIndex: i,
              ...(child.props.style || {}),
            },
          });
        })}
      </div>
    );
  }
);

ZStack.displayName = 'ZStack';

// Heading
export interface HeadingProps extends TamaguiBaseProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, className = '', level = 1, ...props }, ref) => {
    const { theme } = useProfile();
    const customStyle = getStyleFromProps(props);
    
    const sizes = {
      1: 'text-2xl font-black tracking-tight',
      2: 'text-xl font-extrabold tracking-tight',
      3: 'text-base font-bold tracking-tight',
      4: 'text-sm font-semibold uppercase tracking-wider',
      5: 'text-xs font-bold uppercase tracking-wider',
      6: 'text-[10px] font-black uppercase tracking-widest',
    };

    const Tag = `h${level}` as any;
    const classes = [
      sizes[level],
      theme === 'light' ? 'text-slate-900' : 'text-white',
      className
    ].filter(Boolean).join(' ');

    return (
      <Tag ref={ref} style={customStyle} className={classes}>
        {children}
      </Tag>
    );
  }
);

Heading.displayName = 'Heading';

// Text
export interface TextProps extends TamaguiBaseProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'heading' | 'caption' | 'tiny';
  muted?: boolean;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
}

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ children, className = '', size = 'base', muted = false, fontWeight, ...props }, ref) => {
    const { theme } = useProfile();
    const customStyle = getStyleFromProps(props);

    const sizeClasses = {
      tiny: 'text-[9px] font-mono',
      caption: 'text-[10px]',
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      heading: 'text-2xl font-bold',
    };

    const fontWeights = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
    };

    const classes = [
      sizeClasses[size],
      fontWeight ? fontWeights[fontWeight] : '',
      muted
        ? (theme === 'light' ? 'text-slate-500' : 'text-white/60')
        : (theme === 'light' ? 'text-slate-800' : 'text-white'),
      className
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} style={customStyle} className={classes}>
        {children}
      </span>
    );
  }
);

Text.displayName = 'Text';

// Card with standard glassmorphism
export interface CardProps extends TamaguiBaseProps {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', elevated = true, ...props }, ref) => {
    const { theme } = useProfile();
    const customStyle = getStyleFromProps(props);
    const isLight = theme === 'light';

    const classes = [
      'rounded-2xl border transition-all duration-300',
      isLight
        ? 'bg-white/80 border-slate-200/80'
        : 'bg-white/5 backdrop-blur-md border-white/10',
      elevated ? (isLight ? 'shadow-sm hover:shadow-md' : 'shadow-xl') : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} style={customStyle} className={classes}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Interactive Button
export interface ButtonProps extends TamaguiBaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning';
  active?: boolean;
  disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'primary', active = false, disabled = false, onClick, ...props }, ref) => {
    const { theme } = useProfile();
    const customStyle = getStyleFromProps(props);
    const isLight = theme === 'light';

    const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/10 hover:shadow-sky-500/20',
      secondary: isLight
        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        : 'bg-white/10 text-white hover:bg-white/15 border border-white/5',
      outline: isLight
        ? 'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100'
        : 'bg-transparent border border-white/15 text-white/90 hover:bg-white/5',
      ghost: isLight
        ? 'bg-transparent text-slate-600 hover:bg-slate-100'
        : 'bg-transparent text-white/70 hover:bg-white/10',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/10',
      warning: 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/10',
    };

    const activeClasses = active ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-500/20' : '';

    const classes = [
      baseClasses,
      variants[variant],
      activeClasses,
      className
    ].filter(Boolean).join(' ');

    return (
      <button ref={ref} style={customStyle} className={classes} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Switch Component
export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, id, className = '' }, ref) => {
    const { theme } = useProfile();
    const isLight = theme === 'light';

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
          checked 
            ? 'bg-sky-500' 
            : isLight ? 'bg-slate-300' : 'bg-slate-700'
        } ${className}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

