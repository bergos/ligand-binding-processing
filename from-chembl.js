var fetch = require('isomorphic-fetch')
var fs = require('fs')
var get = require('lodash/get')
var keys = require('lodash/keys')
var map = require('lodash/map')
var omit = require('lodash/omit')
var path = require('path')
var without = require('lodash/without')
var SparqlHttp = require('sparql-http-client')

SparqlHttp.fetch = fetch

var targetContext = {
  label: 'http://www.w3.org/2000/01/rdf-schema#',
  organism: 'http://rdf.ebi.ac.uk/terms/chembl#organismName'
}

function queryTargets (client, labels, organism, options) {
  options = options || {}

  var filters = []

  if (labels) {
    var labelFilter = '( ' + labels.map(function (label) {
      return 'CONTAINS(UCASE(?label), "' + label.toUpperCase() + '")'
    }).join(' || ') + ' )'

    filters.push(labelFilter)
  }

  if (organism) {
    filters.push('CONTAINS(UCASE(?organism), "' + organism.toUpperCase() + '")')
  }

  var query = fs.readFileSync(path.join(__dirname, 'lib/find-targets.sparql')).toString()

  if (filters.length) {
    query = query.replace('{filters}', 'FILTER (' + filters.join(' && ') + ') .')
  } else {
    query = query.replace('{filters}', '')
  }

  if (options.verbose) {
    process.stderr.write('query: ' + query + '\n')
  }

  return client.selectQuery(query).then(function (response) {
    return response.json()
  }).then(function (response) {
    var targets = {'@context': targetContext}

    get(response, 'results.bindings').forEach(function (result) {
      targets[result.target.value] = {
        label: result.label.value,
        organism: result.organism ? result.organism.value : null
      }
    })

    return targets
  })
}

var bindingContext = {
  assay: 'http://rdf.ebi.ac.uk/terms/chembl#hasAssay',
  molecule: 'http://rdf.ebi.ac.uk/terms/chembl#hasMolecule',
  smiles: 'http://smiles',
  target: 'http://rdf.ebi.ac.uk/terms/chembl#hasTarget',
  value: 'http://rdf.ebi.ac.uk/terms/chembl#publishedValue'
}

function queryBindings (client, targetIris, options) {
  options = options || {}

  var filters = []

  if (targetIris) {
    targetIris = targetIris.map(function (targetIri) {
      return '<' + targetIri + '>'
    }).join(',')

    filters.push('?target IN (' + targetIris + ')')
  }

  var query = fs.readFileSync(path.join(__dirname, 'lib/find-bindings.sparql')).toString()

  if (filters.length) {
    query = query.replace('{filters}', 'FILTER (' + filters.join(' && ') + ') .')
  } else {
    query = query.replace('{filters}', '')
  }

  if (options.verbose) {
    process.stderr.write('query: ' + query + '\n')
  }

  return client.selectQuery(query).then(function (response) {
    return response.json()
  }).then(function (response) {
    var bindings = {'@context': bindingContext}

    get(response, 'results.bindings').forEach(function (result) {
      bindings[result.activity.value] = {
        assay: {
          '@id': result.assay.value,
          target: result.target.value
        },
        molecule: {
          '@id': result.molecule.value,
          smiles: result.smiles.value
        },
        value: parseFloat(result.value.value)
      }
    })

    return bindings
  })
}

function buildBindingArray (bindings) {
  return map(omit(bindings, '@context'), function (binding, iri) {
    return {
      source: iri,
      smiles: binding.molecule.smiles,
      kiValue: binding.value
    }
  })
}

function findTargets (endpointUrl, name, organism, options) {
  var client = new SparqlHttp({endpointUrl: endpointUrl})

  if (name && name.length === 0) {
    name = null
  }

  return queryTargets(client, name, organism, options)
}

function findBindings (endpointUrl, target, organism, options) {
  var client = new SparqlHttp({endpointUrl: endpointUrl})

  return Promise.resolve().then(function () {
    if (!target || target.length === 0) {
      return null
    } else if (target[0].indexOf('://') !== -1) {
      return target
    } else {
      return queryTargets(client, target, organism, options).then(function (targets) {
        return without(keys(targets), '@context')
      })
    }
  }).then(function (targetIris) {
    return queryBindings(client, targetIris, options)
  }).then(function (bindings) {
    return buildBindingArray(bindings)
  })
}

module.exports = {
  findBindings: findBindings,
  findTargets: findTargets
}
