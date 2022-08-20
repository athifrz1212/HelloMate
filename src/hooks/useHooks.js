import {useEffect, useState} from 'react';
import {PermissionsAndroid} from 'react-native';

import Contacts from 'react-native-contacts';

export default function useContacts() {
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    (async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts',
          message: 'This app would like to view your contacts.',
          buttonPositive: 'Please accept bare mortal',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Contacts.getAll()
          .then(contacts => {
            setContacts(
              contacts
                .filter(
                  c =>
                    c.displayName &&
                    c.familyName &&
                    c.givenName &&
                    c.phoneNumbers[0].number,
                )
                .map(mapContactToUser),
            );
          })
          .catch(e => {
            console.log(e);
          });
      }

      // PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
      //   title: 'Contacts',
      //   message: 'This app would like to view your contacts.',
      //   buttonPositive: 'Please accept bare mortal',
      // }).then(
      //   Contacts.getAll()
      //     .then(contacts => {
      //       setContacts(
      //         contacts
      //           .filter(
      //             c =>
      //               c.displayName &&
      //               c.familyName &&
      //               c.givenName &&
      //               c.phoneNumbers[0].number,
      //           )
      //           .map(mapContactToUser),
      //       );
      //     })
      //     .catch(e => {
      //       console.log(e);
      //     }),
      // );
    })();
  }, []);

  return contacts;
}
function mapContactToUser(contact) {
  return {
    contactName:
      contact.familyName && contact.givenName
        ? `${contact.familyName} ${contact.givenName}`
        : contact.familyName,
    phoneNumber: contact.phoneNumbers[0].number,
  };
}
