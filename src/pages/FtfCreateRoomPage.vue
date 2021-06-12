<template>
  <q-page class="ftf-content__page">
    <div class="ftf-content__page-content flex">
      <q-card class="ftf-card q-ma-sm" flat bordered>
        <q-card-section class="col-5 flex flex-center">
          <q-avatar class="ftf-avatar cursor-pointer" rounded :style="{background: userColor, color: textColor}" :offset="[-300, -100]">
            <p class="text-h3 ftf-avatar__content flex flex-center">{{ userInitials }}</p>
            <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
              <div><q-color no-header no-footer v-model="userColor" :model-value="userColor"/></div>
            </q-popup-proxy>
          </q-avatar>
        </q-card-section>

        <q-card-section class="q-pt-xs">
            <q-input v-model="userName" :model-value="userName" :label="t('name')" />
            <q-input v-model="roomId" :model-value="roomId" :label="t('roomId')" :disable="!userName || finishSettingBasicInfo"/>
          </q-card-section>

        <q-separator />

        <q-card-actions class="ftf-card-actions">
          <q-btn
            v-if="canJoinRoom"
            :disable="finishSettingBasicInfo"
            flat
            color="primary"
            @click="joinRoom">
            {{t('joinRoom')}}
          </q-btn>
          <q-btn
            v-else
            :disable="!userName || finishSettingBasicInfo"
            flat
            color="primary"
            @click="createRoom">
            {{t('createRoom')}}
          </q-btn>

          <q-btn-dropdown flat color="primary" :disable="finishSettingBasicInfo">
            <template v-slot:label>
              <q-img width="1.5rem" :src="selectedLanguage.icon"/>
            </template>
            <q-list>
              <q-item
                style="padding-right: 1.8rem"
                v-for="(language, index) in languages" :key="index"
                clickable
                v-close-popup
                @click="selectedLanguage = language">

                <q-item-section>
                  <q-img width="1.5rem" :src="language.icon"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ language.text }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-card-actions>
      </q-card>
      <q-slide-transition>
        <q-card v-if="finishSettingBasicInfo" class="ftf-card q-ma-sm" flat bordered>
          <q-card-section class="col-5 flex flex-center">
            <video class="ftf-user-stream" ref="userVideo" muted autoplay/>
          </q-card-section>

          <q-card-section class="q-pt-xs">
            <q-btn-dropdown
              class="ftf-input-button q-mt-md"
              flat
              color="primary"
              icon="videocam"
              :label="selectedUserCamera?.label || t('camera')">
              <q-list>
                <q-item
                  v-for="(camera, index) in userCameras" :key="index"
                  clickable
                  v-close-popup
                  @click="selectedUserCamera = camera">
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
              :label="selectedUserMicrophone?.label || t('microphone')">
              <q-list>
                <q-item
                  v-for="(microphone, index) in userMicrophones" :key="index"
                  clickable
                  v-close-popup
                  @click="selectedUserMicrophone = microphone">
                  <q-item-label>{{ microphone.label }}</q-item-label>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-card-section>

          <q-separator />

          <q-card-actions class="ftf-card-actions">
            <q-btn
              flat
              color="primary"
              @click="finish">
              {{t('finish')}}
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-slide-transition>
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
import { useRouter } from 'vue-router';

const useLanguage = () => {
  const store = useStore();
  const { t, locale } = useI18n({ useScope: 'global' });

  const userData = store.getters['application/userData'];
  const userLanguage = ref(userData.language);
  const languages = ref([
    {
      icon: 'https://lipis.github.io/flag-icon-css/flags/4x3/ro.svg',
      text: t('romanian'),
      id: 'ro-RO',
    },
    {
      icon: 'https://lipis.github.io/flag-icon-css/flags/4x3/us.svg',
      text: t('english'),
      id: 'en-US',
    },
  ]);
  const selectedLanguage = ref({ ...languages.value[0] });

  watch(selectedLanguage, ({ id }) => {
    store.dispatch('application/setUserLanguage', id)
      .then(() => { locale.value = id; });
  }, { immediate: true, deep: true });

  return {
    t, userLanguage, languages, selectedLanguage,
  };
};

const useUserData = () => {
  const store = useStore();
  const { t } = useI18n({ useScope: 'global' });

  const userData = store.getters['application/userData'];
  const userColor = ref(userData.color);
  const userName = ref(userData.name || t('anonymousUser'));

  const roomId = ref(store.getters['application/roomId']);

  const finishSettingBasicInfo = ref(false);

  const textColor = computed(() => helpers.textColor(userColor.value));
  const userInitials = computed(() => helpers.userInitials(userName.value));

  const canJoinRoom = computed(() => !!(userName.value && roomId.value));

  watch([userName, roomId], ([newUserName, newRoomId]) => {
    store.dispatch('application/setUserName', newUserName);
    store.dispatch('application/setRoomId', newRoomId);
  }, { immediate: true });

  const joinRoom = () => { finishSettingBasicInfo.value = true; };
  const createRoom = () => {
    roomId.value = helpers.humanReadableRandomString();
    finishSettingBasicInfo.value = true;
  };

  return {
    userColor,
    textColor,
    userName,
    roomId,
    finishSettingBasicInfo,
    userInitials,
    canJoinRoom,
    joinRoom,
    createRoom,
  };
};

const useUserStream = (roomId, finishSettingBasicInfo) => {
  const store = useStore();
  const router = useRouter();

  const userVideo = ref(null);
  const userStream = ref(null);

  const userMicrophones = ref([]);
  const userCameras = ref([]);

  const selectedUserMicrophone = ref(null);
  const selectedUserCamera = ref(null);

  const initializeUserVideo = (constraints = { video: true, audio: true }) => new Promise((resolve, reject) => {
    navigator?.mediaDevices?.getUserMedia?.(constraints)
      .then((stream) => {
        userStream.value = stream;
        userVideo.value.srcObject = userStream.value;

        resolve();
      })
      .catch((error) => reject(error));
  });
  const getUserMediaData = () => new Promise((resolve, reject) => {
    navigator?.mediaDevices?.enumerateDevices?.()
      .then((devices) => {
        const separatedDevices = devices.reduce((sd, device) => {
          if (!sd[device.kind]) return { ...sd, [device.kind]: [device] };
          return { ...sd, [device.kind]: [...sd[device.kind], device] };
        }, {});
        resolve(separatedDevices);
      })
      .catch((error) => reject(error));
  });

  watch(finishSettingBasicInfo, (newValue) => {
    if (!newValue) return;
    initializeUserVideo().then(() => {
      getUserMediaData().then((devices) => {
        console.log(devices);

        userMicrophones.value = devices.audioinput;
        userCameras.value = devices.videoinput;

        selectedUserMicrophone.value = devices.audioinput?.[0];
        selectedUserCamera.value = devices.videoinput?.[0];
      }).catch((error) => console.log(error));
    });
  });

  watch(selectedUserMicrophone, (newValue) => {
    store.dispatch('application/setUserMicrophone', newValue);
  });
  watch(selectedUserCamera, (newValue, oldValue) => {
    store.dispatch('application/setUserCamera', newValue);

    if (!oldValue || newValue.deviceId === oldValue.deviceId) return;

    userStream.value.getTracks().forEach((track) => { track.stop(); });
    const constraints = {
      audio: { deviceId: selectedUserMicrophone.value.deviceId ? { exact: selectedUserMicrophone.value.deviceId } : undefined },
      video: { deviceId: selectedUserCamera.value.deviceId ? { exact: selectedUserCamera.value.deviceId } : undefined },
    };
    initializeUserVideo(constraints);
  });

  const finish = () => {
    userStream.value.getTracks().forEach((track) => { track.stop(); });
    router.push(`/room/${roomId.value}`);
  };

  return {
    userVideo,
    userStream,
    userMicrophones,
    selectedUserMicrophone,
    userCameras,
    selectedUserCamera,
    finish,
  };
};

export default defineComponent({
  name: 'FtfCreateRoomPage',
  setup() {
    const language = useLanguage();
    const userData = useUserData();
    const camera = useUserStream(userData.roomId, userData.finishSettingBasicInfo);

    return { ...language, ...userData, ...camera };
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
.ftf-avatar {
  height: 10rem;
  width: 10rem;

  &__content {
    height: 10rem;
    width: 10rem;
  }
}
.ftf-card-actions {
  display: flex;
  justify-content: space-between;
}
.ftf-card {
  min-width: 17rem;
}
.ftf-user-stream {
  width: 10rem;
  height: 10rem;
}
.ftf-input-button {
  width: 15rem;

  & .q-btn__content > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
