import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
  StatusBar,
} from 'react-native';
import GlobalContext from '../context/Context';
import {MaterialCommunityIcons} from 'react-native-vector-icons/MaterialCommunityIcons';
import {pickImage, askForPermission, uploadImage} from '../utilities/utils';
import firebaseSetup from '../db/firebase';
import {updateProfile} from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

export default function Profile() {
  const {auth, firestore} = firebaseSetup();
  const [displayName, setDisplayName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const navigation = useNavigation();
  // useEffect(() => {
  //   (async () => {
  //     const status = await askForPermission();
  //     setPermissionStatus(status);
  //   })();
  // }, []);

  const {
    theme: {colors},
  } = useContext(GlobalContext);

  async function handlePress() {
    const user = auth().currentUser;
    let photoURL;
    if (selectedImage) {
      const {url} = await uploadImage(
        selectedImage,
        `images/${user.uid}`,
        'profilePicture',
      );
      photoURL = url;
    }
    const userData = {
      displayName: displayName,
      phoneNumber: user.phoneNumber,
    };
    if (photoURL) {
      userData.photoURL = photoURL;
    }

    await Promise.all([
      updateProfile(user, userData),
      setDoc(doc(db, 'users', user.uid), {...userData, uid: user.uid}),
    ]);
    navigation.navigate('home');
  }

  async function handleProfilePicture() {
    const result = await pickImage();
    if (!result.cancelled) {
      setSelectedImage(result.uri);
    }
  }

  // if (!permissionStatus) {
  //   return <Text>Loading</Text>;
  // }
  // if (permissionStatus !== 'granted') {
  //   return <Text>You need to allow this permission</Text>;
  // }
  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          paddingTop: StatusBar.currentHeight + 20,
          padding: 20,
        }}>
        <Text style={{fontSize: 22, color: colors.foreground}}>
          Profile Info
        </Text>
        <Text style={{fontSize: 14, color: colors.text, marginTop: 20}}>
          Please provide your name and an optional profile photo
        </Text>
        <TouchableOpacity
          onPress={handleProfilePicture}
          style={{
            marginTop: 30,
            borderRadius: 120,
            width: 120,
            height: 120,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {!selectedImage ? (
            <MaterialCommunityIcons
              name="camera-plus"
              color={colors.iconGray}
              size={45}
            />
          ) : (
            <Image
              source={{uri: selectedImage}}
              style={{width: '100%', height: '100%', borderRadius: 120}}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Type your name"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            borderBottomColor: colors.primary,
            marginTop: 40,
            borderBottomWidth: 2,
            width: '100%',
          }}
        />
        <View style={{marginTop: 'auto', width: 80}}>
          <Button
            title="Next"
            color={colors.secondary}
            onPress={handlePress}
            disabled={!displayName}
          />
        </View>
      </View>
    </React.Fragment>
  );
}
