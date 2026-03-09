import moment from 'moment';

export function formatDate(date: Date, format = 'DD/MM/YYYY HH:mm:ss') {
  return moment(date).format(format);
}

export function formatDateNoTime(date: Date, format = 'DD/MM/YYYY') {
  return moment(date).format(format);
}

export function getDiffYear(date: Date) {
  return moment().diff(date, 'years');
}
