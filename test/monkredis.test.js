const { before, describe, it } = require('mocha')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const Redis = require('../index')

chai.use(chaiAsPromised)
const expect = chai.expect
if (!process.env.REDIS_HOST) {
  throw new Error(
    'You must set the redis host to use for testing in the REDIS_HOST'
    +' environment variable.')
}

describe('redis client', function () {
  before('set up redis client', function () {
    this.redis = Redis(process.env.REDIS_HOST, {}, {lazyConnect: true})
  })
  it('should support ioredis lazyConnect option', function () {
    this.timeout(2000)
    expect(this.redis.status).to.equal('wait')
  })
  it('should correctly connect to single node', async function () {
    this.timeout(2000)
    const promise = this.redis.connect()
    expect(this.redis.status).to.equal('connecting')
    await promise
    expect(this.redis.status).to.equal('connect')
  })
  it('should get a null value', function () {
    return expect(this.redis.get('fakeval032943285')).to.eventually.be.null
  })
  it('should set a value', function () {
    return expect(this.redis.set('foo', 'bar')).to.eventually.have.string('OK')
  })
  it('should get a value', function () {
    return expect(this.redis.get('foo')).to.eventually.have.string('bar')
  })
  it('should delete a value', function () {
    return expect(this.redis.del('foo')).to.eventually.equal(1)
  })
  it('should emit an end event', function(done) {
    this.timeout(2000)
    this.redis.disconnect()
    this.redis.once('end', () => {
      expect(this.redis.status).to.equal('end')
      done()
    })
  })
})
