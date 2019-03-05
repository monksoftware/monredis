/* eslint-disable no-console */
'use strict'

const url = require('url')
const events = require('events').EventEmitter
const emitter = new events.EventEmitter()
const Redis = require('ioredis')
const debug = require('debug')('monk:redis')

debug.log = console.log.bind(console)
Redis.Promise = global.Promise

/**
 * ioRedis has a bug where if the redis instance endpoint is supplied using
 * a connection uri; the password is passed only to the
 * @param {string} redisUri
 */
const getRedisPasswordFromURI = (redisUri) => {
  if (Array.isArray(redisUri)) {
    redisUri = redisUri[0]
  }

  const parsedURL = new url.URL(redisUri)
  return parsedURL.password
}

let _config = new Map()
let _nodeOptions
let _clusterOptions

function setConfig({
  cluster = false,
  host,
  keyPrefix = 'monk-redis'
} = {}) {
  _config.set('cluster', cluster)
  _config.set('host', host)
  _config.set('keyPrefix', `${keyPrefix}:`)
}

function setNodeOptions({
  autoResubscribe = true,
  autoResendUnfulfilledCommands = true
} = {}) {
  _nodeOptions = {
    autoResubscribe,
    autoResendUnfulfilledCommands
  }
}

function setClusterOptions({
  enableReadyCheck = true,
  retryDelayOnClusterDown = 300,
  retryDelayOnFailover = 1000,
  retryDelayOnTryAgain = 3000,
  slotsRefreshTimeout = 10000,
  clusterRetryStrategy = times => Math.min(times * 1000, 10000)
} = {}) {
  _clusterOptions = {
    enableReadyCheck,
    retryDelayOnClusterDown,
    retryDelayOnFailover,
    retryDelayOnTryAgain,
    slotsRefreshTimeout,
    clusterRetryStrategy
  }
}

const clientFactory = () => {
  if (_config.size === 0) {
    throw new Error(`No config provided.`)
  }

  if (!_nodeOptions) {
    setNodeOptions()
    _nodeOptions.keyPrefix = _config.get('keyPrefix')
  }

  if (!_clusterOptions) {
    setClusterOptions()
    _clusterOptions.keyPrefix = _nodeOptions.keyPrefix,
    _clusterOptions.redisOptions = _nodeOptions
  }

  let client
  if (_config.get('cluster')) {
    // Workaround for ioredis bug not passing password to all nodes if
    // endpoint is supplied using connection uri
    const password = getRedisPasswordFromURI(_config.get('host'))
    _clusterOptions.redisOptions.password = password
    let host = _config.get('host')
    host = Array.isArray(host) ? host : [host]
    debug('Creating new redis cluster instance')
    client = new Redis.Cluster(host, _clusterOptions)
  } else {
    debug('Creating new redis single node instance')
    client = new Redis(_config.get('host'), _nodeOptions)
  }
  client.on('ready', function() {
    debug('emit ready event')
    emitter.emit('ready')
  })
  client.on('error', (arg) => {
    debug('emit error event with error %O', arg)
    emitter.emit('error', arg)
  })
  client.on('close', () => {
    debug('emit close event')
    emitter.emit('close')
  })
  client.on('reconnecting', () => {
    debug('emit reconnecting event')
    emitter.emit('reconnecting')
  })
  client.on('end', () => {
    debug('emit end event')
    emitter.emit('end')
  })

  return client
}

module.exports = (config, nodeOptions, clusterOptions) => {
  if (config) {
    setConfig(config)
  }

  if (nodeOptions) {
    setNodeOptions(nodeOptions)
  }

  if (clusterOptions) {
    setClusterOptions(clusterOptions)
  }

  return clientFactory()
}
module.exports.clientFactory = (config, nodeOptions, clusterOptions) => {
  if (config) {
    setConfig(config)
  }

  if (nodeOptions) {
    setNodeOptions(nodeOptions)
  }

  if (clusterOptions) {
    setClusterOptions(clusterOptions)
  }

  return clientFactory
}
