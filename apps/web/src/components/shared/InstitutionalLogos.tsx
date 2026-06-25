import ceeLogo from '@/assets/icons/logo1.png';
import uniLogo from '@/assets/icons/uni-logo.png';
import ccatLogo from '@/assets/icons/ccat-logo.png';

interface InstitutionalLogosProps {
  className?: string;
}

const BACKERS = [
  { name: 'UNI', src: uniLogo },
  { name: 'CEE-FIIS', src: ceeLogo },
  { name: 'CCAT', src: ccatLogo },
];

export function InstitutionalLogos({ className }: InstitutionalLogosProps) {
  return (
    <div className={`flex flex-wrap items-center gap-8 sm:gap-10 ${className ?? ''}`}>
      {BACKERS.map((backer) => (
        <img
          key={backer.name}
          src={backer.src}
          alt={backer.name}
          className="h-24 w-auto object-contain sm:h-28"
        />
      ))}
    </div>
  );
}
