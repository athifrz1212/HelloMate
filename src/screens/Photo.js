import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View, LogBox} from 'react-native';
import {usePickImage, useCaptureImage} from '../utilities/utils';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
export default function Photo() {
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const result = await usePickImage();

      if (result.didCancel) {
        console.log('User cancelled image picker');
        setTimeout(() => navigation.navigate('chats'), 90);
      } else if (result.assets) {
        navigation.navigate('contacts', {image: result.assets[0].uri});
      }
    });

    return () => unsubscribe();
  }, [navigation]);
  return <View />;
}
