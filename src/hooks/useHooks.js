import {useEffect, useState} from 'react';
import {PermissionsAndroid} from 'react-native';

import Contacts from 'react-native-contacts';

export default function useContacts() {
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    (async () => {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept bare mortal',
      }).then(
        Contacts.getAll()
          .then(contacts => {
            setContacts(
              contacts
                .filter(c => c.displayName && c.givenName)
                .map(mapContactToUser),
            );
          })
          .catch(e => {
            console.log(e);
          }),
      );
    })();
  }, []);

  return contacts;
}
function mapContactToUser(contact) {
  return {
    contactName:
      contact.firstName && contact.lastName
        ? `${contact.firstName} ${contact.lastName}`
        : contact.firstName,
    email: contact.emails[0].email,
  };
}
