import _ from 'lodash';
import convert from 'convert-units';
import { dateToString } from 'src/services';

const EXPIRATION_TIME_REGEX = /^0|(\d{1,3})(h|min)$/; // 0 or 15h or 15min
const MILLISECONDS = 'ms';

export function isExpirationTimeValid(expirationTime) {
  const expirationTimeString = _.toString(expirationTime);
  return !!expirationTimeString.match(EXPIRATION_TIME_REGEX);
}

function toServerExpirationTime(expirationTime) {
  if (!isExpirationTimeValid(expirationTime)) {
    return 0;
  }

  const expirationTimeString = _.toString(expirationTime);
  if (expirationTimeString === '0') {
    return 0;
  }

  const [__, value, unit] = expirationTimeString.match(EXPIRATION_TIME_REGEX);
  return convert(value).from(unit).to(MILLISECONDS);
}

function toDisplayExpirationTime(expirationTime) {
  if (expirationTime === 0) {
    return '0';
  }

  const display =
    convert(expirationTime)
      .from(MILLISECONDS)
      .toBest({ exclude: ['d', 'week', 'month', 'year'] });

  return `${display.val}${display.unit}`;
}

function isCouponsLimited(deal) {
  const remainingCoupons = _.get(deal, 'remainingCoupons', null);
  const couponsEnabled = _.get(deal, 'couponsEnabled', false);

  return couponsEnabled && !_.isNull(remainingCoupons);
}

function calculateTotalCoupons(deal) {
  const remainingCoupons = _.get(deal, 'remainingCoupons', null);
  const claimedCoupons = _.get(deal, 'claimedCoupons', null);
  const redeemedCoupons = _.get(deal, 'redeemedCoupons', null);
  const couponsEnabled = _.get(deal, 'couponsEnabled', false);

  if (!couponsEnabled) {
    return null;
  }

  if (!isCouponsLimited(deal)) {
    return null;
  }

  return (
    _.toNumber(remainingCoupons) +
    _.toNumber(claimedCoupons) +
    _.toNumber(redeemedCoupons)
  );
}

/**
 * Transforms UI object to object suitable for communication with server
 */
export function mapViewToModel(deal, catalog) {
  const {
    regularPrice,
    discountPrice,
    couponsExpirationTime,
    claimedCoupons,
    redeemedCoupons,
    remainingCoupons,
    couponsEnabled,
    startTime,
    endTime,
    publishTime,
  } = deal;

  const totalCoupons = calculateTotalCoupons(deal);
  const couponsLimited = isCouponsLimited(deal);

  const available = (
    !couponsEnabled ||
    !couponsLimited ||
    _.toNumber(remainingCoupons) > 0
  );

  return {
    ..._.omit(deal, ['place', 'categories']),
    catalog,
    couponsLimited,
    available,
    totalCoupons,
    claimedCoupons: claimedCoupons || 0,
    redeemedCoupons: redeemedCoupons || 0,
    regularPrice: _.toNumber(regularPrice),
    discountPrice: _.toNumber(discountPrice),
    startTime: dateToString(startTime),
    endTime: dateToString(endTime),
    publishTime: publishTime ? dateToString(publishTime) : dateToString(startTime),
    couponsExpirationTime: toServerExpirationTime(couponsExpirationTime),
  };
}

/**
 * Transforms server object to object suitable for displaying on UI
 */
export function mapModelToView(deal) {
  const {
    couponsEnabled,
    couponsExpirationTime,
    place,
    startTime,
    endTime,
    publishTime,
    ...otherDealProps,
  } = deal;

  const expirationTime = couponsEnabled ? toDisplayExpirationTime(couponsExpirationTime) : null;
  const placeId = _.get(place, 'id');

  return {
    couponsEnabled,
    couponsExpirationTime: expirationTime,
    place: placeId,
    startTime: dateToString(startTime),
    endTime: dateToString(endTime),
    publishTime: dateToString(publishTime),
    ...otherDealProps,
  };
}
