// import {collection, onSnapshot, query, where} from '@firebase/firestore';
import React, {useContext, useEffect} from 'react';
import {View, Text} from 'react-native';
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
    // const unsubscribe = chatsQuery.get().then(querySnapshot => {
    //   const parsedChats = querySnapshot.docs.map(doc => ({
    //     ...doc.data(),
    //     id: doc.id,
    //     userB: doc
    //       .data()
    //       .participants.find(p => p.phoneNumber !== currentUser.phoneNumber),
    //   }));
    //   setUnfilteredRooms(parsedChats);
    //   setRooms(parsedChats.filter(doc => doc.lastMessage));
    // });
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
  );
}
