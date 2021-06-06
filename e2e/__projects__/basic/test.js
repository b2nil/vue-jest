import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { defaults } from 'jest-config'
import path from 'path'

import BasicSrc from './components/BasicSrc.vue'
import TsSrc from './components/TsSrc.vue'
import Pug from './components/Pug.vue'
import Coffee from './components/Coffee.vue'
import Basic from './components/Basic.vue'
import TypeScript from './components/TypeScript.vue'
import jestVue from '../../../'
import RenderFunction from './components/RenderFunction.vue'
import FunctionalSFC from './components/FunctionalSFC.vue'
import CoffeeScript from './components/CoffeeScript.vue'
import FunctionalSFCParent from './components/FunctionalSFCParent.vue'
import NoScript from './components/NoScript.vue'
import PugRelative from './components/PugRelativeExtends.vue'
import { randomExport } from './components/NamedExport.vue'
import ScriptSetup from './components/ScriptSetup.vue'
import FunctionalRenderFn from './components/FunctionalRenderFn.vue'
import Jsx from './components/Jsx.vue'

const process = (source, filePath, options) => {
  const defaultCwd = path.resolve()
  const config = { ...defaults, ...(options || {}), cwd: defaultCwd }

  const transformer = jestVue.createTransformer({
    config
  })

  const output = transformer.process(source, filePath, { config })
  return {
    ...output
  }
}

test('supports <script setup>', async () => {
  const wrapper = mount(ScriptSetup)
  expect(wrapper.find('button').text()).toEqual('Count: 5')
  expect(wrapper.find('span').text()).toEqual('hello world')
  expect(wrapper.find('.hello h1').text()).toEqual('Welcome to Your Vue.js App')

  const log = jest.spyOn(console, 'log')
  await wrapper.find('button').trigger('click')
  expect(wrapper.find('button').text()).toEqual('Count: 6')
  expect(log.mock.calls[0][0]).toBe('greet')
})

test('processes .vue files', () => {
  const wrapper = mount(Basic)
  expect(wrapper.find('h1').text()).toBe('Welcome to Your Vue.js App')
})

test('processes .vue files with js src attributes', () => {
  const wrapper = mount(BasicSrc)
  expect(wrapper.find('h1').text()).toBe('Welcome to Your Vue.js App')
})

test('processes .vue files with ts src attributes', () => {
  const wrapper = mount(TsSrc)
  expect(wrapper.find('h1').text()).toBe('Welcome to Your Vue.js App')
})

test('handles named exports', () => {
  expect(randomExport).toEqual(42)
})

test('generates source maps for .vue files', () => {
  const filePath = resolve(__dirname, './components/Basic.vue')
  const fileString = readFileSync(filePath, { encoding: 'utf8' })
  const { code } = process(fileString, filePath, {
    moduleFileExtensions: ['js', 'vue']
  })

  expect(code).toMatchSnapshot()
})

test('generates source maps using src attributes', () => {
  const filePath = resolve(__dirname, './components/SourceMapsSrc.vue')
  const fileString = readFileSync(filePath, { encoding: 'utf8' })

  const { code } = process(fileString, filePath, {
    moduleFileExtensions: ['js', 'vue']
  })

  expect(code).toMatchSnapshot()
})

test('processes .vue file with lang set to coffee', () => {
  const wrapper = mount(Coffee)
  expect(wrapper.find('h1').text()).toBe('Coffee')
})

test('processes .vue file with lang set to coffeescript', () => {
  const wrapper = mount(CoffeeScript)
  expect(wrapper.find('h1').text()).toBe('CoffeeScript')
})

test('processes SFC with no template', () => {
  const wrapper = mount(RenderFunction, {
    slots: { default: () => h('div', { id: 'slot' }) }
  })
  expect(wrapper.find('#slot').exists()).toBeTruthy()
})

test('processes .vue files with lang set to typescript', () => {
  const wrapper = mount(TypeScript)
  expect(wrapper.find('#parent').text()).toBe('Parent')
  expect(wrapper.find('#child').text()).toBe('Child')
})

test('handles missing script block', () => {
  const wrapper = mount(NoScript)
  expect(wrapper.find('.footer').text()).toBe("I'm footer!")
})

test('processes pug templates', () => {
  const wrapper = mount(Pug)
  expect(wrapper.find('.pug-base').exists()).toBeTruthy()
  expect(wrapper.find('.pug-extended').exists()).toBeTruthy()
})

test('supports relative paths when extending templates from .pug files', () => {
  const wrapper = mount(PugRelative)
  expect(wrapper.find('.pug-relative-base').exists()).toBeTruthy()
})

test('processes functional components', async () => {
  const mockFn = jest.fn()
  const wrapper = mount(FunctionalSFC, {
    props: {
      msg: {
        id: 1,
        title: 'foo'
      },
      onClick: mockFn
    }
  })

  const el = wrapper.find('div')
  el.trigger('click')
  expect(el.text()).toBe('foo')
  expect(mockFn).toBeCalled()
})

test('processes SFC with functional template from parent', () => {
  const wrapper = mount(FunctionalSFCParent)
  expect(wrapper.find('div').text()).toBe('foo')
})

test('processes .vue file using jsx', () => {
  const wrapper = mount(Jsx)
  expect(wrapper.find('#jsx').exists()).toBeTruthy()
})

test('processes functional component exported as function', () => {
  const wrapper = mount(FunctionalRenderFn)

  const elem = wrapper.find('#functional-render-fn')
  expect(elem.exists()).toBeTruthy()
  expect(elem.text()).toBe('Nyan')
})
