import * as Clipboard from 'expo-clipboard';
import { Alert, Platform } from 'react-native';

// PUBLIC_INTERFACE
export async function shareToClipstack(url: string) {
  /** Placeholder for native share extension. Copies URL to clipboard and informs user. */
  await Clipboard.setStringAsync(url);
  Alert.alert(
    'Share to ClipStack',
    Platform.select({
      ios: 'Native Share Extension is a placeholder in MVP. URL copied to clipboard — open ClipStack and paste in Capture.',
      android: 'Use system share to copy URL. It has been copied to clipboard — open ClipStack and paste in Capture.',
      default: 'URL copied to clipboard.',
    })!
  );
}
