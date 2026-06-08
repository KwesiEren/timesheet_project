export interface CurrentLocation {
  lat: number;
  lng: number;
  accuracyMeters: number;
}

const ERROR_MESSAGES: Record<number, string> = {
  1: "Location permission denied. Allow access in your browser settings.",
  2: "Unable to determine your location.",
  3: "Location request timed out. Try again with a clear view of the sky.",
};

export function getCurrentLocation(
  options?: PositionOptions
): Promise<CurrentLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    const ACCURACY_THRESHOLD = 15; // meters
    const MAX_WAIT_TIME = 30000; // 30 seconds

    const timeoutId = setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);

      reject(
        new Error(
          `Could not achieve ${ACCURACY_THRESHOLD}m accuracy within ${MAX_WAIT_TIME / 1000
          } seconds.`
        )
      );
    }, MAX_WAIT_TIME);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;

        console.log(`GPS Accuracy: ${accuracy.toFixed(1)}m`);

        if (accuracy <= ACCURACY_THRESHOLD) {
          clearTimeout(timeoutId);
          navigator.geolocation.clearWatch(watchId);

          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracyMeters: accuracy,
          });
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        navigator.geolocation.clearWatch(watchId);

        reject(new Error(ERROR_MESSAGES[error.code] ?? error.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}