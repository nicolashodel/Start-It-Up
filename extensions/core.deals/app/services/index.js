import currencyFormatter from 'currency-formatter';

import {
  DISCOUNT_FIXED,
  DISCOUNT_PERCENTAGE,
} from '../const';

export * from './deals';
export * from './maps';

export function formatPrice(price, currency) {
  const roundedPrice = Number(parseFloat(price).toFixed(2));
  return currencyFormatter.format(roundedPrice, { code: currency });
}

export function calculateDiscountPrice(deal) {
  if (deal.discountPrice <= 0) {
    return 0;
  }

  if (deal.discountType === DISCOUNT_PERCENTAGE) {
    const discountPercentagePrice = (deal.discountPrice / 100) * deal.regularPrice;
    const discountPrice = deal.regularPrice - discountPercentagePrice;
    return (discountPrice);
  }

  if (deal.discountType === DISCOUNT_FIXED) {
    return (deal.regularPrice - deal.discountPrice);
  }

  return (deal.regularPrice);
}

export function calculateDiscount(deal) {
  let discount = 0;

  if (deal.discountPrice <= 0) {
    return discount;
  }

  if (deal.discountType === DISCOUNT_PERCENTAGE) {
    const discountPercentage =
      ((deal.discountPrice - deal.regularPrice) / Math.abs(deal.regularPrice)) * 100;
    discount = Number(parseFloat(discountPercentage).toFixed(2));
  } else if (deal.discountType === DISCOUNT_FIXED) {
    discount = (deal.regularPrice - deal.discountPrice);
  } else {
    discount = (deal.regularPrice - deal.discountPrice);
  }

  return Math.abs(discount);
}

export function formatTwoDigitNumber(number) {
  if (number >= 100) {
    return number;
  }

  return (`0${number}`).substr(-2, 2);
}

export function getFormattedDiscount(deal) {
  return (deal.discountType === DISCOUNT_PERCENTAGE)
    ? `- ${calculateDiscount(deal)}%`
    : `- ${formatPrice(calculateDiscount(deal), deal.currency)}`;
}
