import {useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import ListItem from '../components/ListItem';
import GlobalContext from '../context/Context';
import firebaseSetup from '../db/firebase';
import useContacts from '../hooks/useHooks';

export default function Contacts() {
  const {firestore} = firebaseSetup();
  const firestoreSetup = firestore().collection('users');
  const contacts = useContacts();
  const route = useRoute();
  const image = route.params && route.params.image;
  return (
    <FlatList
      style={{flex: 1, padding: 10}}
      data={contacts}
      keyExtractor={(_, i) => i}
      renderItem={({item}) => <ContactPreview contact={item} image={image} />}
    />
  );
}

function ContactPreview({contact, image}) {
  const {unfilteredRooms, rooms} = useContext(GlobalContext);
  const [user, setUser] = useState(contact);

  useEffect(() => {
    const unsubscribe = firestoreSetup
      .where('phoneNumber', '==', contact.phoneNumber)
      .get()
      .then(snapshot => {
        setUser(prevUser => ({...prevUser, snapshot}));
      });
    return () => unsubscribe();
  }, []);
  return (
    <ListItem
      style={{marginTop: 7}}
      type="contacts"
      user={user}
      image={image}
      room={unfilteredRooms.find(room =>
        room.participantsArray.includes(contact.phoneNumber),
      )}
    />
  );
}
