import axios from 'axios';

export interface MistakeObject {
    lastBoard: string[];
    currentBoard: string[];
    scoreChange: string;
    correctBoard: string[];
    move: string;
    lastBoardFEN: string;
    correctMove: string;
    myColour: string;
}

export interface MoveMade {
    moveLegal: boolean;
    FEN: string;
    newBoard: string[]; 
}

export async function getMistakes(lichess_username: String, numOfGames: number, engineDepth: number, chessWebsite?: string, sessionId?: string) : Promise<MistakeObject[]>{
    const urlEndpoint = `http://127.0.0.1:5000/example_endpoint?username=${lichess_username}&numOfGames=${numOfGames}&engineDepth=${engineDepth}&chessWebsite=${chessWebsite}&sessionId=${sessionId}`;
    const boardString = await (axios.get(urlEndpoint));

    const boardArray = boardString["data"];

    console.log("Got Result Back:");
    console.log(boardArray);

    return boardArray;
}


export async function checkPoll (sessionId?: string) {
    const dataBack = await (axios.get(`http://127.0.0.1:5000/polling?sessionId=${sessionId}`));
    const response = dataBack["data"];
    return response

}

export async function makeMove(fen: string, move_uci: string) : Promise<MoveMade>{

    console.log(move_uci);

    const urlEndpoint = `http://127.0.0.1:5000/isMovePossible?FEN=${fen}&move_uci=${move_uci}`;

    const answer = await (axios.get(urlEndpoint));

    console.log("Got answer: ", answer);
    const boardAnswer = answer["data"];

    return boardAnswer;
}   


export async function getSessionId() : Promise<string>{
    console.log("Getting session id")
    const dataBack = await (axios.get('http://127.0.0.1:5000/get_session_id'));
    const response = dataBack["data"];

    console.log(response);
    return response["sessionId"];

}


export async function makeEngineMove(fen: string, colourToMove: string, engineDepth: number, materialEval: boolean, legalMovesEval: boolean): Promise<MoveMade>{

    console.log("Getting move");

    const urlEndpoint = `http://127.0.0.1:5000/makeEngineMove?FEN=${fen}&EngineDepth=${engineDepth}&MaterialEval=${materialEval}&MovesEval=${legalMovesEval}`;

    console.log(urlEndpoint);

    const dataBack = await (axios.get(urlEndpoint));
    const boardAnswer = dataBack["data"];

    console.log(boardAnswer);

    return boardAnswer;
}

