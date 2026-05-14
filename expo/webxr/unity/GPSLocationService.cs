// GPSLocationService.cs
// Attach to: GameObjects/ARManager
//
// On WebGL: delegates GPS watch to the browser Geolocation API via WebXRBridge.jslib.
// On native (editor / iOS / Android): uses Unity's LocationService directly.
//
// Usage:
//   GPSLocationService.OnLocationUpdate += (lat, lng, acc) => { ... };

using UnityEngine;
using System.Runtime.InteropServices;

public class GPSLocationService : MonoBehaviour
{
    // ── JS interop stubs (WebGL only) ────────────────────────────────────────

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] static extern void JS_StartGPSWatch();
    [DllImport("__Internal")] static extern void JS_StopGPSWatch();
#endif

    // ── Events ────────────────────────────────────────────────────────────────

    /// Fired on every GPS fix: (latitude, longitude, accuracyMetres)
    public static event System.Action<double, double, float> OnLocationUpdate;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    void OnEnable()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        JS_StartGPSWatch();     // installs navigator.geolocation.watchPosition
#else
        StartCoroutine(StartNativeGPS());
#endif
    }

    void OnDisable()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        JS_StopGPSWatch();
#else
        Input.location.Stop();
#endif
    }

    // ── WebGL entry point (called via SendMessage from WebXRBridge.jslib) ────

    /// Called from JS: unityInstance.SendMessage('ARManager', 'OnGPSUpdate', json)
    /// json format: { "lat": 38.2527, "lng": -85.7585, "accuracy": 12.5 }
    public void OnGPSUpdate(string json)
    {
        var data = JsonUtility.FromJson<GPSPayload>(json);
        OnLocationUpdate?.Invoke(data.lat, data.lng, data.accuracy);
    }

    // ── Native GPS coroutine (editor / iOS / Android) ─────────────────────

    System.Collections.IEnumerator StartNativeGPS()
    {
        if (!Input.location.isEnabledByUser)
        {
            Debug.LogWarning("[GPS] Location services not enabled by user");
            yield break;
        }

        Input.location.Start(desiredAccuracyInMeters: 5f, updateDistanceInMeters: 2f);

        float timeout = 10f;
        while (Input.location.status == LocationServiceStatus.Initializing && timeout > 0)
        {
            yield return new WaitForSeconds(1f);
            timeout -= 1f;
        }

        if (Input.location.status != LocationServiceStatus.Running)
        {
            Debug.LogWarning("[GPS] Location service failed to start");
            yield break;
        }

        while (true)
        {
            var loc = Input.location.lastData;
            OnLocationUpdate?.Invoke(loc.latitude, loc.longitude, loc.horizontalAccuracy);
            yield return new WaitForSeconds(2f);
        }
    }

    // ── Serialisable payload ─────────────────────────────────────────────────

    [System.Serializable]
    struct GPSPayload
    {
        public double lat;
        public double lng;
        public float  accuracy;
    }
}
