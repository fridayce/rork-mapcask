// ARObjectController.cs
// Attach to (or auto-added to) each instantiated AR waypoint prefab root.
//
// Responsibilities:
//   - Float + rotate animation (mirrors ar-objects.js behaviour in the PoC)
//   - Distance-based opacity fade (visible within triggerRadius, fades at edge)
//   - ARRaycast tap detection → calls OnTapped callback
//   - Smooth fade-in on spawn

using UnityEngine;
using System.Collections;
using UnityEngine.XR.ARFoundation;

[RequireComponent(typeof(Renderer))]
public class ARObjectController : MonoBehaviour
{
    [HideInInspector] public string             waypointId;
    [HideInInspector] public System.Action      OnTapped;

    [Header("Float animation")]
    [SerializeField] float floatAmplitude = 0.06f;   // metres
    [SerializeField] float floatFrequency = 1.2f;    // Hz
    [SerializeField] float rotateSpeed    = 0.35f;   // rad/s

    [Header("Fade")]
    [SerializeField] float fadeInDuration = 0.6f;

    Renderer[]  _renderers;
    float       _spawnTime;
    float       _baseY;
    float       _phase;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    void Awake()
    {
        _renderers = GetComponentsInChildren<Renderer>();
        _spawnTime = Time.time;
        _baseY     = transform.localPosition.y;
        _phase     = Random.value * Mathf.PI * 2f;

        SetAlpha(0f);
        StartCoroutine(FadeIn());
    }

    void Update()
    {
        float t = Time.time;

        // Float
        var pos = transform.localPosition;
        pos.y = _baseY + Mathf.Sin(t * floatFrequency * Mathf.PI * 2f + _phase) * floatAmplitude;
        transform.localPosition = pos;

        // Rotate around Y
        transform.Rotate(Vector3.up, rotateSpeed * Mathf.Rad2Deg * Time.deltaTime, Space.World);
    }

    // ── Tap detection (called by ARRaycastManager in ARWaypointManager or
    //    by an InputSystem action mapped to screen tap) ─────────────────────

    public void HandleTap()
    {
        OnTapped?.Invoke();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    IEnumerator FadeIn()
    {
        float elapsed = 0f;
        while (elapsed < fadeInDuration)
        {
            elapsed += Time.deltaTime;
            SetAlpha(Mathf.Clamp01(elapsed / fadeInDuration));
            yield return null;
        }
        SetAlpha(1f);
    }

    void SetAlpha(float a)
    {
        foreach (var r in _renderers)
        {
            foreach (var mat in r.materials)
            {
                var c = mat.color;
                c.a = a;
                mat.color = c;
            }
        }
    }
}
