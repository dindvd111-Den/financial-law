(() => {
  'use strict';
  const grid = document.getElementById('ticket-grid');
  const title = document.getElementById('ticket-title');
  const questions = document.getElementById('questions');
  const docx = document.getElementById('download-docx');
  const pdf = document.getElementById('download-pdf');
  const status = document.getElementById('copy-status');
  const fallback = document.getElementById('copy-fallback');
  const field = document.getElementById('ticket-url');
  let current = 1;
  let statusTimer;
  const ticketFromHash = () => {
    const match = location.hash.match(/^#ticket=(\d{1,2})$/);
    return match && +match[1] >= 1 && +match[1] <= TICKETS.length ? +match[1] : null;
  };
  function selectTicket(number, updateUrl = true) {
    if (!Number.isInteger(number) || number < 1 || number > TICKETS.length) return;
    current = number;
    const padded = String(number).padStart(2, '0');
    title.textContent = `Билет ${padded}`;
    questions.replaceChildren(...TICKETS[number - 1].map(question => {
      const item = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = question;
      item.append(text);
      return item;
    }));
    document.title = `Билет ${padded} · Менеджмент — дистанционный зачёт`;
    docx.href = `files/ticket-${padded}.docx`;
    docx.download = `Билет_${padded}_Менеджмент.docx`;
    pdf.href = `files/ticket-${padded}.pdf`;
    for (const button of grid.children) button.setAttribute('aria-pressed', String(+button.dataset.ticket === number));
    if (updateUrl) history.replaceState(null, '', `#ticket=${number}`);
    clearTimeout(statusTimer);
    status.textContent = '';
    fallback.hidden = true;
  }
  TICKETS.forEach((_, index) => {
    const button = document.createElement('button');
    const number = index + 1;
    button.type = 'button';
    button.className = 'ticket-number';
    button.textContent = String(number).padStart(2, '0');
    button.dataset.ticket = number;
    button.setAttribute('aria-label', `Билет ${number}`);
    button.setAttribute('aria-controls', 'ticket-content');
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => selectTicket(number));
    grid.append(button);
  });
  document.getElementById('copy-link').addEventListener('click', async () => {
    const link = new URL(location.href);
    link.hash = `ticket=${current}`;
    try {
      await navigator.clipboard.writeText(link.href);
      status.textContent = `Ссылка на билет ${String(current).padStart(2, '0')} скопирована.`;
      fallback.hidden = true;
      statusTimer = setTimeout(() => { status.textContent = ''; }, 6000);
    } catch {
      field.value = link.href;
      fallback.hidden = false;
      status.textContent = 'Выделите и скопируйте ссылку ниже.';
      field.focus();
      field.select();
    }
  });
  window.addEventListener('hashchange', () => {
    const number = ticketFromHash();
    if (number) selectTicket(number, false);
  });
  selectTicket(ticketFromHash() || 1, false);
})();
