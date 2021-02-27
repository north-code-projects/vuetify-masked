export function transformChar(c, mask) {
  if(mask.toUpperCase) {
    c = c.toUpperCase()
  }

  if(mask.toLowerCase) {
    c = c.toLowerCase()
  }

  return c
}