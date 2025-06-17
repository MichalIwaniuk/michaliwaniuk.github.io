const svg = document.getElementById('siec-svg');
const kontenerNN = document.getElementById('kontener-nn');
const przyciskStart = document.getElementById('przycisk-start');

const warstwy = [
  { id: 'wejscie', liczbaNeuronow: 3, x: 80 },
  { id: 'ukryta1', liczbaNeuronow: 4, x: 280 },
  { id: 'ukryta2', liczbaNeuronow: 3, x: 480 },
  { id: 'wyjscie', liczbaNeuronow: 2, x: 680 }
];

const promienNeuronu = 20;
const odstepYNeuronu = 60;
let neuronySieci;

function stworzSiec() {
  svg.innerHTML = '';
  const neurony = {};

  warstwy.forEach(warstwa => {
    neurony[warstwa.id] = [];
    const startY = (svg.clientHeight - (warstwa.liczbaNeuronow - 1) * odstepYNeuronu) / 2;

    for (let i = 0; i < warstwa.liczbaNeuronow; i++) {
      const cy = startY + i * odstepYNeuronu;
      const kolo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      kolo.setAttribute('cx', warstwa.x);
      kolo.setAttribute('cy', cy);
      kolo.setAttribute('r', promienNeuronu);
      kolo.classList.add('neuron', 'fade-in');
      kolo.id = `${warstwa.id}-${i}`;
      svg.appendChild(kolo);
      neurony[warstwa.id].push({ element: kolo, x: warstwa.x, y: cy });
    }
  });

  for (let i = 0; i < warstwy.length - 1; i++) {
    const aktualna = warstwy[i];
    const nastepna = warstwy[i + 1];

    neurony[aktualna.id].forEach(neuronZ => {
      neurony[nastepna.id].forEach(neuronD => {
        const linia = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linia.setAttribute('x1', neuronZ.x + promienNeuronu);
        linia.setAttribute('y1', neuronZ.y);
        linia.setAttribute('x2', neuronD.x - promienNeuronu);
        linia.setAttribute('y2', neuronD.y);
        linia.classList.add('polaczenie');
        svg.prepend(linia);
      });
    });
  }

  return neurony;
}

function aktywujNeuron(elementNeuronu) {
  elementNeuronu.classList.add('aktywny');
  setTimeout(() => elementNeuronu.classList.remove('aktywny'), 300);
}

function animujWarstwy() {
  const sekwencja = ['wejscie', 'ukryta1', 'ukryta2', 'wyjscie'];
  let index = 0;

  function aktywujKolejna() {
    if (index >= sekwencja.length) {
      przyciskStart.disabled = false;
      return;
    }

    const warstwa = neuronySieci[sekwencja[index]];
    warstwa.forEach(n => aktywujNeuron(n.element));
    index++;
    setTimeout(aktywujKolejna, 600); 
  }

  przyciskStart.disabled = true;
  aktywujKolejna();
}

neuronySieci = stworzSiec();

przyciskStart.addEventListener('click', animujWarstwy);