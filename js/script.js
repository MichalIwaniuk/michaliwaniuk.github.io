const svg = document.getElementById('siec-svg');
const kontenerNN = document.getElementById('kontener-nn');
const przyciskStart = document.getElementById('przycisk-start');

// Definicja struktury sieci (teraz z 4 warstwami)
const warstwy = [
    { id: 'wejscie', liczbaNeuronow: 3, x: 80 },
    { id: 'ukryta1', liczbaNeuronow: 4, x: 280 },
    { id: 'ukryta2', liczbaNeuronow: 3, x: 480 },
    { id: 'wyjscie', liczbaNeuronow: 2, x: 680 }
];

const promienNeuronu = 20;
const odstepYNeuronu = 60;

let kropkiDanych = []; // Tablica do przechowywania obiektów kropek danych
const predkoscKropki = 0.003; // Prędkość animacji kropek (jednostka: % odległości na milisekundę)
const rozmiarKropki = 8;

let neuronySieci; // Zmienna globalna na referencje do neuronów

// Funkcja do tworzenia neuronów i połączeń
function stworzSiec() {
    // Czyszczenie SVG
    svg.innerHTML = '';

    const neurony = {}; // Obiekt do przechowywania referencji do elementów neuronów

    // Rysowanie neuronów
    warstwy.forEach(warstwa => {
        neurony[warstwa.id] = [];
        const startY = (svg.clientHeight - (warstwa.liczbaNeuronow - 1) * odstepYNeuronu) / 2;
        for (let i = 0; i < warstwa.liczbaNeuronow; i++) {
            const cy = startY + i * odstepYNeuronu;
            const kolo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            kolo.setAttribute('cx', warstwa.x);
            kolo.setAttribute('cy', cy);
            kolo.setAttribute('r', promienNeuronu);
            kolo.classList.add('neuron');
            kolo.id = `${warstwa.id}-${i}`; // Ustaw unikalny ID
            svg.appendChild(kolo);
            neurony[warstwa.id].push({ element: kolo, x: warstwa.x, y: cy });
        }
    });

    // Rysowanie połączeń
    for (let i = 0; i < warstwy.length - 1; i++) {
        const aktualnaWarstwa = warstwy[i];
        const nastepnaWarstwa = warstwy[i + 1];

        neurony[aktualnaWarstwa.id].forEach(neuronZrodlowy => {
            neurony[nastepnaWarstwa.id].forEach(neuronDocelowy => {
                const linia = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                linia.setAttribute('x1', neuronZrodlowy.x + promienNeuronu);
                linia.setAttribute('y1', neuronZrodlowy.y);
                linia.setAttribute('x2', neuronDocelowy.x - promienNeuronu);
                linia.setAttribute('y2', neuronDocelowy.y);
                linia.classList.add('polaczenie');
                svg.prepend(linia); // Dodaj połączenia na początku, aby były pod neuronami
            });
        });
    }
    return neurony; // Zwróć neurony z ich pozycjami i elementami
}

// Inicjalizacja sieci
neuronySieci = stworzSiec();

// Funkcja do aktywacji neuronów
function aktywujNeuron(elementNeuronu) {
    elementNeuronu.classList.add('aktywny');
    setTimeout(() => {
        elementNeuronu.classList.remove('aktywny');
    }, 300); // Czas trwania aktywacji
}

// Klasa do reprezentowania pojedynczej kropki danych
class KropkaDanych {
    constructor(startX, startY, endX, endY, elementNeuronuDocelowego) {
        this.element = document.createElement('div');
        this.element.classList.add('kropka-danych');
        this.element.style.width = `${rozmiarKropki}px`;
        this.element.style.height = `${rozmiarKropki}px`;
        kontenerNN.appendChild(this.element);

        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.postep = 0; // Postęp od 0 do 1
        this.elementNeuronuDocelowego = elementNeuronuDocelowego;

        // Ustaw początkową pozycję kropki względem kontenera #kontener-nn
        const prostokatKontenera = kontenerNN.getBoundingClientRect();
        const prostokatSVG = svg.getBoundingClientRect();

        // Obliczanie offsetu SVG wewnątrz kontenera
        this.przesuniecieX = prostokatSVG.left - prostokatKontenera.left;
        this.przesuniecieY = prostokatSVG.top - prostokatKontenera.top;

        this.aktualizujPozycje();
    }

    aktualizujPozycje() {
        // Obliczanie pozycji x i y na podstawie postępu
        const aktualneX = this.startX + (this.endX - this.startX) * this.postep;
        const aktualneY = this.startY + (this.endY - this.startY) * this.postep;

        // Ustawianie pozycji elementu div (CSS top/left)
        // Dodajemy offset SVG, ponieważ kropki są w kontenerze, a nie w SVG
        this.element.style.left = `${this.przesuniecieX + aktualneX - rozmiarKropki / 2}px`;
        this.element.style.top = `${this.przesuniecieY + aktualneY - rozmiarKropki / 2}px`;
    }

    aktualizuj(rozrzutCzasu) {
        this.postep += predkoscKropki * rozrzutCzasu;

        if (this.postep >= 1) {
            this.postep = 1;
            // Kropka dotarła do celu
            aktywujNeuron(this.elementNeuronuDocelowego);
            this.element.remove(); // Usuń element DOM kropki
            return true; // Zasygnalizuj, że kropka powinna zostać usunięta
        }
        this.aktualizujPozycje();
        return false; // Kropka wciąż się porusza
    }
}

let ostatniZnacznikCzasu = 0;
let numerFazy = 0; // 0: wejście->ukryta1, 1: ukryta1->ukryta2, 2: ukryta2->wyjście

function animujPrzeplywDanych(znacznikCzasu) {
    if (!ostatniZnacznikCzasu) ostatniZnacznikCzasu = znacznikCzasu;
    const rozrzutCzasu = znacznikCzasu - ostatniZnacznikCzasu;
    ostatniZnacznikCzasu = znacznikCzasu;

    // Filtruj i usuwaj kropki, które dotarły do celu
    kropkiDanych = kropkiDanych.filter(kropka => !kropka.aktualizuj(rozrzutCzasu));

    if (kropkiDanych.length > 0) {
        requestAnimationFrame(animujPrzeplywDanych);
    } else {
        // Gdy wszystkie kropki z bieżącej fazy dotrą, przejdź do następnej fazy
        numerFazy++;
        if (numerFazy === 1) { // Po wejściu->ukryta1, wyślij do ukryta2
            setTimeout(() => {
                neuronySieci.ukryta1.forEach(neuronUkryty1 => {
                    neuronySieci.ukryta2.forEach(neuronUkryty2 => {
                        kropkiDanych.push(new KropkaDanych(neuronUkryty1.x + promienNeuronu, neuronUkryty1.y, neuronUkryty2.x - promienNeuronu, neuronUkryty2.y, neuronUkryty2.element));
                    });
                });
                ostatniZnacznikCzasu = 0;
                requestAnimationFrame(animujPrzeplywDanych);
            }, 500); // Krótkie opóźnienie między fazami
        } else if (numerFazy === 2) { // Po ukryta1->ukryta2, wyślij do wyjścia
                setTimeout(() => {
                neuronySieci.ukryta2.forEach(neuronUkryty2 => {
                    neuronySieci.wyjscie.forEach(neuronWyjsciowy => {
                        kropkiDanych.push(new KropkaDanych(neuronUkryty2.x + promienNeuronu, neuronUkryty2.y, neuronWyjsciowy.x - promienNeuronu, neuronWyjsciowy.y, neuronWyjsciowy.element));
                    });
                });
                ostatniZnacznikCzasu = 0;
                requestAnimationFrame(animujPrzeplywDanych);
            }, 500); // Krótkie opóźnienie między fazami
        } else {
            console.log("Animacja zakończona.");
            przyciskStart.disabled = false; // Ponownie włącz przycisk
            numerFazy = 0; // Resetuj fazę dla kolejnego uruchomienia
        }
    }
}

przyciskStart.addEventListener('click', () => {
    // Usuń istniejące kropki danych, jeśli są
    kropkiDanych.forEach(kropka => kropka.element.remove());
    kropkiDanych = [];
    numerFazy = 0; // Zawsze zaczynaj od pierwszej fazy

    // Twórz nowe kropki danych dla każdego wejścia do pierwszej warstwy ukrytej
    neuronySieci.wejscie.forEach(neuronWejsciowy => {
        neuronySieci.ukryta1.forEach(neuronUkryty1 => {
            kropkiDanych.push(new KropkaDanych(neuronWejsciowy.x + promienNeuronu, neuronWejsciowy.y, neuronUkryty1.x - promienNeuronu, neuronUkryty1.y, neuronUkryty1.element));
        });
    });

    przyciskStart.disabled = true; // Wyłącz przycisk podczas animacji
    ostatniZnacznikCzasu = 0; // Resetuj timestamp
    requestAnimationFrame(animujPrzeplywDanych); // Rozpocznij animację
});
