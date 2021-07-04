export function charIsValid (c, mask, typeIsText) {
  if (typeIsText && (mask.onlyAlphabetical && !isNaN(parseFloat(c))) || mask.onlyDigit && isNaN(parseFloat(c))) return false
  else return true
}