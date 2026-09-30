/* =====================================================================
   CONTROLLER — listens to the user, updates the Model, tells the View.
   ===================================================================== */

const Controller = {

  transitioning: false,
  audioUnlocked: false,

  // Screen order used by the swipe gesture and the mobile nav bar
  order: ["home", "projects", "skills", "about", "contact"],

  init() {
    View.init();
    this.bindMenu();
    this.bindMobileNav();
    this.bindSwipe();
    this.bindKeyboard();
    this.bindAudioUnlock();
    this.bindContactForm();
  },

  /* ---------- Contact form (relayed via formsubmit.co, mailto fallback) ---------- */
  bindContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const btn = form.querySelector(".form-send");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return;  // honeypot caught a bot
      if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
        status.textContent = "Fill in all three fields first.";
        return;
      }
      btn.disabled = true;
      status.textContent = "Sending…";
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${Model.contactEmail}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            _subject: `Portfolio message from ${data.name}`,
          }),
        });
        if (!res.ok) throw new Error(res.status);
        status.textContent = "Sent! I'll get back to you soon.";
        form.reset();
        this.play();
      } catch {
        // relay unreachable: open the visitor's own mail app instead
        status.textContent = "Couldn't reach the relay, opening your email app instead…";
        const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\nReply to: ${data.email}`);
        location.href = `mailto:${Model.contactEmail}?subject=${subject}&body=${body}`;
      } finally {
        btn.disabled = false;
      }
    });
  },

  /* ---------- Navigation ---------- */
  goTo(screen) {
    if (this.transitioning || screen === Model.state.screen) return;
    this.transitioning = true;
    this.play();

    View.wipe(
      () => {                       // mid-wipe: swap screens while covered
        Model.state.screen = screen;
        View.showScreen(screen);
        if (screen === "projects") this.loadProjects();
        if (screen === "skills") this.loadSkills();
        // keep the home highlight pointing at the section we're leaving for
        const i = View.els.menuItems.findIndex(m => m.dataset.target === screen);
        if (i >= 0) { Model.state.menuIndex = i; View.setMenuSelection(i); }
      },
      () => { this.transitioning = false; }
    );
  },

  // step through the sections — used by the swipe gesture
  step(dir) {
    const i = this.order.indexOf(Model.state.screen);
    const next = this.order[(i + dir + this.order.length) % this.order.length];
    this.goTo(next);
  },

  select(index) {
    const n = View.els.menuItems.length;
    const next = (index + n) % n;
    if (next !== Model.state.menuIndex) this.play();
    Model.state.menuIndex = next;
    View.setMenuSelection(next);
  },

  /* ---------- Screen data loading ---------- */
  async loadProjects() {
    View.renderFeatured(Model.featured);
    if (Model.state.reposLoaded) return;
    const { repos, live } = await Model.fetchRepos();
    const status = live
      ? `${repos.length} repositories · live from GitHub`
      : "Showing pinned work · GitHub API unavailable right now";
    View.renderRepos(repos, status, Model);
    Model.state.reposLoaded = true;
  },

  loadSkills() {
    if (!Model.state.skillsBuilt) {
      View.renderSkills(Model.skills);
      Model.state.skillsBuilt = true;
    }
    View.animateSkillBars();
  },

  /* ---------- Sound (browsers block audio until first user gesture) ---------- */
  play() {
    if (this.audioUnlocked) View.playSelect();
  },

  bindAudioUnlock() {
    const unlock = () => { this.audioUnlocked = true; };
    addEventListener("pointerdown", unlock, { once: true, capture: true });
    addEventListener("keydown", unlock, { once: true, capture: true });
  },

  /* ---------- Input bindings ---------- */
  bindMenu() {
    const canHover = matchMedia("(hover: hover)").matches;
    View.els.menuItems.forEach((item, i) => {
      // only hover-capable devices pre-select on pointer-over; touch taps straight in
      if (canHover) item.addEventListener("mouseenter", () => this.select(i));
      item.addEventListener("click", () => this.goTo(item.dataset.target));
    });

    document.querySelectorAll("[data-back]").forEach(b =>
      b.addEventListener("click", () => this.goTo("home")));

    // Clicking the name always takes you home
    document.getElementById("big-name").addEventListener("click", () => {
      if (Model.state.screen !== "home") this.goTo("home");
      else this.play();
    });
  },

  /* ---------- Always-visible nav bar (mobile / touch) ---------- */
  bindMobileNav() {
    document.querySelectorAll("#mnav .mnav-item").forEach(b =>
      b.addEventListener("click", () => this.goTo(b.dataset.target)));
  },

  /* ---------- Swipe left/right to change menu ---------- */
  bindSwipe() {
    const stage = document.getElementById("stage");
    if (!stage) return;
    let x = 0, y = 0, tracking = false;

    // don't hijack swipes that belong to a link, a form field or a scroll area
    const blocked = el => el && el.closest(
      "input,textarea,select,label,a,.card,.thumb,form,#mnav"
    );

    stage.addEventListener("touchstart", e => {
      if (e.touches.length !== 1 || blocked(e.target)) { tracking = false; return; }
      tracking = true;
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }, { passive: true });

    stage.addEventListener("touchend", e => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x, dy = t.clientY - y;
      if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      this.step(dx < 0 ? 1 : -1);       // swipe left → next, right → previous
    }, { passive: true });

    stage.addEventListener("touchcancel", () => { tracking = false; }, { passive: true });
  },

  bindKeyboard() {
    addEventListener("keydown", e => {
      // never hijack keys while someone is typing in the contact form
      const typing = e.target && e.target.matches &&
        e.target.matches("input,textarea,select");
      if (typing) return;

      if (Model.state.screen === "home") {
        if (e.key === "ArrowDown") { this.select(Model.state.menuIndex + 1); e.preventDefault(); }
        else if (e.key === "ArrowUp") { this.select(Model.state.menuIndex - 1); e.preventDefault(); }
        else if (e.key === "Enter") {
          this.goTo(View.els.menuItems[Model.state.menuIndex].dataset.target);
        }
      } else if (e.key === "Escape") {
        this.goTo("home");
      }
    });
  },
};

Controller.init();
