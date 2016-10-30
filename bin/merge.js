#!/usr/bin/env node

var fs = require('fs')
var merge = require('../merge')
var program = require('commander')

function processBindings () {
  process.stderr.write('merge binding files: ')

  var files = program.args

  var bindingsSet = files.map(function (file) {
    return JSON.parse(fs.readFileSync(file).toString())
  })

  return merge(bindingsSet).then(function (bindings) {
    process.stderr.write('\n ' + bindings.length + ' bindings merged\n')

    process.stdout.write(JSON.stringify(bindings, null, ' '))
  }).catch(function (err) {
    process.stderr.write('error: ' + (err.stack || err.message) + '\n')
  })
}

program
  .usage('[options] files')
  .option('-v, --verbose', 'verbose output')

program.parse(process.argv)

processBindings()
