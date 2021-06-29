const crypto = require('crypto')
const babelJest = require('babel-jest').default
const { process, processAsync } = require('./process')

function getCacheKey(
  fileData,
  filename,
  { config, instrument, configString, transformerConfig, cacheFS }
) {
  const cachedKey = babelJest.getCacheKey(fileData, filename, {
    config,
    cacheFS,
    instrument,
    configString,
    transformerConfig,
    rootDir: config.rootDir
  })

  return crypto
    .createHash('md5')
    .update(cachedKey, 'hex')
    .digest('hex')
}

async function getCacheKeyAsync(
  fileData,
  filename,
  { config, instrument, configString, transformerConfig, cacheFS }
) {
  const cachedKey = await babelJest.getCacheKeyAsync(fileData, filename, {
    config,
    cacheFS,
    instrument,
    configString,
    transformerConfig,
    rootDir: config.rootDir
  })

  return crypto
    .createHash('md5')
    .update(cachedKey, 'hex')
    .digest('hex')
}

const createTransformer = options => ({
  process,
  processAsync,
  getCacheKey,
  getCacheKeyAsync
})

const transformer = {
  canInstrument: true,
  createTransformer
}

module.exports = transformer
