import {
  ref, watch, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { helpers } from 'boot/helpers';
import { useQuasar, date } from 'quasar';

const useChat = (session, chatState) => {
  const store = useStore();
  const $q = useQuasar();
  const messageArea = ref(undefined);
  const chatMessage = ref('');

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

  const clearEndingWhiteCharacters = () => {
    chatMessage.value = chatMessage.value.replace(/^\s+|\s+$/g, '');
    chatMessage.value.trim();
  };

  const handleKeyDown = (event) => {
    if (!event.shiftKey && event.key === 'Enter') {
      clearEndingWhiteCharacters();
      sendMessage(chatMessage.value);
    }
  };

  const clearChatBox = (event) => {
    if (!event.shiftKey && event.key === 'Enter') chatMessage.value = '';
  };

  watch([messages, chatState], () => {
    helpers.delayedAction(() => {
      messageArea.value.scrollTop = messageArea.value.scrollHeight;
    }, 500);
  });

  return {
    messages,
    sendMessage,
    timeElapsed,
    isOwnerOfMessage,
    roomId,
    messageArea,
    chatMessage,
    handleKeyDown,
    clearChatBox,
  };
};

export default useChat;
