import { boot } from 'quasar/wrappers';
import { colors } from 'quasar';
import { generateSlug } from 'random-word-slugs';

const helpers = {
  textColor(backgroundColor) {
    return colors.brightness(backgroundColor) < 128 ? '#f8f8f2' : '#232323';
  },
  userInitials(userName) {
    if (!userName) return '';

    const nameSplit = userName.split(' ');
    if (nameSplit.length < 2) return `${userName.charAt(0).toUpperCase()}${userName.charAt(1).toLowerCase()}`;
    return nameSplit.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('');
  },
  humanReadableRandomString(length = 5, format = 'kebab', extraOptions = {}) {
    return generateSlug(length, { format, ...extraOptions });
  },
  delayedAction(action, delayAmount = 1000) {
    setTimeout(action, delayAmount);
  },
};

export default boot(({ app }) => {
  app.config.globalProperties.$helpers = helpers;
});

export { helpers };
