import { clearValue } from './preparator'
import { transformChar } from './transformer'
import { charIsValid } from './validator'

export function formatText(value, mask, charsToClear, falseCharWildcard) {
  value = clearValue(value, charsToClear)
  let result = ""
  let count = 0
  if(value) {
    let arrayValue = value.toString().split("")
    for(var i = 0; i < mask.length; i++) {
      if(i < arrayValue.length + count) {
        if(mask[i].partOfMask) {
          result += mask[i].mask
          count++
        } else {
          let c = arrayValue[i - count]

          let m = Object.assign({}, mask[i])

          if(!charIsValid(c, m, true)) {
            c = falseCharWildcard
            count -= 1 - falseCharWildcard.length
            i -= 1 - falseCharWildcard.length
          }

          result += transformChar(c, m)
        }
      }
    }
  }

  return result
}

export function formatFloat(value, locale, precision) {
  let result = ""

  if(value) {
    result = parseFloat(value).toLocaleString(locale, {minimumFractionDigits: precision, maximumFractionDigits: precision})
  }

  return result
}