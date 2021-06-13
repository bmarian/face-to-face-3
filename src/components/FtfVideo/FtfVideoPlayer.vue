<template>
  <video ref="video" autoplay playsinline :muted="muted"/>
</template>

<script>
import {
  defineComponent, ref, onMounted, toRefs,
} from 'vue';

export default defineComponent({
  name: 'FtfVideoPlayer',
  props: {
    streamManager: { required: true },
    muted: { type: Boolean, default: true },
  },
  setup(props) {
    const { streamManager } = toRefs(props);
    const video = ref(undefined);

    onMounted(() => {
      // A dirty fix for initializing the video because sometimes its ref is null
      setTimeout(() => {
        streamManager?.value?.addVideoElement?.(video?.value);
      }, 1000);
    });

    return { video };
  },
});
</script>
