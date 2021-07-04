import { clearValue } from './preparator'
import { transformChar } from './transformer'
import { charIsValid } from './validator'

export function formatText (value, mask, charsToClear, falseCharWildcard) {
  let result = ''
  value = clearValue(value, charsToClear)
  let count = 0
  let maskSuffix = ''
  if (value != null && value !== '') {
    let arrayValue = value.toString().split('')
    for (var i = 0; i < mask.length; i++) {
      if (i < arrayValue.length + count) {
        if (mask[i].partOfMask) {
          result += mask[i].mask
          count++
        } else {
          let c = arrayValue[i - count]

          let m = Object.assign({}, mask[i])

          if (!charIsValid(c, m, true)) {
            c = falseCharWildcard
            count -= 1 - falseCharWildcard.length
            i -= 1 - falseCharWildcard.length
          }

          result += transformChar(c, m)
        }
      } else {
        if (mask[i].partOfMask) {
          maskSuffix += mask[i].mask
        } else {
          maskSuffix = ''
          break
        }
      }
    }
  }

  result += maskSuffix

  return result
}

export function formatFloat (value, locale, precision, nanWildcard, checkIfEmpty = false, checkIfNotEmpty = false) {
  let result = ''

  if (value != null && value !== '' && value !== '-' && value !== '+' && !isNaN(parseFloat(value))) result = parseFloat(value).toLocaleString(locale, {minimumFractionDigits: precision, maximumFractionDigits: precision})
  else if (value === '-' || value === '+') result = value
  else if (value != null && value !== '' && isNaN(parseFloat(value)) && nanWildcard != null && checkIfNotEmpty) result = nanWildcard
  else if ((value == null || value == '') && nanWildcard != null && checkIfEmpty) result = nanWildcard

  return result
}