// @refresh reset
import {useRoute} from '@react-navigation/native';
import 'react-native-get-random-values';
import {nanoid} from 'nanoid';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  TouchableHighlight,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseSetup from '../db/firebase';
import GlobalContext from '../context/Context';
import {
  Actions,
  Bubble,
  GiftedChat,
  InputToolbar,
} from 'react-native-gifted-chat';
import {pickImage, uploadImage} from '../utilities/utils';
import ImageView from 'react-native-image-viewing';
import Voice from '@react-native-voice/voice';
import {TextInput} from 'react-native-gesture-handler';

const randomId = nanoid();

export default function Chat() {
  const {auth, firestore} = firebaseSetup();
  const roomCollection = firestore().collection('rooms');
  const usersCollection = firestore().collection('users');
  const [roomHash, setRoomHash] = useState('');
  const [messages, setMessages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageView, setSeletedImageView] = useState('');
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  const {currentUser} = auth();
  const route = useRoute();
  const room = route.params.room;
  const selectedImage = route.params.image;
  const userB = route.params.user;

  ///--------------------------------------
  const [pitch, setPitch] = useState('');
  const [error, setError] = useState('');
  const [end, setEnd] = useState('');
  const [started, setStarted] = useState('');
  const [results, setResults] = useState([]);
  const [partialResults, setPartialResults] = useState([]);

  useEffect(() => {
    //Setting callbacks for the process status
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      //destroy the process after switching the screen
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = e => {
    console.log('onSpeechStart: ', e);
  };

  const onSpeechEnd = e => {
    console.log('onSpeechEnd: ', e);
  };

  const onSpeechError = e => {
    console.log('onSpeechError: ', e);
    setError(JSON.stringify(e.error));
  };

  const onSpeechResults = e => {
    let text = e.value[0];
    setResults(text);
    console.log('onSpeechResults: ', e);
  };

  async function startRecognizing() {
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.log(' Starting error >>>>>>>> : ', e);
    }
  }

  async function stopRecognizing() {
    try {
      Voice.stop();
    } catch (e) {
      console.log(' Stopping error >>>>>>>> : ', e);
    }
  }

  async function cancelRecognizing() {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  }

  ///--------------------------------------

  const senderUser = currentUser.photoURL
    ? {
        name: currentUser.displayName,
        _id: currentUser.uid,
        avatar: currentUser.photoURL,
      }
    : {name: currentUser.displayName, _id: currentUser.uid};
  // const senderUser = currentUser.phoneNumber
  //   ? {
  //       name: 'At',
  //       _id: 'coURAQKg9haNSl9krHNMf0P3l6M2',
  //       avatar:
  //         'https://loveshayariimages.in/wp-content/uploads/2021/10/1080p-Latest-Whatsapp-Profile-Images-1.jpg',
  //     }
  //   : {name: currentUser.displayName, _id: currentUser.uid};

  const roomId = room ? room.id : randomId;

  const roomRef = roomCollection.doc(roomId);
  const roomMessagesRef = roomCollection.doc(roomId).collection('messages');

  useEffect(() => {
    (async () => {
      if (!room) {
        const currUserData = {
          displayName: currentUser.displayName,
          phoneNumber: currentUser.phoneNumber,
        };
        if (currentUser.photoURL) {
          currUserData.photoURL = currentUser.photoURL;
        }
        const userBData = {
          displayName: userB.contactName || userB.displayName || '',
          phoneNumber: userB.phoneNumber,
        };
        if (userB.photoURL) {
          userBData.photoURL = userB.photoURL;
        }
        const roomData = {
          participants: [currUserData, userBData],
          participantsArray: [currentUser.phoneNumber, userB.phoneNumber],
        };
        try {
          await roomRef.set(roomData);
        } catch (error) {
          console.log(error);
        }
      }
      const phoneNumberHash = `${currentUser.phoneNumber}:${userB.phoneNumber}`;
      setRoomHash(phoneNumberHash);
      if (selectedImage && selectedImage.uri) {
        await sendImage(selectedImage.uri, phoneNumberHash);
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = roomMessagesRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({type}) => type === 'added')
        .map(({doc}) => {
          const message = doc.data();
          return {...message, createdAt: message.createdAt.toDate()};
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    messages => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages),
      );
    },
    [messages],
  );

  async function onSend(messages = []) {
    const writes = messages.map(m => roomMessagesRef.add(m));
    const lastMessage = messages[messages.length - 1];

    writes.push(roomRef.update({lastMessage}));
    await Promise.all(writes);
  }

  async function sendImage(uri, roomPath) {
    const {url, fileName} = await uploadImage(
      uri,
      `images/rooms/${roomPath || roomHash}`,
    );
    const message = {
      _id: fileName,
      text: '',
      createdAt: new Date(),
      user: senderUser,
      image: url,
    };
    const lastMessage = {...message, text: 'Image'};
    await Promise.all([
      roomMessagesRef.add(message),
      roomRef.update(lastMessage),
    ]);
  }

  async function handlePhotoPicker() {
    try {
      const result = await pickImage();
      if (!result.cancelled) {
        await sendImage(result.uri);
      }
    } catch (error) {
      console.log('Camera selection error >>>>>>>>>>> ', error);
    }
  }

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../../assets/chatbg.png')}
      style={{flex: 1}}>
      <GiftedChat
        onSend={onSend}
        messages={messages}
        user={senderUser}
        renderAvatar={null}
        text={results}
        // textInputProps={<TextInput onChangeText={text => setResults(text)} />}
        renderActions={props => (
          <Actions
            {...props}
            containerStyle={{
              position: 'absolute',
              right: 50,
              bottom: 5,
              zIndex: 9999,
            }}
            onPressActionButton={handlePhotoPicker}
            icon={() => (
              <Ionicons name="camera" size={30} color={colors.iconGray} />
            )}
          />
        )}
        timeTextStyle={{right: {color: 'black'}}}
        renderSend={props => {
          const {text, messageIdGenerator, user, onSend} = props;
          return (
            <TouchableOpacity
              style={{
                height: 40,
                width: 40,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                marginBottom: 5,
                marginRight: 5,
              }}
              onPress={() => {
                if (text && onSend) {
                  onSend(
                    {
                      text: results,
                      user,
                      _id: messageIdGenerator(),
                    },
                    true,
                  );
                }
              }}>
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          );
        }}
        renderInputToolbar={props => (
          <InputToolbar
            {...props}
            containerStyle={{
              marginLeft: 10,
              marginRight: 10,
              marginBottom: 10,
              borderRadius: 20,
              paddingTop: 5,
            }}
          />
        )}
        renderBubble={props => (
          <Bubble
            {...props}
            textStyle={{right: {color: colors.text}}}
            wrapperStyle={{
              left: {
                backgroundColor: colors.white,
              },
              right: {
                backgroundColor: colors.tertiary,
              },
            }}
          />
        )}
        renderMessageImage={props => {
          return (
            <View style={{borderRadius: 15, padding: 2}}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setSeletedImageView(props.currentMessage.image);
                }}>
                <Image
                  resizeMode="contain"
                  style={{
                    width: 200,
                    height: 200,
                    padding: 6,
                    borderRadius: 15,
                    resizeMode: 'cover',
                  }}
                  source={{uri: props.currentMessage.image}}
                />
                {selectedImageView ? (
                  <ImageView
                    imageIndex={0}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                    images={[{uri: selectedImageView}]}
                  />
                ) : null}
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          onPress={stopRecognizing}
          style={{
            width: '50%',
            height: 60,
            backgroundColor: '#ff0000',
            alignItems: 'center',
          }}>
          <Ionicons
            name="stop"
            size={30}
            color={colors.white}
            style={{lineHeight: 60}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={startRecognizing}
          style={{
            width: '50%',
            backgroundColor: '#00ff1f',
            alignItems: 'center',
            height: 60,
          }}>
          <Ionicons
            name="mic"
            size={30}
            color={colors.foreground}
            style={{lineHeight: 60}}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
