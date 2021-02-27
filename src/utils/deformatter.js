import {clearValue} from './preparator'

export function deformatFloat(value, precision, charsToClear) {
  let result = ""

  if(value) {
    result = clearValue(value, charsToClear)
    console.log('deformatFloat', result)
    result = result.padStart(precision + 1, '0')
    console.log('deformatFloat', result)
    result = result.substring(0, result.length - precision) + '.' + result.substring(result.length - precision)
    console.log('deformatFloat', result)
  }

  return result
}