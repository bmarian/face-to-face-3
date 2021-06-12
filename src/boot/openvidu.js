import { boot } from 'quasar/wrappers';
import { OpenVidu } from 'openvidu-browser';

export default boot(({ app }) => {
  app.config.globalProperties.$OpenVidu = OpenVidu;
});

export { OpenVidu };
