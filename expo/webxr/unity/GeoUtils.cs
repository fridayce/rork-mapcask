// GeoUtils.cs — static GPS geometry utilities used by ARWaypointManager.
//
// All methods use double precision for GPS coordinates; intermediate
// calculations are done in double even when the return type is float,
// because single-precision latitude differences lose accuracy at scale.

using UnityEngine;

public static class GeoUtils
{
    const double EarthRadiusM = 6_371_000.0;

    // ── Distance ─────────────────────────────────────────────────────────────

    /// Haversine great-circle distance in metres between two GPS coordinates.
    public static float Distance(double lat1, double lng1, double lat2, double lng2)
    {
        double φ1 = lat1 * Mathf.Deg2Rad;
        double φ2 = lat2 * Mathf.Deg2Rad;
        double Δφ = (lat2 - lat1) * Mathf.Deg2Rad;
        double Δλ = (lng2 - lng1) * Mathf.Deg2Rad;

        double a = System.Math.Sin(Δφ / 2) * System.Math.Sin(Δφ / 2)
                 + System.Math.Cos(φ1) * System.Math.Cos(φ2)
                   * System.Math.Sin(Δλ / 2) * System.Math.Sin(Δλ / 2);

        return (float)(EarthRadiusM * 2.0 * System.Math.Atan2(System.Math.Sqrt(a), System.Math.Sqrt(1 - a)));
    }

    // ── Bearing ───────────────────────────────────────────────────────────────

    /// Initial bearing from A → B in degrees (0 = north, clockwise).
    public static float Bearing(double lat1, double lng1, double lat2, double lng2)
    {
        double φ1 = lat1 * Mathf.Deg2Rad;
        double φ2 = lat2 * Mathf.Deg2Rad;
        double Δλ = (lng2 - lng1) * Mathf.Deg2Rad;

        double y = System.Math.Sin(Δλ) * System.Math.Cos(φ2);
        double x = System.Math.Cos(φ1) * System.Math.Sin(φ2)
                 - System.Math.Sin(φ1) * System.Math.Cos(φ2) * System.Math.Cos(Δλ);

        return (float)(((System.Math.Atan2(y, x) * Mathf.Rad2Deg) + 360.0) % 360.0);
    }

    // ── GPS → AR local position ───────────────────────────────────────────────

    /// Convert a GPS target into a Unity local-space position relative to the user.
    ///
    /// Unity coordinate system: X right (east), Y up, Z forward (-Z is into screen).
    /// In AR Foundation's ARSessionOrigin, the session origin is wherever the device
    /// started the AR session. We compute a flat-earth offset in metres, then rotate
    /// it by the device heading so Unity's -Z axis aligns with geographic north.
    ///
    /// <param name="userLat">User latitude</param>
    /// <param name="userLng">User longitude</param>
    /// <param name="targetLat">Target latitude</param>
    /// <param name="targetLng">Target longitude</param>
    /// <param name="headingDeg">Device compass heading (0=north, CW)</param>
    /// <param name="elevationOffset">Y offset from eye level in metres (default −1.5)</param>
    public static Vector3 ToARLocalPosition(
        double userLat,    double userLng,
        double targetLat,  double targetLng,
        float  headingDeg,
        float  elevationOffset = -1.5f)
    {
        // Equirectangular approximation — accurate within ≈ 10 km
        double mPerDegLat = 111132.0;
        double mPerDegLng = 111132.0 * System.Math.Cos(userLat * Mathf.Deg2Rad);

        double northM = (targetLat - userLat) * mPerDegLat;
        double eastM  = (targetLng - userLng) * mPerDegLng;

        // Rotate by heading: Unity's -Z should face real-world north
        double h = headingDeg * Mathf.Deg2Rad;
        float x = (float)( eastM * System.Math.Cos(h) - northM * System.Math.Sin(h));
        float z = (float)(-(eastM * System.Math.Sin(h) + northM * System.Math.Cos(h)));

        return new Vector3(x, elevationOffset, z);
    }
}
