// Audio Synthesizer (Realistic Card Swipe & Flip Effects)
    const AudioEngine = {
      enabled: true,
      ctx: null,
      init() {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
      },
      playFlip() {
        if (!this.enabled) return;
        try {
          this.init();
          if (this.ctx.state === 'suspended') this.ctx.resume();
          
          const now = this.ctx.currentTime;
          const bufferSize = this.ctx.sampleRate * 0.12;
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          const whiteNoise = this.ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, now);
          filter.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
          filter.Q.setValueAtTime(3.0, now);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.linearRampToValueAtTime(0.65, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          whiteNoise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          whiteNoise.start(now);
          whiteNoise.stop(now + 0.12);
        } catch (e) {}
      },
      playSwipe() {
        if (!this.enabled) return;
        try {
          this.init();
          if (this.ctx.state === 'suspended') this.ctx.resume();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(720, now + 0.09);
          gain.gain.setValueAtTime(0.55, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
        } catch (e) {}
      },
      playClick() {
        if (!this.enabled) return;
        try {
          this.init();
          if (this.ctx.state === 'suspended') this.ctx.resume();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(560, now);
          osc.frequency.exponentialRampToValueAtTime(1080, now + 0.04);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } catch (e) {}
      }
    };

    // CSV Parser for Google Sheets tabs
    function parseCSVRows(text) {
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) return [];

      function parseLine(line) {
        const row = [];
        let insideQuote = false;
        let entry = '';
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (insideQuote && line[i + 1] === '"') {
              entry += '"';
              i++;
            } else {
              insideQuote = !insideQuote;
            }
          } else if (char === ',' && !insideQuote) {
            row.push(entry.trim());
            entry = '';
          } else {
            entry += char;
          }
        }
        row.push(entry.trim());
        return row;
      }

      const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        if (values.length === 0 || values.every(v => v === '')) continue;
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] !== undefined ? values[idx].replace(/^["']|["']$/g, '').trim() : '';
        });
        rows.push(obj);
      }
      return rows;
    }

    // Default Comprehensive Question Backup (Used if network is unavailable)
    const BACKUP_BDS = [
      {
        Subject: "Anatomy",
        Topic: "Cranial Nerve",
        Question: "Which is the largest cranial nerve?",
        Answer: "Trigeminal nerve (CN V)",
        Difficulty: "Easy",
        Explanation: "The trigeminal nerve (CN V) is the largest cranial nerve, supplying sensory innervation to the face and teeth as well as motor supply to the muscles of mastication."
      },
      {
        Subject: "Physiology",
        Topic: "Cardiovascular",
        Question: "What is the normal resting heart rate in an adult?",
        Answer: "Approximately 60–100 beats per minute",
        Difficulty: "Medium",
        Explanation: "A normal adult resting heart rate ranges from 60 to 100 bpm. Rates below 60 indicate bradycardia, and above 100 indicate tachycardia."
      },
      {
        Subject: "Dental Anatomy",
        Topic: "Enamel & Amelogenesis",
        Question: "Which cells synthesize and secrete dental enamel matrix?",
        Answer: "Ameloblasts",
        Difficulty: "Easy",
        Explanation: "Ameloblasts differentiate from the inner enamel epithelium to secrete enamel proteins during amelogenesis."
      },
      {
        Subject: "Conservative Dentistry",
        Topic: "Endodontics",
        Question: "What is the standard access cavity shape for a maxillary central incisor?",
        Answer: "Triangular (base toward incisal, apex toward cingulum)",
        Difficulty: "Medium",
        Explanation: "A triangular outline form allows complete de-roofing of the pulp horns and straight-line instrument insertion."
      },
      {
        Subject: "Oral Surgery",
        Topic: "Complications",
        Question: "What is the clinical cause of alveolar osteitis (Dry Socket)?",
        Answer: "Disintegration or premature loss of the blood clot leaving exposed alveolar bone",
        Difficulty: "Medium",
        Explanation: "Fibrinolysis dissolves the blood clot between post-extraction days 2 to 4, exposing bare alveolar bone."
      }
    ];

    const BACKUP_BCS = [
      {
        Subject: "Anatomy",
        Topic: "Cranial Nerve",
        Question: "Which is the largest cranial nerve?",
        Answer: "Trigeminal nerve (CN V)",
        Difficulty: "Easy",
        Explanation: "The trigeminal nerve (CN V) provides sensory supply to the face and motor supply to the muscles of mastication."
      },
      {
        Subject: "Physiology",
        Topic: "Cardiovascular",
        Question: "What is the normal resting heart rate in an adult?",
        Answer: "Approximately 60–100 beats per minute",
        Difficulty: "Medium",
        Explanation: "Normal adult resting heart rate is between 60 and 100 bpm."
      },
      {
        Subject: "Bangladesh Affairs",
        Topic: "1971 Liberation War",
        Question: "Under which military sector was Dhaka placed during the 1971 Liberation War?",
        Answer: "Sector 2",
        Difficulty: "Easy",
        Explanation: "Dhaka, Comilla, and Faridpur were under Sector 2, commanded initially by Major Khaled Mosharraf."
      },
      {
        Subject: "Bangladesh Affairs",
        Topic: "Constitution",
        Question: "Which article of the Constitution of Bangladesh guarantees the enforcement of fundamental rights?",
        Answer: "Article 44 (under Article 102 writ jurisdiction)",
        Difficulty: "Medium",
        Explanation: "Article 44(1) guarantees the right to move the High Court Division for fundamental rights enforcement."
      },
      {
        Subject: "General Science",
        Topic: "Human Physiology",
        Question: "Which human blood group is considered the universal red blood cell donor?",
        Answer: "O Negative (O-)",
        Difficulty: "Easy",
        Explanation: "O negative red blood cells lack A, B, and Rh antigens, allowing safe emergency transfusion to all blood types."
      }
    ];

    // Main App
    const App = {
      category: "BDS",
      cache: {
        BDS: null,
        BCS: null
      },
      rawQuestions: [],
      filteredQueue: [],
      currentIndex: 0,
      isFlipped: false,

      async init() {
        this.bindEvents();
        await this.loadCategory("BDS");
        // Pre-fetch the other category in background for instant 0ms switching
        this.preloadCategory("BCS");
      },

      bindEvents() {
        // Fullscreen Toggle
        const btnToggleFullscreen = document.getElementById("btnToggleFullscreen");
        if (btnToggleFullscreen) {
          btnToggleFullscreen.addEventListener("click", () => {
            AudioEngine.playClick();
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
              }
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              }
            }
          });

          const updateFullscreenIcon = () => {
            const svg = document.getElementById("fullscreenSvg");
            if (!svg) return;
            if (document.fullscreenElement || document.webkitFullscreenElement) {
              svg.innerHTML = `<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>`;
              btnToggleFullscreen.title = "Exit Full Screen";
            } else {
              svg.innerHTML = `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>`;
              btnToggleFullscreen.title = "Toggle Full Screen";
            }
          };

          document.addEventListener("fullscreenchange", updateFullscreenIcon);
          document.addEventListener("webkitfullscreenchange", updateFullscreenIcon);
        }

        // Sound Toggle
        const btnToggleSound = document.getElementById("btnToggleSound");
        if (btnToggleSound) {
          btnToggleSound.addEventListener("click", () => {
            AudioEngine.enabled = !AudioEngine.enabled;
            const svg = document.getElementById("soundSvg");
            if (AudioEngine.enabled) {
              svg.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
              AudioEngine.playClick();
            } else {
              svg.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
            }
          });
        }

        // Theme Toggle (Default is light)
        const btnToggleTheme = document.getElementById("btnToggleTheme");
        if (btnToggleTheme) {
          btnToggleTheme.addEventListener("click", () => {
            AudioEngine.playClick();
            const current = document.documentElement.getAttribute("data-theme") || "light";
            const next = current === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", next);
            const svg = document.getElementById("themeSvg");
            if (next === "light") {
              // In light mode, show moon icon to switch to dark
              svg.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
            } else {
              // In dark mode, show sun icon to switch to light
              svg.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
            }
          });
        }

        // Category Tabs: BDS vs BCS
        const tabBtnBds = document.getElementById("tabBtnBds");
        if (tabBtnBds) {
          tabBtnBds.addEventListener("click", () => {
            AudioEngine.playClick();
            this.switchCategory("BDS");
          });
        }
        const tabBtnBcs = document.getElementById("tabBtnBcs");
        if (tabBtnBcs) {
          tabBtnBcs.addEventListener("click", () => {
            AudioEngine.playClick();
            this.switchCategory("BCS");
          });
        }

        // Subject Change -> updates Topic dropdown
        const selectSubject = document.getElementById("selectSubject");
        if (selectSubject) {
          selectSubject.addEventListener("change", () => {
            AudioEngine.playClick();
            this.updateTopicsDropdown();
          });
        }

        const selectTopic = document.getElementById("selectTopic");
        if (selectTopic) {
          selectTopic.addEventListener("change", () => {
            AudioEngine.playClick();
          });
        }

        // View Questions Button (plays sound)
        const btnViewQuestions = document.getElementById("btnViewQuestions");
        if (btnViewQuestions) {
          btnViewQuestions.addEventListener("click", () => {
            AudioEngine.playClick();
            this.buildFilteredQueue();
          });
        }

        // Flip Card Controls
        const btnRevealAnswer = document.getElementById("btnRevealAnswer");
        if (btnRevealAnswer) btnRevealAnswer.addEventListener("click", () => this.flip());

        const btnFlipBack = document.getElementById("btnFlipBack");
        if (btnFlipBack) btnFlipBack.addEventListener("click", () => this.unflip(true));

        const btnFlipCard = document.getElementById("btnFlipCard");
        if (btnFlipCard) btnFlipCard.addEventListener("click", () => this.toggleFlip());

        // Nav Next / Prev
        const btnNextCard = document.getElementById("btnNextCard");
        if (btnNextCard) btnNextCard.addEventListener("click", () => this.nextCard());

        const btnNextFromBack = document.getElementById("btnNextFromBack");
        if (btnNextFromBack) {
          btnNextFromBack.addEventListener("click", () => {
            this.unflip();
            setTimeout(() => this.nextCard(), 120);
          });
        }

        const btnPrevCard = document.getElementById("btnPrevCard");
        if (btnPrevCard) btnPrevCard.addEventListener("click", () => this.prevCard());

        // Mobile / Tablet Touch Swipe
        let touchStartX = 0;
        let touchEndX = 0;
        const viewport = document.getElementById("cardViewport");
        if (viewport) {
          viewport.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
          }, { passive: true });
          viewport.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 50) {
              if (diff < 0) this.nextCard();
              else this.prevCard();
            }
          }, { passive: true });
        }

        // Keyboard Shortcuts
        document.addEventListener("keydown", (e) => {
          if (["SELECT", "INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
          if (e.key === " " || e.key.toLowerCase() === "f") {
            e.preventDefault();
            this.toggleFlip();
          } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "n") {
            e.preventDefault();
            this.nextCard();
          } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "p") {
            e.preventDefault();
            this.prevCard();
          }
        });
      },

      async switchCategory(cat) {
        if (this.category === cat) return;
        this.category = cat;

        const bdsBtn = document.getElementById("tabBtnBds");
        const bcsBtn = document.getElementById("tabBtnBcs");
        if (cat === "BDS") {
          if (bdsBtn) bdsBtn.classList.add("active");
          if (bcsBtn) bcsBtn.classList.remove("active");
        } else {
          if (bcsBtn) bcsBtn.classList.add("active");
          if (bdsBtn) bdsBtn.classList.remove("active");
        }

        await this.loadCategory(cat);
      },

      async preloadCategory(cat) {
        if (this.cache[cat]) return;
        try {
          const res = await fetch(`/api/fetch-sheet?sheet=${encodeURIComponent(cat)}`);
          if (res.ok) {
            let data = [];
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              data = await res.json();
            } else {
              const text = await res.text();
              try { data = JSON.parse(text); } catch { data = parseCSVRows(text); }
            }
            if (Array.isArray(data) && data.length > 0) {
              this.cache[cat] = this.normalizeQuestions(data, cat);
            }
          }
        } catch (e) {
          // Keep backup ready
        }
      },

      normalizeQuestions(data, cat) {
        const validRows = data.filter(r => {
          const qText = (r.Question || r.question || "").toString().trim();
          return qText.length > 0;
        });

        const matching = validRows.filter(r => {
          const tr = (r.track || r.Track || r.category || r.Category || "").toString().trim().toUpperCase();
          return !tr || tr === cat.toUpperCase();
        });

        const targetRows = matching.length > 0 ? matching : validRows;
        if (targetRows.length === 0) return cat === "BDS" ? [...BACKUP_BDS] : [...BACKUP_BCS];

        return targetRows.map(r => {
          const subject = (r.Subject || r.subject || "General").toString().trim();
          const topic = (r.Topic || r.topic || "Core Topic").toString().trim();
          const question = (r.Question || r.question || "").toString().trim();
          const answer = (r.Answer || r.answer || "See explanation").toString().trim();
          const diff = (r.Difficulty || r.difficulty || "").toString().trim();
          const expl = (r.Explanation || r.explanation || "").toString().trim();

          let finalExpl = expl;
          if (!finalExpl && diff) {
            finalExpl = `Difficulty Level: ${diff}`;
          } else if (!finalExpl) {
            finalExpl = `Standard examination topic under ${subject} - ${topic}.`;
          }

          return {
            Category: cat,
            Subject: subject,
            Topic: topic,
            Question: question,
            Answer: answer,
            Difficulty: diff,
            Explanation: finalExpl
          };
        });
      },

      async loadCategory(cat) {
        const statusBadge = document.getElementById("statStatusBadge");
        
        // Instant response if cached!
        if (this.cache[cat] && this.cache[cat].length > 0) {
          this.rawQuestions = this.cache[cat];
          this.applyLoadedQuestions();
          return;
        }

        if (statusBadge) {
          statusBadge.className = "badge-loading";
          statusBadge.innerHTML = `<span class="dot" style="background:#f59e0b"></span><span>Loading questions...</span>`;
        }

        let questions = cat === "BDS" ? [...BACKUP_BDS] : [...BACKUP_BCS];

        try {
          const res = await fetch(`/api/fetch-sheet?sheet=${encodeURIComponent(cat)}`);
          if (res.ok) {
            let data = [];
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              data = await res.json();
            } else {
              const text = await res.text();
              try {
                data = JSON.parse(text);
              } catch {
                data = parseCSVRows(text);
              }
            }

            if (Array.isArray(data) && data.length > 0) {
              questions = this.normalizeQuestions(data, cat);
            }
          }
        } catch (e) {
          // Graceful fallback to backup bank
        }

        this.cache[cat] = questions;
        this.rawQuestions = questions;
        this.applyLoadedQuestions();
      },

      applyLoadedQuestions() {
        const statusBadge = document.getElementById("statStatusBadge");
        if (statusBadge) {
          statusBadge.className = "badge-live";
          statusBadge.innerHTML = `<span class="dot"></span><span>Live Practice</span>`;
        }

        const countEl = document.getElementById("statQuestionCount");
        if (countEl) {
          countEl.textContent = `${this.rawQuestions.length} Questions Available`;
        }

        this.updateSubjectsDropdown();
        this.updateTopicsDropdown();
        this.buildFilteredQueue();
      },

      updateSubjectsDropdown() {
        const subSelect = document.getElementById("selectSubject");
        const counts = {};
        this.rawQuestions.forEach(q => {
          const s = q.Subject || "General";
          counts[s] = (counts[s] || 0) + 1;
        });

        const sorted = Object.keys(counts).sort((a, b) => a.localeCompare(b));
        subSelect.innerHTML = `<option value="all">All Subjects (${this.rawQuestions.length})</option>`;
        sorted.forEach(sub => {
          const opt = document.createElement("option");
          opt.value = sub;
          opt.textContent = `${sub} (${counts[sub]})`;
          subSelect.appendChild(opt);
        });
      },

      updateTopicsDropdown() {
        const topicSelect = document.getElementById("selectTopic");
        const selectedSub = document.getElementById("selectSubject").value;

        const relevant = selectedSub === "all"
          ? this.rawQuestions
          : this.rawQuestions.filter(q => q.Subject === selectedSub);

        const counts = {};
        relevant.forEach(q => {
          const t = q.Topic || "General Topic";
          counts[t] = (counts[t] || 0) + 1;
        });

        const sorted = Object.keys(counts).sort((a, b) => a.localeCompare(b));
        topicSelect.innerHTML = `<option value="all">All Topics (${relevant.length})</option>`;
        sorted.forEach(top => {
          const opt = document.createElement("option");
          opt.value = top;
          opt.textContent = `${top} (${counts[top]})`;
          topicSelect.appendChild(opt);
        });
      },

      buildFilteredQueue() {
        const sub = document.getElementById("selectSubject").value;
        const top = document.getElementById("selectTopic").value;

        let filtered = this.rawQuestions;
        if (sub !== "all") {
          filtered = filtered.filter(q => q.Subject === sub);
        }
        if (top !== "all") {
          filtered = filtered.filter(q => q.Topic === top);
        }

        // Randomize queue one by one
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        this.filteredQueue = shuffled;
        this.currentIndex = 0;
        this.unflip();
        this.renderCard();
      },

      renderCard() {
        this.unflip();

        if (!this.filteredQueue || this.filteredQueue.length === 0) {
          const qText = document.getElementById("questionText");
          if (qText) qText.textContent = "No questions found for this filter.";
          const ansHeadline = document.getElementById("answerHeadline");
          if (ansHeadline) ansHeadline.textContent = "None";
          const explEl = document.getElementById("answerExplanation");
          if (explEl) explEl.textContent = "";
          const counterEl = document.getElementById("cardCounterIndex");
          if (counterEl) counterEl.textContent = "0 / 0";
          const progressBar = document.getElementById("progressBarFill");
          if (progressBar) progressBar.style.width = "0%";
          const nextBtn = document.getElementById("btnNextCard");
          if (nextBtn) nextBtn.disabled = true;
          const prevBtn = document.getElementById("btnPrevCard");
          if (prevBtn) prevBtn.disabled = true;
          return;
        }

        const q = this.filteredQueue[this.currentIndex];
        const counterEl = document.getElementById("cardCounterIndex");
        if (counterEl) counterEl.textContent = `${this.currentIndex + 1} / ${this.filteredQueue.length}`;
        const progressBar = document.getElementById("progressBarFill");
        if (progressBar) {
          const pct = this.filteredQueue.length > 0 ? Math.round(((this.currentIndex + 1) / this.filteredQueue.length) * 100) : 0;
          progressBar.style.width = `${pct}%`;
        }
        const tagsIndicator = document.getElementById("cardTagsIndicator");
        if (tagsIndicator) tagsIndicator.textContent = `${q.Category || this.category} · ${q.Subject || "Subject"} · ${q.Topic || "Topic"}`;

        const catLabel = document.getElementById("frontCategoryLabel");
        if (catLabel) catLabel.textContent = q.Category || this.category;
        const subLabel = document.getElementById("frontSubjectLabel");
        if (subLabel) subLabel.textContent = q.Subject || "Subject";
        const topLabel = document.getElementById("frontTopicLabel");
        if (topLabel) topLabel.textContent = q.Topic || "Topic";

        const qText = document.getElementById("questionText");
        if (qText) qText.textContent = q.Question || "";
        const headline = document.getElementById("answerHeadline");
        if (headline) headline.textContent = q.Answer || "Answer Unavailable";
        const explanationEl = document.getElementById("answerExplanation");
        if (explanationEl) explanationEl.textContent = "";

        const prevBtn = document.getElementById("btnPrevCard");
        if (prevBtn) prevBtn.disabled = this.currentIndex <= 0;
        const nextBtn = document.getElementById("btnNextCard");
        if (nextBtn) nextBtn.disabled = false;
      },

      flip() {
        document.getElementById("flipCardInner").classList.add("flipped");
        this.isFlipped = true;
        AudioEngine.playFlip();
      },

      unflip(playSound = false) {
        document.getElementById("flipCardInner").classList.remove("flipped");
        this.isFlipped = false;
        if (playSound) AudioEngine.playFlip();
      },

      toggleFlip() {
        if (this.isFlipped) {
          this.unflip();
          AudioEngine.playFlip();
        } else {
          this.flip();
        }
      },

      nextCard() {
        if (this.currentIndex < this.filteredQueue.length - 1) {
          this.currentIndex += 1;
        } else {
          // Loop around
          this.currentIndex = 0;
        }
        AudioEngine.playSwipe();
        this.renderCard();
      },

      prevCard() {
        if (this.currentIndex > 0) {
          this.currentIndex -= 1;
          AudioEngine.playSwipe();
          this.renderCard();
        }
      }
    };

    document.addEventListener("DOMContentLoaded", () => App.init());
