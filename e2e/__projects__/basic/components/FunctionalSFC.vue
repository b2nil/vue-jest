<template>
  <div v-bind="$attrs">
    {{ $props.msg.title }}
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['msg']
}
</script>
