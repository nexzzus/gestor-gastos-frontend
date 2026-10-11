export type BudgetStatus = 'activo' | 'completado' | 'alerta' | 'excedido';

export const STATUS_STYLES: Record<
  BudgetStatus,
  { badge: string; label: string; bar: string; text: string; bg: string; message: string }
> = {
  activo: {
    badge: 'bg-emerald-300 text-emerald-900',
    label: 'Activo',
    bar: 'bg-emerald-500',
    text: 'text-emerald-800',
    bg: 'bg-emerald-500',
    message: 'Ritmo financiero saludable',
  },
  completado: {
    badge: 'bg-slate-200 text-slate-700',
    label: 'Completado',
    bar: 'bg-blue-700',
    text: 'text-slate-700',
    bg: 'bg-blue-700',
    message: 'Presupuesto cumplido, buen trabajo',
  },
  alerta: {
    badge: 'bg-red-200 text-red-800',
    label: 'Alerta >80%',
    bar: 'bg-red-400',
    text: 'text-red-700',
    bg: 'bg-red-400',
    message: 'Estás cerca del límite, modera tus gastos',
  },
  excedido: {
    badge: 'bg-red-200 text-red-800',
    label: 'Límite superado',
    bar: 'bg-red-600',
    text: 'text-red-700',
    bg: 'bg-red-600',
    message: 'Superaste tu presupuesto este mes',
  },
};
