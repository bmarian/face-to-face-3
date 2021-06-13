<template>
  <q-page class="ftf-content__page">
    <div v-if="showPageOverlay" class="ftf-content__page-overlay" />
    <div class="ftf-content__page-content">
      <div v-if="finishedSettingUpUserVideo" class="ftf-room">
        <ftf-video :streamManager="publisher" :muted="true"/>
        <ftf-video v-for="sub in subscribers" :key="sub.stream.connection.connectionId" :streamManager="sub" />
      </div>
      <div v-else class="ftf-room-user-video-setup">
        <q-card class="ftf-card" flat bordered>
          <q-card-section class="col-5 flex flex-center">
            <ftf-video class="ftf-user-stream" :streamManager="userPublisher" :muted="true"/>
          </q-card-section>

          <q-card-section class="q-pt-xs">
            <q-btn-dropdown
              class="ftf-input-button q-mt-md"
              flat
              color="primary"
              icon="videocam"
              :label="selectedCamera?.label || t('camera')">
              <q-list>
                <q-item
                  v-for="(camera, index) in availableCameras" :key="index"
                  clickable
                  v-close-popup
                  @click="selectedCamera = camera">
                  <q-item-label>{{ camera.label }}</q-item-label>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <br />
            <q-btn-dropdown
              class="ftf-input-button q-mt-lg"
              flat
              color="primary"
              icon="mic"
              :label="selectedMicrophone?.label || t('microphone')">
              <q-list>
                <q-item
                  v-for="(microphone, index) in availableMicrophones" :key="index"
                  clickable
                  v-close-popup
                  @click="selectedMicrophone = microphone">
                  <q-item-label>{{ microphone.label }}</q-item-label>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-card-section>

          <q-separator />

          <q-card-actions class="ftf-card-actions">
            <q-btn
              class="ftf-input-button"
              flat
              color="primary"
              @click="finishSettingUpUserVideo">
              {{t('finish')}}
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import FtfVideo from 'components/FtfVideo/FtfVideo';
import useOpenvidu from 'src/composables/useOpenvidu';
import useUserStream from 'src/composables/userStream';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'FtfRoomPage',
  components: { FtfVideo },
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    const finishedSettingUpUserVideo = ref(false);
    const showPageOverlay = ref(false);
    const openvidu = useOpenvidu();
    const userStream = useUserStream(openvidu, finishedSettingUpUserVideo, showPageOverlay);

    return {
      t,
      showPageOverlay,
      finishedSettingUpUserVideo,
      ...openvidu,
      ...userStream,
    };
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

    &-overlay {
      position: absolute;
      top: 0;
      left: 0;

      height: 100vh;
      width: 100vw;
      overflow: hidden;

      background-color: $gray;
      opacity: 0.8;
    }
  }
}
.ftf-room-user-video-setup {
  & .ftf-user-stream {
    width: 25rem;
    height: 25rem;
  }

  & .ftf-input-button {
    width: 100%;

    & .q-btn__content > span {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
