const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");
const darkToggle = document.getElementById("darkModeToggle");
const historyList = document.getElementById("historyList");

let currentInput = "";
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  darkToggle.checked = true;
}

// Load history on startup
renderHistory();

// Button click handling
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (action === "clear") {
      currentInput = "";
      display.textContent = "0";
    } else if (action === "delete") {
      currentInput = currentInput.slice(0, -1);
      display.textContent = currentInput || "0";
    } else if (action === "calculate") {
      try {
        const result = eval(currentInput).toString();
        addToHistory(`${currentInput} = ${result}`);
        currentInput = result;
        display.textContent = result;
      } catch {
        display.textContent = "Error";
        currentInput = "";
      }
    } else if (value) {
      currentInput += value;
      display.textContent = currentInput;
    }
  });
});

// Keyboard support
document.addEventListener("keydown", function (e) {
  const key = e.key;

  if (!isNaN(key) || "+-*/.".includes(key)) {
    currentInput += key;
    display.textContent = currentInput;
  } else if (key === "Enter") {
    try {
      const result = eval(currentInput).toString();
      addToHistory(`${currentInput} = ${result}`);
      currentInput = result;
      display.textContent = result;
    } catch {
      display.textContent = "Error";
      currentInput = "";
    }
  } else if (key === "Backspace") {
    currentInput = currentInput.slice(0, -1);
    display.textContent = currentInput || "0";
  } else if (key === "Escape") {
    currentInput = "";
    display.textContent = "0";
  }
});

// Dark mode toggle
darkToggle.addEventListener("change", function () {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", darkToggle.checked);
});

// History functions
function addToHistory(entry) {
  history.unshift(entry);
  if (history.length > 20) history.pop(); // limit to 20 entries
  localStorage.setItem("calcHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.addEventListener("click", () => {
      const result = item.split(" = ")[1];
      currentInput = result;
      display.textContent = result;
    });
    historyList.appendChild(li);
  });
}
function safeEvaluate(expression) {
  try {
    const tokens = tokenize(expression);
    const rpn = toRPN(tokens);
    return evaluateRPN(rpn);
  } catch {
    return "Error";
  }
}
function tokenize(expr) {
  const regex = /\d+(\.\d+)?|[+\-*/()]/g;
  return expr.match(regex);
}
function toRPN(tokens) {
  const output = [];
  const ops = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

  tokens.forEach(token => {
    if (!isNaN(token)) {
      output.push(token);
    } else if ("+-*/".includes(token)) {
      while (
        ops.length &&
        precedence[ops[ops.length - 1]] >= precedence[token]
      ) {
        output.push(ops.pop());
      }
      ops.push(token);
    }
  });

  return output.concat(ops.reverse());
}
function evaluateRPN(rpn) {
  const stack = [];

  rpn.forEach(token => {
    if (!isNaN(token)) {
      stack.push(parseFloat(token));
    } else {
      const b = stack.pop();
      const a = stack.pop();
      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(a / b); break;
      }
    }
  });

  return stack[0].toString();
}
const result = safeEvaluate(currentInput);