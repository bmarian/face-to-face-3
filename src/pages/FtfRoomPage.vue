<template>
  <q-page class="ftf-content__page">
    <div class="ftf-content__page-content">
      <ftf-video :streamManager="publisher" :self="true"/>
      <ftf-video v-for="sub in subscribers" :key="sub.stream.connection.connectionId" :streamManager="sub" />
    </div>
  </q-page>
</template>

<script>
import {
  defineComponent, ref, watch, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { helpers } from 'boot/helpers';
import { useI18n } from 'vue-i18n';
import { openVidu } from 'boot/openvidu';
import { api } from 'boot/axios';
import FtfVideo from 'components/FtfVideo';

const getToken = (sessionId) => {
  const auth = {
    username: openVidu.user,
    password: openVidu.secret,
  };
  const createSession = () => new Promise((resolve, reject) => {
    api.post('/openvidu/api/sessions', JSON.stringify({ customSessionId: sessionId }), { auth })
      .then((response) => response.data)
      .then((data) => resolve(data?.id))
      .catch((error) => {
        if (error.response.status === 409) return resolve(sessionId);

        // This part is only on dev env. This should never end up on production!
        const confirmation = `No connection to OpenVidu Server. This may be a certificate error at ${openVidu.ip}\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server is up and running at "${openVidu.ip}"`;
        // eslint-disable-next-line no-restricted-globals,no-alert
        if (window.confirm(confirmation)) location.assign(`${openVidu.ip}/accept-certificate`);

        return reject(error.response);
      });
  });
  const createToken = () => new Promise((resolve, reject) => {
    api.post(`/openvidu/api/sessions/${sessionId}/connection`, {}, { auth })
      .then((response) => response.data)
      .then((data) => resolve(data?.token))
      .catch((error) => reject(error.response));
  });
  return createSession().then(() => createToken());
};

const useVideoStreaming = () => {
  const store = useStore();

  const OV = ref(null);
  const session = ref(null);
  const publisher = ref(null);
  const subscribers = ref([]);
  const sessionId = ref(store.getters['application/roomId']);
  const userId = ref(store.getters['application/userData']?.name);
  const preferredVideoData = ref(store.getters['application/preferredVideoData']);

  const joinSession = () => {
    OV.value = new openVidu.OpenVidu();
    session.value = OV.value.initSession();

    session.value.on('streamCreated', ({ stream }) => {
      const subscriber = session.value.subscribe(stream);
      subscribers.value.push(subscriber);
    });

    session.value.on('streamDestroyed', ({ stream }) => {
      const index = subscribers.value.indexOf(stream.streamManager, 0);
      if (index >= 0) subscribers.value.splice(index, 1);
    });

    session.value.on('exception', ({ exception }) => {
      console.warn(exception);
    });

    getToken(sessionId.value).then((token) => {
      session.value.connect(token, { clientData: userId })
        .then(() => {
          publisher.value = OV.value.initPublisher(undefined, {
            audioSource: preferredVideoData.value.microphone.deviceId || undefined, // The source of audio. If undefined default microphone
            videoSource: preferredVideoData.value.camera.deviceId || undefined, // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
          });
          session.value.publish(publisher.value);
        })
        .catch((error) => console.log('There was an error connecting to the session:', error.code, error.message));
    });
  };

  onMounted(() => {
    joinSession();
  });

  return {
    OV,
    session,
    publisher,
    subscribers,
    sessionId,
    userId,
    joinSession,
  };
};

export default defineComponent({
  name: 'FtfRoomPage',
  components: { FtfVideo },
  setup() {
    const videoStreaming = useVideoStreaming();

    return { ...videoStreaming };
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
