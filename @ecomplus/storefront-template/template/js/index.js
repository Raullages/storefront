import { name, version } from '../../package.json'
import './lib/config'
import '@ecomplus/storefront-twbs'

import './lib/utils'
import './lib/lazy-load'
import './lib/glide-slides'
import './lib/menu'
import './lib/search'
import './lib/shopping-cart'
import './lib/persist-utm'

import lozad from 'lozad'
import * as cloneDeep from 'lodash.clonedeep'
import * as merge from 'lodash.merge'
import Glide from '@glidejs/glide'
import getScopedSlots from './lib/get-scoped-slots'

import './lib/load-widgets'

window._ = { cloneDeep, merge }
window.lozad = lozad
window.Glide = Glide
window.storefront.getScopedSlots = getScopedSlots

const fetchInfo = () => {
  import(/* webpackPreload: true */ './lib/fetch-info').catch(console.error)
}
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(fetchInfo)
} else {
  setTimeout(fetchInfo, 300)
}

const { hash } = window.location
if (hash.indexOf('_token=') !== -1 || hash.indexOf('error=access_denied') !== -1) {
  const $netlifyIdentityScript = document.createElement('script')
  $netlifyIdentityScript.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js'
  document.body.appendChild($netlifyIdentityScript)
}

console.log(`// TEMPLATE => ${name}@${version}`)
