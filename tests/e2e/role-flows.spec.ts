import { expect, test, type Page } from "@playwright/test";

type RoleCase = {
  name: string;
  email: string;
  password: string;
  expectedPath: string;
  expectedHeading: RegExp;
  expectedText: RegExp;
};

const roles: RoleCase[] = [
  {
    name: "employe",
    email: "employe@hrmanager.com",
    password: "password1234",
    expectedPath: "/employe/dashboard",
    expectedHeading: /bonjour/i,
    expectedText: /mon contrat/i,
  },
  {
    name: "manager",
    email: "manager@hrmanager.com",
    password: "password123",
    expectedPath: "/manager/dashboard",
    expectedHeading: /tableau de bord/i,
    expectedText: /demandes en attente/i,
  },
  {
    name: "rh",
    email: "rh@hrmanager.com",
    password: "password123",
    expectedPath: "/rh/dashboard",
    expectedHeading: /tableau de bord rh/i,
    expectedText: /employés actifs/i,
  },
  {
    name: "admin",
    email: "admin@hrmanager.com",
    password: "password123",
    expectedPath: "/directeur/dashboard",
    expectedHeading: /tableau de bord directeur/i,
    expectedText: /congés/i,
  },
];

async function login(page: Page, role: RoleCase) {
  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
  await page.getByLabel(/adresse email/i).fill(role.email);
  await page.getByLabel(/mot de passe/i).fill(role.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(new RegExp(`${role.expectedPath.replace(/\//g, "\\/")}$`));
}

for (const role of roles) {
  test(`role flow: ${role.name}`, async ({ page }) => {
    await login(page, role);

    await expect(page).toHaveURL(new RegExp(`${role.expectedPath.replace(/\//g, "\\/")}$`));
    await expect(page.getByRole("heading", { name: role.expectedHeading })).toBeVisible();
    await expect(page.getByText(role.expectedText)).toBeVisible();
  });
}
