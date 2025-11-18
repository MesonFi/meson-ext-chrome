import React from 'react';
import classNames from 'classnames';

// 导入所有 SVG 图标
const icons = {
  // 示例图标，您可以添加更多
  // home: () => import('@assets/icons/home.svg'),
  // settings: () => import('@assets/icons/settings.svg'),
};

export type IconName = keyof typeof icons;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name?: IconName;
  size?: number | string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Icon 组件 - 用于渲染 SVG 图标
 *
 * 使用方式1 - 使用预定义的图标名称:
 * <Icon name="home" size={24} />
 *
 * 使用方式2 - 直接传入 SVG 内容:
 * <Icon size={24}>
 *   <path d="..." />
 * </Icon>
 *
 * 使用方式3 - 直接导入 SVG 文件作为组件:
 * import HomeIcon from '@assets/icons/home.svg?react'
 * <HomeIcon className="w-6 h-6" />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className,
  children,
  ...props
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames('inline-block', className)}
      {...props}
    >
      {children}
    </svg>
  );
};

export default Icon;
