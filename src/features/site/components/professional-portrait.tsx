import { SafeImage } from "@/components/shared/safe-image";
import { IMAGES } from "@/data/images";
import type { Professional } from "@/features/professionals/types";
import { cn } from "@/utils/cn";

/** Retrato do profissional (foto cadastrada ou retrato temporário padrão). */
export function ProfessionalPortrait({ professional, className, showCro = true, sizes = "(max-width: 768px) 90vw, 380px" }: { professional: Professional; className?: string; showCro?: boolean; sizes?: string }) {
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden rounded-[22px] bg-sand", className)}>
      <SafeImage
        src={professional.photo || IMAGES.professionals[professional.id] || IMAGES.fallback.avatar}
        alt={`${professional.title} ${professional.name}`}
        fill
        sizes={sizes}
        className="object-cover object-top"
        fallback="avatar"
      />
      {showCro ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-2 backdrop-blur">{professional.cro}</span>
      ) : null}
    </div>
  );
}
