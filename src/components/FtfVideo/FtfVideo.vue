<template>
  <div class="ftf-video-container" v-if="streamManager">
    <ftf-video-player class="ftf-video" :streamManager="streamManager" :muted="muted" />
    <span v-if="userName" class="ftf-video-label">{{ userName }}</span>
  </div>
</template>

<script>
import {
  defineComponent, computed, toRefs,
} from 'vue';
import FtfVideoPlayer from 'components/FtfVideo/FtfVideoPlayer';

export default defineComponent({
  name: 'FtfVideo',
  components: { FtfVideoPlayer },
  props: {
    streamManager: { type: Object },
    muted: Boolean,
  },
  setup(props) {
    const { streamManager } = toRefs(props);
    // eslint-disable-next-line no-underscore-dangle
    const userName = computed(() => JSON.parse(streamManager?.value?.stream?.connection?.data || null)?.clientData?._value);

    return { userName };
  },
});
</script>

<style lang="scss">
.ftf-video {
  width: 100%;
  height: 100%;
}
</style>
