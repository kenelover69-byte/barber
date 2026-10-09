/* BLACKLINE — front-end interactions. Real Altegio booking requires a widget URL or backend credentials. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Mobile navigation
const menuToggle = $('.menu-toggle');
const nav = $('.nav');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
});
$$('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuToggle?.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open');
}));

// Scroll reveal
const revealNodes = $$('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  revealNodes.forEach(node => observer.observe(node));
} else revealNodes.forEach(node => node.classList.add('in-view'));

// Service selection syncs with booking form
const serviceSelect = $('#bookingService');
const masterSelect = $('#bookingMaster');
const summaryService = $('#summaryService');
const summaryMeta = $('#summaryMeta');
const summaryPrice = $('#summaryPrice');
function updateSummary() {
  const [name, price, duration] = (serviceSelect?.value || 'Чоловіча стрижка|600|45 хв').split('|');
  if (summaryService) summaryService.textContent = name;
  if (summaryMeta) summaryMeta.textContent = `${duration} · ${price} ₴`;
  if (summaryPrice) summaryPrice.textContent = `${price} ₴`;
}
serviceSelect?.addEventListener('change', updateSummary);
$$('.service-row').forEach(row => row.addEventListener('click', () => {
  $$('.service-row').forEach(item => item.classList.remove('active'));
  row.classList.add('active');
  const name = row.dataset.service;
  const price = row.dataset.price;
  const duration = row.dataset.duration;
  const option = [...serviceSelect.options].find(opt => opt.value.startsWith(`${name}|`));
  if (option) serviceSelect.value = option.value;
  else serviceSelect.value = `${name}|${price}|${duration}`;
  updateSummary();
  $('#booking').scrollIntoView({ behavior: 'smooth' });
}));
$$('.barber-book').forEach(button => button.addEventListener('click', () => {
  if (masterSelect) masterSelect.value = button.dataset.master;
  $('#booking').scrollIntoView({ behavior: 'smooth' });
  showToast(`Майстра ${button.dataset.master} обрано. Заверши запис у формі.`);
}));

// Set date minimum to today in local time
const dateInput = $('#bookingDate');
if (dateInput) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = localToday;
  dateInput.value = localToday;
}

function showToast(message) {
  const toast = $('#toast'); if (!toast) return;
  toast.textContent = message; toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3400);
}

// Demo booking form: does NOT create a real appointment yet.
const form = $('#bookingForm');
const formMessage = $('#formMessage');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const [service, price, duration] = serviceSelect.value.split('|');
  const details = {
    name: $('#bookingName').value.trim(),
    phone: $('#bookingPhone').value.trim(),
    service,
    price,
    duration,
    master: masterSelect.value,
    date: dateInput.value,
    time: $('#bookingTime').value
  };
  if (formMessage) {
    formMessage.innerHTML = `<strong>ДЕМО-ЗАЯВКУ СФОРМОВАНО</strong><br>${escapeHtml(details.name)}, ${escapeHtml(details.service)} · ${escapeHtml(details.date)} о ${escapeHtml(details.time)}.<br>Майстер: ${escapeHtml(details.master)} · ${escapeHtml(details.price)} ₴.<br><span>Реальне бронювання не створено. Підключіть віджет Altegio або серверний API, щоб підтвердити вільний слот і зберегти запис.</span>`;
    formMessage.classList.add('show');
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  showToast('Демо-форму заповнено. Реальний запис ще не підключено.');
});
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
updateSummary();
