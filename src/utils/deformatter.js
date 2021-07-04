import {clearValue} from './preparator'

export function deformatFloat (value, precision, charsToClear, type) {
  let sign = value.charAt(0) === '-' || value.charAt(0) === '+' ? value.charAt(0) : ''
  let result = ''

  if (value != null && value !== '') {
    result += clearValue(value, charsToClear)
    if (type !== 'integer' && value !== '-' && value !== '+') {
      result = result.padStart(precision + 1, '0')
      result = result.substring(0, result.length - precision) + '.' + result.substring(result.length - precision)
    } else if (value === '-' || value === '+') result = 0
    result = sign + result
  }

  return result
}