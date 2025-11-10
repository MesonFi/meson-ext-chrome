import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider, TooltipArrow } from '~/src/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { type FC, useState } from 'react';


interface ITooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  contentSide?: 'top' | 'right' | 'bottom' | 'left'
  contentClassName?: string
  showArrow?: boolean
  disabled?: boolean
}
export const MessageTooltip: FC<ITooltipProps> = ({ children, content, contentSide = 'top', contentClassName, showArrow = false, disabled }) => {
  const [open, setOpen] = useState(false)
  return (
    <TooltipProvider>
      <Tooltip open={open && !disabled}>
        <TooltipTrigger asChild>
          <div
            className='messageTooltipInner flex items-center justify-center'
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => {
              setOpen(false);
            }}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side={contentSide} className={cn('text-xs font-normal leading-[18px]', contentClassName)}>
          {showArrow && <TooltipArrow className='fill-white' />}
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
