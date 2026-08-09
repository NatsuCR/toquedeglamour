(() => {
  const THREE_HOURS = 3 * 60 * 60 * 1000;
  const PING_INTERVAL = 60 * 1000;
  const events = ['pointerdown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
  let logoutTimer;
  let lastPing = 0;

  function leavePanel() {
    window.location.assign('/admin/logout');
  }

  function resetTimer() {
    window.clearTimeout(logoutTimer);
    logoutTimer = window.setTimeout(leavePanel, THREE_HOURS);
  }

  async function pingServer(force = false) {
    const now = Date.now();
    if (!force && now - lastPing < PING_INTERVAL) return;
    lastPing = now;
    try {
      const response = await fetch('/admin/session/activity', {
        method: 'POST', credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      if (response.status === 401) window.location.assign('/admin/login?inactividad=1');
    } catch {
      lastPing = 0;
    }
  }

  function registerActivity() {
    resetTimer();
    pingServer();
  }

  events.forEach((eventName) => {
    window.addEventListener(eventName, registerActivity, { passive: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      resetTimer();
      pingServer(true);
    }
  });
  resetTimer();
  pingServer(true);
})();
