const SET_USER_COLOR = (state, userColor) => { state.userData.color = userColor; return userColor; };
const SET_USER_LANGUAGE = (state, userLanguage) => { state.userData.language = userLanguage; return userLanguage; };
const SET_USER_NAME = (state, userName) => { state.userData.name = userName; return userName; };
const SET_ROOM_ID = (state, roomId) => { state.roomId = roomId; return roomId; };

export {
  SET_USER_COLOR,
  SET_USER_LANGUAGE,
  SET_USER_NAME,
  SET_ROOM_ID,
};
