import filter from './filter'
import component from './component.vue'

export default {
  install (Vue) {
    Vue.filter('vuetifyMaskedFilter', filter)
    /* eslint-disable-next-line vue/component-definition-name-casing */
    Vue.component('v-text-field-masked', component)
  }
}