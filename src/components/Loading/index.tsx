import { cn } from "~/app/lib/utils";
import './index.css';

interface ILoadingProps {
  className?: string;
  width?: number;
  height?: number;
  pure?: boolean;
}

const Loading = (props: ILoadingProps) => {
  const {width, height, pure} = props;
  return (
    <div
      className={cn(pure ? 'loadingPureBlock' : 'loadingBlock', 'rounded-md', props.className)}
      style={{
        width,
        height
      }}
    ></div>
  );
};

export default Loading;
