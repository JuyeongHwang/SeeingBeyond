/* Seeing Beyond the Next Step — project page interactions.
   All numbers below are transcribed from the paper (Tables 1, 2, 6; Fig. 7). */

(function () {
    'use strict';

    // ---------------------------------------------------------------------
    // Data
    // ---------------------------------------------------------------------

    var SCENES = ['Zara01', 'Zara01_Group', 'Students003', 'ETH_Intersection', 'ETH_Hallway'];
    var METHODS = ['GBM', 'CCP', 'CEDRL', 'Ours'];

    // [GSR, SRVR, GD]
    var MAIN = {
        Zara01: { GBM: [55.6, 21.0, 0.6], CCP: [33.3, 16.0, 2.6], CEDRL: [50.0, 15.6, 1.3], Ours: [72.2, 7.0, 0.6] },
        Zara01_Group: { GBM: [38.9, 17.5, 1.9], CCP: [27.8, 19.5, 4.8], CEDRL: [22.2, 17.4, 5.9], Ours: [77.8, 1.2, 2.1] },
        Students003: { GBM: [64.0, 15.2, 1.4], CCP: [28.0, 20.0, 3.4], CEDRL: [37.0, 27.1, 1.8], Ours: [66.0, 7.2, 0.7] },
        ETH_Intersection: { GBM: [72.2, 23.5, 2.7], CCP: [61.1, 13.0, 2.3], CEDRL: [55.6, 13.3, 2.9], Ours: [83.3, 3.9, 0.9] },
        ETH_Hallway: { GBM: [68.8, 9.3, 1.3], CCP: [62.5, 7.5, 1.8], CEDRL: [56.3, 19.1, 1.5], Ours: [87.5, 0.9, 0.8] }
    };

    var METRICS = [
        { key: 'GSR', label: 'GSR', higher: true, decimals: 1,
          desc: 'Goal success rate (%): fraction of agents reaching their destination without collision. Higher is better.' },
        { key: 'SRVR', label: 'SRVR', higher: false, decimals: 1,
          desc: 'Social-region violation rate (%): fraction of time steps spent in inappropriate regions such as roadways. Lower is better.' },
        { key: 'GD', label: 'GD', higher: false, decimals: 1,
          desc: 'Group distance: mean distance to the assigned group centroid. Lower is better.' }
    ];

    var VARIANTS = ['Ours', 'w/o dual world models', 'w/o State Transition WM', 'w/o Semantic Transition WM',
        'w/o VLM', 'Top-10 candidates', 'Random-10 candidates'];

    // [GSR, SRVR, GD] per variant, in VARIANTS order
    var ABLATION = {
        Zara01: [[72.2, 7.0, 0.6], [25.9, 12.6, 0.7], [44.4, 10.7, 0.6], [44.4, 9.3, 0.6], [48.1, 10.9, 0.9], [44.4, 18.2, 0.7], [22.2, 20.2, 0.7]],
        Zara01_Group: [[77.8, 1.2, 2.1], [16.7, 47.0, 1.9], [27.8, 22.3, 1.7], [38.9, 17.5, 2.3], [29.6, 7.4, 1.7], [14.8, 42.7, 3.2], [18.5, 18.5, 2.5]],
        Students003: [[66.0, 7.2, 0.7], [44.7, 14.4, 0.7], [47.0, 9.5, 0.8], [63.3, 8.9, 0.8], [60.0, 10.6, 0.8], [61.3, 8.3, 1.0], [57.3, 8.5, 0.8]],
        ETH_Intersection: [[83.3, 3.9, 0.9], [40.7, 13.5, 1.1], [51.9, 10.6, 1.0], [66.7, 6.2, 0.9], [63.0, 7.4, 1.1], [55.6, 13.9, 1.0], [44.4, 14.2, 0.8]],
        ETH_Hallway: [[87.5, 0.9, 0.8], [58.3, 9.9, 1.0], [58.3, 8.7, 0.8], [70.8, 13.7, 0.6], [66.7, 16.9, 0.9], [62.5, 3.4, 0.7], [70.8, 12.5, 1.2]]
    };

    // mean, standard error, significance vs. ours ('**' p<.01, '*' p<.05, 'ns')
    var STUDY = [
        { name: 'Overall', data: { Ours: [4.94, 0.44], GBM: [3.19, 0.34, '**'], CCP: [3.54, 0.34, '*'], CEDRL: [3.14, 0.34, '**'] } },
        { name: 'Motion quality', data: { Ours: [4.91, 0.44], GBM: [3.14, 0.32, '**'], CCP: [3.48, 0.32, '*'], CEDRL: [3.04, 0.33, '**'] } },
        { name: 'Naturalness', data: { Ours: [4.88, 0.47], GBM: [3.13, 0.35, '**'], CCP: [3.45, 0.35, '*'], CEDRL: [3.07, 0.35, '**'] } },
        { name: 'Smoothness', data: { Ours: [5.05, 0.44], GBM: [3.32, 0.38, '**'], CCP: [3.68, 0.36, 'ns'], CEDRL: [3.31, 0.36, '**'] } }
    ];
    var STUDY_ORDER = ['Ours', 'GBM', 'CCP', 'CEDRL'];
    var SIG_TEXT = { '**': 'p < .01', '*': 'p < .05', ns: 'n.s.' };

    // ADE, ADE CI, FDE, FDE CI
    var FIDELITY = {
        Zara01: { GBM: [0.3057, 0.0345, 0.5203, 0.0509], CCP: [0.2406, 0.0005, 0.4524, 0.0005], CEDRL: [0.3629, 0.0071, 0.6817, 0.0134], Ours: [0.2064, 0.0069, 0.3897, 0.0141] },
        Students003: { GBM: [0.2147, 0.0026, 0.4194, 0.0056], CCP: [0.2053, 0.0031, 0.3873, 0.0060], CEDRL: [0.2338, 0.0030, 0.4382, 0.0058], Ours: [0.1994, 0.0026, 0.3948, 0.0052] }
    };

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function fmt(v, d) {
        return v.toFixed(d);
    }

    function bestOf(values, higher) {
        return higher ? Math.max.apply(null, values) : Math.min.apply(null, values);
    }

    // Clean axis: the smallest step from {1, 2, 2.5, 5} x 10^k that spans max (plus label
    // headroom) in at most 5 intervals.
    function niceScale(max) {
        var target = max * 1.08;
        var pow = Math.pow(10, Math.floor(Math.log10(target / 5)));
        var mults = [1, 2, 2.5, 5, 10, 20];
        var step = mults[mults.length - 1] * pow;
        for (var i = 0; i < mults.length; i++) {
            if (Math.ceil(target / (mults[i] * pow) - 1e-9) <= 5) { step = mults[i] * pow; break; }
        }
        var top = Math.ceil(target / step - 1e-9) * step;
        var ticks = [];
        for (var t = 0; t <= top + 1e-9; t += step) ticks.push(Math.round(t * 100) / 100);
        return { max: top, ticks: ticks };
    }

    function setupTabs(list, onChange) {
        var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
        function select(i, focus) {
            tabs.forEach(function (t, j) {
                t.setAttribute('aria-selected', j === i ? 'true' : 'false');
                t.tabIndex = j === i ? 0 : -1;
            });
            if (focus) tabs[i].focus();
            onChange(i, tabs[i]);
        }
        tabs.forEach(function (t, i) {
            t.type = 'button';
            t.addEventListener('click', function () { select(i); });
            t.addEventListener('keydown', function (e) {
                var n = null;
                if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
                else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home') n = 0;
                else if (e.key === 'End') n = tabs.length - 1;
                if (n !== null) { e.preventDefault(); select(n, true); }
            });
        });
        select(0);
    }

    function buildTabs(list, labels) {
        labels.forEach(function (label, i) {
            var b = el('button', 'tab', label);
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            list.appendChild(b);
        });
    }

    // ---------------------------------------------------------------------
    // Tooltip
    // ---------------------------------------------------------------------

    var tooltip = document.getElementById('tooltip');

    function showTooltip(title, rows, x, y) {
        tooltip.textContent = '';
        tooltip.appendChild(el('div', 'tooltip-title', title));
        rows.forEach(function (r) {
            var row = el('div', 'tooltip-row' + (r.ours ? ' is-ours' : ''));
            row.appendChild(el('i', 'key'));
            row.appendChild(el('b', null, r.value));
            row.appendChild(el('span', null, r.name));
            tooltip.appendChild(row);
        });
        tooltip.classList.add('is-visible');
        var w = tooltip.offsetWidth;
        var h = tooltip.offsetHeight;
        var left = Math.min(x + 16, window.innerWidth - w - 12);
        var top = y + 16;
        if (top + h > window.innerHeight - 12) top = y - h - 12;
        tooltip.style.left = Math.max(12, left) + 'px';
        tooltip.style.top = Math.max(12, top) + 'px';
    }

    function hideTooltip() {
        tooltip.classList.remove('is-visible');
    }

    // ---------------------------------------------------------------------
    // Closed-loop chart (emphasis: ours vs. best baseline per scene)
    // ---------------------------------------------------------------------

    function renderMainChart(mi) {
        var chart = document.getElementById('main-chart');
        var metric = METRICS[mi];
        document.getElementById('metric-desc').textContent = metric.desc;

        var groups = SCENES.map(function (scene) {
            var baselines = METHODS.filter(function (m) { return m !== 'Ours'; });
            var vals = baselines.map(function (m) { return MAIN[scene][m][mi]; });
            var best = bestOf(vals, metric.higher);
            var bestName = baselines.filter(function (m) { return MAIN[scene][m][mi] === best; }).join(' / ');
            return { scene: scene, ours: MAIN[scene].Ours[mi], base: best, baseName: bestName };
        });

        var max = metric.key === 'GSR' ? 100 / 1.08 : Math.max.apply(null, groups.map(function (g) {
            return Math.max(g.ours, g.base);
        }));
        var scale = niceScale(max);
        var pct = function (v) { return (v / scale.max) * 100; };

        chart.textContent = '';

        var grid = el('div', 'hbar-grid');
        scale.ticks.forEach(function (t) {
            var line = el('span');
            line.style.left = pct(t) + '%';
            grid.appendChild(line);
        });
        chart.appendChild(grid);

        groups.forEach(function (g) {
            var group = el('div', 'hbar-group');
            group.tabIndex = 0;
            group.setAttribute('aria-label', g.scene + ': ours ' + fmt(g.ours, metric.decimals) +
                ', best baseline ' + g.baseName + ' ' + fmt(g.base, metric.decimals));
            group.appendChild(el('div', 'hbar-scene', g.scene));
            var rows = el('div', 'hbar-rows');
            [{ v: g.ours, who: 'Ours', ours: true }, { v: g.base, who: g.baseName, ours: false }].forEach(function (r) {
                var row = el('div', 'hbar-row' + (r.ours ? ' is-ours' : ''));
                var bar = el('div', 'hbar-bar');
                bar.style.width = pct(r.v) + '%';
                var label = el('span', 'hbar-value');
                label.style.left = pct(r.v) + '%';
                label.appendChild(el('b', null, fmt(r.v, metric.decimals)));
                label.appendChild(el('span', 'who', r.who));
                row.appendChild(bar);
                row.appendChild(label);
                rows.appendChild(row);
            });
            group.appendChild(rows);

            var tipRows = function () {
                return ['Ours', 'GBM', 'CCP', 'CEDRL'].map(function (m) {
                    return { name: m, value: fmt(MAIN[g.scene][m][mi], metric.decimals), ours: m === 'Ours' };
                });
            };
            group.addEventListener('pointermove', function (e) {
                if (e.pointerType === 'touch') return;
                showTooltip(g.scene + ' · ' + metric.label, tipRows(), e.clientX, e.clientY);
            });
            group.addEventListener('pointerleave', hideTooltip);
            group.addEventListener('focus', function () {
                var r = group.getBoundingClientRect();
                showTooltip(g.scene + ' · ' + metric.label, tipRows(), r.left + r.width * 0.6, r.top);
            });
            group.addEventListener('blur', hideTooltip);
            chart.appendChild(group);
        });

        var axis = el('div', 'hbar-axis');
        axis.setAttribute('aria-hidden', 'true');
        scale.ticks.forEach(function (t) {
            var s = el('span', null, String(t));
            s.style.left = pct(t) + '%';
            axis.appendChild(s);
        });
        chart.appendChild(axis);
    }

    function renderMainTable() {
        var table = document.getElementById('main-table');
        var thead = el('thead');
        var hr = el('tr');
        ['Method', 'GSR ↑', 'SRVR ↓', 'GD ↓'].forEach(function (h) {
            var th = el('th', null, h);
            th.scope = 'col';
            hr.appendChild(th);
        });
        thead.appendChild(hr);
        table.appendChild(thead);

        var tbody = el('tbody');
        SCENES.forEach(function (scene) {
            var gr = el('tr', 'group-row');
            var gth = el('th', 'scene-cell', scene);
            gth.colSpan = 4;
            gth.scope = 'colgroup';
            gr.appendChild(gth);
            tbody.appendChild(gr);

            var best = METRICS.map(function (m, mi) {
                return bestOf(METHODS.map(function (k) { return MAIN[scene][k][mi]; }), m.higher);
            });
            METHODS.forEach(function (method) {
                var tr = el('tr', method === 'Ours' ? 'is-ours' : '');
                var th = el('th', null, method);
                th.scope = 'row';
                tr.appendChild(th);
                METRICS.forEach(function (m, mi) {
                    var v = MAIN[scene][method][mi];
                    tr.appendChild(el('td', v === best[mi] ? 'best' : '', fmt(v, m.decimals)));
                });
                tbody.appendChild(tr);
            });
        });
        table.appendChild(tbody);
    }

    // ---------------------------------------------------------------------
    // Ablation table (per scene)
    // ---------------------------------------------------------------------

    function renderAblation(si) {
        var scene = SCENES[si];
        var rows = ABLATION[scene];
        var table = document.getElementById('ablation-table');
        table.textContent = '';

        var caption = el('caption', null, scene + ' — ablation (Table 2)');
        caption.className = 'sr-only';
        caption.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
        table.appendChild(caption);

        var thead = el('thead');
        var hr = el('tr');
        ['Variant', 'GSR ↑', 'SRVR ↓', 'GD ↓'].forEach(function (h) {
            var th = el('th', null, h);
            th.scope = 'col';
            hr.appendChild(th);
        });
        thead.appendChild(hr);
        table.appendChild(thead);

        var best = METRICS.map(function (m, mi) {
            return bestOf(rows.map(function (r) { return r[mi]; }), m.higher);
        });
        var tbody = el('tbody');
        rows.forEach(function (r, i) {
            var tr = el('tr', i === 0 ? 'is-ours' : '');
            var th = el('th', null, VARIANTS[i]);
            th.scope = 'row';
            tr.appendChild(th);
            METRICS.forEach(function (m, mi) {
                tr.appendChild(el('td', r[mi] === best[mi] ? 'best' : '', fmt(r[mi], m.decimals)));
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    }

    // ---------------------------------------------------------------------
    // User study dot plot (1-7 Likert)
    // ---------------------------------------------------------------------

    function renderStudy(ci) {
        var chart = document.getElementById('study-chart');
        var crit = STUDY[ci];
        var lo = 1, hi = 7;
        var pct = function (v) { return ((v - lo) / (hi - lo)) * 100; };

        var first = !chart.firstChild;
        if (first) {
            var grid = el('div', 'dots-grid');
            for (var t = lo; t <= hi; t++) {
                var line = el('span');
                line.style.left = pct(t) + '%';
                grid.appendChild(line);
            }
            chart.appendChild(grid);
            STUDY_ORDER.forEach(function (m) {
                var row = el('div', 'dots-row' + (m === 'Ours' ? ' is-ours' : ''));
                row.dataset.method = m;
                row.appendChild(el('div', 'dots-name', m));
                var track = el('div', 'dots-track');
                track.appendChild(el('span', 'dots-whisker'));
                track.appendChild(el('span', 'dots-dot'));
                row.appendChild(track);
                row.appendChild(el('div', 'dots-meta'));
                chart.appendChild(row);
            });
            var axis = el('div', 'dots-axis');
            axis.setAttribute('aria-hidden', 'true');
            for (var a = lo; a <= hi; a++) {
                var s = el('span', null, String(a));
                s.style.left = pct(a) + '%';
                axis.appendChild(s);
            }
            chart.appendChild(axis);
        }

        Array.prototype.forEach.call(chart.querySelectorAll('.dots-row'), function (row) {
            var d = crit.data[row.dataset.method];
            var mean = d[0], se = d[1];
            var wh = row.querySelector('.dots-whisker');
            wh.style.left = pct(mean - se) + '%';
            wh.style.width = (pct(mean + se) - pct(mean - se)) + '%';
            row.querySelector('.dots-dot').style.left = pct(mean) + '%';
            var meta = row.querySelector('.dots-meta');
            meta.textContent = '';
            meta.appendChild(el('b', null, fmt(mean, 2)));
            meta.appendChild(document.createTextNode(' ±' + fmt(se, 2)));
            if (d[2]) meta.appendChild(el('span', 'sig', SIG_TEXT[d[2]]));
            row.setAttribute('aria-label', row.dataset.method + ': ' + fmt(mean, 2) + ' ± ' + fmt(se, 2) +
                (d[2] ? ', ' + SIG_TEXT[d[2]] + ' vs. ours' : ''));
        });
    }

    // ---------------------------------------------------------------------
    // Motion fidelity table
    // ---------------------------------------------------------------------

    function renderFidelity() {
        var table = document.getElementById('fidelity-table');
        var thead = el('thead');
        var hr = el('tr');
        ['Method', 'ADE ↓', 'FDE ↓'].forEach(function (h) {
            var th = el('th', null, h);
            th.scope = 'col';
            hr.appendChild(th);
        });
        thead.appendChild(hr);
        table.appendChild(thead);

        var tbody = el('tbody');
        Object.keys(FIDELITY).forEach(function (scene) {
            var gr = el('tr', 'group-row');
            var gth = el('th', 'scene-cell', scene);
            gth.colSpan = 3;
            gth.scope = 'colgroup';
            gr.appendChild(gth);
            tbody.appendChild(gr);

            var data = FIDELITY[scene];
            var bestAde = Math.min.apply(null, METHODS.map(function (m) { return data[m][0]; }));
            var bestFde = Math.min.apply(null, METHODS.map(function (m) { return data[m][2]; }));
            METHODS.forEach(function (m) {
                var d = data[m];
                var tr = el('tr', m === 'Ours' ? 'is-ours' : '');
                var th = el('th', null, m);
                th.scope = 'row';
                tr.appendChild(th);
                [[d[0], d[1], bestAde], [d[2], d[3], bestFde]].forEach(function (c) {
                    var td = el('td', c[0] === c[2] ? 'best' : '');
                    td.appendChild(document.createTextNode(fmt(c[0], 4) + ' '));
                    td.appendChild(el('span', 'pm', '±' + fmt(c[1], 4)));
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        });
        table.appendChild(tbody);
    }

    // ---------------------------------------------------------------------
    // Videos: play method clips only while visible; honor reduced motion
    // ---------------------------------------------------------------------

    function setupVideos() {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var clips = Array.prototype.slice.call(document.querySelectorAll('video[data-autoplay]'));
        var teaser = document.getElementById('teaser-video');

        if (reduce) {
            if (teaser) { teaser.pause(); teaser.removeAttribute('autoplay'); teaser.controls = true; }
            clips.forEach(function (v) { v.controls = true; });
            return;
        }

        if (!('IntersectionObserver' in window)) {
            clips.forEach(function (v) { v.autoplay = true; v.preload = 'auto'; v.play().catch(function () {}); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var v = entry.target;
                if (entry.isIntersecting) {
                    if (v.preload !== 'auto') v.preload = 'auto';
                    var p = v.play();
                    if (p && p.catch) p.catch(function () { v.controls = true; });
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.25 });
        clips.forEach(function (v) { io.observe(v); });
        if (teaser) io.observe(teaser);
    }

    // ---------------------------------------------------------------------
    // Misc
    // ---------------------------------------------------------------------

    function setupTopbar() {
        var bar = document.getElementById('topbar');
        var onScroll = function () { bar.classList.toggle('is-scrolled', window.scrollY > 8); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function setupCopy() {
        var btn = document.getElementById('copy-bibtex');
        var code = document.getElementById('bibtex-code');
        var label = btn.querySelector('span');
        btn.addEventListener('click', function () {
            var text = code.textContent;
            var done = function () {
                label.textContent = 'Copied';
                setTimeout(function () { label.textContent = 'Copy'; }, 1600);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, function () { selectCode(code); });
            } else {
                selectCode(code);
            }
        });
    }

    function selectCode(node) {
        var range = document.createRange();
        range.selectNodeContents(node);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // ---------------------------------------------------------------------
    // Init
    // ---------------------------------------------------------------------

    setupTopbar();
    setupVideos();
    setupCopy();

    setupTabs(document.getElementById('metric-tabs'), function (i) {
        hideTooltip();
        renderMainChart(i);
    });
    renderMainTable();

    setupTabs(document.getElementById('qual-tabs'), function (i, tab) {
        var tabs = document.querySelectorAll('#qual-tabs [role="tab"]');
        Array.prototype.forEach.call(tabs, function (t) {
            document.getElementById(t.getAttribute('aria-controls')).hidden = t !== tab;
        });
    });

    var abTabs = document.getElementById('ablation-tabs');
    buildTabs(abTabs, SCENES);
    setupTabs(abTabs, renderAblation);

    var stTabs = document.getElementById('study-tabs');
    buildTabs(stTabs, STUDY.map(function (s) { return s.name; }));
    setupTabs(stTabs, renderStudy);

    renderFidelity();
})();
