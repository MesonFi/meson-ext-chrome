import * as React from 'react';

import { cn } from '~/lib/utils';

import './input.css';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  cn(
    'relative flex w-full rounded-lg text-color-strong border placeholder:text-color-muted bg-[#fff] text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed',
  ),
  {
    variants: {
      variant: {
        default: 'hover:border-primary-hover focus-within:border-primary-hover',
        error: 'border-error hover:border-error focus-within:border-error',
        warning: 'border-warning hover:border-warning focus-within:border-warning'
      },
      size: {
        sm: 'py-[7px] px-3 text-sm',
        default: 'py-[11px] px-3 text-base',
        swap: 'py-[3px] px-2 text-base',
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>,
      VariantProps<typeof inputVariants> {
    suffix?: React.ReactNode;
    prefix?: React.ReactNode;
  }

const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      className,
      type,
      suffix,
      disabled,
      size,
      variant,
      prefix,
      onClick,
      ...props
    },
    ref
  ) => {

    return (
      <div
        className={cn(inputVariants({
          variant, size, className: `relative ${className}`
        }), prefix && 'gap-2')}
        onClick={onClick}
      >
        {prefix ? (
          <span
            className={cn(
              'text-right text-base font-normal leading-6 select-none',
            )}
          >
            {prefix}
          </span>
        ) : null}
        {suffix ? (
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 flex items-center',
            )}
          >
            {suffix}
          </span>
        ) : null}
        <input
          type={type}
          className={cn(
            'w-full text-color-strong [&::-webkit-inner-spin-button]:appearance-none inputGroup placeholder:text-color-muted focus:outline-none focus-visible:outline-none',
            suffix && 'pr-6'
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
