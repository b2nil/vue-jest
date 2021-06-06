const ensureRequire = require('../ensure-require')
const babelJest = require('babel-jest')
const {
  getBabelOptions,
  getTsJestConfig,
  stripInlineSourceMap,
  getCustomTransformer,
  getVueJestConfig
} = require('../utils')

module.exports = {
  process(scriptContent, filePath, options) {
    ensureRequire('typescript', ['typescript'])
    const typescript = require('typescript')
    const vueJestConfig = getVueJestConfig(options.config)
    const tsconfig = getTsJestConfig(options.config)
    const babelOptions = getBabelOptions(filePath)

    const res = typescript.transpileModule(scriptContent, {
      ...tsconfig,
      fileName: filePath
    })

    res.outputText = stripInlineSourceMap(res.outputText)

    const inputSourceMap =
      res.sourceMapText !== undefined ? JSON.parse(res.sourceMapText) : ''

    // handle ES modules in TS source code in case user uses non commonjs module
    // output and there is no .babelrc.
    let inlineBabelOptions = {}
    if (
      tsconfig.compilerOptions.module !== typescript.ModuleKind.CommonJS &&
      !babelOptions
    ) {
      inlineBabelOptions = {
        plugins: [require('@babel/plugin-transform-modules-commonjs')]
      }
    }
    const customTransformer =
      getCustomTransformer(vueJestConfig['transform'], 'js') || {}
    const transformer = customTransformer.process
      ? customTransformer
      : babelJest.default.createTransformer(
          Object.assign(inlineBabelOptions, {
            inputSourceMap
          })
        )

    return transformer.process(res.outputText, filePath, options)
  }
}
