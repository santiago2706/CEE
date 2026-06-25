import { Download } from 'lucide-react';
import { BROCHURE_FILENAME, BROCHURE_URL } from '@/constants/brochure.constants';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface BrochureDownloadButtonProps {
  className?: string;
  variant?: 'solid' | 'outline';
}

export function BrochureDownloadButton({
  className,
  variant = 'outline',
}: BrochureDownloadButtonProps) {
  const handleClick = () => {
    trackEvent('brochure_download', { file: BROCHURE_FILENAME });
  };

  return (
    <a
      href={BROCHURE_URL}
      download={BROCHURE_FILENAME}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
        variant === 'solid'
          ? 'bg-cee-red text-white hover:bg-cee-red-dark'
          : 'border-2 border-cee-red text-cee-red hover:bg-cee-red hover:text-white',
        className,
      )}
    >
      <Download className="h-4 w-4" />
      Descargar brochure
    </a>
  );
}
