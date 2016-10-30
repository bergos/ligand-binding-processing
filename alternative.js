var Promise = require('bluebird')
var _ = require('lodash')
var openbabel = require('openbabel-cli')

function alternativeSmiles (smiles, n) {
  return Promise.map(_.range(n), function () {
    return openbabel.convert(smiles, {outputFormat: 'smiles', options: '-xC'})
  }, {concurrency: 16}).then(function (alternatives) {
    return _.uniq(alternatives)
  })
}

function alternatives (n, binding) {
  return alternativeSmiles(binding.smiles, n).then(function (alternatives) {
    var alternativeBindings = []

    alternatives.forEach(function (alternative) {
      if (alternative !== binding.smiles) {
        alternativeBindings.push(_.merge(_.clone(binding), {smiles: alternative}))
      }
    })

    return alternativeBindings
  })
}

module.exports = alternatives
