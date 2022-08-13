import React, {useState, useEffect, useContext} from 'react';
import {SafeAreaView, StyleSheet, ImageBackground} from 'react-native';
import SignIn from './src/screens/SignIn';
import Chats from './src/screens/Chats';
import GlobalContext from './src/context/Context';
import ContextWrapper from './src/context/ContextWrapper';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firebaseSetup from './src/db/firebase';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const App = () => {
  const {auth} = firebaseSetup();
  const [currUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    theme: {colors},
  } = useContext(GlobalContext);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setLoading(false);
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView>
      <Main />
    </SafeAreaView>
  );
};

const Main = () => {
  return (
    <SafeAreaView>
      <ImageBackground
        source={require('./assets/splash_screen_01.jpeg')}
        style={{width: '100%', height: '100%'}}>
        <SignIn />
        {/* <Chats /> */}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default App;
