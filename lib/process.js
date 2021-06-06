const { parse, compileTemplate, compileScript } = require('@vue/compiler-sfc')
const { transform } = require('@babel/core')
const babelTransformer = require('babel-jest').default

const typescriptTransformer = require('./transformers/typescript')
const coffeescriptTransformer = require('./transformers/coffee')
const _processStyle = require('./process-style')
// const processCustomBlocks = require('./process-custom-blocks')
const getVueJestConfig = require('./utils').getVueJestConfig
const getTsJestConfig = require('./utils').getTsJestConfig
const logResultErrors = require('./utils').logResultErrors
const stripInlineSourceMap = require('./utils').stripInlineSourceMap
const getCustomTransformer = require('./utils').getCustomTransformer
const loadSrc = require('./utils').loadSrc
const generateCode = require('./generate-code')
const mapLines = require('./map-lines')

function resolveTransformer(lang = 'js', vueJestConfig) {
  const transformer = getCustomTransformer(vueJestConfig['transform'], lang)
  if (/^typescript$|tsx?$/.test(lang)) {
    return transformer || typescriptTransformer
  } else if (/^coffee$|coffeescript$/.test(lang)) {
    return transformer || coffeescriptTransformer
  } else {
    return transformer || babelTransformer
  }
}

function processScript(scriptPart, filePath, options) {
  if (!scriptPart) {
    return null
  }

  let content = scriptPart.content
  let filename = filePath
  if (scriptPart.src) {
    content = loadSrc(scriptPart.src, filePath)
    filename = scriptPart.src
  }

  const vueJestConfig = getVueJestConfig(options.config)
  const transformer = resolveTransformer(scriptPart.lang, vueJestConfig)
  const result = transformer.process(content, filename, options)
  result.code = stripInlineSourceMap(result.code)
  result.map = mapLines(scriptPart.map, result.map)
  return result
}

function processScriptSetup(descriptor, filePath, options) {
  if (!descriptor.scriptSetup) {
    return null
  }
  const content = compileScript(descriptor, { id: filePath })
  const contentMap = mapLines(descriptor.scriptSetup.map, content.map)

  const vueJestConfig = getVueJestConfig(options.config)
  const transformer = resolveTransformer(
    descriptor.scriptSetup.lang,
    vueJestConfig
  )

  const result = transformer.process(content.content, filePath, options)
  result.map = mapLines(contentMap, result.map)

  return result
}

function processTemplate(descriptor, filename, options) {
  const { template, scriptSetup } = descriptor

  if (!template) {
    return null
  }

  const vueJestConfig = getVueJestConfig(options.config)

  if (template.src) {
    template.content = loadSrc(template.src, filename)
  }

  let bindings
  if (scriptSetup) {
    const scriptSetupResult = compileScript(descriptor, { id: filename })
    bindings = scriptSetupResult.bindings
  }

  const result = compileTemplate({
    ...(vueJestConfig.template || {}),
    id: filename,
    source: template.content,
    filename,
    preprocessLang: template.lang,
    preprocessOptions: vueJestConfig[template.lang],
    compilerOptions: {
      ...((vueJestConfig.template && vueJestConfig.template.compilerOptions) ||
        {}),
      bindingMetadata: bindings,
      mode: 'module'
    }
  })

  logResultErrors(result)

  const tsconfig = getTsJestConfig(options.config)

  if (tsconfig) {
    // they are using TypeScript.
    const { transpileModule } = require('typescript')
    const { outputText } = transpileModule(result.code, { tsconfig })
    return { code: outputText }
  } else {
    // babel
    const babelify = transform(result.code, { filename: 'file.js' })

    return {
      code: babelify.code
    }
  }
}

function processStyle(styles, filename, options) {
  if (!styles) {
    return null
  }

  const filteredStyles = styles
    .filter(style => style.module)
    .map(style => ({
      code: _processStyle(style, filename, options.config),
      moduleName: style.module === true ? '$style' : style.module
    }))

  return filteredStyles.length ? filteredStyles : null
}

module.exports = function(src, filename, options) {
  const { descriptor } = parse(src, { filename })
  const templateResult = processTemplate(descriptor, filename, options)
  const scriptResult = processScript(descriptor.script, filename, options)
  const scriptSetupResult = processScriptSetup(descriptor, filename, options)
  const stylesResult = processStyle(descriptor.styles, filename, options)
  // const customBlocksResult = processCustomBlocks(
  //   descriptor.customBlocks,
  //   filename,
  //   config
  // )
  const output = generateCode(
    scriptResult,
    scriptSetupResult,
    templateResult,
    filename,
    stylesResult
  )

  return {
    code: output.code,
    map: output.map.toString()
  }
}
