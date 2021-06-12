<template>
  <q-page class="ftf-content__page">
    <div class="ftf-content__page-content">
      HELLO WORLD
    </div>
  </q-page>
</template>

<script>
import {
  defineComponent, ref, watch, computed,
} from 'vue';
import { useStore } from 'vuex';
import { helpers } from 'boot/helpers';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'FtfCreateRoomPage',
  setup() {
    return { };
  },
});
</script>

<style lang="scss">
.ftf-content {
  &__page {
    height: 100vh;
    width: 100vw;
    overflow: hidden;

    &-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
