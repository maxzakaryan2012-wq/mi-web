/* Shared identity, local fallback and global Supabase rankings. */
window.MiWeb = (() => {
    const PROFILE_KEY = 'miWebProfileV1';
    const EXTRA_STATS_KEY = 'miWebExtraStatsV1';
    const GLOBAL_TOKEN_KEY = 'miWebGlobalPlayerTokenV1';
    const SUPABASE_URL = 'https://bxbjbbylswiocymrqaqk.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_fUqvcSbYMb1gfJdrqS-7Lw_nhLtaEp_';

    const fields = {
        estadisticasNumeroAleatorio: ['generados'],
        estadisticasAdivinaNumero: ['mejorIntentos', 'aciertos'],
        estadisticasAdivinoTuNumero: ['mejorIntentos', 'partidas'],
        estadisticasPulsaBoton: ['mejorPuntuacion', 'partidas'],
        estadisticasCarreraInfinita: ['mejorPuntuacion', 'mejorTiempo', 'partidas']
    };

    const oldGameMap = {
        estadisticasNumeroAleatorio: 'numero-aleatorio',
        estadisticasAdivinaNumero: 'adivina-el-numero',
        estadisticasAdivinoTuNumero: 'adivino-tu-numero',
        estadisticasPulsaBoton: 'pulsa-el-boton',
        estadisticasCarreraInfinita: 'carrera-infinita'
    };

    const STATS_VERSION = ':season-2026-10-04-reset-1';
    const RESET_KEY = 'miWebStatsReset';
    const NON_GAME_STATS_CLEANUP_KEY = 'miWebNonGameStatsCleanupV1';
    const rankingConfigs = new Map();
    const globalCache = new Map();
    const globalNames = new Map();
    const syncPending = new Map();
    const initialSyncStarted = new Set();
    let randomGlobalTotalCache = null;
    let randomGlobalTotalPending = null;

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

    function cleanupNonGameStats() {
        if (localStorage.getItem(NON_GAME_STATS_CLEANUP_KEY) === '1') return;
        const all = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
        ['pitagoras', 'porcentajes', 'areas', 'collatz', 'criba-eratostenes'].forEach(game => {
            delete all[game];
        });
        localStorage.setItem(EXTRA_STATS_KEY, JSON.stringify(all));
        localStorage.setItem(NON_GAME_STATS_CLEANUP_KEY, '1');
    }

    cleanupNonGameStats();

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

    function globalToken() {
        let token = localStorage.getItem(GLOBAL_TOKEN_KEY);
        if (!token || token.length < 30) {
            token = crypto.randomUUID() + crypto.randomUUID();
            localStorage.setItem(GLOBAL_TOKEN_KEY, token);
        }
        return token;
    }

    function sanitize(key, source) {
        const result = Object.create(null);
        for (const [id, entry] of Object.entries(source || {})) {
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

    function readLocalOld(key) {
        const current = localStorage.getItem(key + STATS_VERSION);
        if (current !== null) return sanitize(key, parseObject(current));
        const user = profile();
        const legacy = sanitize(key, parseObject(localStorage.getItem(key)));
        const migrated = Object.create(null);
        for (const [name, value] of Object.entries(legacy)) {
            migrated[name === user.name ? user.id : 'legacy:' + name] = value;
        }
        localStorage.setItem(key + STATS_VERSION, JSON.stringify(migrated));
        return migrated;
    }

    function readLocalExtra(game) {
        const all = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
        return sanitizeExtra(all[game] || {});
    }

    async function rpc(name, args) {
        const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Content-Type': 'application/json',
                'x-player-token': globalToken()
            },
            body: JSON.stringify(args)
        });
        const text = await response.text();
        if (!response.ok) throw new Error('Supabase ' + response.status + ': ' + text);
        if (!text) return null;
        try { return JSON.parse(text); } catch { return null; }
    }

    async function refreshRandomGlobalTotal(force = false) {
        if (randomGlobalTotalPending && !force) return randomGlobalTotalPending;
        randomGlobalTotalPending = (async () => {
            try {
                const total = await rpc('get_random_global_total', {});
                randomGlobalTotalCache = Math.max(0, Number(total) || 0);
                window.dispatchEvent(new CustomEvent('miweb-random-global-total', {
                    detail: { total: randomGlobalTotalCache }
                }));
                if (typeof window.actualizarPortadaMejorada === 'function') {
                    queueMicrotask(() => window.actualizarPortadaMejorada());
                }
                return randomGlobalTotalCache;
            } catch (error) {
                console.warn('No se pudo cargar el total global de Número aleatorio.', error);
                return randomGlobalTotalCache;
            } finally {
                randomGlobalTotalPending = null;
            }
        })();
        return randomGlobalTotalPending;
    }

    function readRandomGlobalTotal() {
        if (randomGlobalTotalCache === null && !randomGlobalTotalPending) {
            refreshRandomGlobalTotal();
        }
        return randomGlobalTotalCache;
    }

    function cacheOwn(game, stats) {
        const user = profile();
        const data = globalCache.get(game) || Object.create(null);
        data[user.id] = { ...stats };
        globalNames.set(user.id, user.name);
        globalCache.set(game, data);
    }

    function notifyGlobal(game) {
        refreshRanking(game);
        window.dispatchEvent(new CustomEvent('miweb-global-stats', { detail: { game } }));
        queueMicrotask(() => {
            if (typeof window.mostrarRanking === 'function') window.mostrarRanking();
            if (typeof window.mostrarRecords === 'function') window.mostrarRecords();
            if (typeof window.actualizarPortadaMejorada === 'function') window.actualizarPortadaMejorada();
        });
    }

    async function syncGlobalGame(game, force = false) {
        if (!game) return null;
        if (syncPending.has(game) && !force) return syncPending.get(game);

        const promise = (async () => {
            try {
                const rows = await rpc('get_game_leaderboard', {
                    p_game: game
                });
                const data = Object.create(null);
                for (const row of Array.isArray(rows) ? rows : []) {
                    const id = row.is_you ? profile().id : 'global:' + row.player_id;
                    const clean = sanitizeExtra({ [id]: row.stats || {} });
                    if (clean[id]) data[id] = clean[id];
                    globalNames.set(id, String(row.player_name || 'Jugador').slice(0, 20));
                }
                globalCache.set(game, data);
                notifyGlobal(game);
                return data;
            } catch (error) {
                console.warn('Ranking global no disponible; usando datos locales.', error);
                return null;
            } finally {
                syncPending.delete(game);
            }
        })();

        syncPending.set(game, promise);
        return promise;
    }

    async function submitGlobal(game, stats) {
        if (!game || !stats || typeof stats !== 'object') return;
        try {
            await rpc('submit_game_stats', {
                p_game: game,
                p_name: profile().name.slice(0, 20),
                p_stats: stats
            });
            await syncGlobalGame(game, true);
            if (game === 'numero-aleatorio') await refreshRandomGlobalTotal(true);
        } catch (error) {
            console.warn('No se pudo guardar el ranking global; queda guardado localmente.', error);
        }
    }

    function initialSync(game, localOwn) {
        if (!game || initialSyncStarted.has(game)) return;
        initialSyncStarted.add(game);
        (async () => {
            const remote = await syncGlobalGame(game);
            if (!remote) return;
            const userId = profile().id;
            if (!remote[userId] && localOwn && Object.keys(localOwn).length) {
                await submitGlobal(game, localOwn);
            }
        })();
    }

    function readStats(key) {
        if (!fields[key]) throw new Error('Unknown statistics key');
        const game = oldGameMap[key];
        const local = readLocalOld(key);
        const own = local[profile().id];
        initialSync(game, own);
        const remote = globalCache.get(game);
        return remote ? sanitize(key, remote) : local;
    }

    function writeStats(key, data) {
        if (!fields[key]) throw new Error('Unknown statistics key');
        const clean = sanitize(key, data);
        localStorage.setItem(key + STATS_VERSION, JSON.stringify(clean));
        const game = oldGameMap[key];
        const own = clean[profile().id];
        if (own) {
            cacheOwn(game, own);
            notifyGlobal(game);
            return submitGlobal(game, own);
        }
        return Promise.resolve();
    }

    function readExtraStats(game) {
        const local = readLocalExtra(game);
        const own = local[profile().id];
        initialSync(game, own);
        return globalCache.has(game) ? sanitizeExtra(globalCache.get(game)) : local;
    }

    function writeExtraStats(game, data) {
        const all = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
        const clean = sanitizeExtra(data);
        all[game] = clean;
        localStorage.setItem(EXTRA_STATS_KEY, JSON.stringify(all));
        const own = clean[profile().id];
        if (own) {
            cacheOwn(game, own);
            notifyGlobal(game);
            submitGlobal(game, own);
        }
    }

    function updateExtraStats(game, updater) {
        const local = readLocalExtra(game);
        const user = profile();
        const current = local[user.id] || {};
        const next = updater({ ...current }) || current;
        local[user.id] = next;
        writeExtraStats(game, local);
        return local[user.id];
    }

    function playerName(id) {
        const user = profile();
        if (id === user.id) return user.name;
        if (globalNames.has(id)) return globalNames.get(id);
        return id.startsWith('legacy:') ? id.slice(7) : id.startsWith('global:') ? 'Jugador' : id;
    }

    function syncCurrentName() {
        const user = profile();
        for (const [key, game] of Object.entries(oldGameMap)) {
            const own = readLocalOld(key)[user.id];
            if (own) submitGlobal(game, own);
        }
        const all = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
        for (const [game, rows] of Object.entries(all)) {
            const own = sanitizeExtra(rows)[user.id];
            if (own) submitGlobal(game, own);
        }
        for (const [game, rows] of globalCache.entries()) {
            const own = rows[user.id];
            if (own) submitGlobal(game, own);
        }
    }

    function rename(name) {
        name = name.trim();
        if (!name) return;
        const user = profile();
        Object.keys(fields).forEach(readLocalOld);
        user.name = name.slice(0, 20);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
        localStorage.setItem('nombreUsuario', user.name);
        globalNames.set(user.id, user.name);
        syncCurrentName();
        refreshRankings();
    }

    function applyLanguage() {
        const selected = localStorage.getItem('idioma');
        const language = ['es', 'en', 'hy'].includes(selected) ? selected : 'es';
        document.documentElement.lang = language;
        const notice = document.getElementById('avisoLocal');
        if (notice) notice.textContent = {
            es: 'Clasificación global compartida entre jugadores. Si no hay Internet, tus estadísticas se guardan localmente y se sincronizan después.',
            en: 'Global leaderboard shared between players. If you are offline, your stats are saved locally and sync later.',
            hy: 'Ընդհանուր վարկանիշ բոլոր խաղացողների համար։ Առանց ինտերնետի տվյալները պահվում են տեղային և հետո համաժամացվում։'
        }[language];
    }

    function rankingText() {
        const language = ['es', 'en', 'hy'].includes(document.documentElement.lang)
            ? document.documentElement.lang : 'es';
        const values = {
            es: { title: '🏆 Clasificación global', position: 'Puesto', player: 'Jugador', empty: 'Todavía no hay estadísticas.', notice: 'Ranking global · respaldo local si no hay conexión.' },
            en: { title: '🏆 Global ranking', position: 'Rank', player: 'Player', empty: 'No statistics yet.', notice: 'Global ranking · local fallback when offline.' },
            hy: { title: '🏆 Ընդհանուր վարկանիշ', position: 'Տեղ', player: 'Խաղացող', empty: 'Դեռ վիճակագրություն չկա։', notice: 'Ընդհանուր վարկանիշ · տեղային պահուստ առանց կապի։' }
        };
        return values[language];
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
        syncGlobalGame(config.game);
    }

    function validIntegerRange(first, second) {
        return [first, second].every(value => typeof value === 'string' &&
            value.trim() !== '' && Number.isSafeInteger(Number(value)) &&
            Math.abs(Number(value)) <= 1000000000);
    }

    return {
        profile, rename, readStats, writeStats, playerName, applyLanguage,
        validIntegerRange, readExtraStats, writeExtraStats, updateExtraStats,
        mountRanking, refreshRanking, refreshRankings, syncGlobalGame,
        readRandomGlobalTotal, refreshRandomGlobalTotal
    };
})();
