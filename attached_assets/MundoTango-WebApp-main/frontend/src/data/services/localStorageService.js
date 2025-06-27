import localStorageAvailable from "@/utils/localStorageAvailable";

/**
 * The function stores a token value in the browser's local storage.
 * @param value - The value parameter is the token that needs to be stored in the browser's local
 * storage. The function takes this value as an argument and sets it in the local storage with the key
 * 'token'.
 */
const storageAvailable = localStorageAvailable();
const storeToken = (value) => {
  localStorage.setItem("token", value);
};

const storeUser = (value) => {
  localStorage.setItem("storeUser", value);
};

const getstoreUser = (value) => {
  const userdata = localStorage.getItem("storeUser");
  return userdata;
};

/**
 * The function retrieves a token from local storage.
 * @returns The `getToken` function is returning the value of the `token` variable, which is the value
 * stored in the `localStorage` under the key `'token'`.
 */
const getToken = () => {
  let token = localStorage.getItem("token");
  return token;
};

/**
 * The function removes a specified item from the browser's local storage.
 * @param value - The parameter "value" is a string representing the name of the token to be removed
 * from the browser's local storage.
 */
const removeToken = () => {
  localStorage.removeItem("token");
};

const storeCSRF_Token = (value) => {
  localStorage.setItem("csrf_token", value);
};

const getCSRF_Token = () => {
  let token = localStorage.getItem("csrf_token");
  return token;
};

const removeCSRF_Token = () => {
  localStorage.removeItem("csrf_token");
};

const storeTokenExpirationInMinutes = (value) => {
  const expirationMilliseconds = value * 60 * 1000; // Convert minutes to milliseconds
  const expirationTime = new Date().getTime() + expirationMilliseconds;
  localStorage.setItem("tokenExpiration", expirationTime);
};

const getTokenExpirationInMinutes = () => {
  let tokenExpirationTime =
    parseInt(localStorage.getItem("tokenExpiration")) || 0;
  return tokenExpirationTime;
};

const removeTokenExpirationInMinutes = () => {
  localStorage.removeItem("tokenExpiration");
};

const storeExpiry = (value) => {
  localStorage.setItem("expiry_date", value);
};

const getExpiry = () => {
  let token = localStorage.getItem("expiry_date");
  return token;
};

const removeExpiry = () => {
  localStorage.removeItem("expiry_date");
};

const setAuthToken = (value) => {
  let token = localStorage.setItem("authToken", value);
  return token;
};

const getAuthToken = () => {
  let token =
    typeof window != undefined ? localStorage.getItem("authToken") : null;
  return token;
};

const removeAuthToken = () => {
  let token = localStorage.removeItem("authToken");
  return token;
};

export {
  storeToken,
  getToken,
  removeToken,
  storeCSRF_Token,
  getCSRF_Token,
  removeCSRF_Token,
  storeTokenExpirationInMinutes,
  getTokenExpirationInMinutes,
  removeTokenExpirationInMinutes,
  storeExpiry,
  getExpiry,
  removeExpiry,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  storeUser,
  getstoreUser
};
