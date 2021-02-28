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

# Options
The following options can be used for component and filter
| Option        | type| Default           | Component  | Filter | Description |
|:--------------|:---|:------------------|:-----------|:-------|:------------|
| v-model     | string, integer| ``null``    | yes   | no       |             |
| formatMask      |string, object| ##########       |  yes | no | The masked used to mask the given value |
| deformatMask |string, object| ``null``      |    yes | no | Mask used to deformat the masked value. If null all characters of the masked will be removed |
| type |string| text | yes | yes | 5 types exists: text, float, integer, currency, and percentage |
