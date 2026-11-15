export const DEMO_USER = Object.freeze({ name: 'Pelajar demo' });

export const SESSION_KEY = "alur.its.session.v1";

// Penanda tampilan saja: tidak memberi identitas, otorisasi, atau keamanan.
export function createDemoSession(
  storageProvider = () => window.sessionStorage,
) {
  let active = false;
  let notice = "";
  try {
    const raw = storageProvider().getItem(SESSION_KEY);
    if (raw) {
      const value = JSON.parse(raw);
      active = value.schema_version === 1 && value.mode === "demo";
      if (!active)
        notice = "Penanda sesi tidak valid. Masuk kembali ke mode demo.";
    }
  } catch {
    notice =
      "Sesi tersimpan tidak dapat dibaca. Kamu tetap bisa masuk mode demo.";
  }
  return {
    isActive: () => active,
    user: () => active ? DEMO_USER : null,
    notice: () => notice,
    enter() {
      active = true;
      notice = "";
      try {
        storageProvider().setItem(
          SESSION_KEY,
          JSON.stringify({ schema_version: 1, mode: "demo" }),
        );
      } catch {
        notice =
          "Sesi hanya berlaku selama halaman ini terbuka karena penyimpanan sesi tidak tersedia.";
      }
    },
    exit() {
      active = false;
      notice = "";
      try {
        storageProvider().removeItem(SESSION_KEY);
      } catch {
        notice =
          "Mode demo ditutup pada halaman ini. Penanda sesi tersimpan tidak dapat dihapus oleh browser.";
      }
    },
  };
}
