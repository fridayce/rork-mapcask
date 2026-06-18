'use strict';

/**
 * GPSTracker — wraps the browser Geolocation API and device compass.
 *
 * Provides:
 *  - Continuous GPS watch with high-accuracy mode
 *  - Device compass heading via DeviceOrientationEvent (iOS + Android)
 *  - Static utilities: Haversine distance, bearing, GPS→AR world coordinate conversion
 *
 * GPS→AR coordinate system notes:
 *   WebXR coordinate system: X=right (east), Y=up, Z=toward viewer (-Z is north/forward)
 *   We apply device heading rotation so virtual north aligns with real-world north.
 */
class GPSTracker {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.heading = 0;            // degrees, 0=north, clockwise
    this._posListeners = [];
    this._headingListeners = [];
    this._compassHandler = null;
    this._resolved = false;
  }

  /**
   * Begin GPS watch. Returns a Promise that resolves with the first position fix.
   * Rejects if geolocation is unavailable or the user denies permission.
   */
  start() {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation API not available in this browser'));
    }

    return new Promise((resolve, reject) => {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp,
          };
          this._posListeners.forEach(fn => fn(this.currentPosition));
          if (!this._resolved) {
            this._resolved = true;
            resolve(this.currentPosition);
          }
        },
        (err) => {
          if (!this._resolved) reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
      );
    });
  }

  /**
   * Register for device compass heading.
   * On iOS 13+ this triggers a permission prompt the first time.
   */
  async startCompass() {
    // iOS 13+ requires explicit permission for DeviceOrientationEvent
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== 'granted') {
        throw new Error('Device orientation permission denied');
      }
    }

    this._compassHandler = (event) => {
      let heading = null;

      // iOS Safari provides webkitCompassHeading (true north, degrees CW)
      if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
        heading = event.webkitCompassHeading;
      } else if (event.absolute === true && event.alpha !== null) {
        // Android absolute orientation: alpha is rotation around Z, CCW from north
        heading = (360 - event.alpha) % 360;
      } else if (event.alpha !== null) {
        // Non-absolute fallback — less accurate, but usable
        heading = (360 - event.alpha) % 360;
      }

      if (heading !== null) {
        this.heading = heading;
        this._headingListeners.forEach(fn => fn(this.heading));
      }
    };

    // Prefer absolute orientation (guaranteed to reference true north on Android)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', this._compassHandler, true);
    } else {
      window.addEventListener('deviceorientation', this._compassHandler, true);
    }
  }

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this._compassHandler) {
      window.removeEventListener('deviceorientationabsolute', this._compassHandler, true);
      window.removeEventListener('deviceorientation', this._compassHandler, true);
      this._compassHandler = null;
    }
  }

  /** Register a callback for position updates: fn({ latitude, longitude, accuracy, altitude }) */
  onPosition(fn) { this._posListeners.push(fn); return this; }

  /** Register a callback for heading updates: fn(degrees) */
  onHeading(fn) { this._headingListeners.push(fn); return this; }

  // ---------------------------------------------------------------------------
  // Static geometry utilities
  // ---------------------------------------------------------------------------

  /**
   * Haversine great-circle distance between two GPS coordinates, in metres.
   */
  static distanceBetween(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Initial bearing from point A to point B, in degrees (0=north, clockwise).
   */
  static bearingBetween(lat1, lng1, lat2, lng2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  }

  /**
   * Convert a GPS target position into Three.js / WebXR world-space coordinates,
   * relative to the user's current GPS position.
   *
   * Coordinate mapping:
   *   GPS north (+Δlat) → WebXR -Z  (forward)
   *   GPS east  (+Δlng) → WebXR +X  (right)
   *   Y                 → elevationOffset (below eye level by default)
   *
   * @param {number} userLat       User latitude (degrees)
   * @param {number} userLng       User longitude (degrees)
   * @param {number} targetLat    Target latitude (degrees)
   * @param {number} targetLng    Target longitude (degrees)
   * @param {number} headingDeg   Device compass heading (degrees, 0=north CW)
   * @param {number} [elevationOffset=-1.5]  Y offset from eye level in metres
   * @returns {{ x: number, y: number, z: number }}
   */
  static gpsToARPosition(userLat, userLng, targetLat, targetLng, headingDeg, elevationOffset = -1.5) {
    // Equirectangular approximation (accurate within ~10 km)
    const metersPerDegLat = 111132;
    const metersPerDegLng = 111132 * Math.cos(userLat * Math.PI / 180);

    const northMeters = (targetLat - userLat) * metersPerDegLat;
    const eastMeters  = (targetLng - userLng) * metersPerDegLng;

    // Rotate GPS offset by device heading so WebXR -Z aligns with real-world north.
    // Without this, the objects would always be placed relative to the session's
    // arbitrary initial orientation rather than true geographic direction.
    const h = headingDeg * Math.PI / 180;
    const arX =  eastMeters  * Math.cos(h) - northMeters * Math.sin(h);
    const arZ = -(eastMeters * Math.sin(h) + northMeters * Math.cos(h));

    return { x: arX, y: elevationOffset, z: arZ };
  }

  /**
   * Format a distance value as a human-readable string.
   */
  static formatDistance(metres) {
    if (metres < 1000) return `${Math.round(metres)}m`;
    return `${(metres / 1000).toFixed(1)}km`;
  }
}
