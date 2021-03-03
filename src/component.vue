<template>
  <v-text-field
    v-model="cmpValue"
    v-on:keypress="keyPress"
    v-on:paste="paste"
    v-on:keydown="keyDown"
    v-on:keyup="$emit('keyup')"
    v-on:blur="blur"
    v-on:change="$emit('change')"
    v-on:click="$emit('click')"
    v-on:focus="$emit('focus')"
    v-on:mousedown="$emit('mousedown')"
    v-on:mouseup="mouseUp"
    :maxlength="maxLength"
    :label="label"
    :hint="cmpHint"
    :suffix="cmpSuffix"
    v-bind="properties"
    ref="textfield"
  >
  </v-text-field>
</template>

<script>
/*
  TODO
  * ERRORS
  * keyPress needs to check if max number of chars is already reached...
  *
  * FEATURES
  * handle deletion of maskedChars => if (start !== end) and only masked chars got deleted block if (start === end) and only masked chars got deleted jump to next char that is not part of mask (keyDown & keyPress)
  ** onlyMaskedCharGotDeleted is already used for backspace. use it for delete and keyPress!
  ** currently no distinction between start !== end and start === end
*/
import { clearValue, prepareMask } from './utils/preparator'
import { formatText, formatFloat } from './utils/formatter'
import { deformatFloat } from './utils/deformatter'
import { transformChar } from './utils/transformer'
import { charIsValid } from './utils/validator'

export default {
  name: 'v-text-field-masked',
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
  model: {
    prop: "value",
    event: "input"
  },
  props: {
    value: {
      type: [String, Number],
      default: 0
    },
    type: {
      type: String,
      default: 'text',
      validator: function(value) {
        return ['text', 'percentage', 'currency', 'integer', 'float'].indexOf(value) !== -1
      }
    },
    label: {
      type: String,
      default: ""
    },
    properties: {
      type: Object,
      default: function() {
        return {}
      }
    },
    formatMask: {
      type: [String, Array],
      default: '##########'
    },
    deformatMask: {
      type: [String, Array]
    },
    maskCharacter: {
      type: Array,
      default: function() {
        return ['-', '.', ',', ' ', '/', '(', ')', '_', '\\', '\'', '~', '*', '&', '"', '?']
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
      default: function() {
        return {}
      }
    },
    falseCharWildcard: {
      type: String,
      default: '',
      validator: function(value) {
        return value.length <= 1
      }
    }
  },
  computed: {
    cmpValue: {
      get() {
        let formattedValue = this.format(this.value)

        if(formattedValue && formattedValue.length >= this.maxLength) {
          this.maxLengthReached = true
        } else {
          this.maxLengthReached = false
        }

        return formattedValue
      },
      set(newValue) {
        if(newValue.length >= this.maxLength) {
          this.maxLengthReached = true
        } else {
          this.maxLengthReached = false
        }

        this.$nextTick(() => {
          if(this.$refs.textfield) {
            this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart)
          }
        })

        this.$emit("input", this.deformat(newValue))
      }
    },
    cmpHint() {
      if (this.$options.propsData['properties'] && this.properties.hasOwnProperty('hint')) {
        return this.properties.hint
      } else {
        return this.hint
      }
    },
    cmpHints() {
      return Object.assign(this.defaultHints, this.hints)
    },
    cmpFormatMask() {
      var m = []
      if(this.typeIsText) {
        if(Array.isArray(this.formatMask)) {
          for(var i = 0; i < this.formatMask.length; i++) {
            let c = this.formatMask[i]
            
            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)
            
            m.push(o)
          }
        } else {
          let stringMask = this.formatMask.split('')
          
          for(var i = 0; i < stringMask.length; i++) {
            let c = stringMask[i]

            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)

            m.push(o)
          }
        }
      }
      return m
    },
    cmpDeformatMask() {
      var m = []
      if(this.typeIsText && !this.deformatMaskPropSet) {
        if(Array.isArray(this.formatMask)) {
          for(var i = 0; i < this.formatMask.length; i++) {
            let c = this.formatMask[i]

            if(this.cmpMaskCharacter.includes(c) || this.cmpMaskCharacter.includes(c.mask)) {
              continue
            }
            
            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)
            
            m.push(o)
          }
        } else {
          let stringMask = this.formatMask.split('')
          
          for(var i = 0; i < stringMask.length; i++) {
            let c = stringMask[i]

            if(this.cmpMaskCharacter.includes(c) || this.cmpMaskCharacter.includes(c.mask)) {
              continue
            }

            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)

            m.push(o)
          }
        }
      } else if(this.typeIsText) {
        if(Array.isArray(this.deformatMask)) {
          for(var i = 0; i < this.deformatMask.length; i++) {
            let c = this.deformatMask[i]
            
            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)
            
            m.push(o)
          }
        } else {
          let stringMask = this.deformatMask.split('')
          
          for(var i = 0; i < stringMask.length; i++) {
            let c = stringMask[i]

            let o = prepareMask(c, this.cmpHints, this.cmpMaskCharacter)

            m.push(o)
          }
        }
      }
      return m
    },
    maxLength() {
      if(this.typeIsText) {
        return this.cmpFormatMask.length
      } else if(this.typeIsFloat && this.length) {
        let value = '1'.repeat(this.length)
        value = formatFloat(value, this.locale, this.cmpPrecision)
        return value.length
      } else {
        return null
      }
    },
    typeIsText() {
      if(this.type === 'text') {
        return true
      } else {
        return false
      }
    },
    typeIsFloat() {
      if(['percentage', 'currency', 'integer', 'float'].indexOf(this.type) !== -1) {
        return true
      } else {
        return false
      }
    },
    cmpPrecision() {
      if(this.type === 'integer') {
        return 0
      } else {
        return this.precision
      }
    },
    cmpSuffix() {
      if(this.type === 'percentage') {
        return this.suffix || '%'
      } else if(this.type === 'currency') {
        return this.suffix || 'USD'
      } else {
        return this.suffix
      }
    },
    deformatMaskPropSet() {
      return this.$options.propsData.deformatMask ? true : false
    },
    cmpMaskCharacter() {
      let v = this.maskCharacter.filter(char => char != this.falseCharWildcard)
      return v
    }
  },
  methods: {
    format: function(value) {
      if(value && this.typeIsText) {
        value = formatText(value, this.cmpFormatMask, this.cmpMaskCharacter, this.falseCharWildcard)
      } else if (value && this.typeIsFloat) {
        value = formatFloat(value, this.locale, this.cmpPrecision)
      } else {
        value = this.empty
      }

      this.$nextTick(() => {
        if(this.$refs.textfield && this.selectionStart != null ) {
          this.$refs.textfield.$refs.input.selectionStart = this.selectionStart
          this.$refs.textfield.$refs.input.selectionEnd = this.selectionStart
          this.selectionStart = null
        }
      })

      return value
    },
    deformat: function(value) {
      if(value && this.typeIsText) {
        value = formatText(value, this.cmpDeformatMask, this.cmpMaskCharacter, this.falseCharWildcard)
        if(value === '') {
          value = this.empty
        }
      } else if (value && this.typeIsFloat) {
        value = deformatFloat(value, this.cmpPrecision, this.cmpMaskCharacter)
        if(value === '') {
          value = this.empty
        }
      } else {
        value = this.empty
      }
      return value
    },
    keyPress: function(evt) {
      let preventedDefault = false
      if(this.cmpMaskCharacter.includes(evt.key)) {
        preventedDefault = true
        evt.preventDefault()
      }

      let cursor = this.$refs.textfield.$refs.input.selectionStart
      let cnt = 0;

      if(this.typeIsText) {
        for(var i = cursor; i < this.cmpFormatMask.length; i++) {
          if(!this.cmpFormatMask[i].partOfMask) {
            if(!charIsValid(evt.key, this.cmpFormatMask[i], true)) {
              preventedDefault = true
              evt.preventDefault()
            }
            break
          }
          else {
            cnt++
          }
        }
      } else if (this.typeIsFloat) {
        if(isNaN(parseFloat(evt.key))) {
          preventedDefault = true
          evt.preventDefault()
        } else {
          let value = this.cmpValue != null ? this.cmpValue.toString() : ''
          let l = value.length
          value = [value.slice(0, cursor), evt.key, value.slice(cursor)].join('')
          value = deformatFloat(value, this.cmpPrecision, this.cmpMaskCharacter)
          value = formatFloat(value, this.locale, this.cmpPrecision)
          cnt = value.length - l - 1
        }
      }

      this.selectionStart = cursor + (preventedDefault ? 0 : cnt + 1)
      this.nextCharHint(cursor + (preventedDefault ? 0 : cnt + 1))
      
      this.$emit('keypress')
    },
    paste: function(evt) {
      evt.preventDefault()

      let cursor = this.$refs.textfield.$refs.input.selectionStart
      let cursorEnd = this.$refs.textfield.$refs.input.selectionEnd
      let originalPaste = clearValue(evt.clipboardData.getData('text'), this.cmpMaskCharacter)

      let paste = ''
      let pastePos = 0
      let cnt = 0

      if(this.typeIsText) {
        for(var i = cursor; i < this.cmpFormatMask.length; i++) {
          if(pastePos > originalPaste.length) {
            break
          }
          if(!this.cmpFormatMask[i].partOfMask) {
            if(!charIsValid(originalPaste.charAt(pastePos), this.cmpFormatMask[i], true)) {
              i--
            } else {
              paste += transformChar(originalPaste.charAt(pastePos), this.cmpFormatMask[i])
            }
            
            pastePos++
          } else {
            cnt++
          }
        }
      } else if(this.typeIsFloat) {
        originalPaste = originalPaste.split('')
        for(var i = 0; i < originalPaste.length; i++) {
          if(!isNaN(parseFloat(originalPaste[i]))) {
            paste += originalPaste[i]
          }
        }
        let value = this.cmpValue != null ? this.cmpValue.toString() : ''
        value = [value.slice(0, cursor), paste, value.slice(cursorEnd)].join('')
        let l = value.length
        value = deformatFloat(value, this.cmpPrecision, this.cmpMaskCharacter)
        value = formatFloat(value, this.locale, this.cmpPrecision)
        cnt = (value.length - l - paste.length) + cursor > 0 ? (value.length - l - paste.length) : 0
      }
      
      let cmpValueCopy = this.cmpValue != null ? this.cmpValue.toString() : ''
      this.cmpValue = [cmpValueCopy.slice(0, cursor), paste, cmpValueCopy.slice(cursorEnd)].join('')
      this.selectionStart = cursor + cnt + paste.length
      this.nextCharHint(cursor + cnt + paste.length)
      this.$emit('paste')
    },
    keyDown: function(evt) {
      let cursorStart = this.$refs.textfield.$refs.input.selectionStart
      let cursorEnd = this.$refs.textfield.$refs.input.selectionEnd

      let cnt = 0
      switch (evt.keyCode) {
        case 8:
          //backspace
          cnt = 0

          if (!this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart - 1 : cursorStart, cursorStart === cursorEnd ? cursorStart - 1 : cursorEnd - 1)) {
            if(this.typeIsFloat) {
              let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
              let start = cursorStart === cursorEnd ? cursorStart - 1 : cursorStart
              let end = cursorStart === cursorEnd ? cursorStart : cursorEnd
              let l = cmpValue.length - end
              cmpValue = [cmpValue.slice(0, start), cmpValue.slice(end)].join('')
              cmpValue = deformatFloat(cmpValue, this.cmpPrecision, this.cmpMaskCharacter)
              cmpValue = formatFloat(cmpValue, this.locale, this.cmpPrecision)
              cnt = cmpValue.length - l
              this.selectionStart = cnt
            }
            else if(cursorStart !== cursorEnd) {
              this.selectionStart = cursorStart + cnt
            } else {
              this.selectionStart = cursorStart - 1 + cnt
            }
            
            this.nextCharHint(this.selectionStart)
          } else {
            evt.preventDefault()
          }
          
          break
        case 35:
          //End
          let lEnd = this.cmpValue != null ? this.cmpValue.length : 0
          this.nextCharHint(lEnd)
          break
        case 36:
          //Home (Pos1)
          this.nextCharHint(0)
          break
        case 37:
          //left arrow
          this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart - 1)
          break
        case 38:
          //up arrow
          this.nextCharHint(0)
          break
        case 39:
          //right arrow
          let lRight = this.cmpValue != null ? this.cmpValue.length : 0
          this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart + (this.$refs.textfield.$refs.input.selectionStart < lRight ? 1 : 0))
          break
        case 40:
          //down arrow
          let lDown = this.cmpValue != null ? this.cmpValue.length : 0
          this.nextCharHint(lDown)
          break
        case 46:
          //delete
          cnt = 0
          if (!this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart : cursorStart, cursorStart === cursorEnd ? cursorStart : cursorEnd - 1)) {
            if(this.typeIsFloat) {
              let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
              let end = cursorStart === cursorEnd ? cursorStart + 1 : cursorEnd
              let l = cmpValue.length - end
              cmpValue = [cmpValue.slice(0, cursorStart), cmpValue.slice(end)].join('')
              cmpValue = deformatFloat(cmpValue, this.cmpPrecision, this.cmpMaskCharacter)
              cmpValue = formatFloat(cmpValue, this.locale, this.cmpPrecision)
              cnt = cmpValue.length - l
              this.selectionStart = cnt
            }
            else {
              this.selectionStart = cursorStart + cnt
            }
            this.nextCharHint(this.selectionStart)
          } else {
            evt.preventDefault()
          }
          break
        case 88:
          //check for ctrl+x
          if(evt.ctrlKey && cursorStart !== cursorEnd) {
            cnt = 0

            if (!this.onlyMaskedCharGotDeleted(cursorStart === cursorEnd ? cursorStart - 1 : cursorStart, cursorStart === cursorEnd ? cursorStart - 1 : cursorEnd - 1)) {
              if(this.typeIsFloat) {
                let cmpValue = this.cmpValue != null ? this.cmpValue.toString() : ''
                let start = cursorStart === cursorEnd ? cursorStart - 1 : cursorStart
                let end = cursorStart === cursorEnd ? cursorStart : cursorEnd
                let l = cmpValue.length - end
                cmpValue = [cmpValue.slice(0, start), cmpValue.slice(end)].join('')
                cmpValue = deformatFloat(cmpValue, this.cmpPrecision, this.cmpMaskCharacter)
                cmpValue = formatFloat(cmpValue, this.locale, this.cmpPrecision)
                cnt = cmpValue.length - l
                this.selectionStart = cnt
              }
              else if(cursorStart !== cursorEnd) {
                this.selectionStart = cursorStart + cnt
              } else {
                this.selectionStart = cursorStart - 1 + cnt
              }
              
              this.nextCharHint(this.selectionStart)
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
    mouseUp: function(evt) {
      this.nextCharHint(this.$refs.textfield.$refs.input.selectionStart)
      this.$emit('mouseup')
    },
    blur: function(evt) {
      this.hint = ''
      this.$emit('blur')
    },
    nextCharHint(position) {
      this.hint = ''
      if(this.maxLengthReached) {
        this.hint = this.cmpHints.maxLength
      } else if(this.typeIsText) {
        if(position < 0) {
          position = 0
        }

        for(var i = position; i < this.cmpFormatMask.length; i++) {
          if(!this.cmpFormatMask[i].partOfMask) {
            this.hint = this.cmpFormatMask[i].hint
            break
          }
        }
      } else if(this.typeIsFloat) {
        this.hint = this.cmpHints.numeric
      }
    },
    onlyMaskedCharGotDeleted(start, end) {
      let res = true

      if(this.cmpValue) {
        for(var i = start; i <= end; i++) {
          if(!this.cmpMaskCharacter.includes(this.cmpValue.charAt(i))) {
            res = false
            break
          }
        }
      }

      return res
    }
  },
  watch: {
    cmpValue(value) {
      if(!value || value.length === 0) {
        this.nextCharHint(0)
      }
    }
  }
}
</script>