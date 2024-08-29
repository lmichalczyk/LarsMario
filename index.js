const mario = document.getElementById('mario');
const hindre = document.querySelectorAll('.hinder');
let posisjon = 400; // Startposisjon midt på skjermen
let hoppFart = 0;
let gravitasjon = 0.6;
let påBakken = true;
let spillSlutt = false;

let bevegerHøyre = false;
let bevegerVenstre = false;

document.addEventListener('keydown', (e) => {
    if (spillSlutt) return;
    if (e.key === 'ArrowRight') {
        bevegerHøyre = true;
    } else if (e.key === 'ArrowLeft') {
        bevegerVenstre = true;
    } else if (e.key === ' ' && påBakken) {
        hopp();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
        bevegerHøyre = false;
    } else if (e.key === 'ArrowLeft') {
        bevegerVenstre = false;
    }
});

function hopp() {
    if (påBakken || påHinder()) {
        påBakken = false;
        hoppFart = -15; // Negativ verdi for å hoppe oppover
    }
}

function oppdaterMario() {
    // Oppdater horisontal posisjon
    if (bevegerHøyre) {
        posisjon += 5;
    }
    if (bevegerVenstre) {
        posisjon -= 5;
    }
    mario.style.left = posisjon + 'px';

    // Oppdater vertikal posisjon
    hoppFart += gravitasjon;
    let nyPosisjon = parseInt(mario.style.bottom) - hoppFart;

    // Sjekk om Mario er på bakken eller på et hinder
    if (nyPosisjon <= 50 && !påHinder()) {
        nyPosisjon = 50;
        påBakken = true;
        hoppFart = 0;
    } else if (påHinder()) {
        nyPosisjon = parseInt(påHinder().style.height) + 50;
        påBakken = true;
        hoppFart = 0;
    } else {
        påBakken = false;
    }

    mario.style.bottom = nyPosisjon + 'px';
}

function flyttHindre() {
    hindre.forEach(hinder => {
        let hinderPosisjon = parseInt(hinder.style.right);
        hinderPosisjon -= 2;
        if (hinderPosisjon < -50) {
            hinderPosisjon = 800;
        }
        hinder.style.right = hinderPosisjon + 'px';
    });
}

function sjekkKollisjon() {
    const marioRect = mario.getBoundingClientRect();
    const spillRect = document.getElementById('spill').getBoundingClientRect();

    hindre.forEach(hinder => {
        const hinderRect = hinder.getBoundingClientRect();
        
        if (
            marioRect.right > hinderRect.left &&
            marioRect.left < hinderRect.right &&
            marioRect.bottom > hinderRect.top &&
            marioRect.top < hinderRect.bottom
        ) {
            // Sjekk om Mario lander på toppen av hinderet
            if (marioRect.bottom <= hinderRect.top + 10 && hoppFart > 0) {
                // Mario lander på toppen av hinderet
                påBakken = true;
                hoppFart = 0;
                mario.style.bottom = (hinderRect.height + 50) + 'px';
            } else if (marioRect.right > hinderRect.left + 5 && marioRect.left < hinderRect.right - 5) {
                // Mario kolliderer med toppen eller bunnen av hinderet
                spillSlutt = true;
                alert('Spill over! Du traff et hinder.');
            } else {
                // Mario kolliderer med siden av hinderet
                spillSlutt = true;
                alert('Spill over! Du traff et hinder.');
            }
        }
    });

    // Sjekk om Mario er utenfor spillområdet
    if (marioRect.right > spillRect.right || marioRect.left < spillRect.left) {
        spillSlutt = true;
        alert('Spill over! Du gikk ut av banen.');
    }
    
    console.log('Mario posisjon:', marioRect.bottom, 'Hopp fart:', hoppFart);
}

function påHinder() {
    const marioRect = mario.getBoundingClientRect();
    for (let hinder of hindre) {
        const hinderRect = hinder.getBoundingClientRect();
        if (
            marioRect.right > hinderRect.left + 5 &&
            marioRect.left < hinderRect.right - 5 &&
            Math.abs(marioRect.bottom - hinderRect.top) < 5 &&
            hoppFart >= 0
        ) {
            return hinder;
        }
    }
    return null;
}

function spillLoop() {
    if (!spillSlutt) {
        oppdaterMario();
        flyttHindre();
        sjekkKollisjon();
        requestAnimationFrame(spillLoop);
    }
}

spillLoop();