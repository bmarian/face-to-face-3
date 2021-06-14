import {
  ref, watch, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { helpers } from 'boot/helpers';
import { useQuasar } from 'quasar';

const useUserStream = ({ OV, createSession, joinSession }, finishedSettingUpUserVideo, showPageOverlay) => {
  const store = useStore();
  const $q = useQuasar();

  const userMediaStream = ref(undefined);

  const availableMicrophones = ref([]);
  const availableCameras = ref([]);

  const selectedMicrophone = ref(undefined);
  const selectedCamera = ref(undefined);

  const getUserDevices = () => new Promise((resolve, reject) => {
    OV.value.getDevices()
      .then((devices) => {
        const separatedDevices = devices.reduce((sd, device) => {
          if (!sd[device.kind]) return { ...sd, [device.kind]: [device] };
          return { ...sd, [device.kind]: [...sd[device.kind], device] };
        }, {});
        resolve(separatedDevices);
      })
      .catch((error) => reject(error));
  });

  const initializeUserMedia = (constraints = { videoSource: undefined, audioSource: undefined }) => new Promise((resolve, reject) => {
    $q.loading.show();
    OV.value.getUserMedia(constraints)
      .then((mediaStream) => {
        userMediaStream.value = mediaStream;
        $q.loading.hide();
        resolve(mediaStream);
      })
      .catch((error) => reject(error));
  });

  const setUserMedia = (setDevices = false) => {
    initializeUserMedia()
      .then(() => getUserDevices()
        .then((devices) => {
          if (!setDevices) return;
          availableMicrophones.value = devices?.audioinput || [];
          availableCameras.value = devices?.videoinput || [];

          selectedMicrophone.value = availableMicrophones.value?.[0];
          selectedCamera.value = availableCameras.value?.[0];
        })
        .catch((error) => console.warn(error)))
      .catch((error) => console.warn(error));
  };

  const replaceUserMediaStream = (reinitialize = true) => {
    userMediaStream.value.getTracks().forEach((track) => track.stop());
    const constraints = {
      videoSource: selectedCamera.value.deviceId || undefined,
      audioSource: selectedMicrophone.value.deviceId || undefined,
    };

    if (!reinitialize) return;
    initializeUserMedia(constraints);
  };

  const finishSettingUpUserVideo = () => {
    finishedSettingUpUserVideo.value = true;
    showPageOverlay.value = false;

    replaceUserMediaStream(false);
    helpers.delayedAction(() => { joinSession(); });
  };

  watch(selectedMicrophone, (newMicrophone, oldMicrophone) => {
    store.dispatch('application/setUserMicrophone', newMicrophone).then(() => {
      if (!oldMicrophone) return;

      console.log('Changed microphone');
      replaceUserMediaStream();
    });
  });

  watch(selectedCamera, (newCamera, oldCamera) => {
    store.dispatch('application/setUserCamera', newCamera).then(() => {
      if (!oldCamera) return;

      console.log('Changed camera');
      replaceUserMediaStream();
    });
  });

  onMounted(() => {
    showPageOverlay.value = true;

    createSession();
    setUserMedia(true);
  });

  return {
    userMediaStream,
    availableMicrophones,
    availableCameras,
    selectedMicrophone,
    selectedCamera,
    finishSettingUpUserVideo,
  };
};

export default useUserStream;
