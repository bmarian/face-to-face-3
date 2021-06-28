import {
  ref, watch, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { helpers } from 'boot/helpers';
import { useQuasar } from 'quasar';

const useChat = (session) => {
  const store = useStore();
  const $q = useQuasar();

  const messages = computed(() => store.getters['application/messages']);
  const userData = computed(() => store.getters['application/userData']);

  const sendMessage = (message) => {
    session.value.signal({ data: message, type: 'chat' })
      .then(() => console.log('Message sent'))
      .catch((error) => console.warn(error));
  };

  /*  onMounted(() => {
    setInterval(() => {
      sendMessage(`Hello my name is ${userData.value.name}`);
    }, 1000);
  }); */

  return {
    messages,
    sendMessage,
  };
};

export default useChat;
