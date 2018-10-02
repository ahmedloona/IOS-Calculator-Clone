function userInputHasDecimal() {
  return userInputAccumulator.includes(".");
}

function isUserInputAccumulatorEmpty() {
  return (userInputAccumulator[0] == "0") && (!userInputHasDecimal());
}

function isUserInputAccumulatorFull() {
    return (userInputAccumulator.length == 10) || ((userInputAccumulator.length == 9) && !userInputAccumulator.includes("."));
}

function injectCommas() {
    const decimalIndex = userInputAccumulator.indexOf(".");
    const whole = (decimalIndex !== -1)?
                  userInputAccumulator.slice(0, decimalIndex): userInputAccumulator;
    const size = whole.length;
    console.log(`whole: ${whole}`);
}

function getPressedKeyElement(e) {
    const KEY = document.querySelector(`div[data-key="${e.key.toLowerCase()}"]`);
    return KEY;
}

function onUserInput (e) {

  const buttonEl = (e.type == "click")?
                      e.srcElement:
                      getPressedKeyElement(e);
  if (!buttonEl) {
      return;
  }

  switch (buttonEl.className) {
    case "button number":
      const input = getButtonContent(buttonEl);
      console.log(`The input is: ${input}`)
      if (!isUserInputAccumulatorFull()) {
        updateUserInputAccumulator(input);
      } else {
        console.log("input buffer full");
      }
      break;
    case "button operator":
      console.log(`An operator was chosen ${buttonEl.id}`);
      const operatorSwitch = function() {
          const ops = ["+", "-", "*", "/"];
          return (isUserInputAccumulatorEmpty())? true : false;
      }
      if (operatorSwitch()) {
          OPERANDACCUMULATOR.pop();
          console.log(`operator switch detected, infix: ${OPERANDACCUMULATOR}`);
      }
      if (!operatorSwitch()) {
          OPERANDACCUMULATOR.push(userInputAccumulator.join(""));
      }
      if (buttonEl.id !== "=") OPERANDACCUMULATOR.push(buttonEl.id);
      console.log(`The input symbols are ${OPERANDACCUMULATOR}`);
      console.log(`The operator is${buttonEl.id}`);
      clearUserInputAccumulator();
      const convertToPostFix = function() {
        const opPrecedence = {"=": -1, "+": 0, "-": 0, "/": 1, "*": 1};
        const stack = [];
        let postfixArray = [];
        OPERANDACCUMULATOR.forEach( function (item) {
            if (!(Object.keys(opPrecedence).includes(item))) {
                postfixArray.push(item);
                console.log(`found an operand ${item}`);
            } else if ((stack.length === 0) || (opPrecedence[item] > opPrecedence[stack[stack.length - 1]])) {
                stack.push(item);
                console.log(`found an operator ${item} and pushed to stack${stack}`);
            } else {
                let canPush = false;
                while (!canPush) {
                    const toRemove = stack.pop();
                    postfixArray.push(toRemove);
                    console.log(`removed ${toRemove} from stack: ${stack} postfix: ${postfixArray}`);
                    canPush = (opPrecedence[item] > opPrecedence[stack[stack.length - 1]]) || (stack.length == 0);
                }
                stack.push(item);
                console.log(`added ${item} stack: ${stack} postfix: ${postfixArray}`);
            }

        });
        postfixArray = postfixArray.concat(stack.reverse());
        console.log(`RPN ${postfixArray}`);
        return postfixArray.join(" ");
      }
      const rpn = convertToPostFix();
      CALCULATOR.clearAll();
      let result = CALCULATOR.evaluateRpnExpr(rpn);
      console.log(`result is ${result}`);
      break;
    case "button other":
      console.log(`other was chosen ${buttonEl.id}`);
      break
  }
}

function getButtonContent(buttonElement) {
  return buttonElement.textContent;
}
function updateUserInputAccumulator(input) {
  switch(input) {
    case ".":
      if (!userInputHasDecimal()) {
        userInputAccumulator.push(input);
      }
      break;
    case "0":
      if (userInputAccumulator[0] !== "0") {
        userInputAccumulator.push(input);
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
      if (isUserInputAccumulatorEmpty()){
        userInputAccumulator[0] = input;
      } else {
        userInputAccumulator.push(input);
      }
      break;
    default:
      console.log("input invalid")
  }

  console.log(userInputAccumulator);
}
function clearUserInputAccumulator() {
    userInputAccumulator = ["0"];
}


let userInputAccumulator = ["0"];
const OPERANDACCUMULATOR = [];
const CALCULATOR = {
  operandStack: [],
  push: function (operand) { this.operandStack.push(operand); },
  clearAll: function() { this.operandStack = []; },
  evaluateRpnExpr: function(expression) {
      const OPERATORS = ["+", "-", "*", "/"];
      const TOKENS = expression.split(" ")
                     .map( (item) => (OPERATORS.includes(item)) ? item : Number(item) );

      TOKENS.forEach( (item) => {
        switch(item) {
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
            this.operandStack.push(item);
        }
      });
      return this.operandStack;
  },
  hasEnoughOperands: function() { return (this.operandStack.length >= 2)? true: false },
  add: function() {
    if (this.hasEnoughOperands()) {
      const SUM = this.operandStack.pop() + this.operandStack.pop();
      this.operandStack.push(SUM);
    }
  },
  subtract: function() {
    if (this.hasEnoughOperands()) {
      const DIFFERENCE = -1 * (this.operandStack.pop() - this.operandStack.pop());
      this.operandStack.push(DIFFERENCE);
    }
  },
  multiply: function() {
    if (this.hasEnoughOperands()) {
      const PRODUCT = this.operandStack.pop() * this.operandStack.pop();
      this.operandStack.push(PRODUCT);
    }
  },
  divide: function() {
    if (this.hasEnoughOperands()) {
      const DIVISOR = this.operandStack.pop();
      //if (DIVISOR !== 0) {
        const DIVIDED = 1 / (DIVISOR / this.operandStack.pop());
        this.operandStack.push(DIVIDED);
      //}
    }
  }
}

const buttonElements = document.querySelectorAll(".button");
buttonElements.forEach( (button) => button.addEventListener('click', onUserInput));
document.addEventListener('keydown', onUserInput);
