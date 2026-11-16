async page => {
  const results = [];
  const errors = [];
  const check = (name, ok) => { if (!ok) throw new Error(name); results.push({name,passed:true}); };
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await page.locator('#app-shell').waitFor({state:'visible'});
  await page.evaluate(() => {
    window.motionCalls = [];
    const original = Element.prototype.animate;
    window.originalAnimate = original;
    Element.prototype.animate = function(frames, options) {
      window.motionCalls.push({id:this.id,frames,duration:options.duration});
      return original.call(this,frames,options);
    };
  });
  const before = await page.evaluate(async()=> (await fetch('/api/me').then(r=>r.json())).state);
  await page.locator('[data-view=beranda]').click();
  await page.locator('#dashboard-activity').getByRole('link',{name:'Cari Materi',exact:true}).click();
  check('Cari Materi di box memakai slide',await page.evaluate(()=>window.motionCalls.at(-1).id==='view-rekomendasi'));
  await page.locator('[data-view=beranda]').click();
  await page.locator('#dashboard-summary').getByRole('link',{name:'Lihat pencapaian',exact:true}).click();
  check('Tautan ringkasan memakai slide',await page.evaluate(()=>window.motionCalls.at(-1).id==='view-progres'));
  await page.locator('[data-view=beranda]').click();
  await page.locator('[data-action=continue-learning]').click();
  check('Tombol Lanjutkan Belajar memakai slide',await page.evaluate(()=>window.motionCalls.at(-1).id==='view-quest'));
  await page.locator('[data-view=beranda]').click();
  await page.locator('#dashboard-activity').getByRole('link',{name:'Lihat seluruh quest',exact:true}).click();
  check('Tautan quest memakai slide',await page.evaluate(()=>window.motionCalls.at(-1).id==='view-quest'));
  const after = await page.evaluate(async()=> (await fetch('/api/me').then(r=>r.json())).state);
  check('Motion tidak mengubah data',JSON.stringify(before)===JSON.stringify(after));

  for(const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    for(const view of ['beranda','rekomendasi','quest','progres']) {
      await page.locator(`[data-view=${view}]`).click();
      const bars = await page.locator('progress:visible').evaluateAll(nodes=>nodes.map(bar=>{
        const track=bar.closest('.progress-track');
        const glint=track.querySelector('.progress-glint');
        const style=getComputedStyle(glint,'::after');
        const filledWidth=glint.getBoundingClientRect().width;
        const expected=track.getBoundingClientRect().width*bar.value/bar.max;
        return {value:bar.value,max:bar.max,label:bar.getAttribute('aria-label'),aligned:Math.abs(filledWidth-expected)<1,
          name:style.animationName,duration:style.animationDuration,iterations:style.animationIterationCount,hidden:glint.getAttribute('aria-hidden'),clipped:getComputedStyle(glint).overflow};
      }));
      check(`Progress semantik dan kilau ${view} ${width}`,bars.length>0 && bars.every(b=>b.max===100 && b.value>=0 && b.value<=100 && b.label && b.aligned && b.hidden==='true' && b.clipped==='hidden' && (b.value===0 ? b.name==='none' : b.name==='progress-shimmer' && b.duration==='2.4s' && b.iterations==='infinite')));
      check(`Tanpa overflow ${view} ${width}`,!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
    }
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-view=beranda]').click();
  await page.evaluate(()=>window.motionCalls=[]);
  await page.locator('#dashboard-activity').getByRole('link',{name:'Cari Materi',exact:true}).click();
  check('Reduced motion pada semua tautan',await page.evaluate(()=>window.motionCalls.length===0));
  check('Reduced motion mematikan kilau',await page.locator('.progress-glint:visible').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el,'::after').animationName==='none')));
  await page.emulateMedia({reducedMotion:'no-preference'});

  // Test boundary presentation without modifying the account or server rules.
  const bounds = await page.evaluate(async()=>{
    const {progressBar}=await import('/assets/js/ui.js');
    const host=document.createElement('div');
    document.body.append(host);
    const cases=[0,100].map(value=>{
      const node=progressBar({percent:value},'Batas tampilan pengujian');
      host.append(node);
      const bar=node.querySelector('progress');
      const shine=node.querySelector('.progress-glint');
      return {value:bar.value,width:shine.style.width,name:getComputedStyle(shine,'::after').animationName};
    });
    host.remove();
    return cases;
  });
  check('Progress 0 tidak memiliki kilau palsu',bounds[0].value===0 && bounds[0].width==='0%' && bounds[0].name==='none');
  check('Progress 100 tetap penuh',bounds[1].value===100 && bounds[1].width==='100%' && bounds[1].name==='progress-shimmer');

  await page.locator('[data-view=progres]').click();
  await page.locator('#view-progres').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
  // Freeze only the decorative animation for a clear screenshot of the shimmer.
  await page.locator('#main').evaluate(el=>{
    for(const animation of el.getAnimations({subtree:true})) {
      if(animation.animationName==='progress-shimmer') { animation.currentTime=800; animation.pause(); }
    }
  });
  await page.screenshot({path:'docs/screenshots/smooth-progress-desktop.png'});
  await page.setViewportSize({width:390,height:1000});
  await page.screenshot({path:'docs/screenshots/smooth-progress-mobile.png'});
  await page.locator('[data-view=rekomendasi]').click();
  await page.locator('[data-preset=python]').click();
  await page.locator('#search-button').click();
  await page.locator('[data-action=start-all]').waitFor();
  await page.evaluate(()=>window.motionCalls=[]);
  await page.locator('[data-action=start-all]').click();
  const replace = page.locator('[data-action=confirm-quest]');
  if(await replace.isVisible()) await replace.click();
  await page.waitForURL('**/#quest');
  check('Mulai quest setelah API memakai slide',await page.evaluate(()=>window.motionCalls.some(c=>c.id==='view-quest')));

  await page.locator('#exit-demo').click();
  await page.waitForURL('**/#login');
  check('Logout memakai transisi login',await page.evaluate(()=>window.motionCalls.some(c=>c.id==='login-main')));
  const email=`motion-${Date.now()}@example.test`;
  await page.getByRole('tab',{name:'Buat akun',exact:true}).click();
  await page.locator('#auth-name').fill('Pelajar Motion');
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill('test-password-123');
  await page.evaluate(()=>window.motionCalls=[]);
  await page.locator('#enter-demo').click();
  await page.waitForURL('**/#beranda');
  check('Autentikasi menuju Beranda memakai slide',await page.evaluate(()=>window.motionCalls.some(c=>c.id==='view-beranda')));
  check('Tidak ada exception JavaScript',errors.length===0);
  await page.evaluate(()=>{Element.prototype.animate=window.originalAnimate;delete window.originalAnimate;});
  return results;
}
