// userReducer.js

import userTypes from "../types/userTypes";

const initialState = {
  user: {
    displayName:"",
    email:"",
    password:""
  },
  isAuthenticated: false,
  error: null // new field to track authentication errors
};

const userReducer = (state, action) => {
  switch (action.type) {
    case userTypes.SET_USER:
      return { ...state, user: action.payload };
    case userTypes.SET_NAME:
      return { ...state, user: { ...state.user, displayName: action.payload } };
    case userTypes.SET_EMAIL:
      return { ...state, user: { ...state.user, email: action.payload } };
    case userTypes.SET_PASSWORD:
      return { ...state, userDetails: { ...state.user, password: action.payload } };
    case userTypes.LOGIN:
      return { ...state, isAuthenticated: true, error: null };
    case userTypes.LOGIN_ERROR:
      return { ...state, isAuthenticated: false, error: action.payload };
    case userTypes.REGISTER:
      return { ...state, isAuthenticated: true, error: null };
    case userTypes.REGISTER_ERROR:
      return { ...state, isAuthenticated: false, error: action.payload.message };
    case userTypes.LOGOUT:
      return { ...state, isAuthenticated: false, error: null };
    default:
      return state;
  }
};

export { initialState, userReducer };
