<template>
  <div>
    <view class="light">should be treated as native tag</view>
    <comp>should resolve this tag as component</comp>
    <!-- comment should be removed in snapshot -->
    <scroll-view class="dark">should be treated as native tag</scroll-view>
    <unknown-tag class="unkown">should fail to resolve this tag </unknown-tag>
  </div>
</template>

<script>
import Comp from './comp.vue'
export default {
  name: 'NodeTransform',
  components: { Comp }
}
</script>
