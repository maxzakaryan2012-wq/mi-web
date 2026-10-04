/* Shared browser-local identity, statistics and language metadata. */
window.MiWeb = (() => {
    const PROFILE_KEY = 'miWebProfileV1';
    const fields = {
        estadisticasNumeroAleatorio: ['generados'],
        estadisticasAdivinaNumero: ['mejorIntentos', 'aciertos'],
        estadisticasAdivinoTuNumero: ['mejorIntentos', 'partidas'],
        estadisticasPulsaBoton: ['mejorPuntuacion', 'partidas'],
        estadisticasCarreraInfinita: ['mejorPuntuacion', 'mejorTiempo', 'partidas']
    };

    // A new season isolates new scores from tabs still running older code.
    const STATS_VERSION = ':season-2026-10-04-reset-1';
    const RESET_KEY = 'miWebStatsReset';
    if (localStorage.getItem(RESET_KEY) !== STATS_VERSION) {
        for (const key of Object.keys(fields)) {
            localStorage.removeItem(key);
            localStorage.removeItem(key + ':v2');
            localStorage.setItem(key + STATS_VERSION, '{}');
        }
        localStorage.setItem(RESET_KEY, STATS_VERSION);
    }

    function parseObject(raw) {
        try {
            const value = JSON.parse(raw);
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        } catch { return {}; }
    }

    function profile() {
        const saved = parseObject(localStorage.getItem(PROFILE_KEY));
        if (typeof saved.id === 'string' && saved.id.startsWith('player:') &&
            typeof saved.name === 'string' && saved.name.trim()) return saved;
        let number = localStorage.getItem('numeroUsuario');
        if (!number) {
            number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
            localStorage.setItem('numeroUsuario', number);
        }
        const value = {
            id: 'player:' + crypto.randomUUID(),
            name: localStorage.getItem('nombreUsuario') || 'user_' + number
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(value));
        localStorage.setItem('nombreUsuario', value.name);
        return value;
    }

    function sanitize(key, source) {
        const result = Object.create(null);
        for (const [id, entry] of Object.entries(source)) {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
            const values = {};
            let valid = true;
            for (const field of fields[key]) {
                const number = Number(entry[field]);
                if (entry[field] == null || !Number.isFinite(number) || number < 0 ||
                    number > Number.MAX_SAFE_INTEGER ||
                    (field === 'mejorIntentos' && number < 1)) { valid = false; break; }
                values[field] = field === 'mejorTiempo' ? number : Math.floor(number);
            }
            if (valid) result[id] = values;
        }
        return result;
    }

    function readStats(key) {
        if (!fields[key]) throw new Error('Unknown statistics key');
        const current = localStorage.getItem(key + STATS_VERSION);
        if (current !== null) return sanitize(key, parseObject(current));
        // Keep the original data untouched. Only the current name can safely be
        // attributed to this player; older, unknown names remain separate rows.
        const user = profile();
        const legacy = sanitize(key, parseObject(localStorage.getItem(key)));
        const migrated = Object.create(null);
        for (const [name, value] of Object.entries(legacy)) {
            migrated[name === user.name ? user.id : 'legacy:' + name] = value;
        }
        writeStats(key, migrated);
        return migrated;
    }

    function writeStats(key, data) {
        localStorage.setItem(key + STATS_VERSION, JSON.stringify(sanitize(key, data)));
    }

    function playerName(id) {
        const user = profile();
        return id === user.id ? user.name : id.startsWith('legacy:') ? id.slice(7) : id;
    }

    function rename(name) {
        name = name.trim();
        if (!name) return;
        const user = profile();
        // Migrate all five games before changing the legacy name.
        Object.keys(fields).forEach(readStats);
        user.name = name;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
        localStorage.setItem('nombreUsuario', name);
    }

    function applyLanguage() {
        const selected = localStorage.getItem('idioma');
        const language = ['es', 'en', 'hy'].includes(selected) ? selected : 'es';
        document.documentElement.lang = language;
        const notice = document.getElementById('avisoLocal');
        if (notice) notice.textContent = {
            es: 'Récords y estadísticas de este navegador. No se comparten entre dispositivos y se pierden si borras los datos del sitio.',
            en: 'Records and statistics for this browser. They are not shared between devices and are lost if you clear site data.',
            hy: 'Այս դիտարկիչի ռեկորդներն ու վիճակագրությունը։ Այլ սարքերի հետ չեն համաժամացվում և ջնջվում են կայքի տվյալները մաքրելիս։'
        }[language];
    }


    const EXTRA_STATS_KEY = 'miWebExtraStatsV1';
    const rankingConfigs = new Map();

    function sanitizeExtra(source) {
        const result = Object.create(null);
        for (const [id, entry] of Object.entries(source || {})) {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
            const clean = {};
            for (const [key, value] of Object.entries(entry)) {
                const number = Number(value);
                if (Number.isFinite(number) && number >= 0 && number <= Number.MAX_SAFE_INTEGER) {
                    clean[key] = Number.isInteger(number) ? Math.floor(number) : number;
                }
            }
            result[id] = clean;
        }
        return result;
    }

    function readExtraStats(game) {
        const all = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
        return sanitizeExtra(all[game] || {});
    }

    function writeExtraStats(game, data) {
        const all = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
        all[game] = sanitizeExtra(data);
        localStorage.setItem(EXTRA_STATS_KEY, JSON.stringify(all));
    }

    function updateExtraStats(game, updater) {
        const data = readExtraStats(game);
        const user = profile();
        const current = data[user.id] || {};
        const next = updater({ ...current }) || current;
        data[user.id] = next;
        writeExtraStats(game, data);
        refreshRanking(game);
        return data[user.id];
    }

    function rankingText() {
        const language = document.documentElement.lang || 'es';
        return {
            title: { es: '🏆 Clasificación', en: '🏆 Ranking', hy: '🏆 Վարկանիշ' },
            position: { es: 'Puesto', en: 'Rank', hy: 'Տեղ' },
            player: { es: 'Jugador', en: 'Player', hy: 'Խաղացող' },
            empty: { es: 'Todavía no hay estadísticas.', en: 'No statistics yet.', hy: 'Դեռ վիճակագրություն չկա։' },
            notice: {
                es: 'Estadísticas guardadas en este navegador.',
                en: 'Statistics saved in this browser.',
                hy: 'Վիճակագրությունը պահվում է այս դիտարկիչում։'
            }
        }[language] || {
            title: '🏆 Clasificación', position: 'Puesto', player: 'Jugador',
            empty: 'Todavía no hay estadísticas.', notice: 'Estadísticas guardadas en este navegador.'
        };
    }

    function ensureRankingStyles() {
        if (document.getElementById('miweb-ranking-styles')) return;
        const style = document.createElement('style');
        style.id = 'miweb-ranking-styles';
        style.textContent = `
            .miweb-ranking{max-width:950px;margin:35px auto 0;padding:22px;background:#1d1d1d;border:1px solid #333;border-radius:18px;text-align:left}
            .miweb-ranking h2{text-align:center;margin:0 0 8px;font-size:26px}
            .miweb-ranking .miweb-ranking-note{text-align:center;color:#aaa;font-size:13px;margin:0 0 16px}
            .miweb-ranking-wrap{overflow-x:auto;border:1px solid #333;border-radius:12px}
            .miweb-ranking table{width:100%;border-collapse:collapse;background:#181818}
            .miweb-ranking th,.miweb-ranking td{padding:12px 10px;text-align:center;border-bottom:1px solid #333}
            .miweb-ranking th{background:#222;font-size:14px}
            .miweb-ranking tr:last-child td{border-bottom:0}
            .miweb-ranking tr.miweb-you{background:#292929;font-weight:bold}
            body.claro .miweb-ranking{background:#fff;border-color:#ddd}
            body.claro .miweb-ranking .miweb-ranking-note{color:#555}
            body.claro .miweb-ranking-wrap{border-color:#ddd}
            body.claro .miweb-ranking table{background:#fff}
            body.claro .miweb-ranking th{background:#eee}
            body.claro .miweb-ranking th,body.claro .miweb-ranking td{border-bottom-color:#ddd}
            body.claro .miweb-ranking tr.miweb-you{background:#e8e8e8}
        `;
        document.head.appendChild(style);
    }

    function labelFor(value) {
        if (typeof value === 'string') return value;
        const language = document.documentElement.lang || 'es';
        return value?.[language] || value?.es || '';
    }

    function refreshRanking(game) {
        const config = rankingConfigs.get(game);
        if (!config) return;
        const section = document.getElementById('miweb-ranking-' + game);
        if (!section) return;
        const text = rankingText();
        const data = readExtraStats(game);
        const currentId = profile().id;
        const rows = Object.entries(data).map(([id, values]) => ({ id, name: playerName(id), ...values }));
        rows.sort(config.compare || ((a, b) => 0));

        const title = section.querySelector('.miweb-ranking-title');
        const note = section.querySelector('.miweb-ranking-note');
        const head = section.querySelector('thead');
        const body = section.querySelector('tbody');
        title.textContent = labelFor(config.title) || text.title;
        note.textContent = text.notice;
        head.innerHTML = '';
        body.innerHTML = '';

        const hr = document.createElement('tr');
        [text.position, text.player, ...config.columns.map(c => labelFor(c.label))].forEach(value => {
            const th = document.createElement('th');
            th.textContent = value;
            hr.appendChild(th);
        });
        head.appendChild(hr);

        if (!rows.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 2 + config.columns.length;
            td.textContent = text.empty;
            tr.appendChild(td);
            body.appendChild(tr);
            return;
        }

        rows.slice(0, 20).forEach((row, index) => {
            const tr = document.createElement('tr');
            if (row.id === currentId) tr.classList.add('miweb-you');
            const pos = document.createElement('td');
            const name = document.createElement('td');
            pos.textContent = index + 1;
            name.textContent = row.name;
            tr.append(pos, name);
            config.columns.forEach(column => {
                const td = document.createElement('td');
                const value = row[column.key] ?? 0;
                td.textContent = column.format ? column.format(value, row) : value;
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
    }

    function refreshRankings() {
        for (const game of rankingConfigs.keys()) refreshRanking(game);
    }

    function mountRanking(config) {
        if (!config || !config.game || !Array.isArray(config.columns)) return;
        rankingConfigs.set(config.game, config);
        ensureRankingStyles();
        let section = document.getElementById('miweb-ranking-' + config.game);
        if (!section) {
            section = document.createElement('section');
            section.id = 'miweb-ranking-' + config.game;
            section.className = 'miweb-ranking';
            section.innerHTML = '<h2 class="miweb-ranking-title"></h2><p class="miweb-ranking-note"></p><div class="miweb-ranking-wrap"><table><thead></thead><tbody></tbody></table></div>';
            (document.querySelector('main') || document.body).appendChild(section);
        }
        refreshRanking(config.game);
    }

    function validIntegerRange(first, second) {
        return [first, second].every(value => typeof value === 'string' &&
            value.trim() !== '' && Number.isSafeInteger(Number(value)) &&
            Math.abs(Number(value)) <= 1000000000);
    }

    return { profile, rename, readStats, writeStats, playerName, applyLanguage, validIntegerRange, readExtraStats, writeExtraStats, updateExtraStats, mountRanking, refreshRanking, refreshRankings };
})();
