import filter from './filter'
import component from './component.vue'

export default {
  install(Vue, options = {}) {
    Vue.filter('vuetifyMaskedFilter', filter)
    Vue.component('v-text-field-masked', component)
  }
}