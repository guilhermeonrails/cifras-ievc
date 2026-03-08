// --- 1. CONFIGURAÇÃO DE DADOS E ESTADO ---

// Escalas cromáticas para transposição. Usaremos 'SHARP' como base de mapeamento.
const NOTES = {
    SHARP: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    FLAT: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};

// Estado Global
let currentSongId = null;
let transposeOffset = 0; // 0 significa tom original
let isTwoColumns = false;
let currentFontSize = 1.1; // Tamanho inicial em rem
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let favoriteSettings = JSON.parse(localStorage.getItem('favoriteSettings') || '{}');
let showFavoritesOnly = false;
let currentSearchTerm = '';
let viewMode = 'text'; // 'text' or 'image'
let currentChartIndex = 0;

const MIN_FONT_SIZE = 0.8;
const MAX_FONT_SIZE = 3.0;
const FONT_STEP = 0.1;

let listFilterMode = 'charts'; // 'charts' (default) or 'cifras'

function setListFilterMode(mode) {
    listFilterMode = mode;
    renderSongList();
    updateFilterButtons();
}

function updateFilterButtons() {
    const btnCharts = document.getElementById('filter-btn-charts');
    const btnCifras = document.getElementById('filter-btn-cifras');

    if (btnCharts && btnCifras) {
        if (listFilterMode === 'charts') {
            btnCharts.classList.add('bg-teal-600', 'text-white');
            btnCharts.classList.remove('bg-gray-700', 'text-gray-300');
            btnCifras.classList.remove('bg-teal-600', 'text-white');
            btnCifras.classList.add('bg-gray-700', 'text-gray-300');
        } else {
            btnCharts.classList.remove('bg-teal-600', 'text-white');
            btnCharts.classList.add('bg-gray-700', 'text-gray-300');
            btnCifras.classList.add('bg-teal-600', 'text-white');
            btnCifras.classList.remove('bg-gray-700', 'text-gray-300');
        }
    }
}


// --- 2. LÓGICA DE TRANSPOSIÇÃO E RENDERING ---

/**
 * Encontra o novo acorde após a transposição.
 * @param {string} chord O acorde original (ex: "G#m7/C")
 * @param {number} offset O número de semitons para transpor (+up, -down).
 * @returns {string} O novo acorde.
 */
function getTransposedChord(chord, offset) {
    const CHORD_REGEX = /([A-G][b#]?)(.*)/;
    const match = chord.match(CHORD_REGEX);

    if (!match) {
        return chord; // Retorna o que não é acorde inalterado
    }

    const rootNote = match[1];
    const suffix = match[2];

    const normalizedRoot = normalizeNote(rootNote);

    let rootIndex = NOTES.SHARP.indexOf(normalizedRoot);
    if (rootIndex === -1) {
        return chord;
    }

    let newIndex = (rootIndex + offset) % 12;
    if (newIndex < 0) {
        newIndex += 12; // Garante que o índice seja positivo
    }

    const newRoot = NOTES.SHARP[newIndex];
    return newRoot + suffix;
}

function normalizeNote(note) {
    const flatMap = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#',
        'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E'
    };

    return flatMap[note] || note;
}

function renderChordSheet(rawText) {
    if (!rawText) return '';

    const chordPattern = /\[([^\]]+)\]/g;

    const htmlContent = rawText.trim().split('\n').map(line => {
        if (line.trim() === '') {
            return '<br>'; // Linha vazia
        }

        const processedLine = line.replace(chordPattern, (match, chord) => {
            const transposedChord = getTransposedChord(chord.trim(), transposeOffset);
            return `<span class="chord">${transposedChord}</span>`;
        });

        return `<p class="leading-relaxed mb-1">${processedLine}</p>`;
    }).join('');

    return htmlContent;
}

// --- 3. CONTROLES DE INTERFACE (UI) ---

function transpose(direction) {
    if (viewMode === 'image') {
        const song = SONGS.find(s => s.id === currentSongId);
        if (song && song.charts && song.charts.length > 0) {
            currentChartIndex += direction;
            // Wrap around logic
            if (currentChartIndex >= song.charts.length) currentChartIndex = 0;
            if (currentChartIndex < 0) currentChartIndex = song.charts.length - 1;

            // Persist setting if favorited
            if (favorites.includes(currentSongId)) {
                favoriteSettings[currentSongId] = { chartIndex: currentChartIndex };
                localStorage.setItem('favoriteSettings', JSON.stringify(favoriteSettings));
            }
        }
    } else {
        transposeOffset += direction;
        transposeOffset = (transposeOffset % 12 + 12) % 12;
    }
    updateDisplay();
}

function toggleColumns() {
    const display = document.getElementById('cifra-display');
    const button = document.getElementById('columns-toggle');

    // Define o estado atual com base nas classes aplicadas
    if (display.classList.contains('columns-1')) {
        display.classList.remove('columns-1');
        display.classList.add('columns-2');
        button.textContent = '2 Colunas';
    } else if (display.classList.contains('columns-2')) {
        display.classList.remove('columns-2');
        display.classList.add('columns-3');
        button.textContent = '3 Colunas';
    } else {
        display.classList.remove('columns-3');
        display.classList.add('columns-1');
        button.textContent = '1 Coluna';
    }
}

function changeFontSize(direction) {
    let newSize = currentFontSize + direction * FONT_STEP;
    newSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
    currentFontSize = newSize;
    document.documentElement.style.setProperty('--cifra-font-size', `${currentFontSize.toFixed(1)}rem`);
}

function toggleViewMode(mode) {
    viewMode = mode;
    updateDisplay();
}

function loadSong(songId) {
    currentSongId = songId;
    transposeOffset = 0;
    currentChartIndex = 0;
    currentFontSize = 1.1;

    // Restore chart index if favorited and saved
    if (favorites.includes(songId) && favoriteSettings[songId]) {
        if (typeof favoriteSettings[songId].chartIndex === 'number') {
            currentChartIndex = favoriteSettings[songId].chartIndex;
        }
    }

    const song = SONGS.find(s => s.id === songId);
    if (song && (song.chart_image || (song.charts && song.charts.length > 0))) {
        viewMode = 'image';
    } else {
        viewMode = 'text';
    }

    document.documentElement.style.setProperty('--cifra-font-size', '1.1rem');

    document.querySelectorAll('#song-list li').forEach(li => {
        li.classList.remove('bg-teal-700', 'font-bold');
        // Mantém a cor de fundo base se não for selecionado, mas remove o destaque
        if (li.id !== `song-item-${songId}`) {
            // Reset classes handled by render
        }
    });

    // Re-render list to update selection state visually if needed,
    // but simpler to just toggle class on the element
    renderSongList();
    updateDisplay();

    // NEW: On mobile, automatically show the viewer when a song is selected
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const cifraViewer = document.getElementById('cifra-viewer');
        const scrollButton = document.getElementById('auto-scroll-button');

        if (sidebar && !sidebar.classList.contains('hidden')) {
            sidebar.classList.add('hidden');
            if (cifraViewer) cifraViewer.classList.remove('hidden');
            // scroll button visibility is handled by updateDisplay based on song properties
        }
    }
}

function updateDisplay() {
    const song = SONGS.find(s => s.id === currentSongId);
    const titleElement = document.getElementById('cifra-title');
    const displayElement = document.getElementById('cifra-display');
    const chartDisplay = document.getElementById('chart-display');
    const chartImage = document.getElementById('chart-image');
    const viewToggle = document.getElementById('view-toggle');
    const btnText = document.getElementById('view-btn-text');
    const btnImage = document.getElementById('view-btn-image');

    // const keyDisplay = document.getElementById('current-key-display');

    const originalRoot = 'tom';
    let rootIndex = NOTES.SHARP.indexOf(originalRoot);
    let newIndex = (rootIndex + transposeOffset) % 12;
    if (newIndex < 0) newIndex += 12;
    const currentKey = NOTES.SHARP[newIndex];

    // keyDisplay.textContent = currentKey;

    if (song) {
        titleElement.textContent = song.title;
        titleElement.classList.remove('mt-10');

        // Determine content availability
        const hasText = song.chord_text && song.chord_text.trim().length > 0;
        const hasChart = !!(song.chart_image || (song.charts && song.charts.length > 0));

        // Handle View Toggle Visibility
        // Show toggle ONLY if BOTH text and chart are available
        if (hasText && hasChart) {
            viewToggle.classList.remove('hidden');
            viewToggle.classList.add('flex');
        } else {
            viewToggle.classList.add('hidden');
            viewToggle.classList.remove('flex');

            // Force view mode based on availability if toggle is hidden
            // Note: loadSong already attempts to set viewMode, but we reinforce it here
            // actually, we don't need to force viewMode here because the rendering logic
            // below handles what to show. 
            // BUT, if viewMode is 'text' and we only have chart, we should ensure chart is shown.
            // loadSong logic currently defaults to 'image' if chart exists. 
            // If Text exists and Chart doesn't, it defaults to 'text'.
            // If Both exist, it defaults to 'image'. 
            // If Only Chart exists, it defaults to 'image'.
            // So logic in loadSong seems consistent with what we want to display.
        }

        // Handle View Mode Rendering
        if (viewMode === 'image' && (song.chart_image || (song.charts && song.charts.length > 0))) {
            displayElement.classList.add('hidden');
            chartDisplay.classList.remove('hidden');

            // Prioritize charts array if available, fallback to chart_image
            if (song.charts && song.charts.length > 0) {
                // Ensure index is valid
                if (currentChartIndex >= song.charts.length || currentChartIndex < 0) currentChartIndex = 0;
                chartImage.src = song.charts[currentChartIndex].image;
                // Optional: Update key display if we had one for charts
            } else {
                chartImage.src = song.chart_image;
            }


            // Update Buttons
            btnText.classList.remove('bg-indigo-600', 'text-white');
            btnText.classList.add('bg-gray-300', 'text-gray-700');
            btnImage.classList.add('bg-indigo-600', 'text-white');
            btnImage.classList.remove('bg-gray-300', 'text-gray-700');

            // Hide columns toggle
            const columnsToggle = document.getElementById('columns-toggle');
            if (columnsToggle) columnsToggle.classList.add('hidden');

            // Hide font controls
            const fontControls = document.getElementById('font-controls');
            if (fontControls) fontControls.classList.add('hidden');

            // Handle Tone Controls Visibility for Charts
            const toneControls = document.getElementById('tone-controls');
            if (toneControls) {
                if (song.charts && song.charts.length > 1) {
                    toneControls.classList.remove('hidden');
                    toneControls.classList.add('flex');
                } else {
                    toneControls.classList.add('hidden');
                    toneControls.classList.remove('flex');
                }
            }

        } else {
            displayElement.classList.remove('hidden');
            chartDisplay.classList.add('hidden');
            displayElement.innerHTML = renderChordSheet(song.chord_text);

            // Update Buttons
            btnText.classList.add('bg-indigo-600', 'text-white');
            btnText.classList.remove('bg-gray-300', 'text-gray-700');
            btnImage.classList.remove('bg-indigo-600', 'text-white');
            btnImage.classList.add('bg-gray-300', 'text-gray-700');

            // Show columns toggle
            const columnsToggle = document.getElementById('columns-toggle');
            if (columnsToggle) columnsToggle.classList.remove('hidden');

            // Show font controls
            const fontControls = document.getElementById('font-controls');
            if (fontControls) fontControls.classList.remove('hidden');

            // Show tone controls (always for text)
            const toneControls = document.getElementById('tone-controls');
            if (toneControls) {
                toneControls.classList.remove('hidden');
                toneControls.classList.add('flex');
            }
        }

    } else {
        titleElement.textContent = "🎸🥁🎤";
        titleElement.classList.add('mt-10');
        displayElement.innerHTML = '<p class="text-gray-500 text-center mt-10">Selecione uma música no menu à esquerda para visualizar a cifra.</p>';
        chartDisplay.classList.add('hidden');
        viewToggle.classList.add('hidden');
    }

    // Ensure auto-scroll button visibility is correct if in fullscreen

    // Update Auto-Scroll Button Visibility
    const scrollButton = document.getElementById('auto-scroll-button');
    const header = document.querySelector('header');
    if (scrollButton) {
        let shouldHide = false;

        if (!song) {
            shouldHide = true;
        } else {
            // Rule: Hide if Single Page Chart
            if (viewMode === 'image' && (!song.charts || song.charts.length <= 1)) {
                shouldHide = true;
            }

            // Rule: Hide if Fullscreen and Image Mode (Existing Logic)
            if (header && header.classList.contains('hidden') && viewMode === 'image') {
                shouldHide = true;
            }
        }

        if (shouldHide) {
            scrollButton.classList.add('hidden');
        } else {
            scrollButton.classList.remove('hidden');
        }
    }
}

function toggleFavorite(songId, event) {
    if (event) {
        event.stopPropagation();
    }

    const index = favorites.indexOf(songId);
    if (index > -1) {
        favorites.splice(index, 1);
        // Clean up settings when unfavoriting
        if (favoriteSettings[songId]) {
            delete favoriteSettings[songId];
            localStorage.setItem('favoriteSettings', JSON.stringify(favoriteSettings));
        }
    } else {
        favorites.push(songId);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderSongList();
}

function toggleFavoritesFilter() {
    showFavoritesOnly = !showFavoritesOnly;
    const btn = document.getElementById('favorites-filter-btn');
    if (btn) {
        if (showFavoritesOnly) {
            btn.classList.add('bg-yellow-500', 'text-gray-900');
            btn.classList.remove('bg-gray-600', 'text-gray-300');
        } else {
            btn.classList.remove('bg-yellow-500', 'text-gray-900');
            btn.classList.add('bg-gray-600', 'text-gray-300');
        }
    }
    renderSongList();
}

function renderSongList() {
    const listElement = document.getElementById('song-list');
    listElement.innerHTML = '';

    const term = currentSearchTerm.toLowerCase();

    const filteredSongs = SONGS.filter(song => {
        const matchesSearch = song.title.toLowerCase().includes(term) ||
            (song.chord_text && song.chord_text.toLowerCase().includes(term));
        const matchesFavorite = showFavoritesOnly ? favorites.includes(song.id) : true;

        // Filter by Mode
        let matchesMode = true;
        if (listFilterMode === 'charts') {
            // Must have chart image or charts array
            matchesMode = !!(song.chart_image || (song.charts && song.charts.length > 0));
        } else {
            // Must have chord text
            matchesMode = !!(song.chord_text && song.chord_text.trim().length > 0);
        }

        return matchesSearch && matchesFavorite && matchesMode;
    });

    if (showFavoritesOnly && currentSearchTerm === '') {
        filteredSongs.sort((a, b) => {
            return favorites.indexOf(a.id) - favorites.indexOf(b.id);
        });
    }

    if (filteredSongs.length === 0) {
        listElement.innerHTML = '<li class="text-gray-400 p-2 text-sm italic">Nenhuma música encontrada.</li>';
        return;
    }

    filteredSongs.forEach(song => {
        const isFav = favorites.includes(song.id);
        const isSelected = song.id === currentSongId;

        const li = document.createElement('li');
        li.id = `song-item-${song.id}`;
        li.className = `flex items-center cursor-pointer p-2 rounded-lg transition duration-150 text-base ${isSelected ? 'bg-teal-700 font-bold' : 'hover:bg-gray-700'}`;
        li.onclick = () => loadSong(song.id);

        if (showFavoritesOnly && currentSearchTerm === '') {
            const handleSpan = document.createElement('span');
            handleSpan.innerHTML = '☰';
            handleSpan.className = 'drag-handle mr-3 text-gray-400 cursor-grab hover:text-white text-lg flex-shrink-0';
            handleSpan.onclick = (e) => e.stopPropagation();
            li.appendChild(handleSpan);
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = song.title;
        titleSpan.className = 'flex-grow truncate'; // Ensure title takes available space

        const iconsDiv = document.createElement('div');
        iconsDiv.className = 'flex items-center space-x-2 flex-shrink-0 ml-2';

        if (song.chart_image || (song.charts && song.charts.length > 0)) {
            const chartIcon = document.createElement('span');
            chartIcon.innerHTML = '🎼'; // Icon for chart/score
            chartIcon.title = 'Possui Partitura';
            chartIcon.className = 'text-xs text-indigo-400';
            iconsDiv.appendChild(chartIcon);
        }

        const favBtn = document.createElement('button');
        favBtn.className = 'p-1 hover:text-yellow-400 focus:outline-none';
        favBtn.innerHTML = isFav ? '★' : '☆'; // Estrela cheia ou vazia
        favBtn.style.color = isFav ? '#FBBF24' : 'inherit'; // Amarelo se favorito
        favBtn.onclick = (e) => toggleFavorite(song.id, e);
        favBtn.title = isFav ? "Remover dos favoritos" : "Adicionar aos favoritos";

        iconsDiv.appendChild(favBtn);

        li.appendChild(titleSpan);
        li.appendChild(iconsDiv);
        listElement.appendChild(li);
    });

    initSortable();
}

let sortableList = null;

function initSortable() {
    const listElement = document.getElementById('song-list');
    if (sortableList) {
        sortableList.destroy();
        sortableList = null;
    }

    if (showFavoritesOnly && currentSearchTerm === '' && listElement) {
        sortableList = Sortable.create(listElement, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function () {
                const newOrderIds = [];
                listElement.querySelectorAll('li').forEach(li => {
                    const id = li.id.replace('song-item-', '');
                    newOrderIds.push(id);
                });

                const updatedFavorites = newOrderIds.map(id => {
                    return favorites.find(fav => String(fav) === id);
                });
                favorites = updatedFavorites;
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }
        });
    }
}

function initializeSongList() {
    renderSongList();
    updateFilterButtons();
}

function filterSongs(searchTerm) {
    currentSearchTerm = searchTerm;
    renderSongList();
}

// Adiciona a lógica para o menu hamburger e responsividade
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const cifraViewer = document.getElementById('cifra-viewer');
    const scrollButton = document.getElementById('auto-scroll-button');

    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
        cifraViewer.classList.add('hidden');
        if (scrollButton) scrollButton.classList.add('hidden');
    } else {
        sidebar.classList.add('hidden');
        cifraViewer.classList.remove('hidden');
        if (scrollButton) scrollButton.classList.remove('hidden');
    }
}

// Função para ativar/desativar a rolagem automática
let autoScrollInterval = null;
function toggleAutoScroll() {
    const button = document.getElementById('auto-scroll-button');
    const playIcon = document.getElementById('scroll-icon-play');
    const pauseIcon = document.getElementById('scroll-icon-pause');

    if (autoScrollInterval) {
        // Parar rolagem
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;

        // Atualizar ícones
        if (playIcon && pauseIcon) {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }

        // Removed opacity change - keep default transparency
    } else {
        // Iniciar rolagem
        autoScrollInterval = setInterval(() => {
            // Verifica o modo de visualização atual
            if (viewMode === 'image') {
                const chartDisplay = document.getElementById('chart-display');
                if (chartDisplay) {
                    chartDisplay.scrollBy({ top: 1, behavior: 'auto' });
                }
            } else {
                // Modo Texto
                const viewer = document.getElementById('cifra-viewer');
                if (viewer) {
                    viewer.scrollBy({ top: 1, behavior: 'auto' });
                } else {
                    window.scrollBy({ top: 1, behavior: 'auto' });
                }
            }
        }, 50);

        // Atualizar ícones
        if (playIcon && pauseIcon) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        }

        // Removed opacity change - keep default transparency
    }
}

// Função para alternar o modo de tela cheia (mobile)
function toggleFullscreen() {
    const header = document.querySelector('header');
    const btnMax = document.getElementById('icon-maximize');
    const btnMin = document.getElementById('icon-minimize');
    const cifraViewer = document.getElementById('cifra-viewer');

    if (header) {
        if (header.classList.contains('hidden')) {
            // Sair do modo tela cheia
            header.classList.remove('hidden');
            if (btnMax) btnMax.classList.remove('hidden');
            if (btnMin) btnMin.classList.add('hidden');
            if (cifraViewer) cifraViewer.classList.remove('fullscreen-viewer');

            // Re-show auto scroll button ONLY if allowed
            const scrollButton = document.getElementById('auto-scroll-button');
            if (scrollButton) {
                const song = SONGS.find(s => s.id === currentSongId);
                let shouldShow = true;
                if (viewMode === 'image' && (!song.charts || song.charts.length <= 1)) {
                    shouldShow = false;
                }

                if (shouldShow) {
                    scrollButton.classList.remove('hidden');
                } else {
                    scrollButton.classList.add('hidden');
                }
            }

        } else {
            // Entrar no modo tela cheia
            header.classList.add('hidden');
            if (btnMax) btnMax.classList.add('hidden');
            if (btnMin) btnMin.classList.remove('hidden');
            if (cifraViewer) cifraViewer.classList.add('fullscreen-viewer');

            // Hide auto scroll button ONLY if in image/chart mode
            if (viewMode === 'image') {
                const scrollButton = document.getElementById('auto-scroll-button');
                if (scrollButton) scrollButton.classList.add('hidden');
            }
        }
    }
}

window.onload = () => {
    const hamburgerButton = document.getElementById('hamburger-button');
    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', toggleMenu);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterSongs(e.target.value));
    }

    // Inicializa a lista de músicas e carrega a primeira música
    initializeSongList();
    if (SONGS.length > 0) {
        // loadSong(SONGS[0].id); // REMOVED: Do not load first song automatically
        updateDisplay();
    } else {
        updateDisplay();
    }

    // Check for mobile initial state: Show Sidebar, Hide Viewer
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const cifraViewer = document.getElementById('cifra-viewer');
        const scrollButton = document.getElementById('auto-scroll-button');

        if (sidebar) sidebar.classList.remove('hidden');
        if (cifraViewer) cifraViewer.classList.add('hidden');
        if (scrollButton) scrollButton.classList.add('hidden');
    }

    const viewer = document.getElementById('cifra-viewer'); // Or a specialized container if needed

    if (viewer) {
        viewer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        viewer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        viewer.addEventListener('wheel', e => {
            const header = document.querySelector('header');
            const isFullscreen = header && header.classList.contains('hidden');
            if (isFullscreen && viewMode === 'image') {
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
                    if (e.deltaX > 0) {
                        triggerAdjacentSong(1); // Scroll right -> Next
                    } else {
                        triggerAdjacentSong(-1); // Scroll left -> Prev
                    }
                }
            }
        }, { passive: true });
    }
};

// --- Swipe Navigation Logic ---
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let wheelDebounceTimeout = null;

function triggerAdjacentSong(direction) {
    if (wheelDebounceTimeout) return;
    loadAdjacentSong(direction);
    wheelDebounceTimeout = setTimeout(() => {
        wheelDebounceTimeout = null;
    }, 500); // 500ms debounce
}

function handleSwipe() {
    const header = document.querySelector('header');
    const isFullscreen = header && header.classList.contains('hidden');

    // Only trigger if in Fullscreen AND Image/Chart Mode
    if (!isFullscreen || viewMode !== 'image') {
        return;
    }

    const SWIPE_THRESHOLD = 50; // Minimum distance to consider a swipe
    const VERTICAL_THRESHOLD = 50; // Max allowed vertical movement

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffY) > VERTICAL_THRESHOLD) {
        return; // Reject if it's mostly a vertical scroll
    }

    if (diffX < -SWIPE_THRESHOLD) {
        // Swipe Left (finger moves left) -> Next
        triggerAdjacentSong(1);
    } else if (diffX > SWIPE_THRESHOLD) {
        // Swipe Right (finger moves right) -> Prev
        triggerAdjacentSong(-1);
    }
}

function loadAdjacentSong(direction) {
    const listElement = document.getElementById('song-list');
    const lis = listElement.querySelectorAll('li');
    if (lis.length === 0) return;

    // Get all valid IDs from the current DOM list to respect any current filter/sort
    const visibleIds = [];
    lis.forEach(li => {
        if (li.id.startsWith('song-item-')) {
            const id = Number(li.id.replace('song-item-', ''));
            if (!isNaN(id)) visibleIds.push(id);
        }
    });

    if (visibleIds.length === 0) return;

    const currentIndex = visibleIds.indexOf(currentSongId);
    let nextIndex = 0;

    if (currentIndex !== -1) {
        nextIndex = currentIndex + direction;
        // Wrap around list bounds
        if (nextIndex >= visibleIds.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = visibleIds.length - 1;
    } else {
        nextIndex = direction > 0 ? 0 : visibleIds.length - 1;
    }

    const nextId = visibleIds[nextIndex];
    if (nextId) {
        loadSong(nextId);
    }
}

window.transpose = transpose;
window.toggleColumns = toggleColumns;
window.changeFontSize = changeFontSize;
window.toggleAutoScroll = toggleAutoScroll;
window.toggleViewMode = toggleViewMode;
window.toggleFullscreen = toggleFullscreen;
window.setListFilterMode = setListFilterMode;