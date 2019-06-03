import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.boardRef = React.createRef();
        this.state = {
            size: 4
        }
    }
    render() {
        return (
            <div className="game">
                <div>
                    <input type="text" value={this.state.size} onChange={evt => this.updateInputValue(evt)} />
                </div><br />
                <button onClick={() => this.shuffle()}>Shuffle</button>
                <div className="game-board">
                    <Board ref={this.boardRef} size={this.state.size} />
                </div>
            </div>
        );
    }
    shuffle() {
        this.boardRef.current.fillData(this.state.size);
    }
    updateInputValue(evt) {
        let val = evt.target.value;
        if (val === "" || isNaN(val)) return true;
        this.boardRef.current.fillData(val);
        this.setState({
            size: parseInt(val, 10)
        });
    }
}
class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.fillData(this.props.size);
    }
    fillData(size) {
        console.log("filling data of size " + size);
        let timerRef = setInterval(()=>this.setState({secondsElapsed:this.secondsElapsed()}) ,1000);
        let arr = Array((size * size)).fill(null);
        arr = arr.map((num, i) => i + 1);
        // shuffle arr
        arr.sort(function () { return 0.5 - Math.random() });
        let empty = arr.indexOf(size * size);
        arr[empty] = null;
        let retVal = {
            size: size,
            squares: arr,
            empty: empty,
            moves: [],
            startTime: null,
            secondsElapsed:0,
            timerRef:timerRef
        };
        this.setState(retVal);
        return retVal;
    }
    calculateSolution(arr) {
        let total = 0;
        for (var i = 0; i < arr.length; i++) {
            let val = arr[i] ? arr[i] : 0;
            // console.log(total, val, i);
            total += ((i + 1) === val ? 1 : 0);
        }
        // console.log("solved ", total * 100 / (this.state.size * this.state.size));
        let percentSolved = Math.floor(total * 100 / ((this.state.size * this.state.size) - 1));

        return ({
            percentSolved: percentSolved,
            isSolved: percentSolved === 100
        });
    }
    secondsElapsed(){
        let startTime = this.state.startTime;
        if(!startTime)return 0;
        let nowTime = new Date();
        let seconds = (nowTime.getTime() - startTime.getTime())/1000;
        return Math.floor(seconds);
    }
    render() {
        console.log("Start Rendering Board...");
        let { percentSolved, isSolved } = this.calculateSolution(this.state.squares.slice());
        if(isSolved)clearInterval(this.state.timerRef);
        // console.log("Solved %", percentSolved, isSolved);
        // this.setState({squares: this.fillData(this.props.size)});
        let rows = [...Array(this.props.size)].map((num, i) => {
            return (<BoardRow
                elementsArray={this.state.squares.slice(i * this.props.size, (i + 1) * this.props.size)}
                elementCount={this.props.size}
                key={i}
                onClick={(num) => this.moveSquareOnClick(num)}
                onKeyDown={(keyCode) => this.moveSquareOnKeyPress(keyCode)}
            />
            );
        }
        );
        let minutesElapsed = Math.floor(this.state.secondsElapsed/60);
        let remainingSeconds =  this.state.secondsElapsed - (minutesElapsed*60);
        // console.log(rows);
        return (
            <>
                <div>
                    {rows}
                </div>
                <div>
                    {this.state.moves.length} moves
                </div>
                <div>
                    <button disabled={this.state.moves.length === 0} onClick={() => this.undo()}>Undo</button>
                </div>
                <div>
                    {percentSolved}% solved
                </div>
                <div>
                    {minutesElapsed} min {remainingSeconds} sec elapsed
                </div>
                <div>
                    {isSolved ? "You WON!!!" : ""}
                </div>
            </>
        );
    }
    undo() {
        let moves = this.state.moves.slice();
        let lastMove = moves[moves.length - 1];
        console.log("lastMove", lastMove);
        let undoKeyCode = 0;
        switch (lastMove) {
            case 37:
                //  alert('Left key pressed');
                undoKeyCode = 39;
                break;
            case 38:
                //  alert('Up key pressed');
                undoKeyCode = 40;
                break;
            case 39:
                //  alert('Right key pressed');
                undoKeyCode = 37;
                break;
            case 40:
                //  alert('Down key pressed');
                undoKeyCode = 38;
                break;
            default: break;
        }
        //  moves.pop();
        //  this.setState({moves:moves});
        this.moveSquareOnKeyPress(undoKeyCode, true);
    }
    moveSquareOnKeyPress(keyCode, isUndo) {
        let squares = this.state.squares.slice();
        let moves = this.state.moves.slice();
        console.log(moves, this.state.moves);
        let empty = this.state.empty;
        let isUpdated = false;
        console.log(empty);
        switch (keyCode) {
            case 37:
                console.log('Left key pressed');
                // same row -1
                if (empty % this.state.size < this.state.size - 1) {
                    console.log("move allowed");
                    let oldNum = squares[empty + 1];
                    squares[empty + 1] = null;
                    squares[empty] = oldNum;
                    empty++;
                    isUpdated = true;
                }
                else
                    console.log("move not allowed");
                break;
            case 38:
                console.log('Up key pressed');
                // same col -1
                if (Math.floor(empty / this.state.size) < this.state.size - 1) {
                    console.log("move allowed");
                    let oldNum = squares[empty + this.state.size];
                    squares[empty + this.state.size] = null;
                    squares[empty] = oldNum;
                    empty += this.state.size;
                    isUpdated = true;
                }
                else
                    console.log("move not allowed");
                break;
            case 39:
                console.log('Right key pressed');
                //same row +1
                if (empty % this.state.size > 0) {
                    console.log("move allowed");
                    let oldNum = squares[empty - 1];
                    squares[empty - 1] = null;
                    squares[empty] = oldNum;
                    empty--;
                    isUpdated = true;
                }
                else
                    console.log("move not allowed");
                break;
            case 40:
                console.log('Down key pressed');
                //same col +1
                if (Math.floor(empty / this.state.size) > 0) {
                    console.log("move allowed");
                    let oldNum = squares[empty - this.state.size];
                    squares[empty - this.state.size] = null;
                    squares[empty] = oldNum;
                    empty -= this.state.size;
                    isUpdated = true;
                }
                else
                    console.log("move not allowed");
                break;
            default: return;
        }
        if (isUpdated) {
            if (!isUndo) {
                if (keyCode >= 37 && keyCode <= 40) {
                    moves.push(keyCode);
                    if(!this.state.startTime)this.setState({startTime:new Date()})
                }
            }
            else moves.pop();
            this.setState({ empty: empty, squares: squares, moves: moves });
        }
    }
    moveSquareOnClick(i) { // position
        i = this.state.squares.indexOf(i);
        let moves = this.state.moves.slice();
        console.log("Now empty at " + this.state.empty);
        console.log("clicked " + i);
        let isMoveValid = false;
        let keyCode = 0;
        // check same row
        if (Math.floor(i / this.props.size) === Math.floor(this.state.empty / this.props.size)) {
            if ((i + 1) === this.state.empty) {
                keyCode = 39;
            }
            else if (i - 1 === this.state.empty) {
                keyCode = 37;
            }
            isMoveValid = true;
        }
        // check same col
        else if ((i) % this.props.size === (this.state.empty) % this.props.size) {
            if ((i + this.props.size) === this.state.empty) {
                keyCode = 40;
            }
            else if (i - this.props.size === this.state.empty) {
                keyCode = 38;
            }
            isMoveValid = true;
        }
        if (isMoveValid) {
            console.log("Moving " + i + " to " + this.state.empty);
            let oldEmpty = this.state.empty;
            let arr = this.state.squares;
            let oldValue = arr[i];
            arr[i] = null;
            arr[oldEmpty] = oldValue;
            if (keyCode >= 37 && keyCode <= 40) moves.push(keyCode);
            this.setState({ empty: i, squares: arr, moves: moves });
            if(!this.state.startTime)this.setState({startTime:new Date()})
        }
    }
}
class BoardRow extends React.Component {
    renderSquare(i) {
        return (
            <Square
                num={this.props.elementsArray[i]}
                onClick={this.props.onClick}
                key={i}
                onKeyDown={this.props.onKeyDown}
            />
        );
    }
    render() {
        var row = [...Array(this.props.elementCount)].map((num, i) => this.renderSquare(i));
        // console.log(row);
        return (<div className="board-row">{row}</div>);
    }

}
class Square extends React.Component {
    render() {
        return (
            <button
                ref={(input) => { this.nameInput = input; }}
                className="square"
                onClick={() => this.props.onClick(this.props.num)}
                onKeyDown={(evt) => this.props.onKeyDown(evt.keyCode)}
            >
                {this.props.num}
            </button>
        );
    }
    handleKeyDown(evt) {
        let keyCode = evt.keyCode;
        console.log(keyCode);
    }
    componentDidMount() {
        if (!this.props.num) this.nameInput.focus();
    }
}
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);