import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {

    return (
      <button 
        className={"square " + (props.Winning ? "victory-square " : null) + (props.value === 'X' ? " X" : " O")} 
        onClick={props.onClick}
      >
        {props.value}
      </button>
    );
}

//Board

class Board extends React.Component {
  
  makeRow(x) {
    return <div className="board-row">{x}</div>;
  }

  makeBoard(n) {
    var board = []
    for (let i = 0; i < n; i++) {
      let row = [];
      for (let j = 0; j < n; j++) {
        row.push(i*n + j);
      }
      board.push(row);
    }
    return board;
  }
  
  render() {
    var board = this.makeBoard(this.props.boardSize);
    return (
      <div>
        {board.map(
      y => this.makeRow(
        y.map(
          x => <Square 
            Winning = {this.props.winningSquares.includes(x)}
            value={this.props.squares[x]} 
            onClick={() => this.props.onClick(x)} 
            />
        )
      )
    )}
      </div>
    );
  }
}

// Game

class Game extends React.Component {
	constructor(props) {
		super(props);
    let boardSizeEntry = 1; //initialized because of while condition in next line
    while (boardSizeEntry < 3) {boardSizeEntry = prompt("Enter the number of rows and columns of the board. Can't be less than 3!", 3)}
		this.state = {
      boardSize: parseInt(boardSizeEntry),
		  history: [{
			squares: Array(parseInt(boardSizeEntry)**2).fill(null),
		  }],
		  stepNumber: 0,
		  xIsNext: true,
		};
	}
	
	handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const locations = [];
    
    for (let k = 1; k < this.state.boardSize + 1; k++) {
      for (let j = 1; j < this.state.boardSize + 1; j++) {
        locations.push([k, j]);
      }
    }
    

    if (calculateWinner(squares, this.state.boardSize) || squares[i]) {
      return;
    }
    if (calculateIfDraw(squares, this.state.boardSize) || squares[i]) {
      //return;
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
    const boardSize = this.state.boardSize;
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares, boardSize);
    const draw = calculateIfDraw(current.squares, boardSize);
    let Xcoloring = 1;
    
    const moves = history.map((step, move) => {
        const desc = move ?
          'Go to move #' + move + ' (' + (move % 2 ? 'X' : 'O') + ' at position ' + history[move].location + ')':
          'Go to game start';
        
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b className = {"highlighted" + (move % 2 ? "X" : "O")} style = {{marginLeft:"0"}}>{desc}</b> : desc}
            </button>
          </li>
        );
    });
    
    let status;
    let status1;
    if (winner) {
        status = 'Winner: ';
        status1 = winner.player;
    } else if (draw) {
      status = 'It\'s a draw!';
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
            boardSize = {boardSize}
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

function calculateWinner(squares, boardSize) {
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
  
  return null;
}

function calculateIfDraw (squares, boardSize) {
  let counter = 0;

  for (let i = 0; i < squares.length; i++) {
	  if (squares[i] != null) counter++;
  }

  if (counter === boardSize**2) {
	 return 1;
  }

  return null;
}