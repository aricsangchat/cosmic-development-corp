async function main() {
  const data = await fetch('./data.json').then(r => r.json());

  const fmt = (n) => new Intl.NumberFormat('en-US').format(Math.round(n)) + ' THB';

  // Header
  document.getElementById('projectName').textContent = data.project.name;
  document.getElementById('projectMeta').textContent = data.project.location;
  document.getElementById('managerChip').textContent = `Managed by: ${data.project.manager}`;
  document.getElementById('updatedMonth').textContent = data.project.timeline_current.slice(0,7);

  // Financials
  const invested = data.financials.invested_to_date_thb;               // 2.8M current
  const outstanding = data.financials.outstanding_work_thb;            // 300k approx
  const totalAfter = data.financials.total_after_completion_thb;        // 3.1M target total
  const rent = data.financials.estimated_rent_thb_per_month;
  const saleLow = data.financials.estimated_sale_value_thb_low;
  const saleHigh = data.financials.estimated_sale_value_thb_high;

  document.getElementById('invested').textContent = fmt(invested);
  document.getElementById('outstanding').textContent = fmt(outstanding);
  document.getElementById('totalAfter').textContent = fmt(totalAfter);
  document.getElementById('rent').textContent = fmt(rent);
  document.getElementById('saleValue').textContent = `${fmt(saleLow)} – ${fmt(saleHigh)}`;

  // Timeline
  const tl = document.getElementById('timeline');
  tl.innerHTML = data.timeline.map(m => `
    <div class="month">
      <div class="monthTitle">
        <strong>${escapeHtml(m.title)}</strong>
        <span class="badge">${m.month}</span>
      </div>
  
      <ul>
        ${m.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
      </ul>
  
      <div class="photoGrid">
        ${(m.photos || []).map(p => `
          <div class="photoWrap">
            <img src="${p}" alt="${escapeHtml(m.title)}" />
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Outstanding items table
  const out = document.getElementById('outstandingList');
  const totalItems = data.outstanding_work_items.reduce((s, x) => s + x.budget_thb, 0);

  out.innerHTML = `
    <table>
      <thead><tr><th>Item</th><th>Budget</th></tr></thead>
      <tbody>
        ${data.outstanding_work_items.map(i => `
          <tr><td>${escapeHtml(i.item)}</td><td>${fmt(i.budget_thb)}</td></tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('outstandingTotal').textContent = fmt(totalItems);

  // Profit split table
  const ps = document.getElementById('profitSplit');
  ps.innerHTML = `
    <table>
      <thead><tr><th>Party</th><th>Profit Split</th></tr></thead>
      <tbody>
        ${data.profit_split.map(p => `
          <tr><td>${escapeHtml(p.name)}</td><td>${p.percent}%</td></tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.getElementById('costBasis').textContent = fmt(invested);
  document.getElementById('targetTotal').textContent = fmt(totalAfter);
  document.getElementById('year').textContent = new Date().getFullYear();

  // Returns quick view (gross)
  const rentYear = rent * 12;
  const yieldCurrent = (rentYear / invested) * 100;
  const yieldTotal = (rentYear / totalAfter) * 100;
  const upsideLow = saleLow - totalAfter;
  const upsideHigh = saleHigh - totalAfter;

  document.getElementById('rentYear').textContent = fmt(rentYear);
  document.getElementById('yieldCurrent').textContent = `${yieldCurrent.toFixed(2)}% / year (gross)`;
  document.getElementById('yieldTotal').textContent = `${yieldTotal.toFixed(2)}% / year (gross)`;
  document.getElementById('upside').textContent = `${fmt(upsideLow)} – ${fmt(upsideHigh)}`;

  // Allocation calculator
  const maxPool = data.participation.max_pool_percent ?? 40;
  const defaultPct = data.participation.default_percent ?? 5;

  const pctEl = document.getElementById('pct');
  const pctLabel = document.getElementById('pctLabel');
  const impliedContributionEl = document.getElementById('impliedContribution');
  const rentShareEl = document.getElementById('rentShare');
  const saleShareEl = document.getElementById('saleShare');

  document.getElementById('poolMax').textContent = String(maxPool);

  pctEl.max = String(maxPool);
  pctEl.value = String(defaultPct);

  function recalc() {
    const pct = Number(pctEl.value || 0);
    pctLabel.textContent = String(pct);

    // Default model: contribution implied at "total after completion" valuation
    // (You can change this later to a different pricing model.)
    const impliedContribution = (totalAfter / 100) * pct;

    const rentShare = rent * (pct / 100);
    const saleShareLow = saleLow * (pct / 100);
    const saleShareHigh = saleHigh * (pct / 100);

    impliedContributionEl.textContent = fmt(impliedContribution);
    rentShareEl.textContent = fmt(rentShare);
    saleShareEl.textContent = `${fmt(saleShareLow)} – ${fmt(saleShareHigh)}`;

    // write into hidden form fields
    const hiddenPct = document.getElementById('requested_participation_percent');
    const hiddenContribution = document.getElementById('implied_contribution_thb');
    if (hiddenPct) hiddenPct.value = String(pct);
    if (hiddenContribution) hiddenContribution.value = String(Math.round(impliedContribution));
  }

  pctEl.addEventListener('input', recalc);
  recalc();
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
