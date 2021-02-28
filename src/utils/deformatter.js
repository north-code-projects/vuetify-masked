import {clearValue} from './preparator'

export function deformatFloat(value, precision, charsToClear) {
  let result = ""

  if(value) {
    result = clearValue(value, charsToClear)
    result = result.padStart(precision + 1, '0')
    result = result.substring(0, result.length - precision) + '.' + result.substring(result.length - precision)
  }

  return result
}