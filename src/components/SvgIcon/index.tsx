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

  // 检查 className 中是否包含尺寸相关的类（w-* 或 h-*）
  const hasSizeClass = className && /\b(w-\d+|h-\d+|w-\[|h-\[)\b/.test(className);

  // 修改 SVG 内容
  const modifiedSvgContent = svgContent.replace(
    /<svg([^>]*)>/,
    (match, attrs) => {
      if (hasSizeClass) {
        // 如果有尺寸类，移除固定的 width 和 height 属性，添加 w-full h-full
        let newAttrs = attrs.replace(/\s*(width|height)="[^"]*"/g, '');
        return `<svg${newAttrs} class="w-full h-full">`;
      } else {
        // 如果没有尺寸类，保持原样
        return match;
      }
    }
  );

  return (
    <span
      className={classNames('inline-flex items-center justify-center', className)}
      dangerouslySetInnerHTML={{ __html: modifiedSvgContent }}
      {...props}
    />
  );
};

export default SvgIcon;
