'use strict';

/**
 * UnityWebXRBridge — simulates the glue layer produced by a real Unity WebGL build.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW A PRODUCTION BUILD WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Unity project is built with:
 *      • Unity 2022.3 LTS, WebGL build target
 *      • "De-Panther/unity-webxr-export" package (github.com/De-Panther/unity-webxr-export)
 *        — replaces Unity's default XR backend with a WebXR session bridge
 *      • AR Foundation 5.x — provides ARSession, ARSessionOrigin, ARRaycastManager etc.
 *      • Custom .jslib plugins (see WebXRBridge.jslib below) for JS↔C# messaging
 *
 * 2. The build output is a directory containing:
 *      Build/
 *        MapCask.loader.js    — Unity loader
 *        MapCask.framework.js — Unity engine runtime
 *        MapCask.data         — compressed asset bundle
 *        MapCask.wasm         — compiled C# bytecode (WebAssembly)
 *      index.html             — instantiates the Unity runtime
 *
 * 3. JS calls createUnityInstance(canvas, config) → Unity starts up.
 *    From that point Unity drives its own render loop inside the WebXR frame callback.
 *
 * 4. Bidirectional messaging:
 *    JS → Unity:  unityInstance.SendMessage(gameObject, method, param)
 *    Unity → JS:  C# DllImport of an extern function declared in a .jslib file
 *
 * This file simulates steps 3–4 so the PoC runs without a compiled Unity build.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Unity C# script architecture (see /unity/ for full source):
 *
 *   ARSessionManager.cs      — initialises WebXR AR session via WebXRManager
 *   GPSLocationService.cs    — bridges JS geolocation → C# events
 *   CompassService.cs        — bridges JS DeviceOrientation → C# events
 *   ARWaypointManager.cs     — places/removes Prefabs based on GPS proximity
 *   ARObjectController.cs    — per-object float animation + tap info panel
 *   GeoUtils.cs              — Haversine, bearing, GPS→local coordinate math
 *   WebXRBridge.jslib        — DllImport stubs: GPS, compass, object-visible callback
 */
class UnityWebXRBridge {
  constructor() {
    this._handlers = {};       // gameObject::method → handler fn
    this._readyCbs = [];
    this._instance = null;
    this._ready = false;
  }

  /**
   * Simulates the Unity WebGL createUnityInstance() call.
   * In production this spins up the WASM runtime; here it resolves after a
   * short fake loading sequence so the UI progression looks realistic.
   *
   * @param {HTMLCanvasElement|null} canvas
   * @param {object} config   — mirrors Unity's WebGL template config object
   * @param {function} [onProgress]  — receives 0..1 progress values
   * @returns {Promise<object>} unityInstance
   */
  async createUnityInstance(canvas, config, onProgress) {
    console.log('[UnityBridge] Initialising Unity WebXR runtime (simulated)…');

    // Fake loading progress — mirrors Unity's actual multi-step load sequence
    const steps = [
      [0.10, 'Loading engine framework…'],
      [0.30, 'Decompressing assets…'],
      [0.55, 'Initialising WebAssembly runtime…'],
      [0.75, 'Loading AR Foundation subsystems…'],
      [0.90, 'Starting WebXR session bridge…'],
      [1.00, 'Unity ready'],
    ];

    for (const [progress, label] of steps) {
      await new Promise(r => setTimeout(r, 120));
      if (onProgress) onProgress(progress);
      console.log(`[UnityBridge] ${label}`);
    }

    this._instance = {
      /**
       * Equivalent to Unity's GameObject.Find(go).SendMessage(method, param).
       * Used to push data from JS into C# MonoBehaviour methods.
       */
      SendMessage: (gameObject, method, param) => {
        const key = `${gameObject}::${method}`;
        console.log(`[Unity SendMessage] ${key}`, param);
        const handler = this._handlers[key];
        if (handler) handler(param);
      },

      /** Graceful teardown — mirrors unityInstance.Quit() */
      Quit: () => {
        console.log('[UnityBridge] Unity session terminated');
        this._instance = null;
        this._ready = false;
      },
    };

    this._ready = true;
    this._readyCbs.forEach(cb => cb(this._instance));
    this._readyCbs = [];
    return this._instance;
  }

  // ---------------------------------------------------------------------------
  // JS → Unity messaging helpers
  // ---------------------------------------------------------------------------

  /**
   * Push a GPS fix into the Unity ARWaypointManager.
   * Equivalent to: unityInstance.SendMessage('ARManager', 'OnGPSUpdate', json)
   * Which triggers: ARWaypointManager.OnGPSUpdate(string json) in C#.
   */
  pushGPS(lat, lng, accuracy) {
    if (!this._instance) return;
    const payload = JSON.stringify({ lat, lng, accuracy });
    this._instance.SendMessage('ARManager', 'OnGPSUpdate', payload);
  }

  /**
   * Push compass heading into Unity.
   * Triggers: CompassService.OnHeadingUpdate(float degrees) in C#.
   */
  pushHeading(degrees) {
    if (!this._instance) return;
    this._instance.SendMessage('ARManager', 'OnHeadingUpdate', String(degrees));
  }

  // ---------------------------------------------------------------------------
  // Unity → JS callbacks (registered by the engine)
  // ---------------------------------------------------------------------------

  /**
   * Called by Unity (via jslib) when an AR object becomes visible.
   * Maps to: NotifyObjectVisible(char* waypointId) in WebXRBridge.jslib.
   */
  onObjectVisible(handler) {
    this._handlers['ARManager::NotifyObjectVisible'] = handler;
  }

  /**
   * Called by Unity when the user taps an AR object.
   * Maps to: NotifyObjectTapped(char* waypointId) in WebXRBridge.jslib.
   */
  onObjectTapped(handler) {
    this._handlers['ARManager::NotifyObjectTapped'] = handler;
  }

  onReady(cb) {
    if (this._ready) cb(this._instance);
    else this._readyCbs.push(cb);
  }

  // ---------------------------------------------------------------------------
  // Reference: Unity C# source (abridged inline — full files in /unity/)
  // ---------------------------------------------------------------------------

  /**
   * Returns the Unity C# scripts that would exist in the real project.
   * Useful for handing off to a Unity developer to build the real WASM binary.
   */
  static getReferenceScripts() {
    return {

      // ── GPSLocationService.cs ──────────────────────────────────────────────
      GPSLocationService: `
using UnityEngine;
using System.Runtime.InteropServices;

/// Bridges browser Geolocation API → Unity C# events via .jslib.
public class GPSLocationService : MonoBehaviour
{
    [DllImport("__Internal")] static extern void JS_StartGPSWatch();
    [DllImport("__Internal")] static extern void JS_StopGPSWatch();

    public static event System.Action<double, double, float> OnLocationUpdate;

    void OnEnable()  { JS_StartGPSWatch(); }
    void OnDisable() { JS_StopGPSWatch();  }

    // Called from JS: unityInstance.SendMessage('ARManager', 'OnGPSUpdate', json)
    public void OnGPSUpdate(string json)
    {
        var d = JsonUtility.FromJson<GPSData>(json);
        OnLocationUpdate?.Invoke(d.lat, d.lng, d.accuracy);
    }

    [System.Serializable] struct GPSData { public double lat, lng; public float accuracy; }
}`,

      // ── ARWaypointManager.cs ──────────────────────────────────────────────
      ARWaypointManager: `
using UnityEngine;
using System.Collections.Generic;

/// Instantiates AR prefabs at GPS waypoints when the user is within range.
public class ARWaypointManager : MonoBehaviour
{
    [SerializeField] ARWaypoint[]         waypoints;
    [SerializeField] float                triggerRadiusM = 50f;
    [SerializeField] Transform            arOrigin;       // ARSessionOrigin.transform

    readonly Dictionary<string, GameObject> _placed = new();
    double _userLat, _userLng;
    float  _headingDeg;

    void OnEnable()
    {
        GPSLocationService.OnLocationUpdate += OnGPSUpdate;
        CompassService.OnHeadingUpdate      += h => _headingDeg = h;
    }
    void OnDisable()
    {
        GPSLocationService.OnLocationUpdate -= OnGPSUpdate;
    }

    void OnGPSUpdate(double lat, double lng, float _)
    {
        _userLat = lat; _userLng = lng;
        foreach (var wp in waypoints)
        {
            float dist = GeoUtils.Distance(lat, lng, wp.latitude, wp.longitude);
            if (dist <= triggerRadiusM) PlaceWaypoint(wp);
            else                         RemoveWaypoint(wp.id);
        }
    }

    void PlaceWaypoint(ARWaypoint wp)
    {
        if (_placed.ContainsKey(wp.id)) { UpdatePosition(wp); return; }
        var pos = GeoUtils.ToARLocalPosition(_userLat, _userLng,
                                              wp.latitude, wp.longitude,
                                              _headingDeg);
        var go = Instantiate(wp.prefab, arOrigin);
        go.transform.localPosition = pos;
        _placed[wp.id] = go;
        JS_NotifyObjectVisible(wp.id);   // inform JS overlay
    }

    void UpdatePosition(ARWaypoint wp)
    {
        var pos = GeoUtils.ToARLocalPosition(_userLat, _userLng,
                                              wp.latitude, wp.longitude,
                                              _headingDeg);
        _placed[wp.id].transform.localPosition = pos;
    }

    void RemoveWaypoint(string id)
    {
        if (!_placed.TryGetValue(id, out var go)) return;
        Destroy(go);
        _placed.Remove(id);
    }

    [System.Runtime.InteropServices.DllImport("__Internal")]
    static extern void JS_NotifyObjectVisible(string id);
}`,

      // ── GeoUtils.cs ───────────────────────────────────────────────────────
      GeoUtils: `
using UnityEngine;

public static class GeoUtils
{
    const double R = 6_371_000; // Earth radius in metres

    public static float Distance(double lat1, double lng1, double lat2, double lng2)
    {
        double φ1 = lat1 * Mathf.Deg2Rad, φ2 = lat2 * Mathf.Deg2Rad;
        double Δφ = (lat2 - lat1) * Mathf.Deg2Rad;
        double Δλ = (lng2 - lng1) * Mathf.Deg2Rad;
        double a = System.Math.Sin(Δφ/2)*System.Math.Sin(Δφ/2)
                 + System.Math.Cos(φ1)*System.Math.Cos(φ2)
                   *System.Math.Sin(Δλ/2)*System.Math.Sin(Δλ/2);
        return (float)(R * 2 * System.Math.Atan2(System.Math.Sqrt(a), System.Math.Sqrt(1-a)));
    }

    /// Returns a position in AR local space (Unity's Y-up, -Z forward coordinate system).
    public static Vector3 ToARLocalPosition(
        double userLat, double userLng,
        double targetLat, double targetLng,
        float headingDeg,
        float elevationOffset = -1.5f)
    {
        double mPerDegLat = 111132;
        double mPerDegLng = 111132 * System.Math.Cos(userLat * Mathf.Deg2Rad);
        double northM = (targetLat - userLat) * mPerDegLat;
        double eastM  = (targetLng - userLng) * mPerDegLng;

        // Rotate by device heading so Unity's -Z aligns with geographic north
        float h = headingDeg * Mathf.Deg2Rad;
        float x = (float)( eastM * Mathf.Cos(h) - northM * Mathf.Sin(h));
        float z = (float)(-(eastM * Mathf.Sin(h) + northM * Mathf.Cos(h)));
        return new Vector3(x, elevationOffset, z);
    }
}`,

      // ── WebXRBridge.jslib ─────────────────────────────────────────────────
      WebXRBridgeJslib: `
// WebXRBridge.jslib — Unity JS native plugin
// Placed at: Assets/Plugins/WebGL/WebXRBridge.jslib
mergeInto(LibraryManager.library, {

    JS_StartGPSWatch: function () {
        if (!navigator.geolocation) return;
        window._mapcaskGPSId = navigator.geolocation.watchPosition(
            function (pos) {
                var json = JSON.stringify({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                });
                // Push GPS fix into Unity C# ARWaypointManager
                SendMessage('ARManager', 'OnGPSUpdate', json);
            },
            null,
            { enableHighAccuracy: true, maximumAge: 3000 }
        );
    },

    JS_StopGPSWatch: function () {
        if (window._mapcaskGPSId != null) {
            navigator.geolocation.clearWatch(window._mapcaskGPSId);
        }
    },

    // Called from C# to notify the JS overlay that an AR object is now visible
    JS_NotifyObjectVisible: function (idPtr) {
        var id = UTF8ToString(idPtr);
        window.dispatchEvent(
            new CustomEvent('mapcask:objectVisible', { detail: { id } })
        );
    },

    // Called from C# when the user taps an AR object (ARRaycast hit)
    JS_NotifyObjectTapped: function (idPtr) {
        var id = UTF8ToString(idPtr);
        window.dispatchEvent(
            new CustomEvent('mapcask:objectTapped', { detail: { id } })
        );
    }
});`,

      // ── ARWaypoint.cs (ScriptableObject) ─────────────────────────────────
      ARWaypoint: `
using UnityEngine;

[CreateAssetMenu(menuName = "MapCask/AR Waypoint")]
public class ARWaypoint : ScriptableObject
{
    public string      id;
    public string      displayName;
    public string      brand;
    public double      latitude;
    public double      longitude;
    public WaypointType type;
    public GameObject  prefab;
    [Range(10, 500)]
    public float       triggerRadiusMetres = 50f;
}

public enum WaypointType { BourbonFind, Speakeasy }`,

    }; // end getReferenceScripts()
  }
}
