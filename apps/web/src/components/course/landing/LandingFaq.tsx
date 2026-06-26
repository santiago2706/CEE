import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeading } from './SectionHeading';

const FAQS = [
  {
    question: '¿Puedo pagar en cuotas?',
    answer:
      'Sí. Aceptamos pago en cuotas con tarjetas de crédito de bancos seleccionados, además de depósito o transferencia bancaria. Escríbenos por WhatsApp y te enviamos las opciones disponibles.',
  },
  {
    question: '¿Qué pasa si no puedo asistir a una sesión en vivo?',
    answer:
      'Todas las sesiones quedan grabadas y disponibles en la plataforma. Puedes consultarlas las veces que necesites durante toda la duración del programa.',
  },
  {
    question: '¿El certificado tiene validez profesional?',
    answer:
      'Sí. Al aprobar el programa recibirás un certificado del CEE-FIIS que respalda tu formación bajo estándares académicos rigurosos.',
  },
  {
    question: '¿Necesito experiencia previa?',
    answer:
      'Depende del nivel del programa. En la sección de requisitos previos detallamos el perfil recomendado; si tienes dudas, nuestro equipo puede orientarte antes de inscribirte.',
  },
];

/** Preguntas frecuentes (reutiliza el Accordion del sistema de diseño). */
export function LandingFaq() {
  return (
    <div>
      <SectionHeading align="center" eyebrow="Resolvemos tus dudas" title="Preguntas frecuentes" />
      <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-border px-4">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="font-semibold">{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
