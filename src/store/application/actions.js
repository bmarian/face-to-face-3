const setUserColor = ({ commit }, userColor) => commit('SET_USER_COLOR', userColor);
const setUserLanguage = ({ commit }, userLanguage) => commit('SET_USER_LANGUAGE', userLanguage);
const setUserName = ({ commit }, userName) => commit('SET_USER_NAME', userName);
const setRoomId = ({ commit }, roomId) => commit('SET_ROOM_ID', roomId);

export {
  setUserColor,
  setUserLanguage,
  setUserName,
  setRoomId,
};
