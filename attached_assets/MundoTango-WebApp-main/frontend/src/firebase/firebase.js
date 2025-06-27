import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { app } from "./init";

const auth = getAuth(app);

const GoogleProvider = new GoogleAuthProvider();
const FBProvider = new FacebookAuthProvider();

/**
 * GOOGLE SIGN IN
 */
export const GoogleAuth = async () => {
  try {
    const userAuth = await signInWithPopup(auth, GoogleProvider);
    console.log(userAuth);
    return userAuth;
  } catch (error) {
    console.log(error);
  }
  // .then((result) => {
  //   // This gives you a Google Access Token. You can use it to access the Google API.
  //   const credential = GoogleAuthProvider.credentialFromResult(result);
  //   const token = credential.accessToken;
  //   // The signed-in user info.
  //   const user = result.user;
  //   // IdP data available using getAdditionalUserInfo(result)
  //   // ...
  // })
  // .catch((error) => {
  //   // Handle Errors here.
  //   const errorCode = error.code;
  //   const errorMessage = error.message;
  //   // The email of the user's account used.
  //   const email = error.customData.email;
  //   // The AuthCredential type that was used.
  //   const credential = GoogleAuthProvider.credentialFromError(error);
  //   // ...
  // });
};

/**
 * FACEBOOK SIGN IN
 */
export const FaceBookAuth = async () => {
  try {
    const userAuth = await signInWithPopup(auth, FBProvider);
    console.log(userAuth);
    return userAuth;
  } catch (error) {
    console.log(error);
  }

  // .then((result) => {
  //   // The signed-in user info.
  //   const user = result.user;

  //   // This gives you a Facebook Access Token. You can use it to access the Facebook API.
  //   const credential = FacebookAuthProvider.credentialFromResult(result);
  //   const accessToken = credential.accessToken;

  //   // IdP data available using getAdditionalUserInfo(result)
  //   // ...
  // })
  // .catch((error) => {
  //   // Handle Errors here.
  //   const errorCode = error.code;
  //   const errorMessage = error.message;
  //   // The email of the user's account used.
  //   const email = error.customData.email;
  //   // The AuthCredential type that was used.
  //   const credential = FacebookAuthProvider.credentialFromError(error);

  //   // ...
  // });
};
