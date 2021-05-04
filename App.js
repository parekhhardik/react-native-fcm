import React, { useEffect } from 'react';
import { View, Alert, Text } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  useEffect(() => {
    checkPermission();
    createNotificationListeners();
    registerAppWithFCM();
  });

  const registerAppWithFCM = async () => {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);
    }
  };

  const checkPermission = async () => {
    const enabled = await messaging().requestPermission();
    // If Premission granted proceed towards token fetch
    if (enabled) {
      getToken();
    } else {
      // If permission hasn’t been granted to our app, request user in requestPermission method.
      requestPermission();
    }
  };

  const getToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      console.log('fcmToken :', fcmToken);
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  };

  const requestPermission = async () => {
    try {
      await messaging().requestPermission();
      // User has authorised
      getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  };

  const createNotificationListeners = async () => {
    // This listener triggered when notification has been received in foreground
    notificationListener = messaging().onMessage(notification => {
      const { title, body, deviceId } = notification.notification;
      displayNotification(title, body, deviceId);
    });

    // This listener triggered when app is in backgound and we click, tapped and opened notifiaction
    notificationOpenedListener = messaging().onNotificationOpened(
      notificationOpen => {
        const { title, body, deviceId } = notificationOpen.notification;
        displayNotification(title, body, deviceId);
      }
    );

    // This listener triggered when app is closed and we click,tapped and opened notification
    const notificationOpen = await messaging().getInitialNotification();
    if (notificationOpen) {
      const { title, body, deviceId } = notificationOpen.notification;
      displayNotification(title, body, deviceId);
    }
  };

  const displayNotification = (title, body, deviceId) => {
    // we display notification in alert box with title and body
    Alert.alert(
      title,
      body,
      [{ text: 'Ok', onPress: () => console.log('ok pressed') }],
      { cancelable: false }
    );
  };
    
  return (
    <View>
      <Text>FCM POC</Text>
    </View>
  );
};

export default App;