import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// var emitter = require('tiny-emitter/instance');

export default class NotificationUtils {
  constructor(onRegister, nav) {
    const navigation = nav;
    let requestPermissionsPromise = null;
    this.configure(_onRegister, _onNotification, _onError);
  }

  configure(onRegister, onNotification, onError) {
    PushNotification.configure({
      onRegister: onRegister,
      onNotification: onNotification,
      onError: onError,

      popInitialNotification: true,
      requestPermissions: false,

      // ANDROID ONLY: GCM Sender ID
      // per trovarlo premere l'ingranaggio (impostazioni) sulla console di firebase, premere cloud messaging, è quello sotto l'etichetta "ID mittente"
      // bisogna rinviare a Francesco anche la API key (Chiave server)
      senderID: '490257222757',

      // IOS ONLY
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    });
  }

  checkPermission() {
    return PushNotification.checkPermissions(_handlePerm);
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }



  static requestPermissions = () => {
    if (Platform.OS === 'ios') {
      if (this.requestPermissionsPromise) return this.requestPermissionsPromise;

      this.requestPermissionsPromise = PushNotification.requestPermissions().then(
        (res) => {
          this.requestPermissionsPromise = null;
          return res;
        },
        (err) => {
          console.log('error', err);
          this.requestPermissionsPromise = null;
        },
      );
      return this.requestPermissionsPromise;
    } else {
      PushNotification.requestPermissions();
    }
  };
}
const _onRegister = (token) => {
  console.log('NOTIFICATION: ', '_onRegister', token);
  //TODO: Remove the alert
  alert(token.token);
};

const _onNotification = async (notificationData) => {
  console.log('NOTIFICATION', '_onNotification', notificationData);
  // alert(JSON.stringify(notificationData));
  PushNotification.setApplicationIconBadgeNumber(1);

  await AsyncStorage.setItem(
    'NotificationData',
    JSON.stringify(notificationData),
  );

  // if (Platform.OS === 'ios' && notificationData.foreground) {
  //   emitter.emit('ios_foreground_notification');
  // }

  if (Platform.OS === 'android' && !notificationData?.tag) {
    //TODO check notificaiton from adobe or scheduled
    PushNotification.localNotificationSchedule({
      date: new Date(Date.now() + 5 * 1000), //5 seconds
      title: notificationData.title,
      message: notificationData.body,
      tag: JSON.stringify(notificationData),
      playSound: true,
      soundName: 'default',
    });
  }
  if (Platform.OS === 'ios') {
    notificationData.finish(PushNotificationIOS.FetchResult.NewData);
  }
};

const _handlePerm = (perms) => {
  console.log('NOTIFICATION', '_handlePerm', perms);
};

const _onError = (error) => {
  console.log('NOTIFICATION', '_onRegister', error);
};
