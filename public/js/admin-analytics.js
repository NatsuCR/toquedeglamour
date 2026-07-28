let summaryChart = null;
let pagesChart = null;

function analyticsData() {
  const source = document.getElementById('analyticsChartData');
  return source ? JSON.parse(source.textContent) : { summary: {}, pages: [] };
}

function analyticsTextColor() {
  if (document.documentElement.getAttribute('data-theme') === 'dark') {
    return '#ffffff';
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--text-main').trim() || '#4b2434';
}

function shortRoute(route) {
  return route.length > 30 ? `${route.slice(0, 27)}...` : route;
}

function renderAnalyticsCharts() {
  if (!window.Chart) return;
  const data = analyticsData();
  const summary = data.summary;
  const textColor = analyticsTextColor();
  const palette = ['#7b2446', '#d96b91', '#c7964a', '#356d84', '#6f8f78', '#9f5f76'];
  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "'Outfit', sans-serif";
  if (summaryChart) summaryChart.destroy();
  if (pagesChart) pagesChart.destroy();

  summaryChart = new Chart(document.getElementById('analyticsSummaryChart'), {
    type: 'bar',
    data: {
      labels: ['Visitas', 'Unicos', 'Publicas', 'Paginas vistas', 'Clics'],
      datasets: [{
        label: 'Total registrado',
        data: [summary.visits, summary.uniqueVisitors, summary.publicVisits, summary.pageViews, summary.clicks],
        backgroundColor: palette.slice(0, 5),
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { title: () => '' } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { beginAtZero: true, ticks: { precision: 0, color: textColor } }
      }
    }
  });

  const hasPages = data.pages.length > 0;
  pagesChart = new Chart(document.getElementById('analyticsPagesChart'), {
    type: 'doughnut',
    data: {
      labels: hasPages ? data.pages.map((item) => shortRoute(item.label)) : ['Sin datos'],
      datasets: [{
        data: hasPages ? data.pages.map((item) => item.value) : [1],
        backgroundColor: hasPages ? palette : ['#c7b8be'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, color: textColor } }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('analyticsResetDialog');
  document.querySelector('[data-open-analytics-reset]')?.addEventListener('click', () => dialog?.showModal());
  document.querySelector('[data-close-analytics-reset]')?.addEventListener('click', () => dialog?.close());
  document.getElementById('themeSelector')?.addEventListener('change', () => setTimeout(renderAnalyticsCharts, 0));
  renderAnalyticsCharts();
});
