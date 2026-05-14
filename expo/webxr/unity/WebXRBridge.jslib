/**
 * WebXRBridge.jslib
 * Unity JS native plugin — place at: Assets/Plugins/WebGL/WebXRBridge.jslib
 *
 * This file is compiled into the Unity WebGL build and makes browser APIs
 * available to C# code via DllImport("__Internal").
 *
 * Unity function naming convention for jslib:
 *   C#:  [DllImport("__Internal")] static extern void JS_StartGPSWatch();
 *   JS:  JS_StartGPSWatch: function () { ... }
 *
 * UTF8ToString(ptr) — converts a C# string pointer to a JS string.
 * allocate / HEAPU8  — not needed here since we only pass strings out.
 */
mergeInto(LibraryManager.library, {

    // ── GPS ──────────────────────────────────────────────────────────────────

    JS_StartGPSWatch: function () {
        if (!navigator.geolocation) {
            console.warn('[MapCask] Geolocation API not available');
            return;
        }
        window._mapcaskGPSWatchId = navigator.geolocation.watchPosition(
            function (pos) {
                var payload = JSON.stringify({
                    lat:      pos.coords.latitude,
                    lng:      pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
                // Route to GPSLocationService.OnGPSUpdate(string json)
                SendMessage('ARManager', 'OnGPSUpdate', payload);
            },
            function (err) {
                console.warn('[MapCask] GPS error:', err.message);
            },
            { enableHighAccuracy: true, maximumAge: 3000 }
        );
    },

    JS_StopGPSWatch: function () {
        if (window._mapcaskGPSWatchId != null) {
            navigator.geolocation.clearWatch(window._mapcaskGPSWatchId);
            delete window._mapcaskGPSWatchId;
        }
    },

    // ── Compass ──────────────────────────────────────────────────────────────

    JS_StartCompassWatch: function () {
        window._mapcaskCompassHandler = function (event) {
            var heading = null;
            // iOS Safari
            if (event.webkitCompassHeading != null) {
                heading = event.webkitCompassHeading;
            // Android absolute
            } else if (event.absolute === true && event.alpha != null) {
                heading = (360 - event.alpha) % 360;
            }
            if (heading !== null) {
                SendMessage('ARManager', 'OnHeadingUpdate', heading.toFixed(2));
            }
        };

        // iOS 13+ needs explicit permission
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(function (perm) {
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation',
                            window._mapcaskCompassHandler, true);
                    }
                });
        } else {
            var evt = 'ondeviceorientationabsolute' in window
                ? 'deviceorientationabsolute'
                : 'deviceorientation';
            window.addEventListener(evt, window._mapcaskCompassHandler, true);
        }
    },

    JS_StopCompassWatch: function () {
        if (window._mapcaskCompassHandler) {
            window.removeEventListener('deviceorientationabsolute',
                window._mapcaskCompassHandler, true);
            window.removeEventListener('deviceorientation',
                window._mapcaskCompassHandler, true);
            delete window._mapcaskCompassHandler;
        }
    },

    // ── AR object events (Unity → JS overlay) ────────────────────────────────

    /**
     * Called from ARWaypointManager.cs when an AR prefab is placed.
     * JS overlay (ar.html) listens for 'mapcask:objectVisible'.
     */
    JS_NotifyObjectVisible: function (idPtr) {
        var id = UTF8ToString(idPtr);
        window.dispatchEvent(
            new CustomEvent('mapcask:objectVisible', { detail: { id: id } })
        );
    },

    /**
     * Called from ARObjectController.cs when the user taps an AR object.
     * JS overlay shows an info panel with price / description.
     */
    JS_NotifyObjectTapped: function (idPtr) {
        var id = UTF8ToString(idPtr);
        window.dispatchEvent(
            new CustomEvent('mapcask:objectTapped', { detail: { id: id } })
        );
    },

});
