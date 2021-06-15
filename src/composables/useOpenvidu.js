import {
  defineComponent, ref, watch, computed, onMounted,
} from 'vue';
import { openVidu } from 'boot/openvidu';
import { api } from 'boot/axios';
import { useStore } from 'vuex';

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

const useOpenvidu = () => {
  const store = useStore();

  const OV = ref(undefined);
  const session = ref(undefined);
  const publisher = ref(undefined);
  const subscribers = ref([]);
  const sessionId = computed(() => store.getters['application/roomId']);
  const userId = computed(() => store.getters['application/userData']?.name);
  const preferredVideoData = computed(() => store.getters['application/preferredVideoData']);

  const createSession = () => {
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

    session.value.on('exception', ({ exception }) => { console.warn(exception); });
  };

  const shareScreenSubscriber = ref(undefined);
  const addSignalEvents = () => {
    session.value.on('signal:event', ({ data, form, type }) => {
      if (!subscribers.value.length) return;
      shareScreenSubscriber.value = !data
        ? undefined
        : subscribers.value.find((subscriber) => subscriber.stream.streamId === data);
    });
  };

  const joinSession = (userPublisher) => {
    getToken(sessionId.value).then((token) => {
      addSignalEvents();
      session.value.connect(token, { clientData: userId.value })
        .then(() => {
          if (userPublisher) publisher.value = userPublisher;
          else {
            publisher.value = OV.value.initPublisher(undefined, {
              videoSource: preferredVideoData.value.camera.deviceId,
              audioSource: preferredVideoData.value.microphone.deviceId,
              publishVideo: true,
              publishAudio: false,
              insertMode: 'APPEND',
              mirror: true,
            });
          }
          session.value.publish(publisher.value);
        })
        .catch((error) => console.log('There was an error connecting to the session:', error.code, error.message));
    });
  };

  return {
    OV,
    session,
    publisher,
    subscribers,
    sessionId,
    userId,
    createSession,
    joinSession,
  };
};

export default useOpenvidu;
