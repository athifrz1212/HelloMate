import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Context from '../context/Context';
import firebaseSetup from '../db/firebase';
import {useNavigation} from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';

export default function SignIn() {
  const {auth} = firebaseSetup();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showOTPMessage, setShowOTPMessage] = useState(false);
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  // // If null, no SMS has been sent
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const phoneInput = useRef(null);

  const {
    theme: {colors},
  } = useContext(Context);

  // Handle the button press
  async function requestOTP() {
    if (valid) {
      setIsLoading(true);
      setShowMessage(false);
      const confirm = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirmation(confirm);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setShowMessage(true);
    }
  }

  async function signIn() {
    try {
      setIsLoading(true);
      await confirmation
        .confirm(code)
        .then(() => {
          setShowOTPMessage(false);
          navigation.navigate('profile');
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setShowOTPMessage(true);
        });
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: '#123456',
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <ActivityIndicator
          size={100}
          accessibilityHint="Please wait..."
          color={'#aef352'}
        />
      </View>
    );
  }

  if (!confirmation) {
    return (
      <View
        style={{
          backgroundColor: '#123456',
          height: '100%',
        }}>
        <View
          style={{
            backgroundColor: '#123456',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 50,
          }}>
          <Image
            source={require('../../assets/helloMate_logo.png')}
            style={{width: 200, height: 90, justifyContent: 'space-around'}}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 40,
          }}>
          {showMessage && !valid ? (
            <View style={{paddingBottom: 10}}>
              <Text style={{color: 'red', textAlign: 'center'}}>
                Please enter valid phone number
              </Text>
            </View>
          ) : (
            ''
          )}
          <PhoneInput
            ref={phoneInput}
            defaultValue={phoneNumber}
            defaultCode="LK"
            layout="first"
            onChangeText={text => {
              setValue(text);
            }}
            onChangeFormattedText={text => {
              setPhoneNumber(text);
            }}
            withDarkTheme
            withShadow
            autoFocus
          />
          <View style={{marginTop: 20}}>
            <Button
              style={styles.button}
              title="Sign Up"
              disabled={!phoneNumber}
              onPress={() => {
                const checkValid = phoneInput.current?.isValidNumber(value);
                setValid(checkValid ? checkValid : false);
                requestOTP();
              }}
            />
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {showOTPMessage ? (
        <View style={{paddingBottom: 10}}>
          <Text style={{color: 'red', textAlign: 'center'}}>
            Please enter valid OTP code
          </Text>
        </View>
      ) : (
        ''
      )}
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
    backgroundColor: '#123456',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    backgroundColor: '#F8F9F9',
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#123456',
    padding: 12,
  },
});
