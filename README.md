# Inter 5 · Inspire 3, unités 5 et 6

Séquence pédagogique en classe inversée pour l'unité 5 d'Inspire 3, « Comment améliorer son cadre de vie ? » : leçons 17 à 19, bilan et évaluation orale du 11 novembre. L'unité 6 sera ajoutée plus tard.

## Contenu

- `index.html` : page d'accueil. On y trouve le principe de la classe inversée, puis les 17 séances : avant le cours, déroulé minuté, après le cours. Suivent le mini-site, les productions écrites, les grilles d'évaluation et l'auto-évaluation.
- Capsules à faire avant le cours : `lexique-l17.html`, `capsule-gerondif.html`, `lexique-l18.html`, `capsule-plus-que-parfait.html`, `capsule-marqueurs-temporels.html`, `capsule-accord-participe.html`, `lexique-l19.html`.
- Écoutes à faire après le cours : `co-piste40.html`, `co-piste42.html`, `co-piste43.html`, `co-piste48.html`, `dictee-piste41.html`, `dictee-piste44.html`, `dictee-piste45.html`, `phonetique-piste46.html`, `phonetique-piste47.html`.
- `assets/style.css` : palette reprise de « DELF B1 – Compréhension de l'oral ». Fond clair, bleu marine, les cinq couleurs de la Francophonie, aucun dégradé.
- `assets/app.js` : exercices autocorrigés, lecteur audio, dictées, scores gardés dans le navigateur.

## Systématisation du plus-que-parfait (leçons 18-19)

Page d'entrée : `systematisation-pqp.html` (carte « Systématisation » dans le mini-site d'autonomie).

- `u5-vocabulaire-ville.html` : localisation, articles contractés, mots de la ville.
- `u5-pqp-1-formation.html` : formation, choix de l'auxiliaire, conjugaison avec explication de chaque erreur.
- `u5-pqp-2-pc-pqp.html` : le passé composé est le repère, le plus-que-parfait revient en arrière.
- `u5-pqp-3-ecoute.html` : écoute « Ma première salle de bains » (témoignage imaginé) et médiation.
- `u5-pqp-4-micro-dialogues.html` : cartes de micro-dialogues, dont médiation, et minuteur.
- `u5-pqp-5-ecrit.html` : sujets de production écrite, à rédiger sur papier ou dans un document.
- `assets/systematisation.css` et `assets/exercices.js` : style et moteur propres à ces pages. Ils ne modifient ni `assets/style.css` ni `assets/app.js`.

L'écoute utilise la voix française du navigateur. Pour la remplacer par un enregistrement, déposer `audio/u5-ecoute-odette.mp3` : comme `.gitignore` exclut les MP3, l'ajouter avec `git add -f audio/u5-ecoute-odette.mp3`.

## L'audio et les droits

Les pistes MP3 du cahier ne sont **pas** publiées : `.gitignore` les exclut du dépôt. Chaque page d'écoute offre deux possibilités :

1. Elle charge `audio/pisteNN.mp3`. C'est la version ZIP distribuée sur la plateforme du cours : copier les pistes dans `audio/` sous les noms `piste40.mp3` … `piste48.mp3`.
2. Sinon, l'étudiant clique sur « Choisir le fichier » et sélectionne la piste qu'il possède.

Les exercices complémentaires (gérondif, plus-que-parfait, visite du Havre, dictées d'entraînement, phonétique) utilisent la voix française du navigateur. Ils fonctionnent sans aucun fichier audio.

## Publier avec GitHub Pages

Settings → Pages → « Deploy from a branch », branche `main`, dossier `/ (root)`.
