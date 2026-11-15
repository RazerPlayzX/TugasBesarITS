const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  const results = [];
  async function check(name, fn) {
    try {
      await fn();
      results.push({ name, status: "LULUS" });
      console.log("PASS " + name);
    } catch (e) {
      results.push({ name, status: "GAGAL", detail: e.message });
      console.log("FAIL " + name + " " + e.message.slice(0, 180));
    }
  }
  async function nav(v) {
    await page.locator(`[data-view=${v}]`).click();
  }
  async function shot(name) {
    await page.waitForTimeout(250);
    await page.evaluate(async () => {
      await document.fonts.ready;
      window.scrollTo(0, 0);
    });
    if (name.includes("slider"))
      await page
        .locator(".carousel")
        .first()
        .screenshot({ path: `docs/screenshots/${name}.png` });
    else
      await page.screenshot({
        path: `docs/screenshots/${name}.png`,
        fullPage: !name.includes("reward"),
      });
  }
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("alur.its.demo.v1")));
  await page.goto("http://127.0.0.1:8000");
  await page.locator("#enter-demo").click();
  await check("Header desktop sticky dan akun dari state", async () => {
    await page.evaluate(() => scrollTo(0, 800));
    assert.ok((await page.locator(".sidebar").boundingBox()).y >= 0);
    assert.equal(
      await page.locator("#account-name").textContent(),
      "Pelajar demo",
    );
    await shot("green-desktop");
  });
  await nav("rekomendasi");
  await page.locator("[data-preset=python]").click();
  await page.locator("#search-button").click();
  await page.waitForFunction(
    () => !document.querySelector("#search-button").disabled,
  );
  await check(
    "Slider banyak materi, batas tombol, keyboard dan urutan",
    async () => {
      const track = page.locator("#results-content .carousel-track");
      assert.equal(await track.locator(".course-row").count(), 3);
      assert.equal(
        await page
          .locator("#results-content")
          .getByRole("button", { name: "Sebelumnya", exact: true })
          .isDisabled(),
        true,
      );
      await track.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(
        () => document.querySelector(".carousel-track").scrollLeft > 0,
      );
      await page.waitForTimeout(200);
      if (
        !(await page
          .locator("#results-content")
          .getByRole("button", { name: "Berikutnya", exact: true })
          .isDisabled())
      )
        await page
          .locator("#results-content")
          .getByRole("button", { name: "Berikutnya", exact: true })
          .click();
      await page.waitForFunction(
        () =>
          document.querySelector(".carousel-controls button:last-child")
            .disabled,
      );
      await shot("green-slider-desktop");
    },
  );
  await page.locator("[data-action=start-all]").click();
  async function finish(score) {
    await page.locator("[data-action=open-completion]").first().click();
    await page.locator(".completion-form:visible input").fill(String(score));
    await page.locator(".completion-form:visible [type=submit]").dblclick();
    await page.locator("#reward-dialog").waitFor({ state: "visible" });
  }
  await check(
    "Reward pertama transaksi70XP, total70, tiga badge baru",
    async () => {
      await finish(90);
      assert.equal(
        await page.locator("#reward-earned").textContent(),
        "+70 XP",
      );
      assert.match(await page.locator("#reward-summary").innerText(), /70 XP/);
      assert.equal(await page.locator("#reward-badges .tag").count(), 3);
      assert.equal((await state()).history.length, 1);
      await shot("green-reward-desktop");
    },
  );
  await check(
    "Modal menahan fokus, Escape menutup dan fokus kembali ke materi",
    async () => {
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        assert.equal(
          await page.evaluate(() =>
            document
              .querySelector("#reward-dialog")
              .contains(document.activeElement),
          ),
          true,
        );
      }
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement.tagName === "H3");
      assert.equal(await page.locator("#reward-dialog").isVisible(), false);
      assert.equal(
        await page.evaluate(() => document.activeElement.tagName),
        "H3",
      );
    },
  );
  await page.waitForFunction(
    () =>
      !document
        .querySelector("#next-recommendations")
        .textContent.includes("Menyiapkan"),
  );
  await check(
    "Naik level menggunakan state nyata, badge lama tidak diulang",
    async () => {
      await finish(80);
      assert.equal(
        await page.locator("#reward-earned").textContent(),
        "+50 XP",
      );
      assert.match(await page.locator("#reward-summary").innerText(), /120 XP/);
      assert.match(await page.locator("#reward-summary").innerText(), /1.*2/s);
      assert.equal(await page.locator("#reward-badges .tag").count(), 0);
      await page.locator("#reward-return").click();
      assert.equal(await page.locator("#sidebar-xp").textContent(), "120 XP");
    },
  );
  await check("Duplikat service tidak memberi reward/popup baru", async () => {
    const value = await page.evaluate(async () => {
      const { recommendationService } =
        await import("./assets/js/services/recommendation-service.js");
      const { showReward } = await import("./assets/js/reward-dialog.js");
      const s = JSON.parse(localStorage.getItem("alur.its.demo.v1"));
      const r = await recommendationService.complete(s, {
        course_id: s.history[0].course_id,
        score: 90,
      });
      showReward(s, r, s.history[0].course_id);
      return {
        xp: r.xp_awarded,
        open: document.querySelector("#reward-dialog").open,
      };
    });
    assert.deepEqual(value, { xp: 0, open: false });
  });
  await check("Refresh tidak membuka ulang reward, quest tetap3", async () => {
    await page.reload();
    assert.equal(await page.locator("#reward-dialog").isVisible(), false);
    assert.equal((await state()).quest.courses.length, 3);
    assert.equal((await state()).history.length, 2);
  });
  await check(
    "Viewport360/768/1440 header/nav sticky, tanpa overflow",
    async () => {
      for (const width of [360, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await nav("beranda");
        await page.evaluate(() => scrollTo(0, 1000));
        await page.waitForTimeout(80);
        assert.ok((await page.locator(".topbar").boundingBox()).y >= 0);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        if (width === 360) {
          assert.ok(
            (await page.locator("#main-navigation").boundingBox()).y > 600,
          );
          assert.match(await page.locator(".topbar").innerText(), /120 XP/);
          await shot("green-mobile");
        }
      }
    },
  );
  await check("Nama panjang ellipsis tanpa overflow", async () => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.evaluate(async () => {
      const { renderState } = await import("./assets/js/ui.js");
      renderState(JSON.parse(localStorage.getItem("alur.its.demo.v1")), {
        name: "Nama mahasiswa sangat panjang ".repeat(10),
      });
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.reload();
  });
  await check("Satu dan nol kandidat ditangani", async () => {
    await nav("rekomendasi");
    await page.evaluate(async () => {
      const { courseRows } = await import("./assets/js/ui.js");
      const s = JSON.parse(localStorage.getItem("alur.its.demo.v1"));
      document
        .querySelector("#results-content")
        .replaceChildren(courseRows(s.quest.courses.slice(0, 1)));
    });
    await page.waitForTimeout(80);
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".carousel-controls button:disabled")
          .length === 2,
    );
    assert.equal(
      await page.locator(".carousel-controls button:disabled").count(),
      2,
    );
    await page.evaluate(async () => {
      const { courseRows } = await import("./assets/js/ui.js");
      document
        .querySelector("#results-content")
        .replaceChildren(courseRows([]));
    });
    assert.equal(await page.locator(".carousel").count(), 0);
  });
  await check("Geser horizontal ponsel tidak memblokir halaman", async () => {
    await page.evaluate(async () => {
      const { courseRows } = await import("./assets/js/ui.js");
      const s = JSON.parse(localStorage.getItem("alur.its.demo.v1"));
      document
        .querySelector("#results-content")
        .replaceChildren(courseRows(s.quest.courses));
    });
    await page.waitForTimeout(80);
    await page
      .locator(".carousel-track")
      .evaluate((e) => e.scrollBy({ left: 300, behavior: "instant" }));
    assert.ok(
      (await page.locator(".carousel-track").evaluate((e) => e.scrollLeft)) > 0,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
  });
  await check("Reward ponsel muat dan header sesuai transaksi", async () => {
    await nav("quest");
    await finish(60);
    await shot("green-reward-mobile");
    const r = await page.locator("#reward-dialog").boundingBox();
    assert.ok(r.x >= 0 && r.x + r.width <= 361);
    assert.equal(await page.locator("#reward-earned").textContent(), "+40 XP");
    await page.locator("#reward-close").click();
    assert.equal(await page.locator("#sidebar-xp").textContent(), "160 XP");
  });
  await check("Logout menjaga progres dan kembali login", async () => {
    await page.locator("#exit-demo").click();
    assert.equal(await page.locator("#login-view").isVisible(), true);
    assert.equal((await state()).history.length, 3);
  });
  await check("Console bersih", async () => assert.deepEqual(errors, []));
  await fs.writeFile(
    "docs/green-interactions-results.json",
    JSON.stringify(
      { run_at: new Date().toISOString(), results, errors },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results.filter((r) => r.status !== "LULUS")));
  console.log(
    `${results.filter((r) => r.status === "LULUS").length}/${results.length}`,
  );
  await browser.close();
  if (results.some((r) => r.status === "GAGAL")) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
