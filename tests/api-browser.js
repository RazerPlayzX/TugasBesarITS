async page => {
  const results = [], errors = [];
  const base = 'http://127.0.0.1:8002';
  const email = `e2e-${Date.now()}@example.test`;
  page.on('pageerror', error => errors.push(error.message));
  const check = (name, condition) => { if (!condition) throw new Error(name); results.push({name, passed:true}); };
  await page.context().clearCookies();
  await page.goto(base);
  await page.getByRole('tab', {name:'Buat akun',exact:true}).click();
  await page.locator('#auth-name').fill('Mahasiswa Pengujian');
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill('test-password-123');
  await page.locator('#enter-demo').click();
  await page.waitForURL('**/#beranda');
  check('Registrasi dan profil header', (await page.locator('#account-name').textContent()) === 'Mahasiswa Pengujian');
  const request = async (path, body, csrfOverride) => page.evaluate(async ({path,body,csrfOverride}) => {
    const me = await fetch('/api/me').then(r => r.json());
    const r = await fetch('/api/'+path,{method:body ? 'POST':'GET',headers:{'Content-Type':'application/json','X-CSRF-Token':csrfOverride ?? me.csrf_token},...(body ? {body:JSON.stringify(body)} : {})});
    return {status:r.status, data:r.status===204?null:await r.json()};
  }, {path,body,csrfOverride});
  const input = {topic:'python programming',ability:'Intermediate',score:45};
  for (const [name,patch,status] of [['Topik kosong',{topic:''},422],['Level invalid',{ability:'Conversant'},422],['Nilai negatif',{score:-1},422],['Nilai lebih 100',{score:101},422],['Nilai 0',{score:0},200],['Nilai 100',{score:100},200]]) {
    check(name,(await request('recommend',{...input,...patch})).status===status);
  }
  const empty = await request('recommend',{...input,topic:'zzzzqqqqxyz'});
  check('OOV hasil kosong',empty.data.courses.length===0);
  check('CSRF ditolak',(await request('recommend',input,'invalid')).status===403);
  await page.locator('[data-view=rekomendasi]').click();
  await page.locator('[data-preset=python]').click();
  const recommended = page.waitForResponse(r=>r.url().endsWith('/api/recommend') && r.status()===200);
  await page.locator('#search-button').click();
  const rec = await (await recommended).json();
  await page.locator('[data-action=start-all]').waitFor();
  check('Rekomendasi model asli',rec.mode==='model' && rec.courses.length>0 && rec.courses.every(c=>c.cosine_similarity>0));
  await page.locator('[data-action=start-all]').click();
  await page.waitForURL('**/#quest');
  check('Quest dibuat',await page.locator('[data-action=open-completion]').count()>0);
  await page.locator('[data-action=open-completion]').first().click();
  const form=page.locator('.completion-form:visible');
  await form.locator('input').fill('90');
  const completed=page.waitForResponse(r=>r.url().endsWith('/api/complete') && r.status()===200);
  await form.locator('button[type=submit]').click();
  const reward=await (await completed).json();
  await page.locator('#reward-dialog').waitFor({state:'visible'});
  check('Popup sesuai respons reward',await page.locator('#reward-earned').textContent()===`+${reward.xp_awarded} XP` && reward.xp_awarded===70);
  check('Header sesuai API',await page.locator('#sidebar-xp').textContent()===`${reward.total_xp} XP`);
  await page.screenshot({path:'docs/screenshots/api-reward.png'});
  await page.keyboard.press('Escape');
  check('Escape dialog',!(await page.locator('#reward-dialog').isVisible()));
  const duplicate=await request('complete',{quest_id:reward.state.quest.id,course_id:rec.courses[0].course_id,score:90});
  check('Reward ganda dicegah',duplicate.data.duplicate && duplicate.data.xp_awarded===0);
  await page.reload();
  await page.locator('#app-shell').waitFor({state:'visible'});
  check('Persistensi refresh',await page.locator('#sidebar-xp').textContent()==='70 XP');
  for (const width of [360,768,1440]) {
    await page.setViewportSize({width,height:950});
    check(`Responsif ${width}`, !(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
    await page.screenshot({path:`docs/screenshots/api-${width}.png`});
  }
  await page.locator('#exit-demo').click();
  await page.waitForURL('**/#login');
  check('Akses tanpa sesi',(await request('me')).status===401);
  await page.getByRole('tab', {name:'Masuk',exact:true}).click();
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill('test-password-123');
  await page.locator('#enter-demo').click();
  await page.waitForURL('**/#beranda');
  check('Login kembali mempertahankan progres',await page.locator('#sidebar-xp').textContent()==='70 XP');
  check('Tidak ada exception JavaScript', errors.length===0);
  return results;
}
