const dialog = document.createElement('dialog');
dialog.id = 'description-dialog';
dialog.setAttribute('aria-labelledby', 'description-title');
const heading = document.createElement('div');
heading.className = 'reward-heading';
const title = document.createElement('h2');
title.id = 'description-title';
title.lang = 'en';
const close = document.createElement('button');
close.type = 'button';
close.className = 'button secondary';
close.textContent = 'Tutup';
close.setAttribute('aria-label', 'Tutup deskripsi');
const provider = document.createElement('p');
provider.className = 'course-provider';
const content = document.createElement('p');
content.className = 'description-content';
content.lang = 'en';
heading.append(title, close);
dialog.append(heading, provider, content);
document.body.append(dialog);
let trigger = null;
let closing = false;

async function dismiss() {
  if (closing || !dialog.open) return;
  closing = true;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await dialog.animate([{ opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(8px)' }], { duration: 140, easing: 'ease-in' }).finished;
  }
  dialog.close();
  closing = false;
}
close.addEventListener('click', dismiss);
dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
dialog.addEventListener('keydown', event => {
  if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
});
dialog.addEventListener('close', () => {
  if (trigger?.isConnected) trigger.focus({ preventScroll: true });
});

export function showDescription(course, opener) {
  if (dialog.open) return;
  trigger = opener;
  title.textContent = course.title;
  provider.textContent = course.provider || '';
  provider.hidden = !course.provider;
  // Course exports can contain literal newline escapes; insert as text only.
  content.textContent = course.description.replace(/<[^>]*>/g, ' ').replace(/\\n/g, '\n').trim();
  dialog.showModal();
  dialog.scrollTop = 0;
  close.focus({ preventScroll: true });
}
