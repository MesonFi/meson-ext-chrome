import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  src: string;
  className?: string;
}

/**
 * SvgIcon 组件 - 将 SVG URL 转换为 inline SVG
 * 这样可以通过 className 控制 SVG 内部的 currentColor
 *
 * 使用方式:
 * import Icon from '@assets/icons/copy.svg'
 * <SvgIcon src={Icon} className="w-4 h-4 text-gray-600 hover:text-gray-900" />
 */
export const SvgIcon: React.FC<SvgIconProps> = ({ src, className, ...props }) => {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    // 如果是 data URL (Plasmo 打包后的格式)
    if (src.startsWith('data:image/svg+xml')) {
      try {
        // 解码 data URL
        const base64Data = src.split(',')[1];
        const decoded = atob(base64Data);
        setSvgContent(decoded);
      } catch (e) {
        console.error('Failed to decode SVG data URL:', e);
      }
    } else {
      // 否则通过 fetch 获取
      fetch(src)
        .then(res => res.text())
        .then(text => setSvgContent(text))
        .catch(e => console.error('Failed to load SVG:', e));
    }
  }, [src]);

  if (!svgContent) {
    return <span className={className} {...props} />;
  }

  return (
    <span
      className={classNames('inline-flex items-center justify-center', className)}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};

export default SvgIcon;
