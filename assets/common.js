/* Shared identity, local fallback and global Supabase rankings. */
window.MiWeb = (() => {
    const PROFILE_KEY = 'miWebProfileV1';
    const EXTRA_STATS_KEY = 'miWebExtraStatsV1';
    const GLOBAL_TOKEN_KEY = 'miWebGlobalPlayerTokenV1';
    const SUPABASE_URL = 'https://bxbjbbylswiocymrqaqk.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_fUqvcSbYMb1gfJdrqS-7Lw_nhLtaEp_';

    const fields = {
        estadisticasAdivinaNumero: ['mejorIntentos', 'aciertos'],
        estadisticasAdivinoTuNumero: ['mejorIntentos', 'partidas'],
        estadisticasPulsaBoton: ['mejorPuntuacion', 'partidas']
    };

    const oldGameMap = {
        estadisticasAdivinaNumero: 'adivina-el-numero',
        estadisticasAdivinoTuNumero: 'adivino-tu-numero',
        estadisticasPulsaBoton: 'pulsa-el-boton'
    };

    const STATS_VERSION = ':season-2026-10-04-reset-1';
    const RESET_KEY = 'miWebStatsReset';
    const NON_GAME_STATS_CLEANUP_KEY = 'miWebNonGameStatsCleanupV1';
    const DISABLED_STATS_GAMES = new Set(['pitagoras', 'porcentajes', 'areas', 'collatz', 'criba-eratostenes']);
    const rankingConfigs = new Map();
    const globalCache = new Map();
    const globalNames = new Map();
    const syncPending = new Map();
    const initialSyncStarted = new Set();

    const XP_LOCAL_KEY = 'miWebXpProgressV1';
    const XP_MAX_LEVEL = 100;
    const XP_MAX_TOTAL = 131175;
    let xpCache = null;
    let xpActiveTimer = null;
    let xpRefreshPending = null;

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
        DISABLED_STATS_GAMES.forEach(game => {
            delete all[game];
        });
        localStorage.setItem(EXTRA_STATS_KEY, JSON.stringify(all));
        localStorage.setItem(NON_GAME_STATS_CLEANUP_KEY, '1');
    }

    cleanupNonGameStats();
    if (localStorage.getItem('miWebRemovedGamesCleanupV1') !== '1') {
        [
            'estadisticasNumeroAleatorio',
            'estadisticasNumeroAleatorio' + STATS_VERSION,
            'estadisticasCarreraInfinita',
            'estadisticasCarreraInfinita' + STATS_VERSION
        ].forEach(key => localStorage.removeItem(key));
        const extra = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
        delete extra['math-snake'];
        localStorage.setItem(EXTRA_STATS_KEY, JSON.stringify(extra));
        localStorage.setItem('miWebRemovedGamesCleanupV1', '1');
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
        if (!game || DISABLED_STATS_GAMES.has(game)) return null;
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
        if (!game || DISABLED_STATS_GAMES.has(game) || !stats || typeof stats !== 'object') return;
        try {
            await rpc('submit_game_stats', {
                p_game: game,
                p_name: profile().name.slice(0, 20),
                p_stats: stats
            });
            await syncGlobalGame(game, true);
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
        if (DISABLED_STATS_GAMES.has(game)) return Object.create(null);
        const local = readLocalExtra(game);
        const own = local[profile().id];
        initialSync(game, own);
        return globalCache.has(game) ? sanitizeExtra(globalCache.get(game)) : local;
    }

    function writeExtraStats(game, data) {
        if (DISABLED_STATS_GAMES.has(game)) {
            const all = parseObject(localStorage.getItem(EXTRA_STATS_KEY));
            delete all[game];
            localStorage.setItem(EXTRA_STATS_KEY, JSON.stringify(all));
            return;
        }
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
        if (DISABLED_STATS_GAMES.has(game)) return {};
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
        if (document.getElementById('miweb-xp-widget')) renderXpWidget();
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

    function xpRequiredForLevel(level) {
        if (level >= XP_MAX_LEVEL) return 0;
        return 100 + 25 * (level - 1);
    }

    function xpProgressFromTotal(total) {
        total = Math.max(0, Math.min(XP_MAX_TOTAL, Math.floor(Number(total) || 0)));
        let level = 1;
        let remaining = total;
        while (level < XP_MAX_LEVEL) {
            const need = xpRequiredForLevel(level);
            if (remaining < need) break;
            remaining -= need;
            level++;
        }
        return {
            total_xp: total,
            level,
            current_xp: level >= XP_MAX_LEVEL ? 0 : remaining,
            next_xp: level >= XP_MAX_LEVEL ? 0 : xpRequiredForLevel(level),
            max_level: level >= XP_MAX_LEVEL
        };
    }

    function readLocalXp() {
        const saved = parseObject(localStorage.getItem(XP_LOCAL_KEY));
        return xpProgressFromTotal(saved.total_xp || 0);
    }

    function storeXp(progress) {
        if (!progress || typeof progress !== 'object') return;
        const clean = xpProgressFromTotal(progress.total_xp);
        xpCache = {
            ...clean,
            level: Number.isFinite(Number(progress.level)) ? Math.max(1, Math.min(100, Math.floor(Number(progress.level)))) : clean.level,
            current_xp: Number.isFinite(Number(progress.current_xp)) ? Math.max(0, Math.floor(Number(progress.current_xp))) : clean.current_xp,
            next_xp: Number.isFinite(Number(progress.next_xp)) ? Math.max(0, Math.floor(Number(progress.next_xp))) : clean.next_xp,
            max_level: Boolean(progress.max_level ?? clean.max_level)
        };
        localStorage.setItem(XP_LOCAL_KEY, JSON.stringify(xpCache));
        renderXpWidget();
        window.dispatchEvent(new CustomEvent('miweb-xp', { detail: { ...xpCache } }));
    }

    function xpContext() {
        const path = location.pathname.toLowerCase();
        const entries = [
            ['duelo-calculo','game'],['disparador-primos','game'],['secuencia','game'],
            ['2048','game'],['saltos-multiplos','game'],['adivina-el-numero','game'],
            ['pulsa-el-boton','game'],['adivino-tu-numero','game'],
            ['areas','calculator'],['porcentajes','calculator'],['pitagoras','calculator'],
            ['divisibilidad','calculator'],['mcd-mcm','calculator'],['fracciones','calculator'],
            ['estadistica','calculator'],
            ['collatz','experiment'],['criba-eratostenes','experiment'],
            ['factorizacion-prima','experiment'],['triangulo-pascal','experiment'],['fibonacci','experiment']
        ];
        for (const [name, category] of entries) {
            if (path.includes('/' + name + '/')) return { context: name, category };
        }
        if (path.endsWith('/') || path.endsWith('/index.html')) {
            return { context: 'home', category: 'home' };
        }
        return null;
    }

    function localXpPoints(event, contextInfo = xpContext()) {
        if (!contextInfo) return 0;
        const { context, category } = contextInfo;
        if (event === 'page_enter') return category === 'home' ? 1 : category === 'game' ? 3 : 2;
        if (event === 'active_minute') return category === 'game' ? 2 : (category === 'calculator' || category === 'experiment') ? 1 : 0;
        if (event === 'correct' && category === 'game') {
            if (context === 'pulsa-el-boton') return 1;
            if (context === '2048') return 2;
            if (context === 'disparador-primos') return 4;
            if (['duelo-calculo','secuencia','saltos-multiplos'].includes(context)) return 5;
            if (['adivina-el-numero','adivino-tu-numero'].includes(context)) return 8;
            return 4;
        }
        if (event === 'wrong' && category === 'game') return 1;
        if (event === 'game_finish' && category === 'game') return context === 'pulsa-el-boton' ? 6 : context === '2048' ? 10 : 8;
        if (event === 'tool_success' && category === 'calculator') return 4;
        if (event === 'tool_invalid' && category === 'calculator') return 1;
        if (event === 'experiment_run' && category === 'experiment') return 3;
        if (event === 'experiment_invalid' && category === 'experiment') return 1;
        return 0;
    }

    function xpText() {
        const language = ['es','en','hy'].includes(document.documentElement.lang) ? document.documentElement.lang : 'es';
        return {
            es: { level:'Nivel', max:'MÁX', total:'XP total', next:'para el siguiente nivel', gained:'XP', title:'Progreso' },
            en: { level:'Level', max:'MAX', total:'Total XP', next:'to next level', gained:'XP', title:'Progress' },
            hy: { level:'Մակարդակ', max:'MAX', total:'Ընդհանուր XP', next:'հաջորդ մակարդակին', gained:'XP', title:'Առաջընթաց' }
        }[language];
    }

    function ensureXpStyles() {
        if (document.getElementById('miweb-xp-styles')) return;
        const style = document.createElement('style');
        style.id = 'miweb-xp-styles';
        style.textContent = `
            .miweb-xp-widget{position:fixed;right:14px;bottom:14px;z-index:9998;width:min(290px,calc(100vw - 28px));font-family:Arial,sans-serif}
            .miweb-xp-chip{width:100%;border:1px solid #444;background:#1d1d1d;color:#fff;border-radius:14px;padding:10px 12px;box-shadow:0 7px 24px rgba(0,0,0,.28);cursor:pointer;text-align:left}
            .miweb-xp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:800}
            .miweb-xp-small{font-size:12px;color:#aaa;font-weight:600}
            .miweb-xp-bar{height:7px;background:#333;border-radius:99px;overflow:hidden;margin-top:8px}
            .miweb-xp-fill{height:100%;background:linear-gradient(90deg,#ffd84d,#ff9f3d);width:0%;transition:width .25s ease}
            .miweb-xp-detail{display:none;margin-top:7px;padding-top:8px;border-top:1px solid #3a3a3a;color:#bbb;font-size:12px;line-height:1.45}
            .miweb-xp-widget.abierto .miweb-xp-detail{display:block}
            .miweb-xp-toast{position:fixed;right:24px;bottom:104px;z-index:9999;background:#252525;color:#fff;border:1px solid #555;border-radius:999px;padding:8px 12px;font-weight:bold;pointer-events:none;animation:miwebXpToast 1.25s ease forwards}
            @keyframes miwebXpToast{0%{opacity:0;transform:translateY(8px)}15%,70%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-8px)}}
            body.claro .miweb-xp-chip{background:#fff;color:#111;border-color:#d4d4d4;box-shadow:0 7px 24px rgba(0,0,0,.12)}
            body.claro .miweb-xp-small,body.claro .miweb-xp-detail{color:#555}
            body.claro .miweb-xp-bar{background:#e6e6e6}
            body.claro .miweb-xp-detail{border-top-color:#ddd}
            @media(max-width:520px){.miweb-xp-widget{right:9px;bottom:9px;width:min(245px,calc(100vw - 18px))}.miweb-xp-toast{right:16px;bottom:95px}}
            @media(prefers-reduced-motion:reduce){.miweb-xp-fill{transition:none}.miweb-xp-toast{animation:none;opacity:1}}
        `;
        document.head.appendChild(style);
    }

    function ensureXpWidget() {
        ensureXpStyles();
        let widget = document.getElementById('miweb-xp-widget');
        if (widget) return widget;
        widget = document.createElement('div');
        widget.id = 'miweb-xp-widget';
        widget.className = 'miweb-xp-widget';
        widget.innerHTML = `
            <button type="button" class="miweb-xp-chip" aria-expanded="false">
                <div class="miweb-xp-row"><span class="miweb-xp-level">⭐ Nivel 1</span><span class="miweb-xp-small miweb-xp-count">0 / 100 XP</span></div>
                <div class="miweb-xp-bar"><div class="miweb-xp-fill"></div></div>
                <div class="miweb-xp-detail"></div>
            </button>
        `;
        widget.querySelector('.miweb-xp-chip').addEventListener('click', () => {
            const open = widget.classList.toggle('abierto');
            widget.querySelector('.miweb-xp-chip').setAttribute('aria-expanded', String(open));
        });
        document.body.appendChild(widget);
        return widget;
    }

    function renderXpWidget() {
        if (!document.body) return;
        const widget = ensureXpWidget();
        const progress = xpCache || readLocalXp();
        const text = xpText();
        const level = Math.max(1, Math.min(100, progress.level || 1));
        const max = level >= 100 || progress.max_level;
        const pct = max ? 100 : Math.max(0, Math.min(100, (progress.current_xp / Math.max(1, progress.next_xp)) * 100));
        widget.querySelector('.miweb-xp-level').textContent = '⭐ ' + text.level + ' ' + level;
        widget.querySelector('.miweb-xp-count').textContent = max
            ? text.max
            : progress.current_xp + ' / ' + progress.next_xp + ' XP';
        widget.querySelector('.miweb-xp-fill').style.width = pct + '%';
        widget.querySelector('.miweb-xp-detail').textContent = max
            ? text.total + ': ' + progress.total_xp + ' XP · ' + text.level + ' 100 ' + text.max
            : text.total + ': ' + progress.total_xp + ' XP · ' + (progress.next_xp - progress.current_xp) + ' XP ' + text.next;
    }

    function showXpToast(amount, leveledUp = false) {
        if (!amount || !document.body) return;
        const toast = document.createElement('div');
        toast.className = 'miweb-xp-toast';
        toast.textContent = (leveledUp ? '🎉 ' : '⭐ ') + '+' + amount + ' XP';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1350);
    }

    async function refreshXp(force = false) {
        if (xpRefreshPending && !force) return xpRefreshPending;
        xpRefreshPending = (async () => {
            try {
                const rows = await rpc('get_xp_progress', {});
                const row = Array.isArray(rows) ? rows[0] : rows;
                if (row) storeXp(row);
                else storeXp(readLocalXp());
                return xpCache;
            } catch (error) {
                console.warn('XP global no disponible; usando progreso local.', error);
                xpCache = readLocalXp();
                renderXpWidget();
                return xpCache;
            } finally {
                xpRefreshPending = null;
            }
        })();
        return xpRefreshPending;
    }

    async function awardXP(event, contextOverride = null) {
        const info = contextOverride
            ? (typeof contextOverride === 'string' ? { context: contextOverride } : contextOverride)
            : xpContext();
        if (!info || !info.context) return { awarded:0, ...(xpCache || readLocalXp()) };
        const previous = xpCache || readLocalXp();

        try {
            const rows = await rpc('award_xp', {
                p_event: event,
                p_context: info.context,
                p_name: profile().name.slice(0,20)
            });
            const row = Array.isArray(rows) ? rows[0] : rows;
            if (row) {
                storeXp(row);
                const amount = Math.max(0, Math.floor(Number(row.awarded) || 0));
                showXpToast(amount, Number(row.level) > Number(previous.level || 1));
                return row;
            }
        } catch (error) {
            console.warn('No se pudo sincronizar XP; aplicando respaldo local.', error);
            const amount = localXpPoints(event, info.category ? info : xpContext());
            if (amount > 0) {
                const local = xpProgressFromTotal(Math.min(XP_MAX_TOTAL, (previous.total_xp || 0) + amount));
                storeXp(local);
                showXpToast(amount, local.level > (previous.level || 1));
                return { awarded:amount, ...local, offline:true };
            }
        }
        return { awarded:0, ...(xpCache || readLocalXp()) };
    }

    function xpAction(event) {
        return awardXP(event);
    }

    function initXpTracking() {
        const info = xpContext();
        if (!info || !document.body) return;
        ensureXpWidget();
        xpCache = readLocalXp();
        renderXpWidget();
        refreshXp().finally(() => awardXP('page_enter'));

        clearInterval(xpActiveTimer);
        xpActiveTimer = setInterval(() => {
            if (document.visibilityState === 'visible') awardXP('active_minute');
        }, 60000);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') refreshXp();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initXpTracking, { once:true });
    } else {
        queueMicrotask(initXpTracking);
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
        awardXP, xpAction, refreshXp, xpRequiredForLevel, xpProgressFromTotal
    };
})();
