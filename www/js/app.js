/* =========================================================
   LOL × Syiid — Application Logic
   Compatible with: Capacitor, Cordova, Android WebView
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = type || '';
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- Haptics (Capacitor fallback ke navigator) ---------- */
  function vibrate(pattern) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
      const H = window.Capacitor.Plugins.Haptics;
      if (Array.isArray(pattern)) {
        // Haptics tidak support pattern → mainkan sekuensial
        let delay = 0;
        pattern.forEach(ms => {
          setTimeout(() => H.vibrate({ duration: ms }), delay);
          delay += ms;
        });
      } else {
        H.vibrate({ duration: pattern });
      }
    } else if (navigator.vibrate) {
      navigator.vibrate(pattern);
    } else {
      return false;
    }
    return true;
  }

  /* =========================================================
     LOCK MODULE
     ========================================================= */
  const Lock = (() => {
    const KEY = 'lolx_syiid_pass';
    const DEFAULT_PASS = '1234';
    const MAX_LEN = 8;

    let input = '';
    let isUnlocking = false;

    const getPassword = () => localStorage.getItem(KEY) || DEFAULT_PASS;
    const setPassword = (p) => localStorage.setItem(KEY, p);

    function buildKeypad() {
      const kp = document.getElementById('keypad');
      kp.innerHTML = '';
      const keys = ['1','2','3','4','5','6','7','8','9','C','0','back'];
      keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'key' + (isNaN(k) ? ' action' : '');
        if (k === 'back') {
          btn.innerHTML = '<svg><use href="#i-back"/></svg>';
        } else {
          btn.textContent = k;
        }
        btn.addEventListener('click', () => onKey(k));
        kp.appendChild(btn);
      });
    }

    function renderPin(error) {
      const display = document.getElementById('pinDisplay');
      display.innerHTML = '';
      const len = Math.max(getPassword().length, input.length, 4);
      for (let i = 0; i < len; i++) {
        const dot = document.createElement('div');
        dot.className = 'pin-dot'
          + (i < input.length ? ' filled' : '')
          + (error ? ' error' : '');
        display.appendChild(dot);
      }
    }

    function onKey(k) {
      if (isUnlocking) return;
      const err = document.getElementById('lockError');
      err.textContent = '';
      err.classList.remove('shake');

      if (k === 'C') { input = ''; renderPin(); return; }
      if (k === 'back') {
        input = input.slice(0, -1);
        renderPin();
        return;
      }
      if (input.length >= MAX_LEN) return;

      input += k;
      renderPin();
      vibrate(15);

      if (input.length === getPassword().length) {
        setTimeout(checkPassword, 130);
      }
    }

    function checkPassword() {
      const stored = getPassword();
      if (input === stored) {
        isUnlocking = true;
        document.getElementById('lockTitle').textContent = 'UNLOCKED';
        document.getElementById('lockHint').textContent = 'Akses diberikan';
        vibrate([60, 40, 60]);
        setTimeout(() => {
          close
