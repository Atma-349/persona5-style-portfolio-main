/* =====================================================================
   MODEL — the data and state of the app. Never touches the DOM.
   Edit your content here: featured projects, skills, image overrides.
   ===================================================================== */

const Model = {

  githubUser: "Atma-349",

  // Where the contact form delivers (via formsubmit.co relay)
  contactEmail: "muhammadimamarsyad@gmail.com",

  // App state (read/written by the Controller, displayed by the View)
  state: {
    screen: "home",        // which screen is showing
    menuIndex: 0,          // selected item on the home menu
    reposLoaded: false,
    skillsBuilt: false,
  },

  // ---- Featured projects (hand-written, shown above the GitHub feed) ----
  featured: [
    {
      title: "But its not about the paper",
      tag: "WEB", color: "#3dff6e", live: true,
      url: "https://atma-349.github.io/kertas/", cta: "Open the web →",
      img: "assets/projects/bsl.png",
      desc: "Human emotions are much like paper—vulnerable to being creased, torn, or crumpled by life’s unpredictable moments. Yet, no matter how deep the folds, paper carries a unique strength: it can always be shaped into something new. This space explores the delicate textures of what we feel, celebrating every crease as a testament to staying alive and moving forward.",
    },
    {
      title: "Ping Pong Game",
      tag: "NLP", color: "#e60012",
      url: "https://atma-349.github.io/PingPong-2P/",
      cta: "View on GitHub →",
      img: "assets/projects/steam.png",
      desc: "Fold & Rally is an artistic ping pong game where the physics of paper meet the dynamics of human feelings. Watch the world crease, crumple, and transform with every match you play. Can you keep the rally going through life's sharpest folds?",
    },
    {
      title: "GHOST SCARY",
      tag: "Horor", color: "#f1e05a",
      url: "atma-349.github.io/Hantu/", cta: "View on GitHub →",
      img: "assets/projects/downloadguard.png",
      desc: "Forget the jumpscares and eerie urban legends—welcome to the lighter side of Indonesian folklore. From Pocong suffering from jumping fatigue to Kuntilanak taking vocal lessons for a sweeter laugh, this platform parodies Indonesia’s most iconic spirits through interactive memes, satirical lore, and quirky visual design..",
    },
  ],

  // Repos already shown in "featured" get hidden from the GitHub feed
  featuredRepoNames: [
    "BritishFingerSpellingAI",
    "Granular-Sentiment-Pipeline-Class-Weighted-Transformers-for-Steam-Reviews",
    "DownloadGuard",
    "organsmnist-cnn-classification",
  ],

  // Shown if the GitHub API can't be reached
  fallbackRepos: [
    {
      name: "crime-analysis-montgomery-county", language: "Jupyter Notebook", stargazers_count: 0,
      html_url: "https://github.com/Omicron69/crime-analysis-montgomery-county",
      description: "Ten years of Montgomery County crime data, taken from a messy 90 MB government CSV to ten answered analytical questions, geospatial hotspot maps and a district safety ranking.",
    },
    {
      name: "asthma-worsening-prediction", language: "MATLAB", stargazers_count: 0,
      html_url: "https://github.com/Omicron69/asthma-worsening-prediction",
      description: "Predicting worsening asthma symptoms from NHS primary-care data with SQL and MATLAB, following CRISP-DM. Compares four models on a heavily imbalanced clinical dataset.",
    },
    {
      name: "Chronic-Kideney-Disease-Analyzer", language: "PHP", stargazers_count: 0,
      html_url: "https://github.com/Omicron69/Chronic-Kideney-Disease-Analyzer",
      description: "A healthcare tracking web app. I led the front-end and requirements analysis in a multidisciplinary team, and our solution improved patient diagnostics by 25%.",
    },
    {
      name: "MSc-Washington-Crime-Analysis-with-Pandas", language: "Jupyter Notebook", stargazers_count: 0,
      html_url: "https://github.com/Omicron69/MSc-Washington-Crime-Analysis-with-Pandas",
      description: "Crime trend analysis of Washington D.C. public data. Reproducible Pandas notebooks with visual summaries written for people who do not code.",
    },
  ],

  // Optional thumbnail overrides: repo name → image path.
  // Anything not listed is looked up at assets/projects/<RepoName>.png
  projectImages: {
    // "DownloadGuard": "assets/projects/downloadguard.png",
  },

  langColors: {
    // Core Languages
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    PHP: "#4F5D95",
    SQL: "#e38c00",

    // Frameworks & Libraries
    React: "#61dafb",
    "Next.js": "#000000",
    "Vue.js": "#41b883",
    "Tailwind CSS": "#06b6d4",
    Bootstrap: "#7952b3",

    // Tools & Others
    "Jupyter Notebook": "#DA5B0B",
    Shell: "#89e051",
    PowerShell: "#012456",
  },

  // ---- Skills screen ----
skills: [
    { group: "Core Frontend & Languages", items: [
      ["HTML5 · CSS3 · Modern JavaScript (ES6+)", 92],
      ["React.js · Next.js", 88],
      ["Tailwind CSS · Bootstrap · Responsive Design", 90],
      ["UI/UX Design · Figma", 84],
    ]},
    { group: "State, APIs & Tooling", items: [
      ["REST APIs & JSON Integration", 86],
      ["Git & GitHub Version Control", 88],
      ["Node.js & npm / Package Managers", 80],
      ["Web Performance & Accessibility (a11y)", 82],
    ]},
    { group: "Database & Backend Fundamentals", items: [
      ["MySQL · SQL Queries", 82],
      ["XAMPP / PHP Integration", 78],
      ["Python · Streamlit", 76],
      ["VS Code · Browser DevTools", 90],
    ]},
    { group: "Spoken Languages", items: [
      ["Indonesian (Native)", 100],
      ["English (Professional Working)", 85],
    ]},
  ]

  // ---- Data fetching ----
  ,async fetchRepos() {
    const skip = new Set(this.featuredRepoNames);
    try {
      const res = await fetch(
        `https://api.github.com/users/${this.githubUser}/repos?per_page=100&sort=updated`
      );
      if (!res.ok) throw new Error(res.status);
      const repos = (await res.json()).filter(r => !r.fork && !skip.has(r.name));
      return { repos, live: true };
    } catch {
      return { repos: this.fallbackRepos.filter(r => !skip.has(r.name)), live: false };
    }
  },
};
