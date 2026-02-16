/**
 * DOOM Platformer - Tutorial & Help System
 * Comprehensive onboarding and help content in Czech
 */

const TUTORIAL_STEPS = [
    {
        title: '🎮 Vítej v DOOM Platformer!',
        content: [
            'Toto je 2D akční platformer s DOOM estetikou.',
            '',
            '🎯 CÍL: Dostat se na konec každého levelu',
            '💀 Zabíjej démony, sbírej mince a vylepšení',
            '🏆 Soutěž s ostatními hráči online!',
            '',
            'Stiskni ENTER pro pokračování...'
        ]
    },
    {
        title: '🎮 Základní ovládání',
        content: [
            '⬅️➡️ WASD / Šipky - Pohyb a skok',
            '🔫 J / Z / Ctrl - Střelba',
            '🔄 Q / E nebo 1-6 - Změna zbraně',
            '⏸️ P / ESC - Pauza',
            '',
            '💡 TIP: Drž šipku nahoru pro střelbu nahoru!',
            '',
            'Stiskni ENTER pro pokračování...'
        ]
    },
    {
        title: '🛍️ Shop a Skin systém',
        content: [
            '💰 Sbírej MINCE za zabíjení nepřátel',
            '🎨 Kup SKINY v shopu (tlačítko B)',
            '✨ Každý skin má unikátní vzhled',
            '',
            '🏪 Shop obsahuje:',
            '  • Různé barevné varianty',
            '  • Speciální efekty',
            '  • Legendární skiny',
            '',
            'Stiskni ENTER pro pokračování...'
        ]
    },
    {
        title: '🌐 Online Features',
        content: [
            '📝 Stiskni M pro přihlášení/registraci',
            '🏆 Tvé skóre se automaticky ukládá online',
            '📊 Soutěž na globálním žebříčku',
            '💾 Ukládej hru do cloudu',
            '',
            '⚡ Hrát můžeš i offline!',
            '  (lokální high score se ukládá vždy)',
            '',
            'Stiskni ENTER pro pokračování...'
        ]
    },
    {
        title: '⚔️ Combat & Level Tips',
        content: [
            '🎯 Každá zbraň má jiné vlastnosti:',
            '  • Pistol - neomezené náboje',
            '  • Shotgun - velká síla na blízko',
            '  • Machinegun - rychlá palba',
            '  • Plasma - silné projektily',
            '  • Rocket - exploze a rocket jump!',
            '',
            '💡 ROCKET JUMP: Střílej dolů při skoku!',
            '',
            'Stiskni ENTER pro začátek hry...'
        ]
    }
];

const HELP_CONTENT = {
    controls: [
        { key: 'WASD / Šipky', desc: 'Pohyb vlevo/vpravo, skok' },
        { key: 'J / Z / Ctrl', desc: 'Střelba' },
        { key: 'Šipka nahoru + Střelba', desc: 'Střelba nahoru' },
        { key: 'Šipka dolů + Střelba', desc: 'Střelba dolů (rocket jump!)' },
        { key: 'Q / E', desc: 'Přepínání zbraní' },
        { key: '1-6', desc: 'Přímá volba zbraně' },
        { key: 'P / ESC', desc: 'Pauza' },
        { key: 'M', desc: 'Přihlášení/Registrace (menu) / Návrat do menu (pauza)' },
        { key: 'B', desc: 'Otevřít Skin Shop (menu)' },
        { key: 'H', desc: 'Tato nápověda' },
        { key: 'T', desc: 'Znovu zobrazit tutorial' }
    ],
    advanced: [
        { key: 'F', desc: 'Fullscreen režim' },
        { key: 'L', desc: 'Level editor' },
        { key: 'F5', desc: 'Uložit hru (lokálně)' },
        { key: 'F9', desc: 'Načíst hru (lokálně)' }
    ],
    gameplay: [
        '🎯 Dostaň se na konec levelu (zelený exit)',
        '💰 Sbírej mince - použij je v shopu',
        '🔫 Každá zbraň má jiné vlastnosti',
        '💊 Sbírej health a armor pickupy',
        '📦 Najdi checkpointy pro respawn',
        '🚀 Rocket jump: střílej dolů při skoku!',
        '🏆 Tvé skóre se počítá z času a zabití',
        '⚡ Chain kill bonus za rychlé zabití'
    ],
    online: [
        '📝 Registruj se pro online features (M)',
        '🏆 Automatické nahrávání skóre',
        '📊 Soutěž na globálním žebříčku',
        '💾 Cloud save (připraveno)',
        '🎮 Lze hrát i offline'
    ]
};

function showTutorial() {
    gameState.showTutorial = true;
    gameState.tutorialStep = 0;
}

function nextTutorialStep() {
    gameState.tutorialStep++;
    if (gameState.tutorialStep >= TUTORIAL_STEPS.length) {
        gameState.showTutorial = false;
        gameState.tutorialCompleted = true;
        localStorage.setItem('tutorialCompleted', 'true');
        // Start game after tutorial
        if (gameState.showMenu) {
            startGame();
        }
    }
}

function skipTutorial() {
    gameState.showTutorial = false;
    gameState.tutorialCompleted = true;
    localStorage.setItem('tutorialCompleted', 'true');
}
