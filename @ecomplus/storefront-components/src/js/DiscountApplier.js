import {
  i19add,
  i19addDiscountCoupon,
  i19campaignAppliedMsg,
  i19code,
  i19couponAppliedMsg,
  i19discountCoupon,
  i19errorMsg,
  i19hasCouponOrVoucherQn,
  i19invalidCouponMsg
} from '@ecomplus/i18n'

import { i18n } from '@ecomplus/utils'
import { modules } from '@ecomplus/client'
import ecomCart from '@ecomplus/shopping-cart'
import ecomPassport from '@ecomplus/passport-client'
import AAlert from '../AAlert.vue'

export default {
  name: 'DiscountApplier',

  components: {
    AAlert
  },

  props: {
    amount: Object,
    couponCode: String,
    hasCouponInput: {
      type: Boolean,
      default: true
    },
    isFormAlwaysVisible: Boolean,
    isCouponApplied: Boolean,
    isAttentionWanted: Boolean,
    modulesPayload: Object,
    ecomCart: {
      type: Object,
      default () {
        return ecomCart
      }
    },
    ecomPassport: {
      type: Object,
      default () {
        return ecomPassport
      }
    }
  },

  data () {
    return {
      alertText: null,
      alertVariant: null,
      isFormVisible: this.isFormAlwaysVisible || this.couponCode,
      isLoading: false,
      localCouponCode: this.couponCode,
      localAmountTotal: this.amount.total || 0,
      localAmountDiscount: this.amount.discount || 0,
      extraDiscountValue: 0,
      isUpdateSheduled: false
    }
  },

  computed: {
    i19add: () => i18n(i19add),
    i19addDiscountCoupon: () => i18n(i19addDiscountCoupon),
    i19code: () => i18n(i19code),
    i19couponAppliedMsg: () => i18n(i19couponAppliedMsg),
    i19discountCoupon: () => i18n(i19discountCoupon),
    i19hasCouponOrVoucherQn: () => i18n(i19hasCouponOrVoucherQn),
    i19invalidCouponMsg: () => i18n(i19invalidCouponMsg),
    i19campaignAppliedMsg: () => i18n(i19campaignAppliedMsg),

    canAddCoupon () {
      return !this.couponCode || !this.isCouponApplied ||
        this.couponCode !== this.localCouponCode
    }
  },

  methods: {
    parseDiscountOptions (listResult = []) {
      this.extraDiscountValue = 0
      if (listResult.length) {
        let discountRule, invalidCouponMsg
        listResult.forEach(appResult => {
          const { validated, error, response } = appResult
          if (validated && !error) {
            const appDiscountRule = response.discount_rule
            if (appDiscountRule) {
              const discountRuleValue = appDiscountRule.extra_discount.value
              if (!(this.extraDiscountValue > discountRuleValue)) {
                this.extraDiscountValue = discountRuleValue
                discountRule = {
                  app_id: appResult.app_id,
                  ...appDiscountRule
                }
              }
            } else if (response.invalid_coupon_message) {
              invalidCouponMsg = response.invalid_coupon_message
            }
          }
        })
        if (this.extraDiscountValue) {
          if (this.localCouponCode) {
            this.$emit('update:coupon-code', this.localCouponCode)
            this.alertText = this.i19couponAppliedMsg
          } else {
            this.alertText = this.i19campaignAppliedMsg
          }
          this.$emit('set-discount-rule', discountRule)
          this.alertVariant = 'info'
        } else {
          if (this.localCouponCode) {
            this.alertText = invalidCouponMsg || this.i19invalidCouponMsg
            this.alertVariant = 'warning'
          } else {
            this.alertText = null
          }
          this.$emit('set-discount-rule', {})
        }
      }
    },

    fetchDiscountOptions (data) {
      this.isLoading = true
      modules({
        url: '/apply_discount.json',
        method: 'POST',
        data: {
          ...this.modulesPayload,
          amount: {
            ...this.amount,
            total: this.localAmountTotal,
            discount: this.localAmountDiscount
          },
          items: this.ecomCart.data.items,
          ...data
        }
      })
        .then(({ data }) => this.parseDiscountOptions(data.result))
        .catch(err => {
          console.error(err)
          this.alertVariant = 'danger'
          this.alertText = i18n(i19errorMsg)
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    submitCoupon (isForceUpdate) {
      if (isForceUpdate || this.canAddCoupon) {
        const { localCouponCode } = this
        const data = {
          discount_coupon: localCouponCode
        }
        if (this.ecomPassport.checkLogin()) {
          const customer = this.ecomPassport.getCustomer()
          data.customer = {
            _id: customer._id
          }
          if (customer.display_name) {
            data.customer.display_name = customer.display_name
          }
        }
        this.fetchDiscountOptions(data)
      }
    },

    updateDiscount (isForceUpdate = true) {
      if (this.couponCode) {
        if (isForceUpdate || !this.isCouponApplied) {
          this.submitCoupon(isForceUpdate)
        }
      } else if (isForceUpdate || (this.amount && this.amount.total)) {
        this.fetchDiscountOptions()
      }
    }
  },

  watch: {
    couponCode (couponCode) {
      if (couponCode !== this.couponCode) {
        this.localCouponCode = couponCode
        if (couponCode && !this.isFormVisible) {
          this.isFormVisible = true
        }
      }
    },

    isFormAlwaysVisible (isFormVisible) {
      if (isFormVisible) {
        this.isFormVisible = true
      }
    },

    isFormVisible (isFormVisible) {
      if (isFormVisible) {
        this.$nextTick(() => {
          this.$refs.input.focus()
        })
      }
    },

    localAmountTotal (total, oldTotal) {
      if (Math.abs(total - oldTotal) > 0.01 && !this.isUpdateSheduled) {
        this.isUpdateSheduled = true
        this.$nextTick(() => {
          setTimeout(() => {
            this.updateDiscount()
            this.isUpdateSheduled = false
          }, 400)
        })
      }
    },

    amount: {
      handler ({ subtotal, freight, discount }, oldAmount) {
        const discountDiff = discount - this.extraDiscountValue
        this.localAmountDiscount = discountDiff > 0.01 ? discountDiff : 0
        this.localAmountTotal = subtotal + freight - discountDiff
      },
      deep: true
    }
  },

  created () {
    this.updateDiscount(false)
  }
}
