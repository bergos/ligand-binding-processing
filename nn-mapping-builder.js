var keys = require('lodash/keys')

var scores = [
  'smiles:begin',
  'smiles:end',
  'smiles:Branch/begin',
  'smiles:Branch/end',
  'smiles:BracketAtom/begin',
  'smiles:BracketAtom/end',
  'smiles:Chiral/clockwise',
  'smiles:Chiral/anticlockwise',
  'smiles:AliphaticOrganic',
  'smiles:AromaticOrganic',
  'smiles:AromaticSymbol',
  'smiles:ElementSymbol'
]

function tokenScore (token) {
  if (!token) {
    return 0
  }

  for (var index = 0; index < scores.length; index++) {
    if (token.indexOf(scores[index]) === 0) {
      return -1000 + index
    }
  }

  return 0
}

function tokenSort (a, b) {
  var score = tokenScore(a) - tokenScore(b)

  if (score !== 0) {
    return score
  }

  return a.localeCompare(b)
}

function MappingBuilder () {
  var tokens = {}

  this.process = function (binding) {
    binding.smilesTokens.forEach(function (token) {
      tokens[token] = true
    })
  }

  this.build = function () {
    return {
      loop: [{
        group: 'input',
        property: 'smilesTokens',
        mapping: keys(tokens).sort(tokenSort).map(function (token, index) {
          return {
            equals: token,
            neuron: 'input:' + token.slice(7),
            value: 1
          }
        })
      }],
      map: [{
        group: 'output',
        property: 'scaledKiValue',
        mapping: [{
          neuron: 'output:scaledKiValue'
        }]
      }]
    }
  }

  this.buildModelIO = function () {
    return {
      input: keys(tokens).sort(tokenSort).map(function (token) {
        return 'input:' + token.slice(7)
      }),
      output: ['output:scaledKiValue']
    }
  }
}

module.exports = MappingBuilder
