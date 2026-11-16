async page => {
  const results = [], errors = [];
  const check = (name, ok) => { if (!ok) throw new Error(name); results.push({name,passed:true}); };
  page.on('pageerror', e => errors.push(e.message));
  await page.locator('[data-view=quest]').click();
  const opener = page.locator('#quest-content [data-action=read-description]').first();
  const title = await opener.locator('xpath=..').locator('h3').textContent();
  await opener.click();
  const dialog = page.locator('#description-dialog');
  await dialog.waitFor({state:'visible'});
  check('Deskripsi dialog memakai judul kursus asli',await page.locator('#description-title').textContent()===title);
  check('Deskripsi penuh bukan disclosure inline',await page.locator('details.course-detail').count()===0 && (await page.locator('.description-content').textContent()).length>175);
  await page.keyboard.press('Tab');
  check('Fokus tetap dalam modal',await page.evaluate(()=>document.querySelector('#description-dialog').contains(document.activeElement)));
  await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});
  check('Escape mengembalikan fokus pemicu',await opener.evaluate(el=>el===document.activeElement));
  await page.locator('[data-action=open-completion]').first().click();
  const form=page.locator('.completion-form:visible');
  await form.locator('input').fill('80');
  const pending=page.waitForResponse(r=>r.url().endsWith('/api/complete')&&r.ok());
  await form.locator('[type=submit]').click();
  const reward=await (await pending).json();
  await page.locator('#reward-dialog').waitFor({state:'visible'});
  check('Hadiah tetap sesuai transaksi API',reward.xp_awarded===50 && reward.total_xp===120 && await page.locator('#reward-earned').textContent()==='+50 XP');
  await page.keyboard.press('Escape');
  for (const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.locator('[data-view=progres]').click();
    await page.waitForTimeout(260);
    const geometry=await page.evaluate(()=>{
      const toast=document.querySelector('#feedback'), t=toast.getBoundingClientRect(), h=document.querySelector('.sidebar').getBoundingClientRect();
      const filled=[...document.querySelector('#view-progres').querySelectorAll('.progress-glint')].filter(el=>el.getBoundingClientRect().width>0);
      return {fixed:getComputedStyle(toast).position==='fixed',fits:t.left>=0&&t.right<=innerWidth&&t.bottom<innerHeight-72,belowHeader:t.top>=h.bottom,overflow:document.documentElement.scrollWidth>innerWidth,
        loops:filled.every(el=>getComputedStyle(el,'::after').animationIterationCount==='infinite'),depth:filled.every(el=>getComputedStyle(el,'::before').boxShadow!=='none')};
    });
    check(`Toast atas dan layout ${width}`,geometry.fixed&&geometry.fits&&geometry.belowHeader&&!geometry.overflow);
    check(`Progress looping dan kedalaman ${width}`,geometry.loops&&geometry.depth);
    if(width===360||width===1440) await page.screenshot({path:`docs/screenshots/popup-progress-${width}.png`});
    await page.locator('[data-view=quest]').click();
    await opener.click();
    await dialog.waitFor({state:'visible'});
    const fits=await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;});
    check(`Dialog deskripsi muat ${width}`,fits);
    await page.waitForTimeout(250);
    if(width===360||width===1440) await page.screenshot({path:`docs/screenshots/description-dialog-${width}.png`});
    await page.getByRole('button',{name:'Tutup deskripsi',exact:true}).click();
    await dialog.waitFor({state:'hidden'});
  }
  await page.locator('[aria-label="Tutup notifikasi"]').click();
  check('Toast dapat ditutup',!await page.locator('#feedback').isVisible());
  const logout=page.locator('#exit-demo');
  const normal=await logout.evaluate(el=>getComputedStyle(el).color);
  await logout.hover(); await page.waitForTimeout(220);
  check('Logout merah dan hover berubah',normal==='rgb(166, 45, 53)'&&await logout.evaluate(el=>getComputedStyle(el).backgroundColor)==='rgb(133, 33, 41)');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-view=progres]').click();
  check('Reduced motion mematikan kilau',await page.locator('#view-progres .progress-glint').first().evaluate(el=>getComputedStyle(el,'::after').animationName==='none'));
  await page.locator('[data-view=quest]').click();await opener.click();
  check('Reduced motion mematikan animasi dialog',await dialog.evaluate(el=>getComputedStyle(el).animationName==='none'));
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  check('Tidak ada exception JavaScript',errors.length===0);
  return results;
}
