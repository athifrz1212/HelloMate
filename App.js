import React, {useState, useEffect, useContext} from 'react';
import {SafeAreaView, StyleSheet, ImageBackground, LogBox} from 'react-native';
import SignIn from './src/screens/SignIn';
import Chats from './src/screens/Chats';
import Chat from './src/screens/Chat';
import Photo from './src/screens/Photo';
import Profile from './src/screens/Profile';
import Contacts from './src/screens/Contacts';
import GlobalContext from './src/context/Context';
import ContextWrapper from './src/context/ContextWrapper';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firebaseSetup from './src/db/firebase';

LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native core and will be removed in a future release.',
]);

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const App = () => {
  const {auth} = firebaseSetup();
  const [currentUser, setCurrentUser] = useState(null);
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
    <NavigationContainer>
      {!currentUser ? (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="signIn" component={SignIn} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.foreground,
              shadowOpacity: 0,
              elevation: 0,
            },
            headerTintColor: colors.white,
          }}>
          {!currentUser.displayName && (
            <Stack.Screen
              name="profile"
              component={Profile}
              options={{headerShown: false}}
            />
          )}
          <Stack.Screen
            name="home"
            options={{title: 'Whatsapp'}}
            component={Home}
          />
          {/* <Stack.Screen
            name="contacts"
            options={{title: 'Select Contacts'}}
            component={Contacts}
          /> */}
          {/* <Stack.Screen
            name="chat"
            component={Chat}
            options={{headerTitle: props => <ChatHeader {...props} />}}
          /> */}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

function Home() {
  const {
    theme: {colors},
  } = useContext(Context);
  return (
    <Tab.Navigator
      screenOptions={({route}) => {
        return {
          tabBarLabel: () => {
            if (route.name === 'photo') {
              return <Ionicons name="camera" size={20} color={colors.white} />;
            } else {
              return (
                <Text style={{color: colors.white}}>
                  {route.name.toLocaleUpperCase()}
                </Text>
              );
            }
          },
          tabBarShowIcon: true,
          tabBarLabelStyle: {
            color: colors.white,
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.white,
          },
          tabBarStyle: {
            backgroundColor: colors.foreground,
          },
        };
      }}
      initialRouteName="chats">
      <Tab.Screen name="photo" component={Photo} />
      {/* <Tab.Screen name="chats" component={Chats} /> */}
    </Tab.Navigator>
  );
}

const Main = () => {
  // const [assets] = useAssets(
  //   require('./assets/icon-square.png'),
  //   require('./assets/chatbg.png'),
  //   require('./assets/user-icon.png'),
  //   require('./assets/welcome-img.png'),
  // );
  // if (!assets) {
  //   return <Text>Loading ..</Text>;
  // }
  return (
    <SafeAreaView>
      <ImageBackground
        source={require('./assets/splash_screen_01.jpeg')}
        style={{width: '100%', height: '100%'}}>
        <ContextWrapper>
          <App />
        </ContextWrapper>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default Main;
