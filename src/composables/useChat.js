import {
  ref, watch, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { helpers } from 'boot/helpers';
import { date } from 'quasar';
import { useI18n } from 'vue-i18n';

const useChat = (session, chatState) => {
  const store = useStore();
  const { t } = useI18n({ useScope: 'global' });
  const messageArea = ref(undefined);
  const currentTime = ref(Date.now());
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
    const minutes = date.getDateDiff(currentTime.value, timeStamp, 'minutes');
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const hoursString = `${hours === 1 ? t('hour') : t('hours')} ${t('ago')}`;
      return `${hours} ${hoursString}`;
    }
    const minString = `${minutes === 1 ? t('minute') : t('minutes')} ${t('ago')}`;
    return minutes === 0 ? t('lessThenAMinuteAgo') : `${minutes} ${minString}`;
  };

  const isMessageOwner = (sender) => sender === userData.value.name;

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

  onMounted(() => {
    setInterval(() => {
      currentTime.value = Date.now();
    }, 60000);
  });

  return {
    messages,
    sendMessage,
    timeElapsed,
    isMessageOwner,
    roomId,
    messageArea,
    chatMessage,
    handleKeyDown,
    clearChatBox,
  };
};

export default useChat;
