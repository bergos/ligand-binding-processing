var Promise = require('bluebird')
var readline = require('readline')
var util = require('util')
var JSONStream = require('JSONStream')
var Transform = require('stream').Transform

function CountStream (callback, options) {
  Transform.call(this)

  this._writableState.objectMode = true
  this._readableState.objectMode = true

  options = options || {}
  options.progressTick = options.progressTick || 100

  var last

  this._transform = function (binding, encoding, done) {
    this.count++

    if (options.progress && this.count >= (last + options.progressTick)) {
      var countString = this.count.toString()

      if (last) {
        readline.moveCursor(process.stderr, -last.toString().length)
        readline.clearLine(process.stderr, 1)
      }

      process.stderr.write(countString)

      last = this.count
    }

    this.push(binding)

    done()
  }

  this.on('pipe', function () {
    this.count = last = 0
  })

  this.on('end', function () {
    callback(null, this.count)
  })
}

util.inherits(CountStream, Transform)

function MapStream (callback) {
  Transform.call(this)

  this._writableState.objectMode = true
  this._readableState.objectMode = true

  var stream = this

  this._transform = function (binding, encoding, done) {
    Promise.resolve().then(function () {
      return callback(binding)
    }).then(function (mapped) {
      if (!mapped) {
        return
      }

      if (Array.isArray(mapped)) {
        mapped.forEach(function (mappedItem) {
          stream.push(mappedItem)
        })
      } else {
        stream.push(mapped)
      }
    }).asCallback(done)
  }
}

util.inherits(MapStream, Transform)

function count (callback, options) {
  return new CountStream(callback, options)
}

function map (callback) {
  return new MapStream(callback)
}

function parse () {
  return JSONStream.parse('*')
}

function serialize () {
  return JSONStream.stringify()
}

function asPromise (stream) {
  return new Promise(function (resolve, reject) {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

module.exports = {
  asPromise: asPromise,
  count: count,
  map: map,
  parse: parse,
  serialize: serialize
}
