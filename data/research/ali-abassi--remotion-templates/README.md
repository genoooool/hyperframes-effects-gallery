# Remotion Templates

A searchable library of **1,000 reusable Remotion templates** for developers and AI coding agents.

The collection contains 100 template families with generated thumbnails, muted MP4 previews, validated default props, and agent-facing recipes that explain when and how to compose each template.

## What is included

- **1,000 templates** across 100 reusable family engines
- **Playable previews** and thumbnails for every registry entry
- **Agent catalog** with visual role, inputs, timing, composition guidance, constraints, and usage examples
- **Searchable static website** with category filters and copyable props/recipes
- **Mechanical acceptance gate** covering TypeScript, bundling, and reduced render smoke tests
- **Research and provenance records** for official and third-party-inspired mechanics
- **`SKILL.md`** with Remotion patterns and guidance for coding agents
- **Curated examples** in [`examples/`](examples/)

## Browse the library

```sh
python3 -m http.server 4173 --directory site
```

Open <http://localhost:4173/>.

Hover or focus a template card to play its preview. Open a template to inspect its props and copy an agent-ready recipe.

## Install and validate

```sh
npm install
npm run typecheck
npm run catalog
npm run gate
```

The full gate typechecks the project, creates a Remotion bundle, and render-smokes every template.

## Regenerate library assets

```sh
# Rebuild the agent-facing catalog
npm run catalog

# Render all muted MP4 previews
npm run previews

# Render a focused preview set
npm run previews -- --only kinetic-impact-sting,dataviz-bar-race
```

The deployable website is the [`site/`](site/) directory. See [`site/README.md`](site/README.md) for rendering options and static-hosting details.

## Project structure

```text
src/families/             100 family engines and their registry presets
src/registry.json         generated 1,000-template registry
src/components.ts         generated component map
src/lib/                  shared deterministic animation primitives
scripts/                  merge, catalog, preview, thumbnail, and gate tools
site/                     static searchable template library
research/                 provenance, expansion, review, and QA records
examples/                 original curated examples from this repository
SKILL.md                  Remotion guidance for coding agents
```

## Using the catalog with an agent

1. Search the website for the desired visual role or category.
2. Inspect playable examples instead of choosing from names alone.
3. Copy the agent recipe or default props from the detail view.
4. Combine compatible templates into a sequence.
5. Replace procedural defaults with project assets and content.
6. Run `npm run typecheck` and a focused render before accepting the composition.

The generated machine-readable records are available at:

- [`site/data/registry.json`](site/data/registry.json)
- [`site/data/agent-catalog.json`](site/data/agent-catalog.json)

## Design constraints

Library templates use deterministic frame-driven animation, system fonts, and asset-free defaults. User-supplied media can be passed through props where supported. Defaults must render without network access.

## Provenance

Original, official-inspired, and GitHub-inspired mechanics are tracked under [`research/`](research/). Third-party code and media retain their own license requirements; verify provenance before copying external assets or source into commercial work.

## Repository history

This repository began as a curated index and agent skill for the Remotion ecosystem. The production template library from [`ali-abassi/remotion-template-library`](https://github.com/ali-abassi/remotion-template-library) is being consolidated here so the starred project, examples, agent guidance, and full implementation have one canonical home.
