import { test, expect } from '@playwright/test';

async function pauseForCloudflareIfNeeded(page) {
  // Allow a client-side challenge to render after navigation.
  await page.waitForTimeout(1500);

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const challengeInBody =
    /performing security verification|verify you are human|checking your browser|just a moment/i.test(bodyText);

  // Cloudflare's checkbox can live inside a cross-origin iframe, so inspect
  // frame URLs rather than trying to read the iframe's internal document.
  const challengeFrame = page.frames().some((frame) =>
    /challenges\.cloudflare\.com|cloudflare\.com\/cdn-cgi\/challenge-platform/i.test(frame.url())
  );

  if (challengeInBody || challengeFrame) {
    console.log(
      'Cloudflare verification detected. Complete it manually in the browser, then click Resume in Playwright Inspector.'
    );
    await page.pause();
  }
}

test('Soal 7: Add barang ke keranjang', async ({ page }) => {
  test.setTimeout(240_000);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await pauseForCloudflareIfNeeded(page);

  const menuMakanan = page.locator('a[href="/xpress/category/makanan"]');
  await expect(menuMakanan).toBeVisible({ timeout: 120_000 });
  await menuMakanan.click();

  // Cloudflare can challenge a later navigation even if the homepage loaded.
  await pauseForCloudflareIfNeeded(page);

  await expect(page).toHaveURL(/\/xpress\/category\/makanan(?:\?.*)?$/, {
    timeout: 30_000,
  });

  const closeButton = page.getByRole('button', { name: 'Close', exact: true });
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
  }

  await expect(page.locator('.modal.modal-open:visible')).toHaveCount(0, {
    timeout: 10_000,
  });

  const menuMadu = page.getByText('Madu', { exact: true }).first();
  await expect(menuMadu).toBeVisible({ timeout: 30_000 });
  await menuMadu.click();
  await pauseForCloudflareIfNeeded(page);

  await expect(page).toHaveURL(/\/xpress\/category\/madu(?:\?.*)?$/, {
    timeout: 30_000,
  });

  await expect(
    page.locator('.breadcrumbs').filter({
      has: page.getByText('Madu', { exact: true }),
    })
  ).toBeVisible();

  const produk = page.getByRole('link', { name: /Madurasa/i }).first();
  await expect(produk).toBeVisible();
  await produk.click();
  await pauseForCloudflareIfNeeded(page);

  const tombolKeranjang = page.getByRole('button', { name: 'Keranjang' });
  await expect(tombolKeranjang).toBeVisible();
  await tombolKeranjang.click();
});
