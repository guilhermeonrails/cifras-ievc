// --- 1. CONFIGURAÇÃO DE DADOS E ESTADO ---

// Escalas cromáticas para transposição. Usaremos 'SHARP' como base de mapeamento.
const NOTES = {
    SHARP: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    FLAT: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};

// Dados de amostra (músicas e cifras)


// Estado Global
let currentSongId = null;
let transposeOffset = 0; // 0 significa tom original
let isTwoColumns = false;
let currentFontSize = 1.1; // Tamanho inicial em rem
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
let showFavoritesOnly = false;
let currentSearchTerm = '';

const MIN_FONT_SIZE = 0.8;
const MAX_FONT_SIZE = 3.0;
const FONT_STEP = 0.1;


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
    transposeOffset += direction;
    transposeOffset = (transposeOffset % 12 + 12) % 12;
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

function loadSong(songId) {
    currentSongId = songId;
    transposeOffset = 0;
    currentFontSize = 1.1;
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
}

function updateDisplay() {
    const song = SONGS.find(s => s.id === currentSongId);
    const titleElement = document.getElementById('cifra-title');
    const displayElement = document.getElementById('cifra-display');
    // const keyDisplay = document.getElementById('current-key-display');

    const originalRoot = 'tom';
    let rootIndex = NOTES.SHARP.indexOf(originalRoot);
    let newIndex = (rootIndex + transposeOffset) % 12;
    if (newIndex < 0) newIndex += 12;
    const currentKey = NOTES.SHARP[newIndex];

    // keyDisplay.textContent = currentKey;

    if (song) {
        titleElement.textContent = song.title;
        displayElement.innerHTML = renderChordSheet(song.chord_text);
    } else {
        titleElement.textContent = "Nenhuma Música Selecionada";
        displayElement.innerHTML = '<p class="text-gray-500 text-center mt-20">Selecione uma música no menu à esquerda para visualizar a cifra.</p>';
    }
}

function toggleFavorite(songId, event) {
    if (event) {
        event.stopPropagation();
    }

    if (favorites.has(songId)) {
        favorites.delete(songId);
    } else {
        favorites.add(songId);
    }

    localStorage.setItem('favorites', JSON.stringify([...favorites]));
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
            song.chord_text.toLowerCase().includes(term);
        const matchesFavorite = showFavoritesOnly ? favorites.has(song.id) : true;

        return matchesSearch && matchesFavorite;
    });

    if (filteredSongs.length === 0) {
        listElement.innerHTML = '<li class="text-gray-400 p-2 text-sm italic">Nenhuma música encontrada.</li>';
        return;
    }

    filteredSongs.forEach(song => {
        const isFav = favorites.has(song.id);
        const isSelected = song.id === currentSongId;

        const li = document.createElement('li');
        li.id = `song-item-${song.id}`;
        li.className = `flex justify-between items-center cursor-pointer p-2 rounded-lg transition duration-150 text-base ${isSelected ? 'bg-teal-700 font-bold' : 'hover:bg-gray-700'}`;
        li.onclick = () => loadSong(song.id);

        const titleSpan = document.createElement('span');
        titleSpan.textContent = song.title;

        const favBtn = document.createElement('button');
        favBtn.className = 'p-1 hover:text-yellow-400 focus:outline-none';
        favBtn.innerHTML = isFav ? '★' : '☆'; // Estrela cheia ou vazia
        favBtn.style.color = isFav ? '#FBBF24' : 'inherit'; // Amarelo se favorito
        favBtn.onclick = (e) => toggleFavorite(song.id, e);
        favBtn.title = isFav ? "Remover dos favoritos" : "Adicionar aos favoritos";

        li.appendChild(titleSpan);
        li.appendChild(favBtn);
        listElement.appendChild(li);
    });
}

function initializeSongList() {
    renderSongList();
}

function filterSongs(searchTerm) {
    currentSearchTerm = searchTerm;
    renderSongList();
}

// Adiciona a lógica para o menu hamburger e responsividade
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const cifraViewer = document.getElementById('cifra-viewer');

    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
        cifraViewer.classList.add('hidden');
    } else {
        sidebar.classList.add('hidden');
        cifraViewer.classList.remove('hidden');
    }
}

// Função para ativar/desativar a rolagem automática
let autoScrollInterval = null;
function toggleAutoScroll() {
    const button = document.getElementById('auto-scroll-button');

    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
        button.textContent = 'Ativar Rolagem';
        button.classList.remove('bg-red-600');
        button.classList.add('bg-green-600');
    } else {
        autoScrollInterval = setInterval(() => {
            window.scrollBy({ top: 1, behavior: 'smooth' });
        }, 50); // Ajuste a velocidade da rolagem alterando o intervalo
        button.textContent = 'Parar Rolagem';
        button.classList.remove('bg-green-600');
        button.classList.add('bg-red-600');
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
        loadSong(SONGS[0].id);
    } else {
        updateDisplay();
    }
};

window.transpose = transpose;
window.toggleColumns = toggleColumns;
window.changeFontSize = changeFontSize;
window.toggleAutoScroll = toggleAutoScroll;