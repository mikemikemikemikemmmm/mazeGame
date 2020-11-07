import React from 'react';
import * as Pixi from 'pixi.js'
function App() {
  const fib = (num: number): number => {
    if (num === 1 || num === 2) {
      return 1
    }
    let sumResult = 2
    let firstNum = 1
    let secondNum = 1
    for (let i = 2; i <= num; i++) {
      sumResult = firstNum + secondNum
      firstNum = secondNum
      secondNum = sumResult
    }
    return sumResult
  }

  return (
    <div className="App">
      {fib(7)}
    </div>
  );
}

export default App;
