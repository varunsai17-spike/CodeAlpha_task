const historyDisplay = document.getElementById("historyDisplay");
const currentDisplay = document.getElementById("currentDisplay");
const previewDisplay = document.getElementById("previewDisplay");

let currentInput = "0";
let previousInput = "";
let chosenOperator = null;
let shouldResetScreen = false;

// Format large/decimal numbers cleanly
function formatNumber(numStr) {
  if (numStr === "" || numStr === "-") return numStr;
  const parts = numStr.split(".");
  parts[0] = Number(parts[0]).toLocaleString("en-US");
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
}

// Evaluate arithmetic operations
function calculate(a, b, op) {
  const n1 = parseFloat(a);
  const n2 = parseFloat(b);
  if (isNaN(n1) || isNaN(n2)) return "";

  let res = 0;
  switch (op) {
    case "+":
      res = n1 + n2;
      break;
    case "-":
      res = n1 - n2;
      break;
    case "×":
      res = n1 * n2;
      break;
    case "÷":
      if (n2 === 0) return "Error";
      res = n1 / n2;
      break;
    default:
      return "";
  }
  // Round to avoid IEEE 754 float precision oddities (e.g., 0.1 + 0.2)
  return Math.round((res + Number.EPSILON) * 1e10) / 1e10;
}

// Compute live preview if an operator and valid second number are present
function updateRealTimePreview() {
  if (chosenOperator && previousInput && currentInput && !shouldResetScreen) {
    const result = calculate(previousInput, currentInput, chosenOperator);
    previewDisplay.textContent = result !== "" && result !== "Error" ? `= ${result}` : "";
  } else {
    previewDisplay.textContent = "";
  }
}

function updateDisplay() {
  currentDisplay.textContent = formatNumber(currentInput);
  if (chosenOperator) {
    historyDisplay.textContent = `${formatNumber(previousInput)} ${chosenOperator}`;
  } else {
    historyDisplay.textContent = "";
  }
  updateRealTimePreview();
}

// Number & Decimal Input
function handleNumber(digit) {
  if (shouldResetScreen) {
    currentInput = "";
    shouldResetScreen = false;
  }
  if (digit === "." && currentInput.includes(".")) return;
  if (currentInput === "0" && digit !== ".") {
    currentInput = digit;
  } else {
    currentInput += digit;
  }
  updateDisplay();
}

// Operator Input
function handleOperator(op) {
  if (chosenOperator && !shouldResetScreen) {
    // Continuous evaluation (e.g. 5 + 3 + ...)
    const result = calculate(previousInput, currentInput, chosenOperator);
    if (result === "Error") {
      resetAll("Error");
      return;
    }
    previousInput = String(result);
  } else {
    previousInput = currentInput;
  }
  chosenOperator = op;
  shouldResetScreen = true;
  updateDisplay();
}

// Equals calculation
function handleEquals() {
  if (!chosenOperator || shouldResetScreen) return;
  const result = calculate(previousInput, currentInput, chosenOperator);

  if (result === "Error") {
    resetAll("Error");
    return;
  }

  historyDisplay.textContent = `${formatNumber(previousInput)} ${chosenOperator} ${formatNumber(currentInput)} =`;
  currentInput = String(result);
  chosenOperator = null;
  previewDisplay.textContent = "";
  shouldResetScreen = true;
  currentDisplay.textContent = formatNumber(currentInput);
}

// Clear and backspace actions
function resetAll(overrideText = "0") {
  currentInput = overrideText;
  previousInput = "";
  chosenOperator = null;
  shouldResetScreen = false;
  previewDisplay.textContent = "";
  historyDisplay.textContent = "";
  currentDisplay.textContent = overrideText;
}

function handleDelete() {
  if (shouldResetScreen) return;
  currentInput = currentInput.slice(0, -1);
  if (currentInput === "" || currentInput === "-") {
    currentInput = "0";
  }
  updateDisplay();
}

function handlePercentage() {
  const currentVal = parseFloat(currentInput);
  if (isNaN(currentVal)) return;
  currentInput = String(currentVal / 100);
  updateDisplay();
}

// Click Listeners
document.querySelectorAll("[data-num]").forEach((btn) => {
  btn.addEventListener("click", () => handleNumber(btn.dataset.num));
});

document.querySelectorAll("[data-operator]").forEach((btn) => {
  btn.addEventListener("click", () => handleOperator(btn.dataset.operator));
});

document.querySelector('[data-action="equals"]').addEventListener("click", handleEquals);
document.querySelector('[data-action="all-clear"]').addEventListener("click", () => resetAll("0"));
document.querySelector('[data-action="delete"]').addEventListener("click", handleDelete);
document.querySelector('[data-action="percent"]').addEventListener("click", handlePercentage);

// Keyboard Support with Button Depress Animation
window.addEventListener("keydown", (e) => {
  let targetBtn = null;

  if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
    handleNumber(e.key);
    targetBtn = document.querySelector(`[data-num="${e.key}"]`);
  } else if (e.key === "+") {
    handleOperator("+");
    targetBtn = document.querySelector('[data-operator="+"]');
  } else if (e.key === "-") {
    handleOperator("-");
    targetBtn = document.querySelector('[data-operator="-"]');
  } else if (e.key === "*") {
    handleOperator("×");
    targetBtn = document.querySelector('[data-operator="×"]');
  } else if (e.key === "/") {
    e.preventDefault();
    handleOperator("÷");
    targetBtn = document.querySelector('[data-operator="÷"]');
  } else if (e.key === "%") {
    handlePercentage();
    targetBtn = document.querySelector('[data-action="percent"]');
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    handleEquals();
    targetBtn = document.querySelector('[data-action="equals"]');
  } else if (e.key === "Backspace") {
    handleDelete();
    targetBtn = document.querySelector('[data-action="delete"]');
  } else if (e.key === "Escape") {
    resetAll("0");
    targetBtn = document.querySelector('[data-action="all-clear"]');
  }

  // Visual feedback when pressing physical keys
  if (targetBtn) {
    targetBtn.classList.add("active-key");
    setTimeout(() => targetBtn.classList.remove("active-key"), 120);
  }
});