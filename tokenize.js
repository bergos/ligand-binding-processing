var parse = require('smiles').parse

function tokenizeSmiles (smilesString) {
  try {
    return parse(smilesString).map(function (token) {
      return 'smiles:' + token.type + '/' + token.value
    })
  } catch (err) {
    process.stderr.write('error: ' + smilesString + '\n')
    process.stderr.write('SMILES parser error: ' + (err.stack || err.message) + '\n')
  }
}

function tokenize (binding) {
  if (!binding.smiles) {
    return
  }

  var smilesTokens = tokenizeSmiles(binding.smiles)

  if (smilesTokens) {
    smilesTokens.unshift('smiles:begin')
    smilesTokens.push('smiles:end')

    binding.smilesTokens = smilesTokens
  }

  return binding
}

module.exports = tokenize
