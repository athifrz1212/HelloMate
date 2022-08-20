import {useState} from 'react';
import {PermissionsAndroid} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {nanoid} from 'nanoid';
// import {ref, uploadBytes, getDownloadURL} from '@react-native-firebase/storage';
import firebaseSetup from '../db/firebase';

const {storage} = firebaseSetup();

export async function pickImage() {
  const [image, setImage] = useState();
  const granted = PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    let result = await launchImageLibrary({
      selectionLimit: 1,
      presentationStyle: 'fullScreen',
    });
    setImage(result.assets[0].uri);
  }

  return image;
}

export async function captureImage() {
  const [imageUri, setImageUri] = useState();
  const granted = PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  let result = await launchCamera({
    saveToPhotos: true,
    mediaType: 'mixed',
    cameraType: 'back' | 'front',
  });
  setImageUri(result.assets[0].uri);
  // return result;
  // }

  return imageUri;
}

export async function uploadImage(uri, path, fName) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const fileName = fName || nanoid();
  const imageRef = storage().ref(`${path}/${fileName}.jpeg`);
  // ref(storage, `${path}/${fileName}.jpeg`);
  const metadata = {contentType: 'image/jpeg'};
  const snapshot = await imageRef.put(blob, metadata);
  // const snapshot = await uploadBytes(imageRef, blob, {
  //   contentType: 'image/jpeg',
  // });

  blob.close();

  const url = await snapshot.ref.getDownloadURL();

  return {url, fileName};
}

const palette = {
  tealGreen: '#128c7e',
  tealGreenDark: '#075e54',
  green: '#25d366',
  lime: '#dcf8c6',
  skyblue: '#34b7f1',
  smokeWhite: '#ece5dd',
  white: 'white',
  gray: '#3C3C3C',
  lightGray: '#757575',
  iconGray: '#717171',
};

export const theme = {
  colors: {
    background: palette.smokeWhite,
    foreground: palette.tealGreenDark,
    primary: palette.tealGreen,
    tertiary: palette.lime,
    secondary: palette.green,
    white: palette.white,
    text: palette.gray,
    secondaryText: palette.lightGray,
    iconGray: palette.iconGray,
  },
};
