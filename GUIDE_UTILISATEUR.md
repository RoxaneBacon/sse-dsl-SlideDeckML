# Guide Utilisateur SlideDeckML

## Table des matières

1. [Introduction](#introduction)
2. [Structure de base](#structure-de-base)
3. [Métadonnées](#métadonnées)
4. [Séparateurs](#séparateurs)
5. [Titres et En-têtes](#titres-et-en-têtes)
6. [Formatage de texte](#formatage-de-texte)
7. [Listes](#listes)
8. [Citations](#citations)
9. [Médias (Images et Vidéos)](#médias-images-et-vidéos)
9. [QR Code](#qr-code)
10. [Blocs de code](#blocs-de-code)
11. [Styles personnalisés](#styles-personnalisés)
12. [Templates](#templates)
13. [Fragments synchronisés](#fragments-synchronisés)
14. [IDE Intégré](#ide-intégré)
15. [Quiz Interactif](#quiz-interactif)
16. [Exemples complets](#exemples-complets)

---

## Introduction

**SlideDeckML** est un langage dédié (DSL) pour créer des présentations de manière simple et intuitive. Ce guide vous explique tous les symboles et leur utilisation avec des exemples pratiques.

---

## Structure de base

Une présentation SlideDeckML se compose de trois parties optionnelles :

```
{métadonnées}
---
{template}
===
{slides}
```

### Exemple minimal

```sdml
{
    author: "Votre Nom"
    title: "Ma Présentation"
}
===
# Première slide

Contenu de votre slide
```

---

## Métadonnées

### Symbole : `{ }`

Les métadonnées définissent les informations générales de votre présentation. Elles doivent être placées **au tout début** du fichier.

### Propriétés disponibles

| Propriété | Obligatoire | Description                              |
| --------- | ----------- | ---------------------------------------- |
| `author`  | Oui         | Nom de l'auteur                          |
| `title`   | Oui         | Titre de la présentation                 |
| `theme`   | Non         | Thème visuel (ex: "dark", "light")       |
| `logo`    | Non         | URL du logo                              |
| `css`     | Non         | URL d'une feuille de style personnalisée |

### Exemple

```sdml
{
    author: "Baptiste Pellerin"
    title: "SlideDeckML - Guide Complet"
    theme: "dark"
    logo: "https://example.com/logo.png"
    css: "https://example.com/custom.css"
}
```

---

## Séparateurs

### `===` - Séparateur de slides

Ce symbole sépare les différentes slides de votre présentation. Chaque slide est indépendante.

```sdml
# Slide 1

Contenu de la première slide

===

# Slide 2

Contenu de la deuxième slide
```

### `---` - Séparateur de template

Ce symbole délimite la section du template (modèle qui apparaît sur chaque slide).

```sdml
---
Template commun à toutes les slides
---
===
# Ma première slide
```

---

## Titres et En-têtes

### Symboles : `#`, `##`, `###`

Les titres utilisent le symbole `#` (similaire à Markdown).

| Symbole | Niveau | Utilisation                 |
| ------- | ------ | --------------------------- |
| `#`     | H1     | Titre principal de la slide |
| `##`    | H2     | Titre de section            |
| `###`   | H3     | Titre de sous-section       |

### Exemple

```sdml
# Titre Principal (H1)

## Sous-titre (H2)

### Section (H3)

Paragraphe normal
```

**Rendu :**

<h1 style="font-size: 2em;">Titre Principal (H1)</h1>
<h2 style="font-size: 1.5em;">Sous-titre (H2)</h2>
<h3 style="font-size: 1.2em;">Section (H3)</h3>

Paragraphe normal

---

## Formatage de texte

### Symboles de formatage inline

| Symbole     | Effet          | Exemple         | Résultat         |
| ----------- | -------------- | --------------- | ---------------- |
| `**texte**` | Gras           | `**Important**` | **Important**    |
| `*texte*`   | Italique       | `*Emphase*`     | _Emphase_        |
| `_texte_`   | Italique (alt) | `_Souligner_`   | _Souligner_      |
| `__texte__` | Souligné       | `__Attention__` | <u>Attention</u> |

### Exemple de combinaisons

```sdml
# Formatage de texte

Vous pouvez **combiner *plusieurs* __formats__** ensemble !

**Texte en gras** pour l'emphase forte

*Texte en italique* pour l'emphase subtile

__Texte souligné__ pour marquer l'importance

Texte **gras et _italique_** en même temps
```

---

## Listes

### Listes non ordonnées

Symboles : `-`, `*`, `+`

Tous ces symboles créent des puces. Ils sont interchangeables.

```sdml
- Premier élément
- Deuxième élément
- Troisième élément

* Alternative avec astérisque
* Deuxième puce

+ Alternative avec plus
+ Deuxième puce
```

**Rendu :**

-   Premier élément
-   Deuxième élément
-   Troisième élément

### Listes ordonnées

Symbole : `1.`, `2.`, etc.

```sdml
1. Première étape
2. Deuxième étape
3. Troisième étape
```

**Rendu :**

1. Première étape
2. Deuxième étape
3. Troisième étape

### Exemple complet

```sdml
# Guide d'installation

## Prérequis

- Node.js version 18+
- npm ou yarn
- Un éditeur de code

## Étapes d'installation

1. Cloner le repository
2. Installer les dépendances
3. Lancer le projet
```

---

## Citations

### Symbole : `>`

Utilisé pour mettre en évidence des citations ou des remarques importantes.

```sdml
> Ceci est une citation importante
> qui peut s'étendre sur plusieurs lignes

> "La simplicité est la sophistication suprême" - Leonardo da Vinci
```

**Rendu :**

> Ceci est une citation importante

---

## Médias (Images et Vidéos)

### Symbole : `![description](url)`

Syntaxe identique à Markdown pour insérer des images et vidéos.

### Images

```sdml
![Logo SlideDeckML](https://via.placeholder.com/600x400/4CAF50/FFFFFF?text=Logo)

![Photo avec description](https://example.com/image.png)
```

### Vidéos

```sdml
![Vidéo de démonstration](https://www.w3schools.com/html/mov_bbb.mp4)
```

### Exemple complet

```sdml
# Galerie Multimédia

## Notre Logo

![Logo de l'entreprise](https://via.placeholder.com/400x200)

## Vidéo de présentation

![Présentation du produit](https://example.com/video.mp4)
```

---

## QR Code

### Symbole : `![QR] "url"`

### Exemple complet

```sdml
![QR] "https://github.com/RoxaneBacon/sse-dsl-SlideDeckML"
```

---

## Blocs de code

### Symbole : ` ``` `

Les blocs de code permettent d'afficher du code avec coloration syntaxique.

### Syntaxe de base

````sdml
```javascript
function hello() {
    console.log("Hello World!");
}
```
````

### Options avancées

#### 1. Langage de programmation

````sdml
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)
```
````

#### 2. Numéros de ligne personnalisés

````sdml
```typescript ['lines:1,2-3']
interface User {
    id: number;
    name: string;
}
```
````

#### 3. Numérotation à partir d'un nombre

````sdml
```java ['start:10']
public class Example {
    private int value;
}
```
````

#### 4. Modes de surlignage

| Mode           | Description                                   | Syntaxe                    |
| -------------- | --------------------------------------------- | -------------------------- |
| `line-by-line` | Surligne ligne par ligne                      | `[highlight:line-by-line]` |
| `block`        | Surligne par blocs (séparés par lignes vides) | `[highlight:block]`        |
| `function`     | Surligne par fonction                         | `[highlight:function]`     |
| `class`        | Surligne par classe                           | `[highlight:class]`        |
| `all`          | Tout surligner                                | `[highlight:all]`          |
| `none`         | Aucun surlignage                              | `[highlight:none]`         |

### Exemples

````sdml
# Démo de Code

## JavaScript avec surlignage ligne par ligne

```javascript [highlight:line-by-line]
function greet(name) {
    console.log('Hello ' + name);
    return true;
}
```

## Python avec numéros de ligne

```python ['lines:1,2-4']
def calculate(a, b):
    result = a + b
    print(f"Result: {result}")
    return result
```

## TypeScript avec début personnalisé

```typescript ['start:42']
interface Config {
    apiUrl: string;
    timeout: number;
}
```

## Code sans coloration

```
Texte brut sans
coloration syntaxique
```
````

---

## Styles personnalisés

### Symbole : `:::`

Les délimiteurs `:::` permettent d'appliquer des styles CSS personnalisés à n'importe quel contenu.

### Syntaxe

```sdml
::: {propriété: 'valeur', propriété: 'valeur'}
Contenu stylisé
:::
```

### Propriétés CSS courantes

| Propriété          | Exemple                | Description          |
| ------------------ | ---------------------- | -------------------- |
| `color`            | `'#FF0000'` ou `'red'` | Couleur du texte     |
| `background-color` | `'#EFEFEF'`            | Couleur de fond      |
| `font-size`        | `'24px'`               | Taille de police     |
| `font-weight`      | `'bold'`               | Épaisseur de police  |
| `text-align`       | `'center'`             | Alignement du texte  |
| `padding`          | `'20px'`               | Espacement intérieur |
| `margin`           | `'10px'`               | Espacement extérieur |
| `border`           | `'2px solid blue'`     | Bordure              |
| `border-radius`    | `'10px'`               | Coins arrondis       |
| `width`            | `'50%'`                | Largeur              |

### Exemples

#### Texte centré et coloré

```sdml
::: {color: '#2c3e50', text-align: 'center'}
# Titre centré en bleu foncé
:::
```

#### Encadré avec fond

```sdml
::: {background-color: '#f39c12', padding: '15px', border-radius: '8px'}
Ceci est un paragraphe important avec un fond orange et des coins arrondis
:::
```

#### Liste stylisée

```sdml
::: {color: '#e74c3c', font-size: '20px'}
- Élément rouge
- Deuxième élément
- Troisième élément
:::
```

#### Image stylisée

```sdml
::: {width: '50%', border: '3px solid #9b59b6', border-radius: '10px'}
![Image avec bordure](https://via.placeholder.com/600x400)
:::
```

#### Citation avec style personnalisé

````
```
```sdml
::: {background: '#ecf0f1', border-left: '4px solid #3498db', padding: '15px', font-style: 'italic'}
> Citation importante avec bordure bleue à gauche
:::
```sdml
```
===
::: {text-align: 'center', color: '#8e44ad', border-bottom: '3px solid #8e44ad', padding-bottom: '10px'}
## Titre avec bordure inférieure
:::

::: {background-color: '#f8f9fa', padding: '20px', border-radius: '10px', margin: '20px 0'}
Paragraphe dans un encadré gris clair avec coins arrondis
:::

::: {display: 'grid', grid-template-columns: '1fr 1fr', gap: '20px'}
![Image 1](https://via.placeholder.com/300)
![Image 2](https://via.placeholder.com/300)
:::
````

---

## Templates

### Symbole : `---`

Un template est un contenu qui apparaît sur **toutes les slides** de votre présentation. Très utile pour les logos, pieds de page, ou éléments récurrents.

### Syntaxe

```sdml
{métadonnées}
---
Contenu du template (apparaît sur chaque slide)
---
===
# Slide 1
===
# Slide 2
```

### Exemple

```sdml
{
    author: "Jean Dupont"
    title: "Présentation avec Template"
}
---
::: {color: 'blue', font-size: '14px', position: 'absolute', bottom: '20px', right: '20px'}
© 2026 - Mon Entreprise
:::
---
===
# Slide 1

Cette slide a le copyright en bas à droite

===
# Slide 2

Cette slide aussi !
```

---

## Fragments synchronisés

### Symbole : `:::[sync-fragments]`

Les fragments synchronisés permettent de faire évoluer du contenu en parallèle avec un bloc de code (par exemple, montrer l'évolution d'une variable).

### Deux modes disponibles

| Mode   | Syntaxe                    | Comportement                        |
| ------ | -------------------------- | ----------------------------------- |
| Normal | `:::[sync-fragments]`      | Remplace le fragment à chaque étape |
| Keep   | `:::[sync-fragments keep]` | Accumule les fragments              |

### Symbole de séparation : `[---]`

Sépare les différents fragments.

### Exemple - Mode Normal (Remplacement)

````
```sdml
::: {display: grid; grid-template-columns: 1fr 1fr; gap: 2em;}
```
```javascript [highlight:line-by-line]
let x = 0;
x = x + 5;
x = x * 2;
console.log(x);
```

:::[sync-fragments]
x = 0
[---]
x = 5
[---]
x = 10
[---]
Output: 10
:::[sync-fragments]

:::
```
````

**Comportement :**

-   Étape 1 : affiche "x = 0"
-   Étape 2 : **remplace** par "x = 5"
-   Étape 3 : **remplace** par "x = 10"
-   Étape 4 : **remplace** par "Output: 10"

### Exemple - Mode Keep (Accumulation)

````
```sdml
::: {display: grid; grid-template-columns: 1fr 1fr; gap: 2em;}

```javascript [highlight:line-by-line]
let x = 0;
x = x + 5;
x = x * 2;
console.log(x);
```

:::[sync-fragments keep]
x = 0
[---]
x = 5
[---]
x = 10
[---]
Output: 10
:::[sync-fragments]

:::
```
````

**Comportement :**

-   Étape 1 : affiche "x = 0"
-   Étape 2 : affiche "x = 0" **ET** "x = 5"
-   Étape 3 : affiche "x = 0", "x = 5" **ET** "x = 10"
-   Étape 4 : affiche tout + "Output: 10"

### Exemple avec images

````
```sdml
::: {display: grid; grid-template-columns: 1fr 1fr; gap: 2em;}

```python [highlight:line-by-line]
img = load_image()
img = apply_filter(img)
img = resize(img)
save(img)
```

:::[sync-fragments]
![Image originale](img1.jpg)
[---]
![Avec filtre](img2.jpg)
[---]
![Redimensionnée](img3.jpg)
[---]
![Sauvegardée](img4.jpg)
:::[sync-fragments]

:::
```
````

---

## IDE Intégré

### Symbole : `,,,ide`

L'IDE intégré permet d'inclure un éditeur de code exécutable directement dans vos slides.

### Syntaxe

````
```sdml
,,,ide python
```
code placeholder (optionnel)
```
output : "python-output",,,
```

output : "python-output"
````

### Langages supportés

Python, JavaScript et SQL

### Exemple complet avec positionnement

Vous pouvez combiner l'éditeur monaco et la fenêtre d'output avec les styles personnalisés pour les placer précisément sur la slide :

````
```sdml
::: {calque: 1, horizontal-margin: 0, vertical-margin: 50}
,,,ide python
```
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y, 'b-', linewidth=2)
plt.title('Sinus Function')
plt.show()
```
output : "python-output",,,
:::

::: {calque: 1, horizontal-margin: 500, vertical-margin: 200}
output : "python-output"
:::
```
````

---

## Quiz Interactif

### Symbole : `:::quiz`

Les quiz interactifs permettent de poser des questions au public en direct. Les réponses peuvent être collectées et visualisées avec des graphiques (bar chart ou pie chart).

### Syntaxe

```sdml
:::quiz
"Titre du Quiz"
showJoinQrCode : true

question : "Votre première question?"
choice "id1" : "Choix 1"
choice "id2" : "Choix 2"
choice "id3" : "Choix 3"
correct : "id1"
visualization : barChart
showResultsOnDemand : true

question : "Deuxième question?"
choice "a" : "Option A"
choice "b" : "Option B"
correct : "b"
visualization : pieChart
showResultsOnDemand : false
:::
```

### Propriétés principales

| Propriété | Type | Description |
| --------- | ---- | ----------- |
| `showJoinQrCode` | booléen | Affiche un QR code pour que les participants se joignent |
| `visualization` | barChart \| pieChart | Type de graphique pour les résultats |
| `showResultsOnDemand` | booléen | Afficher les résultats seulement à la demande de l'host|

---

## Récapitulatif des symboles

| Symbole               | Utilisation            | Exemple                           |
| --------------------- | ---------------------- | --------------------------------- |
| `{ }`                 | Métadonnées            | `{author: "Nom", title: "Titre"}` |
| `===`                 | Séparateur de slides   | `===`                             |
| `---`                 | Séparateur de template | `---`                             |
| `#`                   | Titre H1               | `# Mon Titre`                     |
| `##`                  | Titre H2               | `## Sous-titre`                   |
| `###`                 | Titre H3               | `### Section`                     |
| `**texte**`           | Gras                   | `**Important**`                   |
| `*texte*`             | Italique               | `*Emphase*`                       |
| `_texte_`             | Italique (alt)         | `_Texte_`                         |
| `__texte__`           | Souligné               | `__Attention__`                   |
| `-`, `*`, `+`         | Liste non ordonnée     | `- Élément`                       |
| `1.`, `2.`            | Liste ordonnée         | `1. Premier`                      |
| `>`                   | Citation               | `> Citation`                      |
| `![alt](url)`         | Image/Vidéo            | `![Logo](url)`                    |
| `![QR] "url"`         | QR Code                | `![QR] "url"`                     |
| ` ``` `               | Bloc de code           | ` ```javascript `                 |
| `:::`                 | Styles personnalisés   | `::: {color: 'red'}`              |
| `:::[sync-fragments]` | Fragments synchronisés | `:::[sync-fragments]`             |
| `,,,ide`              | IDE Intégré            | `,,,ide python`                   |
| `:::quiz`             | Quiz Interactif        | `:::quiz`                         |
| `[---]`               | Séparateur de fragment | `[---]`                           |

---

## Conseils et bonnes pratiques

### 1. Organisation

-   **Une idée par slide** : ne surchargez pas vos slides
-   **Utilisez les templates** pour les éléments récurrents
-   **Structurez avec des titres** hiérarchiques

### 2. Formatage

-   **Soyez cohérent** dans vos choix de formatage
-   **Utilisez le gras** pour les mots-clés importants
-   **Les listes** rendent le contenu plus lisible

### 3. Code

-   **Spécifiez le langage** pour une meilleure coloration
-   **Utilisez les fragments synchronisés** pour les explications pas à pas
-   **Limitez la longueur** des blocs de code (10-15 lignes max)

### 4. Styles

-   **Restez simple** : trop de styles nuisent à la lisibilité
-   **Utilisez une palette cohérente** de couleurs
-   **Testez la lisibilité** (contraste texte/fond)

### 5. Médias

-   **Optimisez la taille** des images
-   **Utilisez des URLs absolues** pour les ressources externes
-   **Ajoutez toujours une description** dans `![description](url)`

---

## Pour aller plus loin

Consultez les exemples fournis dans le dossier `examples/sdml/` :

-   `minimal.sdml` - Exemple minimal pour débuter
-   `comprehensive-demo.sdml` - Toutes les fonctionnalités
-   `demo-with-styles.sdml` - Styles CSS personnalisés
-   `code-demo.sdml` - Blocs de code avec options
-   `highlight-demo.sdml` - Modes de surlignage
-   `sync-demo.sdml` - Fragments synchronisés

---

**Bonne création de présentations avec SlideDeckML ! 🎉**
