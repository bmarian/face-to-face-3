<template>
  <video ref="video" autoplay playsinline :muted="muted"/>
</template>

<script>
import {
  defineComponent, ref, onMounted, toRefs, watch,
} from 'vue';
import { helpers } from 'boot/helpers';

export default defineComponent({
  name: 'FtfVideoPlayer',
  props: {
    streamManager: {},
    mediaStream: {},
    muted: { type: Boolean, default: true },
  },
  setup(props) {
    const { mediaStream, streamManager } = toRefs(props);
    const video = ref(undefined);

    onMounted(() => {
      helpers.delayedAction(() => {
        if (streamManager?.value) streamManager?.value?.addVideoElement?.(video?.value);
        if (mediaStream?.value) video.value.srcObject = mediaStream.value;
      });
    });

    watch(mediaStream, (newMediaStream) => {
      if (newMediaStream) video.value.srcObject = newMediaStream;
    });
    return { video };
  },
});
</script>
