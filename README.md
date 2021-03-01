# vuetify-masked
Create a masked text field for vuetify 2.x based on v-text-field. Supported are static masks provided by string/object and the masking of float and integer values.
Additionally, a filter exists to format a value.

## Install

```
npm install vuetify-masked --save
```
### Global
```javascript
import Vue from 'vue'
import VuetifyMasked from 'vuetify-masked'

Vue.use(VuetifyMasked)
```

### Local
```javascript
// use only the component
import { VuetifyMaskedComponent } from 'vuetify-masked'

// use only the filter
import { VuetifyMaskedFilter } from 'vuetify-masked'

export default {
  components: {
    'v-text-field-masked': VuetifyMaskedComponent
  },
  filters: {
    VuetifyMaskedFilter
  }
}
```
## Usage
Once installed, for a simple mask the component can be used in a template as simple as:

### Type 'text'
```javascript
<!-- Component -->
<v-text-field-masked
  v-model="text"
  formatMask="###A/##l/D#U"
  label="default type (text)"
></v-text-field-masked>

<!-- Filter -->
{{ text | vuetifyMaskedFilter({ formatMask: "ADDD-ul/#####" }) }}
```
Resulted value for '123A56U89a' is '123A/56u/89A'.

### Type 'float'
```javascript
<v-text-field-masked
  v-model="text"
  label="float type"
  type="float"
></v-text-field-masked>

<!-- Filter -->
{{ text | vuetifyMaskedFilter({ type:"float" }) }}
```
Resulted value for '1234567890' is '1,234,567,890.00'

### Type 'integer'
```javascript
<v-text-field-masked
  v-model="text"
  label="integer type"
  type="integer"
></v-text-field-masked>

<!-- Filter -->
{{ text | vuetifyMaskedFilter({ type:"integer" }) }}
```
Resulted value for '1234567890' is '1,234,567,890'

### Type 'currency'
```javascript
<v-text-field-masked
  v-model="text"
  label="currency type"
  type="currency"
></v-text-field-masked>

<!-- Filter -->
{{ text | vuetifyMaskedFilter({ type:"currency" }) }}
```
Resulted value for '1234567890' is '1,234,567,890.00USD'

### Type 'percentage'
```javascript
<v-text-field-masked
  v-model="text"
  label="percentage type"
  type="percentage"
></v-text-field-masked>

<!-- Filter -->
{{ text | vuetifyMaskedFilter({ type:"percentage" }) }}
```
Resulted value for '1234567890' is '1,234,567,890.00%'

## Options (Component Props and Filter Parameters)
The following options can be used for component and filter
|Option        |Type           |Default           |Component  |Filter |Description |
|:-------------|:---           |:-----------------|:----------|:------|:-----------|
|deformatMask  |string, object |``null``          |yes        |no     |Mask used to deformat the masked value. If null all characters of the masked will be removed |
|empty         |string         |``null``          |yes        |no     |Value returned for an empty text field|
|falseCharWildcard|string      |``''``            |yes        |yes    |False characters of the provided  v-model/value will be replaced with this one. By default they will simply be deleted.|
|formatMask    |string, object |``'##########'``  |yes        |yes    |Used to mask the given value. Meaining of characters and usable aatributes for obecjt can be foudn below table|
|hints         |object         ||yes|no| Hints will be displayed depending on the cursor position and according to the next possible character that can be entered. |
|length        |number         |``null``          |yes        |no     |Max number of digits (including precision) that can be entered into the text field. Ignored for type text.|
|locale        |string         |``'en-EN'``       |yes        |yes    |Used to determine the decimal and thousands seperator. |
|maskCharacter |array          |``['-', '.', ',', ' ', '/', '(', ')', '_', '\\', '\'', '~', '*', '&', '"', '?']``|yes|no|Characters of the mask. Can not be used as input character for the text field. Used for both, formatMask and deformatMask.|
|precision     |number         |``2``             |yes        |yes    |Precision used for numbers. Ingored for types text and integer.|
|properties    |object         |``null``          |yes        |no     |Properties for the v-text-field used by vuetify-masked|
|suffix        |string         |``null`` (text, integer, float)<br/>``'%'`` (percentage)<br/>``'USD'``(currency)|yes|yes||
|type          |string         |``'text'``        |yes        |yes    |5 types exist: text, float, integer, currency, and percentage |
|value         |string, number |``null``          |yes        |yes    |Mapped to the v-model of the component|            |
|v-model       |string, number |``null``          |yes        |no     |            |

### Predefined Mask Characters
|Character|Description|
|---------|-----------|
|``A``|Character is alphabetical|
|``D``|Character is a digit|
|``l``|Character will be transformed to lower cased|
|``U``|Character will be transformed to upper cased|
|``#``|Any character is valid|

Any other alphabetical character of the mask will be handled as #.

### Object Attributes for Mask
In case of an object, the following attributes can be set.
|Attribute|Type|Description|
|---------|----|-----------|
|mask|string|Character of the mask.|
|toUpperCase|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'U'``.|
|toLowerCase|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'l'``.|
|onlyDigit|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'D'``.|
|onlyAlphabetical|boolean|If true the character will be transformed to upper case. If not explicity set it will be true if mask is ``'A'``.|
|hint|string|Hint only used for this character of the mask.|

### Hints Object Attributes and Default Values
|Attribute   |Type  |Default|Description|
|------------|------|-------|-----------|
|alphabetic  |string|``'The next char is alphabetic'``|By default used for ``'A'``|
|alphanumeric|string|``'The next char is alphanumeric'``|By default used for ``'#'``
|digit       |string|``'The next char is a digit'``|By default used for ``'D'``|
|lowerCase   |string|``'The next char is lower case'``|By default used for ``'l'``|
|maxLength   |string|``'Max number of characters reached'``||
|numeric     |string|``null``|Only used for types float, integer, currency, and percentage|
|upperCase   |string|``'The next char is upper case'``|By default used for ``'U'``|
