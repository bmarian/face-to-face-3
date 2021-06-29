import {
  ref, watch, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { helpers } from 'boot/helpers';
import { useQuasar, date } from 'quasar';

const useChat = (session) => {
  const store = useStore();
  const $q = useQuasar();

  const messages = computed(() => store.getters['application/messages']);
  const userData = computed(() => store.getters['application/userData']);
  const roomId = computed(() => store.getters['application/roomId']);

  const sendMessage = (message) => {
    session.value.signal({
      data: message,
      type: 'chat',
    })
      .then(() => console.log('Message sent'))
      .catch((error) => console.warn(error));
  };

  onMounted(() => {
    setInterval(() => {
      sendMessage(`Hello my name is ${userData.value.name}`);
    }, 10000);
  });

  const timeElapsed = (timeStamp) => {
    const minutes = date.getDateDiff(Date.now(), timeStamp, 'minutes');
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const hoursString = `${hours === 1 ? 'hour' : 'hours'} ago`;
      return `${hours} ${hoursString}`;
    }
    const minString = `${minutes === 1 ? 'minute' : 'minutes'} ago`;
    return minutes === 0 ? 'less then a minute ago' : `${minutes} ${minString}`;
  };

  const isOwnerOfMessage = (sender) => sender === userData.value.name;

  return {
    messages,
    sendMessage,
    timeElapsed,
    isOwnerOfMessage,
    roomId,
  };
};

export default useChat;
