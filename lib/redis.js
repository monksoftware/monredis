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

const defaultClientOptions = {
  cluster: false,
  keyPrefix: undefined,
}

const defaultNodeOptions = {
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,
}

const defaultClusterOptions = {
  enableReadyCheck: true,
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 1000,
  retryDelayOnTryAgain: 3000,
  slotsRefreshTimeout: 10000,
  clusterRetryStrategy: times => Math.min(times * 1000, 10000),
}

function getClient (
  host,
  userClientOptions = {},
  userNodeOptions = {},
  userClusterOptions = {}
) {
  const clientOptions = {...defaultClientOptions, ...userClientOptions}
  const nodeOptions = {...defaultNodeOptions, ...userNodeOptions}
  const clusterOptions = {...defaultClusterOptions, ...userClusterOptions}
  clusterOptions.redisOptions = nodeOptions
  let client
  if (clientOptions.cluster) {
    // Workaround for ioredis bug not passing password to all nodes if
    // endpoint is supplied using connection uri
    const password = getRedisPasswordFromURI(host)
    clusterOptions.redisOptions.password = password
    host = Array.isArray(host) ? host : [host]
    debug('Creating new redis cluster instance')
    client = new Redis.Cluster(host, clusterOptions)
  } else {
    debug('Creating new redis single node instance')
    client = new Redis(host, nodeOptions)
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

module.exports = getClient
