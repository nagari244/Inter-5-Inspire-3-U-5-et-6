/* Inter 5 · Inspire 3 · Unités 5 et 6 — moteur commun des pages
   - Quiz.mount()   : exercices autocorrigés (choix, saisie, écoute synthétisée)
   - AudioBox.mount(): lecteur des pistes du cahier (dossier audio/ ou fichier choisi par l'étudiant)
   - Dictee.mount() : dictée avec comparaison mot à mot
   - Progress       : scores gardés dans le navigateur (localStorage) */

(function () {
    "use strict";

    /* ---------- Stockage local (toujours protégé) ---------- */
    const Store = {
        get(key, fallback) {
            try {
                const v = localStorage.getItem("i3u5:" + key);
                return v === null ? fallback : JSON.parse(v);
            } catch (e) { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem("i3u5:" + key, JSON.stringify(value)); } catch (e) { /* navigation privée */ }
        }
    };

    const Progress = {
        save(id, score, total) {
            const best = Store.get("score:" + id, null);
            if (!best || score / total >= best.score / best.total) {
                Store.set("score:" + id, { score, total, at: new Date().toISOString().slice(0, 10) });
            }
        },
        get(id) { return Store.get("score:" + id, null); },
        /* Accueil : affiche les scores sur les cartes [data-score-id] */
        paint() {
            document.querySelectorAll("[data-score-id]").forEach(el => {
                const p = Progress.get(el.dataset.scoreId);
                if (p) {
                    el.textContent = p.score + " / " + p.total;
                    el.classList.add("done");
                } else {
                    el.textContent = el.dataset.empty || "à faire";
                }
            });
        }
    };

    /* ---------- Normalisation des réponses ---------- */
    function norm(s) {
        return (s || "")
            .toLowerCase()
            .replace(/[’`´]/g, "'")
            .replace(/\s+/g, " ")
            .replace(/\s*'\s*/g, "'")
            .replace(/[.!?;:,]+$/g, "")
            .trim();
    }

    /* ---------- Synthèse vocale (voix française du navigateur) ---------- */
    let frVoice = null;
    function pickVoice() {
        if (!("speechSynthesis" in window)) return;
        const voices = speechSynthesis.getVoices();
        frVoice = voices.find(v => /^fr(-|_)FR/i.test(v.lang)) || voices.find(v => /^fr/i.test(v.lang)) || null;
    }
    if ("speechSynthesis" in window) {
        pickVoice();
        speechSynthesis.onvoiceschanged = pickVoice;
    }
    function say(text, rate) {
        if (!("speechSynthesis" in window)) {
            alert("La synthèse vocale n'est pas disponible dans ce navigateur. Essayez Chrome, Edge ou Safari.");
            return;
        }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "fr-FR";
        if (frVoice) u.voice = frVoice;
        u.rate = rate || 0.9;
        speechSynthesis.speak(u);
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    /* ---------- Exercices autocorrigés ----------
       items : [{ type: "choice"|"input"|"listen", prompt, options, answer, why, say }]
       - choice : answer = index de la bonne option
       - input  : answer = chaîne ou tableau de réponses acceptées
       - listen : comme choice, avec un bouton qui fait entendre item.say */
    const Quiz = {
        mount(root, id, items, opts) {
            opts = opts || {};
            const name = "q" + Math.random().toString(36).slice(2, 7);
            root.classList.add("quiz");
            root.innerHTML = items.map((it, i) => {
                const num = `<span class="q-num">${i + 1}.</span>`;
                let body = "";
                const speak = it.say
                    ? `<button type="button" class="speak-btn" data-say="${esc(it.say)}" aria-label="Écouter"><i class="fa-solid fa-volume-high"></i></button>`
                    : "";
                if (it.type === "input") {
                    const parts = it.prompt.split("___");
                    const field = `<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Réponse ${i + 1}">`;
                    body = `<div class="q-row">${speak}<div class="q-prompt">${num}${parts.length > 1 ? parts[0] + field + parts.slice(1).join("___") : it.prompt + " " + field}</div></div>`;
                } else {
                    body = `<div class="q-row">${speak}<div class="q-prompt">${num}${it.prompt}</div></div>
                        <div class="q-options">${it.options.map((o, j) =>
                            `<label><input type="radio" name="${name}-${i}" value="${j}"> ${o}</label>`).join("")}</div>`;
                }
                return `<div class="q" data-i="${i}">${body}<div class="q-feedback"></div></div>`;
            }).join("");

            root.querySelectorAll(".speak-btn").forEach(b => b.addEventListener("click", () => say(b.dataset.say)));

            const bar = document.createElement("div");
            bar.className = "quiz-bar";
            bar.innerHTML = `
                <button type="button" class="btn btn-navy" data-act="check"><i class="fa-solid fa-square-check"></i>Vérifier mes réponses</button>
                <button type="button" class="btn btn-light" data-act="reset"><i class="fa-solid fa-rotate-right"></i>Recommencer</button>
                <span class="quiz-score" aria-live="polite"></span>`;
            root.after(bar);
            const scoreEl = bar.querySelector(".quiz-score");
            const prev = Progress.get(id);
            if (prev) scoreEl.textContent = "Meilleur score : " + prev.score + " / " + prev.total;

            bar.querySelector('[data-act="check"]').addEventListener("click", () => {
                let ok = 0;
                items.forEach((it, i) => {
                    const q = root.querySelector(`.q[data-i="${i}"]`);
                    const fb = q.querySelector(".q-feedback");
                    let good, expected;
                    if (it.type === "input") {
                        const val = norm(q.querySelector("input").value);
                        const answers = [].concat(it.answer);
                        good = answers.some(a => norm(a) === val);
                        expected = answers[0];
                    } else {
                        const sel = q.querySelector("input:checked");
                        good = !!sel && Number(sel.value) === it.answer;
                        expected = it.options[it.answer];
                    }
                    if (good) ok++;
                    q.classList.remove("ok", "ko");
                    q.classList.add(good ? "ok" : "ko");
                    fb.innerHTML = (good
                        ? '<i class="fa-solid fa-check"></i> Bonne réponse.'
                        : '<i class="fa-solid fa-xmark"></i> Réponse attendue : <b>' + expected + "</b>")
                        + (it.why ? '<span class="why">' + it.why + "</span>" : "");
                });
                scoreEl.textContent = "Score : " + ok + " / " + items.length;
                Progress.save(id, ok, items.length);
                if (opts.onCheck) opts.onCheck(ok, items.length);
            });

            bar.querySelector('[data-act="reset"]').addEventListener("click", () => {
                root.querySelectorAll(".q").forEach(q => {
                    q.classList.remove("ok", "ko");
                    q.querySelectorAll("input[type=text]").forEach(x => { x.value = ""; });
                    q.querySelectorAll("input[type=radio]").forEach(x => { x.checked = false; });
                });
                scoreEl.textContent = "";
                window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
            });
        }
    };

    /* ---------- Lecteur des pistes du cahier ----------
       Cherche audio/<file> à côté des pages ; sinon l'étudiant choisit la piste qu'il possède. */
    const AudioBox = {
        mount(root, file, label) {
            root.classList.add("audio-panel");
            root.innerHTML = `
                <div class="ap-head">
                    <div class="ap-icon"><i class="fa-solid fa-headphones-simple"></i></div>
                    <div><b>${label}</b><div class="muted">Fichier attendu : <code>audio/${file}</code></div></div>
                </div>
                <audio controls preload="metadata"></audio>
                <div class="ap-tools">
                    <button type="button" class="btn btn-light btn-sm" data-a="back"><i class="fa-solid fa-backward"></i>5 s</button>
                    <button type="button" class="btn btn-light btn-sm" data-a="speed"><i class="fa-solid fa-gauge"></i><span>Vitesse 1×</span></button>
                    <label class="btn btn-light btn-sm"><i class="fa-solid fa-folder-open"></i>Choisir le fichier
                        <input type="file" accept="audio/*" class="hidden">
                    </label>
                </div>
                <p class="ap-msg"></p>`;
            const audio = root.querySelector("audio");
            const msg = root.querySelector(".ap-msg");
            const speeds = [1, 0.85, 0.75];
            let s = 0;
            audio.src = "audio/" + file;
            audio.addEventListener("error", () => {
                if (audio.dataset.local) return;
                msg.classList.add("warn");
                msg.innerHTML = '<i class="fa-solid fa-circle-info"></i> La piste n\'est pas en ligne (droits de l\'éditeur). Cliquez sur <b>« Choisir le fichier »</b> et sélectionnez la piste de votre cahier.';
            });
            root.querySelector('[data-a="back"]').addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 5); });
            root.querySelector('[data-a="speed"]').addEventListener("click", e => {
                s = (s + 1) % speeds.length;
                audio.playbackRate = speeds[s];
                e.currentTarget.querySelector("span").textContent = "Vitesse " + String(speeds[s]).replace(".", ",") + "×";
            });
            root.querySelector('input[type=file]').addEventListener("change", e => {
                const f = e.target.files[0];
                if (!f) return;
                audio.dataset.local = "1";
                audio.src = URL.createObjectURL(f);
                msg.classList.remove("warn");
                msg.innerHTML = '<i class="fa-solid fa-check"></i> Fichier chargé : ' + esc(f.name);
            });
            return audio;
        }
    };

    /* ---------- Dictée : comparaison mot à mot ---------- */
    function words(s) { return norm(s).replace(/[«»"()]/g, " ").replace(/([.,;:!?])/g, " ").split(" ").filter(Boolean); }
    function diffHtml(ref, got) {
        const a = words(ref), b = words(got);
        const m = a.length, n = b.length;
        const L = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
            L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
        const out = [];
        let i = 0, j = 0, good = 0;
        while (i < m && j < n) {
            if (a[i] === b[j]) { out.push(esc(a[i])); i++; j++; good++; }
            else if (L[i + 1][j] >= L[i][j + 1]) { out.push("<ins>" + esc(a[i]) + "</ins>"); i++; }
            else { out.push("<del>" + esc(b[j]) + "</del>"); j++; }
        }
        while (i < m) out.push("<ins>" + esc(a[i++]) + "</ins>");
        while (j < n) out.push("<del>" + esc(b[j++]) + "</del>");
        return { html: out.join(" "), good, total: a.length };
    }

    /* sentences : phrases lues par la synthèse vocale (dictée d'entraînement) */
    const Dictee = {
        mount(root, id, sentences) {
            root.innerHTML = sentences.map((s, i) => `
                <div class="q" data-i="${i}">
                    <div class="q-row" style="margin-bottom:.5rem">
                        <button type="button" class="speak-btn" aria-label="Écouter la phrase ${i + 1}"><i class="fa-solid fa-volume-high"></i></button>
                        <button type="button" class="btn btn-light btn-sm" data-slow><i class="fa-solid fa-person-walking"></i>Lentement</button>
                        <span class="q-num">Phrase ${i + 1}</span>
                    </div>
                    <textarea rows="2" style="min-height:3.2rem" aria-label="Phrase ${i + 1}" spellcheck="false"></textarea>
                    <div class="q-feedback diff"></div>
                </div>`).join("");
            root.classList.add("quiz");
            root.querySelectorAll(".q").forEach((q, i) => {
                q.querySelector(".speak-btn").addEventListener("click", () => say(sentences[i], 0.85));
                q.querySelector("[data-slow]").addEventListener("click", () => say(sentences[i], 0.6));
            });
            const bar = document.createElement("div");
            bar.className = "quiz-bar";
            bar.innerHTML = `<button type="button" class="btn btn-navy"><i class="fa-solid fa-spell-check"></i>Comparer avec le texte</button>
                <span class="muted"><ins style="background:var(--ok-soft);color:var(--ok);text-decoration:none">vert</ins> : mot oublié ou mal écrit · <del style="background:var(--ko-soft);color:var(--ko)">rouge</del> : ce que vous avez écrit</span>
                <span class="quiz-score" aria-live="polite"></span>`;
            root.after(bar);
            bar.querySelector("button").addEventListener("click", () => {
                let good = 0, total = 0, perfect = 0;
                root.querySelectorAll(".q").forEach((q, i) => {
                    const typed = q.querySelector("textarea").value;
                    if (!typed.trim()) {
                        /* Phrase non écrite : on ne dévoile pas le texte */
                        total += words(sentences[i]).length;
                        q.classList.remove("ok");
                        q.classList.add("ko");
                        q.querySelector(".q-feedback").innerHTML = '<i class="fa-solid fa-pen"></i> Écrivez d\'abord la phrase, puis comparez.';
                        return;
                    }
                    const d = diffHtml(sentences[i], typed);
                    good += d.good; total += d.total;
                    const ok = d.good === d.total && words(q.querySelector("textarea").value).length === d.total;
                    if (ok) perfect++;
                    q.classList.remove("ok", "ko");
                    q.classList.add(ok ? "ok" : "ko");
                    q.querySelector(".q-feedback").innerHTML = (ok ? '<i class="fa-solid fa-check"></i> Parfait. ' : "") + "<span class='why'>" + d.html + "</span>";
                });
                bar.querySelector(".quiz-score").textContent = "Mots corrects : " + good + " / " + total;
                Progress.save(id, perfect, sentences.length);
            });
        }
    };

    /* ---------- Notes de l'étudiant (gardées dans le navigateur) ---------- */
    function keepNotes(scope) {
        document.querySelectorAll("[data-note]").forEach(el => {
            const key = "note:" + scope + ":" + el.dataset.note;
            el.value = Store.get(key, "");
            el.addEventListener("input", () => Store.set(key, el.value));
        });
    }

    /* ---------- Cases à cocher persistantes ---------- */
    function keepChecks(scope) {
        document.querySelectorAll("input[type=checkbox][data-check]").forEach(el => {
            const key = "check:" + scope + ":" + el.dataset.check;
            el.checked = Store.get(key, false);
            el.addEventListener("change", () => Store.set(key, el.checked));
        });
    }

    window.I3 = { Quiz, AudioBox, Dictee, Progress, Store, say, keepNotes, keepChecks };
})();
