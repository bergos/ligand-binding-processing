var concat = require('lodash/concat')
var flatten = require('lodash/flatten')
var values = require('lodash/values')

function append (existing, toAppend) {
  return flatten(concat(existing, toAppend))
}

function merge (bindingsSets) {
  var bindingMap = {}

  bindingsSets.forEach(function (bindings) {
    bindings.forEach(function (binding) {
      if (!bindingMap[binding.smiles]) {
        bindingMap[binding.smiles] = binding
      } else {
        bindingMap[binding.smiles] = {
          source: append(bindingMap[binding.smiles].source, binding.source),
          smiles: binding.smiles,
          kiValue: append(bindingMap[binding.smiles].kiValue, binding.kiValue)
        }
      }
    })
  })

  return Promise.resolve(values(bindingMap))
}

module.exports = merge
