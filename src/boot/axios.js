import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { openVidu } from 'boot/openvidu';

const api = axios.create({
  baseURL: openVidu.ip,
  headers: {
    post: {
      'Content-Type': 'application/json',
    },
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
