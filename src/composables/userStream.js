import {
  ref, watch, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const useUserStream = ({ OV, createSession, joinSession }, finishedSettingUpUserVideo, showPageOverlay) => {
  const store = useStore();

  const userPublisher = ref(undefined);

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

  const initializeUserMedia = () => new Promise((resolve, reject) => {
    try {
      userPublisher.value = OV.value.initPublisher(undefined, {
        publishAudio: true,
        publishVideo: true,
        insertMode: 'APPEND',
        mirror: true,
      });

      resolve();
    } catch (error) { reject(error); }
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

  const finishSettingUpUserVideo = () => {
    finishedSettingUpUserVideo.value = true;
    showPageOverlay.value = false;

    joinSession(userPublisher.value);
  };

  watch(selectedMicrophone, (newMicrophone, oldMicrophone) => {
    store.dispatch('application/setUserMicrophone', newMicrophone).then(() => {
      if (!oldMicrophone) return;
      OV.value.getUserMedia({
        audioSource: newMicrophone.deviceId || undefined,
      }).then((newMediaStream) => {
        const audioTrack = newMediaStream.getAudioTracks()?.[0];
        if (!audioTrack) return;

        userPublisher.value.replaceTrack(audioTrack)
          .then(() => {
            // newMediaStream.getTracks().forEach((track) => track.stop());
            // newMediaStream = undefined;
            console.log(userPublisher.value.videos);
            console.log('Audio track changed');
          })
          .catch((error) => console.warn(error));
      });
    });
  });

  watch(selectedCamera, (newCamera, oldCamera) => {
    store.dispatch('application/setUserCamera', newCamera).then(() => {
      if (!oldCamera) return;

      OV.value.initPublisher(userPublisher.value.videoReference, {
        videoSource: newCamera.deviceId,
        audioSource: selectedMicrophone.value.deviceId,
        publishAudio: true,
        publishVideo: true,
        insertMode: 'APPEND',
        mirror: true,
      });

      // OV.value.getUserMedia({
      //   videoSource: newCamera.deviceId || undefined,
      // }).then((newMediaStream) => {
      //   const videoTrack = newMediaStream.getVideoTracks()?.[0];
      //   if (!videoTrack) return;
      //
      //   userPublisher.value.replaceTrack(videoTrack)
      //     .then(() => {
      //       // newMediaStream.getTracks().forEach((track) => track.stop());
      //       newMediaStream = undefined;
      //       console.log(userPublisher.value.videos);
      //       console.log('Video track changed');
      //     })
      //     .catch((error) => console.warn(error));
      // });
    });
  });

  onMounted(() => {
    showPageOverlay.value = true;

    createSession();
    setUserMedia(true);
  });

  return {
    userPublisher,
    availableMicrophones,
    availableCameras,
    selectedMicrophone,
    selectedCamera,
    finishSettingUpUserVideo,
  };
};

export default useUserStream;
