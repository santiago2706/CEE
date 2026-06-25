export interface InstitutionalStat {
  label: string;
  value: string;
}

/** Cifras institucionales mostradas en `StatsCounter` (Home, Nosotros). */
export const INSTITUTIONAL_STATS: InstitutionalStat[] = [
  { label: 'Egresados', value: '15,000+' },
  { label: 'Años de experiencia', value: '25+' },
  { label: 'Programas activos', value: '50+' },
  { label: 'Docentes certificados', value: '200+' },
];
