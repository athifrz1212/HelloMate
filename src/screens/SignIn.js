import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, View, Image, TextInput, Button, Text} from 'react-native';
import Context from '../context/Context';
import firebaseSetup from '../db/firebase';
import {useNavigation} from '@react-navigation/native';

export default function SignIn() {
  const {auth} = firebaseSetup();
  const [countryCode, setCountryCode] = useState('+94');
  const [phoneNumber, setPhoneNumber] = useState('762731888');
  const [otpVisible, setOTPVisible] = useState(false);
  const navigation = useNavigation();

  // // If null, no SMS has been sent
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');

  const {
    theme: {colors},
  } = useContext(Context);

  // Handle the button press
  async function requestOTP() {
    const number = countryCode + phoneNumber;
    const confirm = await auth().signInWithPhoneNumber(number);
    console.log('>>>>>>>> OTP sent');
    setOTPVisible(true);
    setConfirmation(confirm);
  }

  async function signIn() {
    try {
      await confirmation.confirm(code);
      console.log('Signed In');
      navigation.navigate('home');
    } catch (error) {
      console.log(error);
    }
  }

  if (!confirmation) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/helloMate_logo.png')}
          style={{width: 200, height: 90}}
          resizeMode="cover"
        />
        <View style={{marginTop: 20}}>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <View style={{marginTop: 20}}>
            <Button
              style={styles.button}
              title="Sign Up"
              disabled={!phoneNumber}
              onPress={() => requestOTP()}
            />
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text value={countryCode} />
      <TextInput
        style={styles.input}
        placeholder="Enter OTP code"
        value={code}
        onChangeText={setCode}
      />
      <Button
        style={styles.button}
        title="Confirm OTP"
        disabled={!code}
        onPress={() => signIn()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '9ab8ba',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  otpContainer: {
    alignSelf: 'center',
    paddingBottom: 24,
  },
  input: {
    backgroundColor: '#ddf7f8',
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0ef6cc',
    borderRadius: 8,
    padding: 12,
  },
});
