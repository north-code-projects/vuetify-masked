export function clearValue (value, charsToClear) {
  let result = ''
   if (value != null && value !== '') {
    let arrayValue = value.toString().split('')
    for (var i = 0; i < arrayValue.length; i++) {
      if (!charsToClear.includes(arrayValue[i])) result += arrayValue[i]
    }
  }
  return result
}

export function prepareMask (maskChar, hints, maskCharacters) {
  let o = Object.assign({}, {})
  var hint = ''

  if (maskChar instanceof String || typeof maskChar === 'string') {
    switch (maskChar) {
      case 'U':
        hint = hints.upperCase
        break
      case 'l':
        hint = hints.lowerCase
        break
      case 'A':
        hint = hints.alphabetic
        break
      case 'D':
        hint = hints.digit
        break
      default:
        hint = hints.alphanumeric
        break            
    }

    o.mask = maskChar
    o.replace = false
    o.partOfMask = maskCharacters.includes(maskChar)
    o.toUpperCase = maskChar === 'U'
    o.toLowerCase = maskChar === 'l'
    o.onlyDigit = maskChar === 'D'
    o.onlyAlphabetical = maskChar === 'A'
    o.hint = hint
  } else if (maskChar instanceof Object) {
    if (Object.prototype.hasOwnProperty.call(maskChar, 'toUpperCase') && maskChar.toUpperCase) hint = hints.upperCase
    else if (Object.prototype.hasOwnProperty.call(maskChar, 'toLowerCase') && maskChar.toLowerCase) hint = hints.lowerCase
    else if (Object.prototype.hasOwnProperty.call(maskChar, 'onlyAlphabetical') && maskChar.onlyAlphabetical) hint = hints.alphabetic
    else if (Object.prototype.hasOwnProperty.call(maskChar, 'onlyDigit') && maskChar.onlyDigit) hint = hints.digit
    else if (maskChar.mask === 'U') hint = hints.upperCase
    else if (maskChar.mask === 'l') hint = hints.lowerCase
    else if (maskChar.mask === 'A') hint = hints.alphabetic
    else if (maskChar.mask === 'D') hint = hints.digit
    else hint = hints.alphanumeric

    o.mask = maskChar.mask
    o.replace = Object.prototype.hasOwnProperty.call(maskChar, 'replace') ? maskChar.replace : false
    o.partOfMask = maskCharacters.includes(maskChar.mask)
    o.toUpperCase = Object.prototype.hasOwnProperty.call(maskChar, 'toUpperCase') ? maskChar.toUpperCase : maskChar.mask === 'U'
    o.toLowerCase = Object.prototype.hasOwnProperty.call(maskChar, 'toLowerCase') ? maskChar.toLowerCase : maskChar.mask === 'l'
    o.onlyDigit = Object.prototype.hasOwnProperty.call(maskChar, 'onlyDigit') ? maskChar.onlyDigit : maskChar.mask === 'D'
    o.onlyAlphabetical = Object.prototype.hasOwnProperty.call(maskChar, 'onlyAlphabetical') ? maskChar.onlyAlphabetical : maskChar.mask === 'A'
    o.hint = Object.prototype.hasOwnProperty.call(maskChar, 'hint') ? maskChar.hint.toString() : hint
  }

  return o
}