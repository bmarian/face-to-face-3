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
    session.value.disconnect();
    return router.push('/');
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
          publisher.value.replaceTrack(webcamTrack).then(() => {
            session.value.signal({
              data: '',
              type: 'event',
            });
          });
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

          publisher.value.replaceTrack(screenShareTrack).then(() => {
            session.value.signal({
              data: publisher.stream.streamId,
              type: 'event',
            });
          });
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
