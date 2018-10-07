const buttonElements = document.querySelectorAll(".button");
buttonElements.forEach( (button) => button.addEventListener('click', onKeyorClick));
document.addEventListener('keydown', onKeyorClick);

function onKeyorClick (evnt) {

  let whichKeyPressed = () =>
    document.querySelector(`div[data-key="${evnt.key.toLowerCase()}"]`);

  let getButtonSelection = () => (evnt.type == "click")?
                                evnt.srcElement:
                                whichKeyPressed(evnt);

  let getButtonClass = () => selectedButton.className;

  let applyPushedButtonStyle = () => {
      // First remove any existing 'pushed' class from any buttons
      // This is needed as we don't do a 'transition' end clear on any button of
      // class 'operator' to generate the operator button 'hold' effect
      const allButtons = document.querySelectorAll(".button");
      allButtons.forEach((button) => button.classList.remove("pushed"));

      const buttonClass = getButtonClass();
      if (buttonClass !== "button operator") {
        selectedButton.addEventListener('transitionend', (evnt) => {
          selectedButton.classList.remove("pushed");
       });
      }
      selectedButton.classList.add("pushed");
  };

  const selectedButton = getButtonSelection();

  if (!selectedButton) return;

  switch (getButtonClass()) {
    case "button digit":
      const digit = selectedButton.textContent;
      const number = userInput.addToAccumulator(digit);
      updateDisplay(userInput.digitAccumulator.join(""));
      break;
    case "button operator":
      const operator = selectedButton.id;
      const infixExpression = userInput.pushTokenToExpression(operator);
      const postfix = infixToPostFix(infixExpression);

      // postfix is immediately sent for evaluation for "+ - =", for * and / we
      // must wait for the next operand to come in.
      if (["+", "-", "="].includes(operator)) {
        let result = postfixCalculator.evaluateRpnExpr(postfix);
        if (operator === "=") userInput.saveResultinMemory(result);
        if (result === Infinity) userInput.clearInputHistory();
        updateDisplay(result);
      }
      break;
    case "button other":
      const action = selectedButton.id;
      if (action == "delete") {
        userInput.removeFromAccumulator();
        updateDisplay(userInput.digitAccumulator.join(""));
      }
      else if (action == "clear") {
        userInput.clearInputHistory();
        updateDisplay(userInput.digitAccumulator.join(""));
      }
      else if (action == "signtoggle") {
        userInput.toggleSign();
        //dislay result stored in memory if it exits, else display accumulator
        updateDisplay(userInput.previousResultMemory ||
                      userInput.digitAccumulator.join(""));
      }
      break;
  }
  applyPushedButtonStyle();
}

function infixToPostFix(expression) {
  if (expression[expression.length - 1] === "=") {
    expression = expression.slice(0, expression.length - 1);
  }
  const opPrecedence = {"+": 0, "-": 0, "/": 1, "*": 1};
  const opStack = [];
  let postfix = [];
  expression.forEach( function (item) {
      if (Number(item) || item === "0") {
          postfix.push(item);
          console.log(`postfix ${postfix}`);
      } else if ((opStack.length === 0) ||
        (opPrecedence[item] > opPrecedence[opStack[opStack.length - 1]])) {
          opStack.push(item);
      } else {
          let canPush = false;
          while (!canPush) {
              const toRemove = opStack.pop();
              postfix.push(toRemove);
              canPush = (opPrecedence[item] > opPrecedence[opStack[opStack.length - 1]])
              || (opStack.length === 0);
          }
          opStack.push(item);
      }
  });
  postfix = postfix.concat(opStack.reverse());
  return postfix.join(" ");
}

function updateDisplay(content) {

  let convertToExponentialNotation = function(content) {
    return content.toExponential(1);
  }

  let insertCommas = function(number) {

        function splitWholeFractional(number) {
          string = String(number);
          const decimalIndex = string.indexOf(".");
          let whole;
          let fractional;
          let point;
          if (decimalIndex !== -1) {
              whole = string.slice(0, decimalIndex);
              fractional = string.slice(decimalIndex + 1);
              point = true;
          } else {
              whole = String(number);
              fractional = null;
              point = false;
          }
          return [whole, point, fractional];
        }

        const [whole, point, fractional] = splitWholeFractional(number);
        let withCommas = "";

        for (let i = whole.length - 1; i >= 0; i--) {
            let reversedIndex = whole.length - 1 - i;
            if ( reversedIndex % 3 == 0 && reversedIndex !== 0 && whole[i] !== "-") {
                  withCommas = whole[i] + ","  + withCommas;
            }
            else {
              withCommas = whole[i] + withCommas;
            }
        }
        return (fractional)? `${withCommas}.${fractional} `:
               (point)? `${withCommas}.` : `${withCommas}`;
    }

  let isElementContentOverfowing = function() {
    return calculatorDisplay.scrollWidth > calculatorDisplay.clientWidth;
  }

  let scaleContentToFitDisplay = function() {
      let fontSize = window.getComputedStyle(calculatorDisplay, null).getPropertyValue('font-size');
      fontSize = parseFloat(fontSize);
      while (isElementContentOverfowing(calculatorDisplay)){
        fontSize -= 10;
        calculatorDisplay.style.fontSize = fontSize + "px";
      }
    }


  const calculatorDisplay = document.querySelector(".display");
  calculatorDisplay.style.fontSize = "3.5em";
  if (content === Infinity) {
    content = "Error!";
  } else if (String(content).length > 10) {
    content = convertToExponentialNotation(content);
  } else {
    content = insertCommas(content);
  }

  calculatorDisplay.textContent = content;

  scaleContentToFitDisplay();
}

const userInput = {
  expression: [],
  digitAccumulator: ["0"],
  previousResultMemory: null,
  isAccumulatorFull: function() {
    const limit = (this.hasDecimal())? 10 : 9;
    const length = this.digitAccumulator.length;
    return length === limit;
  },
  isAccumulatorZero: function() { return this.digitAccumulator.join("") === "0"; },
  isAccumulatorEmpty: function() { return this.digitAccumulator.length === 0; },
  hasDecimal: function() {return this.digitAccumulator.includes(".");},
  addToAccumulator: function (digit) {
    switch (digit) {
      case ".":
        if (!this.hasDecimal()) this.digitAccumulator.push(digit);
        break;
      case "0":
        if (!this.isAccumulatorZero() || this.hasDecimal()) {
          this.digitAccumulator.push(digit);
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
        if (this.isAccumulatorZero() && !this.hasDecimal()){
          this.digitAccumulator[0] = digit;
      } else if (!this.isAccumulatorFull()){
          this.digitAccumulator.push(digit);
        }
        break;
      default:
        console.log("invalid entry. Not adding to userInput digitAccumulator")
    }
    return this.digitAccumulator.join("");
  },
  removeFromAccumulator: function() { this.digitAccumulator.pop(); },
  emptyAccumulator: function() { this.digitAccumulator = []; },
  pushTokenToExpression : function( operator ) {
    // The current operand to push to expression is the current user input,
    // if it exists, else the operand pushed to expression is the value in memory
    if (!this.isAccumulatorEmpty() || this.previousResultMemory) {
      const operand = this.digitAccumulator.join("") || this.previousResultMemory;
      this.expression.push(operand);
    // if an 'operator' argument has come in, and user input accumulator & memory are empty,
    // it implies that the operator has switched e.g. 34 + *
    // so we pop the 'stale' operator before pushing the 'current' operator
    } else {
      this.expression.pop();
    }
    this.expression.push(operator);
    // If a value exists in memory, then clear it so that it gets pushed
    // just this one time. i.e. Never pushed to a subsequent call to pushTokenToExpression(operator)
    // subsequent expression evaluation
    if (this.previousResultMemory) this.previousResultMemory = null;
    this.emptyAccumulator();
    return this.expression;
  },
  saveResultinMemory: function(result) {
    this.previousResultMemory = String(result);
    this.expression = [];
    this.digitAccumulator= [];
  },
  toggleSign: function() {
    // toggle sign on value in memory, if value exists in memory
    if (this.previousResultMemory) {
      this.previousResultMemory = String(-1 * this.previousResultMemory);
    } else {
        //toggle sign on user's current input
        (this.digitAccumulator[0] === "-")?
        this.digitAccumulator = this.digitAccumulator.slice(1):
        this.digitAccumulator.unshift("-");
    }
},
  clearInputHistory: function() {
    //reset the state of all properties of the userInput object
    this.digitAccumulator = ["0"];
    this.expression = [];
    this.previousResultMemory = null;
  }
}

const postfixCalculator = {
  operandStack: [],
  push: function (operand) { this.operandStack.push(operand); },
  clearOperandStack: function() { this.operandStack = []; },
  evaluateRpnExpr: function(expression) {
      this.clearOperandStack();
      const operators = ["+", "-", "*", "/"];
      const tokens = expression.split(" ")
                     .map( (item) => (operators.includes(item)) ? item : Number(item) );
      tokens.forEach( (item) => {
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
      const result = this.roundTwoPlaces(this.operandStack[0]);
      return result;
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
      const divisor = this.operandStack.pop();

      const divided = 1 / (divisor / this.operandStack.pop());
      this.operandStack.push(divided);

    }
  },
  roundTwoPlaces: function(decimal) {
      return Math.round(decimal * 100) / 100;
  }
}
