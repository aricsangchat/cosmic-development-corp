async function main() {
  const data = await fetch('./data.json').then(r => r.json());

  const fmt = (n) => new Intl.NumberFormat('en-US').format(n) + ' THB';

  // Header
  document.getElementById('projectName').textContent = data.project.name;
  document.getElementById('projectMeta').textContent = `${data.project.location}`;
  document.getElementById('managerChip').textContent = `Managed by: ${data.project.manager}`;
  document.getElementById('updatedMonth').textContent = data.project.timeline_current.slice(0,7);

  // Snapshot
  const invested = data.financials.invested_to_date_thb;
  const outstanding = data.financials.outstanding_work_thb;
  const rent = data.financials.estimated_rent_thb_per_month;
  const saleLow = data.financials.estimated_sale_value_thb_low;
  const saleHigh = data.financials.estimated_sale_value_thb_high;

  document.getElementById('invested').textContent = fmt(invested);
  document.getElementById('outstanding').textContent = fmt(outstanding);
  document.getElementById('rent').textContent = fmt(rent);
  document.getElementById('saleValue').textContent = `${fmt(saleLow)} – ${fmt(saleHigh)}`;

  // Timeline
  const tl = document.getElementById('timeline');
  tl.innerHTML = data.timeline.map(m => `
    <div class="month">
      <div class="monthTitle">
        <strong>${m.title}</strong>
        <span class="badge">${m.month}</span>
      </div>
      <ul>
        ${m.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  // Outstanding work items
  const out = document.getElementById('outstandingList');
  const totalItems = data.outstanding_work_items.reduce((s, x) => s + x.budget_thb, 0);
  out.innerHTML = `
    <table>
      <thead><tr><th>Item</th><th>Budget</th></tr></thead>
      <tbody>
        ${data.outstanding_work_items.map(i => `
          <tr><td>${i.item}</td><td>${fmt(i.budget_thb)}</td></tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('outstandingTotal').textContent = fmt(totalItems);

  // Ownership
  const own = document.getElementById('ownership');
  own.innerHTML = `
    <table>
      <thead><tr><th>Owner</th><th>Share</th></tr></thead>
      <tbody>
        ${data.ownership.map(o => `
          <tr><td>${o.name}</td><td>${o.percent}%</td></tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('costBasis').textContent = fmt(invested);

  // Returns quick view (gross)
  const rentYear = rent * 12;
  const yieldPct = (rentYear / invested) * 100;
  const upsideLow = saleLow - invested;
  const upsideHigh = saleHigh - invested;

  document.getElementById('rentYear').textContent = fmt(rentYear);
  document.getElementById('yield').textContent = `${yieldPct.toFixed(2)}% / year (gross)`;
  document.getElementById('upside').textContent = `${fmt(upsideLow)} – ${fmt(upsideHigh)}`;

  // Investor scenarios (default pricing: cost basis per 1% of total project)
  const per1pct = invested / 100;
  const completionFunding = outstanding;

  const scenarioPercents = [5, 10, 15, 25]; // % of TOTAL project, bought from Terry (max 25%)
  const rows = scenarioPercents.map(p => {
    const equityBuy = per1pct * p;           // paid to Terry (default model)
    const totalContrib = completionFunding + equityBuy;
    const estRentSharePerMo = rent * (p / 100);
    const estSaleShareLow = saleLow * (p / 100);
    const estSaleShareHigh = saleHigh * (p / 100);
    return { p, equityBuy, totalContrib, estRentSharePerMo, estSaleShareLow, estSaleShareHigh };
  });

  document.getElementById('scenarios').innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Investor % (total)</th>
          <th>Equity buy-in (to Terry)</th>
          <th>+ Finish funding</th>
          <th>Total contribution</th>
          <th>Est. rent share / mo</th>
          <th>Est. sale proceeds share</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.p}%</td>
            <td>${fmt(Math.round(r.equityBuy))}</td>
            <td>${fmt(completionFunding)}</td>
            <td>${fmt(Math.round(r.totalContrib))}</td>
            <td>${fmt(Math.round(r.estRentSharePerMo))}</td>
            <td>${fmt(Math.round(r.estSaleShareLow))} – ${fmt(Math.round(r.estSaleShareHigh))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.getElementById('year').textContent = new Date().getFullYear();
}

main();
