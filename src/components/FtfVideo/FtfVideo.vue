<template>
  <div class="ftf-video-container" v-if="streamManager">
    <ftf-video-player class="ftf-video" :streamManager="streamManager" :muted="muted" />
    <span v-if="userName" class="ftf-video-label">{{ userName }}</span>
  </div>
</template>

<script>
import {
  defineComponent, ref, toRefs, watch, onMounted,
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
    const userName = ref('');

    onMounted(() => {
      userName.value = JSON.parse(streamManager.value?.stream?.connection?.data || null)?.clientData;
    });
    return { userName };
  },
});
</script>

<style lang="scss">
.ftf-video-container {
  overflow: hidden;
  position: relative;

  width: 100%;
  height: 100%;

  border: 0.2rem solid $secondary;

  &__content {
    position: relative;
    height: auto;
    width: 100%;
  }

  & .ftf-video {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  & .ftf-video-label {
    background-color: $secondary;
    padding: 0.1rem;

    position: absolute;
    left: 0;
    bottom: 0;
  }
}
</style>
