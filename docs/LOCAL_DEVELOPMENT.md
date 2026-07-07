# Local Development

This is the Vue 3 admin frontend for the local RuoYi-Vue-Pro SaaS helpdesk practice project.

## Repository Paths

Frontend:

```text
/Users/guistar/Documents/Codex/yudao-ui-admin-vue3
```

Backend:

```text
/Users/guistar/Documents/Codex/ruoyi-vue-pro-saas-helpdesk
```

## Runtime

- Node: installed through Homebrew on this machine
- Package manager: `pnpm@10.29.3`
- Frontend port: `5173`
- Backend port: `48080`

## Install

```bash
cd /Users/guistar/Documents/Codex/yudao-ui-admin-vue3
/opt/homebrew/bin/pnpm install --frozen-lockfile
```

## Run

From WebStorm, open:

```text
/Users/guistar/Documents/Codex/yudao-ui-admin-vue3
```

Then run:

```text
Yudao UI Local
```

From terminal:

```bash
cd /Users/guistar/Documents/Codex/yudao-ui-admin-vue3
/opt/homebrew/bin/pnpm dev
```

Open:

```text
http://localhost:5173
```

## Backend API

The local frontend points to:

```text
http://localhost:48080/admin-api
```

This is configured in `.env.local`:

```text
VITE_BASE_URL='http://localhost:48080'
VITE_API_URL=/admin-api
VITE_PORT=5173
VITE_APP_CAPTCHA_ENABLE=false
```

## Verify

```bash
cd /Users/guistar/Documents/Codex/yudao-ui-admin-vue3
/opt/homebrew/bin/pnpm run ts:check
```

For UI work, also start the dev server and test the changed page in the browser.

## Login

```text
Tenant: 芋道源码
Username: admin
Password: admin123
```

