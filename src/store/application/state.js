export default () => ({
  userData: {
    name: '',
    color: `#${Math.round((Math.random() * 0xFFFFFF)).toString(16).padStart(6, '0')}`,
    language: 'en-US',
  },
  preferredVideoData: {
    camera: null,
    microphone: null,
  },
  roomId: null,
});
