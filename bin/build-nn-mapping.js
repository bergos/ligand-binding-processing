#!/usr/bin/env node

var fileOrStream = require('ligand-binding-utils/filestream-or-stream')
var program = require('commander')
var stream = require('../stream')
var MappingBuilder = require('../nn-mapping-builder')

function processBindings (filename) {
  var log = function (err, count) {
    if (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    }

    process.stderr.write(count + ' SMILES strings processed\n')
  }

  var input = fileOrStream(filename, process.stdin, program.verbose)

  var builder = new MappingBuilder()

  input
    .pipe(stream.parse())
    .pipe(stream.map(builder.process))
    .pipe(stream.count(log))

  return stream.asPromise(input).then(function () {
    return builder
  })
}

program
  .option('-v, --verbose', 'verbose output')
  .option('-p, --properties <n>', 'list of output properties as comma separated list')

program
  .command('mapping <file>')
  .action(function (filename) {
    process.stderr.write('build NN-Mapping file for SMILES tokens...\n')

    processBindings(filename).then(function (builder) {
      var properties = (program.properties || 'binds,kiValue,scaledKiValue').split(',')
      var mapping = builder.build(properties)

      process.stderr.write(mapping.loop[0].mapping.length + ' unique tokens found\n')

      process.stdout.write(JSON.stringify(mapping, null, ' '))
    }).catch(function (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    })
  })

program
  .command('model <file>')
  .action(function (filename) {
    process.stderr.write('build model I/O description for SMILES tokens...\n')

    processBindings(filename).then(function (builder) {
      var properties = (program.properties || 'binds,kiValue,scaledKiValue').split(',')
      var modelIO = builder.buildModelIO(properties)

      process.stderr.write((modelIO.input.length + modelIO.output.length) + ' I/O neurons\n')

      process.stdout.write(JSON.stringify(modelIO, null, ' '))
    }).catch(function (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    })
  })

program.parse(process.argv)
