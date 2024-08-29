const mario = document.getElementById('mario');
const hindre = document.querySelectorAll('.hinder');
const spill = document.getElementById('spill');
const startPåNyttKnapp = document.getElementById('startPåNytt');
const livTeller = document.getElementById('livTeller');
let posisjon = 400;
let hoppFart = 0;
let gravitasjon = 0.6;
let påBakken = true;
let spillSlutt = false;
let liv = 3;

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
    if (påBakken) {
        påBakken = false;
        hoppFart = -15;
    }
}

function oppdaterMario() {
    let nyPosisjon = posisjon;
    if (bevegerHøyre) {
        nyPosisjon += 5;
    }
    if (bevegerVenstre) {
        nyPosisjon -= 5;
    }

    // Sjekk kollisjon med hindre og spørsmålsblokker før vi oppdaterer posisjonen
    const marioRect = mario.getBoundingClientRect();
    const elementer = document.querySelectorAll('.hinder, .spørsmålsblokk');
    let kanFlytte = true;

    elementer.forEach(element => {
        const elementRect = element.getBoundingClientRect();
        if (
            (nyPosisjon < elementRect.right && 
             nyPosisjon + marioRect.width > elementRect.left) &&
            (marioRect.bottom > elementRect.top &&
             marioRect.top < elementRect.bottom)
        ) {
            kanFlytte = false;
        }
    });

    if (kanFlytte) {
        posisjon = nyPosisjon;
        mario.style.left = posisjon + 'px';
    }

    // Oppdater vertikal posisjon
    hoppFart += gravitasjon;
    let nyVertikalPosisjon = parseInt(mario.style.bottom) - hoppFart;

    if (nyVertikalPosisjon <= 50) {
        nyVertikalPosisjon = 50;
        påBakken = true;
        hoppFart = 0;
    } else {
        påBakken = false;
    }

    mario.style.bottom = nyVertikalPosisjon + 'px';
}

function flyttHindreOgBlokker() {
    const elementer = document.querySelectorAll('.hinder, .spørsmålsblokk');
    elementer.forEach(element => {
        let elementPosisjon = parseInt(element.style.right);
        elementPosisjon -= 2;
        if (elementPosisjon < -50) {
            if (element.classList.contains('spørsmålsblokk')) {
                element.remove();
            } else {
                elementPosisjon = 800;
            }
        }
        element.style.right = elementPosisjon + 'px';
    });

    // Legg til nye spørsmålsblokker
    if (Math.random() < 0.01 && document.querySelectorAll('.spørsmålsblokk').length < 3) {
        leggTilSpørsmålsblokk();
    }
}

function leggTilSpørsmålsblokk() {
    const nyBlokk = document.createElement('div');
    nyBlokk.className = 'spørsmålsblokk';
    nyBlokk.style.right = '800px';
    
    let gyldigPosisjon = false;
    let forsøk = 0;
    const maksForøk = 10;

    while (!gyldigPosisjon && forsøk < maksForøk) {
        let nyPosisjon = Math.floor(Math.random() * 3) * 50 + 100;
        nyBlokk.style.bottom = `${nyPosisjon}px`;
        
        gyldigPosisjon = true;
        const elementer = document.querySelectorAll('.hinder, .spørsmålsblokk');
        elementer.forEach(element => {
            const elementRect = element.getBoundingClientRect();
            const nyBlokkRect = nyBlokk.getBoundingClientRect();
            
            if (
                Math.abs(parseInt(element.style.right) - 800) < 100 &&
                Math.abs(parseInt(element.style.bottom) - nyPosisjon) < 50
            ) {
                gyldigPosisjon = false;
            }
        });
        
        forsøk++;
    }

    if (gyldigPosisjon) {
        spill.appendChild(nyBlokk);
    }
}

function sjekkKollisjon() {
    const marioRect = mario.getBoundingClientRect();
    const spillRect = spill.getBoundingClientRect();

    const elementer = document.querySelectorAll('.hinder, .spørsmålsblokk');
    elementer.forEach(element => {
        const elementRect = element.getBoundingClientRect();
        
        if (
            marioRect.right > elementRect.left &&
            marioRect.left < elementRect.right &&
            marioRect.bottom > elementRect.top &&
            marioRect.top < elementRect.bottom
        ) {
            if (element.classList.contains('hinder')) {
                if (marioRect.bottom <= elementRect.top + 10 && hoppFart > 0) {
                    påBakken = true;
                    hoppFart = 0;
                    mario.style.bottom = (elementRect.top - marioRect.height + 1) + 'px';
                } else {
                    mistetLiv();
                }
            } else if (element.classList.contains('spørsmålsblokk')) {
                if (marioRect.top < elementRect.bottom && marioRect.top > elementRect.bottom - 10 && hoppFart < 0) {
                    hoppFart = 0;
                    liv += 2;
                    oppdaterLivTeller();
                    element.remove();
                } else {
                    // Forhindre Mario fra å gå gjennom spørsmålsblokker
                    if (marioRect.right > elementRect.left && marioRect.right < elementRect.right) {
                        mario.style.left = (elementRect.left - marioRect.width) + 'px';
                    } else if (marioRect.left < elementRect.right && marioRect.left > elementRect.left) {
                        mario.style.left = elementRect.right + 'px';
                    }
                    if (marioRect.bottom > elementRect.top && hoppFart > 0) {
                        mario.style.bottom = (elementRect.top - marioRect.height) + 'px';
                        påBakken = true;
                        hoppFart = 0;
                    }
                }
            }
        }
    });

    if (marioRect.right > spillRect.right || marioRect.left < spillRect.left) {
        mistetLiv();
    }
}

function mistetLiv() {
    liv--;
    oppdaterLivTeller();
    if (liv <= 0) {
        avsluttSpill('Spill over! Du har mistet alle livene dine.');
    } else {
        posisjon = 400;
        mario.style.left = posisjon + 'px';
        mario.style.bottom = '50px';
        hoppFart = 0;
        påBakken = true;
    }
}

function oppdaterLivTeller() {
    livTeller.textContent = `Liv: ${liv}`;
}

function avsluttSpill(melding) {
    spillSlutt = true;
    alert(melding);
    startPåNyttKnapp.style.display = 'block';
}

function startPåNytt() {
    spillSlutt = false;
    posisjon = 400;
    mario.style.left = posisjon + 'px';
    mario.style.bottom = '50px';
    hoppFart = 0;
    påBakken = true;
    bevegerHøyre = false;
    bevegerVenstre = false;
    liv = 3;
    oppdaterLivTeller();
    
    // Fjern alle eksisterende spørsmålsblokker
    document.querySelectorAll('.spørsmålsblokk').forEach(blokk => blokk.remove());
    
    // Tilbakestill hindre
    hindre.forEach((hinder, index) => {
        hinder.style.right = `${(index + 1) * 200}px`;
    });
    
    // Legg til noen nye spørsmålsblokker
    for (let i = 0; i < 2; i++) {
        leggTilSpørsmålsblokk();
    }
    
    startPåNyttKnapp.style.display = 'none';
    requestAnimationFrame(spillLoop);
}

startPåNyttKnapp.addEventListener('click', startPåNytt);

function spillLoop() {
    if (!spillSlutt) {
        oppdaterMario();
        flyttHindreOgBlokker();
        sjekkKollisjon();
        requestAnimationFrame(spillLoop);
    }
}

spillLoop();