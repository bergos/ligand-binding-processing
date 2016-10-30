var openbabel = require('openbabel-cli')
var parse = require('smiles').parse
var serialize = require('smiles').serialize

function cleanSmiles (smiles) {
  var tokens = parse(smiles)

  tokens = tokens.filter(function (token) {
    if (token.type === 'Charge') {
      return false
    }

    if (token.type === 'Isotope') {
      return false
    }

    return true
  })

  return serialize(tokens)
}

function Canonicalizer () {
  var canonicalMap = {}

  var addMapping = function (smiles) {
    return openbabel.convert(cleanSmiles(smiles)).then(function (canonical) {
      canonicalMap[smiles] = canonical
    })
  }

  this.canonicalize = function (binding) {
    return Promise.resolve().then(function () {
      if (!(binding.smiles in canonicalMap)) {
        return addMapping(binding.smiles)
      }
    }).then(function () {
      binding.smiles = canonicalMap[binding.smiles]

      return binding
    })
  }
}

module.exports = Canonicalizer
