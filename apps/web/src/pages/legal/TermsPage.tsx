import { Link } from 'react-router-dom';
import { LegalPageLayout, LegalSection, type LegalTocItem } from '@/components/legal/LegalPageLayout';
import { CONTACT_INFO } from '@/constants/contact.constants';
import { ROUTES } from '@/constants/routes';

const TOC: LegalTocItem[] = [
  { id: 'objeto', title: 'Objeto y aceptación' },
  { id: 'uso', title: 'Uso del sitio' },
  { id: 'inscripciones', title: 'Inscripciones y programas' },
  { id: 'propiedad', title: 'Propiedad intelectual' },
  { id: 'responsabilidad', title: 'Limitación de responsabilidad' },
  { id: 'datos', title: 'Protección de datos' },
  { id: 'modificaciones', title: 'Modificaciones' },
  { id: 'ley', title: 'Ley aplicable y jurisdicción' },
  { id: 'contacto', title: 'Contacto' },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      lastUpdated="[FECHA VIGENCIA]"
      toc={TOC}
      intro={
        <p>
          Estos Términos y Condiciones regulan el acceso y uso del sitio web de [RAZÓN SOCIAL]
          (RUC [RUC]). Al navegar y utilizar este sitio, aceptas íntegramente las condiciones aquí
          descritas.
        </p>
      }
    >
      <LegalSection id="objeto" title="1. Objeto y aceptación">
        <p>
          El presente documento establece las condiciones de uso del sitio web y de los servicios
          de información e inscripción que ofrecemos. Si no estás de acuerdo con estos términos, te
          pedimos no utilizar el sitio.
        </p>
      </LegalSection>

      <LegalSection id="uso" title="2. Uso del sitio">
        <ul className="list-disc space-y-1 pl-5">
          <li>Te comprometes a usar el sitio de forma lícita y conforme a estos términos.</li>
          <li>
            No está permitido interferir con el funcionamiento del sitio, intentar accesos no
            autorizados ni utilizarlo para fines fraudulentos.
          </li>
          <li>La información que proporciones debe ser veraz, exacta y actualizada.</li>
        </ul>
      </LegalSection>

      <LegalSection id="inscripciones" title="3. Inscripciones y programas">
        <p>
          La información de los programas (precios, fechas, modalidad y contenidos) es referencial y
          puede actualizarse. El envío de un formulario de inscripción o contacto constituye una
          solicitud de información y no garantiza, por sí mismo, una vacante. La confirmación de la
          inscripción está sujeta a los procesos y condiciones de [RAZÓN SOCIAL].
        </p>
      </LegalSection>

      <LegalSection id="propiedad" title="4. Propiedad intelectual">
        <p>
          Los contenidos del sitio (textos, logotipos, imágenes, marcas y diseños) son propiedad de
          [RAZÓN SOCIAL] o de sus titulares y están protegidos por la normativa de propiedad
          intelectual. Queda prohibida su reproducción o uso sin autorización previa.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" title="5. Limitación de responsabilidad">
        <p>
          El sitio se proporciona "tal cual". En la medida permitida por la ley, [RAZÓN SOCIAL] no
          será responsable por daños derivados del uso o imposibilidad de uso del sitio, ni por la
          disponibilidad o exactitud de contenidos de terceros enlazados.
        </p>
      </LegalSection>

      <LegalSection id="datos" title="6. Protección de datos">
        <p>
          El tratamiento de tus datos personales se rige por nuestra{' '}
          <Link to={ROUTES.PRIVACY} className="text-cee-red hover:underline">
            Política de Privacidad
          </Link>{' '}
          y nuestra{' '}
          <Link to={ROUTES.COOKIES} className="text-cee-red hover:underline">
            Política de Cookies
          </Link>
          , conforme a la Ley N.° 29733.
        </p>
      </LegalSection>

      <LegalSection id="modificaciones" title="7. Modificaciones">
        <p>
          Podemos modificar estos términos en cualquier momento. Los cambios entrarán en vigor desde
          su publicación en el sitio. El uso continuado del sitio implica la aceptación de los
          términos vigentes.
        </p>
      </LegalSection>

      <LegalSection id="ley" title="8. Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se
          someterá a los jueces y tribunales de [DISTRITO JUDICIAL], salvo disposición legal en
          contrario.
        </p>
      </LegalSection>

      <LegalSection id="contacto" title="9. Contacto">
        <p>
          Para consultas sobre estos términos, escríbenos a{' '}
          <a href={`mailto:${CONTACT_INFO.email}`} className="text-cee-red hover:underline">
            {CONTACT_INFO.email}
          </a>{' '}
          o llámanos al {CONTACT_INFO.phone}.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
