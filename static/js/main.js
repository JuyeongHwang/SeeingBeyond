(function () {
    'use strict';

    // Typeset math (KaTeX auto-render is loaded with defer before this file).
    if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false
        });
    }

    // Method clips play only while on screen; reduced-motion users get controls instead.
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clips = Array.prototype.slice.call(document.querySelectorAll('video[data-autoplay]'));
    var teaser = document.getElementById('teaser');

    if (reduce) {
        if (teaser) {
            teaser.pause();
            teaser.controls = true;
        }
        clips.forEach(function (v) { v.controls = true; });
    } else if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var v = entry.target;
                if (entry.isIntersecting) {
                    v.preload = 'auto';
                    var p = v.play();
                    if (p && p.catch) p.catch(function () { v.controls = true; });
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.25 });
        clips.forEach(function (v) { observer.observe(v); });
        if (teaser) observer.observe(teaser);
    } else {
        clips.forEach(function (v) { v.autoplay = true; v.play(); });
    }

    // Contents sidebar: highlight the section currently being read.
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
    var targets = tocLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var ticking = false;
    function updateToc() {
        ticking = false;
        var current = 0;
        var line = window.innerHeight * 0.3;
        targets.forEach(function (t, i) {
            if (t && t.getBoundingClientRect().top <= line) current = i;
        });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = targets.length - 1;
        }
        tocLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    }
    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(updateToc);
        }
    }, { passive: true });
    updateToc();

    // BibTeX copy
    var button = document.getElementById('copy-bibtex');
    var code = document.getElementById('bibtex-code');
    if (button && code) {
        button.addEventListener('click', function () {
            var done = function () {
                button.textContent = 'Copied';
                setTimeout(function () { button.textContent = 'Copy'; }, 1500);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code.textContent).then(done, function () { select(code); });
            } else {
                select(code);
            }
        });
    }

    function select(node) {
        var range = document.createRange();
        range.selectNodeContents(node);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
})();
