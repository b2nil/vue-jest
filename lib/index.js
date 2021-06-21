const crypto = require('crypto')
const babelJest = require('babel-jest').default

const createTransformer = options => ({
  process: require('./process'),
  getCacheKey: function getCacheKey(
    fileData,
    filename,
    { config, instrument, configString, transformerConfig, cacheFS }
  ) {
    return crypto
      .createHash('md5')
      .update(
        babelJest.getCacheKey(fileData, filename, {
          config,
          cacheFS,
          instrument,
          configString,
          transformerConfig,
          rootDir: config.rootDir
        }),
        'hex'
      )
      .digest('hex')
  }
})

const transformer = {
  canInstrument: true,
  createTransformer
}

module.exports = transformer
