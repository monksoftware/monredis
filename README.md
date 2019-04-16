# Monredis

Monredis is a thin wrapper around
[ioredis](https://github.com/luin/ioredis/tree/v3.2.2)
providing improved cluster support and sensible defaults for both
single-node and cluster redis instances.

## Usage

The module exports a factory function, use it to get a ioredis redis client

```js
const Redis = require('monredis')

const redisClient = Redis('redis://:authpwd@host:port', {
  cluster: true,
  keyPrefix: }
)
redisClient.hmset('mymapkey', {fieldone: '1', fieldtwo: '2'})
```

See `simple.js` file inside `example` folder for a more complete example.

## Documentation

The factory functions takes 4 arguments:

* `host`: string or array, required.
  The [redis url](https://www.iana.org/assignments/uri-schemes/prov/redis) to
  connect to. Can be an array of multiple urls if connecting to a cluster,
  so that if some nodes are down it will connect to the next one in the array
  for the initial connection
* `clientOptions` - main client options, optional
  * `clientOptions.cluster`: boolean, default `false` - set to `true`
    if connecting to a cluster instance.
  * `clientOptions.keyPrefix`: string, default `undefined` - if set,
    this client will transparently prefix all keys with this string. Useful
    for namespacing in redis instances shared by multiple projects
* `nodeOptions`: object, optional -
  [ioredis redis options](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options)
* `clusterOptions`: object, optional -
  [ioredis cluster options](https://github.com/luin/ioredis/blob/master/API.md#Cluster),
  minus the `redisOptions` key, which we take from the previous `nodeOptions`
  paramter.

You can check the default values for `nodeOptions` and `clusterOptions` in the
main source file. The values you provide will overwrite the defaults, so you
can change a single key or override everything.

## Todo

- Transform to typescript or add typings
- Improve packaging
