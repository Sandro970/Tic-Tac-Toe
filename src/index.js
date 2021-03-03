import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {

  if (props.value === 'X') {
    return (
      <button 
        className={"square X " + (props.Winning ? "victory-square" : null)} 
        onClick={props.onClick}
      >
        {props.value}
      </button>
    );
  } else {
    return (
      <button 
        className={"square O " + (props.Winning ? "victory-square" : null)} 
        onClick={props.onClick}
      >
        {props.value}
      </button>
    );
  }
}

//Board

class Board extends React.Component {
  
  renderSquare(i) {
    return (<Square 
      Winning = {this.props.winningSquares.includes(i)}
	    value={this.props.squares[i]} 
	    onClick={() => this.props.onClick(i)} 
	  />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

// Game

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  history: [{
			squares: Array(9).fill(null),
		  }],
		  stepNumber: 0,
		  xIsNext: true,
		};
	}
	
	handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const locations = [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [1, 3], [2, 3], [3, 3] ];

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: locations[i]
      }]),
	    stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
  
  render() {
	const history = this.state.history;
  const current = history[this.state.stepNumber];
  const winner = calculateWinner(current.squares);
  let Xcoloring = 1;
	
	const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' (' + (move % 2 ? 'X' : 'O') + ' at position ' + history[move].location + ')':
        'Go to game start';
      if (move % 2) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b className = "highlightedX" style = {{marginLeft:"0"}}>{desc}</b> : desc}
            </button>
          </li>
        );
      } else {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b className = "highlightedO" style = {{marginLeft:"0"}}>{desc}</b> : desc}
            </button>
          </li>
        );
      }
      
    });
	
    let status;
    let status1;
    if (winner === "draw") {
		status = 'It\'s a draw!';
	} else if (winner) {
      status = 'Winner: ';
      status1 = winner.player;
    } else {
      if (this.state.xIsNext) {
        status = 'Next player: ';
        status1 = ' X';
        Xcoloring = 1;
      } else {
        status = 'Next player: ';
        status1 = ' O';
        Xcoloring = 0;
      }
    }
      return (
        <div className="game">
          <div className="whoseMove">{status}<div className={Xcoloring ? 'highlightedX' : 'highlightedO'}>{status1}</div></div>
          <div className="game-board">
            <Board 
              winningSquares = {winner ? winner.winningLine : []}
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <ol>{moves}</ol>
          </div>
        </div>
      );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        player: squares[a],
        winningLine: [a, b, c]
      };
    }
  }
  
  let counter = 0;
  for (let i = 0; i < squares.length; i++) {
	  if (squares[i] != null) counter++;
  }
  if (counter === 9) {
	 return {
    player:"draw",
    winningLine:[]
   };
  }
  
  return null;
}