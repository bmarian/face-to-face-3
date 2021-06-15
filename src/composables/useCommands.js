import {
  defineComponent, ref, watch, computed, onMounted,
} from 'vue';
import { openVidu } from 'boot/openvidu';
import { api } from 'boot/axios';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const useCommands = (session, publisher, OV) => {
  const store = useStore();
  const router = useRouter();

  const disconnect = () => {
    const goHome = () => {
      session.value.disconnect();
      return router.push('/');
    };

    session.value.signal({ data: '', type: 'event' })
      .then(goHome)
      .catch(goHome);
  };

  const microphoneState = ref(false);
  const toggleMicrophone = () => {
    microphoneState.value = !microphoneState.value;
    publisher.value.publishAudio(microphoneState.value);
  };

  const cameraState = ref(true);
  const toggleCamera = () => {
    cameraState.value = !cameraState.value;
    publisher.value.publishVideo(cameraState.value);
  };

  const chatState = ref(false);
  const toggleChat = () => { chatState.value = !chatState.value; };

  const screenShareState = ref(false);
  const toggleScreenShare = () => {
    screenShareState.value = !screenShareState.value;

    const replaceWithCamera = () => {
      OV.value.getUserMedia({ videoSource: store.getters['application/preferredVideoData'].camera.deviceId || undefined })
        .then((userMediaStream) => {
          const webcamTrack = userMediaStream.getVideoTracks()[0];

          session.value.signal({ data: '', type: 'event' });
          return publisher.value.replaceTrack(webcamTrack);
        })
        .catch((error) => console.warn(error));
    };

    if (screenShareState.value) {
      navigator?.mediaDevices?.getDisplayMedia()
        .then((screenShareMediaStream) => {
          const screenShareTrack = screenShareMediaStream.getVideoTracks()[0];
          screenShareTrack.addEventListener('ended', () => {
            replaceWithCamera();
            screenShareState.value = false;
          });

          session.value.signal({ data: publisher.value?.stream?.streamId || '', type: 'event' });
          return publisher.value.replaceTrack(screenShareTrack);
        })
        .catch((error) => console.warn(error));
    } else {
      replaceWithCamera();
    }
  };

  return {
    disconnect,
    microphoneState,
    toggleMicrophone,
    cameraState,
    toggleCamera,
    chatState,
    toggleChat,
    screenShareState,
    toggleScreenShare,
  };
};

export default useCommands;
