import {useState} from 'react';
import {PermissionsAndroid} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {nanoid} from 'nanoid';
import firebaseSetup from '../db/firebase';

const {storage} = firebaseSetup();

export async function pickImage() {
  const [image, setImage] = useState();
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ]);

  if (
    granted['android.permission.CAMERA'] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
      PermissionsAndroid.RESULTS.GRANTED
  ) {
    launchImageLibrary({
      saveToPhotos: true,
      mediaType: 'image',
      cameraType: 'back',
    })
      .then(response => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.assets[0]) {
          const source = {uri: response.assets[0].uri};
          console.log('response', JSON.stringify(response));
          setImage(source.uri);
        }
      })
      .catch(error => {
        console.log('>>>>>>>>>> Error :' + error);
      });
  }

  return image;
}

export async function captureImage() {
  const [imageUri, setImageUri] = useState();

  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ]);

  if (
    granted['android.permission.CAMERA'] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
      PermissionsAndroid.RESULTS.GRANTED
  ) {
    launchCamera({
      saveToPhotos: true,
      mediaType: 'image',
      cameraType: 'back',
    })
      .then(response => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.assets[0]) {
          const source = {uri: response.assets[0].uri};
          console.log('response', JSON.stringify(response));
          setImageUri(source.uri);
        }
      })
      .catch(error => {
        console.log('>>>>>>>>>> Error :' + error);
      });
  }

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
  const metadata = {contentType: 'image/jpeg'};
  const snapshot = await imageRef.put(blob, metadata);

  blob.close();

  const url = await snapshot.ref.getDownloadURL();

  return {url, fileName};
}

const palette = {
  deepTeal: '#064439',
  tiber: '#274546',
  tealGreen: '#128c7e',
  tealGreenDark: '#274546',
  green: '#25d366',
  lime: '#dcf8c6',
  skyblue: '#34b7f1',
  smokeWhite: '#ABCFC2',
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
