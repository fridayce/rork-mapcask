// ARWaypointManager.cs
// Attach to: GameObjects/ARManager
//
// Core logic: subscribes to GPS updates and instantiates/destroys AR prefabs
// when the user enters/leaves each waypoint's trigger radius.
//
// All placed objects are children of the ARSessionOrigin transform so they
// stay anchored in world space across WebXR frame updates.

using UnityEngine;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine.XR.ARFoundation;

public class ARWaypointManager : MonoBehaviour
{
    [Header("Waypoints")]
    [SerializeField] ARWaypoint[] waypoints;
    [SerializeField] float        globalTriggerRadiusOverride = 0f; // 0 = use per-waypoint value

    [Header("AR Scene")]
    [SerializeField] ARSessionOrigin sessionOrigin;
    [SerializeField] ARAnchorManager anchorManager;          // optional — for spatial anchors

    // ── JS callbacks ──────────────────────────────────────────────────────────
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] static extern void JS_NotifyObjectVisible(string id);
    [DllImport("__Internal")] static extern void JS_NotifyObjectTapped(string id);
#else
    static void JS_NotifyObjectVisible(string id) => Debug.Log($"[ARManager] Visible: {id}");
    static void JS_NotifyObjectTapped(string id)  => Debug.Log($"[ARManager] Tapped:  {id}");
#endif

    // ── State ─────────────────────────────────────────────────────────────────
    readonly Dictionary<string, GameObject> _placed = new();
    double _userLat, _userLng;
    float  _headingDeg;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    void OnEnable()
    {
        GPSLocationService.OnLocationUpdate += OnGPSUpdate;
        CompassService.OnHeadingUpdate      += OnHeadingUpdate;
    }

    void OnDisable()
    {
        GPSLocationService.OnLocationUpdate -= OnGPSUpdate;
        CompassService.OnHeadingUpdate      -= OnHeadingUpdate;
    }

    // ── GPS / compass callbacks ───────────────────────────────────────────────

    void OnGPSUpdate(double lat, double lng, float _accuracy)
    {
        _userLat = lat;
        _userLng = lng;
        EvaluateWaypoints();
    }

    void OnHeadingUpdate(float degrees)
    {
        _headingDeg = degrees;
        // Re-position already-placed objects so they track heading changes
        foreach (var wp in waypoints)
        {
            if (!_placed.TryGetValue(wp.id, out var go)) continue;
            go.transform.localPosition =
                GeoUtils.ToARLocalPosition(_userLat, _userLng, wp.latitude, wp.longitude, _headingDeg);
        }
    }

    // Called from JS when SendMessage('ARManager', 'OnGPSUpdate', json) is received
    // (GPSLocationService forwards this; duplicated here for direct JS callers)
    public void OnGPSUpdateJson(string json)
    {
        var d = JsonUtility.FromJson<GPSPayload>(json);
        OnGPSUpdate(d.lat, d.lng, d.accuracy);
    }

    public void OnHeadingUpdateString(string degrees)
    {
        if (float.TryParse(degrees, out float h)) OnHeadingUpdate(h);
    }

    // ── Waypoint evaluation ───────────────────────────────────────────────────

    void EvaluateWaypoints()
    {
        foreach (var wp in waypoints)
        {
            float radius = globalTriggerRadiusOverride > 0
                ? globalTriggerRadiusOverride
                : wp.triggerRadiusMetres;

            float dist = GeoUtils.Distance(_userLat, _userLng, wp.latitude, wp.longitude);

            if (dist <= radius)
                PlaceWaypoint(wp);
            else if (dist > radius * 1.25f)   // 25 % hysteresis to prevent flicker
                RemoveWaypoint(wp.id);
            else if (_placed.ContainsKey(wp.id))
                UpdateWaypointPosition(wp);
        }
    }

    void PlaceWaypoint(ARWaypoint wp)
    {
        if (_placed.ContainsKey(wp.id))
        {
            UpdateWaypointPosition(wp);
            return;
        }

        var localPos = GeoUtils.ToARLocalPosition(
            _userLat, _userLng, wp.latitude, wp.longitude, _headingDeg);

        var go = Instantiate(wp.prefab, sessionOrigin.transform);
        go.transform.localPosition = localPos;
        go.name = $"ARWaypoint_{wp.id}";

        // Tag for tap detection in ARObjectController
        var controller = go.GetComponent<ARObjectController>() ?? go.AddComponent<ARObjectController>();
        controller.waypointId = wp.id;
        controller.OnTapped   = () => JS_NotifyObjectTapped(wp.id);

        _placed[wp.id] = go;
        JS_NotifyObjectVisible(wp.id);
    }

    void UpdateWaypointPosition(ARWaypoint wp)
    {
        if (!_placed.TryGetValue(wp.id, out var go)) return;
        go.transform.localPosition =
            GeoUtils.ToARLocalPosition(_userLat, _userLng, wp.latitude, wp.longitude, _headingDeg);
    }

    void RemoveWaypoint(string id)
    {
        if (!_placed.TryGetValue(id, out var go)) return;
        Destroy(go);
        _placed.Remove(id);
    }

    [System.Serializable]
    struct GPSPayload { public double lat, lng; public float accuracy; }
}
