import { test, expect } from '@playwright/test';

test('Soal 7: Add barang ke keranjang', async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Cloudflare verification must be completed by a human.
  // Pause only when a visible challenge is detected; do not attempt to solve it in code.
  const challengeText = page.getByText(
    /verify you are human|checking your browser|just a moment/i
  ).first();
  const challengeFrame = page.locator(
    'iframe[src*="challenges.cloudflare.com"]'
  ).first();

  const hasChallengeText = await challengeText.isVisible().catch(() => false);
  const hasChallengeFrame = await challengeFrame.isVisible().catch(() => false);

  if (hasChallengeText || hasChallengeFrame) {
    console.log(
      'Cloudflare challenge detected. Complete the verification manually in the browser, then resume the test in Playwright Inspector.'
    );
    await page.pause();
  }

  // Wait for the actual store navigation to become available.
  // If this times out, inspect the current page: it may still be on a challenge or block page.
  const menuMakanan = page.locator('a[href="/xpress/category/makanan"]');
  await expect(menuMakanan).toBeVisible({ timeout: 120_000 });

  // Close the application modal only if it is present.
  const closeButton = page.getByRole('button', { name: 'Close', exact: true });
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
  }

  await expect(page.locator('.modal.modal-open:visible')).toHaveCount(0, {
    timeout: 10_000,
  });

  await menuMakanan.click();
  await expect(page).toHaveURL(/\/xpress\/category\/makanan(?:\?.*)?$/);

  const menuMadu = page.getByText('Madu', { exact: true }).first();
  await expect(menuMadu).toBeVisible({ timeout: 15_000 });
  await menuMadu.click();

  await expect(page).toHaveURL(/\/xpress\/category\/madu(?:\?.*)?$/);
  await expect(
    page.locator('.breadcrumbs').filter({
      has: page.getByText('Madu', { exact: true }),
    })
  ).toBeVisible();

  const produk = page.getByRole('link', { name: /Madurasa/i }).first();
  await expect(produk).toBeVisible();
  await produk.click();

  const tombolKeranjang = page.getByRole('button', { name: 'Keranjang' });
  await expect(tombolKeranjang).toBeVisible();
  await tombolKeranjang.click();
});
