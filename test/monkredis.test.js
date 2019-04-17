const { describe, it } = require('mocha')
const chai = require('chai')
const expect = chai.expect

const Redis = require('../index')

const redis = Redis('redis://localhost:6379')

describe('redis client', () => {
  it('should connect to single node', () => {
    expect(redis.constructor.name).is.equal('Redis')
  })
  it('should get a null value', async () => {
    const res = await redis.get('fakeVal')
    expect(res).to.be.null
  })
  it('should set a value', async () => {
    const res = await redis.set('foo', 'bar')
    expect(res).to.have.string('OK')
  })
  it('should get a value', async () => {
    const res = await redis.get('foo')
    expect(res).to.have.string('bar')
  })
  it('should delete a value', async () => {
    const res = await redis.del('foo')
    expect(res).to.equal(1)
  })
  it('should emit an end event', function(done) {
    this.timeout(2000)
    redis.disconnect()
    redis.once('end', () => {
      done()
    })
  })
})
