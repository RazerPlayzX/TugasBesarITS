async page => {
  const results = [];
  const check = (name, ok) => { if (!ok) throw new Error(name); results.push({name, passed:true}); };
  await page.reload();
  await page.locator('#app-shell').waitFor({state:'visible'});
  for (const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    for (const route of ['beranda','rekomendasi','quest','progres']) {
      await page.locator(`[data-view=${route}]`).click();
      check(`Layout ${route} ${width}`, !(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
      if (route==='beranda' || route==='progres' || route==='quest') await page.screenshot({path:`docs/screenshots/premium-${route}-${width}.png`});
    }
    await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    check(`Sticky header ${width}`,Math.abs((await page.locator('.sidebar').boundingBox()).y)<1);
    if(width<701) {
      const nav=await page.locator('#main-navigation').boundingBox();
      check(`Bottom navigation ${width}`,nav.y+nav.height<=1001 && nav.y>800);
    }
  }
  await page.locator('[data-view=rekomendasi]').click();
  await page.locator('[data-preset=python]').click();
  await page.locator('#search-button').click();
  const track=page.locator('.carousel-track:visible').first();
  await track.waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.carousel-controls')].find(el=>el.checkVisibility()).textContent.includes('Posisi 1'));
  check('Carousel mulai posisi 1', (await page.locator('.carousel-controls:visible').first().textContent()).includes('Posisi 1'));
  await track.focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>[...document.querySelectorAll('.carousel-track')].find(el=>el.checkVisibility()).scrollLeft>100);
  check('Keyboard carousel',await track.evaluate(el=>el.scrollLeft>0));
  await page.setViewportSize({width:390,height:1000});
  await page.screenshot({path:'docs/screenshots/premium-materials-mobile.png'});
  await page.locator('#topic').fill('zzzzqqqqxyz');
  await page.locator('#search-button').click();
  await page.waitForFunction(()=>!document.querySelector('#search-button').disabled);
  check('Empty state hasil nyata',await page.locator('.empty-state:visible').isVisible());
  await page.route('**/api/recommend',async route=>{
    const response=await route.fetch();
    const body=await response.json();
    body.courses=body.courses.slice(0,1);
    await route.fulfill({response,json:body});
  });
  await page.locator('[data-preset=python]').click();
  await page.locator('#search-button').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.carousel-controls')].find(el=>el.checkVisibility())?.textContent.includes('Posisi 1 dari 1'));
  check('Slider satu kartu',await page.locator('.carousel-controls:visible button:disabled').count()===2);
  await page.unroute('**/api/recommend');
  await page.locator('[data-view=quest]').click();
  await page.locator('[data-action=open-completion]').first().click();
  const form=page.locator('.completion-form:visible');
  await form.locator('input').fill('0');
  await form.locator('button[type=submit]').click();
  await page.locator('#reward-dialog').waitFor({state:'visible'});
  await page.locator('#reward-return').focus();
  await page.keyboard.press('Tab');
  check('Modal menahan fokus',await page.locator('#reward-close').evaluate(el=>el===document.activeElement));
  await page.screenshot({path:'docs/screenshots/premium-reward-mobile.png'});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.activeElement.tagName==='H3');
  check('Fokus kembali ke materi',await page.evaluate(()=>document.activeElement.tagName==='H3'));
  await page.locator('[data-view=beranda]').click();
  await page.locator('#account-name').evaluate(el=>{el.textContent='Mahasiswa dengan nama akun yang sangat panjang';el.title=el.textContent;});
  check('Nama panjang dapat diakses',await page.locator('#account-name').getAttribute('title')==='Mahasiswa dengan nama akun yang sangat panjang');
  await page.setViewportSize({width:720,height:500});
  check('Layout viewport efektif zoom 200%',!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
  await page.emulateMedia({reducedMotion:'reduce'});
  check('Reduced motion',await page.locator('#exit-demo').evaluate(el=>getComputedStyle(el).transitionDuration==='0s'));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#exit-demo').click();
  await page.waitForURL('**/#login');
  await page.locator('#toggle-password').click();
  check('Show password',await page.locator('#auth-password').getAttribute('type')==='text' && await page.locator('#toggle-password').getAttribute('aria-pressed')==='true');
  await page.locator('#toggle-password').focus();
  await page.keyboard.press('Enter');
  check('Hide password via keyboard',await page.locator('#auth-password').getAttribute('type')==='password');
  check('Focus indicator',await page.locator('#toggle-password').evaluate(el=>getComputedStyle(el).outlineStyle==='solid'));
  for(const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    check(`Login ${width}`,!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
    await page.screenshot({path:`docs/screenshots/premium-login-${width}.png`});
  }
  return results;
}
