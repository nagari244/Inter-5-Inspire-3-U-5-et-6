/* Moteur d'exercices autocorrigés — Inter 5 · Inspire 3
   Types : qcm (choix), conj (conjugaison avec diagnostic d'erreur), ordre (chronologie).
   Aucune donnée n'est enregistrée. */
(function () {
  "use strict";

  var IMP = {
    avoir: ["avais", "avais", "avait", "avions", "aviez", "avaient"],
    etre: ["étais", "étais", "était", "étions", "étiez", "étaient"]
  };
  var PRES = {
    avoir: ["ai", "as", "a", "avons", "avez", "ont"],
    etre: ["suis", "es", "est", "sommes", "êtes", "sont"]
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/[’`´ʼ]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/\s*'\s*/g, "'")
      .trim()
      .replace(/[.!?;,]+$/, "");
  }
  function noAcc(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------- Bloc d'exercice (titre, consigne, score) ---------- */
  function shell(root, cfg) {
    root.classList.add("ex");
    root.innerHTML = "";
    var head = el("div", "ex-head");
    var h = el("h3", null, (cfg.num ? '<span class="num ' + (cfg.color || "c-bleu") + '">' + esc(cfg.num) + "</span>" : "") + esc(cfg.titre));
    var sc = el("div", "score");
    sc.setAttribute("aria-live", "polite");
    head.appendChild(h); head.appendChild(sc);
    root.appendChild(head);
    if (cfg.consigne) root.appendChild(el("p", "consigne", cfg.consigne));
    var list = el("div", "items");
    root.appendChild(list);
    var state = { total: 0, done: 0, firstOk: 0 };
    function update() {
      sc.textContent = "Score : " + state.firstOk + " / " + state.total + (state.done === state.total && state.total ? " ✓ terminé" : "");
    }
    var row = el("div", "btn-row");
    var reset = el("button", "btn small", "Recommencer");
    reset.type = "button";
    row.appendChild(reset);
    root.appendChild(row);
    return { list: list, state: state, update: update, reset: reset };
  }

  /* ---------- QCM ---------- */
  function qcm(root, cfg) {
    var s = shell(root, cfg);
    function build() {
      s.list.innerHTML = "";
      s.state.total = cfg.items.length; s.state.done = 0; s.state.firstOk = 0;
      cfg.items.forEach(function (it, idx) {
        var box = el("div", "item");
        box.appendChild(el("p", "q", '<span class="n">' + (idx + 1) + ".</span> " + it.q));
        var opts = el("div", "opts");
        var fb = el("p", "fb");
        fb.setAttribute("aria-live", "polite");
        var tries = 0, solved = false;
        var order = it.options.map(function (_, i) { return i; });
        if (cfg.melanger) order = shuffle(order);
        order.forEach(function (oi) {
          var b = el("button", "opt", it.options[oi]);
          b.type = "button";
          b.addEventListener("click", function () {
            if (solved) return;
            tries++;
            if (oi === it.answer) {
              solved = true;
              b.classList.add("is-ok");
              Array.prototype.forEach.call(opts.children, function (x) { x.disabled = true; });
              if (tries === 1) s.state.firstOk++;
              s.state.done++;
              fb.className = "fb ok";
              fb.innerHTML = '<b class="t">' + (tries === 1 ? "Bravo !" : "Oui, c'est ça.") + "</b> " + (it.ok || "");
              s.update();
            } else {
              b.classList.add("is-ko");
              b.disabled = true;
              fb.className = "fb ko";
              var msg = (it.fb && it.fb[oi]) || cfg.fbDefaut || "Ce n'est pas la bonne réponse. Relisez la phrase et essayez encore.";
              fb.innerHTML = '<b class="t">Pas encore.</b> ' + msg;
            }
          });
          opts.appendChild(b);
        });
        box.appendChild(opts); box.appendChild(fb);
        s.list.appendChild(box);
      });
      s.update();
    }
    s.reset.addEventListener("click", build);
    build();
  }

  /* ---------- Conjugaison avec diagnostic ---------- */
  function expected(it) {
    var aux = (it.tense === "pc" ? PRES : IMP)[it.aux][it.p];
    return (it.pron || "") + aux + " " + it.pp + (it.acc || "");
  }

  function diagnose(raw, it) {
    var ans = norm(it.answer || expected(it));
    var v = norm(raw);
    var tenseName = it.tense === "pc" ? "passé composé" : "plus-que-parfait";
    var auxName = it.aux === "etre" ? "être" : "avoir";
    var want = (it.tense === "pc" ? PRES : IMP)[it.aux][it.p];
    if (!v) return { ok: false, msg: "Écrivez votre réponse dans la case." };
    if (/^j'/.test(v) && !/^j'/.test(ans)) v = v.slice(2).trim(); // « j' » déjà écrit dans la phrase
    var accepted = [ans].concat((it.alts || []).map(norm));
    if (accepted.indexOf(v) > -1) return { ok: true };
    if (accepted.map(noAcc).indexOf(noAcc(v)) > -1) return { ok: false, msg: "Presque ! La forme est juste, mais vérifiez les <b>accents</b>." };

    var rest = v;
    if (it.pron) {
      var pr = norm(it.pron).replace(/\s+$/, "");
      if (rest.indexOf(pr) === 0) {
        rest = rest.slice(pr.length).trim();
      } else if (/^(se |me |te |s'|m'|t'|nous |vous )/.test(rest)) {
        return { ok: false, msg: "Vérifiez le pronom : devant une voyelle, on écrit « " + esc(it.pron.trim()) + " » (élision)." };
      } else {
        return { ok: false, msg: "« " + esc(it.verb) + " » est un verbe pronominal : n'oubliez pas le pronom « " + esc(it.pron.trim()) + " »." };
      }
    }
    var parts = rest.split(" ");
    if (parts.length < 2) {
      return { ok: false, msg: "Au " + tenseName + ", il faut <b>deux mots</b> : l'auxiliaire (avoir ou être) " + (it.tense === "pc" ? "au présent" : "à l'imparfait") + " + le participe passé." };
    }
    var a = noAcc(parts[0]);
    var part = noAcc(parts.slice(1).join(" "));
    function idx(list) { return list.map(noAcc).indexOf(a); }
    var why = it.why ? " (" + it.why + ")" : "";
    var auxMsg = it.aux === "etre"
      ? "« " + esc(it.verb) + " » se conjugue avec <b>être</b>" + why + "."
      : "« " + esc(it.verb) + " » se conjugue avec <b>avoir</b>" + why + ".";
    var other = it.aux === "avoir" ? "etre" : "avoir";

    if (it.tense !== "pc" && (idx(PRES.avoir) > -1 || idx(PRES.etre) > -1)) {
      var m = "« " + esc(parts[0]) + " » est au <b>présent</b> : c'est la forme du passé composé. Au plus-que-parfait, l'auxiliaire est à l'<b>imparfait</b>.";
      if (idx(PRES[other]) > -1) m += " Et attention : " + auxMsg;
      if (it.ctx) m += " " + it.ctx;
      return { ok: false, msg: m };
    }
    if (it.tense === "pc" && (idx(IMP.avoir) > -1 || idx(IMP.etre) > -1)) {
      var m2 = "Vous avez mis l'auxiliaire à l'imparfait : c'est un plus-que-parfait. Ici, cette action est le <b>repère</b> → <b>passé composé</b> (auxiliaire au présent).";
      if (idx(IMP[other]) > -1) m2 += " Et attention : " + auxMsg;
      if (it.ctx) m2 += " " + it.ctx;
      return { ok: false, msg: m2 };
    }
    var famOther = (it.tense === "pc" ? PRES : IMP)[other];
    if (famOther.map(noAcc).indexOf(a) > -1) return { ok: false, msg: auxMsg };
    var fam = (it.tense === "pc" ? PRES : IMP)[it.aux];
    if (fam.map(noAcc).indexOf(a) > -1 && a !== noAcc(want)) {
      return { ok: false, msg: "Vérifiez la <b>personne</b> : avec « " + esc(it.subj) + " », l'auxiliaire est « " + esc(want) + " »." };
    }
    if (a !== noAcc(want)) {
      return { ok: false, msg: "Le premier mot doit être l'auxiliaire " + auxName + " " + (it.tense === "pc" ? "au présent" : "à l'imparfait") + "." };
    }
    // L'auxiliaire est correct : on regarde le participe.
    var pp = noAcc(it.pp), acc = it.acc || "";
    if (it.aux === "etre") {
      if (part === pp && acc) return { ok: false, msg: "Avec <b>être</b>, le participe s'accorde avec le sujet (« " + esc(it.subj) + " ») : ajoutez <b>-" + esc(acc) + "</b>." };
      if (part.indexOf(pp) === 0) {
        return { ok: false, msg: acc ? "Vérifiez l'<b>accord</b> : avec le sujet « " + esc(it.subj) + " », le participe se termine par <b>-" + esc(acc) + "</b>." : "Le sujet « " + esc(it.subj) + " » est masculin singulier : pas de -e ni de -s." };
      }
    } else if (part.indexOf(pp) === 0 && part.length > pp.length) {
      return { ok: false, msg: "Avec <b>avoir</b>, le participe passé ne s'accorde pas avec le sujet." };
    }
    return { ok: false, msg: "Vérifiez le <b>participe passé</b> de « " + esc(it.verb) + " »" + (it.hint ? " : " + it.hint : ".") };
  }

  function addAccents(container, input) {
    var bar = el("div", "accents");
    ["é", "è", "ê", "à", "ç", "î", "û", "'"].forEach(function (ch) {
      var b = el("button", null, ch);
      b.type = "button";
      b.setAttribute("aria-label", "Insérer " + ch);
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });
      b.addEventListener("click", function () {
        var st = input.selectionStart != null ? input.selectionStart : input.value.length;
        var en = input.selectionEnd != null ? input.selectionEnd : input.value.length;
        input.value = input.value.slice(0, st) + ch + input.value.slice(en);
        input.focus();
        try { input.setSelectionRange(st + 1, st + 1); } catch (e) {}
      });
      bar.appendChild(b);
    });
    container.appendChild(bar);
  }

  function conj(root, cfg) {
    var s = shell(root, cfg);
    function build() {
      s.list.innerHTML = "";
      s.state.total = cfg.items.length; s.state.done = 0; s.state.firstOk = 0;
      cfg.items.forEach(function (it, idx) {
        var box = el("div", "item");
        var parts = it.text.split("___");
        var line = el("div", "conj-line");
        line.appendChild(el("span", "n", (idx + 1) + "."));
        if (parts[0]) line.appendChild(el("span", null, parts[0]));
        var input = el("input");
        input.type = "text"; input.lang = "fr";
        input.setAttribute("autocomplete", "off"); input.setAttribute("autocapitalize", "none");
        input.setAttribute("autocorrect", "off"); input.setAttribute("spellcheck", "false");
        input.setAttribute("aria-label", "Réponse " + (idx + 1));
        line.appendChild(input);
        if (parts[1]) line.appendChild(el("span", null, parts[1]));
        box.appendChild(line);
        addAccents(box, input);
        var row = el("div", "btn-row");
        var check = el("button", "btn primary small", "Vérifier"); check.type = "button";
        var show = el("button", "btn small", "Voir la réponse"); show.type = "button"; show.hidden = true;
        row.appendChild(check); row.appendChild(show);
        box.appendChild(row);
        var fb = el("p", "fb"); fb.setAttribute("aria-live", "polite");
        box.appendChild(fb);
        var tries = 0, solved = false;
        function finish(byUser) {
          solved = true; input.readOnly = true; check.disabled = true; show.hidden = true;
          s.state.done++;
          if (byUser && tries === 1) s.state.firstOk++;
          s.update();
        }
        function verify() {
          if (solved) return;
          var r = diagnose(input.value, it);
          if (!norm(input.value)) { fb.className = "fb ko"; fb.innerHTML = r.msg; return; }
          tries++;
          if (r.ok) {
            input.classList.remove("is-ko"); input.classList.add("is-ok");
            fb.className = "fb ok";
            fb.innerHTML = '<b class="t">' + (tries === 1 ? "Bravo !" : "Oui, c'est ça.") + "</b> " + (it.ok || "");
            finish(true);
          } else {
            input.classList.add("is-ko");
            fb.className = "fb ko";
            fb.innerHTML = r.msg;
            show.hidden = false;
          }
        }
        check.addEventListener("click", verify);
        input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); verify(); } });
        show.addEventListener("click", function () {
          input.value = it.answer || expected(it);
          input.classList.remove("is-ko");
          fb.className = "fb ok";
          fb.innerHTML = '<b class="t">Réponse :</b> ' + esc(it.answer || expected(it)) + ". " + (it.ok || "");
          finish(false);
        });
        s.list.appendChild(box);
      });
      s.update();
    }
    s.reset.addEventListener("click", build);
    build();
  }

  /* ---------- Ordre chronologique ---------- */
  function ordre(root, cfg) {
    var s = shell(root, cfg);
    function build() {
      s.list.innerHTML = "";
      s.state.total = cfg.items.length; s.state.done = 0; s.state.firstOk = 0;
      cfg.items.forEach(function (it, idx) {
        var box = el("div", "item");
        box.appendChild(el("p", "q", '<span class="n">' + (idx + 1) + ".</span> " + it.texte));
        box.appendChild(el("p", "consigne", "Touchez les actions de la <b>plus ancienne</b> à la <b>plus récente</b>."));
        var picked = el("div", "order-picked");
        var pool = el("div", "order-pool");
        var fb = el("p", "fb"); fb.setAttribute("aria-live", "polite");
        var chosen = [], tries = 0, solved = false;
        function render() {
          picked.innerHTML = ""; pool.innerHTML = "";
          chosen.forEach(function (ei, k) {
            var b = el("button", "opt", '<span class="rank">' + (k + 1) + "</span><span>" + it.etapes[ei] + "</span>");
            b.type = "button";
            if (solved) { b.disabled = true; b.classList.add("is-ok"); }
            b.addEventListener("click", function () { if (solved) return; chosen.splice(k, 1); render(); });
            picked.appendChild(b);
          });
          it._ordre.forEach(function (ei) {
            if (chosen.indexOf(ei) > -1) return;
            var b = el("button", "opt", it.etapes[ei]);
            b.type = "button";
            b.addEventListener("click", function () { chosen.push(ei); render(); });
            pool.appendChild(b);
          });
        }
        it._ordre = shuffle(it.etapes.map(function (_, i) { return i; }));
        // éviter de proposer directement le bon ordre
        if (it._ordre.every(function (v, i) { return v === i; })) it._ordre.reverse();
        render();
        var row = el("div", "btn-row");
        var check = el("button", "btn primary small", "Vérifier"); check.type = "button";
        var clear = el("button", "btn small", "Effacer"); clear.type = "button";
        row.appendChild(check); row.appendChild(clear);
        check.addEventListener("click", function () {
          if (solved) return;
          if (chosen.length < it.etapes.length) { fb.className = "fb ko"; fb.innerHTML = "Classez toutes les actions avant de vérifier."; return; }
          tries++;
          var good = chosen.every(function (v, i) { return v === i; });
          if (good) {
            solved = true; check.disabled = true; clear.disabled = true;
            if (tries === 1) s.state.firstOk++;
            s.state.done++; s.update();
            fb.className = "fb ok";
            fb.innerHTML = '<b class="t">' + (tries === 1 ? "Bravo !" : "Oui, c'est ça.") + "</b> " + (it.ok || "");
            render();
          } else {
            var firstBad = chosen.findIndex(function (v, i) { return v !== i; });
            var nb = chosen.filter(function (v, i) { return v === i; }).length;
            fb.className = "fb ko";
            fb.innerHTML = "<b>" + nb + " / " + it.etapes.length + "</b> à la bonne place. La position " + (firstBad + 1) + " n'est pas correcte. " + (it.indice || "Cherchez le repère au passé composé : les actions au plus-que-parfait sont antérieures.");
          }
        });
        clear.addEventListener("click", function () { if (!solved) { chosen = []; render(); fb.className = "fb"; fb.innerHTML = ""; } });
        box.appendChild(picked); box.appendChild(pool); box.appendChild(row); box.appendChild(fb);
        s.list.appendChild(box);
      });
      s.update();
    }
    s.reset.addEventListener("click", build);
    build();
  }

  /* ---------- Lecteur audio : fichier enregistré, sinon synthèse vocale ---------- */
  function audio(root, cfg) {
    root.innerHTML = "";
    var player = el("audio");
    player.controls = true; player.preload = "metadata"; player.style.width = "100%";
    var tts = el("div");
    tts.hidden = true;
    var note = el("p", "notice");
    root.appendChild(player); root.appendChild(tts); root.appendChild(note);
    function useTTS() {
      player.remove();
      tts.hidden = false;
      if (!("speechSynthesis" in window)) {
        note.innerHTML = "La lecture audio n'est pas disponible sur cet appareil. Demandez l'enregistrement à votre professeur.";
        return;
      }
      tts.innerHTML = '<div class="btn-row"><button type="button" class="btn primary" data-a="play">▶ Écouter</button>' +
        '<button type="button" class="btn" data-a="stop">■ Arrêter</button>' +
        '<label class="btn" style="display:inline-flex;align-items:center;gap:6px">Vitesse ' +
        '<select data-a="rate" style="font:inherit;border:none;background:transparent"><option value="0.82">lente</option><option value="0.95" selected>normale</option></select></label></div>';
      note.innerHTML = "Lecture par la voix de synthèse de votre appareil.";
      var voice = null;
      function pick() {
        var vs = speechSynthesis.getVoices();
        voice = vs.find(function (x) { return /^fr[-_]FR/i.test(x.lang); }) || vs.find(function (x) { return /^fr/i.test(x.lang); }) || null;
        if (!voice && vs.length) note.innerHTML = "Aucune voix française trouvée sur cet appareil : la lecture risque d'être incorrecte. Demandez l'enregistrement à votre professeur.";
      }
      pick();
      if (typeof speechSynthesis.onvoiceschanged !== "undefined") speechSynthesis.onvoiceschanged = pick;
      var rateSel = tts.querySelector("[data-a=rate]");
      tts.querySelector("[data-a=play]").addEventListener("click", function () {
        speechSynthesis.cancel();
        var phrases = cfg.texte.match(/[^.!?…]+[.!?…]+["»]?\s*/g) || [cfg.texte];
        phrases.forEach(function (p) {
          var u = new SpeechSynthesisUtterance(p.trim());
          u.lang = "fr-FR"; if (voice) u.voice = voice;
          u.rate = parseFloat(rateSel.value);
          speechSynthesis.speak(u);
        });
      });
      tts.querySelector("[data-a=stop]").addEventListener("click", function () { speechSynthesis.cancel(); });
    }
    if (cfg.src) {
      player.src = cfg.src;
      player.addEventListener("error", useTTS);
      player.addEventListener("loadedmetadata", function () { note.innerHTML = "Enregistrement audio."; });
    } else {
      useTTS();
    }
  }

  window.Exos = { qcm: qcm, conj: conj, ordre: ordre, audio: audio, diagnose: diagnose, expected: expected };
})();
