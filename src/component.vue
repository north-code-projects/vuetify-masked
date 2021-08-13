<template>
  <v-text-field
    ref="textfield"
    v-model="cmpValue"
    :maxlength="maxLength"
    :label="label"
    :hint="cmpHint"
    :suffix="cmpSuffix"
    v-bind="properties"
    @keypress="keyPress"
    @paste="paste"
    @keydown="keyDown"
    @keyup="$emit('keyup')"
    @blur="blur"
    @change="$emit('change')"
    @click="$emit('click')"
    @focus="$emit('focus')"
    @mousedown="$emit('mousedown')"
    @mouseup="mouseUp"
  >
    <template
      v-for="(_, slot) of $slots"
      #[slot]
    >
      <slot :name="slot" />
    </template>
  </v-text-field>
</template>

<script>
import { clearValue, prepareMask } from './utils/preparator'
import { formatText, formatFloat } from './utils/formatter'
import { deformatFloat } from './utils/deformatter'
import { transformChar } from './utils/transformer'
import { charIsValid } from './utils/validator'

export default {
  name: 'VTextFieldMasked',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    type: {
      type: String,
      default: 'text',
      validator: function (value) {
        return ['text', 'percentage', 'currency', 'integer', 'float'].indexOf(value) !== -1
      }
    },
    label: {
      type: String,
      default: ''
    },
    properties: {
      type: Object,
      default: function () {
        return {}
      }
    },
    formatMask: {
      type: [String, Array],
      default: '##########'
    },
    deformatMask: {
      type: [String, Array],
      default: ''
    },
    maskCharacter: {
      type: Array,
      default: function () {
        return ['-', '+', '.', ',', ' ', '/', '(', ')', '_', '\\', '\'', '~', '*', '&', '"', '?']
      }
    },
    empty: {
      type: String,
      default: null
    },
    precision: {
      type: Number,
      default: 2
    },
    locale: {
      type: String,
      default: 'en-EN'
    },
    length: {
      type: Number,
      default: null
    },
    suffix: {
      type: String,
      default: null
    },
    hints: {
      type: Object,
      default: function () {
        return {}
      }
    },
    showHints: {
      type: Boolean,
      default: false 
    },
    falseCharWildcard: {
      type: String,
      default: '',
      validator: function (value) {
        return value.length <= 1
      }
    }
  },
  data: () => (
    {
      selectionStart: null,
      hint: '',
      maxLengthReached: false,
      defaultHints: {
        digit: 'The next char is a digit',
        alphabetic: 'The next char is alphabetic',
        lowerCase: 'The next char is lower case',
        upperCase: 'The next char is upper case',
        alphanumeric: 'The next char is alphanumeric',
        numeric: null,
        maxLength: 'Max number of characters reached'
      }
    }
  ),
  computed: {
    cmpValue: {
      get () {
        let formattedValue = this.format(this.value)

        return formattedValue
      },
      set (newValue) {
        if (this.maxLength && newValue && newValue.length >= this.maxLength) {
          this.maxLengthReached = true
        } else {
          this.maxLengthReached = false
        }

        this.$nextTick(() => {
          if (this.$refs.textfield) {
            this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart)
          }
        })

        this.$emit('input', this.deformat(newValue))
      }
    },
    cmpHint () {
      if (this.$options.propsData['properties'] && Object.prototype.hasOwnProperty.call(this.properties, 'hint')) {
        return this.properties.hint
      } else {
        return this.hint
      }
    },
    cmpHints () {
      return Object.assign(this.defaultHints, this.hints)
    },
    cmpFormatMask () {
      var m = []
      if (this.typeIsText) {
        if (Array.isArray(this.formatMask)) {
          for (var i = 0; i < this.formatMask.length; i++) {
            let c = this.formatMask[i]
            
            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)
            
            m.push(o)
          }
        } else {
          let stringMask = this.formatMask.split('')
          
          for (var j = 0; j < stringMask.length; j++) {
            let c = stringMask[j]

            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)

            m.push(o)
          }
        }
      }
      return m
    },
    cmpDeformatMask () {
      var m = []
      if (this.typeIsText && !this.deformatMaskPropSet) {
        if (Array.isArray(this.formatMask)) {
          for (var i = 0; i < this.formatMask.length; i++) {
            let c = this.formatMask[i]

            if (this.cmpMaskCharacter.includes(c) || this.cmpMaskCharacter.includes(c.mask)) {
              continue
            }
            
            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)
            
            m.push(o)
          }
        } else {
          let stringMask = this.formatMask.split('')
          
          for (var j = 0; j < stringMask.length; j++) {
            let c = stringMask[j]

            if (this.cmpMaskCharacter.includes(c) || this.cmpMaskCharacter.includes(c.mask)) {
              continue
            }

            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)

            m.push(o)
          }
        }
      } else if (this.typeIsText) {
        if (Array.isArray(this.deformatMask)) {
          for (var k = 0; k < this.deformatMask.length; k++) {
            let c = this.deformatMask[k]
            
            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)
            
            m.push(o)
          }
        } else {
          let stringMask = this.deformatMask.split('')
          
          for (var l = 0; l < stringMask.length; l++) {
            let c = stringMask[l]

            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)

            m.push(o)
          }
        }
      }
      return m
    },
    maxLength () {
      if (this.typeIsText) {
        return this.cmpFormatMask.length
      } else if (this.typeIsFloat && this.length) {
        let value = '1'.repeat(this.length)
        value = formatFloat(value, this.locale, this.cmpPrecision, this.falseCharWildcard)
        return value.length
      } else {
        return null
      }
    },
    typeIsText () {
      if (this.type === 'text') {
        return true
      } else {
        return false
      }
    },
    typeIsFloat () {
      if (['percentage', 'currency', 'integer', 'float'].indexOf(this.type) !== -1) {
        return true
      } else {
        return false
      }
    },
    cmpPrecision () {
      if (this.type === 'integer') {
        return 0
      } else {
        return this.precision
      }
    },
    cmpSuffix () {
      if (this.type === 'percentage') {
        return this.suffix || '%'
      } else if (this.type === 'currency') {
        return this.suffix || 'USD'
      } else {
        return this.suffix
      }
    },
    deformatMaskPropSet () {
      return this.$options.propsData.deformatMask ? true : false
    },
    cmpMaskCharacter () {
      let v = this.maskCharacter.filter(char => char != this.falseCharWildcard)
      return v
    }
  },
  watch: {
    cmpValue (formattedValue) {
      if (formattedValue && this.maxLength && formattedValue.length >= this.maxLength) {
        this.maxLengthReached = true
      } else {
        this.maxLengthReached = false
      }
    }
  },
  methods: {
    format: function (value) {
      if (value != null && value !== '' && this.typeIsText) {
        value = formatText(value, this.cmpFormatMask, this.cmpMaskCharacter, this.falseCharWildcard)
      } else if (value != null && value !== '' && this.typeIsFloat) {
        value = formatFloat(value, this.locale, this.cmpPrecision, this.falseCharWildcard)
      } else {
        value = this.empty
      }

      this.$nextTick(() => {
        if (this.$refs.textfield && this.selectionStart != null ) {
          this.$refs.textfield.$refs.input.selectionStart = this.selectionStart
          this.$refs.textfield.$refs.input.selectionEnd = this.selectionStart
          this.selectionStart = null
        }
      })

      return value
    },
    deformat: function (value) {
      if (value && this.typeIsText) {
        value = formatText(value, this.cmpDeformatMask, this.cmpMaskCharacter, this.falseCharWildcard)
        if (value === '') {
          value = this.empty
        }
      } else if (value && this.typeIsFloat) {
        value = deformatFloat(value, this.cmpPrecision, this.cmpMaskCharacter, this.type)
        if (value === '') {
          value = this.empty
        }
      } else {
        value = this.empty
      }
      return value
    },
    keyPress: function (evt) {
      let preventedDefault = false
      if (this.typeIsText && this.cmpMaskCharacter.includes(evt.key)) {
        preventedDefault = true
        evt.preventDefault()
      }

      let cursor = this.$refs.textfield.$refs.input.selectionStart
      let cursorEnd = this.$refs.textfield.$refs.input.selectionEnd
      let cnt = 0

      if (this.typeIsText) {
        for (var i = cursor; i < this.cmpFormatMask.length; i++) {
          if (!this.cmpFormatMask[i].partOfMask) {
            if (!charIsValid(evt.key, this.cmpFormatMask[i], true)) {
              preventedDefault = true
              evt.preventDefault()
            }
            break
          }
          else {
            cnt++
          }
        }
        this.selectionStart = cursor + (preventedDefault ? 0 : cnt + 1)
      } else if (this.typeIsFloat) {
        if (this.cmpValue && deformatFloat(this.cmpValue, this.cmpPrecision, this.cmpMaskCharacter) == 0 && evt.key === '0') {
          evt.preventDefault()
          let cmpValueSplit = this.cmpValue.split('')
          for (var j = cursorEnd; j < cmpValueSplit.length; j++) {
            if (this.maskCharacter.includes(cmpValueSplit[j])) {
              cnt++
            } else {
              break
            }
          }
          this.$refs.textfield.$refs.input.selectionStart = cursorEnd + cnt + 1
        } else {
          let firstChar = this.cmpValue ? this.cmpValue.toString().charAt(0) : ''
          if (isNaN(parseFloat(evt.key)) && !(cursor === 0 && (evt.key === '-' || evt.key === '+'))) {
            preventedDefault = true
            evt.preventDefault()
          } else if (cursor === 0 && (evt.key === '-' || evt.key === '+') && this.cmpValue && isNaN(parseFloat(firstChar) && evt.key === firstChar)) {
            preventedDefault = true
            evt.preventDefault()
            this.$refs.textfield.$refs.input.selectionStart = 1
          } else {
            let value = this.cmpValue != null ? this.cmpValue.toString() : ''
            let l = value.length
            value = [value.slice(0, cursor), evt.key, value.slice(cursorEnd)].join('')
            value = deformatFloat(value, this.cmpPrecision, this.cmpMaskCharacter)
            value = formatFloat(value, this.locale, this.cmpPrecision, this.falseCharWildcard)
            cnt = value.length - l - 1
          }
          this.selectionStart = cursorEnd + (preventedDefault ? cnt : cnt + 1)
        }
      }
      
      this.$emit('keypress')
    },
    paste: function (evt) {
      evt.preventDefault()

      let cursor = this.$refs.textfield.$refs.input.selectionStart
      let cursorEnd = this.$refs.textfield.$refs.input.selectionEnd
      let originalPaste = clearValue(evt.clipboardData.getData('text'), this.cmpMaskCharacter)

      let paste = ''
      let pastePos = 0
      let cnt = 0
      let prefix = cursor === 0 && (evt.clipboardData.getData('text').charAt(0) === '-' || evt.clipboardData.getData('text').charAt(0) === '+') ? evt.clipboardData.getData('text').charAt(0) : ''

      if (this.typeIsText) {
        for (var i = cursor; i < this.cmpFormatMask.length; i++) {
          if (pastePos > originalPaste.length) {
            break
          }
          if (!this.cmpFormatMask[i].partOfMask) {
            if (!charIsValid(originalPaste.charAt(pastePos), this.cmpFormatMask[i], true)) {
              i--
            } else {
              paste += transformChar(originalPaste.charAt(pastePos), this.cmpFormatMask[i])
            }
            
            pastePos++
          } else {
            cnt++
          }
        }
        this.selectionStart = cursor + cnt + paste.length
      } else if (this.typeIsFloat) {
        paste = prefix
        
        originalPaste = originalPaste.split('')
        for (var j = 0; j < originalPaste.length; j++) {
          if (!isNaN(parseFloat(originalPaste[j]))) {
            paste += originalPaste[j]
          }
        }
        let value = this.cmpValue != null ? this.cmpValue.toString() : ''
        value = [value.slice(0, cursor), paste, value.slice(cursorEnd)].join('')
        let l = value.length
        value = deformatFloat(value, this.cmpPrecision, this.cmpMaskCharacter)
        value = formatFloat(value, this.locale, this.cmpPrecision, this.falseCharWildcard)
        cnt = value.length - l
        this.selectionStart = cursor + cnt + paste.length
      }
      
      let cmpValueCopy = this.cmpValue != null ? this.cmpValue.toString() : ''
      this.cmpValue = [cmpValueCopy.slice(0, cursor), paste, cmpValueCopy.slice(cursorEnd)].join('')
      
      this.$emit('paste')
    },
    keyDown: function (evt) {
      let cursorStart = this.$refs.textfield.$refs.input.selectionStart
      let cursorEnd = this.$refs.textfield.$refs.input.selectionEnd

      let cnt = 0
      let end = 0
      var deleteCharAt = -1
      switch (evt.keyCode) {
        case 8:
          // backspace
          cnt = 0
          if (!this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart - 1 : cursorStart, cursorStart === cursorEnd ? cursorStart - 1 : cursorEnd - 1)) {
            if (this.typeIsFloat) {
              let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
              let originalValue = cmpValue
              let start = cursorStart === cursorEnd ? cursorStart - 1 : cursorStart
              let end = cursorStart === cursorEnd ? cursorStart : cursorEnd
              let l = cmpValue.length - end
              cmpValue = [cmpValue.slice(0, start), cmpValue.slice(end)].join('')
              cmpValue = deformatFloat(cmpValue, this.cmpPrecision, this.cmpMaskCharacter)
              cmpValue = formatFloat(cmpValue, this.locale, this.cmpPrecision, this.falseCharWildcard)
              cnt = cmpValue.length - l
              if (originalValue !== cmpValue) {
                this.selectionStart = cnt <= 0 ? 0 : cnt
              } else {
                evt.preventDefault()
              }
            }
            else if (cursorStart !== cursorEnd) {
              this.selectionStart = cursorStart + cnt
            } else {
              this.selectionStart = cursorStart - 1 + cnt
            }
            
            // this.nextCharHint(this.selectionStart)
          } else if (this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart - 1 : cursorStart, cursorStart === cursorEnd ? cursorStart - 1 : cursorEnd - 1) && cursorStart === cursorEnd) {
            let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
            deleteCharAt = -1

            for (var i = cursorStart - 1; i >= 0; i--) {
              if (!this.cmpMaskCharacter.includes(cmpValue.charAt(i))) {
                deleteCharAt = i
                break
              }
            }

            if (deleteCharAt !== -1) {
              this.cmpValue = [cmpValue.slice(0, deleteCharAt), cmpValue.slice(deleteCharAt + 1)].join('')
              this.selectionStart = deleteCharAt
            }

            evt.preventDefault()
          } else {
            evt.preventDefault()
          }
          
          break
        case 35:
          // End
          end = this.cmpValue != null ? this.cmpValue.length : 0
          this.nextCharHint(end)
          break
        case 36:
          // Home (Pos1)
          this.nextCharHint(0)
          break
        case 37:
          // left arrow
          this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart - 1)
          break
        case 38:
          // up arrow
          this.nextCharHint(0)
          break
        case 39:
          // right arrow
          end = this.cmpValue != null ? this.cmpValue.length : 0
          this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart + (this.$refs.textfield.$refs.input.selectionStart < end ? 1 : 0))
          break
        case 40:
          // down arrow
          end = this.cmpValue != null ? this.cmpValue.length : 0
          this.nextCharHint(end)
          break
        case 46:
          // delete
          cnt = 0
          if (!this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart : cursorStart, cursorStart === cursorEnd ? cursorStart : cursorEnd - 1)) {
            if (this.typeIsFloat) {
              let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
              let originalValue = cmpValue
              let end = cursorStart === cursorEnd ? cursorStart + 1 : cursorEnd
              let l = cmpValue.length - end
              cmpValue = [cmpValue.slice(0, cursorStart), cmpValue.slice(end)].join('')
              cmpValue = deformatFloat(cmpValue, this.cmpPrecision, this.cmpMaskCharacter)
              cmpValue = formatFloat(cmpValue, this.locale, this.cmpPrecision, this.falseCharWildcard)
              cnt = cmpValue.length - l
              if (originalValue !== cmpValue) {
                this.selectionStart = cnt <= 0 ? 0 : cnt
              } else {
                evt.preventDefault()
              }
            } else {
              this.selectionStart = cursorStart + cnt
            }
            // this.nextCharHint(this.selectionStart)
          } else if (this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart : cursorStart, cursorStart === cursorEnd ? cursorStart : cursorEnd - 1) && cursorStart === cursorEnd) {
            let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
            deleteCharAt = -1

            for (var j = cursorStart + 1; j < cmpValue.length; j++) {
              if (!this.cmpMaskCharacter.includes(cmpValue.charAt(j))) {
                deleteCharAt = j
                break
              }
            }

            if (deleteCharAt !== -1) {
              this.cmpValue = [cmpValue.slice(0, deleteCharAt), cmpValue.slice(deleteCharAt + 1)].join('')
              this.selectionStart = cursorStart
            }

            evt.preventDefault()
          } else {
            evt.preventDefault()
          }
          break
        case 88:
          // check for ctrl+x
          if (evt.ctrlKey && cursorStart !== cursorEnd) {
            cnt = 0

            if (!this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart - 1 : cursorStart, cursorStart === cursorEnd ? cursorStart - 1 : cursorEnd - 1)) {
              if (this.typeIsFloat) {
                let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
                let start = cursorStart === cursorEnd ? cursorStart - 1 : cursorStart
                let end = cursorStart === cursorEnd ? cursorStart : cursorEnd
                let l = cmpValue.length - end
                cmpValue = [cmpValue.slice(0, start), cmpValue.slice(end)].join('')
                cmpValue = deformatFloat(cmpValue, this.cmpPrecision, this.cmpMaskCharacter)
                cmpValue = formatFloat(cmpValue, this.locale, this.cmpPrecision, this.falseCharWildcard)
                cnt = cmpValue.length - l
                this.selectionStart = cnt
              }
              else if (cursorStart !== cursorEnd) {
                this.selectionStart = cursorStart + cnt
              } else {
                this.selectionStart = cursorStart - 1 + cnt
              }
              
              // this.nextCharHint(this.selectionStart)
            } else {
              evt.preventDefault()
            }
          }

          break
        default:
          break
      }
      this.$emit('keydown')
    },
    mouseUp: function () {
      this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart)
      this.$emit('mouseup')
    },
    blur: function () {
      this.hint = ''
      this.$emit('blur')
    },
    nextCharHint (position) {
      this.hint = ''
      if (this.showHints) {
        if (this.maxLengthReached) {
          this.hint = this.cmpHints.maxLength
        } else if (this.typeIsText) {
          if (position < 0) {
            position = 0
          }

          for (var i = position; i < this.cmpFormatMask.length; i++) {
            if (!this.cmpFormatMask[i].partOfMask) {
              this.hint = this.cmpFormatMask[i].hint
              break
            }
          }
        } else if (this.typeIsFloat) {
          this.hint = this.cmpHints.numeric
        }
      }
    },
    onlyMaskedCharGotDeleted (start, end) {
      let res = true
      if (this.cmpValue && this.typeIsFloat && start === 0) {
        res = false
      }
      else if (this.cmpValue) {
        for (var i = start; i <= end; i++) {
          if (!this.cmpMaskCharacter.includes(this.cmpValue.charAt(i))) {
            res = false
            break
          }
        }
      }

      return res
    }
  }
}
</script>