/*! fallback.js — 保证页面在 CDN 失效时仍可正常显示
 *
 * 背景：Archer 主题把 lozad / anime / pjax / jquery 等库放在 cdn.jsdelivr.net 的
 * combine URL 里一次性加载。该 CDN 在国内时通时断；一旦加载失败，app.js 顶层就会
 * 抛 ReferenceError 而整段中断，导致：
 *   1) body 永远拿不到 .loaded class → #loading 全屏遮罩（z-index:9999）一直盖着页面 → 全白
 *   2) 图片都是 data-src/data-background-image，没有 lozad 就永远不加载
 *
 * 本脚本不依赖任何外部资源，负责在上述情况下兜底。
 */
(function () {
  'use strict';

  function hasLozad() {
    return typeof window.lozad === 'function';
  }

  // 把懒加载属性还原成真实属性（仅在 lozad 缺席时做，正常情况保留懒加载）
  function materialize() {
    var i, el;

    var imgs = document.querySelectorAll('img[data-src]');
    for (i = 0; i < imgs.length; i++) {
      el = imgs[i];
      if (!el.getAttribute('src')) {
        el.setAttribute('src', el.getAttribute('data-src'));
      }
    }

    var bgs = document.querySelectorAll('[data-background-image]');
    for (i = 0; i < bgs.length; i++) {
      el = bgs[i];
      if (!el.style.backgroundImage) {
        el.style.backgroundImage = 'url("' + el.getAttribute('data-background-image') + '")';
      }
    }
  }

  function reveal() {
    if (document.body) {
      document.body.classList.add('loaded');
    }
    var ld = document.getElementById('loading');
    if (ld) {
      ld.style.display = 'none';
    }
  }

  function run(force) {
    if (force || !hasLozad()) {
      materialize();
    }
    reveal();
  }

  // 1) 正常情况：load 后稍等，让主题自己的逻辑先跑
  if (document.readyState === 'complete') {
    setTimeout(run, 800);
  } else {
    window.addEventListener('load', function () {
      setTimeout(run, 800);
    });
  }

  // 2) 最迟 3.5 秒强制兜底（DOMContentLoaded 起算），覆盖 CDN 完全无响应的情况
  setTimeout(function () { run(true); }, 3500);
})();
