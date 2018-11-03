// initial state
const state = {
  amount: {
    freight: 0,
    discount: 0,
    total: 0
  },
  discount: {
    coupon: {
      name: '',
      value: 0
    }
  },
  shipping: {
    loading: false,
    timer: null,
    error: {},
    zip: '',
    // mock options for sample only
    services: [{
      label: 'PAC',
      carrier: 'Correios',
      service_name: 'PAC',
      shipping_line: {
        total_price: 7,
        posting_deadline: {
          days: 3,
          working_days: true
        },
        delivery_time: {
          days: 10,
          working_days: true
        }
      },
      selected: false
    }, {
      label: 'SEDEX',
      carrier: 'Correios',
      service_name: 'SEDEX',
      shipping_line: {
        total_price: 10,
        posting_deadline: {
          days: 3,
          working_days: true
        },
        delivery_time: {
          days: 5,
          working_days: true
        }
      },
      selected: false
    }]
  },
  payment: {
    // mock options for sample only
    gateways: [{
      icon: 'https://www.icon.com/icon.png',
      installment_options: [{
        number: 12,
        tax: true,
        value: 111.375
      }, {
        number: 6,
        tax: false,
        value: 202.5
      }],
      intermediator: {
        code: 'wirecard',
        link: 'https://www.wirecard.com.br',
        name: 'Wirecard'
      },
      label: 'Cartão de credito',
      payment_method: {
        code: 'credit_card',
        name: 'Cartão de crédito'
      },
      payment_url: 'https://www.wiredcard.com.br/payment',
      type: 'payment'
    }, {
      intermediator: {
        code: 'wirecard',
        link: 'https://www.wirecard.com.br',
        name: 'Wirecard'
      },
      label: 'Boleto bancário',
      payment_method: {
        code: 'banking_billet',
        name: 'Boleto bancário'
      },
      payment_url: 'https://www.wiredcard.com.br/payment',
      type: 'payment'
    }, {
      intermediator: {
        'code': 'wirecard',
        'link': 'https://www.wirecard.com.br',
        'name': 'Wirecard'
      },
      label: 'Débito online',
      payment_method: {
        'code': 'online_bank_debit',
        'name': 'Débito online'
      },
      payment_url: 'https://www.wiredcard.com.br/payment',
      type: 'payment'
    }]
  }
}

const mutations = {
  // reset checkout object
  editCheckout (state, payload) {
    Object.assign(state, payload)
  },

  // update checkout total value
  setCheckoutTotal (state, value) {
    state.amount.total = value
  },

  // update shipping zip code
  setCheckoutZip (state, value) {
    state.shipping.zip = value
  },

  // controls timer to update shipping services asynchronously
  updateShippingTimer (state, value) {
    state.shipping.timer = value
  },

  // update shipping services loading state
  toggleShippingLoading (state) {
    state.shipping.loading = !state.shipping.loading
  },

  // mark selected shipping service from list
  selectShippingService (state, value = 0) {
    state.shipping.services.forEach((service, index) => {
      if (index === value) {
        service.selected = true
        // update checkout freight and total value
        let { amount } = state
        amount.total -= amount.freight
        amount.freight = service.shipping_line.total_price
        amount.total += amount.freight
      } else {
        service.selected = false
      }
    })
  }
}

const getters = {
  checkout: state => state,

  // auxiliary maps
  checkoutZip: state => state.shipping.zip,
  shippingServices: state => state.shipping.services,
  shippingLoading: state => state.shipping.loading,
  shippingLoadError: state => state.shipping.error.code,
  paymentGateways: state => state.payment.gateways,

  // map selected shipping service and payment method objects
  checkoutShipping: state => state.shipping.services.find(option => option.selected === true),
  checkoutPayment: state => state.payment.gateways.find(option => option.selected === true),

  // calculate total time with delivery and posting deadline
  shippingServiceTime: state => service => {
    let shipping = service.shipping_line
    let days
    if (shipping.posting_deadline) {
      // start days with deadline for posting
      days = shipping.posting_deadline.days
    } else {
      days = 0
    }
    if (shipping.delivery_time) {
      // sum delivery time
      days += shipping.delivery_time.days
    }
    return days
  },

  // whether shipping time is calculated with working days
  shippingServiceWorkingDays: state => service => {
    let shipping = service.shipping_line
    // returns true if any deadline uses working days
    if (shipping.posting_deadline && shipping.posting_deadline.working_days) {
      return true
    }
    if (shipping.delivery_time && shipping.delivery_time.working_days) {
      return true
    }
    // default not working days
    return false
  }
}

const actions = {
  // recalculate checkout total value
  fixCheckoutTotal ({ commit, state, rootGetters }) {
    let { freight, discount } = state.amount
    commit('setCheckoutTotal', rootGetters.cart.subtotal + freight - discount)
  },

  // update shipping services list
  initShippingServices ({ commit }) {
    // mark loading
    commit('toggleShippingLoading')
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 400)
    }).then(() => {
      // select one shipping option
      commit('selectShippingService')
    }).finally(() => {
      // loaded
      commit('toggleShippingLoading')
    })
  },

  // update shipping zip code and services
  setCheckoutZip ({ commit, dispatch, state }, value) {
    // check if zip is changed
    let { zip, timer, error } = state.shipping
    if (zip !== value) {
      let load = () => {
        commit('setCheckoutZip', value)
        // reload asynchronously with big timeout
        commit('updateShippingTimer', setTimeout(load, 30 * 60000))
        // load shipping services
        return dispatch('initShippingServices')
      }
      // check scheduled services reload
      if (timer) {
        // clear last timer
        clearTimeout(timer)
      }

      // start loading and returns respective promise
      return load()
    } else if (!error.code) {
      // already loaded for this zip code
      return Promise.resolve()
    } else {
      return Promise.reject(error.object)
    }
  },

  // update payment gateway options list
  initPaymentGateways ({ commit }) {
    return Promise.resolve()
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
