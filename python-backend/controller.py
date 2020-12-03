from flask import Flask, request
from flask_cors import CORS, cross_origin

import json
import pandas
import chess
import datetime
import threading
import time
import sys
import io
import os
import random
import uuid
import chessFunctions

app = Flask(__name__)
cors = CORS(app)


def getStringArray(aBoard):
    boardArray = []
    for key in aBoard.piece_map():
        boardArray.append(aBoard.piece_map()[key].symbol()+"@"+chess.square_name(key))

    return boardArray


@app.route('/makeEngineMove',  methods=['GET', 'POST'])
@cross_origin(origin='localhost')
def example_func():
    theFen = request.args.get('FEN')
    engineDepth = (int)(request.args.get("EngineDepth"))

    materialEvalStr = (request.args.get("MaterialEval"))
    movesEvalStr = (request.args.get("MovesEval"))

    materialEval = True
    if(materialEvalStr == "false"):
        materialEval=False
    
    movesEval = True
    if(movesEvalStr == "false"):
        movesEval=False


    print("fen: ", theFen)
    print("Engine depth: ", engineDepth)

    print("Matieral and moves eval", materialEval, movesEval)

    board = chess.Board(fen=theFen)

    evalDict = chessFunctions.getEvaluationDictionary(materialEval, movesEval)
    weightDict = chessFunctions.getWeightDictionary()

    theEval, theMove = chessFunctions.makeAMove(board, evalDict, weightDict, engineDepth)


    returnDict = {}
    board.push(theMove)
    returnDict["FEN"] = (str)(board.fen())
    newBoardArray = getStringArray(board)
    returnDict["newBoard"] = newBoardArray

    print(theMove)
    print(board)
    return returnDict






if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.debug)