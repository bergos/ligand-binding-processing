var clamp = require('lodash/clamp')
var map = require('lodash/map')
var sum = require('lodash/sum')

function aggregate (binding) {
  var kiValue = binding.kiValue

  if (Array.isArray(kiValue)) {
    kiValue = sum(map(kiValue, function (value) {
      return clamp(value, 0, 10000)
    })) / kiValue.length
  } else {
    kiValue = clamp(kiValue, 0, 10000)
  }

  binding.label = binding.smiles + ' - ' + kiValue
  binding.kiValue = kiValue
  binding.scaledKiValue = kiValue / 10000
  binding.binds = kiValue !== 10000 ? 1.0 : 0.0

  return Promise.resolve(binding)
}

module.exports = aggregate
