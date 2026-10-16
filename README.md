# Inter 5 · Inspire 3, unités 5 et 6

Séquence pédagogique en classe inversée pour l'unité 5 d'Inspire 3, « Comment améliorer son cadre de vie ? » : leçons 17 à 19, bilan et évaluation orale du 11 novembre. L'unité 6 sera ajoutée plus tard.

## Contenu

- `index.html` : page d'accueil. On y trouve le principe de la classe inversée, puis les 17 séances : avant le cours, déroulé minuté, après le cours. Suivent le mini-site, les productions écrites, les grilles d'évaluation et l'auto-évaluation.
- Capsules à faire avant le cours : `lexique-l17.html`, `capsule-gerondif.html`, `lexique-l18.html`, `capsule-plus-que-parfait.html`, `capsule-marqueurs-temporels.html`, `capsule-accord-participe.html`, `lexique-l19.html`.
- Écoutes à faire après le cours : `co-piste40.html`, `co-piste42.html`, `co-piste43.html`, `co-piste48.html`, `dictee-piste41.html`, `dictee-piste44.html`, `dictee-piste45.html`, `phonetique-piste46.html`, `phonetique-piste47.html`.
- `assets/style.css` : palette reprise de « DELF B1 – Compréhension de l'oral ». Fond clair, bleu marine, les cinq couleurs de la Francophonie, aucun dégradé.
- `assets/app.js` : exercices autocorrigés, lecteur audio, dictées, scores gardés dans le navigateur.

## L'audio et les droits

Les pistes MP3 du cahier ne sont **pas** publiées : `.gitignore` les exclut du dépôt. Chaque page d'écoute offre deux possibilités :

1. Elle charge `audio/pisteNN.mp3`. C'est la version ZIP distribuée sur la plateforme du cours : copier les pistes dans `audio/` sous les noms `piste40.mp3` … `piste48.mp3`.
2. Sinon, l'étudiant clique sur « Choisir le fichier » et sélectionne la piste qu'il possède.

Les exercices complémentaires (gérondif, plus-que-parfait, visite du Havre, dictées d'entraînement, phonétique) utilisent la voix française du navigateur. Ils fonctionnent sans aucun fichier audio.

## Publier avec GitHub Pages

Settings → Pages → « Deploy from a branch », branche `main`, dossier `/ (root)`.
