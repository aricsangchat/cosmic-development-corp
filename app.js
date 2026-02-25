async function main() {
  const data = await fetch('./data.json').then(r => r.json());
  const fmtTHB = (n) => new Intl.NumberFormat('en-US').format(Math.round(n)) + ' THB';

  // Brand / hero
  document.getElementById('wordmark').textContent = data.brand.wordmark || 'COSMIC DEVELOPMENT CORP';
  document.getElementById('tagline').textContent = data.brand.tagline || 'Project Portfolio';

  document.getElementById('projectId').textContent = data.project.id;
  document.getElementById('projectLocation').textContent = data.project.location;
  document.getElementById('projectStatus').textContent = data.project.status;

  document.getElementById('projectName').textContent = data.project.name;
  document.getElementById('projectSummary').textContent = data.project.summary;

  document.getElementById('startingPrice').textContent = fmtTHB(data.project.starting_price_thb);

  // Specs
  const specsEl = document.getElementById('specs');
  specsEl.innerHTML = (data.project.specs || []).map(s => `
    <div class="specPill">${escapeHtml(s)}</div>
  `).join('');

  // Final design renders
  document.getElementById('finalDesc').textContent = data.final_design.description || '';
  const rendersEl = document.getElementById('renders');
  rendersEl.innerHTML = (data.final_design.renders || []).map(r => `
    <figure class="renderCard">
      <div class="renderImg">
        <img src="${r.image}" alt="${escapeHtml(r.label)}" loading="lazy" />
      </div>
      <figcaption class="renderCap">${escapeHtml(r.label)}</figcaption>
    </figure>
  `).join('');

  // Timeline + photo grids
  const tl = document.getElementById('timeline');
  tl.innerHTML = (data.timeline || []).map(m => `
    <div class="month">
      <div class="monthTitle">
        <strong>${escapeHtml(m.title)}</strong>
        <span class="badge">${escapeHtml(m.month)}</span>
      </div>

      <ul>
        ${(m.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('')}
      </ul>

      <div class="photoGrid">
        ${(m.photos || []).map(p => `
          <div class="photoWrap">
            <img src="${p}" alt="${escapeHtml(m.title)} photo" loading="lazy" />
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  document.getElementById('year').textContent = new Date().getFullYear();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

main();
