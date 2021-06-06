module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.js$': './babel-transformer.js',
    '^.+\\.vue$': '../../../lib'
  },
  moduleNameMapper: {
    '^~?__styles/(.*)$': '<rootDir>/components/styles/$1'
  },
  globals: {
    'vue-jest': {
      transform: {
        '^scss$': './scss-transformer.js',
        '^pcss|postcss$': './pcss-transformer.js',
        '^js$': './babel-transformer.js'
      },
      template: {
        compilerOptions: {
          isCustomElement: tag => ['view', 'scroll-view'].includes(tag),
          nodeTransforms: [
            function(node, context) {
              if (node.type === 3 /* NodeTypes.COMMENT */) {
                context.removeNode(node)
              }
            }
          ]
        }
      }
    }
  }
}
