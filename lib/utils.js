import { differenceInMonths, addMonths, formatDistanceToNowStrict } from "date-fns";

export function calcDecayScore(baseScore, serviceDate, cleaningType, minAtEndPercent=15) {
  // baseScore 0..100
  const months = differenceInMonths(new Date(), new Date(serviceDate));
  const total = cleaningType === "deep" ? 8 : 6; // months
  const minScore = Math.max(10, Math.min(20, minAtEndPercent)) ; // clamp to 10..20
  // linear decay from baseScore to minScore over 'total' months
  const m = Math.min(months, total);
  const decayed = baseScore - ((baseScore - minScore) * (m / total));
  return Math.max(minScore, Math.round(decayed));
}

export function warrantyExpired(serviceDate) {
  const expiry = addMonths(new Date(serviceDate), 1);
  return new Date() > expiry;
}

export function humanDurationFrom(dateStr) {
  try { return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true }); }
  catch { return ""; }
}
