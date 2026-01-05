// Simple calculator logic
(() => {
  const displayEl = document.getElementById('display');
  const keys = document.querySelectorAll('.btn');

  let current = '0'; // shown value
  let lastResult = null;
  let justCalculated = false;

  function updateDisplay() {
    displayEl.textContent = current;
  }

  function appendDigit(d) {
    if (justCalculated) {
      // start new expression after a calculation when pressing a digit
      current = d === '.' ? '0.' : d;
      justCalculated = false;
      return;
    }

    if (d === '.') {
      if (current === '' || /[+\-*/%]$/.test(current)) {
        current += '0.';
      } else if (!current.includes('.') || /[+\-*/%]$/.test(current)) {
        // allow decimal in current number
        // if last token contains dot, ignore
        const tokens = current.split(/([+\-*/%])/);
        const last = tokens[tokens.length - 1];
        if (!last.includes('.')) current += '.';
      }
      return;
    }

    // if last action was operator and user types digit, just append
    if (current === '0') {
      current = d;
    } else {
      current += d;
    }
  }

  function appendOperator(op) {
    if (justCalculated) {
      // continue from last result
      current = String(lastResult);
      justCalculated = false;
    }
    // don't allow two operators in a row
    if (/[+\-*/%]$/.test(current)) {
      current = current.slice(0, -1) + op;
    } else {
      current += op;
    }
  }

  function clearAll() {
    current = '0';
    lastResult = null;
    justCalculated = false;
  }

  function backspace() {
    if (justCalculated) {
      clearAll();
      return;
    }
    if (current.length <= 1) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
  }

  function percent() {
    try {
      const value = evaluateExpression(current);
      const result = value / 100;
      current = String(result);
      lastResult = result;
      justCalculated = true;
    } catch (e) {
      current = 'Error';
    }
  }

  function calculate() {
    try {
      const result = evaluateExpression(current);
      current = String(result);
      lastResult = result;
      justCalculated = true;
    } catch (e) {
      current = 'Error';
    }
  }

  // Very small evaluator: converts ÷/× symbols to / and * and uses Function for evaluation.
  // It's OK for simple demos but not recommended for untrusted input in production.
  function evaluateExpression(expr) {
    if (expr.trim() === '') return 0;
    // Replace visual symbols, and guard leading operators
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/—/g, '-');
    // Remove trailing operator if present
    expr = expr.replace(/[+\-*/%\.]+$/g, '');
    // Replace percent tokens: '50%' -> '(50/100)'
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    // Eval using Function to avoid direct eval (still executes expressions)
    // This is fine for this local demo; do NOT use with arbitrary remote input.
    // Also limit characters to digits, operators, parentheses and dots to reduce risk.
    if (!/^[0-9+\-*/().% ]+$/.test(expr)) throw new Error('Invalid characters');
    // Evaluate
    // eslint-disable-next-line no-new-func
    const fn = new Function('return ' + expr);
    const res = fn();
    if (!isFinite(res)) throw new Error('Math error');
    // Round small floating point errors
    return Math.round((res + Number.EPSILON) * 1e12) / 1e12;
  }

  keys.forEach((k) => {
    k.addEventListener('click', () => {
      const v = k.getAttribute('data-value');
      const action = k.getAttribute('data-action');

      if (action === 'clear') {
        clearAll();
        updateDisplay();
        return;
      }
      if (action === 'backspace') {
        backspace();
        updateDisplay();
        return;
      }
      if (action === 'calculate') {
        calculate();
        updateDisplay();
        return;
      }
      if (action === 'percent') {
        percent();
        updateDisplay();
        return;
      }

      if (v) {
        if (/[0-9.]/.test(v)) {
          appendDigit(v);
        } else if (/[+\-*/]/.test(v)) {
          appendOperator(v);
        }
        // Remove leading zeros like "00" -> "0"
        if (!/[+\-*/%]/.test(current) && /^0[0-9]/.test(current)) {
          current = current.replace(/^0+/, '');
          if (current === '') current = '0';
        }
        updateDisplay();
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      e.preventDefault();
      appendDigit(e.key);
      updateDisplay();
      return;
    }
    if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      calculate();
      updateDisplay();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      backspace();
      updateDisplay();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      clearAll();
      updateDisplay();
      return;
    }
    if (['+', '-', '*', '/'].includes(e.key)) {
      e.preventDefault();
      appendOperator(e.key);
      updateDisplay();
      return;
    }
    if (e.key === '%') {
      e.preventDefault();
      percent();
      updateDisplay();
      return;
    }
  });

  // initial render
  updateDisplay();
})();