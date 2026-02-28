// ========================
// UTILITIES
// ========================
const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function charToNum(c) { return c.toUpperCase().charCodeAt(0) - 65; }
function numToChar(n) { return alpha[((n % 26) + 26) % 26]; }

function textToNums(text) {
  return text.toUpperCase().split('').filter(c => /[A-Z]/.test(c)).map(charToNum);
}

function numsToText(nums) { return nums.map(numToChar).join(''); }

function mod(n, m) { return ((n % m) + m) % m; }

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function modInverse(a, m) {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return -1;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

function bigModPow(base, exp, mod) {
  base = BigInt(base); exp = BigInt(exp); mod = BigInt(mod);
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

function setResult(id, text, isError = false) {
  const area = document.getElementById(id);
  area.classList.toggle('error', isError);
  const val = area.querySelector('.value');
  if (val) { val.textContent = text; return; }
  const textEl = document.getElementById(id.replace('-result', '-text'));
  if (textEl) textEl.textContent = text;
}

// ========================
// ALPHABET TABLE
// ========================
(function() {
  const table = document.getElementById('alpha-table');
  for (let i = 0; i < 26; i++) {
    const cell = document.createElement('div');
    cell.className = 'alpha-cell';
    cell.innerHTML = `<span class="letter">${alpha[i]}</span><span class="num">${String(i).padStart(2,'0')}</span>`;
    table.appendChild(cell);
  }
})();

// ========================
// CAESAR CIPHER (k=3)
// ========================
function caesarOp(mode) {
  const input = document.getElementById('caesar-input').value.trim();
  if (!input) return setResult('caesar-result', 'Please enter some text.', true);
  const nums = textToNums(input);
  const result = nums.map(n => mode === 'enc' ? mod(n + 3, 26) : mod(n - 3, 26));
  setResult('caesar-result', numsToText(result));
}

// ========================
// GENERAL SHIFT CIPHER
// ========================
function shiftOp(mode) {
  const input = document.getElementById('shift-input').value.trim();
  const k = parseInt(document.getElementById('shift-key').value);
  if (!input) return setResult('shift-result', 'Please enter text.', true);
  if (isNaN(k)) return setResult('shift-result', 'Please enter a valid key.', true);
  const nums = textToNums(input);
  const result = nums.map(n => mode === 'enc' ? mod(n + k, 26) : mod(n - k, 26));
  document.getElementById('shift-brute').style.display = 'none';
  setResult('shift-result', numsToText(result));
}

function shiftBrute() {
  const input = document.getElementById('shift-input').value.trim();
  if (!input) return setResult('shift-result', 'Please enter text to brute force.', true);
  const nums = textToNums(input);
  const container = document.getElementById('shift-brute');
  container.style.display = 'flex';
  container.innerHTML = '';
  for (let k = 0; k < 26; k++) {
    const plain = numsToText(nums.map(n => mod(n - k, 26)));
    const item = document.createElement('div');
    item.className = 'brute-item';
    item.innerHTML = `<span class="k">k = ${String(k).padStart(2,'0')}</span><span class="plain">${plain}</span>`;
    item.onclick = () => {
      document.getElementById('shift-key').value = k;
      setResult('shift-result', plain);
      container.style.display = 'none';
    };
    container.appendChild(item);
  }
}

// ========================
// AFFINE CIPHER
// ========================
const validA = [1,3,5,7,9,11,15,17,19,21,23,25];

function affineOp(mode) {
  const input = document.getElementById('affine-input').value.trim();
  const a = parseInt(document.getElementById('affine-a').value);
  const b = parseInt(document.getElementById('affine-b').value);
  if (!input) return setResult('affine-result', 'Please enter text.', true);
  if (!validA.includes(a)) return setResult('affine-result', `a must be coprime with 26. Valid: ${validA.join(', ')}`, true);
  if (isNaN(b)) return setResult('affine-result', 'Please enter key b.', true);
  const nums = textToNums(input);
  let result;
  if (mode === 'enc') {
    result = nums.map(n => mod(a * n + b, 26));
  } else {
    const aInv = modInverse(a, 26);
    result = nums.map(n => mod(aInv * (n - b), 26));
  }
  document.getElementById('affine-brute').style.display = 'none';
  setResult('affine-result', numsToText(result));
}

function affineBrute() {
  const input = document.getElementById('affine-input').value.trim();
  if (!input) return setResult('affine-result', 'Please enter text to brute force.', true);
  const nums = textToNums(input);
  const container = document.getElementById('affine-brute');
  container.style.display = 'flex';
  container.innerHTML = '';
  validA.forEach(a => {
    const aInv = modInverse(a, 26);
    for (let b = 0; b < 26; b++) {
      const plain = numsToText(nums.map(n => mod(aInv * (n - b), 26)));
      const item = document.createElement('div');
      item.className = 'brute-item';
      item.innerHTML = `<span class="k">a=${a}, b=${b}</span><span class="plain">${plain}</span>`;
      item.onclick = () => {
        document.getElementById('affine-a').value = a;
        document.getElementById('affine-b').value = b;
        setResult('affine-result', plain);
        container.style.display = 'none';
      };
      container.appendChild(item);
    }
  });
}

// ========================
// TRANSPOSITION CIPHER
// ========================
function transOp(mode) {
  const input = document.getElementById('trans-input').value.trim().toUpperCase().replace(/[^A-Z]/g, '');
  const key = document.getElementById('trans-key').value.trim().toUpperCase().replace(/[^A-Z]/g, '');
  if (!input) return setResult('trans-result', 'Please enter text.', true);
  if (!key || key.length < 2) return setResult('trans-result', 'Please enter a valid key (2+ letters).', true);

  const numCols = key.length;
  const order = key.split('').map((c, i) => [c, i]).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).map(x => x[1]);

  let result = '';

  if (mode === 'enc') {
    const padded = input + 'X'.repeat((numCols - input.length % numCols) % numCols);
    const numRows = padded.length / numCols;
    const grid = [];
    for (let r = 0; r < numRows; r++) {
      grid.push(padded.slice(r * numCols, (r + 1) * numCols).split(''));
    }
    result = order.map(col => grid.map(row => row[col]).join('')).join('');

    // Show grid
    showTransGrid(grid, key, order, 'enc');
  } else {
    const numRows = Math.ceil(input.length / numCols);
    const colLens = Array(numCols).fill(numRows);
    const extra = numCols * numRows - input.length;
    for (let i = numCols - extra; i < numCols; i++) colLens[order[i]] -= 1; // Hmm, let's do simpler
    
    // Simple: assume all columns equal length
    const cols = {};
    let pos = 0;
    order.forEach(col => {
      cols[col] = input.slice(pos, pos + numRows).split('');
      pos += numRows;
    });
    const grid = [];
    for (let r = 0; r < numRows; r++) {
      const row = [];
      for (let c = 0; c < numCols; c++) {
        row.push(cols[c] ? cols[c][r] || '' : '');
      }
      grid.push(row);
    }
    result = grid.map(row => row.join('')).join('').replace(/X+$/, '');

    showTransGrid(grid, key, order, 'dec');
  }

  setResult('trans-result', result);
}

function showTransGrid(grid, key, order, mode) {
  const container = document.getElementById('trans-grid');
  container.style.display = 'block';
  container.innerHTML = '';

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'trans-row';
  key.split('').forEach((k, i) => {
    const cell = document.createElement('div');
    cell.className = 'trans-cell header';
    const rank = order.indexOf(i);
    cell.title = `Col order: ${rank + 1}`;
    cell.textContent = k;
    headerRow.appendChild(cell);
  });
  container.appendChild(headerRow);

  // Data rows
  grid.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'trans-row';
    row.forEach(ch => {
      const cell = document.createElement('div');
      cell.className = 'trans-cell';
      cell.textContent = ch || '·';
      rowEl.appendChild(cell);
    });
    container.appendChild(rowEl);
  });
}

// ========================
// RSA
// ========================
let rsaKeys = {};

function extGcd(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x, y] = extGcd(b, a % b);
  return [g, y, x - Math.floor(a / b) * y];
}

function modInverseExt(a, m) {
  const [g, x] = extGcd(a, m);
  if (g !== 1) return -1;
  return ((x % m) + m) % m;
}

function rsaKeygen() {
  const p = parseInt(document.getElementById('rsa-p').value);
  const q = parseInt(document.getElementById('rsa-q').value);
  const resultEl = document.getElementById('rsa-key-text');

  if (!isPrime(p) || !isPrime(q)) {
    resultEl.parentElement.classList.add('error');
    resultEl.textContent = 'p and q must both be prime numbers.';
    return;
  }
  if (p === q) {
    resultEl.parentElement.classList.add('error');
    resultEl.textContent = 'p and q must be distinct.';
    return;
  }

  const n = p * q;
  const phi = (p - 1) * (q - 1);

  // Find e
  let e = 2;
  while (e < phi && gcd(e, phi) !== 1) e++;

  const d = modInverseExt(e, phi);

  rsaKeys = { n, e, d, phi };
  resultEl.parentElement.classList.remove('error');
  resultEl.innerHTML = `n = ${n}<br>φ(n) = ${phi}<br>e (public) = ${e}<br>d (private) = ${d}`;

  // Auto-fill fields
  document.getElementById('rsa-enc-e').value = e;
  document.getElementById('rsa-enc-n').value = n;
  document.getElementById('rsa-dec-d').value = d;
  document.getElementById('rsa-dec-n').value = n;
}

function rsaEnc() {
  const m = parseInt(document.getElementById('rsa-enc-m').value);
  const e = parseInt(document.getElementById('rsa-enc-e').value);
  const n = parseInt(document.getElementById('rsa-enc-n').value);
  if (isNaN(m) || isNaN(e) || isNaN(n)) return;
  if (m >= n) { document.getElementById('rsa-enc-text').textContent = 'Error: M must be < n'; return; }
  const c = bigModPow(m, e, n);
  document.getElementById('rsa-enc-text').textContent = c.toString();
  document.getElementById('rsa-dec-c').value = c.toString();
}

function rsaDec() {
  const c = parseInt(document.getElementById('rsa-dec-c').value);
  const d = parseInt(document.getElementById('rsa-dec-d').value);
  const n = parseInt(document.getElementById('rsa-dec-n').value);
  if (isNaN(c) || isNaN(d) || isNaN(n)) return;
  const m = bigModPow(c, d, n);
  document.getElementById('rsa-dec-text').textContent = m.toString();
}

// ========================
// TEAM SECTION
// ========================
const teamData = [
  { name: 'Member 1', desc: 'Description', photo: '' },
  { name: 'Member 2', desc: 'Description', photo: '' },
  { name: 'Member 3', desc: 'Description', photo: '' },
  { name: 'Member 4', desc: 'Description', photo: '' },
  { name: 'Member 5', desc: 'Description', photo: '' },
  { name: 'Member 6', desc: 'Description', photo: '' },
  { name: 'Member 7', desc: 'Description', photo: '' },
  { name: 'Member 8', desc: 'Description', photo: '' },
];

const avColors = ['#7b5cff','#ff5c8a','#00e5c0','#ffd166','#4ecdc4','#a78bfa','#f97316','#ec4899'];

let teamVisible = false;
let editingIdx = -1;

function getInitials(name) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0 || name === 'Member 1' || name.startsWith('Member ')) return '?';
  return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function renderTeam() {
  for (let i = 0; i < 8; i++) {
    const d = teamData[i];
    const initEl = document.getElementById(`init-${i+1}`);
    const nameEl = document.getElementById(`name-${i+1}`);
    const descEl = document.getElementById(`desc-${i+1}`);
    const avatarEl = initEl ? initEl.closest('.member-avatar') : null;

    if (nameEl) nameEl.textContent = d.name;
    if (descEl) descEl.textContent = d.desc;

    if (avatarEl) {
      // Update color
      avatarEl.style.setProperty('--av-color', avColors[i]);
      if (d.photo) {
        avatarEl.innerHTML = `<img src="${d.photo}" alt="${d.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'avatar-initials\\'>${getInitials(d.name)}</span>'">`;
      } else {
        avatarEl.innerHTML = `<span class="avatar-initials" id="init-${i+1}" style="color:${avColors[i]}">${getInitials(d.name)}</span>`;
      }
    }
  }
}

function toggleTeam() {
  const grid = document.getElementById('team-grid');
  const btn = document.getElementById('team-toggle-btn');
  const btnText = document.getElementById('team-btn-text');
  const btnIcon = document.getElementById('team-btn-icon');

  teamVisible = !teamVisible;
  if (teamVisible) {
    grid.style.display = 'block';
    btnText.textContent = 'Hide Team';
    btnIcon.textContent = '✖';
    btn.style.background = 'linear-gradient(135deg, #555, #333)';
    btn.style.boxShadow = 'none';
    renderTeam();
    // Trigger reveal on newly shown cards
    setTimeout(() => {
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 50);
  } else {
    grid.style.display = 'none';
    btnText.textContent = 'Meet Our Team';
    btnIcon.textContent = '👥';
    btn.style.background = 'linear-gradient(135deg, var(--accent2), var(--accent))';
    btn.style.boxShadow = '0 8px 32px rgba(255,92,138,0.3)';
  }
}

function openEdit(idx) {
  editingIdx = idx;
  document.getElementById('edit-name').value = teamData[idx].name.startsWith('Member') ? '' : teamData[idx].name;
  document.getElementById('edit-desc').value = teamData[idx].desc === 'Description' ? '' : teamData[idx].desc;
  document.getElementById('edit-photo').value = teamData[idx].photo || '';
  const modal = document.getElementById('edit-modal');
  modal.style.display = 'flex';
}

function closeEdit() {
  document.getElementById('edit-modal').style.display = 'none';
  editingIdx = -1;
}

function saveEdit() {
  if (editingIdx < 0) return;
  const name = document.getElementById('edit-name').value.trim() || `Member ${editingIdx+1}`;
  const desc = document.getElementById('edit-desc').value.trim() || 'Description';
  const photo = document.getElementById('edit-photo').value.trim();
  teamData[editingIdx] = { name, desc, photo };
  renderTeam();
  closeEdit();
}

// Close modal on backdrop click
document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeEdit();
});

// ========================
// SCROLL REVEAL
// ========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const btn = document.getElementById('scrollTopBtn');

// show button when Scroll down to 200px
window.onscroll = function() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        btn.classList.add("show-btn");
    } else {
        btn.classList.remove("show-btn");
    }
};

// when click button scroll up to the top smooth
btn.onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};
