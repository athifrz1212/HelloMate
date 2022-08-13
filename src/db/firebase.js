import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDpgv4T1TGgoft39V3Rekry3H_CDSLIkxc',
  authDomain: 'hellomate-v1.firebaseapp.com',
  projectId: 'hellomate-v1',
  storageBucket: 'hellomate-v1.appspot.com',
  messagingSenderId: '226016294609',
  appId: '1:226016294609:web:7784b8879cbfeabc05b7f0',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default () => {
  return {firebase, auth, storage, firestore};
};
