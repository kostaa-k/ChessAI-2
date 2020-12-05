import chess


def getPieceScores():
    pieceScores = {}
    pieceScores[chess.PAWN] = 10
    pieceScores[chess.KNIGHT] = 30
    pieceScores[chess.BISHOP] = 30
    pieceScores[chess.ROOK] = 50
    pieceScores[chess.QUEEN] = 90
    pieceScores[chess.KING] = 900

    return pieceScores

def getMaterialScore(theBoard, pieceScores):
    baseBoard = chess.BaseBoard(board_fen=theBoard.board_fen())
    totalScore = 0
    allPieces = baseBoard.piece_map()
    for key, value in allPieces.items():
        if(value.color == chess.WHITE):
            totalScore = totalScore+pieceScores[value.piece_type]
        else:
            totalScore = totalScore-pieceScores[value.piece_type]
    
    return totalScore


def getPossibleMoveNums(theBoard, pieceScores):
    theBoard.turn = chess.WHITE
    whiteLegalMoves = theBoard.legal_moves.count()
    theBoard.turn = chess.BLACK
    blackLegalMoves = theBoard.legal_moves.count()
    
    return whiteLegalMoves-blackLegalMoves


def getEvaluation(aBoard, evaluationDict, weightDict):
    if(aBoard.is_checkmate()):
        if(aBoard.turn == chess.WHITE):
            return -100000
        else:
            return 100000
    elif(aBoard.is_game_over(claim_draw=True)):
        return 0
    elif(aBoard.is_stalemate() == True):
        return 0
    
    totalScore = 0
    for key, value in evaluationDict.items():
        tempScore = (value["function"](aBoard, getPieceScores()))*weightDict[key]
        totalScore = totalScore+tempScore
    
    return totalScore