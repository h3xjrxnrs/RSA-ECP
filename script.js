// Допоміжні функції
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function modInverse(e, phi) {
  let [m0, x0, x1] = [phi, 0, 1];
  while (e > 1) {
    let q = Math.floor(e / phi);
    [e, phi] = [phi, e % phi];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0 ? x1 + m0 : x1;
}

function modExp(base, exp, mod) {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  mod = BigInt(mod);
  while (exp > 0) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

let n, e, d;

// Генерація ключів
document.getElementById("genKeys").onclick = () => {
  const p = parseInt(document.getElementById("p").value);
  const q = parseInt(document.getElementById("q").value);
  e = parseInt(document.getElementById("e").value);

  if (!p || !q || !e) {
    alert("Будь ласка, введіть p, q і e!");
    return;
  }

  const nVal = p * q;
  const phi = (p - 1) * (q - 1);
  if (gcd(e, phi) !== 1) {
    alert("e та φ(n) повинні бути взаємно простими!");
    return;
  }

  d = modInverse(e, phi);
  n = nVal;

  document.getElementById("keysOutput").innerHTML = `
    <p>Модуль n = <strong>${n}</strong></p>
    <p>Функція Ейлера φ(n) = <strong>${phi}</strong></p>
    <p>Закритий ключ d = <strong>${d}</strong></p>
    <p>Відкритий ключ (e,n) = (<strong>${e}, ${n}</strong>)</p>
  `;
};

// Підпис
let lastSignature = null;
let lastMessage = null;

document.getElementById("signBtn").onclick = () => {
  const M = document.getElementById("message").value.trim();
  if (!M) {
    alert("Введіть повідомлення!");
    return;
  }
  if (!d || !n) {
    alert("Спочатку згенеруйте ключі!");
    return;
  }

  const hash = BigInt([...M].reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const S = modExp(hash, d, n);

  lastSignature = S;
  lastMessage = M;

  document.getElementById("signOutput").innerHTML = `
    <p>Хеш повідомлення H(M) = <strong>${hash}</strong></p>
    <p>Підпис S = (H(M))^d mod n = <strong>${S}</strong></p>
    <p>Передаємо (<strong>M, S, e, n</strong>)</p>
  `;
};

// Перевірка підпису
document.getElementById("verifyBtn").onclick = () => {
  const S = BigInt(document.getElementById("verifyS").value);
  const M = document.getElementById("verifyM").value.trim();

  if (!S || !M) {
    alert("Введіть і повідомлення, і підпис!");
    return;
  }

  const hashM = BigInt([...M].reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const hashRecovered = modExp(S, e, n);

  const valid = hashM === hashRecovered;
  document.getElementById("verifyOutput").innerHTML = valid
    ? `<p style="color:lightgreen;">✅ Підпис дійсний! Повідомлення не змінене.</p>`
    : `<p style="color:salmon;">❌ Підпис недійсний або повідомлення підроблене!</p>`;
};

// Перевірка підробки
document.getElementById("fakeCheck").onclick = () => {
  const fakeM = document.getElementById("fakeM").value.trim();
  if (!fakeM || !lastSignature) {
    alert("Спочатку підпишіть оригінальне повідомлення!");
    return;
  }

  const fakeHash = BigInt([...fakeM].reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const recovered = modExp(lastSignature, e, n);

  const fake = fakeHash !== recovered;
  document.getElementById("fakeOutput").innerHTML = fake
    ? `<p style="color:salmon;">🚨 Підробка виявлена! Підпис не відповідає цьому повідомленню.</p>`
    : `<p style="color:lightgreen;">✅ Повідомлення випадково збіглося (дуже малоймовірно).</p>`;
};
