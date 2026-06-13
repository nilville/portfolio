(function () {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const STAR_COUNT = 140;
  const DEPTH = 1000;
  const SPEED = 1.8;
  const WARP_THRESHOLD = 20;

  function createStar(resetNear = false) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.55);
    return {
      x: Math.cos(angle) * radius * W,
      y: Math.sin(angle) * radius * H,
      z: resetNear ? DEPTH : Math.random() * DEPTH,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  const stars = Array.from({ length: STAR_COUNT }, () => createStar());

  let prevTime = 0;
  let warpSpeed = false;

  function triggerWarp() {
    warpSpeed = true;
    setTimeout(() => {
      warpSpeed = false;
    }, 650);
  }

  setInterval(triggerWarp, 8000 + Math.random() * 3000);

  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim() || "#00ff9c";

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 255, b: 156 };
  }

  const { r, g, b } = hexToRgb(accent);

  function drawTerminalGlow(timestamp) {
    const pulse = (Math.sin(timestamp / 900) + 1) / 2;
    const sweepY = ((timestamp / 18) % (H + 180)) - 90;

    const sweep = ctx.createLinearGradient(0, sweepY - 60, 0, sweepY + 60);
    sweep.addColorStop(0, "rgba(0, 0, 0, 0)");
    sweep.addColorStop(
      0.5,
      `rgba(${r}, ${g}, ${b}, ${warpSpeed ? 0.05 : 0.02})`,
    );
    sweep.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = sweep;
    ctx.fillRect(0, sweepY - 60, W, 120);
  }

  function starfield(timestamp) {
    const dt = Math.min((timestamp - prevTime) / 16.667, 3);
    prevTime = timestamp;

    ctx.clearRect(0, 0, W, H);
    drawTerminalGlow(timestamp);

    const speed = warpSpeed ? SPEED * 5 : SPEED;
    const cx = W / 2;
    const cy = H * 0.42;

    for (const star of stars) {
      star.z -= speed * dt;
      star.twinkle += 0.035 * dt;

      if (star.z <= 0) {
        Object.assign(star, createStar(true));
      }

      const scale = DEPTH / Math.max(star.z, 1);
      const sx = star.x * scale + cx;
      const sy = star.y * scale + cy;

      if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) {
        Object.assign(star, createStar(true));
        continue;
      }

      const brightness = 1 - star.z / DEPTH;
      const flicker = 0.74 + Math.sin(star.twinkle) * 0.26;
      const alpha = Math.min((brightness * 0.82 + 0.12) * flicker, 1);
      const size = Math.max(0.6, 1.8 * brightness);

      const trailLength = warpSpeed
        ? Math.min(12 * scale, 70)
        : Math.min(2.5 * scale, 18);

      const tx = star.x * (scale - trailLength / DEPTH) + cx;
      const ty = star.y * (scale - trailLength / DEPTH) + cy;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * (warpSpeed ? 0.38 : 0.18)})`;
      ctx.lineWidth = Math.max(0.45, size * 0.45);
      ctx.stroke();

      if (star.z < WARP_THRESHOLD) {
        ctx.fillStyle = `rgba(${Math.min(r + 100, 255)}, ${Math.min(g + 100, 255)}, ${Math.min(b + 100, 255)}, ${alpha})`;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`;
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`;
        ctx.shadowBlur = 2;
      }

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(starfield);
  }

  requestAnimationFrame(starfield);
})();

// Form Handling with Terminal Feedback
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailEl = document.getElementById("email");
    const subjectEl = document.getElementById("subject");
    const bodyEl = document.getElementById("body");

    if (!emailEl || !subjectEl || !bodyEl) {
      console.error("CRITICAL_ERROR: Missing required form elements");
      return;
    }

    const email = emailEl.value;
    const subject = subjectEl.value;
    const body = bodyEl.value;

    if (!email || !subject || !body) {
      alert("ERROR: All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("ERROR: Invalid protocol in email address");
      return;
    }

    console.log("INITIATING_CONNECTION...");
    console.log(`HEADER: ${subject}`);
    console.log("ENCRYPTING_PAYLOAD...");
    console.log("TRANSMISSION_SUCCESSFUL");

    alert(">>> MSG_SENT: Connection established. (Demo mode active)");

    contactForm.reset();
  });
}
