/* Pengujian UI melalui Chrome; Playwright hanya alat pengujian eksternal. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8000';
const ROOT = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  const results = [];
  const capturePaths = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  async function check(name, run) {
    try { await run(); results.push({ name, status: 'LULUS' }); }
    catch (error) { results.push({ name, status: 'GAGAL', detail: error.message }); }
  }
  async function capture(name) {
    await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
    const filename = `docs/screenshots/${name}.png`;
    await page.screenshot({ path: path.join(ROOT, filename), fullPage: true });
    capturePaths.push(filename);
  }
  async function navigate(view) {
    // Tunggu layout dan event media-query setelah pengujian mengubah viewport.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('#main-navigation').isVisible())) await page.locator('#menu-toggle').click();
    await page.locator(`nav [data-view=${view}]`).click();
    await page.locator(`#view-${view}`).waitFor({ state: 'visible' });
  }
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('alur.its.demo.v1')));
  async function search() {
    await page.locator('[data-preset=python]').click();
    await page.locator('#search-button').click();
    await page.waitForFunction(() => !document.querySelector('#search-button').disabled);
  }
  await page.goto(BASE);
  await check('Login awal jujur; tidak meminta kredensial', async () => {
    assert.equal(await page.locator('#login-view').isVisible(), true);
    assert.equal(await page.locator('#app-shell').isVisible(), false);
    assert.equal(await page.locator('input[type=password],input[type=email]').count(), 0);
    assert.match(await page.locator('#login-view').innerText(), /Autentikasi belum terhubung/);
    await capture('login-desktop');
  });
  await check('Login responsif 360, 540, 768, 1024, 1440', async () => {
    for (const width of [360, 540, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}`);
      assert.equal(await page.locator('#enter-demo').isVisible(), true);
      if ([360, 768].includes(width)) await capture(`login-${width}`);
    }
  });
  await check('Keyboard masuk demo dan fokus konten', async () => {
    await page.locator('#enter-demo').focus();
    assert.equal(await page.locator('#enter-demo').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#view-beranda').isVisible(), true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
    assert.deepEqual(await page.evaluate(() => JSON.parse(sessionStorage.getItem('alur.its.session.v1'))), { schema_version: 1, mode: 'demo' });
  });
  await check('Beranda kosong tidak mengarang aktivitas; CTA membuka rekomendasi', async () => {
    assert.equal(await page.locator('#dashboard-recent').isVisible(), false);
    assert.match(await page.locator('#dashboard-summary').innerText(), /0 XP/);
    await capture('beranda-kosong-desktop');
    await page.locator('#dashboard-activity a').click();
    assert.equal(await page.locator('#view-rekomendasi').isVisible(), true);
  });
  await check('Skip link memindahkan fokus tanpa mengganti halaman', async () => {
    await page.locator('#skip-link').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
    assert.equal(await page.locator('#view-rekomendasi').isVisible(), true);
  });
  await check('Submit ganda diabaikan selama pemuatan', async () => {
    await page.locator('.demo-tools summary').click();
    await page.locator('#demo-mode').selectOption('slow');
    await page.locator('[data-preset=python]').click();
    await page.locator('#search-button').click();
    assert.equal(await page.locator('#search-button').isDisabled(), true);
    await page.locator('#topic').fill('sql database');
    await page.locator('#learning-form').evaluate(el => el.requestSubmit());
    await page.waitForFunction(() => !document.querySelector('#search-button').disabled);
    assert.match(await page.locator('#results-content').innerText(), /Python Programming Essentials/);
    await page.locator('#demo-mode').selectOption('normal');
  });
  await check('Beranda aktif memakai quest dan materi berikutnya yang sama', async () => {
    await page.locator('[data-action=start-all]').click();
    const saved = await state();
    await navigate('beranda');
    assert.equal(await page.locator('.next-lesson h3').textContent(), saved.quest.courses[0].title);
    assert.equal(await page.locator('#dashboard-activity progress').getAttribute('value'), '0');
    assert.match(await page.locator('#dashboard-activity').innerText(), /0 dari 3 materi selesai/);
    await capture('beranda-aktif-desktop');
  });
  await check('Lanjutkan Belajar membuka quest dan fokus materi berikutnya', async () => {
    await page.locator('[data-action=continue-learning]').click();
    assert.equal(await page.locator('#view-quest').isVisible(), true);
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H3');
    assert.equal((await state()).history.length, 0);
  });
  await check('Penyelesaian memperbarui Beranda, XP, badge dan progres', async () => {
    await page.locator('[data-action=open-completion]').first().click();
    const form = page.locator('.completion-form:visible');
    await form.locator('input').fill('90');
    await form.locator('[type=submit]').click();
    await page.waitForFunction(() => document.querySelector('#sidebar-xp').textContent === '70 XP');
    await navigate('beranda');
    assert.match(await page.locator('#dashboard-summary').innerText(), /70 XP/);
    assert.equal(await page.locator('#dashboard-summary dd').nth(2).textContent(), '3');
    assert.equal(await page.locator('#dashboard-activity progress').getAttribute('value'), '33.33');
    assert.equal(await page.locator('.next-lesson h3').textContent(), (await state()).quest.courses[1].title);
    assert.equal(await page.locator('#dashboard-recent li').count(), 1);
    await capture('beranda-progres-desktop');
  });
  await check('Refresh dan navigasi mempertahankan state', async () => {
    const before = await state();
    await page.reload();
    assert.equal(await page.locator('#view-beranda').isVisible(), true);
    for (const view of ['progres', 'rekomendasi', 'quest', 'beranda']) await navigate(view);
    assert.deepEqual(await state(), before);
    assert.match(await page.locator('#dashboard-summary').innerText(), /70 XP/);
  });
  await check('Menu ponsel: buka, Escape, fokus kembali dan tutup saat navigasi', async () => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.locator('#main-navigation').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#main-navigation').isVisible(), false);
    await page.locator('#menu-toggle').focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.view), 'beranda');
    await capture('menu-360');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'menu-toggle');
    assert.equal(await page.locator('#main-navigation').isVisible(), false);
    await navigate('quest');
    assert.equal(await page.locator('#main-navigation').isVisible(), false);
    await page.setViewportSize({ width: 768, height: 900 });
    await page.locator('#main-navigation').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#main-navigation').isVisible(), true);
  });
  await check('Semua halaman responsif 360, 540, 700, 701, 768, 1024, 1440', async () => {
    for (const width of [360, 540, 700, 701, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of ['rekomendasi', 'quest', 'progres', 'beranda']) {
        await navigate(view);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: ${view}`);
      }
      if ([360, 768].includes(width)) await capture(`beranda-progres-${width}`);
    }
  });
  await check('Judul dan topik panjang tidak merusak Beranda ponsel', async () => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.evaluate(async () => {
      const { renderDashboard } = await import('./assets/js/dashboard.js');
      const data = JSON.parse(localStorage.getItem('alur.its.demo.v1'));
      data.quest.topic = 'topik'.repeat(40);
      data.quest.courses[1].title = 'Judul kursus simulasi panjang '.repeat(12);
      renderDashboard(data);
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.reload();
    await page.setViewportSize({ width: 1440, height: 900 });
  });
  await check('Keluar mempertahankan progres dan menghapus penanda sesi saja', async () => {
    const before = await state();
    await page.evaluate(() => sessionStorage.setItem('unrelated.session', 'keep'));
    await page.locator('#exit-demo').click();
    assert.equal(await page.locator('#login-view').isVisible(), true);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('alur.its.session.v1')), null);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('unrelated.session')), 'keep');
    assert.deepEqual(await state(), before);
    await page.reload();
    assert.equal(await page.locator('#login-view').isVisible(), true);
    await page.locator('#enter-demo').click();
    assert.match(await page.locator('#dashboard-summary').innerText(), /70 XP/);
  });
  await check('Quest selesai: progres 100% dan CTA Cari Materi', async () => {
    await navigate('quest');
    for (let i = 0; i < 2; i++) {
      const before = (await state()).history.length;
      await page.locator('[data-action=open-completion]').first().click();
      const form = page.locator('.completion-form:visible');
      await form.locator('input').fill('60');
      await form.locator('[type=submit]').click();
      await page.waitForFunction(count => JSON.parse(localStorage.getItem('alur.its.demo.v1')).history.length > count, before);
      // Rekomendasi berikutnya merupakan bagian operasi penyelesaian yang sama.
      await page.waitForFunction(() => !document.querySelector('#next-recommendations').textContent.includes('Menyiapkan'));
    }
    await navigate('beranda');
    assert.equal(await page.locator('#dashboard-activity progress').getAttribute('value'), '100');
    assert.equal(await page.locator('[data-action=continue-learning]').count(), 0);
    assert.equal(await page.locator('#dashboard-activity').getByText('Cari Materi', { exact: true }).count(), 1);
    assert.match(await page.locator('#dashboard-summary').innerText(), /150 XP/);
    await capture('beranda-selesai-desktop');
  });
  await check('Reset dikonfirmasi; batal mempertahankan state, reset mengosongkan Beranda', async () => {
    if (!(await page.locator('#reset-demo').isVisible())) await page.locator('.demo-tools summary').click();
    await page.locator('#reset-demo').click();
    await page.locator('#cancel-reset').click();
    assert.equal((await state()).history.length, 3);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'reset-demo');
    await page.locator('#reset-demo').click();
    await page.locator('#confirm-reset').click();
    assert.equal(await state(), null);
    assert.equal(await page.locator('#dashboard-recent').isVisible(), false);
    assert.match(await page.locator('#dashboard-summary').innerText(), /0 XP/);
  });
  await check('Keluar saat pencarian tertunda membatalkan pembaruan UI lama', async () => {
    await navigate('rekomendasi');
    await page.locator('#demo-mode').selectOption('slow');
    await page.locator('[data-preset=python]').click();
    await page.locator('#search-button').click();
    await page.locator('#exit-demo').click();
    await page.locator('#enter-demo').click();
    await page.waitForTimeout(3200);
    assert.equal(await page.locator('#view-beranda').isVisible(), true);
    assert.equal(await page.locator('#search-button').isDisabled(), false);
    assert.equal(await state(), null);
  });
  await check('Keluar saat penyelesaian tertunda tidak memberi XP setelah sesi ditutup', async () => {
    await navigate('rekomendasi');
    await page.locator('#demo-mode').selectOption('normal');
    await search();
    await page.locator('[data-action=start-all]').click();
    await page.locator('[data-action=open-completion]').first().click();
    await page.locator('.completion-form:visible input').fill('90');
    await page.evaluate(() => {
      document.querySelector('.completion-form:not([hidden])').requestSubmit();
      document.querySelector('#exit-demo').click();
    });
    await page.waitForTimeout(800);
    await page.locator('#enter-demo').click();
    assert.equal((await state()).history.length, 0);
    assert.match(await page.locator('#dashboard-summary').innerText(), /0 XP/);
  });
  await check('Sesi rusak memulihkan login dengan pesan', async () => {
    await page.evaluate(() => sessionStorage.setItem('alur.its.session.v1', '{broken'));
    await page.reload();
    assert.equal(await page.locator('#login-view').isVisible(), true);
    assert.equal(await page.locator('#session-notice').isVisible(), true);
    await page.locator('#enter-demo').click();
    assert.equal(await page.locator('#view-beranda').isVisible(), true);
  });
  await check('sessionStorage diblokir: sesi memori berfungsi dengan penjelasan', async () => {
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }));
    const tab = await blocked.newPage();
    await tab.goto(BASE);
    await tab.locator('#enter-demo').click();
    assert.equal(await tab.locator('#view-beranda').isVisible(), true);
    assert.match(await tab.locator('#storage-notice').innerText(), /penyimpanan sesi tidak tersedia/);
    await tab.locator('#exit-demo').click();
    assert.equal(await tab.locator('#login-view').isVisible(), true);
    await blocked.close();
  });
  await check('Tidak ada console/page error', async () => assert.deepEqual(errors, []));
  await fs.writeFile(path.join(ROOT, 'docs/dashboard-browser-results.json'), JSON.stringify({ run_at: new Date().toISOString(), browser: await browser.version(), results, errors, screenshots: capturePaths }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ passed: results.filter(r => r.status === 'LULUS').length, total: results.length, failures: results.filter(r => r.status === 'GAGAL'), errors }, null, 2));
  if (results.some(r => r.status === 'GAGAL')) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
