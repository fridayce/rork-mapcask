// ARWaypoint.cs — ScriptableObject that holds per-location AR configuration.
//
// Create via:  Assets → Create → MapCask → AR Waypoint
//
// Each asset corresponds to one BourbonFind or Speakeasy from the API.
// The id field must match the server-side entity id so JS overlay callbacks
// can look up the full record.

using UnityEngine;

[CreateAssetMenu(menuName = "MapCask/AR Waypoint", fileName = "NewARWaypoint")]
public class ARWaypoint : ScriptableObject
{
    [Header("Identity")]
    public string id;                  // matches BourbonFind.id or Speakeasy.id
    public string displayName;
    public string brand;               // empty for speakeasies
    public WaypointType type;

    [Header("GPS")]
    public double latitude;
    public double longitude;

    [Header("Trigger")]
    [Tooltip("Distance in metres at which the AR object appears")]
    [Range(10f, 500f)]
    public float triggerRadiusMetres = 50f;

    [Header("Prefab")]
    [Tooltip("Root GameObject instantiated at this location")]
    public GameObject prefab;

    [Header("Optional")]
    [TextArea(2, 4)]
    public string description;
    public float  price;               // 0 = no price label
}

public enum WaypointType
{
    BourbonFind,   // amber bottle prefab
    Speakeasy,     // location pin prefab
}
