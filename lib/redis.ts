import * as url from 'url'
import * as Redis from 'ioredis'
import * as debug from 'debug'

const debugEvents = debug('monredis:events')
const debugInfo = debug('monredis:info')

/**
* Extract password from connection URI
*/
function getRedisPasswordFromURI (redisUri: string | string[]): string {
    if (Array.isArray(redisUri)) {
        redisUri = redisUri[0]
    }
    const parsedURL = new url.URL(redisUri)
    return parsedURL.password
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type MonredisClusterOptions = Omit<Redis.ClusterOptions, 'redisOptions'>

const defaultNodeOptions: Redis.RedisOptions= {
    keyPrefix: '',
    autoResubscribe: true,
    autoResendUnfulfilledCommands: true,
}

const defaultClusterOptions: Redis.ClusterOptions = {
    retryDelayOnClusterDown: 300,
    retryDelayOnFailover: 1000,
    retryDelayOnTryAgain: 3000,
    slotsRefreshTimeout: 10000,
    clusterRetryStrategy: times => Math.min(times * 1000, 10000),
}

function getClient (
    host: string | string[],
    cluster: boolean = false,
    userNodeOptions: Redis.RedisOptions = {},
    userClusterOptions: MonredisClusterOptions = {}
): Redis.Redis | Redis.Cluster {
    const nodeOptions: Redis.RedisOptions = {...defaultNodeOptions, ...userNodeOptions}
    const clusterOptions: Redis.ClusterOptions = {...defaultClusterOptions, ...userClusterOptions}
    clusterOptions.redisOptions = nodeOptions
    let client
    if (cluster) {
        // Workaround for ioredis bug not passing password to all nodes if
        // endpoint is supplied using connection uri
        const password = getRedisPasswordFromURI(host)
        clusterOptions.redisOptions.password = password
        host = Array.isArray(host) ? host : [host]
        debugInfo('Creating new redis cluster instance')
        client = new Redis.Cluster(host, clusterOptions)
    } else {
        debugInfo('Creating new redis single node instance')
        client = new Redis(Array.isArray(host) ? host[0] : host, nodeOptions)
    }
    client.on('connecting', () => debugEvents('[connecting]'))
    client.on('connect', () => debugEvents('[connect]'))
    client.on('ready', () => debugEvents('[ready]'))
    client.on('error', (arg) => debugEvents('[error] with argument %O', arg))
    client.on('close', () => debugEvents('[close]'))
    client.on('reconnecting', () => debugEvents('[reconnecting]'))
    client.on('end', () => debugEvents('[end]'))
    return client
}

export = getClient
