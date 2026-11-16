const display = document.getElementById('display');
const historyEl = document.getElementById('history');
let expr = '';

const show = () => display.value = expr || '0';

function evaluate(s){
  // Only allow digits, operators, parentheses, dots and our function names
  if (!/^[0-9+\-*/^().%\sa-z]*$/i.test(s)) throw new Error('Invalid');
  let js = s
    .replace(/\^/g, '**')
    .replace(/(\d+(\.\d+)?)%/g, '($1/100)')
    .replace(/\bsqrt\(/g, 'Math.sqrt(')
    .replace(/\bsin\(/g, 'sinD(')
    .replace(/\bcos\(/g, 'cosD(')
    .replace(/\btan\(/g, 'tanD(')
    .replace(/\blog\(/g, 'Math.log10(')
    .replace(/\bln\(/g, 'Math.log(');
  const rad = d => d * Math.PI / 180;
  const sinD = x => Math.sin(rad(x)), cosD = x => Math.cos(rad(x)), tanD = x => Math.tan(rad(x));
  // Reject any leftover identifiers other than allowed ones
  const leftovers = js.replace(/Math\.(sqrt|log10|log)|sinD|cosD|tanD/g, '').match(/[a-z]+/i);
  if (leftovers) throw new Error('Invalid');
  const result = new Function('sinD', 'cosD', 'tanD', 'return (' + js + ')')(sinD, cosD, tanD);
  if (!isFinite(result)) throw new Error('Math error');
  return Math.round(result * 1e10) / 1e10;
}

function calculate(){
  if (!expr) return;
  try {
    const r = evaluate(expr);
    historyEl.textContent = expr + ' =';
    expr = String(r);
  } catch {
    historyEl.textContent = '';
    expr = '';
    display.value = 'Error';
    return;
  }
  show();
}

document.querySelector('.keys').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.v) expr += b.dataset.v;
  else if (b.dataset.fn) expr += b.dataset.fn + '(';
  else if (b.dataset.act === 'clear') { expr = ''; historyEl.textContent = ''; }
  else if (b.dataset.act === 'back') expr = expr.replace(/(sqrt\(|sin\(|cos\(|tan\(|log\(|ln\(|.)$/, '');
  else if (b.dataset.act === 'eq') return calculate();
  show();
});

document.addEventListener('keydown', e => {
  if (/^[0-9+\-*/().%^]$/.test(e.key)) { expr += e.key; show(); }
  else if (e.key === 'Enter') { e.preventDefault(); calculate(); }
  else if (e.key === 'Backspace') { expr = expr.slice(0, -1); show(); }
  else if (e.key === 'Escape') { expr = ''; show(); }
});