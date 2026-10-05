import { imageFocus, treatmentImage } from "@/data/images";
import type { TreatmentCategory } from "@/features/treatments/types";
import { cn } from "@/utils/cn";
import { SafeImage } from "./safe-image";

interface Props {
  slug?: string;
  category: TreatmentCategory;
  name: string;
  image?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Imagem do tratamento. Usa a imagem cadastrada no painel; na ausência,
 * a imagem padrão do tratamento em /public/images/treatments; e, se tudo
 * falhar, a imagem reserva da marca. Nunca renderiza área vazia.
 */
export function TreatmentVisual({ slug, name, image, className, sizes = "(max-width: 768px) 100vw, 400px", priority }: Props) {
  const src = image || treatmentImage(slug);
  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      <SafeImage
        src={src}
        alt={name}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: imageFocus(src) }}
        priority={priority}
        fallback="treatment"
      />
    </div>
  );
}
