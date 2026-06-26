import { Link } from 'react-router-dom';
import { LegalPageLayout, LegalSection, type LegalTocItem } from '@/components/legal/LegalPageLayout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useConsentStore } from '@/store/consentStore';

const TOC: LegalTocItem[] = [
  { id: 'que-son', title: '¿Qué son las cookies?' },
  { id: 'categorias', title: 'Categorías que usamos' },
  { id: 'gestion', title: 'Cómo gestionar tus preferencias' },
  { id: 'terceros', title: 'Cookies de terceros' },
];

export default function CookiePolicyPage() {
  const reopen = useConsentStore((s) => s.reopen);

  return (
    <LegalPageLayout
      title="Política de Cookies"
      lastUpdated="[FECHA VIGENCIA]"
      toc={TOC}
      intro={
        <p>
          Esta política explica cómo [RAZÓN SOCIAL] utiliza cookies y tecnologías similares en su
          sitio web, y cómo puedes gestionar tus preferencias. Complementa nuestra{' '}
          <Link to={ROUTES.PRIVACY} className="text-cee-red hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      }
    >
      <LegalSection id="que-son" title="1. ¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos que se almacenan en tu dispositivo cuando visitas un
          sitio web. Permiten que el sitio funcione correctamente, recordar tus preferencias y, con
          tu consentimiento, analizar el uso del sitio o mostrarte comunicaciones relevantes.
        </p>
      </LegalSection>

      <LegalSection id="categorias" title="2. Categorías que usamos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Necesarias:</strong> imprescindibles para el
            funcionamiento del sitio y la seguridad. Siempre están activas y no requieren
            consentimiento.
          </li>
          <li>
            <strong className="text-foreground">Analítica:</strong> nos ayudan a entender cómo se
            usa el sitio para mejorarlo. Solo se activan con tu consentimiento.
          </li>
          <li>
            <strong className="text-foreground">Marketing:</strong> permiten ofrecerte
            comunicaciones y contenidos relevantes sobre nuestros programas. Solo se activan con tu
            consentimiento.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="gestion" title="3. Cómo gestionar tus preferencias">
        <p>
          Puedes aceptar, rechazar o configurar las cookies en cualquier momento. Al actualizar tus
          preferencias, se aplicarán de inmediato. También puedes eliminar las cookies desde la
          configuración de tu navegador.
        </p>
        <div>
          <Button type="button" onClick={reopen} className="mt-1">
            Cambiar mis preferencias de cookies
          </Button>
        </div>
      </LegalSection>

      <LegalSection id="terceros" title="4. Cookies de terceros">
        <p>
          Actualmente no cargamos cookies de analítica ni de marketing de terceros sin tu
          consentimiento. Si en el futuro incorporamos servicios de terceros (por ejemplo,
          herramientas de medición o publicidad), se activarán únicamente cuando hayas otorgado tu
          consentimiento para la categoría correspondiente.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
