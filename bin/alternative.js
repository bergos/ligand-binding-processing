#!/usr/bin/env node

var alternative = require('../alternative')
var fileOrStream = require('ligand-binding-utils/filestream-or-stream')
var program = require('commander')
var stream = require('../stream')

function processBindings () {
  process.stderr.write('create alternative SMILES representations: ')

  var log = function (err, count) {
    if (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    }

    process.stderr.write('\n' + count + ' bindings processed\n')
  }

  var input = fileOrStream(program.args.shift(), process.stdin, program.verbose)

  input
    .pipe(stream.parse())
    .pipe(stream.map(alternative.bind(null, program.alternatives)))
    .pipe(stream.count(log, {progress: true}))
    .pipe(stream.serialize())
    .pipe(process.stdout)

  stream.asPromise(input).catch(function (error) {
    process.stderr.write('error: ' + (error.stack || error.message) + '\n')
  })
}

program
  .usage('[options] <file>')
  .option('-v, --verbose', 'verbose output')
  .option('-a, --alternatives <number>', 'number of alternatives per binding', parseInt)

program.parse(process.argv)

processBindings()
