import { chatbotService } from '@/services/chatbot.service';

const quickActions = [
  { label: 'Ver cursos', query: '¿Qué cursos tienen? Muéstrame el catálogo' },
  { label: 'Inscripción', query: '¿Cómo me inscribo en un curso?' },
  { label: 'Contacto', query: '¿Cómo los contacto?' },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => chatbotService.sendQuickAction(action.query)}
          className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 border-[#7B1E2E] bg-white text-[#7B1E2E] hover:bg-[#7B1E2E] hover:text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-[0_2px_0_rgba(123,30,46,0.2)] hover:shadow-[0_4px_0_#5a1520] active:shadow-[0_1px_0_#5a1520] whitespace-nowrap"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
