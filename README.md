# vuetify-masked
Create a masked text field for vuetify 2.x based on v-text-field. Supported are static masks provided by string/object and the masking of float and integer values.
Additionally, a filter exists to format a value.

# Install

```
npm install vuetify-masked --save
```
## Global
```javascript
import Vue from 'vue'
import VuetifyMasked from 'vuetify-masked'

Vue.use(VuetifyMasked)
```

## Local
```javascript
// use only the component
import { VuetifyMaskedComponent } from 'vuetify-masked'

// use only the filter
import { VuetifyMaskedComponent } from 'vuetify-masked'

export default {
  components: {
    'v-text-field-masked': VuetifyMaskedComponent
  },
  filters: {
    VuetifyMaskedFilter
  }
}
```
# Usage
Once installed, for a simple mask the component can be used in a template as simple as:
```javascript
<v-text-field-masked
  v-model="text"
  formatMask="ADDD-ul/#####"
  :properties="{
    readonly: false,
    disabled: false,
    outlined: false,
    clearable: true,
  }"
  label="Masked Text"
></v-text-field-masked>
```
The filter can be used by the following:
```javascript
{{ text | vuetifyMaskedFilter({ formatMask: "ADDD-ul/#####", type: "text" }) }}
```

# Options (Component Props and Filter Parameters
The following options can be used for component and filter
|Option        |type           |Default           |Component  |Filter |Description |
|:-------------|:---           |:-----------------|:----------|:------|:-----------|
|v-model       |string, number |``null``          |yes        |no     |            |
|formatMask    |string, object |``'##########'``  |yes        |no     |Used to mask the given value. Meaining of characters and usable aatributes for obecjt can be foudn below table|
|deformatMask  |string, object |``null``          |yes        |no     |Mask used to deformat the masked value. If null all characters of the masked will be removed |
|type          |string         |``'text'``        |yes        |yes    |5 types exist: text, float, integer, currency, and percentage |
|maskCharacter |array          |``['-', '.', ',', ' ', '/', '(', ')', '_', '\\', '\'', '~', '*', '&', '"', '?']``|yes|no|Characters of the mask. Can not be used as input character for the text field. Used for both, formatMask and deformatMask.|
|empty         |string         |``null``          |yes        |no     |Value returned for an empty text field|
|precision     |number         |``2``             |yes        |yes    |Precision used for numbers. Ingored for types text and integer.|
|length        |number         |``null``          |yes        |no     |Max number of digits (including precision) that can be entered into the text field. Ignored for Type text.|
|suffix        |string         |``null`` (text, integer, float)<br/>``'%'`` (percentage)<br/>``'EUR'``(currency)|yes|yes||
|falseCharWildcard|string      |``''``            |yes        |yes    |False characters of the provided  v-model/value will be replaced with this one. By default they will simply be deleted|
|hints         |object         |<code>{<br/>digit: 'The next char is a digit',<br/>alphabetic: 'The next char is alphabetic',<br/>lowerCase: 'The next char is lower case',<br/>upperCase: 'The next char is upper case',<br/>alphanumeric: 'The next char is alphanumeric',<br/>numeric: null,<br/>maxLength: 'Max number of characters reached'<br/>}</code>|yes|no| Hints will be displayed depending on the cursor position and according to the next possible character that can be entered. |

## Predifind Mask Characters
|Character|Description|
|---------|-----------|
|``A``|Character is alphabetical|
|``D``|Character is a digit|
|``l``|Character will be transformed to lower cased|
|``U``|Character will be transformed to upper cased|
|``#``|Any character is valid|

Any other alphabetical character of the mask will be handled as #.

## Object Attributes for Mask
In case of an object, the following attributes can be set.
|Attribute|type|Description|
|---------|----|-----------|
|mask|string|Character of the mask.|
|toUpperCase|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'U'``.|
|toLowerCase|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'l'``.|
|onlyDigit|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'D'``.|
|onlyAlphabetical|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'A'``.|
|hint|string|Hint only used for this character of the mask.|

# Examples
Examples will be added soon.
