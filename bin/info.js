#!/usr/bin/env node

var asciiHistogram = require('ascii-histogram')
var fromFileOrStream = require('ligand-binding-utils/from-file-or-stream')
var inRange = require('lodash/inRange')
var program = require('commander')
var range = require('lodash/range')

function processBindings () {
  var filename = program.args.shift()

  if (typeof filename !== 'string') {
    filename = null
  }

  return fromFileOrStream(filename, process.stdin, program.verbose).then(function (data) {
    var bindings = JSON.parse(data)

    if (program.kiValue) {
      bindings = bindings.filter(function (binding) {
        return binding.kiValue === program.kiValue
      })
    }

    if (program.scaledKiValue) {
      bindings = bindings.filter(function (binding) {
        return binding.scaledKiValue === program.scaledKiValue
      })
    }

    if (program.verbose) {
      process.stderr.write('bindings: ' + bindings.length + '\n')
    }

    return bindings
  })
}

program
  .usage('[options] <file>')
  .option('-v, --verbose', 'verbose output')
  .option('--ki-value <value>', 'filter by ki value', parseFloat)
  .option('--scaled-ki-value <value>', 'filter by scaled ki value', parseFloat)

program
  .command('count')
  .action(function () {
    processBindings().then(function (bindings) {
      process.stdout.write('' + bindings.length)
    }).catch(function (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    })
  })

program
  .command('histogram')
  .action(function () {
    processBindings().then(function (bindings) {
      var histogram = range(0, 10001, 1000).reduce(function (histogram, start) {
        var end = start + 1000
        var key = start + '-' + end

        if (start === 10000) {
          key = '>10000'
        }

        histogram[key] = bindings.filter(function (binding) {
          return inRange(start, end, binding.kiValue)
        }).length

        return histogram
      }, {})

      process.stdout.write(asciiHistogram(histogram))
    }).catch(function (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    })
  })

program.parse(process.argv)
