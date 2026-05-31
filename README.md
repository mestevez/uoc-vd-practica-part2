# Restaurants de Barcelona — Visualització de Dades

## Descripció del projecte

Aquest projecte té com a objectiu analitzar el conjunt de dades relatiu a establiments gastronòmics de Barcelona mitjançant tècniques d'anàlisi visual de les dades.

Els objectius principals són:

1. **Exploració de les dades** — comprendre l'estructura i la distribució dels atributs.
2. **Identificació de patrons** en el comportament dels restaurants.
3. **Anàlisi de correlacions** entre variables com la ubicació, el nivell socioeconòmic, la popularitat i el preu.
4. **Visualitzacions interactives** per a facilitar la presa de decisions basada en dades.

## Descripció de les dades

Les dades es troben a`public/data/data_restaurants_clean.csv`.
Cada fila representa un restaurant de Barcelona amb els atributs principals:

| Camp | Descripció |
|------|------------|
| `name` | Nom del restaurant |
| `zone` | Barri / zona de la ciutat |
| `food` | Tipus(os) de cuina |
| `score` | Puntuació (0–10) |
| `opinions_count` | Nombre d'opinions |
| `price` | Preu mitjà per persona (€) |
| `latitude`, `longitude` | Coordenades geogràfiques |
| `dist_centre_km` | Distància al centre (km) |
| `renda_mitjana_bruta` | Renda mitjana bruta de la zona |
| `open_lunch`, `open_dinner`, `open_weekend` | Horaris d'obertura |

## Tecnologies

- **React 18** — interfície d'usuari
- **D3.js v7** — visualitzacions de dades
- **TypeScript** — tipat estàtic
- **Vite** — empaquetador i servidor de desenvolupament

## Estructura del projecte

```
uoc-vd-practica-part2/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD → GitHub Pages
├── data/                         # Dades originals (CSV)
├── public/
│   └── data/                     # Dades servides a runtime
├── src/
│   ├── components/
│   │   └── charts/
│   │       ├── ScatterChart.tsx      # Preu vs Puntuació (scatter)
│   │       └── TopCuisineChart.tsx   # Top cuines per puntuació (barres)
│   ├── lib/
│   │   └── restaurantData.ts     # Càrrega i tipat de les dades
│   ├── test/
│   │   ├── setup.ts              # Configuració global de tests
│   │   └── restaurantData.test.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .gitignore
├── eslint.config.js              # Configuració ESLint
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts                # Vite + Vitest
```

## Scripts disponibles

| Script | Comanda | Descripció |
|--------|---------|------------|
| Servidor de dev | `npm run dev` | Inicia Vite en mode desenvolupament amb HMR |
| Build producció | `npm run build` | Compila TypeScript i empaqueta amb Vite |
| Previsualitzar build | `npm run preview` | Serveix el build de `dist/` localment |
| Verificar tipus | `npm run check` | Comprova els tipus TypeScript sense emetre fitxers |
| Tests (watch) | `npm test` | Executa Vitest en mode watch interactiu |
| Tests (CI) | `npm run test:run` | Executa tots els tests una sola vegada |
| Cobertura | `npm run test:coverage` | Genera informe de cobertura a `coverage/` |
| Linting | `npm run lint` | Analitza el codi amb ESLint |

## Configuració local

### Prerequisits

- Node.js ≥ 18
- npm ≥ 9

### Instal·lació i execució

```bash
# 1. Accedir a la carpeta del projecte
cd uoc-vd-practica-part2

# 2. Instal·lar dependències
npm install

# 3. Iniciar el servidor de desenvolupament
npm run dev
```

L'aplicació estarà disponible a `http://localhost:5173`.

### Construir per a producció

```bash
npm run build
# La sortida es genera a la carpeta dist/
```

### Previsualitzar el build de producció

```bash
npm run preview
```

### Executar els tests

```bash
npm test             # mode watch (desenvolupament)
npm run test:run     # una sola execució (CI)
npm run test:coverage  # amb informe de cobertura
```

## Desplegament

El projecte es desplega automàticament a **GitHub Pages** cada vegada que es fa un push a la branca `main` (quan hi ha canvis a la carpeta `uoc-vd-practica-part2/`).

El workflow `.github/workflows/deploy.yml` s'encarrega de:
1. Construir l'aplicació (`npm run build`)
2. Pujar l'artefacte a GitHub Pages

> **Nota:** Cal activar GitHub Pages al repositori (Settings → Pages → Source: GitHub Actions) perquè el desplegament funcioni correctament.

## Autoria

| | |
|---|---|
| **Autor** | Marc Estévez Amén |
| **Assignatura** | Visualització de Dades |
| **Programa** | Màster en Ciència de Dades · UOC |
| **Curs** | 2025–2026 |

## Eines i IA generativa

El codi inicial d'aquest projecte ha estat generat amb l'assistència de **GitHub Copilot** (model **Claude Sonnet 4.6**), mitjançant un procés de _prompt engineering_ documentat a la carpeta `prompts/`. Totes les decisions de disseny, estructura i contingut han estat revisades i validades per l'autor.
