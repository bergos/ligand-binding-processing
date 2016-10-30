var aggregate = require('./aggregate')
var alternative = require('./alternative')
var canonicalize = require('./canonicalize')
var fromChembl = require('./from-chembl')
var merge = require('./merge')
var split = require('./split')
var tokenize = require('./tokenize')
var nnMapping = require('./nn-mapping')

module.exports = {
  aggregate: aggregate,
  alternative: alternative,
  canonicalize: canonicalize,
  fromChembl: fromChembl,
  merge: merge,
  split: split,
  tokenize: tokenize,
  nnMapping: nnMapping
}
