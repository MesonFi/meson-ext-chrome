import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/app/lib/utils';
import classNames from 'classnames';

const buttonVariants = cva(
  'inline-flex items-center justify-center transition-colors whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:bg-disableColor disabled:bg-none disabled:text-textColor3',
  {
    variants: {
      variant: {
        primary:
          'bg-primaryColor text-white backdrop-blur-[10px] hover:bg-primaryColorHover active:bg-active disabled:bg-disableColor',
        secondary:
          'bg-secondaryBg text-textColor1 hover:bg-primaryColorHover hover:text-white active:bg-active disabled:bg-disableColor disabled:text-textColor3',
        default: 'active:outline-active active:outline-1 focus:outline-1 focus:[outline-style:solid] focus:outline-primaryColor active:[outline-style:solid] active:bg-active/5 active:text-active hover:outline-primaryColorHover outline-1 [outline-style:solid] hover:text-primaryColorHover outline-borderColor text-primaryColor disabled:outline-disableColor disabled:bg-white bg-white hover:bg-primaryColorHover/[0.06]',
        main: 'bg-primaryColorLinear hover:bg-primaryColorLinearHover text-[#fff] active:bg-primaryColorLinearActive',
        error: 'text-white bg-error hover:bg-errorHover active:bg-errorActive',
        roundeOutline: '!pl-2 !pr-3 !py-[3px] !rounded-full !text-sm border hover:border-primaryColorHover hover:text-primaryColorHover bg-white hover:bg-primaryColorHover/5 active:bg-active/5 active:border-active active:text-active gap-1 border-borderColor text-textColor2 font-normal',
      },
      size: {
        xs: 'py-0 px-3 text-base rounded',
        sm: 'px-5 py-1 rounded-md text-base rounded xs:rounded-lg',
        lg: 'px-10 py-[12px] rounded-xl text-base font-medium',
        default: 'py-[6px] px-10 text-base rounded-lg xs:rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  subText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      loading,
      variant = 'default',
      size,
      asChild = false,
      block,
      subText,
      icon,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const extCls = block ? 'w-full' : '';
    const content = React.useMemo(() => {
      if (!subText) {
        return children;
      }
      return (
        <span>
          <div>{children}</div>
          <div className='text-center text-sm not-italic font-medium leading-[100%] mt-[6px]'>
            {subText}
          </div>
        </span>
      );
    }, [children, subText]);
    const loadingClass = {
      main: 'group-hover:bg-[linear-gradient(282deg,#02C78D_-40%,#04D0D1_140%);] bg-[linear-gradient(282deg,#00D395_-40%,#04DDDE_140%);]',
      default: 'bg-[#fff]',
      primary: 'bg-primaryColor group-hover:bg-primaryColorHover',
      secondary: 'bg-secondaryBg',
      error: 'bg-error group-hover:bg-errorHover'
    }
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className: `${className} ${extCls} group select-none` })
        )}
        ref={ref}
        {...props}
      >
        {icon}
        {loading ? (
          <div className='scale-[0.8] xs:scale-[1] h-[24px] flex items-center justify-center'>
            <div className={cn(
              'relative',
              ['sm', 'xs'].includes(size as string) ? 'w-[15px] h-[15px]' : 'w-[33px] h-[33px]',
              (size === 'default' || !size) && 'w-[24px] h-[24px]'
            )}>
              <span className={classNames(
                'relative block w-full h-full rounded-full animate-spin',
                ['main', 'primary', 'error'].includes(variant as string) ? 'bg-[conic-gradient(transparent,#fff)]' :'bg-[conic-gradient(transparent,#25C696)]'
              )}></span>
              <span className={classNames(
                'absolute w-[75%] h-[75%] rounded-full left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
                props.disabled ? `${['main', 'primary', 'secondary'].includes(variant as string) ? 'bg-disableColor' : 'bg-[#fff]'}` : loadingClass[variant as keyof typeof loadingClass]
              )}></span>
            </div>
          </div>
        ) : (
          content
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
