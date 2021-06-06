import { mount } from '@vue/test-utils'
import NodeTransform from './components/NodeTransform.vue'

test('should honor sfc template compile options provided in globals', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn())

  const wrapper = mount(NodeTransform)
  expect(wrapper.element).toMatchSnapshot()

  const viewEl = wrapper.find('.light')
  const scrollViewEl = wrapper.find('.dark')

  expect(viewEl.element.tagName).toEqual('VIEW')
  expect(scrollViewEl.element.tagName).toEqual('SCROLL-VIEW')
  expect(wrapper.findComponent('.light').exists()).toBeFalsy()
  expect(wrapper.findComponent('.dark').exists()).toBeFalsy()

  expect(wrapper.findComponent('.comp').exists()).toBeTruthy()

  expect(wrapper.findComponent('.unkown').exists()).toBeFalsy()

  expect(warn.mock.calls[0][0]).toEqual(
    '[Vue warn]: Failed to resolve component: unknown-tag'
  )
})

// TODO: Figure this out with Vue 3. `$style` no longer exists.
test.todo('processes SCSS using user specified post transforms')

test.todo('processes SCSS using user specified pre transforms')
