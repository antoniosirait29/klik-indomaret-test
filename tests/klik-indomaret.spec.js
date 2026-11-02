import {test, expect} from '@playwright/test'

test('Soal 7: Add barang ke keranjang', async({page})=>{
    // variable untuk tampung URL dari webnya dan akses
    const web = 'https://www.klikindomaret.com/'
    await page.goto(web, {waitUntil: 'domcontentloaded'});

    // Popup aplikasi muncul beberapa saat setelah halaman awal selesai dimuat.
    await page.locator('.modal.modal-open:visible').waitFor({
      state: 'visible',
      timeout: 3000,
    }).catch(() => {});

    const tombolTutup = page.getByRole('button', { name: 'Close', exact: true });
    if (await tombolTutup.isVisible().catch(() => false)) {
      await tombolTutup.click();
    }
    await expect(page.locator('.modal.modal-open:visible')).toHaveCount(0, {
      timeout: 5000,
    });

    // Cari kategori Makanan
    const menumakanan = page.locator(
        'a[href="/xpress/category/makanan"]'
    );

    // Validasi dan klik
    await expect(menumakanan).toBeVisible();
    await menumakanan.click();

    await expect(page).toHaveURL(/\/xpress\/category\/makanan(?:\?.*)?$/);

    const menuMadu = page.getByText('Madu', { exact: true }).first();
    await expect(menuMadu).toBeVisible();
    await menuMadu.click();

    // verifikasi dulu apakah sudah benar page mengarah ke produk kategori madu
    await expect(page).toHaveURL(/\/xpress\/category\/madu(?:\?.*)?$/);
    await expect(page
        .locator('[class="breadcrumbs"]')
        .filter({
            has: page.getByText('Madu')
        })).toBeVisible();

    
    // pilih salah satu produk, disini ambil contoh madurasa
    const produk = page.getByRole('link', { name: /Madurasa/i }).first();
    await expect(produk).toBeVisible();
    await produk.click();

    // di halaman detail, klik ke keranjang
    await page.getByRole('button', { name: 'Keranjang' }).click();

})
