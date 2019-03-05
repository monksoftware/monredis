# Monk Log library

This is custom library for connecting to a single or cluster Redis instance based on [ioredis](https://github.com/luin/ioredis/tree/v3.2.2) package

## Requirements
- Node version >= 8.3.0

## Installation

Simply add this library as a dependency in your project.
You can use the github URI:

```
yarn add github:monksoftware/monk-redis
```

or add manually to your `package.json` file

```json
  {
    "dependencies": {
      [...] ,
      "monk-redis": "github:monksoftware/monk-redis"
    }
  }
```

## How to use

See `simple.js` file inside `example` folder

## Documentation

Pass a `config` object with this parameters:
- `cluster` default to `false`
- `host` connection uri example `redis://localhost:6439`
- `keyPrefix` a custom key prefix for all key, default is `monk-redis`

## Todo
- Better documentation
- Better test
