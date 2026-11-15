/* Jalankan dengan Playwright yang diinstal terpisah; bukan dependensi aplikasi. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.BASE_URL || "http://127.0.0.1:8000";
const output = path.join(ROOT, "docs/screenshots");

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH
      ? { executablePath: process.env.BROWSER_PATH }
      : { channel: "chrome" }),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  const failures = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const results = [];
  // Full-page captures start at the top; offscreen fixed UI is not evidence.
  const screenshot = page.screenshot.bind(page);
  page.screenshot = async (options) => {
    await page.evaluate(async () => {
      await document.fonts.ready;
      window.scrollTo(0, 0);
    });
    return screenshot(options);
  };
  async function check(name, run) {
    try {
      const detail = await run();
      results.push({ name, status: "LULUS", detail: detail || "" });
    } catch (error) {
      results.push({ name, status: "GAGAL", detail: error.message });
      failures.push(name);
    }
  }
  async function fresh() {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.removeItem("alur.its.demo.v1"));
    await page.reload();
    if (await page.locator('#enter-demo').isVisible()) await page.locator('#enter-demo').click();
    await navigate('rekomendasi');
  }
  async function navigate(view) {
    // Tunggu layout dan event media-query setelah pengujian mengubah viewport.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('#main-navigation').isVisible())) await page.locator('#menu-toggle').click();
    await page.locator(`nav [data-view=${view}]`).click();
  }
  async function fill(
    score = "45",
    topic = "python programming",
    ability = "Intermediate",
  ) {
    await page.locator("#topic").fill(topic);
    await page.locator("#ability").selectOption(ability);
    await page.locator("#score").fill(score);
  }
  async function submit() {
    await page.locator("#search-button").click();
    await page.waitForFunction(
      () => !document.querySelector("#search-button").disabled,
    );
  }
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("alur.its.demo.v1")));
  await fresh();
  await check("Tampilan awal dan profil kosong", async () => {
    assert.equal(await page.locator("#sidebar-xp").textContent(), "0 XP");
    assert.equal(await page.locator("#view-rekomendasi").isVisible(), true);
    await page.screenshot({
      path: path.join(output, "desktop-awal.png"),
      fullPage: true,
    });
  });
  await check("Topik kosong dan ringkasan error terfokus", async () => {
    await fill("45", " ");
    await submit();
    assert.equal(
      await page.locator("#topic").getAttribute("aria-invalid"),
      "true",
    );
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "form-errors",
    );
  });
  await check("Nilai kosong ditolak", async () => {
    await fill("");
    await submit();
    assert.equal(
      await page.locator("#score").getAttribute("aria-invalid"),
      "true",
    );
  });
  for (const score of ["-1", "101"])
    await check(`Nilai ${score} ditolak`, async () => {
      await fill(score);
      await submit();
      assert.equal(
        await page.locator("#score").getAttribute("aria-invalid"),
        "true",
      );
    });
  await check("Nilai 0 valid dan tidak reload", async () => {
    await page.evaluate(() => (window.__navigationSentinel = "same-document"));
    await fill("0");
    await submit();
    assert.equal(
      await page.locator("#score").getAttribute("aria-invalid"),
      "false",
    );
    assert.equal(await page.locator("#results-content .course-row").count(), 3);
    assert.equal(
      await page.evaluate(() => window.__navigationSentinel),
      "same-document",
    );
  });
  for (const [score, type, level] of [
    ["59", "Remedial", "Beginner"],
    ["60", "Improvement", "Intermediate"],
    ["79", "Improvement", "Intermediate"],
    ["80", "Mastery", "Advanced"],
  ])
    await check(`Batas adaptasi ${score}`, async () => {
      await fill(score);
      await submit();
      assert.ok((await page.locator(".adaptation").innerText()).includes(type));
      assert.ok(
        (await page.locator(".adaptation").innerText()).includes(level),
      );
    });
  await check("Tiga skenario dari sumber", async () => {
    for (const [preset, count] of [
      ["python", 3],
      ["ml", 2],
      ["sql", 3],
    ]) {
      await page.locator(`[data-preset=${preset}]`).click();
      await submit();
      assert.equal(
        await page.locator("#results-content .course-row").count(),
        count,
      );
    }
  });
  await check(
    "Kueri di luar skenario dijelaskan tanpa hasil palsu",
    async () => {
      await fill("70", "belajar biologi");
      await submit();
      assert.ok(
        (await page.locator("#results-content").innerText()).includes(
          "Topik di luar skenario demo",
        ),
      );
      assert.equal(
        await page.locator("#results-content .course-row").count(),
        0,
      );
    },
  );
  await page.locator(".demo-tools summary").click();
  await check("Loading deterministik dan tombol disabled", async () => {
    await page.locator("#demo-mode").selectOption("slow");
    await fill();
    await page.locator("#search-button").click();
    assert.equal(
      await page.locator("#results-region").getAttribute("aria-busy"),
      "true",
    );
    assert.equal(await page.locator("#search-button").isDisabled(), true);
    await page.waitForFunction(
      () => !document.querySelector("#search-button").disabled,
    );
  });
  await check("Simulasi hasil kosong", async () => {
    await page.locator("#demo-mode").selectOption("empty");
    await submit();
    assert.ok(
      (await page.locator("#results-content").innerText()).includes(
        "Simulasi hasil kosong",
      ),
    );
  });
  await check("Simulasi error dan pemulihan Coba lagi", async () => {
    await page.locator("#demo-mode").selectOption("error");
    await submit();
    assert.equal(await page.locator("[data-action=retry]").isVisible(), true);
    await page.locator("#demo-mode").selectOption("normal");
    await page.locator("[data-action=retry]").click();
    await page.locator("[data-action=start-all]").waitFor();
    assert.equal(await page.locator("#results-content .course-row").count(), 3);
  });
  await page.locator(".demo-tools summary").click();
  await page.locator("#topic").focus();
  await page.keyboard.press("Tab");
  await check("Navigasi keyboard dan focus indicator", async () => {
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "ability",
    );
    const style = await page
      .locator("#ability")
      .evaluate((node) => ({
        outline: getComputedStyle(node).outlineStyle,
        width: getComputedStyle(node).outlineWidth,
      }));
    assert.equal(style.outline, "solid");
    assert.equal(style.width, "3px");
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.id), "score");
  });
  await page.screenshot({
    path: path.join(output, "desktop-rekomendasi.png"),
    fullPage: true,
  });
  await check("Mulai quest dengan tiga materi tetap", async () => {
    await page.locator("[data-action=start-all]").click();
    assert.equal(await page.locator("#view-quest").isVisible(), true);
    assert.equal((await state()).quest.courses.length, 3);
  });
  await check(
    "Tautan aman dan membuka materi tidak menyelesaikan",
    async () => {
      const link = page.locator("#quest-content .course-link").first();
      assert.ok(
        (await link.getAttribute("href")).startsWith(
          "https://www.coursera.org/",
        ),
      );
      assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
      await context.route("https://www.coursera.org/**", (route) =>
        route.fulfill({
          status: 200,
          body: "External navigation stub for UI test",
        }),
      );
      const popupPromise = context.waitForEvent("page");
      await link.click();
      const popup = await popupPromise;
      await popup.close();
      assert.equal((await state()).history.length, 0);
      await context.unroute("https://www.coursera.org/**");
    },
  );
  await check(
    "Penyelesaian nilai 90: +70 XP, badge kumulatif, progres 1/3",
    async () => {
      await page.locator("[data-action=open-completion]").first().click();
      const form = page.locator(".completion-form:visible");
      await form.locator("input").fill("90");
      await form.locator("[type=submit]").click();
      await page.waitForFunction(
        () => document.querySelector("#sidebar-xp").textContent === "70 XP",
      );
      assert.equal((await state()).history.length, 1);
      assert.equal((await state()).quest.courses.length, 3);
      assert.equal(
        await page.locator("#quest-content progress").getAttribute("value"),
        "33.33",
      );
      await navigate('progres');
      assert.equal(await page.locator(".badge-item.earned").count(), 3);
      await page.screenshot({
        path: path.join(output, "desktop-progres.png"),
        fullPage: true,
      });
      await navigate('quest');
      await page.waitForTimeout(650);
      await page.screenshot({
        path: path.join(output, "desktop-quest.png"),
        fullPage: true,
      });
    },
  );
  await check(
    "Penyelesaian berulang melalui service tidak menambah XP",
    async () => {
      const duplicate = await page.evaluate(async () => {
        const { recommendationService } =
          await import("./assets/js/services/recommendation-service.js");
        const { profileFromState } = await import("./assets/js/state.js");
        const s = JSON.parse(localStorage.getItem("alur.its.demo.v1"));
        const r = await recommendationService.complete(s, {
          course_id: s.history[0].course_id,
          score: 100,
        });
        return { xp: r.xp_awarded, total: profileFromState(r.state).xp };
      });
      assert.deepEqual(duplicate, { xp: 0, total: 70 });
    },
  );
  await check("Rekomendasi berikutnya terpisah dari quest", async () => {
    assert.equal(await page.locator("#next-recommendations").isVisible(), true);
    assert.equal((await state()).quest.courses.length, 3);
    assert.ok(
      (await page.locator("#next-recommendations").innerText()).includes(
        "Level sasaran: Intermediate",
      ),
    );
  });
  await check(
    "Pencarian baru dan pembatalan penggantian menjaga quest",
    async () => {
      await navigate('rekomendasi');
      await page.locator("[data-preset=sql]").click();
      await submit();
      assert.equal((await state()).quest.topic, "python programming");
      await page.locator("[data-action=start-all]").click();
      await page.locator("[data-action=cancel-quest]").click();
      assert.equal((await state()).quest.topic, "python programming");
    },
  );
  await check("Konfirmasi penggantian mempertahankan XP", async () => {
    await page.locator("[data-action=start-all]").click();
    await page.locator("[data-action=confirm-quest]").click();
    assert.equal((await state()).quest.topic, "sql database");
    assert.equal((await state()).history.length, 1);
  });
  await check("Persistensi setelah reload", async () => {
    await page.reload();
    assert.equal(await page.locator("#sidebar-xp").textContent(), "70 XP");
    assert.equal((await state()).quest.topic, "sql database");
  });
  await check("Reset demo tidak menghapus data situs lain", async () => {
    await page.evaluate(() => localStorage.setItem("unrelated.test", "keep"));
    await page.locator(".demo-tools summary").click();
    await page.locator("#reset-demo").click();
    await page.locator("#confirm-reset").click();
    assert.equal(await page.locator("#sidebar-xp").textContent(), "0 XP");
    assert.equal(await state(), null);
    assert.equal(
      await page.evaluate(() => localStorage.getItem("unrelated.test")),
      "keep",
    );
    await page.evaluate(() => localStorage.removeItem("unrelated.test"));
  });
  await check("JSON localStorage rusak ditangani", async () => {
    await page.evaluate(() =>
      localStorage.setItem("alur.its.demo.v1", "{broken"),
    );
    await page.reload();
    assert.equal(await page.locator("#storage-notice").isVisible(), true);
    assert.equal(await page.locator("#sidebar-xp").textContent(), "0 XP");
  });
  await fresh();
  await check("Storage tidak tersedia: aplikasi tetap berfungsi", async () => {
    const blocked = await browser.newContext();
    await blocked.addInitScript(() =>
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      }),
    );
    const tab = await blocked.newPage();
    await tab.goto(BASE);
    await tab.locator('#enter-demo').click();
    await tab.locator('nav [data-view=rekomendasi]').click();
    assert.equal(await tab.locator("#storage-notice").isVisible(), true);
    await tab.locator("[data-preset=python]").click();
    await tab.locator("#search-button").click();
    await tab.locator("[data-action=start-all]").click();
    assert.equal(await tab.locator("#quest-content .course-row").count(), 3);
    await blocked.close();
  });
  await check(
    "Rating kosong, URL tidak aman, dan teks data tidak dieksekusi",
    async () => {
      const safe = await page.evaluate(async () => {
        const { courseRows } = await import("./assets/js/ui.js");
        const rows = courseRows([
          {
            course_id: "test",
            title: "<img src=x onerror=alert(1)>",
            url: "javascript:alert(1)",
            rating: null,
            difficulty: "Beginner",
          },
        ]);
        return {
          text: rows.textContent,
          images: rows.querySelectorAll("img").length,
          links: rows.querySelectorAll("a").length,
        };
      });
      assert.ok(safe.text.includes("Belum tersedia"));
      assert.equal(safe.images, 0);
      assert.equal(safe.links, 0);
    },
  );
  await check(
    "Pencarian lambat diselaraskan dengan penyelesaian terbaru",
    async () => {
      await fresh();
      await fill();
      await submit();
      await page.locator("[data-action=start-all]").click();
      const courseId = (await state()).quest.courses[0].course_id;
      await navigate('rekomendasi');
      await page.locator(".demo-tools summary").click();
      await page.locator("#demo-mode").selectOption("slow");
      await page.locator("#search-button").click();
      await navigate('quest');
      await page.locator("[data-action=open-completion]").first().click();
      const form = page.locator(".completion-form:visible");
      await form.locator("input").fill("90");
      await form.locator("[type=submit]").click();
      await page.waitForFunction(
        () => document.querySelector("#sidebar-xp").textContent === "70 XP",
      );
      await page.waitForFunction(
        () => !document.querySelector("#search-button").disabled,
      );
      await navigate('rekomendasi');
      assert.equal(
        await page
          .locator(`#results-content [data-course-id="${courseId}"]`)
          .count(),
        0,
      );
      assert.equal(
        await page.locator("#results-content .course-row").count(),
        2,
      );
      assert.equal((await state()).quest.courses.length, 3);
      await fresh();
    },
  );
  await check("Semua tautan internal dan aset lokal tersedia", async () => {
    const paths = await page.evaluate(() =>
      [...document.querySelectorAll("link[href],script[src],img[src]")].map(
        (e) => e.href || e.src,
      ),
    );
    for (const url of paths)
      assert.equal((await context.request.get(url)).status(), 200);
    for (const view of ["rekomendasi", "quest", "progres"]) {
      await navigate(view);
      await page.locator(`#view-${view}`).waitFor({ state: "visible" });
    }
  });
  await check(
    "Responsif 320, 390, 768, 1024, 1440 tanpa overflow",
    async () => {
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        for (const view of ["rekomendasi", "quest", "progres"]) {
          await navigate(view);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            `${width}: ${view}`,
          );
        }
      }
    },
  );
  await check(
    "Ponsel: hasil, quest, form penyelesaian, dan progres",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await navigate('rekomendasi');
      await page.screenshot({
        path: path.join(output, "mobile-awal.png"),
        fullPage: true,
      });
      await page.locator("[data-preset=python]").click();
      await submit();
      await page.screenshot({
        path: path.join(output, "mobile-rekomendasi.png"),
        fullPage: true,
      });
      await page.locator("[data-action=start-all]").click();
      await page.locator("[data-action=open-completion]").first().click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.screenshot({
        path: path.join(output, "mobile-quest.png"),
        fullPage: true,
      });
      await navigate('progres');
      await page.screenshot({
        path: path.join(output, "mobile-progres.png"),
        fullPage: true,
      });
    },
  );
  await check("Reduced motion dan tidak ada console/page error", async () => {
    assert.equal(
      await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
      true,
    );
    assert.deepEqual(errors, []);
  });
  await fs.writeFile(
    path.join(ROOT, "docs/browser-results.json"),
    JSON.stringify(
      {
        run_at: new Date().toISOString(),
        browser: await browser.version(),
        results,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        passed: results.length - failures.length,
        total: results.length,
        failures,
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
  if (failures.length) process.exitCode = 1;
})();
