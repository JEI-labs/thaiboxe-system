import { Skeleton } from "./skeleton";

interface UseSkeletonProps {
  waitFor: boolean;
  children: JSX.Element;
  className: string;
}

export function UseSkeleton({
  waitFor,
  children,
  className,
}: UseSkeletonProps): JSX.Element {
  return !!waitFor ? children : <Skeleton className={className} />;
}
