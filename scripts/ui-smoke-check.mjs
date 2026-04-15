import { chromium } from 'playwright';
import fs from 'node:fs';

const FRONTEND_URL = 'http://localhost:3001';

const admin = {
  email: 'admin_smoke@maddox.test',
  password: 'Passw0rd123',
};

const shopper = {
  email: 'buyer_smoke@maddox.test',
  password: 'Passw0rd123',
};

async function login(page, email, password) {
  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const report = {
    adminShopLoaded: false,
    adminRowFound: false,
    adminSaveClicked: false,
    adminSaveSuccessVisible: false,
    checkoutNavigationOk: false,
    checkoutPageVisible: false,
    checkoutButtonPresent: false,
    adminUrl: '',
    adminBodySnippet: '',
    notes: [],
  };

  try {
    await login(page, admin.email, admin.password);
    await page.goto(`${FRONTEND_URL}/shop`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.click('a:has-text("Dashboard")');
    await page.waitForTimeout(600);
    await page.click('a:has-text("Manage Shop")');
    await page.waitForTimeout(1800);

    report.adminUrl = page.url();
    report.adminBodySnippet = (await page.locator('body').innerText()).slice(0, 240);

    report.adminShopLoaded = await page.locator('text=Shop Management').first().isVisible();
    const rowCount = await page.locator('.admin-shop-table tbody tr').count();
    report.adminRowFound = rowCount > 0;

    if (!report.adminRowFound) {
      report.notes.push(`No product rows found on admin shop table (rows=${rowCount}).`);
    }

    if (report.adminRowFound) {
      const thresholdInput = page.locator('.admin-shop-table tbody tr').first().locator('input[type="number"]');
      const variantsArea = page.locator('.admin-shop-table tbody tr').first().locator('textarea');
      const saveButton = page.locator('.admin-shop-table tbody tr').first().locator('button:has-text("Save")');

      await thresholdInput.fill('2');
      await variantsArea.fill('Black|Pro|PS5\nWhite|Lite|Xbox Series');
      await saveButton.click();
      report.adminSaveClicked = true;

      await page.waitForTimeout(1200);
      report.adminSaveSuccessVisible = await page.locator('.admin-save-status-success').first().isVisible().catch(() => false);
    }

    await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.click('button:has-text("Logout")').catch(() => {});

    await login(page, shopper.email, shopper.password);

    await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
    }

    const checkoutButton = page.locator('button:has-text("Checkout")').first();
    report.checkoutButtonPresent = await checkoutButton.isVisible().catch(() => false);

    if (report.checkoutButtonPresent) {
      await checkoutButton.click();
      await page.waitForURL('**/checkout', { timeout: 8000 });
      report.checkoutNavigationOk = page.url().includes('/checkout');
    } else {
      report.notes.push('Checkout button not visible on product card.');
    }

    report.checkoutPageVisible = await page.locator('text=Checkout').first().isVisible().catch(() => false);

    console.log('UI_SMOKE_OK');
    console.log(JSON.stringify(report, null, 2));

    const allPass = Object.values(report).every(Boolean);
    fs.writeFileSync('/tmp/ui-smoke-result.json', JSON.stringify({ status: allPass ? 'pass' : 'partial', report }, null, 2));
    if (!allPass) {
      process.exitCode = 2;
    }
  } catch (error) {
    console.error('UI_SMOKE_FAILED');
    console.error(error?.message || error);
    fs.writeFileSync('/tmp/ui-smoke-result.json', JSON.stringify({ status: 'failed', error: String(error?.message || error) }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
