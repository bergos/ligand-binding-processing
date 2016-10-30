#!/usr/bin/env node

var fromChembl = require('../from-chembl')
var keys = require('lodash/keys')
var program = require('commander')

var defaultEndpointUrl = 'https://www.ebi.ac.uk/rdf/services/chembl/sparql'

program
  .option('-v, --verbose', 'verbose output')
  .option('--endpoint <endpoint>', 'SPARQL endpoint')
  .option('--organism <organism>', 'organism filter')

program
  .command('target <name>')
  .action(function (name) {
    process.stderr.write('search for targets: ')

    var options = {
      verbose: program.verbose
    }

    if (name === '*') {
      name = null
    } else {
      name = name.split(',')
    }

    fromChembl.findTargets(program.endpoint || defaultEndpointUrl, name, program.organsim, options).then(function (targets) {
      process.stderr.write('\n' + keys(targets).length + ' targets found\n')
      process.stdout.write(JSON.stringify(targets, null, ' '))
    }).catch(function (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    })
  })

program
  .command('binding <target>')
  .action(function (target) {
    process.stderr.write('search for bindings: ')

    var options = {
      verbose: program.verbose
    }

    if (target === '*') {
      target = null
    } else {
      target = target.split(',')
    }

    fromChembl.findBindings(program.endpoint || defaultEndpointUrl, target, program.organsim, options).then(function (bindings) {
      process.stderr.write('\n' + bindings.length + ' bindings found\n')
      process.stdout.write(JSON.stringify(bindings, null, ' '))
    }).catch(function (err) {
      process.stderr.write('error: ' + (err.stack || err.message) + '\n')
    })
  })

program.parse(process.argv)
