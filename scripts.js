// --- 1. CONFIGURAÇÃO DE DADOS E ESTADO ---

// Escalas cromáticas para transposição. Usaremos 'SHARP' como base de mapeamento.
const NOTES = {
    SHARP: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    FLAT: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};

// Dados de amostra (músicas e cifras)
const SONGS = [
    { 
        id: 1, 
        title: "Vem, esta é a Hora", 
        chord_text: `
[D]                      [D4]  [D]
Vem, esta é a hora da adoração
 [A]                  [Em]  [G]
Vem, dar a Ele teu coração
 [D]                       [D4]    [D]
Vem, assim como estás para adorar
 [A]                      [Em]  [F#m]  [G]
Vem, assim como estás diante do Pai
 [D]
Vem

[Refrão]

 [G]                   [D]
Toda língua confessará o Senhor
 [G]                   [D]
Todo joelho se dobrará
 [G]                  [Bm]
Mas aquele que a Ti escolher
     [Em]            [A4]  [A]
O tesouro maior terá



[Solo] [E]  [E4]  [E]
       [B]  [F#m]  [A]
       [E]  [E4]  [E]
       [B]  [F#m]  [A]  [E][Tab - Solo]

 [A]                   [E]
Toda língua confessará o Senhor
 [A]                   [E]
Todo joelho se dobrará
 [A]                  [C#m]
Mas aquele que a Ti escolher
     [F#m]           [B4]  [B]
O tesouro maior terá

 [E]                      [E4]  [E]
Vem, esta é a hora da adoração
 [B]                  [F#m]  [A]
Vem, dar a Ele teu cora_ção
 [E]                         [E4]  [E]
Vem, assim como estás para adorar
 [B]                         [F#m]   [A]
Vem, assim como estás diante do Pai
 [E]
Vem, Vem, Vem, Vem, Vem
`
    },
    { 
        id: 2, 
        title: "Ousado Amor", 
        chord_text: `
[C#m]                [B4]
    Antes de eu falar
             [A]
Tu cantavas sobre mim
[C#m]               [B4]
    Tu tens sido tão
        [A]
Tão bom    pra mim
[C#m]                   [B4]
    Antes de eu respirar
              [A]
Sopraste Tua vida em mim
[C#m]               [B4]
    Tu tens sido tão
        [A]
Tão bom    pra mim

[Refrão]

       [C#m]          [B4]
Oh, impressionante, infinito
     [A]           [E]
E ousado amor de Deus
         [C#m]        [B4]
Oh, que deixa as noventa e nove
 [A]              [E]
Só pra me encontrar
               [C#m]            [B4]
Não posso comprá-lo, nem merecê-lo
         [A]          [E]
Mesmo assim se entregou
        [C#m]         [B4]
Oh, impressionante, infinito
     [A]           [E]
E ousado amor de Deus

( [C#m]  [B4]  [A]  [E] )
( [C#m]  [B4]  [A]  [E] )

[Segunda Parte]
[C#m]             [B4]
    Inimigo eu fui
                [A]
Mas Teu amor lutou por mim
[C#m]               [B4]
    Tu tens sido tão
        [A]
Tão bom    pra mim
[C#m]              [B4]
    Não tinha valor
            [A]
Mas tudo pagou por mim
[C#m]               [B4]
    Tu tens sido tão
        [A]
Tão bom    pra mim

[Refrão]
(Já apresentado acima)

( [C#m]  [B4]  [A]  [E] )
( [C#m]  [B4]  [A]  [E] )

[Terceira Parte]
[C#m]                   [B4]
    Traz luz para as sombras
           [A]                   [E]
Escala montanhas, pra me encontrar
[C#m]            [B4]
    Derruba muralhas
               [A]                  [E]
Destrói as mentiras, pra me encontrar
[C#m]                   [B4]
    Traz luz para as sombras
           [A]                   [E]
Escala montanhas, pra me encontrar
[C#m]            [B4]
    Derruba muralhas
               [A]                  [E]
Destrói as mentiras, pra me encontrar[C#m]                   [B4]
    Traz luz para as sombras
           [A]                   [E]
Escala montanhas, pra me encontrar[C#m]            [B4]
    Derruba muralhas
               [A]                  [E]
Destrói as mentiras, pra me encontrar[C#m]                   [B4]
    Traz luz para as sombras
           [A]                   [E]
Escala montanhas, pra me encontrar[C#m]            [B4]
    Derruba muralhas
               [A]                  [E]
Destrói as mentiras, pra me encontrar
`
    },
    { 
        id: 3, 
        title: "Perto quero estar", 
        chord_text: `
[A]                [D]
  Perto quero estar
[E]                 [A]
  Junto aos teus pés
[E]                [D]
  Pois prazer maior não há
[F#m]     [E]             [D]
   Que me render e te adorar
[A]                 [D]
  Tudo que há em mim
[E]               [A]
  Quero te ofertar
[E]               [D]
  Mas, ainda é pouco eu sei
[F#m]    [E]             [D]
   Se comparado ao que ganhei


[A]                 [D]
  Não sou apenas servo
      [E]          [A]
Teu amigo me tornei

( [D]  [E] )

Refrão
[A]     [E]    [D]
  Te louvarei
[A]        [E]
  Não importam
    [D]      [E]
As circunstâncias
[A]   [E]   [D]
  Adorarei
[F#m]           [E]    [A]
   Somente a ti Jesus

( [A]  [E] )

[Primeira Parte]
[A]                [D]
  Perto quero estar
[E]                 [A]
  Junto aos teus pés
[E]                [D]
  Pois prazer maior não há
[F#m]     [E]             [D]
   Que me render e te adorar
[A]                 [D]
  Tudo que há em mim
[E]               [A]
  Quero te ofertar
[E]               [D]
  Mas, ainda é pouco eu sei
[F#m]    [E]             [D]
   Se comparado ao que ganhei

[Pré-Refrão]
[A]                 [D]
  Não sou apenas servo
      [E]          [A]
Teu amigo me tornei

( [D]  [E] )


[A]     [E]    [D]
  Te louvarei
[A]        [E]
  Não importam
    [D]      [E]
As circunstâncias
[A]    [E]  [D]
  Adorarei
[D]            [E]    [A]
  Somente a ti Jesus
[A]     [E]    [D]
  Te louvarei
[A]        [E]
  Não importam
    [D]      [E]
As circunstâncias
[A]   [E]   [D]
  Adorarei
[D]            [E]    [A]
  Somente a ti Jesus
[A]      [E]   [D]
  Te louvarei
[A]        [E]
  Não importam
    [D]      [E]
As circunstâncias
[A]   [E]   [D]
  Adorarei

[D]            [E]  [A]
  Somente a ti Jesus
[D]            [E]  [A]
  Somente a ti Jesus
`
    },
    { 
        id: 4, 
        title: "Eu vou construir", 
        chord_text: `
[A]                 [D]
   Digno desta canção só Tu és Senhor
[A/C#]                  [D]
      Digno do meu louvor só Tu és Senhor
[A]                 [D]
   Digno da minha vida Tu és Senhor
           [A/C#]  [D]
Oh eu sou Teu
[A]                   [D]
   Nome que é sobre todos é o Teu Jesus
[A/C#]                [D]
      Fonte da salvação só Tu és Jesus
[A]                 [D]
   Digno da minha vida Tu és Jesus
           [A/C#]           [D]
Oh eu sou Teu   oh eu sou Teu

[Refrão]

 [D]
Santo
           [Bm]
És incomparável
          [A/E]
És inigualável
             [F#m]
Abre os meus olhos, Senhor

 [D]
Mostra quem Tu és
  [Bm]          [A/E]
E enche o meu coração do amor que faz
 [F#m]
Mudar o mundo

( [A]  [E]  [D] )
( [A]  [E]  [D] )

[Primeira Parte]
[A]                 [D]
   Digno desta canção só Tu és Senhor
[A/C#]                  [D]
      Digno do meu louvor só Tu és Senhor
[A]                 [D]
   Digno da minha vida Tu és Senhor
           [A/C#]  [D]
Oh eu sou Teu
[A]                   [D]
   Nome que é sobre todos é o Teu Jesus
[A/C#]                [D]
      Fonte da salvação só Tu és Jesus
[A]                 [D]
   Digno da minha vida Tu és Jesus
           [A/C#]           [D]
Oh eu sou Teu   oh eu sou Teu

[Refrão]

 [D]
Santo
           [Bm]
És incomparável
          [A/E]
És inigualável
             [F#m]
Abre os meus olhos, Senhor

 [D]
Mostra quem Tu és
  [Bm]          [A/E]
E enche o meu coração do amor que faz
   [F#m]
Mudar o mundo

 [D]
Santo
           [Bm]
És incomparável
          [A/E]
És inigualável
             [F#m]
Abre os meus olhos, Senhor

 [D]
Mostra quem Tu és
  [Bm]          [A/E]
E enche o meu coração do amor que faz
   [F#m]
Mudar o mundo

[Ponte]

( [D]  [E]  [F#m]  [A/C#] )
( [D]  [E]  [F#m]  [A/C#] )
 
[D]            [E]                 [F#m]
Eu vou construir minha vida em Ti
           [A/C#]
Tu és meu fundamento
[D]          [E]              [F#m]
Eu vou confiar somente em Ti
            [A/C#]
Não vou ser abalado
[D]            [E]                 [F#m]
Eu vou construir minha vida em Ti
           [A/C#]
Tu és meu fundamento
[D]          [E]              [F#m]
Eu vou confiar somente em Ti
            [A/C#]
Não vou ser abalado
[D]            [E]                 [F#m]
Eu vou construir minha vida em Ti
           [A/C#]
Tu és meu fundamento
[D]          [E]              [F#m]
Eu vou confiar somente em Ti
            [A/C#]
Não vou ser abalado

[Refrão]

 [D]
Santo
           [Bm]
És incomparável
          [A/E]
És inigualável
             [F#m]
Abre os meus olhos, Senhor

 [D]
Mostra quem Tu és
  [Bm]          [A/E]
E enche o meu coração do amor que faz
 [F#m]
Mudar o mundo
`
    }
];

// Estado Global
let currentSongId = null;
let transposeOffset = 0; // 0 significa tom original
let isTwoColumns = false;
let currentFontSize = 1.1; // Tamanho inicial em rem

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

    isTwoColumns = !isTwoColumns;

    if (isTwoColumns) {
        display.classList.remove('columns-1');
        display.classList.add('columns-2');
        button.textContent = '2 Colunas';
        button.classList.add('bg-green-600');
        button.classList.remove('bg-blue-600');
    } else {
        display.classList.remove('columns-2');
        display.classList.add('columns-1');
        button.textContent = '1 Coluna';
        button.classList.remove('bg-green-600');
        button.classList.add('bg-blue-600');
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
    });
    const clickedElement = document.getElementById(`song-item-${songId}`);
    if (clickedElement) {
        clickedElement.classList.add('bg-teal-700', 'font-bold');
    }

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

function initializeSongList() {
    const listElement = document.getElementById('song-list');
    listElement.innerHTML = ''; 

    SONGS.forEach(song => {
        const li = document.createElement('li');
        li.id = `song-item-${song.id}`;
        li.className = 'cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition duration-150 text-base';
        li.textContent = song.title;
        li.onclick = () => loadSong(song.id);
        listElement.appendChild(li);
    });
}

window.onload = () => {
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