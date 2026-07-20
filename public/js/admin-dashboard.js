let evolucionChartInstance = null;
let productosChartInstance = null;
let categoriasChartInstance = null;

function roundMoney(value) {
  return Math.round((Number(value) || 0) / 5) * 5;
}

function formatMoneyJS(value) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0
  }).format(roundMoney(value));
}

function chartColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    || localStorage.getItem('theme') === 'dark' ? '#f8d7e4' : '#4b2434';
}

if (window.Chart) {
  Chart.defaults.color = chartColor();
  Chart.defaults.font.family = "'Outfit', sans-serif";
}

async function cargarEstadisticas() {
  const btn = document.getElementById('btnFiltrar');
  btn.textContent = '...';
  btn.disabled = true;
  try {
    const params = new URLSearchParams();
    const inicio = document.getElementById('fechaInicio').value;
    const fin = document.getElementById('fechaFin').value;
    if (inicio) params.append('fechaInicio', inicio);
    if (fin) params.append('fechaFin', fin);
    const url = `/admin/api/dashboard-stats${params.toString() ? `?${params}` : ''}`;
    const data = await (await fetch(url)).json();
    actualizarKPIs(data.kpis);
    renderEvolucionChart(data.graficos.evolucion);
    renderTopProductosChart(data.graficos.topProductos);
    renderTopCategoriasChart(data.graficos.topCategorias);
  } catch (error) {
    console.error(error);
  } finally {
    btn.textContent = 'Filtrar';
    btn.disabled = false;
  }
}

function limpiarFiltros() {
  document.getElementById('fechaInicio').value = '';
  document.getElementById('fechaFin').value = '';
  cargarEstadisticas();
}

function setMoney(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = formatMoneyJS(value);
}

function actualizarKPIs(kpis) {
  setMoney('kpiConIva', kpis.totalConIva);
  setMoney('kpiSinIva', kpis.totalSinIva);
  setMoney('kpiGananciaTotal', kpis.gananciaTotal);
  setMoney('kpiGananciaNeta', kpis.gananciaNeta);
  setMoney('kpiCostosProductos', kpis.costosProductos);
  setMoney('kpiGastos', kpis.gastosAdicionales);
}

function renderEvolucionChart(evo) {
  if (!window.Chart) return;
  if (evolucionChartInstance) evolucionChartInstance.destroy();
  const labels = Object.keys(evo).sort();
  const tooltip = { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatMoneyJS(ctx.raw)}` } };
  const moneyAxis = { ticks: { callback: (value) => formatMoneyJS(value) } };
  evolucionChartInstance = new Chart(document.getElementById('evolucionChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Ventas sin IVA', data: labels.map((l) => evo[l].ingresos), backgroundColor: '#7b2446' },
        { label: 'Costos productos', data: labels.map((l) => evo[l].costos), backgroundColor: '#c7964a' },
        { label: 'Gastos adicionales', data: labels.map((l) => evo[l].gastos), backgroundColor: '#356d84' },
        { label: 'Ganancia neta', data: labels.map((l) => evo[l].neta), type: 'line', borderColor: '#10b981', borderWidth: 3, tension: .35 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { tooltip },
      scales: { x: { grid: { display: false } }, y: moneyAxis }
    }
  });
}

function renderTopProductosChart(items) {
  if (!window.Chart) return;
  if (productosChartInstance) productosChartInstance.destroy();
  const has = items.length > 0;
  productosChartInstance = new Chart(document.getElementById('topProductosChart'), {
    type: 'doughnut',
    data: {
      labels: has ? items.map((p) => p.nombre) : ['Sin datos'],
      datasets: [{ data: has ? items.map((p) => p.cantidad) : [1], backgroundColor: ['#7b2446', '#c7964a', '#356d84', '#10b981', '#fb7185'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
  });
}

function renderTopCategoriasChart(items) {
  if (!window.Chart) return;
  if (categoriasChartInstance) categoriasChartInstance.destroy();
  const has = items.length > 0;
  categoriasChartInstance = new Chart(document.getElementById('topCategoriasChart'), {
    type: 'bar',
    data: {
      labels: has ? items.map((c) => c.nombre) : ['Sin datos'],
      datasets: [{ data: has ? items.map((c) => c.ganancia) : [0], backgroundColor: '#c7964a' }]
    },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
  });
}

document.addEventListener('DOMContentLoaded', cargarEstadisticas);
