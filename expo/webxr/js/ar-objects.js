'use strict';

/**
 * ARObjectFactory — builds Three.js scene objects for MapCask AR waypoints.
 *
 * In a real Unity WebGL build these would be Unity GameObjects/Prefabs rendered
 * by Unity's rendering pipeline. Here we recreate them with Three.js so the
 * PoC works without a Unity runtime.
 *
 * Object types:
 *   createBourbonBottle(name, brand, price)  — amber bottle with glow + label
 *   createLocationPin(label, color)           — 3D map pin for speakeasies
 *
 * All returned objects have:
 *   userData.type         — 'bourbon' | 'speakeasy'
 *   userData.animating    — true (drives per-frame animation)
 *   userData.baseY        — set by caller after positioning
 *   userData.phase        — random phase offset for natural staggering
 */
class ARObjectFactory {
  /**
   * @param {typeof THREE} THREE — the global Three.js namespace
   */
  constructor(THREE) {
    this.THREE = THREE;
  }

  // ---------------------------------------------------------------------------
  // Public object builders
  // ---------------------------------------------------------------------------

  /**
   * Amber glass bourbon bottle with floating info card and pulsing ground ring.
   */
  createBourbonBottle(name, brand, price) {
    const T = this.THREE;
    const group = new T.Group();

    // Bottle body — wide lower half
    const bodyGeo = new T.CylinderGeometry(0.085, 0.105, 0.38, 18);
    const glassMat = new T.MeshPhysicalMaterial({
      color: 0xD4790A,
      emissive: 0x4A1F00,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.82,
      roughness: 0.08,
      metalness: 0.0,
      transmission: 0.55,
      ior: 1.5,
    });
    const body = new T.Mesh(bodyGeo, glassMat);
    body.position.y = 0.19;
    body.castShadow = true;

    // Shoulder taper
    const shoulderGeo = new T.CylinderGeometry(0.055, 0.085, 0.12, 14);
    const shoulder = new T.Mesh(shoulderGeo, glassMat);
    shoulder.position.y = 0.44;

    // Neck
    const neckGeo = new T.CylinderGeometry(0.032, 0.055, 0.18, 10);
    const neck = new T.Mesh(neckGeo, glassMat);
    neck.position.y = 0.59;

    // Cork
    const corkGeo = new T.CylinderGeometry(0.033, 0.033, 0.055, 8);
    const corkMat = new T.MeshStandardMaterial({ color: 0x7A4A28, roughness: 0.9 });
    const cork = new T.Mesh(corkGeo, corkMat);
    cork.position.y = 0.70;

    // Interior liquid fill (darker amber inside)
    const liquidGeo = new T.CylinderGeometry(0.075, 0.095, 0.30, 16);
    const liquidMat = new T.MeshStandardMaterial({
      color: 0x8B3E00,
      transparent: true,
      opacity: 0.7,
    });
    const liquid = new T.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.16;

    // Warm amber point light for glow effect
    const bottleGlow = new T.PointLight(0xE8922A, 1.8, 1.6);
    bottleGlow.position.y = 0.3;

    group.add(liquid, body, shoulder, neck, cork, bottleGlow);

    // Floating info label sprite
    const label = this._createBottleLabel(name, brand, price);
    label.position.y = 1.05;
    group.add(label);

    // Ground ring
    group.add(this._createPulsingRing(0xE8922A));

    group.userData = { type: 'bourbon', name, brand, price, animating: true };
    return group;
  }

  /**
   * 3D location pin (sphere + cone) for speakeasy markers.
   */
  createLocationPin(label, color = 0x457B9D) {
    const T = this.THREE;
    const group = new T.Group();

    const mat = new T.MeshPhysicalMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.25,
    });

    // Pin head (sphere)
    const headGeo = new T.SphereGeometry(0.13, 20, 20);
    const head = new T.Mesh(headGeo, mat);
    head.position.y = 0.13;
    head.castShadow = true;

    // Highlight dot on sphere
    const dotGeo = new T.SphereGeometry(0.04, 8, 8);
    const dotMat = new T.MeshBasicMaterial({ color: 0xffffff });
    const dot = new T.Mesh(dotGeo, dotMat);
    dot.position.set(0.06, 0.19, 0.11);
    head.add(dot);

    // Pin spike (cone pointing down)
    const spikeGeo = new T.ConeGeometry(0.07, 0.22, 10);
    const spike = new T.Mesh(spikeGeo, mat);
    spike.rotation.z = Math.PI;
    spike.position.y = -0.11;

    // Glow
    const pinGlow = new T.PointLight(color, 1.2, 1.3);
    pinGlow.position.y = 0.13;

    group.add(head, spike, pinGlow);

    // Label sprite above pin
    const textSprite = this._createPinLabel(label, color);
    textSprite.position.y = 0.6;
    group.add(textSprite);

    // Ground ring (blue-ish)
    group.add(this._createPulsingRing(color));

    group.userData = { type: 'speakeasy', label, animating: true };
    return group;
  }

  // ---------------------------------------------------------------------------
  // Per-frame animation — called from the render loop
  // ---------------------------------------------------------------------------

  /**
   * Animate all objects in the scene that have userData.animating = true.
   * @param {THREE.Scene} scene
   * @param {number} t  elapsed time in seconds
   */
  animate(scene, t) {
    scene.traverse((obj) => {
      // Float + slow rotation for top-level waypoint objects
      if (obj.userData.animating && obj.userData.type) {
        const phase = obj.userData.phase || 0;
        const baseY = obj.userData.baseY || 0;
        obj.position.y = baseY + Math.sin(t * 1.2 + phase) * 0.06;
        obj.rotation.y = t * 0.35 + phase;
      }

      // Pulsing ground ring (scale + opacity)
      if (obj.userData.isPulsingRing) {
        const s = 1 + 0.18 * Math.sin(t * 2.2);
        obj.scale.set(s, 1, s);
        if (obj.material) {
          obj.material.opacity = 0.38 + 0.28 * Math.sin(t * 2.2);
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Animated ring drawn on the ground plane beneath the object. */
  _createPulsingRing(color) {
    const T = this.THREE;
    const geo = new T.RingGeometry(0.28, 0.34, 36);
    const mat = new T.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      side: T.DoubleSide,
      depthWrite: false,
    });
    const ring = new T.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.38; // sits on the ground (below the floating bottle)
    ring.userData = { isPulsingRing: true };
    return ring;
  }

  /**
   * Canvas-texture sprite showing bourbon name, brand, and price.
   * Floats above the bottle in billboard (always-faces-camera) mode.
   */
  _createBottleLabel(name, brand, price) {
    const T = this.THREE;
    const W = 512, H = 224;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Dark gradient background pill
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'rgba(18, 14, 8, 0.92)');
    bg.addColorStop(1, 'rgba(35, 20, 5, 0.92)');
    ctx.fillStyle = bg;
    this._rrect(ctx, 12, 12, W - 24, H - 24, 22);
    ctx.fill();

    // Amber border
    ctx.strokeStyle = 'rgba(232, 146, 42, 0.85)';
    ctx.lineWidth = 2.5;
    this._rrect(ctx, 12, 12, W - 24, H - 24, 22);
    ctx.stroke();

    // Whiskey icon
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥃', W / 2, 54);

    // Bourbon name
    ctx.fillStyle = '#F0A030';
    ctx.font = 'bold 34px Arial, sans-serif';
    const nameStr = name.length > 22 ? name.slice(0, 20) + '…' : name;
    ctx.fillText(nameStr, W / 2, 100);

    // Brand
    ctx.fillStyle = '#A0B8CC';
    ctx.font = '26px Arial, sans-serif';
    ctx.fillText(brand, W / 2, 140);

    // Price
    if (price) {
      ctx.fillStyle = '#4DD080';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText(`$${price.toFixed(2)}`, W / 2, 182);
    }

    const tex = new T.CanvasTexture(canvas);
    const mat = new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new T.Sprite(mat);
    sprite.scale.set(0.85, 0.38, 1);
    return sprite;
  }

  /**
   * Simple label sprite for speakeasy pins.
   */
  _createPinLabel(text, color) {
    const T = this.THREE;
    const W = 384, H = 112;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(14, 20, 35, 0.90)';
    this._rrect(ctx, 8, 8, W - 16, H - 16, 18);
    ctx.fill();

    const hexColor = '#' + color.toString(16).padStart(6, '0');
    ctx.strokeStyle = hexColor;
    ctx.lineWidth = 2;
    this._rrect(ctx, 8, 8, W - 16, H - 16, 18);
    ctx.stroke();

    ctx.fillStyle = hexColor;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    const label = text.length > 24 ? text.slice(0, 22) + '…' : text;
    ctx.fillText(label, W / 2, 66);

    const tex = new T.CanvasTexture(canvas);
    const mat = new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new T.Sprite(mat);
    sprite.scale.set(0.72, 0.22, 1);
    return sprite;
  }

  /** Canvas rounded-rect helper. */
  _rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
