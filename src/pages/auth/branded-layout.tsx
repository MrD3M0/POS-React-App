import { cn } from "@/lib/utils";

interface BrandedLayoutProps {
  className?: string;
}

const BrandedLayout = ({ className }: BrandedLayoutProps) => {
  return (
    <aside
      className={cn(
        "relative overflow-hidden bg-zinc-950",
        className,
      )}
    >
      <img
        src="/ZapBranded.png"
        alt="Zap — Speed Meets Simplicity"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-10 text-white xl:p-14">
        <p className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
          One login for everyone.
        </p>
        <p className="mt-3 max-w-sm text-sm/6 text-white/80">
          Admins, principals, accountants, teachers and staff all sign in from
          the same place.
        </p>
      </div>
    </aside>
  );
};

export default BrandedLayout;
