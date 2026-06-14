# CyberSafe — Diagrammes PlantUML

Ce dossier contient les 8 diagrammes PlantUML du rapport PPE de CyberSafe.

## Fichiers

| Fichier | Diagramme | Image de sortie |
|---|---|---|
| `01_architecture.puml` | Architecture technique (composants + déploiement) | `images/architecture.png` |
| `02_usecase.puml` | Cas d'utilisation (4 acteurs) | `images/usecase.png` |
| `03_sequence_auth.puml` | Séquence : authentification + RLS | `images/sequence_auth.png` |
| `04_sequence_scenario.puml` | Séquence : déroulement d'un scénario | `images/sequence_scenario.png` |
| `05_sequence_offline.puml` | Séquence : mode hors-ligne + sync | `images/sequence_sync.png` |
| `06_erd.puml` | Entité-Association (base de données) | `images/erd.png` |
| `07_composants.puml` | Composants logiciels (frontend) | `images/composants.png` |
| `08_sequence_ai.puml` | Séquence : assistant IA (config clé + appel Gemini) | `images/sequence_ai.png` |

## Comment générer les images

### Option A — En ligne (le plus simple)

1. Aller sur **https://www.plantuml.com/plantuml/uml/**
2. Coller le contenu d'un fichier `.puml`
3. Télécharger le PNG généré
4. Le renommer selon la colonne "Image de sortie" ci-dessus
5. Le placer dans le dossier `report/images/`

### Option B — PlantUML jar (ligne de commande)

```bash
# Télécharger le jar depuis https://plantuml.com/download
java -jar plantuml.jar diagrams/*.puml -o ../images/
```

### Option C — Extension VS Code

Installer **"PlantUML" par jebbs** (ID: `jebbs.plantuml`), ouvrir un `.puml` et
appuyer sur `Alt+D` pour prévisualiser, puis exporter en PNG.

### Option D — Plugin Overleaf (via import)

Overleaf ne rend pas PlantUML nativement. Générer les PNG avec l'une des méthodes
ci-dessus, puis les importer dans Overleaf via le gestionnaire de fichiers.

---

## Noms des captures d'écran de l'application

Après avoir fait les captures dans l'application déployée, les renommer ainsi et
les placer dans `report/images/` :

| Capture | Nom du fichier |
|---|---|
| Page d'accueil / connexion élève | `screenshot_login_eleve.png` |
| Lobby : liste des scénarios (élève) | `screenshot_eleve_dashboard.png` |
| Écran de quiz (question + choix) | `screenshot_quiz.png` |
| Rétroaction après une réponse | `screenshot_feedback.png` |
| Tableau de bord analytique (enseignant) | `screenshot_enseignant_analytics.png` |
| Recommandations IA (carte violet en bas de l'analytique) | `screenshot_ai_recommendations.png` |
| Éditeur de contenu (super-admin) | `screenshot_superadmin.png` |
| Portail e-himaya (pour comparaison) | `ehimaya_accueil.png` |

> Les deux logos (si disponibles) :
> - `images/logo_men.png` — Logo Ministère de l'Éducation Nationale
> - `images/logo_crmef.png` — Logo CRMEF Casablanca-Settat
