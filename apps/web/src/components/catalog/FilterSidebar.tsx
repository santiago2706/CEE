import type { CourseCategory, CourseModality } from '@cee/types';
import { cn } from '@/lib/utils';

const CATEGORIES: CourseCategory[] = [
  'Gestión',
  'Tecnología',
  'Finanzas',
  'Habilidades Blandas',
  'Ingeniería',
];

const MODALITIES: CourseModality[] = ['Virtual', 'Presencial', 'Híbrido'];

export interface FilterState {
  categories: CourseCategory[];
  modalities: CourseModality[];
  priceMin: string;
  priceMax: string;
}

interface FilterSidebarProps {
  /** Estado borrador: lo que el usuario está editando en el sidebar */
  draft: FilterState;
  /** ¿El borrador difiere de los filtros actualmente aplicados? */
  isDirty: boolean;
  onDraftChange: (draft: FilterState) => void;
  /** Confirma el borrador y aplica los filtros */
  onApply: () => void;
  /** Limpia borrador y filtros activos */
  onClear: () => void;
}

export function FilterSidebar({
  draft,
  isDirty,
  onDraftChange,
  onApply,
  onClear,
}: FilterSidebarProps) {
  function toggleCategory(cat: CourseCategory) {
    const next = draft.categories.includes(cat)
      ? draft.categories.filter((c) => c !== cat)
      : [...draft.categories, cat];
    onDraftChange({ ...draft, categories: next });
  }

  function toggleModality(mod: CourseModality) {
    const next = draft.modalities.includes(mod)
      ? draft.modalities.filter((m) => m !== mod)
      : [...draft.modalities, mod];
    onDraftChange({ ...draft, modalities: next });
  }

  const hasDraftValues =
    draft.categories.length > 0 ||
    draft.modalities.length > 0 ||
    draft.priceMin !== '' ||
    draft.priceMax !== '';

  return (
    <aside className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filtros</h2>
        {hasDraftValues && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-cee-red underline-offset-2 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Categoría */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Categoría
        </h3>
        <ul className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => {
            const checked = draft.categories.includes(cat);
            return (
              <li key={cat}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className={cn('h-4 w-4 rounded border-border accent-cee-red')}
                  />
                  <span className={cn(checked && 'font-medium text-foreground')}>
                    {cat}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <hr className="border-border" />

      {/* Modalidad */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Modalidad
        </h3>
        <ul className="flex flex-col gap-2">
          {MODALITIES.map((mod) => {
            const checked = draft.modalities.includes(mod);
            return (
              <li key={mod}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleModality(mod)}
                    className="h-4 w-4 rounded border-border accent-cee-red"
                  />
                  <span className={cn(checked && 'font-medium text-foreground')}>
                    {mod}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <hr className="border-border" />

      {/* Rango de precio */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Precio (S/)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Mín"
            value={draft.priceMin}
            onChange={(e) => onDraftChange({ ...draft, priceMin: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cee-red"
          />
          <span className="shrink-0 text-muted-foreground">—</span>
          <input
            type="number"
            min={0}
            placeholder="Máx"
            value={draft.priceMax}
            onChange={(e) => onDraftChange({ ...draft, priceMax: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cee-red"
          />
        </div>
      </section>

      <hr className="border-border" />

      {/* Acciones */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onApply}
          className={cn(
            'w-full rounded-md px-4 py-2 text-sm font-semibold transition',
            isDirty
              ? 'bg-cee-red text-white hover:opacity-90'
              : 'bg-cee-red text-white opacity-60 cursor-default',
          )}
        >
          Aplicar filtros
          {isDirty && (
            <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </button>
      </div>
    </aside>
  );
}
