// CompassService.cs
// Attach to: GameObjects/ARManager alongside GPSLocationService.
//
// On WebGL: the browser fires DeviceOrientationEvent; a JS handler in
//   WebXRBridge.jslib sends heading updates via SendMessage.
// On native: reads Input.compass.trueHeading each frame.

using UnityEngine;
using System.Runtime.InteropServices;

public class CompassService : MonoBehaviour
{
    /// Fired with compass heading in degrees (0 = north, clockwise).
    public static event System.Action<float> OnHeadingUpdate;

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] static extern void JS_StartCompassWatch();
    [DllImport("__Internal")] static extern void JS_StopCompassWatch();
#endif

    float _lastHeading = -1f;

    void OnEnable()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        JS_StartCompassWatch();
#else
        Input.compass.enabled = true;
#endif
    }

    void OnDisable()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        JS_StopCompassWatch();
#else
        Input.compass.enabled = false;
#endif
    }

#if !UNITY_WEBGL || UNITY_EDITOR
    void Update()
    {
        float heading = Input.compass.trueHeading;
        // Only fire if heading changed by > 1° to avoid noisy updates
        if (Mathf.Abs(heading - _lastHeading) > 1f)
        {
            _lastHeading = heading;
            OnHeadingUpdate?.Invoke(heading);
        }
    }
#endif

    /// Called from JS: unityInstance.SendMessage('ARManager', 'OnHeadingUpdate', '270.5')
    public void OnHeadingUpdate(string degrees)
    {
        if (float.TryParse(degrees, System.Globalization.NumberStyles.Float,
                           System.Globalization.CultureInfo.InvariantCulture, out float h))
        {
            OnHeadingUpdate?.Invoke(h);
        }
    }
}
