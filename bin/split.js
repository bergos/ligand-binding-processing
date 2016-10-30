#!/usr/bin/env node

var fromFileOrStream = require('ligand-binding-utils/from-file-or-stream')
var fs = require('fs')
var program = require('commander')
var split = require('../split')

function processBindings () {
  process.stderr.write('split binding files: ')

  return fromFileOrStream(program.args.shift(), process.stdin, program.verbose).then(function (data) {
    var bindings = JSON.parse(data)
    var exclude

    if (program.exclude) {
      exclude = JSON.parse(fs.readFileSync(program.exclude))
    }

    return split(bindings, {
      sort: program.sort,
      exclude: exclude,
      offset: program.offset,
      limit: program.limit
    })
  }).then(function (bindings) {
    process.stderr.write('\n' + bindings.length + ' bindings splitted\n')

    process.stdout.write(JSON.stringify(bindings, null, ' '))
  }).catch(function (err) {
    process.stderr.write('error: ' + (err.stack || err.message) + '\n')
  })
}

program
  .usage('[options] <file>')
  .option('-v, --verbose', 'verbose output')
  .option('-s, --sort', 'sort bindings by scaledKiValue')
  .option('-o, --offset <n>', 'offset', parseFloat)
  .option('-l, --limit <n>', 'limit', parseInt)
  .option('-e, --exclude <file>', 'exclude bindings from this file')

program.parse(process.argv)

processBindings()
