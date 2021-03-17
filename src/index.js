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

function generateBoardMatrix(size) {
  var board = []
  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      row.push(i*size + j);
    }
    board.push(row);
  }
  return board;
}

function Board(boardSize, winningSquares, squares, onClick) {
  var board = generateBoardMatrix(boardSize);
  return (
    <div>
      {board.map((row) =>
        <div className="board-row">
          {row.map((square) =>
            <Square 
                Winning = {winningSquares.includes(square)}
                value={squares[square]} 
                onClick={() => onClick(square)} 
            />
          )}
        </div>
      )}
    </div>
  );
}

class Game extends React.Component {
	constructor(props) {
		super(props);
    var boardSizeEntry = 3; //starting value
		this.state = {
      boardSize: parseInt(boardSizeEntry),
		  history: [{
			squares: Array(parseInt(boardSizeEntry)**2).fill(null),
		  }],
		  stepNumber: 0,
		  xIsNext: true,
		};
	}

  editBoardSize(value) {
    let newBoardSize = value;
    while (isNaN(newBoardSize) || newBoardSize < 3) {
      newBoardSize = prompt("That is not a valid value! Enter the board size - a number between 3 and 10!", 3);
    }
    this.setState({
      boardSize: parseInt(newBoardSize),
      history: [{
        squares: Array(parseInt(newBoardSize)**2).fill(null),
        }],
        stepNumber: 0,
		  xIsNext: true,
    });
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
    

    if (checkForWinner(squares, this.state.boardSize) || squares[i]) {
      return;
    }
    if ((getGameStatus(squares, this.state.boardSize) || squares[i]) === 'draw') {
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
    const {boardSize, history} = this.state;
    const current = history[this.state.stepNumber];
    const winner = checkForWinner(current.squares, boardSize);
    const gameStatus = getGameStatus(current.squares, boardSize);
    
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
    let nextPlayer;
    let winningPlayer;
    if (gameStatus === 'end') {
      status = 'Winner: ';
      winningPlayer = winner.player;
    } else if (gameStatus === 'draw') {
      status = 'It\'s a draw!';
    } else { //still playing
      if (this.state.xIsNext) {
          status = 'Next player: ';
          nextPlayer = 'X';
      } else {
          status = 'Next player: ';
          nextPlayer = 'O';
      }
    }
    
    let onClick=(i) => this.handleClick(i);
    return (
      <div className="screen">
        <div className="whoseMove">{status}
          <div className={'highlighted' + (winner ? winningPlayer : nextPlayer)}>
            {winner ? winner.player : nextPlayer}
          </div>
        </div>
        <div className="game">
          <div className="editBoard">
            <p style={{fontSize: "120%", marginLeft: "15%"}}>Board size (between 3 and 10):</p>
            <form>
              <input type = "number" id="newBoardSize" min = "3" max = "10" onChange = {() => this.editBoardSize(document.getElementById("newBoardSize").value)} style={{marginLeft: "40%"}} />
            </form>
          </div>
          <div className="game-board">
            {Board(boardSize, winner ? winner.winningLine : [], current.squares, onClick)}
          </div>
          <div className="game-info">
            <ol>{moves}</ol>
          </div>
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

function checkForWinner(squares, boardSize) {
  var lines = [];
  for (let i = 0; i < boardSize*2 + 1; i++) { //boardSize*2+1 because we add boardSize rows, boardSize columns and then both diagonals
    let row = [];

    if (i < boardSize) { //boardSize amount of rows
      for (let j = i * boardSize; j < i*boardSize + boardSize; j++) {
        row.push(j); 
      }
    } else if (i < boardSize * 2) { //boardSize amount of columns
      for (let j = 0; j < boardSize; j++) {
        row.push(i%3+j*boardSize);  
      }
    } else { //both diagonals added here
      for (let j = 0; j < boardSize; j++) {
        row.push(j*(boardSize+1)); //top-left to bottom-right
      }
      lines.push(row);
      row = [];
      for (let j = 1; j < boardSize+1; j++) {
        row.push(j*(boardSize-1)); //bottom-left to top-right
      }
    }
    lines.push(row);
  }
  
  for (let i = 0; i < lines.length; i++) {
    let rowValues = []
    for (let j = 0; j < boardSize; j++) {
      rowValues.push(squares[lines[i][j]])
    }
    
    if (squares[lines[i][0]] && rowValues.every( (val, i, arr) => val === arr[0] )) {
      return {
        player: squares[lines[i][0]],
        winningLine: lines[i]
      };
    }
    
  }
  
  return null;
}

function getGameStatus(squares, boardSize) {
  let counter = 0;

  for (let i = 0; i < squares.length; i++) {
	  if (squares[i] != null) counter++;
  }

  if (counter === boardSize**2) {
	 return 'draw';
  }

  if (checkForWinner(squares, boardSize)) {
    return 'end';
  }

  return 'playing';
}