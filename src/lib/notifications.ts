import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

/**
 * Bildirim modülünün başlangıç yapılandırmasını kurar.
 * Uygulama açılışında (_layout.tsx) bir kez çağrılmalıdır.
 */
export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    // Uygulama açıkken bildirim geldiğinde nasıl davranılacağını belirle
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Android için bildirim kanalı tanımla
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-verse', {
        name: 'Günün Ayeti Hatırlatıcısı',
        description: 'Her gün belirlenen vakitte günün ayetini hatırlatır.',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D483E',
      });
    }
  } catch (error) {
    console.error('[Notifications] Başlatma hatası:', error);
  }
}

/**
 * Bildirim izin durumunu kontrol eder ve gerekirse izin ister.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (existing.status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = requested.status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('[Notifications] İzin isteme hatası:', error);
    return false;
  }
}

/**
 * Kullanıcının belirlediği saat ve dakikada her gün tekrarlayan günlük bildirimi planlar.
 */
export async function scheduleDailyVerseNotification(
  hour: number,
  minute: number
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return false;
    }

    // Önceki tüm planlanmış bildirimleri temizle
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Günlük tekrarlayan bildirimi planla
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Günün Ayeti 🌿',
        body: 'Gününüzü aydınlatacak ayet-i kerime ve tefekkür duası sizi bekliyor.',
        data: { openVerse: true },
        sound: 'default',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'daily-verse',
      },
    });

    return true;
  } catch (error) {
    console.error('[Notifications] Günlük bildirim planlama hatası:', error);
    return false;
  }
}

/**
 * Kullanıcının belirlediği özel bir tarih ve saat için tek seferlik bildirim planlar.
 */
export async function scheduleSpecificDateNotification(
  date: Date,
  customTitle?: string
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return false;
    }

    if (date.getTime() <= Date.now()) {
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: customTitle || 'Ayet Hatırlatıcısı 🌿',
        body: 'Planladığınız tefekkür ve ayet okuma vakti geldi.',
        data: { openVerse: true },
        sound: 'default',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date,
        channelId: 'daily-verse',
      },
    });

    return true;
  } catch (error) {
    console.error('[Notifications] Özel tarihli bildirim planlama hatası:', error);
    return false;
  }
}

/**
 * Kullanıcının bildirimleri hemen test edebilmesi için 3 saniye sonraya bir test bildirimi planlar.
 */
export async function sendTestNotification(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '1 Ayet Hatırlatıcı Testi 🌸',
        body: 'Bildirimleriniz aktif! Belirlediğiniz vakitte günün ayeti iletilecektir.',
        data: { openVerse: true },
        sound: 'default',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });

    return true;
  } catch (error) {
    console.error('[Notifications] Test bildirimi hatası:', error);
    return false;
  }
}

/**
 * Planlanmış tüm hatırlatıcıları iptal eder.
 */
export async function cancelAllVerseNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Bildirim iptal hatası:', error);
  }
}
