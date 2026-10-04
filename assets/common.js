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

    function validIntegerRange(first, second) {
        return [first, second].every(value => typeof value === 'string' &&
            value.trim() !== '' && Number.isSafeInteger(Number(value)) &&
            Math.abs(Number(value)) <= 1000000000);
    }

    return { profile, rename, readStats, writeStats, playerName, applyLanguage, validIntegerRange };
})();
