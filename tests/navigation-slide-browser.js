async page => {
  const results = [];
  const errors = [];
  const check = (name, ok) => {
    if (!ok) throw new Error(name);
    results.push({name, passed: true});
  };
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await page.locator('#app-shell').waitFor({state: 'visible'});
  await page.locator('[data-view=beranda]').click();
  const profileBefore = await page.evaluate(async () => (await fetch('/api/me').then(r => r.json())).state);
  check('Shortcut dashboard tidak ada',await page.locator('.home-shortcuts,.home-shortcut').count() === 0);
  check('Satu Cari Materi pada quest aktif',await page.locator('#dashboard-activity').getByRole('link',{name:'Cari Materi',exact:true}).count() === 1 && await page.locator('#home-search,#home-topic').count() === 0);

  // Observe animations immediately after routing, rather than relying on screenshot timing.
  await page.evaluate(() => {
    window.slideChecks = [];
    document.addEventListener('click', event => {
      if (!event.target.closest('#main-navigation [data-view]')) return;
      queueMicrotask(() => {
        const view = [...document.querySelectorAll('#main > section')].find(el => !el.hidden);
        window.slideChecks.push({
          view: view.id,
          frames: view.getAnimations().map(a => a.effect.getKeyframes().map(f => f.transform)),
          indicator: document.querySelector('.nav-indicator').getAnimations().length,
          overflow: document.documentElement.scrollWidth > innerWidth,
        });
      });
    });
  });

  for (const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.locator('[data-view=beranda]').click();
    await page.locator('[data-view=rekomendasi]').click();
    const forward = await page.evaluate(() => window.slideChecks.at(-1));
    check(`Slide maju ${width}`,forward.view === 'view-rekomendasi' && forward.frames.some(f => f[0] === 'translateX(32px)') && forward.indicator === 1 && !forward.overflow);
    await page.locator('[data-view=beranda]').click();
    const backward = await page.evaluate(() => window.slideChecks.at(-1));
    check(`Slide mundur ${width}`,backward.frames.some(f => f[0] === 'translateX(-32px)') && backward.indicator === 1 && !backward.overflow);
    await page.locator('#view-beranda').evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
    const aligned = await page.evaluate(() => {
      const active = document.querySelector('#main-navigation [aria-current=page]').getBoundingClientRect();
      const highlight = document.querySelector('.nav-indicator').getBoundingClientRect();
      return ['x','y','width','height'].every(key => Math.abs(active[key]-highlight[key])<1);
    });
    check(`Indikator sejajar ${width}`,aligned);
    check(`Layout ${width}`,!await page.evaluate(() => document.documentElement.scrollWidth>innerWidth));
    await page.screenshot({path:`docs/screenshots/dashboard-box-${width}.png`,animations:'disabled'});
  }
  await page.locator('[data-view=beranda]').click();
  check('Klik halaman sama tidak memutar slide',await page.evaluate(() => window.slideChecks.at(-1).frames.length === 0));
  await page.locator('[data-view=quest]').focus();
  await page.keyboard.press('Enter');
  check('Keyboard segera berpindah tanpa motion',page.url().endsWith('#quest') && await page.evaluate(() => window.slideChecks.at(-1).frames.length === 0));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-view=progres]').click();
  check('Reduced motion menonaktifkan kedua slide',await page.evaluate(() => {const s=window.slideChecks.at(-1);return s.frames.length===0 && s.indicator===0;}));
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const view of ['beranda','rekomendasi','quest','progres']) {
    await page.locator(`[data-view=${view}]`).dispatchEvent('click',{detail:1});
  }
  check('Navigasi cepat memakai tujuan terakhir',page.url().endsWith('#progres') && await page.locator('#view-progres').isVisible() && await page.locator('#main > section:not([hidden])').count()===1);
  await page.goBack();
  check('Browser Back mengikuti rute',page.url().endsWith('#quest') && await page.locator('#view-quest').isVisible());
  const profileAfter = await page.evaluate(async () => (await fetch('/api/me').then(r => r.json())).state);
  check('Navigasi tidak mengubah quest dan reward',JSON.stringify(profileBefore) === JSON.stringify(profileAfter));

  // Complete the remaining materials on the isolated test account to check the finished state.
  await page.evaluate(async () => {
    const account = await fetch('/api/me').then(r => r.json());
    for(const course of account.state.quest.courses) {
      if(account.state.profile.completedIds.includes(course.course_id)) continue;
      const response=await fetch('/api/complete',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':account.csrf_token},body:JSON.stringify({quest_id:account.state.quest.id,course_id:course.course_id,score:80})});
      if(!response.ok) throw new Error('Completion fixture failed');
    }
  });
  await page.reload();
  await page.locator('#app-shell').waitFor({state:'visible'});
  await page.locator('[data-view=beranda]').click();
  check('Satu Cari Materi setelah quest selesai',await page.locator('#dashboard-activity').getByRole('link',{name:'Cari Materi',exact:true}).count()===1 && await page.locator('#dashboard-activity').getByText('Quest ini sudah selesai.',{exact:true}).count()===1);
  check('Tidak ada exception browser',errors.length===0);
  return results;
}
