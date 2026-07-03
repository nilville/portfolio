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

  const STAR_COUNT =
    window.matchMedia && window.matchMedia("(max-width: 767px)").matches
      ? 80
      : 140;
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

  function scheduleWarp() {
    return setTimeout(() => {
      triggerWarp();
      warpTimer = scheduleWarp();
    }, 8000 + Math.random() * 3000);
  }
  let warpTimer = scheduleWarp();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(warpTimer);
    } else {
      warpTimer = scheduleWarp();
    }
  });

  let lastAccentHex = "";
  let r = 242,
    g = 242,
    b = 242;

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : (console.warn("hexToRgb: invalid accent color:", hex), { r: 242, g: 242, b: 242 });
  }

  function updateColorIfNeeded() {
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#f2f2f2";
    if (accent !== lastAccentHex) {
      lastAccentHex = accent;
      const rgb = hexToRgb(accent);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    }
  }

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

    updateColorIfNeeded();
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

window.onerror = function (msg, url, line, col, err) {
  console.error("GLOBAL_ERROR:", msg, "at", url, line + ":" + col);
};
window.onunhandledrejection = function (e) {
  console.error("UNHANDLED_PROMISE_REJECTION:", e.reason);
};

// Form Handling with Terminal Feedback
const contactForm = document.getElementById("contact-form");
const formToast = document.getElementById("form-toast");
const formToastMessage = document.getElementById("form-toast-message");
let formToastTimeout = null;

function showFormToast(type, message) {
  if (!formToast || !formToastMessage) {
    console.warn("Form toast container not found, falling back to alert.");
    alert(message);
    return;
  }

  clearTimeout(formToastTimeout);
  formToastMessage.textContent = message;
  formToast.classList.remove("hidden", "success", "error");
  formToast.classList.add(type);

  formToastTimeout = setTimeout(() => {
    formToast.classList.add("hidden");
  }, 4200);
}

if (contactForm) {
  const submitBtn = contactForm.querySelector(".submit-btn");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailEl = document.getElementById("email");
    const subjectEl = document.getElementById("subject");
    const bodyEl = document.getElementById("body");

    if (!emailEl || !subjectEl || !bodyEl) {
      console.error("CRITICAL_ERROR: Missing required form elements");
      return;
    }

    const email = emailEl.value.trim();
    const subject = subjectEl.value.trim();
    const body = bodyEl.value.trim();

    if (!email || !subject || !body) {
      showFormToast("error", "ERROR: All fields are required.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      showFormToast("error", "ERROR: Invalid email address.");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "SENDING...";
    }

    const formData = new FormData(contactForm);
    formData.set("_subject", subject);
    formData.set("_replyto", email);

    fetch(contactForm.action, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return response.json().then((data) => {
          throw new Error(data.error || "Form submission failed");
        });
      })
      .then(() => {
        showFormToast(
          "success",
          "Message sent successfully. Check your inbox.",
        );
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Execute Send";
        }
      })
      .catch((error) => {
        console.error("FORM_SUBMISSION_ERROR:", error);
        showFormToast(
          "error",
          "Unable to send message. Please try again later.",
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Execute Send";
        }
      });
  });
}

// CLI & Terminal Shell Module
(function () {
  const modal = document.getElementById("terminal-modal");
  const shellToggle = document.getElementById("shell-toggle");
  const closeTerminal = document.getElementById("close-terminal");
  const terminalInput = document.getElementById("terminal-input");
  const terminalOutput = document.getElementById("terminal-output");
  const terminalBody = document.getElementById("terminal-body");

  if (
    !modal ||
    !shellToggle ||
    !closeTerminal ||
    !terminalInput ||
    !terminalOutput ||
    !terminalBody
  ) {
    return;
  }

  // Load Saved Theme
  const savedTheme = localStorage.getItem("nilville-theme");
  if (savedTheme) {
    document.body.className = document.body.className
      .replace(/\btheme-\S+/g, "")
      .trim();
    if (savedTheme !== "default") {
      document.body.classList.add(savedTheme);
    }
  }

  // Shell State
  let history = (() => {
    try {
      return JSON.parse(localStorage.getItem("nilville-history") || "[]");
    } catch {
      return [];
    }
  })();
  let historyIndex = -1;
  let shellState = "NORMAL"; // NORMAL, CONTACT_EMAIL, CONTACT_SUBJECT, CONTACT_MESSAGE
  let contactPayload = { email: "", subject: "", body: "" };

  // Session start time for uptime calculation
  const sessionStartTime = Date.now();

  const COMMANDS = [
    "help",
    "whoami",
    "skills",
    "projects",
    "theme",
    "neofetch",
    "contact",
    "clear",
    "exit",
    "open",
  ];

  const PROJECTS = [
    {
      name: "sa9t",
      description: "Football predictions analytics with accuracy telemetry.",
      stack: "Flask, Python, PostgreSQL, Vanilla CSS",
      url: "https://web-production-4eed1.up.railway.app/",
    },
    {
      name: "StreamFlix",
      description: "Sleek TV showcase application integration using TMDB API.",
      stack: "Flask, Python, Tailwind CSS",
      url: "https://streamflix-inir.vercel.app/",
    },
    {
      name: "PolyPulse",
      description: "High-performance parallel scanning client for Polymarket pools.",
      stack: "Flask, Python, Vanilla CSS",
      url: "https://polypulse-inir.vercel.app/",
    },
    {
      name: "Stratos",
      description: "Football match analysis & prediction platform using statistical models and AI to compare teams across top European leagues with betting insights.",
      stack: "Python, Flask, Vanilla CSS, Vanilla JS",
      url: "https://stratos-inir.vercel.app/",
    },
  ];

  // Toggle Shell
  function openShell() {
    modal.classList.remove("hidden");
    terminalInput.focus();
    if (terminalOutput.children.length === 0) {
      showWelcome();
    }
    setTimeout(() => {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 0);
  }

  function closeShell() {
    modal.classList.add("hidden");
    shellState = "NORMAL";
  }

  shellToggle.addEventListener("click", openShell);
  closeTerminal.addEventListener("click", closeShell);

  // Close with Esc, Toggle with Backtick
  window.addEventListener("keydown", function (e) {
    if (e.key === "`") {
      e.preventDefault();
      if (modal.classList.contains("hidden")) {
        openShell();
      } else {
        closeShell();
      }
    } else if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeShell();
    }
  });

  // Focus input on body click
  terminalBody.addEventListener("click", function (e) {
    // If user is selecting text, do not force focus
    if (window.getSelection().toString() === "") {
      terminalInput.focus();
    }
  });

  function print(text, type = "") {
    const line = document.createElement("div");
    line.className = `terminal-output-line ${type}`;
    if (type === "raw") {
      line.innerHTML = text;
    } else {
      line.textContent = text;
    }
    terminalOutput.appendChild(line);
    setTimeout(() => {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 0);
  }

  function showWelcome() {
    print("Welcome to nilvilleOS v1.0.0 Shell Session.", "system-info");
    print("Type 'help' to view the list of available commands.", "system-info");
    print("");
  }

  function printPrompt(command) {
    print(`guest@nilville:~$ ${command}`, "command-echo");
  }

  // Handle Command Submission
  terminalInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const inputVal = terminalInput.value.trim();
      terminalInput.value = "";

      if (shellState !== "NORMAL") {
        handleContactWorkflow(inputVal);
        return;
      }

      if (!inputVal) return;

      // Add to history
      history.push(inputVal);
      if (history.length > 50) history.shift();
      localStorage.setItem("nilville-history", JSON.stringify(history));
      historyIndex = -1;

      printPrompt(inputVal);
      executeCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === -1) {
        historyIndex = history.length - 1;
      } else if (historyIndex > 0) {
        historyIndex--;
      }
      terminalInput.value = history[historyIndex];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      if (historyIndex < history.length - 1) {
        historyIndex++;
        terminalInput.value = history[historyIndex];
      } else {
        historyIndex = -1;
        terminalInput.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
    }
  });

  function handleAutocomplete() {
    const inputVal = terminalInput.value.trim().toLowerCase();
    if (!inputVal) return;

    const matches = COMMANDS.filter((cmd) => cmd.startsWith(inputVal));
    if (matches.length === 1) {
      terminalInput.value = matches[0];
    } else if (matches.length > 1) {
      printPrompt(terminalInput.value);
      print(`Matches: ${matches.join(", ")}`, "system-info");
    }
  }

  function executeCommand(input) {
    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        printHelp();
        break;
      case "whoami":
        printWhoami();
        break;
      case "skills":
        printSkills();
        break;
      case "projects":
        printProjects();
        break;
      case "theme":
        handleThemeCommand(args);
        break;
      case "neofetch":
        printNeofetch();
        break;
      case "contact":
        startContactWorkflow();
        break;
      case "clear":
        terminalOutput.innerHTML = "";
        showWelcome();
        break;
      case "exit":
        closeShell();
        break;
      case "open":
        handleOpenCommand(args);
        break;
      default:
        print(
          `shell: command not found: ${cmd}. Type 'help' for available commands.`,
          "error-output",
        );
    }
  }

  // Help command
  function printHelp() {
    const helpText = `
<table class="cli-table">
  <thead>
    <tr>
      <th>Command</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>whoami</td><td>Developer background info</td></tr>
    <tr><td>skills</td><td>Display technical skills indices</td></tr>
    <tr><td>projects</td><td>List repositories & live preview links</td></tr>
    <tr><td>open &lt;name&gt;</td><td>Open project demo in a new tab</td></tr>
    <tr><td>theme &lt;name&gt;</td><td>Switch retro UI colors (e.g. 'theme amber')</td></tr>
    <tr><td>neofetch</td><td>Display host details & ASCII art logo</td></tr>
    <tr><td>contact</td><td>Trigger interactive contact prompt workflow</td></tr>
    <tr><td>clear</td><td>Clear screen terminal buffer</td></tr>
    <tr><td>exit</td><td>Close terminal shell session</td></tr>
  </tbody>
</table>
`;
    print(helpText, "raw");
  }

  // Whoami command
  function printWhoami() {
    print("Name: Inir Zaoui");
    print("Role: Full Stack Developer & Penetration Tester");
    print("Location: Algeria (DZ)");
    print(
      "Bio: University student specializing in secure web ecosystems, currently studying backend engineering and security hardened deployments.",
    );
    print(
      "Mission: Creating robust backend systems with Django/Flask, and validating their protection with advanced ethical hacking methodologies.",
    );
  }

  // Skills command
  function printSkills() {
    print("TECHNICAL SKILLS PORTFOLIO:");
    print("=========================================");
    print("Python       [██████████████████░░] 90%", "system-info");
    print("Django/Flask [██████████████████░░] 90%", "system-info");
    print("PostgreSQL   [████████████████░░░░] 80%", "system-info");
    print("Pentesting   [████████████████░░░░] 80%", "system-info");
    print("Tailwind CSS [██████████████████░░] 90%", "system-info");
    print("Docker       [██████████████░░░░░░] 70%", "system-info");
    print("React.js     [████████████░░░░░░░░] 60%", "system-info");
    print("=========================================");
  }

  // Projects command
  function printProjects() {
    print("ACTIVE REPOSITORIES:");
    print("-----------------------------------------");
    PROJECTS.forEach((p, i) => {
      print(`${i + 1}. ${p.name}`);
      print(`   Description: ${p.description}`);
      print(`   Stack: ${p.stack}`);
      print(`   Link: ${p.url}`);
      print("");
    });
    print("-----------------------------------------");
    print("Type 'open <project_name>' (e.g. 'open sa9t') to view active link.");
  }

  // Open command
  function handleOpenCommand(args) {
    if (args.length === 0) {
      print(
        "Usage: open <project_name> (e.g., 'open sa9t', 'open streamflix', 'open polypulse', 'open stratos')",
        "error-output",
      );
      return;
    }
    const target = args[0].toLowerCase();
    const project = PROJECTS.find((p) => p.name.toLowerCase() === target);

    if (project) {
      print(`Opening ${project.name} live demo...`, "system-info");
      window.open(project.url, "_blank", "noopener,noreferrer");
    } else {
      print(
        `Unknown repository target: ${target}. Options: ${PROJECTS.map((p) => p.name.toLowerCase()).join(", ")}`,
        "error-output",
      );
    }
  }

  // Theme command
  function handleThemeCommand(args) {
    const themes = ["default", "matrix", "amber", "dracula", "cyberpunk"];
    if (args.length === 0) {
      print("Available themes: " + themes.join(", "), "system-info");
      const active = document.body.className.match(/theme-\S+/);
      print(
        "Current Theme: " +
          (active ? active[0].replace("theme-", "") : "default"),
        "system-info",
      );
      return;
    }

    const newTheme = args[0].toLowerCase();
    if (!themes.includes(newTheme)) {
      print(
        `Theme '${newTheme}' not recognized. Options: ` + themes.join(", "),
        "error-output",
      );
      return;
    }

    document.body.className = document.body.className
      .replace(/\btheme-\S+/g, "")
      .trim();
    if (newTheme !== "default") {
      document.body.classList.add(`theme-${newTheme}`);
      localStorage.setItem("nilville-theme", `theme-${newTheme}`);
    } else {
      localStorage.setItem("nilville-theme", "default");
    }
    print(
      `System theme swapped to: ${newTheme}. CRT adjustments initialized.`,
      "system-info",
    );
  }

  // Neofetch command
  function printNeofetch() {
    const uptimeSecs = Math.floor((Date.now() - sessionStartTime) / 1000);
    const mins = Math.floor(uptimeSecs / 60);
    const secs = uptimeSecs % 60;
    const uptimeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    const activeThemeMatch = document.body.className.match(/theme-\S+/);
    const activeTheme = activeThemeMatch
      ? activeThemeMatch[0].replace("theme-", "")
      : "default";

    const neofetchHTML = `
<div class="neofetch-output">
<pre><code class="neofetch-logo">  _  _ _ _    _  _ _ _    _    ____ 
  |\\ | | |    |  | | |    |    |___ 
  | \\| | |___  \\/  | |___ |___ |___ </code>
<code><span class="neofetch-host">guest@nilvilleOS</span>
-----------------
OS: nilvilleOS v1.0.0
Base: Algeria (DZ)
Shell: nil-sh v0.9 (ES6 Module)
Uptime: ${uptimeStr}
Active Theme: ${activeTheme}
Resolution: ${window.innerWidth}x${window.innerHeight}
GitHub: <a href="https://github.com/nilville" target="_blank" class="neofetch-link">github.com/nilville</a>
LinkedIn: <a href="https://www.linkedin.com/in/inir-zaoui-419216318/" target="_blank" class="neofetch-link">Inir Zaoui</a></span></code>
</pre>
</div>
`;
    print(neofetchHTML, "raw");
  }

  // Contact workflow
  function startContactWorkflow() {
    shellState = "CONTACT_EMAIL";
    print(
      "Starting secure terminal messaging wizard. Type 'abort' to cancel.",
      "system-info",
    );
    print("[INPUT] email_address (e.g. user@domain.com):", "system-info");
    terminalInput.placeholder = "Enter email address...";
  }

  function handleContactWorkflow(input) {
    const val = input.trim();
    if (val.toLowerCase() === "abort") {
      shellState = "NORMAL";
      print("Messaging workflow aborted.", "system-info");
      terminalInput.placeholder = "Type 'help'...";
      return;
    }

    if (shellState === "CONTACT_EMAIL") {
      if (!val || !EMAIL_REGEX.test(val)) {
        print(
          "ERROR: Invalid email address payload. Try again:",
          "error-output",
        );
        return;
      }
      contactPayload.email = val;
      shellState = "CONTACT_SUBJECT";
      print(`[OK] email_address recorded: ${val}`, "system-info");
      print("[INPUT] subject_header:", "system-info");
      terminalInput.placeholder = "Enter message subject...";
    } else if (shellState === "CONTACT_SUBJECT") {
      if (!val) {
        print(
          "ERROR: Subject header cannot be empty. Try again:",
          "error-output",
        );
        return;
      }
      contactPayload.subject = val;
      shellState = "CONTACT_MESSAGE";
      print(`[OK] subject_header recorded: ${val}`, "system-info");
      print("[INPUT] message_payload:", "system-info");
      terminalInput.placeholder = "Enter message body...";
    } else if (shellState === "CONTACT_MESSAGE") {
      if (!val) {
        print(
          "ERROR: Message payload cannot be empty. Try again:",
          "error-output",
        );
        return;
      }
      contactPayload.body = val;
      shellState = "NORMAL";
      terminalInput.placeholder = "Type 'help'...";

      // Send payload
      print(
        `[OK] message_payload recorded. Preparing payload for transmission...`,
        "system-info",
      );
      simulateTransmission();
    }
  }

  function simulateTransmission() {
    print("INITIATING SECURE SSH RELAY TUNNEL...", "system-info");

    setTimeout(() => {
      print("ESTABLISHING CONNECTION TO MAIL SERVER...", "system-info");
    }, 400);

    setTimeout(() => {
      print("PERFORMING DIFFIE-HELLMAN KEY EXCHANGE...", "system-info");
    }, 850);

    setTimeout(() => {
      print("ENCRYPTING PAYLOAD WITH AES-256-GCM...", "system-info");
    }, 1300);

    setTimeout(() => {
      print("TRANSMITTING ENCRYPTED TELEMETRY PACKETS...", "system-info");
    }, 1800);

    setTimeout(() => {
      const formData = new FormData();
      formData.append("email", contactPayload.email);
      formData.append("subject", contactPayload.subject);
      formData.append("message", contactPayload.body);
      formData.append("_subject", contactPayload.subject);
      formData.append("_replyto", contactPayload.email);

      const endpoint = "https://formspree.io/f/xeebplay";

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.error || "Form submission failed");
            });
          }
          return response.json();
        })
        .then(() => {
          print(
            "TRANSMISSION SUCCESSFUL. RESPONSE STATUS CODE: 200 (OK)",
            "system-info",
          );
          print(
            `>>> MSG_SENT: Connection established. Hello from ${contactPayload.email}!`,
            "system-info",
          );
          print("");
          contactPayload = { email: "", subject: "", body: "" };
        })
        .catch((error) => {
          print(
            "TRANSMISSION FAILED. ERROR: " + error.message,
            "error-output",
          );
          print("");
        });
    }, 2400);
  }
})();
