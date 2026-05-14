// ARSessionManager.cs
// Attach to: GameObjects/ARManager in the scene hierarchy.
//
// Boots the WebXR AR session via the WebXR Export package
// (github.com/De-Panther/unity-webxr-export) and wires up
// AR Foundation's ARSession to the WebXR frame loop.
//
// Required packages:
//   com.de-panther.webxr          (WebXR Export)
//   com.unity.xr.arfoundation     (AR Foundation 5.x)
//   com.unity.xr.arcore           (ARCore XR Plugin — desktop/editor only)

using UnityEngine;
using WebXR;

[RequireComponent(typeof(ARSessionOriginManager))]
public class ARSessionManager : MonoBehaviour
{
    [Header("WebXR")]
    [SerializeField] WebXRManager webXRManager;

    [Header("AR Foundation")]
    [SerializeField] UnityEngine.XR.ARFoundation.ARSession arSession;

    void Start()
    {
        // Subscribe to WebXR state changes (entered/exited immersive-ar session)
        WebXRManager.OnXRChange += OnXRChange;
    }

    void OnDestroy()
    {
        WebXRManager.OnXRChange -= OnXRChange;
    }

    void OnXRChange(WebXRState state, int viewsCount, Rect leftRect, Rect rightRect)
    {
        switch (state)
        {
            case WebXRState.AR:
                // WebXR immersive-ar session is now active
                // AR Foundation subsystems (plane detection, raycasting, etc.) are live
                Debug.Log("[ARSession] WebXR AR session started");
                break;

            case WebXRState.NORMAL:
                // Returned to normal (non-immersive) browser context
                Debug.Log("[ARSession] WebXR session ended, returning to 2D mode");
                break;
        }
    }

    /// Called from the "Start AR" button in the DOM overlay via JS:
    ///   unityInstance.SendMessage('ARManager', 'RequestARSession', '')
    public void RequestARSession(string _)
    {
        webXRManager.ToggleAR();
    }
}
