<template>
  <q-page class="ftf-content__page">
    <div class="ftf-content__page-content">
      <q-card class="ftf-card" flat bordered>
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
            <q-input v-model="roomId" :model-value="roomId" :label="t('roomId')" :disable="!userName"/>
          </q-card-section>

        <q-separator />

        <q-card-actions class="ftf-card-actions">
          <q-btn
            v-if="canJoinRoom"
            flat
            color="primary"
            @click="joinRoom">
            {{t('joinRoom')}}
          </q-btn>
          <q-btn
            v-else
            :disable="!userName"
            flat
            color="primary"
            @click="createRoom">
            {{t('createRoom')}}
          </q-btn>

          <q-btn-dropdown flat color="primary">
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

  const textColor = computed(() => helpers.textColor(userColor.value));
  const userInitials = computed(() => helpers.userInitials(userName.value));

  const canJoinRoom = computed(() => userName.value && roomId.value);

  watch([userName, roomId], ([newUserName, newRoomId]) => {
    store.dispatch('application/setUserName', newUserName);
    store.dispatch('application/setRoomId', newRoomId);
  });

  const joinRoom = () => { console.log({ userData, roomId }); };
  const createRoom = () => { console.log({ userData, roomId }); };

  return {
    userColor,
    textColor,
    userName,
    roomId,
    userInitials,
    canJoinRoom,
    joinRoom,
    createRoom,
  };
};

export default defineComponent({
  name: 'FtfCreateRoomPage',
  setup() {
    return { ...useLanguage(), ...useUserData() };
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
</style>
