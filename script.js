
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
      const operatorSwitch = function() {
          const ops = ["+", "-", "*", "/"];
          return (entryIsEmpty())? true : false;
      }
      if (operatorSwitch()) {
          infixArray.pop();
          console.log(`operator switch detected, infix: ${infixArray}`);
      }
      if (!operatorSwitch()) {
          infixArray.push(currentEntry.join(""));
      }
      if (buttonEl.id !== "=") infixArray.push(buttonEl.id);
      console.log(`The input symbols are ${infixArray}`);
      console.log(`The operator is${buttonEl.id}`);
      resetCurrentEntry();
      const convertToPostFix = function() {
        const opPrecedence = {"=": -1, "+": 0, "-": 0, "/": 1, "*": 1};
        const stack = [];
        let postfixArray = [];
        infixArray.forEach( function (el) {
            if (!(Object.keys(opPrecedence).includes(el))) {
                postfixArray.push(el);
                console.log(`found an operand ${el}`);
            } else if ((stack.length === 0) || (opPrecedence[el] > opPrecedence[stack[stack.length - 1]])) {
                stack.push(el);
                console.log(`found an operator ${el} and pushed to stack${stack}`);
            } else {
                let canPush = false;
                while (!canPush) {
                    const toRemove = stack.pop();
                    postfixArray.push(toRemove);
                    console.log(`removed ${toRemove} from stack: ${stack} postfix: ${postfixArray}`);
                    canPush = (opPrecedence[el] > opPrecedence[stack[stack.length - 1]]) || (stack.length == 0);
                }
                stack.push(el);
                console.log(`added ${el} stack: ${stack} postfix: ${postfixArray}`);
            }

        });
        postfixArray = postfixArray.concat(stack.reverse());
        console.log(`RPN ${postfixArray}`);
        return postfixArray.join(" ");
      }
      const rpn = convertToPostFix();
      calculator.clear();
      let result = calculator.evaluateRPN(rpn);
      console.log(`result is ${result}`);
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

function resetCurrentEntry() {
    currentEntry = ["0"];
}

const calculator = {
  stack: [],
  push: function(value) {
      this.stack.push(value);
  },
  evaluateRPN: function(string) {
      const operators = ["+", "-", "*", "/"];
      const tokens = string.split(" ")
                .map( (el) => (operators.includes(el)) ? el : Number(el) );
      console.log(tokens);
      tokens.forEach( (el) => {
        switch(el) {
          case "+":
            this.add();
            break;
          case "-":
            this.subtract();
            break;
          case "*":
            this.multiply();
            break;
          case "/":
            this.divide();
            break;
          default:
            this.stack.push(el);
        }
      });
      return this.stack;
  },
  add: function() {
    if (this.stack.length >= 2) {
      const result = this.stack.pop() + this.stack.pop();
      this.stack.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
  subtract: function() {
    if (this.stack.length >= 2) {
      const result = -1 * (this.stack.pop() - this.stack.pop());
      this.stack.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
  multiply: function() {
    if (this.stack.length >= 2) {
      const result = this.stack.pop() * this.stack.pop();
      this.stack.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
  divide: function() {
    if (this.stack.length >= 2) {
      const result = 1 / (this.stack.pop() / this.stack.pop());
      this.stack.push(result);
      return result;
    } else {
      console.log('insufficient operands');
    }
  },
  clear: function() { this.stack = [];}
}

let currentEntry = ["0"];
const infixArray = [];


const buttonEls = document.querySelectorAll(".button");
console.log("All buttons");
console.log(buttonEls);


buttonEls.forEach( (button) => button.addEventListener('click', onInput));
document.addEventListener('keydown', onInput);
