/* eslint-disable promise/always-return */
/* eslint-disable no-console */
'use strict'

const Redis = require('../lib/redis')

const client = Redis('redis://localhost:6379')

client.on('ready', () => { console.log('Connection ready') })
client.on('error', (arg) => {
  console.log('Error, maybe cluster or single instance down...')
  console.log(arg)
})
client.on('close', () => { console.log('Closed connection!') })
client.on('reconnecting', () => { console.log('Reconnecting...') })
client.on('end', () => { console.log('End event emitted') })

client.set('foo', 'bar')
  .then(res => {
    console.log(`Set result`, res)
    return client.get('foo')
  })
  .then(res => {
    console.log(`Get result`, res)
    return client.del('foo')
  })
  .then(res => {
    console.log(`Del result`, res)
    client.disconnect()
  })
  .catch(err => {
    console.log(err)
  })
