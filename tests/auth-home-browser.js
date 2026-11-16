async page => {
  const results = [];
  const check = (name, ok) => { if (!ok) throw new Error(name); results.push({name,passed:true}); };
  await page.context().clearCookies();
  await page.goto('http://127.0.0.1:8002');
  let authRequests = 0;
  page.on('request', request => { if (/\/api\/(register|login)$/.test(request.url())) authRequests++; });
  const login=page.getByRole('tab',{name:'Masuk',exact:true});
  const register=page.getByRole('tab',{name:'Buat akun',exact:true});
  check('Dropdown akun dihapus',await page.locator('select#auth-mode').count()===0);
  await login.focus();
  await page.keyboard.press('ArrowRight');
  check('Tab keyboard register',await register.getAttribute('aria-selected')==='true' && await page.locator('#auth-name').isVisible());
  await page.locator('#session-notice').evaluate(el=>{el.textContent='Pesan pengujian';el.hidden=false;});
  await login.click();
  check('Pergantian mode membersihkan error',!(await page.locator('#session-notice').isVisible()));
  await register.click();
  check('Tab tidak mengirim autentikasi',authRequests===0);
  check('Autocomplete registrasi',await page.locator('#auth-password').getAttribute('autocomplete')==='new-password');
  check('Satu reveal custom',await page.locator('.password-control button').count()===1 && await page.locator('#toggle-password').textContent()==='');
  const input=page.locator('#auth-password');
  await input.pressSequentially('test-only-example');
  await page.locator('.password-control').screenshot({path:'docs/screenshots/auth-password-after-edge.png'});
  const unchanged = await input.evaluate(el=>{el.dataset.testLength=String(el.value.length);el.setSelectionRange(3,3);return true;});
  await page.getByRole('button',{name:'Tampilkan password',exact:true}).click();
  check('Reveal menjaga nilai dan fokus',unchanged && await input.evaluate(el=>el.value.length===Number(el.dataset.testLength) && document.activeElement===el && el.selectionStart===3));
  check('Label dan ikon reveal berubah',await page.getByRole('button',{name:'Sembunyikan password',exact:true}).count()===1 && await page.locator('.eye-slash').getAttribute('hidden')===null);
  await page.locator('#toggle-password').focus();
  await page.keyboard.press('Enter');
  check('Toggle keyboard tanpa submit',authRequests===0 && await input.getAttribute('type')==='password');
  await input.fill('');
  for(const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    for(const [tab,name] of [[login,'login'],[register,'register']]) {
      await tab.click();
      check(`${name} ${width} tanpa overflow`,!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
      await page.screenshot({path:`docs/screenshots/auth-${name}-${width}.png`});
    }
  }
  const email=`ui-${Date.now()}@example.test`;
  await page.locator('#auth-name').fill('Pelajar Uji Tampilan');
  await page.locator('#auth-email').fill(email);
  await input.fill('test-password-123');
  await page.locator('#enter-demo').click();
  await page.waitForURL('**/#beranda');
  check('Password dibersihkan setelah sukses',await input.inputValue()==='');
  check('Header dari akun asli',(await page.locator('.topbar').textContent()).includes('Pelajar Uji Tampilan') && (await page.locator('.topbar').textContent()).includes('0 XP'));
  check('Satu Cari Materi untuk pengguna baru',await page.locator('#dashboard-activity').getByRole('link',{name:'Cari Materi',exact:true}).count()===1 && await page.locator('#view-beranda input').count()===0);
  await page.setViewportSize({width:390,height:1000});
  check('Urutan mobile',await page.evaluate(()=>{
    const selectors=['#dashboard-activity','#home-recommendations','#dashboard-summary'];
    const positions=selectors.map(s=>document.querySelector(s).getBoundingClientRect().top);
    return positions.every((y,i)=>i===0||y>positions[i-1]);
  }));
  check('Shortcut dashboard dihapus',await page.locator('.home-shortcuts,.home-shortcut').count()===0);
  await page.screenshot({path:'docs/screenshots/home-new-mobile.png'});
  await page.locator('#dashboard-activity').getByRole('link',{name:'Cari Materi',exact:true}).click();
  check('Cari Materi dari box menuju rekomendasi',page.url().endsWith('#rekomendasi') && await page.locator('#learning-form').isVisible());
  await page.locator('[data-preset=python]').click();
  await page.locator('#search-button').click();
  await page.locator('[data-action=start-all]').waitFor();
  await page.locator('[data-view=beranda]').click();
  check('Slider beranda memakai hasil API',await page.locator('#home-recommendations .course-row').count()>0);
  await page.screenshot({path:'docs/screenshots/home-results-mobile.png'});
  for(const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    check(`Beranda ${width}`,!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  }
  await page.screenshot({path:'docs/screenshots/home-results-desktop.png'});
  await page.locator('#home-recommendations [data-action=start-single]').first().click();
  await page.waitForURL('**/#quest');
  check('Mulai quest dari slider beranda',await page.locator('.quest-list .course-row').count()===1);
  return results;
}
