const SET_USER_COLOR = (state, userColor) => { state.userData.color = userColor; return userColor; };
const SET_USER_LANGUAGE = (state, userLanguage) => { state.userData.language = userLanguage; return userLanguage; };
const SET_USER_NAME = (state, userName) => { state.userData.name = userName; return userName; };
const SET_ROOM_ID = (state, roomId) => { state.roomId = roomId; return roomId; };
const SET_USER_MICROPHONE = (state, microphone) => { state.preferredVideoData.microphone = microphone; return microphone; };
const SET_USER_CAMERA = (state, camera) => { state.preferredVideoData.camera = camera; return camera; };

export {
  SET_USER_COLOR,
  SET_USER_LANGUAGE,
  SET_USER_NAME,
  SET_ROOM_ID,
  SET_USER_MICROPHONE,
  SET_USER_CAMERA,
};
