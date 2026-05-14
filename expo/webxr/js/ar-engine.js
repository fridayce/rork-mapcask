'use strict';

/**
 * MapCaskAREngine — orchestrates GPS tracking, Unity WebGL bridge simulation,
 * WebXR AR session, and Three.js rendering into a single location-based AR experience.
 *
 * Flow:
 *   init(waypoints, onStatus)
 *     → load Three.js from CDN
 *     → boot UnityWebXRBridge (simulated Unity WebGL runtime)
 *     → acquire GPS fix + compass heading
 *     → build Three.js scene (lights, reticle, shadow map)
 *     → wait for user to call startARSession()
 *
 *   startARSession()
 *     → try WebXR immersive-ar (Chrome on Android 8+)
 *     → fallback: getUserMedia camera + Three.js overlay (Safari, desktop)
 *     → begin render loop
 *     → place AR objects for all waypoints within 200 m
 *
 *   Per GPS update:
 *     → push coordinates to Unity bridge
 *     → recalculate AR world positions for all placed objects
 *     → place/remove objects as user moves
 */
class MapCaskAREngine {
  constructor() {
    this.THREE = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    this.reticle = null;
    this.hitTestSource = null;
    this.xrSession = null;
    this.gpsTracker = new GPSTracker();
    this.unityBridge = new UnityWebXRBridge();
    this.objectFactory = null;

    this.waypoints = [];          // ARWaypoint-shaped objects from the server
    this.placedObjects = new Map(); // waypointId → THREE.Group
    this.userPosition = null;
    this.userHeading = 0;         // compass degrees
    this.statusCallback = () => {};
    this._fallbackVideo = null;
    this._isFallback = false;
  }

  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------

  /**
   * Initialise engine. Must be called before startARSession().
   * @param {object[]} waypoints  — array of { id, name, brand, price, latitude, longitude, type }
   * @param {function} onStatus   — receives human-readable status strings
   */
  async init(waypoints, onStatus) {
    this.waypoints = waypoints;
    this.statusCallback = onStatus || (() => {});

    this.statusCallback('Loading 3D engine…');
    await this._loadThreeJS();
    this.objectFactory = new ARObjectFactory(this.THREE);

    this.statusCallback('Booting Unity WebGL runtime…');
    await this.unityBridge.createUnityInstance(null, {}, (p) => {
      this.statusCallback(`Unity WebGL: ${Math.round(p * 100)}%`);
    });

    // Listen for Unity-side AR object events (forwarded by UnityWebXRBridge)
    this.unityBridge.onObjectVisible((id) => this._handleObjectVisible(id));
    this.unityBridge.onObjectTapped((id)   => this._handleObjectTapped(id));

    this.statusCallback('Requesting GPS…');
    this.gpsTracker.onPosition((pos) => this._onGPSUpdate(pos));
    this.gpsTracker.onHeading((deg)  => { this.userHeading = deg; this._updateCompassUI(deg); });

    try {
      this.userPosition = await this.gpsTracker.start();
      this._updateHUD();
    } catch (err) {
      this.statusCallback('GPS denied — using demo position (Louisville, KY)');
      // Fallback so the demo still works at a desk
      this.userPosition = { latitude: 38.2527, longitude: -85.7585, accuracy: 999 };
    }

    try {
      await this.gpsTracker.startCompass();
    } catch {
      // Compass is optional; objects will still appear, just not direction-corrected
    }

    this._initThreeScene();
    this.statusCallback('Ready — tap "Start AR" to begin');
  }

  // ---------------------------------------------------------------------------
  // AR Session
  // ---------------------------------------------------------------------------

  async startARSession() {
    const webXRAvailable = navigator.xr &&
      await navigator.xr.isSessionSupported('immersive-ar').catch(() => false);

    if (webXRAvailable) {
      await this._startWebXRSession();
    } else {
      this._startCameraFallback();
    }

    this._placeAllNearbyObjects();
  }

  async _startWebXRSession() {
    this.statusCallback('Starting WebXR AR session…');

    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'light-estimation', 'anchors'],
      domOverlay: { root: document.getElementById('ar-overlay') },
    };

    try {
      this.xrSession = await navigator.xr.requestSession('immersive-ar', sessionInit);
    } catch (err) {
      console.warn('[AREngine] WebXR session request failed:', err);
      this._startCameraFallback();
      return;
    }

    this.renderer.xr.setReferenceSpaceType('local');
    await this.renderer.xr.setSession(this.xrSession);
    this.xrSession.addEventListener('end', () => this._onXRSessionEnd());

    // Hit-test source for surface reticle (ground plane detection)
    try {
      const viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
      this.hitTestSource = await this.xrSession.requestHitTestSource({ space: viewerSpace });
    } catch {
      // Hit-test is optional — reticle just won't appear
    }

    this.renderer.setAnimationLoop((time, frame) => this._onXRFrame(time, frame));
    this.statusCallback('WebXR AR session active');
    this._setUIState('active');
  }

  _startCameraFallback() {
    this._isFallback = true;
    this.statusCallback('WebXR unavailable — camera passthrough mode');

    // Create a full-screen <video> element fed by the rear camera
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');   // required on iOS to prevent fullscreen hijack
    video.setAttribute('muted', '');
    video.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'object-fit:cover', 'z-index:0',
    ].join(';');
    document.body.prepend(video);
    this._fallbackVideo = video;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => { video.srcObject = stream; })
      .catch(() => this.statusCallback('Camera permission denied'));

    // Three.js canvas sits above the video, transparent background
    this.renderer.domElement.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'z-index:1', 'pointer-events:none',
    ].join(';');

    // DeviceOrientation drives the camera in fallback mode
    window.addEventListener('deviceorientation', (e) => this._applyOrientationToCamera(e));

    this.renderer.setAnimationLoop((time) => this._onFallbackFrame(time));
    this._setUIState('active');
  }

  // ---------------------------------------------------------------------------
  // Three.js scene setup
  // ---------------------------------------------------------------------------

  _initThreeScene() {
    const T = this.THREE;

    this.scene = new T.Scene();
    this.clock = new T.Clock();
    this.camera = new T.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 500);

    this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;

    const container = document.getElementById('ar-canvas-container');
    if (container) container.appendChild(this.renderer.domElement);

    // Lighting
    const ambient = new T.AmbientLight(0xffffff, 0.65);
    const sun = new T.DirectionalLight(0xfff4e0, 1.3);
    sun.position.set(4, 10, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(ambient, sun);

    // Ground-plane reticle (shown where hit-test finds a surface)
    const reticleGeo = new T.RingGeometry(0.12, 0.145, 36);
    const reticleMat = new T.MeshBasicMaterial({ color: 0xE8922A, side: T.DoubleSide });
    this.reticle = new T.Mesh(reticleGeo, reticleMat);
    this.reticle.matrixAutoUpdate = false;
    this.reticle.rotation.x = -Math.PI / 2;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ---------------------------------------------------------------------------
  // Render loops
  // ---------------------------------------------------------------------------

  _onXRFrame(time, frame) {
    const t = time / 1000;

    // Surface hit-test → reticle
    if (frame && this.hitTestSource) {
      const refSpace = this.renderer.xr.getReferenceSpace();
      const hits = frame.getHitTestResults(this.hitTestSource);
      if (hits.length > 0) {
        const pose = hits[0].getPose(refSpace);
        if (pose) {
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(pose.transform.matrix);
        }
      } else {
        this.reticle.visible = false;
      }
    }

    if (this.objectFactory) this.objectFactory.animate(this.scene, t);
    this.renderer.render(this.scene, this.camera);
    this._updateProximityHUD();
  }

  _onFallbackFrame(time) {
    const t = time / 1000;
    if (this.objectFactory) this.objectFactory.animate(this.scene, t);
    this.renderer.render(this.scene, this.camera);
    this._updateProximityHUD();
  }

  // Crude device-orientation camera control for fallback mode
  _applyOrientationToCamera(event) {
    if (!this.camera || this._isFallback === false) return;
    const beta  = (event.beta  || 0) * Math.PI / 180;
    const gamma = (event.gamma || 0) * Math.PI / 180;
    this.camera.rotation.x = beta - Math.PI / 2;
    this.camera.rotation.z = -gamma;
  }

  _onXRSessionEnd() {
    this.xrSession = null;
    this.hitTestSource = null;
    this.renderer.setAnimationLoop(null);
    this._setUIState('ended');
  }

  // ---------------------------------------------------------------------------
  // GPS-driven object placement
  // ---------------------------------------------------------------------------

  _onGPSUpdate(pos) {
    this.userPosition = pos;
    this.unityBridge.pushGPS(pos.latitude, pos.longitude, pos.accuracy);
    this._updatePlacedObjects();
    this._updateHUD();
  }

  _placeAllNearbyObjects() {
    if (!this.userPosition) return;
    this.waypoints.forEach(wp => {
      const dist = GPSTracker.distanceBetween(
        this.userPosition.latitude, this.userPosition.longitude,
        wp.latitude, wp.longitude
      );
      if (dist <= 200) this._placeObject(wp, dist);
    });
  }

  _updatePlacedObjects() {
    if (!this.userPosition) return;
    this.waypoints.forEach(wp => {
      const dist = GPSTracker.distanceBetween(
        this.userPosition.latitude, this.userPosition.longitude,
        wp.latitude, wp.longitude
      );
      if (dist <= 200 && !this.placedObjects.has(wp.id)) {
        this._placeObject(wp, dist);
      } else if (dist > 260 && this.placedObjects.has(wp.id)) {
        this._removeObject(wp.id);
      } else if (this.placedObjects.has(wp.id)) {
        this._repositionObject(wp);    // update position as user moves
      }
    });
  }

  _placeObject(wp, dist) {
    const arPos = GPSTracker.gpsToARPosition(
      this.userPosition.latitude, this.userPosition.longitude,
      wp.latitude, wp.longitude,
      this.userHeading,
      -1.5  // float just below eye level
    );

    let obj;
    if (wp.type === 'bourbon') {
      obj = this.objectFactory.createBourbonBottle(wp.name, wp.brand || '', wp.price);
    } else {
      obj = this.objectFactory.createLocationPin(wp.name, 0x457B9D);
    }

    obj.position.set(arPos.x, arPos.y, arPos.z);
    obj.userData.baseY  = arPos.y;
    obj.userData.phase  = Math.random() * Math.PI * 2;
    obj.userData.waypointId = wp.id;

    this.scene.add(obj);
    this.placedObjects.set(wp.id, obj);
    this._showProximityAlert(wp, dist);
    this._updateObjectCount();
  }

  _repositionObject(wp) {
    const obj = this.placedObjects.get(wp.id);
    if (!obj || !this.userPosition) return;
    const arPos = GPSTracker.gpsToARPosition(
      this.userPosition.latitude, this.userPosition.longitude,
      wp.latitude, wp.longitude,
      this.userHeading, -1.5
    );
    obj.position.x = arPos.x;
    obj.position.z = arPos.z;
    obj.userData.baseY = arPos.y;
  }

  _removeObject(id) {
    const obj = this.placedObjects.get(id);
    if (!obj) return;
    // Dispose geometries and materials to avoid memory leaks
    obj.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
    this.scene.remove(obj);
    this.placedObjects.delete(id);
    this._updateObjectCount();
  }

  // ---------------------------------------------------------------------------
  // Unity bridge callbacks
  // ---------------------------------------------------------------------------

  _handleObjectVisible(id) {
    const wp = this.waypoints.find(w => w.id === id);
    if (!wp) return;
    const dist = this.userPosition
      ? GPSTracker.distanceBetween(
          this.userPosition.latitude, this.userPosition.longitude,
          wp.latitude, wp.longitude)
      : 0;
    this._showProximityAlert(wp, dist);
  }

  _handleObjectTapped(id) {
    const wp = this.waypoints.find(w => w.id === id);
    if (!wp) return;
    this._showInfoPanel(wp);
  }

  // ---------------------------------------------------------------------------
  // UI helpers
  // ---------------------------------------------------------------------------

  _updateHUD() {
    const pos = this.userPosition;
    if (!pos) return;
    const el = document.getElementById('hud-gps');
    if (el) {
      el.textContent =
        `${pos.latitude.toFixed(5)}, ${pos.longitude.toFixed(5)} ±${Math.round(pos.accuracy)}m`;
    }
  }

  _updateCompassUI(deg) {
    const needle = document.getElementById('compass-needle');
    if (needle) needle.style.transform = `rotate(${deg}deg)`;
    const label = document.getElementById('hud-heading');
    if (label) label.textContent = `${Math.round(deg)}°`;
  }

  _updateProximityHUD() {
    if (!this.userPosition) return;
    const nearest = this._nearestWaypoint();
    const el = document.getElementById('hud-nearest');
    if (el && nearest) {
      el.textContent = `${nearest.wp.name}  —  ${GPSTracker.formatDistance(nearest.dist)}`;
    }
  }

  _updateObjectCount() {
    const el = document.getElementById('hud-object-count');
    if (el) el.textContent = `${this.placedObjects.size} AR object${this.placedObjects.size !== 1 ? 's' : ''} visible`;
  }

  _nearestWaypoint() {
    if (!this.userPosition) return null;
    let nearest = null;
    this.waypoints.forEach(wp => {
      const dist = GPSTracker.distanceBetween(
        this.userPosition.latitude, this.userPosition.longitude,
        wp.latitude, wp.longitude
      );
      if (!nearest || dist < nearest.dist) nearest = { wp, dist };
    });
    return nearest;
  }

  _showProximityAlert(wp, dist) {
    const el = document.getElementById('proximity-alert');
    if (!el) return;
    const icon = wp.type === 'bourbon' ? '🥃' : '📍';
    el.innerHTML = `
      <span class="alert-icon">${icon}</span>
      <div class="alert-body">
        <strong>${wp.name}</strong>
        <span>${GPSTracker.formatDistance(dist)} away — AR object placed!</span>
      </div>`;
    el.classList.add('visible');
    clearTimeout(this._alertTimer);
    this._alertTimer = setTimeout(() => el.classList.remove('visible'), 4500);
  }

  _showInfoPanel(wp) {
    const panel = document.getElementById('info-panel');
    if (!panel) return;
    const dist = this.userPosition
      ? GPSTracker.formatDistance(GPSTracker.distanceBetween(
          this.userPosition.latitude, this.userPosition.longitude,
          wp.latitude, wp.longitude))
      : '—';
    panel.innerHTML = `
      <button class="panel-close" onclick="document.getElementById('info-panel').classList.remove('visible')">✕</button>
      <div class="panel-icon">${wp.type === 'bourbon' ? '🥃' : '📍'}</div>
      <h2 class="panel-title">${wp.name}</h2>
      ${wp.brand ? `<p class="panel-brand">${wp.brand}</p>` : ''}
      ${wp.price ? `<p class="panel-price">$${Number(wp.price).toFixed(2)}</p>` : ''}
      <p class="panel-distance">${dist} from you</p>
      ${wp.description ? `<p class="panel-desc">${wp.description}</p>` : ''}`;
    panel.classList.add('visible');
  }

  _setUIState(state) {
    const launchBtn = document.getElementById('btn-start-ar');
    const statusEl  = document.getElementById('ar-status-text');
    if (state === 'active') {
      if (launchBtn) launchBtn.style.display = 'none';
      if (statusEl)  statusEl.style.display  = 'none';
    } else if (state === 'ended') {
      if (launchBtn) { launchBtn.style.display = ''; launchBtn.textContent = 'Restart AR'; }
      if (statusEl)  { statusEl.style.display = ''; statusEl.textContent = 'Session ended'; }
    }
  }

  // ---------------------------------------------------------------------------
  // Three.js CDN loader
  // ---------------------------------------------------------------------------

  _loadThreeJS() {
    return new Promise((resolve, reject) => {
      if (window.THREE) { this.THREE = window.THREE; resolve(); return; }
      const s = document.createElement('script');
      // Three.js r160 — matches the version expected by WebXR Export package's JS shims
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r160/three.min.js';
      s.crossOrigin = 'anonymous';
      s.onload  = () => { this.THREE = window.THREE; resolve(); };
      s.onerror = () => reject(new Error('Failed to load Three.js from CDN'));
      document.head.appendChild(s);
    });
  }

  // ---------------------------------------------------------------------------
  // Teardown
  // ---------------------------------------------------------------------------

  destroy() {
    this.gpsTracker.stop();
    if (this.xrSession) { this.xrSession.end(); }
    if (this.renderer)  { this.renderer.setAnimationLoop(null); this.renderer.dispose(); }
    if (this._fallbackVideo && this._fallbackVideo.srcObject) {
      this._fallbackVideo.srcObject.getTracks().forEach(t => t.stop());
    }
    this.placedObjects.forEach((_, id) => this._removeObject(id));
  }
}
