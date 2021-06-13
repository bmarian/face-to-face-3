import { boot } from 'quasar/wrappers';
import { OpenVidu } from 'openvidu-browser';

const production = true;

const openVidu = {
  OpenVidu,
  // eslint-disable-next-line no-restricted-globals
  ip: production ? 'https://openvidu.the-mistakes.com' : `https://${location.hostname}:4443`,
  user: 'OPENVIDUAPP',
  secret: '123Diana',
};

export default boot(({ app }) => {
  app.config.globalProperties.$OpenVidu = OpenVidu;
});

export { openVidu };
