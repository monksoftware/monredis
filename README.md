# Monredis

Monredis is a thin wrapper around
[ioredis](https://github.com/luin/ioredis/tree/v3.2.2)
providing improved cluster support and sensible defaults for both
single-node and cluster redis instances.

## Usage

The module exports a factory function, use it to get a ioredis redis client

```js
const Redis = require('monredis')

// Single node redis instance
const redisClient = Redis('redis://:authpwd@host:port')

// Redis cluster with keys prefix
const redisClusterClient = Redis(
  'redis://:authpwd@host:port',
  true,
  {keyPrefix: 'myprefix'}
)
```

See `simple.js` file inside `example` folder for a more complete example.

## Documentation

The factory functions takes 4 arguments:

* `host`: string or array, required.
  The [redis url](https://www.iana.org/assignments/uri-schemes/prov/redis) to
  connect to. Can be an array of multiple urls if connecting to a cluster,
  so that if some nodes are down it will connect to the next one in the array
  for the initial connection. NOTE: **You don't have to pass all the cluster
  nodes here when connecting to a cluster!** ioredis will automatically find
  and connect to all nodes as soon as it connects to one;
  the nodes here are only the candidates for the initial connection. One or two
  are enough unless you have a very unstable cluster.
* `cluster`: boolean, default `false` - pass `true` to connect to redis cluster
* `nodeOptions`: object, optional -
  [ioredis redis options](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options)
* `clusterOptions`: object, optional -
  [ioredis cluster options](https://github.com/luin/ioredis/blob/master/API.md#Cluster),
  minus the `redisOptions` key, which we take from the previous `nodeOptions`
  parameter.

You can check the default values for `nodeOptions` and `clusterOptions` in the
main source file and in the
[ioredis'documentation](https://github.com/luin/ioredis/blob/master/API.md#new_Redis_new).
The values you provide will overwrite the defaults, so you
can change a single key or override everything.

### Keys prefix

One particularly useful param in `nodeOptions` is the `keyPrefix` one:
if supplied, all keys in the commands executed by the client will be
automatically and transparently prefixed with the value. For example:

```js
const Monredis = require('monredis')
const redis = Monredis('redis://localhost:6379', false, {keyPrefix: 'dev:'})

// Will actually create and read 'dev:mymapkey'
redisClient.set('mykey', 'value')
redisClient.get('mykey')
```

This is great for namespacing of keys in shared redis instances, or you can
also use this feature to [force all your keys to end up in a single redis
cluster node by providing a prefix between `{}` brackets.](
https://redis.io/topics/cluster-tutorial#redis-cluster-data-sharding)

## Todo

- Transform to typescript or add typings
- Improve packaging
