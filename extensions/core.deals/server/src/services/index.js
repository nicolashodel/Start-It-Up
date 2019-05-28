import DealsApi from './dealsApi';
const dealsApi = new DealsApi();

import Types from './types';
const types = new Types();

export {
  dealsApi,
  types,
};

export {
  dateToString,
} from './dateConverter';