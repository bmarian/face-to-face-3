import { helpers } from 'boot/helpers';

export default () => ({
  userData: {
    name: helpers.humanReadableRandomString(2, 'title', {
      partsOfSpeech: ['adjective', 'noun'],
      categories: {
        adjective: ['color', 'appearance'],
        noun: ['animals'],
      },
    }),
    color: `#${Math.round((Math.random() * 0xFFFFFF)).toString(16).padStart(6, '0')}`,
    language: 'en-US',
  },
  preferredVideoData: {
    camera: null,
    microphone: null,
  },
  roomId: null,
  messages: [],
});
