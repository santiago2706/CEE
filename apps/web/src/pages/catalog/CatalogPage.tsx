import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { Course, CourseCategory, CourseModality } from '@cee/types';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import type { FilterState } from '@/components/catalog/FilterSidebar';
import { PaginationControls } from '@/components/catalog/PaginationControls';
import { CourseCard } from '@/components/shared/CourseCard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { coursesService } from '@/services/courses.service';

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Más recientes' },
];

const EMPTY_FILTERS: FilterState = {
  categories: [] as CourseCategory[],
  modalities: [] as CourseModality[],
  priceMin: '',
  priceMax: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applySort(courses: Course[], sortBy: SortOption): Course[] {
  const copy = [...courses];
  switch (sortBy) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    default:
      return copy; // relevance = orden original del mock
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogPage() {
  // Estado base
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controles de UI
  const [search, setSearch] = useState('');
  /** Lo que el usuario está editando en el sidebar — aún no aplicado */
  const [draftFilters, setDraftFilters] = useState<FilterState>(EMPTY_FILTERS);
  /** Filtros confirmados — los que realmente afectan los resultados */
  const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    coursesService
      .getAll({ pageSize: 100 }) // traemos todo, filtramos/paginamos client-side
      .then((res) => {
        if (isMounted) {
          // Solo mostramos cursos publicados en el catálogo público
          setAllCourses(res.data.filter((c) => c.status === 'published'));
        }
      })
      .catch(() => {
        if (isMounted) setError('No se pudo cargar el catálogo. Intenta de nuevo.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Filtrado + ordenamiento (client-side) ──────────────────────────────────
  const filtered = useMemo(() => {
    let results = [...allCourses];

    // Búsqueda por texto
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q),
      );
    }

    // Categoría
    if (activeFilters.categories.length > 0) {
      results = results.filter((c) => activeFilters.categories.includes(c.category));
    }

    // Modalidad
    if (activeFilters.modalities.length > 0) {
      results = results.filter((c) => activeFilters.modalities.includes(c.modality));
    }

    // Rango de precio
    const min = activeFilters.priceMin !== '' ? Number(activeFilters.priceMin) : null;
    const max = activeFilters.priceMax !== '' ? Number(activeFilters.priceMax) : null;
    if (min !== null) results = results.filter((c) => c.price >= min);
    if (max !== null) results = results.filter((c) => c.price <= max);

    return applySort(results, sortBy);
  }, [allCourses, search, activeFilters, sortBy]);

  // ── Paginación ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }
  function handleSort(value: SortOption) {
    setSortBy(value);
    setPage(1);
  }
  /** Confirma el borrador y lo convierte en filtros activos */
  function handleApply() {
    setActiveFilters(draftFilters);
    setPage(1);
    setIsMobileFilterOpen(false);
  }
  /** Limpia borrador y filtros activos + resetea todo */
  function handleClearFilters() {
    setDraftFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setSearch('');
    setSortBy('relevance');
    setPage(1);
  }

  const isDirty = JSON.stringify(draftFilters) !== JSON.stringify(activeFilters);

  const hasActiveFilters =
    search.trim() !== '' ||
    activeFilters.categories.length > 0 ||
    activeFilters.modalities.length > 0 ||
    activeFilters.priceMin !== '' ||
    activeFilters.priceMax !== '';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Programas</h1>
        <p className="mt-2 text-muted-foreground">
          Explora nuestra oferta académica y encuentra el programa que impulse tu carrera.
        </p>
      </div>

      {/* Barra de búsqueda + ordenamiento + botón filtros mobile */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Buscador */}
        <div className="relative flex-1 sm:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            id="catalog-search"
            type="search"
            placeholder="Buscar por título o descripción…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cee-red"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Ordenamiento */}
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortOption)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cee-red"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Botón filtros (solo mobile) */}
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:border-cee-red hover:text-cee-red md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {(hasActiveFilters || isDirty) && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cee-red text-[10px] font-bold text-white">
                    !
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <FilterSidebar
                draft={draftFilters}
                isDirty={isDirty}
                onDraftChange={setDraftFilters}
                onApply={handleApply}
                onClear={handleClearFilters}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Layout principal: sidebar desktop + grid */}
      <div className="flex gap-8">
        {/* Sidebar (solo desktop) */}
        <div className="hidden w-56 shrink-0 md:block">
          <FilterSidebar
            draft={draftFilters}
            isDirty={isDirty}
            onDraftChange={setDraftFilters}
            onApply={handleApply}
            onClear={handleClearFilters}
          />
        </div>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <LoadingGrid />
          ) : error ? (
            <p className="py-16 text-center text-sm text-destructive">{error}</p>
          ) : filtered.length === 0 ? (
            <EmptyState onClear={handleClearFilters} hasFilters={hasActiveFilters} />
          ) : (
            <>
              {/* Contador siempre visible */}
              <p className="mb-4 text-sm text-muted-foreground">
                Mostrando{' '}
                <span className="font-medium text-foreground">
                  {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
                </span>{' '}
                de{' '}
                <span className="font-medium text-foreground">{filtered.length}</span>{' '}
                resultado{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              <PaginationControls
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes locales ───────────────────────────────────────────────────

function LoadingGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-lg bg-secondary"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function EmptyState({
  onClear,
  hasFilters,
}: {
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-lg font-semibold">Sin resultados</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasFilters
          ? 'Ningún programa coincide con los filtros aplicados.'
          : 'No hay programas disponibles en este momento.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-md bg-cee-red px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
