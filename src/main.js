// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

// Element UI kit
// http://element.eleme.io
import ElementUI from 'element-ui'

// internationalization
import VueI18n from 'vue-i18n'
import enUs from 'element-ui/lib/locale/lang/en'
import ptBr from 'element-ui/lib/locale/lang/pt-br'
// custom dictionary
import dictionary from './lib/dictionary'
import { DEFAULT_LANG, DEFAULT_COUNTRY_CODE } from '@/lib/constants'

// custom additional plugins
import Inputmask from 'inputmask'
import VueSticky from 'vue-sticky'
import VueClipboard from 'vue-clipboard2'
import creditCardType from 'credit-card-type'

// Font Awesome Icons
import './lib/icons'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
Vue.component('a-icon', FontAwesomeIcon)

// setup Element UI fully
Vue.use(ElementUI)
// setup i18n
Vue.use(VueI18n)
Vue.locale('en_us', { ...enUs, ...dictionary.enUs })
Vue.locale('pt_br', { ...ptBr, ...dictionary.ptBr })
let locale = (lang, country) => {
  // change language
  Vue.config.lang = Vue.prototype.$lang = lang
  Vue.prototype.$country = country
}
Vue.prototype.$locale = locale
// preset default language
locale(DEFAULT_LANG, DEFAULT_COUNTRY_CODE)

// handle directives for plugins
Vue.directive('mask', {
  bind (el, { value }) {
    Inputmask(value).mask(el.getElementsByTagName('INPUT')[0])
  }
})
Vue.directive('sticky', VueSticky)
// handle keyup for children input element
Vue.directive('on-keyup', {
  bind (el, { value }) {
    el.getElementsByTagName('INPUT')[0].onkeyup = value
  }
})
Vue.directive('on-key-enter', {
  bind (el, { value }) {
    el.getElementsByTagName('INPUT')[0].onkeyup = e => {
      if ((e.which || e.keyCode) === 13) {
        value(e)
      }
    }
  }
})
// setup copy to clipboard tool
VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)

/* eslint-disable no-new */
// set Vue instance
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

// handle credit card types
// https://github.com/braintree/credit-card-type
creditCardType.addCard({
  niceType: 'Hipercard',
  type: 'hipercard',
  patterns: [
    606282
  ],
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: 'CVV',
    size: 3
  }
})
