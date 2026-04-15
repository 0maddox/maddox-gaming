import { chromium } from 'playwright';
import fs from 'node:fs';

const FRONTEND_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin_smoke@maddox.test';
const ADMIN_PASSWORD = 'Passw0rd123';

(async () => {
  const result = {
    loginOk: false,
    hardRefreshStayedOnAdmin: false,
    adminShopVisible: false,
    finalUrl: '',
  };

  const browser = await chromium.launch({ headless: true });

  try {
    const loginContext = await browser.newContext();
    const loginPage = await loginContext.newPage();

    await loginPage.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded' });
    await loginPage.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await loginPage.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForTimeout(1200);

    result.loginOk = !loginPage.url().includes('/login');

    // Persist browser storage after login to simulate a real refresh session.
    await loginContext.storageState({ path: '/tmp/admin-auth-state.json' });
    await loginContext.close();

    const refreshContext = await browser.newContext({ storageState: '/tmp/admin-auth-state.json' });
    const page = await refreshContext.newPage();

    // This is the hard-refresh equivalent: direct navigation to a protected URL.
    await page.goto(`${FRONTEND_URL}/admin/shop`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);

    result.finalUrl = page.url();
    result.hardRefreshStayedOnAdmin = result.finalUrl.includes('/admin/shop');
    result.adminShopVisible = await page.locator('text=Shop Management').first().isVisible().catch(() => false);

    const status = Object.values({
      loginOk: result.loginOk,
      hardRefreshStayedOnAdmin: result.hardRefreshStayedOnAdmin,
      adminShopVisible: result.adminShopVisible,
    }).every(Boolean) ? 'pass' : 'failed';

    fs.writeFileSync('/tmp/ui-admin-refresh-result.json', JSON.stringify({ status, result }, null, 2));
    console.log('ADMIN_REFRESH_CHECK');
    console.log(JSON.stringify({ status, result }, null, 2));
  } catch (error) {
    fs.writeFileSync(
      '/tmp/ui-admin-refresh-result.json',
      JSON.stringify({ status: 'failed', error: String(error?.message || error), result }, null, 2)
    );
    console.error('ADMIN_REFRESH_CHECK_FAILED');
    console.error(error?.message || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
