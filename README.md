# HRManager
plateforme de gestion des ressources humaines

## Tests E2E

Lance les tests navigateur Playwright avec :

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

La suite utilise `PLAYWRIGHT_BASE_URL` si elle est définie, sinon `http://127.0.0.1:3000`.
