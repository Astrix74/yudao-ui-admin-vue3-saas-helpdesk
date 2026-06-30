# Codex Instructions

## Project Role

This repository is the Vue 3 admin frontend for the local RuoYi-Vue-Pro SaaS helpdesk practice project.

Backend sibling repository:

```text
/Users/guistar/Documents/Codex/ruoyi-vue-pro-saas-helpdesk
```

Read the backend workflow document when a frontend task depends on API contracts, permissions, menus, or feature scope:

```text
/Users/guistar/Documents/Codex/ruoyi-vue-pro-saas-helpdesk/docs/saas-helpdesk/CODEX_WORKFLOW.md
```

## Package Manager

Use `pnpm` for this project.

Preferred binary on this machine:

```bash
/opt/homebrew/bin/pnpm
```

Do not run `npm install`, `yarn`, or `bun install` unless the user explicitly asks for it.

## Local Development

The local backend runs at:

```text
http://localhost:48080
```

The local frontend runs at:

```text
http://localhost:5173
```

Use the WebStorm run configuration:

```text
Yudao UI Local
```

Before claiming frontend work is complete, run:

```bash
/opt/homebrew/bin/pnpm run ts:check
```

For UI behavior changes, also run the local dev server and smoke test the affected page.

## Feature Direction

The target feature is a SaaS helpdesk ticketing module. Frontend changes should follow existing RuoYi-Vue-Pro patterns:

- API clients under `src/api`
- views under `src/views`
- Element Plus table/form/dialog patterns
- permission-gated buttons
- menu and route conventions already used by the project
- no unrelated UI redesigns

