import type { ReactNode } from "react";

type WoodFrameProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export function WoodFrame({ children, className = "", innerClassName = "" }: WoodFrameProps) {
  return (
    <div className={`wood-frame relative ${className}`}>
      <div className={`wood-frame-inner relative ${innerClassName}`}>{children}</div>
    </div>
  );
}
