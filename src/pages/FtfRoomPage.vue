<template>
  <q-page class="ftf-content__page">
    <div class="ftf-content__page-content">
      <div v-if="finishedSettingUpUserVideo" class="ftf-room">
        <div class="ftf-room__header">
          <div class="ftf-room__header-content">
            <q-btn v-if="!subscriberShareScreening" flat rounded color="primary" :icon="screenShareState ? 'screen_share' : 'stop_screen_share'" @click="toggleScreenShare" />
            <q-btn flat rounded color="primary" :icon="chatState ? 'chat' : 'speaker_notes_off'" @click="toggleChat"/>
            <q-btn flat rounded color="primary" :icon="cameraState ? 'videocam' : 'videocam_off'" @click="toggleCamera"/>
            <q-btn flat rounded color="primary" :icon="microphoneState ? 'mic' : 'mic_off'" @click="toggleMicrophone" />
            <q-btn flat rounded color="negative" icon="phone" @click="disconnect" />
          </div>
        </div>
        <div class="ftf-room__video-grid" :style="`width: ${!chatState || $q.platform.is.mobile ? 100 : 80}%`">
          <div v-show="!shareScreenOngoing" class="ftf-room__video-grid__content">
            <ftf-video :streamManager="publisher" :muted="true"/>
            <ftf-video v-for="sub in subscribers" :key="sub?.stream?.connection?.connectionId" :streamManager="sub" />
          </div>

          <div v-if="shareScreenOngoing" class="ftf-room__video-grid__screen-share">
            <ftf-video :streamManager="shareScreenSubscriber || publisher" :muted="true"/>
          </div>
        </div>
        <div v-if="chatState && !$q.platform.is.mobile" class="ftf-room__chat">
          <!--TODO: DO CHAT THINGHYS HERE-->
          <p>Chat url:</p>
          <p v-for="message in messages" :key="message">{{message}}</p>
        </div>
      </div>
      <div v-else class="ftf-room-user-video-setup">
        <q-card class="ftf-card" flat bordered>
          <q-card-section class="col-5 flex flex-center">
            <ftf-video-player class="ftf-user-stream" :mediaStream="userMediaStream" :muted="true"/>
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
import {
  defineComponent, ref, onMounted, computed,
} from 'vue';
import FtfVideo from 'components/FtfVideo/FtfVideo';
import useOpenvidu from 'src/composables/useOpenvidu';
import useUserStream from 'src/composables/userStream';
import { useI18n } from 'vue-i18n';
import FtfVideoPlayer from 'components/FtfVideo/FtfVideoPlayer';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
import useCommands from 'src/composables/useCommands';
import useChat from 'src/composables/useChat';

export default defineComponent({
  name: 'FtfRoomPage',
  components: { FtfVideoPlayer, FtfVideo },
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    const $q = useQuasar();

    const finishedSettingUpUserVideo = ref(false);
    const showPageOverlay = ref(false);
    const openvidu = useOpenvidu();
    const userStream = useUserStream(openvidu, finishedSettingUpUserVideo, showPageOverlay);
    const commands = useCommands(openvidu.session, openvidu.publisher, openvidu.OV);
    const chat = useChat(openvidu.session);

    const userShareScreening = computed(() => commands.screenShareState.value);
    const subscriberShareScreening = computed(() => openvidu.subscribers.value.length && !!openvidu.shareScreenSubscriber.value);
    const shareScreenOngoing = computed(() => userShareScreening.value || subscriberShareScreening.value);

    onMounted(() => {
      const store = useStore();
      const route = useRoute();
      store.dispatch('application/setRoomId', route?.params?.roomId);
    });
    return {
      t,
      showPageOverlay,
      finishedSettingUpUserVideo,
      ...openvidu,
      ...userStream,
      ...commands,
      ...chat,
      $q,
      userShareScreening,
      subscriberShareScreening,
      shareScreenOngoing,
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

      background-color: $primary;
      box-shadow: 0.1rem 0.1rem 0.1rem $gray;
      opacity: 0.8;
    }
  }
}

.ftf-room {
  height: 100vh;
  width: 100vw;

  &__header {
    width: 100%;
    height: 2.5rem;
    border-color: rgba(255, 255, 255, 0.28);
    background-color: $dark;

    &-content {
      height: 100%;
      width: 100%;

      padding-left: 2rem;
      padding-right: 1rem;

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-content: center;
      justify-content: flex-end;
      align-items: center;
    }

    &-icon {
      margin-left: 1rem;
      margin-right: 1rem;
    }
  }

  &__video-grid {
    position: absolute;
    left: 0;

    height: calc(100vh - 2.5rem);
    margin-top: 0.2rem;

    &__content {
      width: 100%;
      height: 100%;

      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 49vh calc(49vh - 2.7rem);
      gap: 0.8rem;
      justify-items: stretch;

      & :nth-child(-n+4) {
        grid-column: auto / span 2;
      }

      & :first-child:nth-last-child(1) {
        grid-column: auto / span 4;
        grid-row: auto / span 2;
      }

      //for more info look here https://css-tricks.com/solved-with-css-logical-styling-based-on-the-number-of-given-elements/
      & :first-child:nth-last-child(2),
      & :first-child:nth-last-child(2) ~ div {
        grid-column: auto / span 2;
        grid-row: auto / span 2;
      }

      & :first-child:nth-last-child(3):last-child,
      & :first-child:nth-last-child(3) ~ :last-child {
        grid-column: 2 / span 2;
      }
    }

    &__screen-share {
      width: 100%;
      height: 100%;

      & .ftf-video-container {
        border: 0;

        & .ftf-video {
          transform: rotateY(0) !important;
          object-fit: contain;
        }

        & .ftf-video-label {
          display: none;
        }
      }
    }
  }

  &__chat {
    position: absolute;
    margin-top: 0.2rem;
    right: 0;

    width: 20%;
    height: calc(100vh - 2.7rem);
    overflow-y: auto;
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
