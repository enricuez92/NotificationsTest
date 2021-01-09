import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';

class NotificationManager {
  configure = (onRegister, onNotification, onOpenNotification) => {
    PushNotification.createChannel(
      {
        channelId: "default_notification_channel_id", // (required)
        channelName: "My channel", // (required)
        channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
        playSound: false, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
    
    PushNotification.configure({
      // requestPermissions: Platform.OS === 'ios',
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        onRegister(token);
        console.log('[NotificationManager] onRegister TOKEN:', token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log(
          '[NotificationManager] onNotification NOTIFICATION:',
          notification,
        );

        if (Platform.OS === 'ios') {
          if (notification.data.openedInForeground) {
            notification.userInteraction = true;
          }
        }

        if (notification.userInteraction) {
          onOpenNotification(notification);
        } else {
          onNotification(notification);
        }

        if (Platform.OS === 'android') {
          notification.userInteraction = true;
        }

        // Only call callback if not in foreground
        if (Platform.OS === 'ios') {
          if (!notification.data.openedInForeground) {
            notification.finish('PushNotificationIOS.FetchResult.NoData');
          }
        } else {
          notification.finish('PushNotificationIOS.FetchResult.NoData');
        }
      },

      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);

        // process the action
      },

      // popInitialNotification: true,

      // ANDROID ONLY: GCM Sender ID
      senderID: '490257222757',

      // IOS ONLY
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    });
  };

  _buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
    return {
      id: id,
      autocancel: true,
      largeIcon: options.largeIcon || 'ic_launcer',
      smallIcon: options.smallIcon || 'ic_launcer',
      bigText: message || '',
      subText: title || '',
      vibrate: options.vibrate || false,
      vibration: options.vibration || 300,
      priority: options.vibration || 'high',
      importance: options.importance || 'high',
      data: data,
    };
  };

  _buildIOSNotification = (id, title, message, data = {}, options = {}) => {
    return {
      alertAction: options.alertAction || 'view',
      category: options.category || '',
      userInfo: {
        id: id,
        item: data,
      },
    };
  };

  showNotification = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      /* Android only properties */
      ...this._buildAndroidNotification(id, title, message, data, options),
      /* IOS only properties */
      ...this._buildIOSNotification(id, title, message, data, options),
      /* IOS and Android properties */
      title: title || '',
      message: message || '',
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      userInteraction: false, // if the notification was opened by the user
      channelId: "default_notification_channel_id",
      actions: '["Yes", "No"]'
    });
  };

  cancelAllLocalNotification = () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications();
    } else {
      PushNotification.cancelAllLocalNotifications();
    }
  };

  unRegister = () => {
    PushNotification.unregister();
  };
}

export const notificationManager = new NotificationManager();
