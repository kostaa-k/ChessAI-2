import React, { Component, MouseEvent, Props, ChangeEvent} from 'react';
// import Board from './../board/board-component';
import Draggable, {DraggableEvent, DraggableData} from 'react-draggable';
import Buttons from '../components/buttons-component';
import { Button, Grid, Container, Header, Checkbox, Form, Radio, CheckboxProps, Image, Input, Card, Divider, Transition} from 'semantic-ui-react'
import CSS from 'csstype';
import { Link } from 'react-router-dom'

import BlackKnight from '../pieces/black_knight.png';
import BlackBishop from '../pieces/black_bishop.png';
import BlackRook from '../pieces/black_rook.png';
import BlackKing from '../pieces/black_king.png';
import BlackQueen from '../pieces/black_queen.png';
import BlackPawn from '../pieces/black_pawn.png';
import WhiteKnight from '../pieces/white_knight.png';
import WhiteBishop from '../pieces/white_bishop.png';
import WhiteRook from '../pieces/white_rook.png';
import WhiteKing from '../pieces/white_king.png';
import WhiteQueen from '../pieces/white_queen.png';
import WhitePawn from '../pieces/white_pawn.png';
import { getMistakes, MistakeObject, checkPoll, makeMove, MoveMade, getSessionId, makePuzzleMove, makeEngineMove, getBoardString } from './api_calls';
import MistakesTable from './MistakesTable';
import { Label } from 'semantic-ui-react';
import { Menu } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react';
import greenCheckMark from '../images/greenCheck.png'


const defaultLineup = require('../defaultLineup')
const currentLineup = require('../currentLineup')

export const getDefaultLineup = () => defaultLineup.slice()

//
const totalBoardSize = 700;
const square = 700 / 8;
const squareSize = `${square}px`;
const negativePadding=  `-${square}px`;
const totalBoardSizeStr = `${totalBoardSize}px`;



const box_style: CSS.Properties = {
    width: squareSize,
    height: squareSize,
    paddingBottom: negativePadding,
    float: 'left',
    position: 'relative',
    pointerEvents: 'none',
    alignItems: 'center',
    overflow: 'hidden'
}

const piece_style: CSS.Properties = {
    width: '120',
    height: '120',
    position: 'absolute',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
    cursor: 'pointer'
}


export type square_box = {
    x_cord: number,
    y_cord: number,
    box_style: CSS.Properties,
    current_chess_square: string
}

export type a_piece = {
    unique_id: String,
    current_square: square_box,
    original_square: square_box,
    letter: String
}

let tiles: square_box[][];

let piece_objects: a_piece[];


interface IProps {
}
interface IState {
  thePieces?: a_piece[];
  whiteEngineDepth: number,
  blackEngineDepth: number,
  numOfGames?: number;
  chessWebsite?: string;
  analyzeProgressPercent?: number;
  currentFen: string;
  correctMoves?: string[];
  currentDraggingSquare: square_box;
  canMove?: boolean;
  currentPieces: string[];
  boardChange: boolean;
  isSomethingDragging: boolean;
  allMistakes?: MistakeObject[];
  currentMistakeNum?: number;
  isPlayingMistakes: boolean;
  sessionId?: string;
  playerColour: string;
  isCorrectMove: boolean;
  wasFalseMove: boolean;
  blackMaterialEval: boolean;
  blackLegalMovesEval: boolean;
  whiteMaterialEval: boolean;
  whiteLegalMovesEval: boolean;
  toMoveColour: string;
  keepPlaying: boolean;
  isGameOver: boolean;
}

let current_user: String;
let puzzleFen: string;
let blackEngineDepth: number = 1;
let whiteEngineDepth: number = 1;
let numOfGames: number = 1;

let nextBoard: string[];
let previousBoard: string[];
let scoreChange: string;
let correctBoard: string[];

let mistakeObjects: MistakeObject[] = [];
let newBoardSetup: MoveMade = {
    moveLegal: false,
    FEN: '',
    newBoard: ['', '']
};

let number: number;

export class ChessBoardLandingPage extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
        setup();


        const pieces = this.initialize_pieces(true)
        this.state = {
            thePieces: pieces,
            whiteEngineDepth: 1,
            blackEngineDepth: 1,
            numOfGames: 5,
            analyzeProgressPercent: 0,
            boardChange: false, 
            currentPieces: ["start", "end"],
            isSomethingDragging: false,
            currentDraggingSquare: {
                x_cord: -10,
                y_cord: -10,
                box_style: box_style,
                current_chess_square: "NA"
            },
            isPlayingMistakes: false,
            playerColour: 'white',
            isCorrectMove: false,
            wasFalseMove: false,
            currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            blackMaterialEval: false,
            blackLegalMovesEval: false,
            whiteMaterialEval: false,
            whiteLegalMovesEval: false,
            toMoveColour: "white",
            keepPlaying: true,
            isGameOver: false
        };
        this.handleClick =  this.handleClick.bind(this);
        this.playMistake =  this.playMistake.bind(this);
        this.playCorrectMove =  this.playCorrectMove.bind(this);
        this.placeOriginalBoard = this.placeOriginalBoard.bind(this);
        this.handleWhiteDepthBarChange = this.handleWhiteDepthBarChange.bind(this);
        this.handleBlackDepthBarChange = this.handleBlackDepthBarChange.bind(this);

        this.handleWhiteMaterialRadioChange = this.handleWhiteMaterialRadioChange.bind(this);
        this.handleWhiteLegalMovesRadioChange = this.handleWhiteLegalMovesRadioChange.bind(this);
        this.handleBlackMaterialRadioChange = this.handleBlackMaterialRadioChange.bind(this);
        this.handleBlackLegalMovesRadioChange = this.handleBlackLegalMovesRadioChange.bind(this);

        this.makeAMove = this.makeAMove.bind(this);

        this.startGame = this.startGame.bind(this);

        this.handleNumGamesChange = this.handleNumGamesChange.bind(this);
        this.handleDragStop = this.handleDragStop.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.callMoveFunction = this.callMoveFunction.bind(this);
        this.setNewBoard = this.setNewBoard.bind(this);
        this.onMouseDownPiece = this.onMouseDownPiece.bind(this);

        this.pieceDropped = this.pieceDropped.bind(this);

        this.getThisSessionId = this.getThisSessionId.bind(this);

        this.getPieceMoveTo = this.getPieceMoveTo.bind(this);

        this.stopGame = this.stopGame.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.startGame = this.startGame.bind(this);

        this.resetkeepPlayingState = this.resetkeepPlayingState.bind(this);

        this.setUpABoard = this.setUpABoard.bind(this);

        this.onChangeFen = this.onChangeFen.bind(this);

        this.setState({canMove: false})

        this.solvePuzzle = this.solvePuzzle.bind(this);

        this.puzzleMove = this.puzzleMove.bind(this);

    }

    componentDidMount() {
        console.log("Component mounted");
        this.getThisSessionId();
      }

    async getThisSessionId(){
        const thisSessionId = await getSessionId();
        this.setState({
            sessionId: thisSessionId
        });
    }

    componentWillMount() {
        setup();
        // this.state = this.initialize_pieces(true);
    }

    decode_str_position(letter: String, the_num: number) {
        const x_cord = letter.charCodeAt(0) - 97;
        const y_cord = 8 - the_num;
    
        return tiles[y_cord][x_cord]
    }

    getCurrentLineup() {
        return nextBoard;
    }

    initialize_pieces(is_starting:boolean) {

        piece_objects = [];
    
        let these_pieces:string[];
    
        if(is_starting=== true){
            these_pieces = getDefaultLineup();
        }
        else{
            these_pieces = this.getCurrentLineup();
        }
    
        for (let i = 0; i < these_pieces.length; i++) {
            const piece_str = these_pieces[i];
            const position_str = piece_str.split("@")[1]
            const the_letter = position_str.charAt(0);
            const the_num_pos = Number(position_str.charAt(1));
    
            const piece_name = piece_str.split("@")[0];
            const piece_object = { 
                                    unique_id: "hello", 
                                    current_square: this.decode_str_position(the_letter, the_num_pos), 
                                    original_square: this.decode_str_position(the_letter, the_num_pos),
                                    letter: piece_name
                                };
    
            piece_objects.push(piece_object);
        }
        return piece_objects;
    }

    setTheBoard(these_pieces: string[]) {
        console.log("Setting the board");

        piece_objects = [];
        for (let i = 0; i < these_pieces.length; i++) {
            const piece_str = these_pieces[i];
            const position_str = piece_str.split("@")[1]
            const the_letter = position_str.charAt(0);
            const the_num_pos = Number(position_str.charAt(1));
    
            const piece_name = piece_str.split("@")[0];
            const piece_object = { 
                unique_id: "hello", 
                current_square: this.decode_str_position(the_letter, the_num_pos), 
                letter: piece_name,
                original_square: this.decode_str_position(the_letter, the_num_pos)
            };
        
            piece_objects.push(piece_object);
        }

        this.setState({currentPieces: these_pieces, thePieces: piece_objects});
        return piece_objects;
    }

    setUpMistakes(mistakeObjects: MistakeObject[]) {

        for (let i in mistakeObjects) {
            const aMistake = mistakeObjects[i];
          }

        previousBoard = mistakeObjects[0].lastBoard;
        nextBoard = mistakeObjects[0].currentBoard;
        scoreChange = mistakeObjects[0].scoreChange;
        correctBoard = mistakeObjects[0].correctBoard;

        const new_pieces = this.setTheBoard(mistakeObjects[0].lastBoard);
        alert("Showing mistakes")
        this.setState({canMove: true})

        this.setState({
            thePieces: new_pieces,
            currentFen: mistakeObjects[0].lastBoardFEN,
            allMistakes: mistakeObjects,
            currentMistakeNum: 0,
            isPlayingMistakes: true,
            playerColour: mistakeObjects[0].myColour
        }
        );
    }

    SetMistake(mistakeNum: number){

        if(mistakeNum < this.state.allMistakes!.length){
            const new_pieces = this.setTheBoard(mistakeObjects[mistakeNum].lastBoard);
            console.log("Setting new mistake")
            this.setState({
            thePieces: new_pieces,
            currentFen: this.state.allMistakes![mistakeNum].lastBoardFEN,
            currentMistakeNum: mistakeNum,
            isPlayingMistakes: true,
            playerColour: mistakeObjects[mistakeNum].myColour
        });
        }
        else{
            console.log("No more mistakes to show");
        }

    }

    _onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        current_user = newValue
    }

    onChangeFen = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        puzzleFen = newValue
    }

    async handleClick(event: MouseEvent) {
        this.getProgress();
        mistakeObjects = await getMistakes(current_user, numOfGames, blackEngineDepth, this.state.chessWebsite, this.state.sessionId);
        console.log("Mistake objects: ", mistakeObjects)
        this.setUpMistakes(mistakeObjects);
    }

    async getProgress(){
        let isFinished = false
        while(isFinished === false) {
            await this.delay(1000);
            const ans = await checkPoll(this.state.sessionId);
            //console.log("HERE IS: ", ans)
            const percentageFinished = ans["numProcessed"]/ans["outOf"]
            const totalGames = ans["outOf"]
            //console.log("NUMBER IS: ", Number(percentageFinished*100))
            isFinished = ans["Finished"]
            if(totalGames !== -1){
                this.setState({
                    analyzeProgressPercent: Number(percentageFinished*100)
                });
            }
            
        }
    }

    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    playCorrectMove(event: MouseEvent) {
        console.log("Playing mistake move");
        const new_pieces = this.setTheBoard(correctBoard);
        this.setState({
            thePieces: new_pieces
        });
    }

    playMistake(event: MouseEvent) {
        console.log("Playing mistake move");
        const new_pieces = this.setTheBoard(nextBoard);
        this.setState({
            thePieces: new_pieces
        });
    }

    placeOriginalBoard(event: MouseEvent) {
        console.log("Original Board");
        const new_pieces = this.setTheBoard(previousBoard);
        this.setState({
            thePieces: new_pieces
        });
    }

    displaySelectedMistakeBoard(mistake: MistakeObject) {
        console.log('Displaying selected mistake')

        previousBoard = mistake.lastBoard;
        nextBoard = mistake.currentBoard;
        scoreChange = mistake.scoreChange;
        correctBoard = mistake.correctBoard;

        this.setState({
            thePieces: this.setTheBoard(mistake.lastBoard)
        }
        );
    }

    coordsToPosition(x:number, y:number) {
        const xVal = this.state.currentDraggingSquare!.x_cord+ (Math.round(x / square));
        const yVal = this.state.currentDraggingSquare!.y_cord+(Math.round(y / square));
        return {
            xVal,
            yVal,
            pos: encodeStrPosition(xVal, yVal)
        }
    }


    handleWhiteDepthBarChange(e: ChangeEvent<HTMLInputElement>){
        whiteEngineDepth = Number.parseInt(e.target.value);
        this.setState({ whiteEngineDepth: Number.parseInt(e.target.value) })
    }

    handleBlackDepthBarChange(e: ChangeEvent<HTMLInputElement>){
        blackEngineDepth = Number.parseInt(e.target.value);
        this.setState({ blackEngineDepth: Number.parseInt(e.target.value) })
    }

    handleNumGamesChange(e: ChangeEvent<HTMLInputElement>){
        numOfGames = Number.parseInt(e.target.value);
        this.setState({ numOfGames: Number.parseInt(e.target.value) })
    }


    handleWhiteMaterialRadioChange(e: React.FormEvent<HTMLInputElement>){
        this.setState({whiteMaterialEval: !this.state.whiteMaterialEval});
    }

    handleWhiteLegalMovesRadioChange(e: React.FormEvent<HTMLInputElement>){
        this.setState({whiteLegalMovesEval: !this.state.whiteLegalMovesEval});
    }

    handleBlackMaterialRadioChange(e: React.FormEvent<HTMLInputElement>){
        this.setState({blackMaterialEval: !this.state.blackMaterialEval});
    }

    handleBlackLegalMovesRadioChange(e: React.FormEvent<HTMLInputElement>){
        this.setState({blackLegalMovesEval: !this.state.blackLegalMovesEval});
    }



    onDragStart(e:DraggableEvent, dragData: DraggableData){

        this.render();
        const theCurrentTile = this.decode_str_position(dragData.node.id.charAt(0), Number(dragData.node.id.charAt(1)))

        console.log(theCurrentTile);

        if( this.state.isSomethingDragging === false) {
            this.setState(
                {
                    currentDraggingSquare: theCurrentTile,
                    isSomethingDragging: true
                });
        }

        e.stopPropagation();
        e.preventDefault();
        //this.setState({currentDraggingX: })
    }

    onMouseDownPiece(e:MouseEvent){
        e.stopPropagation();
        e.preventDefault();
    }

    onDrag(e:DraggableEvent, dragData: DraggableData){
        const thisVariable = 0;
        //console.log(dragData.x, dragData.y);
        e.stopPropagation();
        e.preventDefault();
    }

    pieceDropped(e: MouseEvent){
        alert("PIECE DROPPED ----")
    }

    handleDragStop(e:DraggableEvent, dragData: DraggableData){
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            boardChange: false,
            isSomethingDragging: false
        })
        
        this.callMoveFunction(dragData);

        
    }

    getPieceMoveTo(dragData: DraggableData){
        if (this.state.playerColour === 'white'){
            return this.coordsToPosition(dragData.x, dragData.y);
        }
        else{
            return this.coordsToPosition(7-dragData.x, 7-dragData.y);
        }
    }


    async callMoveFunction(dragData: DraggableData){

        const dragTo = this.getPieceMoveTo(dragData);
        console.log("DRAGGING TO: ", dragTo);

        const move_uci = this.state.currentDraggingSquare!.current_chess_square+dragTo.pos;

        if (this.state.canMove === true){
            newBoardSetup = await makeMove(this.state.currentFen!, move_uci);

            console.log(newBoardSetup)
            
            if(this.state.isPlayingMistakes === true && newBoardSetup["moveLegal"] === true){
                if(this.state.allMistakes![this.state.currentMistakeNum!].correctMove === move_uci){
                    this.setNewBoard(newBoardSetup);
                    console.log("Correct Move");
                    this.setState({
                        isCorrectMove: true
                    })
                    delay(1000).then(any=>{
                        this.setState({
                            isCorrectMove: false
                        })
                        console.log("Waited");
                        this.SetMistake(this.state.currentMistakeNum!+1)
                    } 
                    );
                }
                else{
                    this.setNewBoard(newBoardSetup);
                    this.setState({
                        wasFalseMove: true
                    })
                    delay(400).then(any=>{
                        this.setState({
                            wasFalseMove: false
                        })
                        console.log("Waited");
                        this.SetMistake(this.state.currentMistakeNum!)
                    } );
                    console.log("correct move: ", this.state.allMistakes![this.state.currentMistakeNum!].correctMove)
                    console.log("Played: ", move_uci);
                }
            }
        }
        
    }

    setNewBoard(boardData: MoveMade) {
        const new_pieces = this.setTheBoard(boardData.newBoard);
        this.setState({canMove: true})

        console.log("Setting new board");

        this.setState({
            thePieces: new_pieces,
            currentFen: boardData.FEN,
            isSomethingDragging: false
        })
    }


    resetkeepPlayingState(){
        this.setState({keepPlaying: true})
    }
    async startGame(event: MouseEvent) {
        if(this.state.currentFen === "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"){
            this.setState({toMoveColour: "white"})
        }
        this.setState({keepPlaying: true})
        console.log("Starting game");


        console.log(this.state.keepPlaying, this.state.isGameOver);

        await this.resetkeepPlayingState();
        console.log(this.state.keepPlaying, this.state.isGameOver);
        while(this.state.keepPlaying === true && this.state.isGameOver === false){
            await this.makeAMove();
        }
    }

    async makeAMove() {
        if(this.state.toMoveColour === "white"){
            //console.log(`White material Eval: ${this.state.whiteMaterialEval} and White legal moves eval: ${this.state.whiteLegalMovesEval}`);
            newBoardSetup = await makeEngineMove(this.state.currentFen, "white", this.state.whiteEngineDepth, this.state.whiteMaterialEval, this.state.whiteLegalMovesEval);
            this.setState({toMoveColour: "black"});
        }
        else{
            newBoardSetup = await makeEngineMove(this.state.currentFen, "black", this.state.blackEngineDepth, this.state.blackMaterialEval, this.state.blackLegalMovesEval);
            this.setState({toMoveColour: "white"});
        }
        this.setNewBoard(newBoardSetup);
    }

    async resetGame(event: MouseEvent) {

        this.initialize_pieces(true);
        setup();
        this.setState({keepPlaying: false, currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"})
        newBoardSetup = {
            moveLegal: false,
            FEN: '',
            newBoard: ['', '']
        };

    }

    async stopGame(event: MouseEvent) {
        this.setState({keepPlaying: false})

        newBoardSetup = {
            moveLegal: false,
            FEN: '',
            newBoard: ['', '']
        };

    }

    async puzzleMove(wantedDepth: number) {
        newBoardSetup = await makePuzzleMove(this.state.currentFen, wantedDepth);
        this.setNewBoard(newBoardSetup);
        await this.delay(1000);
    }

    async solvePuzzle() {
        this.setState({keepPlaying: true}) 
        let thisDepth: number = 5;
        await this.resetkeepPlayingState();
        console.log(this.state.keepPlaying, this.state.isGameOver);
        while(this.state.keepPlaying === true && this.state.isGameOver === false){
            await this.puzzleMove(thisDepth);
            thisDepth = thisDepth-1;
        }
    }


    async setUpABoard(event: MouseEvent) {
        console.log("Setting board");
        console.log(puzzleFen);

        newBoardSetup = await getBoardString(puzzleFen);


        this.setNewBoard(newBoardSetup);
        this.setState({
            currentFen: puzzleFen
        })
    }


    render() {
        //const engineDepth = this.state.engineDepth;
        //const numOfGames = this.state.numOfGames;
        // const boardStyles = {position: 'relative', overflow: 'hidden', width: '100%', height: boardSize}
        //console.log("rendering")
        setup();

        const all_tiles = this.get_tiles();
        const pieceTiles = this.getPiecePosition();
        return(
            <Container fluid>
                <Grid stackable>
                    <Grid.Row style={{height:totalBoardSizeStr}}>
                        <Grid.Column width={4}>
                        <Card style={{position: 'relative', paddingLeft: '5px', paddingTop: '5px', paddingRight: '5px', backgroundColor: '#8edec3', opacity: 0.7}}>
                                <Grid.Row>
                                    <Divider horizontal>
                                        <Header as='h2'>
                                            Puzzle Solver
                                        </Header>

                                        <Header as='h5'>
                                            *Solves up to CheckMate in 3 Puzzles*
                                        </Header>

                                        <Header as='h5'>Puzzle FEN:</Header>
                                        <Input style={{width: '90%'}} onChange={this.onChangeFen}></Input>
                                        <Header as='h4'> </Header>
                                        <Button style={{width:"100%", backgroundColor: '#ffffff'}} basic color='black' onClick={this.setUpABoard} content='Import FEN' />
                                    </Divider>
                                    
                                </Grid.Row>
                                <Grid.Row>
                                    <Divider horizontal>
                                        <Header as='h4'>
                                             
                                        </Header>
                                    </Divider>
                                    <Button style={{width:"100%"}} basic color='black' onClick={this.solvePuzzle} content='Play Puzzle' />
                        
                                </Grid.Row> 
                            </Card>

                        
                        </Grid.Column>

                        <Grid.Column className="chess board whole grid" width={8} style={{height:totalBoardSizeStr, width: totalBoardSizeStr} } >
                            <Grid>
                                {pieceTiles}
    
                            </Grid>
                        </Grid.Column>
                        <Grid.Column width={4}>
                        <Card style={{position: 'relative', paddingLeft: '5px', paddingTop: '5px', paddingRight: '5px', backgroundColor: '#99c7e0'}}>
                                <Grid.Row>
                                    <Divider horizontal>
                                    <Header as='h2'>
                                            Game Simulation
                                        </Header>
                                        <Header as='h4'>
                                            White Player AI Settings
                                        </Header>
                                    </Divider>
                                    <Form>
                                        <Form.Field>
                                            <Header as='h5'>Evaluation Functions</Header>
                                        </Form.Field>
                                        <Form.Field>

                                            <Checkbox toggle label='Material Scoring' 
                                                onChange={this.handleWhiteMaterialRadioChange}
                                                checked={this.state.whiteMaterialEval === true}
                                                >
                    
                                            </Checkbox>

                                            <Checkbox toggle label='Num Legal Moves' 
                                                onChange={this.handleWhiteLegalMovesRadioChange}
                                                checked={this.state.whiteLegalMovesEval === true}
                                                >
                    
                                            </Checkbox>
                                        </Form.Field>

                                        <Header as='h5'>Engine Depth: {whiteEngineDepth}</Header>
                                        <input
                                            style={{width: '60%'}}
                                            type='range'
                                            min={1}
                                            max={4}
                                            value={whiteEngineDepth}
                                            onChange={this.handleWhiteDepthBarChange}
                                        />
                                    </Form>
                                </Grid.Row>

                                
                                
                                <Grid.Row>
                                    <Divider horizontal>
                                        <Header as='h4'>
                                            Black Player AI Settings
                                        </Header>
                                    </Divider>
                                    <Form>
                                        <Form.Field>
                                            <Header as='h5'> Evaluation Functions:</Header>
                                        </Form.Field>
                                        <Form.Field>

                                            <Checkbox toggle label='Material Scoring' 
                                                onChange={this.handleBlackMaterialRadioChange}
                                                checked={this.state.blackMaterialEval === true}
                                                >
                    
                                            </Checkbox>

                                            <Checkbox toggle label='Num Legal Moves' 
                                                onChange={this.handleBlackLegalMovesRadioChange}
                                                checked={this.state.blackLegalMovesEval === true}
                                                >
                    
                                            </Checkbox>
                                        </Form.Field>

                                        <Header as='h5'>Engine Depth: {blackEngineDepth}</Header>
                                        <input
                                            style={{width: '60%'}}
                                            type='range'
                                            min={1}
                                            max={4}
                                            value={blackEngineDepth}
                                            onChange={this.handleBlackDepthBarChange}
                                        />
                                    </Form>
                                </Grid.Row>

                                <Grid.Row>
                                    <Divider horizontal>
                                        <Header as='h4'>
                                             
                                        </Header>
                                    </Divider>
                                    <Button style={{width:"100%"}} basic color='black' onClick={this.startGame} content='Start Game' />
                                    <Button style={{width:"100%"}} basic color='black' onClick={this.stopGame} content='Stop Game' />
                                    <Button style={{width:"100%"}} basic color='black' onClick={this.resetGame} content='Reset' />
                        
                                </Grid.Row> 
                            </Card>

                        </Grid.Column>
                    </Grid.Row>
                </Grid>
          </Container>
        )
    }

    get_tiles(){
        const all_tiles = tiles.map(tileRow => {
            const some_tiles = tileRow.map(tile => {
                let listPieceInfo = piece_objects.filter(piece => piece.current_square.x_cord === tile.x_cord && piece.current_square.y_cord === tile.y_cord);
                return <div style={tile.box_style}></div>
            })
            return some_tiles;
        })
        return all_tiles
    }

    getPiecePosition(){
        //const newTiles = tiles.reverse();
        const all_tiles = tiles.map((tileRow, i) => {
            const newI = 8-i;
            return(
                    <Grid.Row stretched className="chess board grid row" columns={8} style={{width: totalBoardSizeStr}}>{
                    tileRow.map((tile, j) => {
                    let listPieceInfo;
                    if(this.state.playerColour === 'white'){
                        listPieceInfo = piece_objects.filter(piece => piece.current_square.x_cord === tile.x_cord && piece.current_square.y_cord === tile.y_cord);
                    }
                    else{
                        listPieceInfo = piece_objects.filter(piece => piece.current_square.x_cord === 7-tile.x_cord && piece.current_square.y_cord === 7-tile.y_cord);
                    }

                    if (listPieceInfo[0] !== undefined) {
                        if(this.state.currentDraggingSquare.current_chess_square === listPieceInfo[0].current_square.current_chess_square){
                            //console.log("DRAGGING THIS SQUARE NOW: ", this.state.currentDraggingSquare.current_chess_square);
                            return (
                                //returs
                                <Grid.Column stretched width={2} className={(i + j) % 2 === 0 ? "dragging light tile" : "dragging dark tile"}>
                                    <Draggable
                                        //bounds={{left: number, top: number, right: number, bottom: number}}
                                        //defaultPosition={{x: 50, y: 0}}
                                        position={{x: 0, y: 0}}
                                        onStop = {this.handleDragStop}
                                        onStart={this.onDragStart}
                                        onDrag={this.onDrag}
                                        
                                        //position={{x: (listPieceInfo[0].current_square.x_cord)*(square/10), y: (listPieceInfo[0].current_square.y_cord)*(square/10)}}
                                        >
                                        <div onMouseUp={e => this.pieceDropped(e)} className='DRAGGINGCHESSPIECE' draggable="true" id={`${listPieceInfo[0].current_square.current_chess_square}`}>{this.get_piece_picture(listPieceInfo[0].letter, 100)}</div>
                                    </Draggable>
                                    
                                </Grid.Column>
                                )
                        }
                        else {
                            return (
                                <Grid.Column stretched width={2} className={(i + j) % 2 === 0 ? "chess board grid column whiteTile" : "chess board grid column poopTile"}>
                                    <Draggable
                                        //bounds={{left: number, top: number, right: number, bottom: number}}
                                        //defaultPosition={{x: 50, y: 0}}
                                        position={{x: 0, y: 0}}
                                        onStop = {this.handleDragStop}
                                        onStart={this.onDragStart}
                                        //onDrag={this.onDrag}
                                        //position={{x: (listPieceInfo[0].current_square.x_cord)*(square/10), y: (listPieceInfo[0].current_square.y_cord)*(square/10)}}
                                        >
                                        <div onMouseUp={e => this.pieceDropped(e)} className='chess piece' draggable="false" id={`${listPieceInfo[0].current_square.current_chess_square}`}>{this.get_piece_picture(listPieceInfo[0].letter, 100)}</div>
                                    </Draggable>
                                    
                                </Grid.Column>
                                )
                        }
    
                    } else {
                        return(
                            <Grid.Column stretched width={2} className={(i + j) % 2 === 0 ? "chess board grid column whiteTile" : "chess board grid column poopTile"}>
                            </Grid.Column>
                        )
                    }
                })}
                </Grid.Row>

            )
        })
        return all_tiles
    }




    get_piece_picture(letter: String, size: Number) {
        switch (letter) {
            //WHITE PIECES
            case ("P"):
                return <img src={WhitePawn} id="piece" style={piece_style} onMouseUp={e => this.pieceDropped(e)}/>
            case ("R"):
                return <img src={WhiteRook} id="piece" style={piece_style}/>
            case ("N"):
                return <img src={WhiteKnight} id="piece" style={piece_style}/>
            case ("B"):
                return <img src={WhiteBishop} id="piece" style={piece_style}/>
            case ("Q"):
                return <img src={WhiteQueen} id="piece" style={piece_style} />
            case ("K"):
                return <img src={WhiteKing} id="piece" style={piece_style}/>
            //BLACK PIECES
    
            case ("p"):
                return <img src={BlackPawn} id="piece" style={piece_style}/>
            case ("r"):
                return <img src={BlackRook} id="piece" style={piece_style}/>
            case ("n"):
                return <img src={BlackKnight} id="piece" style={piece_style}/>
            case ("b"):
                return <img src={BlackBishop} id="piece" style={piece_style}/>
            case ("q"):
                return <img src={BlackQueen} id="piece" style={piece_style}/>
            case ("k"):
                return <img src={BlackKing} id="piece" style={piece_style}/>
        }
    }
    
}

export function setup(): square_box[][] {

    tiles = [];

    let count = 0;
    let temp_Square_tiles: square_box[];
    let change=true;

    for (let y = 0; y < 8; y++) {
        count = count + 1;

        temp_Square_tiles = [];

        change=true
        
        for (let x = 0; x < 8; x++) {
            //colour is white
            let backgroundColor = '#f0d9b5';

            if (count % 2 === 0) {
                //colour is black
                backgroundColor = '#b58863';
            }
            const top = y;
            
            //clear set to none will keep on same line
            let clear='none';
            let this_style = Object.assign({ backgroundColor, top, clear}, box_style);

            //To make a new line of squares
            if(change===true){
                const clear = 'left';
                this_style = Object.assign({ backgroundColor, top, clear}, box_style);
            }

            const chesSquare = encodeStrPosition(x, y);
            const temp_square = { x_cord: x, y_cord: y, box_style: this_style, current_chess_square: chesSquare }

            count = count + 1
            temp_Square_tiles.push(temp_square)

            change=false
        }

        tiles.push(temp_Square_tiles)
    }
    return tiles;
}


export function encodeStrPosition(x_cord: number, y_cord: number) {
    const letter = String.fromCharCode(x_cord+97)
    const the_num = 8-y_cord;

    return `${letter}${the_num}`
}

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}