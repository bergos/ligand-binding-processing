#!/usr/bin/env node

var aggregate = require('../aggregate')
var fileOrStream = require('ligand-binding-utils/filestream-or-stream')
var program = require('commander')
var stream = require('../stream')

function processBindings () {
  process.stderr.write('aggregate ki values: ')

  var log = function (err, count) {
    if (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    }

    process.stderr.write('\n' + count + ' bindings processed\n')
  }

  var input = fileOrStream(program.args.shift(), process.stdin, program.verbose)

  input
    .pipe(stream.parse())
    .pipe(stream.map(aggregate))
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

program.parse(process.argv)

processBindings()
