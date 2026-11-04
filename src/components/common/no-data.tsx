import {Lottie} from "lottie-react";
import emptyBox from "@/assets/lottie/Empty-Box.json";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  className?: string;
};

/** Fills all remaining space of its flex-col parent and centers the animation. */
const NoData = ({
  title = "No results found",
  description = "Try a different search.",
  className,
}: Props) => (
  <div
    className={cn(
      "flex flex-1 flex-col items-center justify-center px-4 py-12 text-center",
      className,
    )}
  >
    <div aria-hidden className="size-44">
      <Lottie src={emptyBox} loop autoplay />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
  </div>
);

export default NoData;
