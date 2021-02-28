import { formatFloat, formatText } from "./utils/formatter";
import { prepareMask } from './utils/preparator'

let globalOptions = {
  type: 'text',
  formatMask: '##########',
  deformatMask: null,
  maskCharacter: ['-', '.', ',', ' ', '/', '(', ')', '_', '\\', '\'', '~', '*', '&', '"', '?'],
  empty: null,
  precision: 2,
  locale: 'en-EN',
  length: null,
  suffix: null,
  falseCharWildcard: ''
}

function formatMask () {
  var m = []
      if(typeIsText) {
        if(Array.isArray(globalOptions.formatMask)) {
          for(var i = 0; i < globalOptions.formatMask.length; i++) {
            let c = globalOptions.formatMask[i]
            
            let o = prepareMask(c, {}, cmpMaskCharacter())
            
            m.push(o)
          }
        } else {
          let stringMask = globalOptions.formatMask.split('')
          
          for(var i = 0; i < stringMask.length; i++) {
            let c = stringMask[i]

            let o = prepareMask(c, {}, cmpMaskCharacter()) //TODO use a function that removes

            m.push(o)
          }
        }
      }
      return m
}

function typeIsText() {
  if(globalOptions.type === 'text') {
    return true
  } else {
    return false
  }
}

function typeIsFloat() {
  if(['percentage', 'currency', 'integer', 'float'].indexOf(globalOptions.type) !== -1) {
    return true
  } else {
    return false
  }
}

function cmpMaskCharacter() {
  let v = globalOptions.maskCharacter.filter(char => char != globalOptions.falseCharWildcard)
  return v
}

export default (value, options) => {
  /*
    TODO
    * assign default options to options
    * format the value with the correct options
  */

  globalOptions = Object.assign(globalOptions, options)

  let result = globalOptions.empty

  if(typeIsText()) {
    result = formatText(value, formatMask(), [], '')
  } else if (typeIsFloat()) {
    result = formatFloat(value, globalOptions.locale, globalOptions.precision)
  }

  return result
}