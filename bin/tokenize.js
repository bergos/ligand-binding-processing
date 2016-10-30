#!/usr/bin/env node

var fileOrStream = require('ligand-binding-utils/filestream-or-stream')
var program = require('commander')
var stream = require('../stream')
var tokenize = require('../tokenize')

function processBindings () {
  process.stderr.write('tokenize SMILES strings: ')

  var log = function (err, count) {
    if (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    }

    process.stderr.write('\n' + count + ' bindings processed\n')
  }

  var input = fileOrStream(program.args.shift(), process.stdin, program.verbose)

  input
    .pipe(stream.parse())
    .pipe(stream.map(tokenize))
    .pipe(stream.count(log, {progress: true}))
    .pipe(stream.serialize())
    .pipe(process.stdout)

  stream.asPromise(input).catch(function (err) {
    process.stderr.write('error: ' + (err.stack || err.message) + '\n')
  })
}

program
  .usage('[options] <file>')
  .option('-v, --verbose', 'verbose output')

program.parse(process.argv)

processBindings()
