// import {collection, onSnapshot, query, where} from '@firebase/firestore';
import React, {useContext, useEffect} from 'react';
import {View, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/Context';
import firebaseSetup from '../db/firebase';
import ContactsFloatingIcon from '../components/ContactsFloatingIcon';
import ListItem from '../components/ListItem';
import useContacts from '../hooks/useHooks';

export default function Chats() {
  const {auth, firestore} = firebaseSetup();
  const {currentUser} = auth();
  const {rooms, setRooms, setUnfilteredRooms} = useContext(GlobalContext);
  const contacts = useContacts();
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  const chatsQuery = firestore()
    .collection('rooms')
    .where('participantsArray', 'array-contains', currentUser.phoneNumber);

  useEffect(() => {
    const unsubscribe = chatsQuery.onSnapshot(
      querySnapshot => {
        const parsedChats = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          userB: doc
            .data()
            .participants.find(p => p.phoneNumber !== currentUser.phoneNumber),
        }));
        setUnfilteredRooms(parsedChats);
        setRooms(parsedChats.filter(doc => doc.lastMessage));
      },
      error => console.log('>>>>>>>>>>>>', error),
    );
    return () => unsubscribe();
  }, []);

  function getUserB(user, contacts) {
    const userContact = contacts.find(c => c.phoneNumber === user.phoneNumber);
    if (userContact && userContact.displayName) {
      return {...user, displayName: userContact.displayName};
    }
    // if (userContact && userContact.contactName) {
    //   return {...user, contactName: userContact.contactName};
    // }
    return user;
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, padding: 5, paddingRight: 10}}>
        {rooms.map(room => (
          <ListItem
            type="chat"
            description={room.lastMessage.text}
            key={room.id}
            room={room}
            time={room.lastMessage.createdAt}
            user={getUserB(room.userB, contacts)}
          />
        ))}
        <ContactsFloatingIcon />
      </View>
      <View
        style={{
          width: '100%',
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
          bottom: 0,
        }}>
        <View
          style={{
            width: '100%',
            height: 70,
            display: 'flex',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{
              width: '50%',
              height: 70,
              backgroundColor: '#ff0000',
              alignItems: 'center',
              lineHeight: 70,
            }}>
            <Ionicons
              name="stop"
              size={30}
              color={colors.white}
              style={{lineHeight: 70}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '50%',
              backgroundColor: '#00ff1f',
              alignItems: 'center',
              lineHeight: 70,
            }}>
            <Ionicons
              name="mic"
              size={30}
              color={colors.foreground}
              style={{lineHeight: 70}}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
