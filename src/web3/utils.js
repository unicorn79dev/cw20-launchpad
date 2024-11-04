import {fromBech32} from "@cosmjs/encoding";

const Self = {
  convertMicroDenomToDenom (amount, decimal = 6) {
    if (typeof amount === 'string') {
      amount = Number(amount)
    }
    amount = amount / 10 ** decimal
    return isNaN(amount) ? 0 : amount
  },

  convertDenomToMicroDenom (amount, decimal = 6) {
    if (typeof amount === 'string') {
      amount = Number(amount)
    }
    amount = amount * 10 ** decimal
    return isNaN(amount) ? '0' : String(amount).split('.')[0]
  },

  isValidAddress (address) {
    try {
      const { prefix, data } = fromBech32(address)
      if (prefix === "inj" && data.length === 20) {
        return true
      }

      if (prefix === "sei" && data.length === 32) {
        return true
      }

      console.log("Checking address... ", fromBech32(address))
  
      return false
    } catch (error) {
      return false
    }
  }
}

export default Self