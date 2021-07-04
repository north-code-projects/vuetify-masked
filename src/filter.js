import { formatFloat, formatText } from './utils/formatter'
import { prepareMask } from './utils/preparator'

function formatMask (options) {
  var m = []
      if (typeIsText(options)) {
        if (Array.isArray(options.formatMask)) {
          for (var i = 0; i < options.formatMask.length; i++) {
            let c = options.formatMask[i]
            
            let o = prepareMask(c, {}, cmpMaskCharacter(options))
            
            m.push(o)
          }
        } else {
          let stringMask = options.formatMask.split('')
          
          for (var j = 0; j < stringMask.length; j++) {
            let c = stringMask[j]

            let o = prepareMask(c, {}, cmpMaskCharacter(options))

            m.push(o)
          }
        }
      }
      return m
}

function typeIsText (options) {
  if (options.type === 'text') {
    return true
  } else {
    return false
  }
}

function typeIsFloat (options) {
  if (['percentage', 'currency', 'integer', 'float'].indexOf(options.type) !== -1) {
    return true
  } else {
    return false
  }
}

function cmpMaskCharacter (options) {
  let v = options.maskCharacter.filter(char => char != options.falseCharWildcard)
  return v
}

function cmpPrecision (options) {
  if (options.type === 'integer') {
    return 0
  } else {
    return options.precision
  } 
}

function cmpSuffix (options) {
  if (options.type === 'percentage') {
    return options.suffix || '%'
  } else if (options.type === 'currency') {
    return options.suffix || 'USD'
  } else {
    return options.suffix || ''
  }
}

export default (value, options) => {
  let defaultOptions = {
    type: 'text',
    formatMask: '##########',
    deformatMask: null,
    maskCharacter: ['-', '.', ',', ' ', '/', '(', ')', '_', '\\', '\'', '~', '*', '&', '"', '?'],
    empty: null,
    precision: 2,
    locale: 'en-EN',
    suffix: null,
    falseCharWildcard: ''
  }

  defaultOptions = Object.assign(defaultOptions, options)

  let result = defaultOptions.empty

  if (typeIsText(defaultOptions)) {
    result = formatText(value, formatMask(defaultOptions), cmpMaskCharacter(defaultOptions), '')
  } else if (typeIsFloat(defaultOptions)) {
    result = formatFloat(value, defaultOptions.locale, cmpPrecision(defaultOptions), defaultOptions.empty, true, false)
  }

  return result + cmpSuffix(defaultOptions)
}