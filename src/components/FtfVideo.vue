<template>
  <div v-if="streamManager">
    <video ref="video" autoplay :muted="self"/>
    <div><p>{{ clientData?._value }}</p></div>
  </div>
</template>

<script>
import {
  defineComponent, ref, watch, computed, onMounted, toRefs,
} from 'vue';
import { useStore } from 'vuex';
import { helpers } from 'boot/helpers';
import { useI18n } from 'vue-i18n';
import { openVidu } from 'boot/openvidu';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'FtfVideo',
  props: {
    streamManager: {
      type: Object,
      required: true,
    },
    self: Boolean,
  },
  setup(props) {
    const { streamManager, self } = toRefs(props);
    const video = ref(null);

    const clientData = computed(() => {
      console.log(streamManager?.value?.stream?.connection?.data);
      return JSON.parse(streamManager?.value?.stream?.connection?.data)?.clientData;
    });

    onMounted(() => {
      const setVideo = () => { streamManager?.value?.addVideoElement?.(video?.value); };

      if (self.value) setTimeout(setVideo, 1000);
      else setVideo();
    });

    return { clientData, video };
  },
});
</script>

<style lang="scss">

</style>
