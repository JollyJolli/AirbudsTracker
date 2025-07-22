let musicData = [];
let weeks = [];
let currentWeek = '';

// Cargar datos de la API
async function loadData() {
    try {
        const response = await fetch('https://api.sheetbest.com/sheets/94dfeefa-6315-4fde-9af6-301586e6a922');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        musicData = await response.json();

        if (musicData && musicData.length > 0) {
            processData();
            hideLoading();
            showTab('rankings');
        } else {
            console.warn('[AVISO] No se encontraron datos válidos en la respuesta.');
            showError('No se encontraron datos');
        }
    } catch (error) {
        console.error('[ERROR GRAVE] Fallo al cargar los datos desde la API:', error);
        showError('Error al cargar los datos. Revisa la consola para más detalles.');
    }
}

function processData() {
    // Extraer semanas de los datos
    const firstPerson = musicData[0];
    weeks = Object.keys(firstPerson).filter(key => key.startsWith('S') && key.match(/^S\d+/));
    weeks.sort((a, b) => {
        const numA = parseInt(a.replace('S', ''));
        const numB = parseInt(b.replace('S', ''));
        return numA - numB;
    });

    if (weeks.length > 0) {
        currentWeek = weeks[weeks.length - 1]; // Última semana por defecto
        createWeekSelector();
        updateRankings();
        calculateStreaks();
        createComparison();
    }
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('tabs').classList.remove('hidden');
}

function showError(message) {
    document.getElementById('loading').innerHTML = `
                <div class="no-data">
                    <h2>❌ ${message}</h2>
                    <p>Intenta recargar la página</p>
                </div>
            `;
}

function createWeekSelector() {
    const selector = document.getElementById('week-selector');
    selector.innerHTML = '';

    // Create buttons for desktop
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'week-buttons';
    
    weeks.forEach(week => {
        const btn = document.createElement('button');
        btn.className = `week-btn ${week === currentWeek ? 'active' : ''}`;
        btn.textContent = `Semana ${week.replace('S', '')}`;
        btn.onclick = () => selectWeek(week);
        buttonContainer.appendChild(btn);
    });

    // Create dropdown for mobile
    const dropdown = document.createElement('select');
    dropdown.className = 'week-dropdown';
    
    weeks.forEach(week => {
        const option = document.createElement('option');
        option.value = week;
        option.selected = week === currentWeek;
        option.textContent = `Semana ${week.replace('S', '')}`;
        dropdown.appendChild(option);
    });
    
    dropdown.onchange = (e) => selectWeek(e.target.value);

    selector.appendChild(buttonContainer);
    selector.appendChild(dropdown);
}

function selectWeek(week) {
    currentWeek = week;
    document.querySelectorAll('.week-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === `Semana ${week.replace('S', '')}`);
    });
    updateRankings();
}

function updateRankings() {
    const weekData = musicData.map(person => ({
        name: person.Persona,
        minutes: parseInt(person[currentWeek]) || 0,
        description: person.Descripcion || '',
        qualities: person.Cualidades || '',
        originalData: person
    })).sort((a, b) => b.minutes - a.minutes);

    updatePodium(weekData);
    updateTable(weekData);
}

function updatePodium(data) {
    const podium = document.getElementById('podium');
    podium.innerHTML = '';

    const positions = ['first', 'second', 'third'];
    const positionNumbers = [1, 2, 3];

    for (let i = 0; i < Math.min(3, data.length); i++) {
        const person = data[i];
        const imgUrl = `/data/imgs/${person.originalData.foto}`;
        if (!person) continue;

        const place = document.createElement('div');
        place.className = `podium-place`;

        const timeFormatted = formatTime(person.minutes);
        const emoji = person.minutes === 0 ? '⚰️' : i === 0 ? '👑' : i === 1 ? '🥈' : '🥉';

        place.innerHTML = `
    <img src="${imgUrl}" alt="${person.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;">
    <div class="podium-base ${positions[i]}">
        <div class="podium-position">${positionNumbers[i]}</div>
        <div class="podium-name">${emoji} ${person.name}</div>
        <div class="podium-minutes">${person.minutes.toLocaleString()} min</div>
        <div class="podium-minutes">${timeFormatted}</div>
    </div>
`;


        podium.appendChild(place);
    }
}

function updateTable(data) {
    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = '';

    data.forEach((person, index) => {
        const imgUrl = `/data/imgs/${person.originalData.foto}`;
        const row = document.createElement('tr');
        const timeFormatted = formatTime(person.minutes);
        let status = '';

        if (person.minutes === 0) {
            status = '🪦 Semana sin ritmo';
        } else if (person.minutes <= 15) {
            status = '😶 Silencio sospechoso';
        } else if (person.minutes <= 30) {
            status = '📵 Oyó una intro y apagó';
        } else if (person.minutes <= 60) {
            status = '🤨 Escuchó pa’ no quedar mal';
        } else if (person.minutes <= 120) {
            status = '📻 Una rolita al día';
        } else if (person.minutes <= 200) {
            status = '📼 Rewind mental';
        } else if (person.minutes <= 300) {
            status = '🎶 Música pa’ matar el rato';
        } else if (person.minutes <= 450) {
            status = '🎙️ Cantó bajito en el baño';
        } else if (person.minutes <= 600) {
            status = '🛸 Música mientras flota';
        } else if (person.minutes <= 800) {
            status = '🎧 Ritmo constante';
        } else if (person.minutes <= 1000) {
            status = '🛹 Música de fondo pa’ la movie';
        } else if (person.minutes <= 1200) {
            status = '🔊 Casi no le baja al volumen';
        } else if (person.minutes <= 1500) {
            status = '🔥 Siempre con audífonos';
        } else if (person.minutes <= 1800) {
            status = '🥵 Se le queman los AirPods';
        } else if (person.minutes <= 2200) {
            status = '🎵 En su propia película';
        } else if (person.minutes <= 2700) {
            status = '📀 Playlist pa’ cada mood';
        } else if (person.minutes <= 3200) {
            status = '🌀 Vibra musical intensa';
        } else if (person.minutes <= 4000) {
            status = '🚀 Vive enchufado al beat';
        } else if (person.minutes <= 5000) {
            status = '🧠 Mente musical 24/7';
        } else if (person.minutes <= 6000) {
            status = '👁️ El algoritmo lo respeta';
        } else if (person.minutes <= 7000) {
            status = '🕺 En la pista aunque esté solo';
        } else if (person.minutes <= 8000) {
            status = '💀 Viste el Spotify morir';
        } else if (person.minutes <= 10000) {
            status = '💽 Le metió como si cobrara';
        } else {
            status = '👑 DIOS DEL STREAMING';
        }


        row.innerHTML = `
            <td class="position">#${index + 1}</td>
            <td>
                <img src="${imgUrl}" alt="${person.name}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 10px;">
                <span class="person-name" onclick="openPersonModal('${person.name}')">${person.name}</span>
            </td>
            <td>${person.minutes.toLocaleString()} minutos</td>
            <td>${timeFormatted}</td>
            <td>${status}</td>
        `;

        tbody.appendChild(row);
    });
}


function formatTime(minutes) {
    if (minutes === 0) return "0 tiempo";

    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);

    return parts.join(' ');
}

function calculateStreaks() {
    let currentStreakPerson = '';
    let currentStreakCount = 0;
    let bestStreakPerson = '';
    let bestStreakCount = 0;
    let bestStreakWeeks = [];

    // Calcular streak actual (desde la última semana hacia atrás)
    let lastWinner = '';
    for (let i = weeks.length - 1; i >= 0; i--) {
        const week = weeks[i];
        const weekData = musicData.map(person => ({
            name: person.Persona,
            minutes: parseInt(person[week]) || 0
        })).sort((a, b) => b.minutes - a.minutes);

        const winner = weekData[0]?.name;
        if (i === weeks.length - 1) {
            lastWinner = winner;
            currentStreakPerson = winner;
            currentStreakCount = 1;
        } else {
            if (winner === lastWinner) {
                currentStreakCount++;
            } else {
                break;
            }
        }
    }

    // Calcular mejor streak histórico
    const streaks = {};
    for (const person of musicData) {
        let maxStreak = 0;
        let currentPersonStreak = 0;
        let streakWeeks = [];
        let tempWeeks = [];

        for (const week of weeks) {
            const weekData = musicData.map(p => ({
                name: p.Persona,
                minutes: parseInt(p[week]) || 0
            })).sort((a, b) => b.minutes - a.minutes);

            const winner = weekData[0]?.name;
            if (winner === person.Persona) {
                currentPersonStreak++;
                tempWeeks.push(week);
            } else {
                if (currentPersonStreak > maxStreak) {
                    maxStreak = currentPersonStreak;
                    streakWeeks = [...tempWeeks];
                }
                currentPersonStreak = 0;
                tempWeeks = [];
            }
        }

        // Verificar el último streak
        if (currentPersonStreak > maxStreak) {
            maxStreak = currentPersonStreak;
            streakWeeks = [...tempWeeks];
        }

        if (maxStreak > bestStreakCount) {
            bestStreakCount = maxStreak;
            bestStreakPerson = person.Persona;
            bestStreakWeeks = streakWeeks;
        }
    }

    // Actualizar UI
    document.getElementById('current-streak-value').textContent = currentStreakCount;
    document.getElementById('current-streak-person').textContent = currentStreakPerson;
    document.getElementById('current-streak-weeks').textContent =
        currentStreakCount > 1 ? `${currentStreakCount} semanas consecutivas` : '1 semana';

    document.getElementById('best-streak-value').textContent = bestStreakCount;
    document.getElementById('best-streak-person').textContent = bestStreakPerson;
    document.getElementById('best-streak-weeks').textContent =
        bestStreakWeeks.length > 0 ? `Semanas: ${bestStreakWeeks.map(w => w.replace('S', '')).join(', ')}` : '';
}

function createComparison() {
    const grid = document.getElementById('comparison-grid');
    grid.innerHTML = '';

    // Calculate streaks for each person
    musicData.forEach(person => {
        // Calculate streaks (current and max)
        let currentStreak = 0;
        let maxStreak = 0;
        let consecutiveWins = 0;

        // Calculate current streak (from most recent week backwards)
        for (let i = weeks.length - 1; i >= 0; i--) {
            const week = weeks[i];
            const weekWinner = musicData.reduce((winner, p) => {
                const minutes = parseInt(p[week]) || 0;
                const winnerMinutes = parseInt(winner[week]) || 0;
                return minutes > winnerMinutes ? p : winner;
            });

            if (weekWinner.Persona === person.Persona) {
                consecutiveWins++;
                if (i === weeks.length - 1) { // If it's the most recent week, update current streak
                    currentStreak = consecutiveWins;
                }
            } else {
                if (i === weeks.length - 1) {
                    currentStreak = 0;
                }
                consecutiveWins = 0;
            }
            maxStreak = Math.max(maxStreak, consecutiveWins);
        }

        person.currentStreak = currentStreak;
        person.maxStreak = maxStreak;
    });

    // Grid setup

    musicData.forEach(person => {
        const totalMinutes = weeks.reduce((sum, week) => {
            return sum + (parseInt(person[week]) || 0);
        }, 0);

        const avgMinutes = Math.round(totalMinutes / weeks.length);
        const maxWeek = weeks.reduce((max, week) => {
            const minutes = parseInt(person[week]) || 0;
            return minutes > (parseInt(person[max]) || 0) ? week : max;
        }, weeks[0]);

        const maxMinutes = parseInt(person[maxWeek]) || 0;
        const allMinutes = weeks.map(week => parseInt(person[week]) || 0);

        // Calcular medallas
        const medals = [];
        let victories = 0;

        weeks.forEach(week => {
            const weekData = musicData.map(p => ({
                name: p.Persona,
                minutes: parseInt(p[week]) || 0
            })).sort((a, b) => b.minutes - a.minutes);

            if (weekData[0]?.name === person.Persona) victories++;
        });

        const globalAvg = musicData.reduce((sum, p) => {
            const t = weeks.reduce((s, w) => s + (parseInt(p[w]) || 0), 0);
            return sum + t;
        }, 0) / musicData.length;

        const isConsistent = allMinutes.every(min => min >= 300);
        const isIron = allMinutes.every(min => min >= 100);
        const hasZeroWeeks = allMinutes.some(min => min === 0);
        const isSleepy = allMinutes.filter(min => min < 100).length >= 2;
        const isVolatile = Math.max(...allMinutes) - Math.min(...allMinutes) > 2000;
        const isBalanced = avgMinutes >= 300 && avgMinutes <= 700;
        const isLegend = totalMinutes > 12000;

        if (victories >= 3) medals.push('<span class="medal gold">🏆 Campeón</span>');
        if (victories >= 1) medals.push('<span class="medal silver">🥇 Ganador</span>');
        if (totalMinutes > globalAvg) medals.push('<span class="medal bronze">📈 Superaverage</span>');
        if (maxMinutes > 5000) medals.push('<span class="medal streak">🔥 Maratón</span>');
        if (isConsistent) medals.push('<span class="medal">📆 Consistente</span>');
        if (isIron) medals.push('<span class="medal">🧱 Hierro</span>');
        if (isVolatile) medals.push('<span class="medal">🎲 Volátil</span>');
        if (isBalanced) medals.push('<span class="medal">🧠 Intelectual</span>');
        if (isSleepy) medals.push('<span class="medal">💤 Dormido</span>');
        if (hasZeroWeeks) medals.push('<span class="medal">👻 Fantasma</span>');
        if (isLegend) medals.push('<span class="medal legend">👑 Leyenda</span>');

        const card = document.createElement('div');
        card.className = 'person-card';
        card.onclick = () => openPersonModal(person.Persona);

       card.innerHTML = `
            <div class="person-card-img">
                <img src="/data/imgs/${person.foto}" alt="${person.Persona}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;">
            </div>

            <div class="person-card-name">${person.Persona}</div>

            <div style="font-size: 14px; color: #555;">${person.Descripcion || '🫥 Sin descripción aún'}</div>
            <div style="font-size: 13px; color: #777;">${person.Cualidades || '🌀 No se definió'}</div>

            <hr style="margin: 10px 0; border-color: #eee;">

            <div><strong>🕒 Total:</strong> ${totalMinutes.toLocaleString()} min</div>
            <div><strong>📈 Promedio:</strong> ${avgMinutes.toLocaleString()} min/semana</div>
            <div><strong>💥 Mejor semana:</strong> ${maxMinutes.toLocaleString()} min</div>
            <div><strong>🥇 Victorias:</strong> ${victories}</div>
            <div><strong>🔥 Racha actual:</strong> ${person.currentStreak || 0} ${person.currentStreak === 1 ? 'semana' : 'semanas'}</div>
            <div><strong>🏅 Racha máxima:</strong> ${person.maxStreak || 0} ${person.maxStreak === 1 ? 'semana' : 'semanas'}</div>

            <hr style="margin: 10px 0; border-color: #eee;">

            <div><strong>🎯 Nivel:</strong> ${status}</div>

            <div style="margin-top: 15px;">
                ${medals.join(' ')}
            </div>
        `;


        grid.appendChild(card);
    });
}


function openPersonModal(personName) {
    const person = musicData.find(p => p.Persona === personName);
    if (!person) return;

    const modal = document.getElementById('personModal');

    // Header
    document.getElementById('modal-person-name').textContent = personName;
    document.getElementById('modal-person-description').textContent = person.Descripcion || '';
    document.getElementById('modal-person-qualities').textContent = person.Cualidades || '';

    // Estadísticas
    const totalMinutes = weeks.reduce((sum, week) => sum + (parseInt(person[week]) || 0), 0);
    const avgMinutes = Math.round(totalMinutes / weeks.length);
    const maxWeek = weeks.reduce((max, week) => {
        const minutes = parseInt(person[week]) || 0;
        return minutes > (parseInt(person[max]) || 0) ? week : max;
    }, weeks[0]);
    const maxMinutes = parseInt(person[maxWeek]) || 0;

    // Calcular streak personal
    let personalBestStreak = 0;
    let currentPersonalStreak = 0;

    weeks.forEach(week => {
        const weekData = musicData.map(p => ({
            name: p.Persona,
            minutes: parseInt(p[week]) || 0
        })).sort((a, b) => b.minutes - a.minutes);

        if (weekData[0]?.name === personName) {
            currentPersonalStreak++;
            personalBestStreak = Math.max(personalBestStreak, currentPersonalStreak);
        } else {
            currentPersonalStreak = 0;
        }
    });

    const statsContainer = document.getElementById('modal-stats');
    statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${totalMinutes.toLocaleString()}</div>
                    <div class="stat-label">Total Minutos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgMinutes.toLocaleString()}</div>
                    <div class="stat-label">Promedio Semanal</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${maxMinutes.toLocaleString()}</div>
                    <div class="stat-label">Mejor Semana</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${personalBestStreak}</div>
                    <div class="stat-label">Mejor Streak</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatTime(maxMinutes)}</div>
                    <div class="stat-label">Tiempo Máximo</div>
                </div>
            `;

    // Crear gráfico
    createPersonChart(person);

    modal.style.display = 'block';
}

function createPersonChart(person) {
    const chartContainer = document.getElementById('modal-chart');
    chartContainer.innerHTML = '';

    const weeklyData = weeks.map(week => ({
        week: week,
        minutes: parseInt(person[week]) || 0
    }));

    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 1);

    weeklyData.forEach(data => {
        const bar = document.createElement('div');
        const height = Math.max((data.minutes / maxMinutes) * 150, 2);

        bar.className = 'bar';
        bar.style.height = `${height}px`;
        bar.innerHTML = `
                    <div class="bar-value">${data.minutes.toLocaleString()}</div>
                    <div class="bar-label">S${data.week.replace('S', '')}</div>
                `;

        chartContainer.appendChild(bar);
    });
}

function closeModal() {
    document.getElementById('personModal').style.display = 'none';
}

function showTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.content').forEach(content => {
        content.classList.add('hidden');
    });

    // Mostrar el contenido seleccionado
    document.getElementById(tabName + '-content').classList.remove('hidden');

    // Actualizar tabs activos
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Event listeners
window.onclick = function(event) {
    const modal = document.getElementById('personModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Nuevas funciones para estadísticas avanzadas
function updateStats() {
    const globalStats = document.getElementById('global-stats');
    const timeDistribution = document.getElementById('time-distribution');
    const weeklyEvolution = document.getElementById('weekly-evolution');
    const activityHeatmap = document.getElementById('activity-heatmap');

    // Estadísticas globales
    const totalListeningTime = musicData.reduce((total, person) => {
        return total + weeks.reduce((sum, week) => sum + (parseInt(person[week]) || 0), 0);
    }, 0);

    const avgWeeklyTime = Math.round(totalListeningTime / (weeks.length * musicData.length));
    const maxWeeklyTime = Math.max(...musicData.flatMap(person => 
        weeks.map(week => parseInt(person[week]) || 0)
    ));

    globalStats.innerHTML = `
        <div class="global-stat-card">
            <h3>⏱️ Tiempo Total de Escucha</h3>
            <div class="big-number">${formatTime(totalListeningTime)}</div>
            <div class="sub-text">Entre todos los participantes</div>
        </div>
        <div class="global-stat-card">
            <h3>📊 Promedio Semanal</h3>
            <div class="big-number">${formatTime(avgWeeklyTime)}</div>
            <div class="sub-text">Por persona</div>
        </div>
        <div class="global-stat-card">
            <h3>🏆 Mejor Semana</h3>
            <div class="big-number">${formatTime(maxWeeklyTime)}</div>
            <div class="sub-text">Récord individual</div>
        </div>
    `;

    // Distribución de tiempo por rango
    const timeRanges = [
        { min: 0, max: 60, label: '😴 0-1h' },
        { min: 60, max: 300, label: '🌱 1-5h' },
        { min: 300, max: 600, label: '🎵 5-10h' },
        { min: 600, max: 1200, label: '🎧 10-20h' },
        { min: 1200, max: 2400, label: '🔥 20-40h' },
        { min: 2400, max: Infinity, label: '🚀 40h+' }
    ];

    const distribution = timeRanges.map(range => {
        const count = musicData.reduce((total, person) => {
            return total + weeks.filter(week => {
                const minutes = parseInt(person[week]) || 0;
                return minutes > range.min && minutes <= range.max;
            }).length;
        }, 0);
        return { ...range, count };
    });

    timeDistribution.innerHTML = `
        <h3>Distribución de Tiempo de Escucha</h3>
        <div class="distribution-bars">
            ${distribution.map(d => `
                <div class="dist-bar-container">
                    <div class="dist-bar" style="height: ${(d.count / (weeks.length * musicData.length)) * 200}px;">
                        <div class="dist-count">${d.count}</div>
                    </div>
                    <div class="dist-label">${d.label}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Logros y medallas especiales
    updateAchievements();
}

function updateAchievements() {
    const achievements = [
        {
            id: 'consistency',
            title: '🎯 Consistencia Perfecta',
            description: 'Escuchar música todos los días de la semana',
            check: (person) => weeks.every(week => parseInt(person[week]) > 0)
        },
        {
            id: 'marathon',
            title: '🏃‍♂️ Maratonista Musical',
            description: 'Más de 40 horas de música en una semana',
            check: (person) => weeks.some(week => parseInt(person[week]) > 2400)
        },
        {
            id: 'improvement',
            title: '📈 Mejora Constante',
            description: 'Aumentar el tiempo de escucha 3 semanas seguidas',
            check: (person) => {
                let improvements = 0;
                for(let i = 1; i < weeks.length; i++) {
                    if(parseInt(person[weeks[i]]) > parseInt(person[weeks[i-1]])) {
                        improvements++;
                        if(improvements >= 3) return true;
                    } else {
                        improvements = 0;
                    }
                }
                return false;
            }
        },
        {
            id: 'dedication',
            title: '💪 Dedicación Total',
            description: 'Más de 100 horas acumuladas',
            check: (person) => weeks.reduce((sum, week) => sum + (parseInt(person[week]) || 0), 0) > 6000
        },
        {
            id: 'champion',
            title: '👑 Campeón Indiscutible',
            description: 'Ganar 3 semanas consecutivas',
            check: (person) => person.maxStreak >= 3
        },
        {
                id: 'earlybird',
                title: '🌅 Madrugador Musical',
                description: 'Escuchó música en la primera semana registrada',
                check: (person) => parseInt(person[weeks[0]]) > 0
            },
            {
                id: 'comeback',
                title: '🔁 El Regreso',
                description: 'Tuvo una semana de 0 minutos y volvió con +1000 minutos',
                check: (person) => {
                    for (let i = 1; i < weeks.length; i++) {
                        if (parseInt(person[weeks[i - 1]]) === 0 && parseInt(person[weeks[i]]) > 1000) {
                            return true;
                        }
                    }
                    return false;
                }
            },
            {
                id: 'burnout',
                title: '🔥 Quemao del Sistema',
                description: 'Escuchó más de 3000 minutos una semana y 0 la siguiente',
                check: (person) => {
                    for (let i = 1; i < weeks.length; i++) {
                        if (parseInt(person[weeks[i - 1]]) > 3000 && parseInt(person[weeks[i]]) === 0) {
                            return true;
                        }
                    }
                    return false;
                }
            },
            {
                id: 'peaktime',
                title: '📊 Pico de Locura',
                description: 'Tuvo una semana con más de 5000 minutos',
                check: (person) => weeks.some(week => parseInt(person[week]) > 5000)
            },
            {
                id: 'rollercoaster',
                title: '🎢 Montaña Rusa',
                description: 'Subidas y bajadas extremas durante 4 semanas seguidas',
                check: (person) => {
                    let swings = 0;
                    for (let i = 2; i < weeks.length; i++) {
                        const a = parseInt(person[weeks[i - 2]]);
                        const b = parseInt(person[weeks[i - 1]]);
                        const c = parseInt(person[weeks[i]]);
                        if ((a < b && b > c) || (a > b && b < c)) {
                            swings++;
                            if (swings >= 2) return true;
                        }
                    }
                    return false;
                }
            },
            {
                id: 'lazyweek',
                title: '😴 Semana de Vago',
                description: 'Menos de 30 minutos en una semana',
                check: (person) => weeks.some(week => parseInt(person[week]) > 0 && parseInt(person[week]) < 30)
            },
            {
                id: 'resilient',
                title: '🧠 Mente Fuerte',
                description: 'Tuvo una baja grande y logró reponerse con más de 2000 minutos',
                check: (person) => {
                    for (let i = 1; i < weeks.length; i++) {
                        const before = parseInt(person[weeks[i - 1]]);
                        const now = parseInt(person[weeks[i]]);
                        if (before < 300 && now > 2000) return true;
                    }
                    return false;
                }
            },
            {
                id: 'vacation',
                title: '🏖️ Vacaciones Musicales',
                description: 'Dos semanas seguidas sin escuchar música',
                check: (person) => {
                    for (let i = 1; i < weeks.length; i++) {
                        if (parseInt(person[weeks[i - 1]]) === 0 && parseInt(person[weeks[i]]) === 0) return true;
                    }
                    return false;
                }
            },
            {
                id: 'machine',
                title: '🤖 Máquina de Escuchar',
                description: 'Más de 10,000 minutos acumulados',
                check: (person) => weeks.reduce((acc, w) => acc + (parseInt(person[w]) || 0), 0) > 10000
            },
            {
                id: 'bounceback',
                title: '💥 Rebotador',
                description: 'Alternó entre más de 2000 y menos de 500 minutos varias veces',
                check: (person) => {
                    let count = 0;
                    for (let i = 1; i < weeks.length; i++) {
                        const prev = parseInt(person[weeks[i - 1]]);
                        const curr = parseInt(person[weeks[i]]);
                        if ((prev > 2000 && curr < 500) || (prev < 500 && curr > 2000)) {
                            count++;
                            if (count >= 2) return true;
                        }
                    }
                    return false;
                }
            },
            {
                id: 'balanced',
                title: '⚖️ Equilibrio Perfecto',
                description: 'Mantener entre 5-10 horas por semana durante 4 semanas',
                check: (person) => {
                    let balancedWeeks = 0;
                    for(let week of weeks) {
                        const minutes = parseInt(person[week]);
                        if(minutes >= 300 && minutes <= 600) {
                            balancedWeeks++;
                            if(balancedWeeks >= 4) return true;
                        } else {
                            balancedWeeks = 0;
                        }
                    }
                    return false;
                }
            }
    ];

    const achievementsGrid = document.getElementById('achievements-grid');
    achievementsGrid.innerHTML = '';

    musicData.forEach(person => {
        const personAchievements = achievements.filter(a => a.check(person));
        
        if(personAchievements.length > 0) {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            card.innerHTML = `
                <div class="achievement-header">
                    <img src="/data/imgs/${person.foto}" alt="${person.Persona}">
                    <h3>${person.Persona}</h3>
                </div>
                <div class="achievements-list">
                    ${personAchievements.map(a => `
                        <div class="achievement">
                            <div class="achievement-title">${a.title}</div>
                            <div class="achievement-desc">${a.description}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            achievementsGrid.appendChild(card);
        }
    });
}

// Modificamos processData para incluir las nuevas funciones
function processData() {
    // Extraer semanas de los datos
    const firstPerson = musicData[0];
    weeks = Object.keys(firstPerson).filter(key => key.startsWith('S') && key.match(/^S\d+/));
    weeks.sort((a, b) => {
        const numA = parseInt(a.replace('S', ''));
        const numB = parseInt(b.replace('S', ''));
        return numA - numB;
    });

    if (weeks.length > 0) {
        currentWeek = weeks[weeks.length - 1]; // Última semana por defecto
        createWeekSelector();
        updateRankings();
        calculateStreaks();
        createComparison();
        updateStats(); // Añadimos la nueva función
    }
}

// Cargar datos al iniciar
loadData();
