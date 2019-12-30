import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

export const formatDate = dateToFormat =>
  format(parseISO(dateToFormat), 'dd/MM/yyyy', {
    locale: pt,
  });

export const formatPrice = price =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
