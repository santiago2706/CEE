import { Link } from 'react-router-dom';
import { LegalPageLayout, LegalSection, type LegalTocItem } from '@/components/legal/LegalPageLayout';
import { CONTACT_INFO } from '@/constants/contact.constants';
import { ROUTES } from '@/constants/routes';

const TOC: LegalTocItem[] = [
  { id: 'responsable', title: 'Responsable del tratamiento' },
  { id: 'datos', title: 'Datos que recolectamos' },
  { id: 'finalidades', title: 'Finalidades del tratamiento' },
  { id: 'base-legal', title: 'Base legal y consentimiento' },
  { id: 'conservacion', title: 'Plazo de conservación' },
  { id: 'encargados', title: 'Encargados y transferencias' },
  { id: 'derechos', title: 'Derechos ARCO' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'contacto', title: 'Contacto' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidad"
      lastUpdated="[FECHA VIGENCIA]"
      toc={TOC}
      intro={
        <p>
          En [RAZÓN SOCIAL] valoramos y protegemos tus datos personales. Esta política explica qué
          datos recolectamos, con qué finalidad y cómo puedes ejercer tus derechos, conforme a la
          Ley N.° 29733, Ley de Protección de Datos Personales del Perú, y su reglamento.
        </p>
      }
    >
      <LegalSection id="responsable" title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de los datos es [RAZÓN SOCIAL], con RUC [RUC] y domicilio
          en {CONTACT_INFO.address}. Para cualquier consulta sobre privacidad puedes escribirnos a{' '}
          <a href={`mailto:${CONTACT_INFO.email}`} className="text-cee-red hover:underline">
            {CONTACT_INFO.email}
          </a>{' '}
          o a [CORREO DPO].
        </p>
      </LegalSection>

      <LegalSection id="datos" title="2. Datos que recolectamos">
        <p>Podemos recolectar las siguientes categorías de datos:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Datos de identificación y contacto: nombre, correo electrónico y teléfono.</li>
          <li>
            Datos de interés académico: programa o curso de interés y mensajes que nos envíes.
          </li>
          <li>
            Datos de navegación: información técnica recopilada mediante cookies (ver sección 8).
          </li>
        </ul>
        <p>
          Solo recolectamos los datos que nos proporcionas voluntariamente a través de nuestros
          formularios (inscripción, contacto) y los necesarios para el funcionamiento del sitio.
        </p>
      </LegalSection>

      <LegalSection id="finalidades" title="3. Finalidades del tratamiento">
        <ul className="list-disc space-y-1 pl-5">
          <li>Atender tus solicitudes de información, inscripción y consultas.</li>
          <li>Contactarte por correo, teléfono o WhatsApp en relación con nuestros programas.</li>
          <li>
            Enviarte comunicaciones de marketing sobre programas y novedades, cuando hayas dado tu
            consentimiento.
          </li>
          <li>Mejorar y mantener la seguridad y el funcionamiento del sitio web.</li>
        </ul>
      </LegalSection>

      <LegalSection id="base-legal" title="4. Base legal y consentimiento">
        <p>
          El tratamiento de tus datos se basa en el consentimiento que otorgas al completar
          nuestros formularios y al aceptar esta política. El consentimiento para finalidades de
          marketing es libre y revocable en cualquier momento, sin que ello afecte la prestación de
          los servicios solicitados.
        </p>
      </LegalSection>

      <LegalSection id="conservacion" title="5. Plazo de conservación">
        <p>
          Conservaremos tus datos durante el tiempo necesario para cumplir las finalidades
          descritas y mientras exista una relación contigo, o hasta que solicites su supresión,
          salvo que una obligación legal exija conservarlos por un período mayor: [PLAZO DE
          CONSERVACIÓN].
        </p>
      </LegalSection>

      <LegalSection id="encargados" title="6. Encargados y transferencias">
        <p>
          Para prestar nuestros servicios utilizamos proveedores tecnológicos que actúan como
          encargados del tratamiento, entre ellos servicios de infraestructura y base de datos
          (p. ej. Supabase) que pueden alojar información fuera del Perú. En todos los casos
          exigimos garantías adecuadas de seguridad y confidencialidad conforme a la normativa
          aplicable.
        </p>
      </LegalSection>

      <LegalSection id="derechos" title="7. Tus derechos (ARCO)">
        <p>
          Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos
          personales (derechos ARCO), así como a revocar tu consentimiento. Para ejercerlos, envía
          una solicitud a{' '}
          <a href={`mailto:${CONTACT_INFO.email}`} className="text-cee-red hover:underline">
            {CONTACT_INFO.email}
          </a>
          , indicando el derecho que deseas ejercer y adjuntando un documento que acredite tu
          identidad. Atenderemos tu solicitud en los plazos previstos por la Ley N.° 29733.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="8. Cookies">
        <p>
          Utilizamos cookies y tecnologías similares para el funcionamiento del sitio y, con tu
          consentimiento, para fines de analítica y marketing. Puedes conocer el detalle y gestionar
          tus preferencias en nuestra{' '}
          <Link to={ROUTES.COOKIES} className="text-cee-red hover:underline">
            Política de Cookies
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="contacto" title="9. Contacto">
        <p>
          Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos, contáctanos
          en{' '}
          <a href={`mailto:${CONTACT_INFO.email}`} className="text-cee-red hover:underline">
            {CONTACT_INFO.email}
          </a>{' '}
          o al {CONTACT_INFO.phone}. También puedes revisar nuestros{' '}
          <Link to={ROUTES.TERMS} className="text-cee-red hover:underline">
            Términos y Condiciones
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
