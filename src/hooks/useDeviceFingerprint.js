/**
 * Generates and persists a unique device fingerprint to use as device ID.
 * Browsers cannot access real IMEI, so we create a stable UUID stored in localStorage.
 * On Android via WebAPK/TWA, this persists across sessions like an IMEI.
 */
export function getDeviceFingerprint() {
  const key = 'panic_ring_device_id';
  let id = localStorage.getItem(key);
  if (!id) {
    // Generate a UUID-like fingerprint
    id = 'PR-' + Date.now().toString(36).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem(key, id);
  }
  return id;
}

export function getDeviceInfo() {
  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();

  let platform = 'android';
  let deviceName = 'Android Phone';
  let deviceType = 'phone';

  if (uaLower.includes('iphone')) {
    platform = 'ios';
    deviceName = 'iPhone';
  } else if (uaLower.includes('ipad')) {
    platform = 'ios';
    deviceName = 'iPad';
    deviceType = 'tablet';
  } else if (uaLower.includes('wearos')) {
    platform = 'wear_os';
    deviceName = 'Wear OS Watch';
    deviceType = 'smartwatch';
  } else if (uaLower.includes('watchos')) {
    platform = 'watchos';
    deviceName = 'Apple Watch';
    deviceType = 'smartwatch';
  } else if (uaLower.includes('windows')) {
    platform = 'android'; // treat web as android for compatibility
    deviceName = 'Windows PC';
    deviceType = 'phone';
  } else if (uaLower.includes('macintosh') || uaLower.includes('mac os')) {
    platform = 'ios';
    deviceName = 'Mac';
  } else if (uaLower.includes('linux')) {
    platform = 'android';
    deviceName = 'Linux Device';
  } else if (uaLower.includes('tablet') || uaLower.includes('tab')) {
    deviceType = 'tablet';
    deviceName = 'Android Tablet';
  }

  // Try to extract real Android model from UA (only for real Android devices)
  if (uaLower.includes('android') && !uaLower.includes('windows')) {
    const modelMatch = ua.match(/Android [\d.]+;\s*([^)]+?)\s*(Build|\))/i);
    if (modelMatch && modelMatch[1]) {
      const model = modelMatch[1].trim();
      if (model && !model.toLowerCase().includes('linux') && model.length > 2) {
        deviceName = model;
      }
    }
  }

  return {
    deviceId: getDeviceFingerprint(),
    deviceName,
    platform,
    deviceType,
    userAgent: ua,
  };
}