import moment from 'moment';

export function dateToString(date) {
  return moment(date).toISOString(true);
}
