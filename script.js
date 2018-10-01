
/*
function add(operandOne, operandTwo) {
  return operandOne + operandTwo;
}

function subtract(operandOne, operandTwo) {
  return operandOne - operandTwo;
}

function multiply(operandOne, operandTwo) {
  return operandOne * operandTwo;
}

function divide(operandOne, operandTwo) {
  return operandOne/operandTwo;
}
*/

function operate(operator, operandOne, operandTwo) {
  let operation = undefined;
  switch (operator) {
    case "+":
      operation = calculator.add;
      break;
    case "-":
      operation = calculator.subtract;
      break;
    case "X":
      operation = calculator.multiply;
      break;
    case "/":
      operation = calculator.divide;
      break;
    default:
      console.log("Unsupported Operand");
  }
  return operation(operandOne, operandTwo);
}

function hasDecimal() {
  return currentEntry.includes(".");
}

function entryIsEmpty() {
  return (currentEntry[0] == "0") && (!hasDecimal());
}

function isBufferFull() {
    return (currentEntry.length == 10) || ((currentEntry.length == 9) && !currentEntry.includes("."));
}

function injectCommas() {
    const decimalIndex = currentEntry.indexOf(".");
    const whole = (decimalIndex !== -1)?
                  currentEntry.slice(0, decimalIndex): currentEntry;
    const size = whole.length;
    console.log(`whole: ${whole}`);
}

function findKeyEl(e) {
    const key = document.querySelector(`div[data-key="${e.key.toLowerCase()}"]`);
    return key;
}

function onInput (e) {

  const buttonEl = (e.type == "click")?
                      e.srcElement:
                      findKeyEl(e);
  if (!buttonEl) {
      return;
  }

  switch (buttonEl.className) {
    case "button number":
      const input = readInput(buttonEl);
      console.log(`The input is: ${input}`)
      if (!isBufferFull()) {
        updateCurrentEntry(input);
      } else {
        console.log("input buffer full");
      }
      break;
    case "button operator":
      console.log(`An operator was chosen ${buttonEl.id}`);
      break;
    case "button other":
      console.log(`other was chosen ${buttonEl.id}`);
      break
  }
}

function readInput(el) {
  return el.textContent;
}

function updateCurrentEntry(input) {
  switch(input) {
    case ".":
      if (!hasDecimal()) {
        currentEntry.push(input);
      }
      break;
    case "0":
      if (currentEntry[0] !== "0") {
        currentEntry.push(input);
      }
      break;
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      if (entryIsEmpty()){
        currentEntry[0] = input;
      } else {
        currentEntry.push(input);
      }
      break;
    default:
      console.log("input invalid")
  }

  console.log(currentEntry);
}

const currentEntry = ["0"];

const calculator = {
  infixArray : [],
  operands: [3, 2],
  add: function() {
    if (this.operands.length >= 2) {
      const result = this.operands.pop() + this.operands.pop();
      this.operands.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
  subtract: function() {
    if (this.operands.length >= 2) {
      const result = -1 * (this.operands.pop() - this.operands.pop());
      this.operands.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
  multiply: function() {
    if (this.operands.length >= 2) {
      const result = this.operands.pop() * this.operands.pop();
      this.operands.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
  divide: function() {
    if (this.operands.length >= 2) {
      const result = this.operands.pop() / this.operands.pop();
      this.operands.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
}

const buttonEls = document.querySelectorAll(".button");
console.log("All buttons");
console.log(buttonEls);


buttonEls.forEach( (button) => button.addEventListener('click', onInput));
document.addEventListener('keydown', onInput);
