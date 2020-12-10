from flask import Flask, request
from flask_cors import CORS, cross_origin

from copy import deepcopy

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

numOfGames = 0

'''

Function to get the correct return type for the front end to set the board


'''

def getStringArray(aBoard):
    boardArray = []
    for key in aBoard.piece_map():
        boardArray.append(aBoard.piece_map()[key].symbol()+"@"+chess.square_name(key))

    return boardArray

'''

Make Engine Move Endpoint

- Needs FEN, EngineDepth, MaterialEval, and MovesEval as Arguments

'''

@app.route('/makeEngineMove',  methods=['GET', 'POST'])
@cross_origin(origin='localhost')
def example_func():

    theFen = request.args.get('FEN')
    engineDepth = (int)(request.args.get("EngineDepth"))

    materialEvalStr = (request.args.get("MaterialEval"))
    movesEvalStr = (request.args.get("MovesEval"))

    global numOfGames
    originalGameNum = deepcopy(numOfGames)
    firstBoard = False
    
    #gameNum = (int)(request.args.get("GameNum"))

    if(theFen == "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"):
        numOfGames = numOfGames+1
        firstBoard = True

    #print("material eval stR: ", materialEvalStr, "movesEval str: ", movesEvalStr)

    materialEval = True
    if(materialEvalStr == "false"):
        materialEval=False
    
    movesEval = True
    if(movesEvalStr == "false"):
        movesEval=False


    #print("fen: ", theFen)
    print("Engine depth: ", engineDepth)

    print("Matieral eval:", materialEval, "Moves eval:", movesEval)

    board = chess.Board(fen=theFen)

    evalDict = chessFunctions.getEvaluationDictionary(materialEval, movesEval)
    weightDict = chessFunctions.getWeightDictionary()

    startTime = time.time()
    theEval, theMove, nodesReached = chessFunctions.makeAMove(board, evalDict, weightDict, engineDepth)


    returnDict = {}
    board.push(theMove)
    returnDict["FEN"] = (str)(board.fen())
    newBoardArray = getStringArray(board)
    returnDict["newBoard"] = newBoardArray

    endTime = time.time()
    elapsedTime = (endTime-startTime)

    print()
    print("Move is: ", theMove)
    print(board)
    print()
    print("Elapsed Time: ", round(elapsedTime, 2), "seconds")
    print("Nodes Reached: ", nodesReached)
    print()
    print()

    if(firstBoard == True or originalGameNum==numOfGames):
        return returnDict


'''
Set Board Endpoint

-> Just needs FEN as arguments

'''


@app.route('/SetBoard',  methods=['GET', 'POST'])
@cross_origin(origin='localhost')
def getBoardStrBack():
    theFen = request.args.get('FEN')
    print("FEN:", theFen)

    board = chess.Board(fen=theFen)
    returnDict = {}
    returnDict["FEN"] = (str)(board.fen())
    newBoardArray = getStringArray(board)
    returnDict["newBoard"] = newBoardArray
    return returnDict


'''

Solve Puzzle Endpoint
-> Just needs the FEN as argument

'''

@app.route('/SolvePuzzle',  methods=['GET', 'POST'])
@cross_origin(origin='localhost')
def solvePuzzle():
    theFen = request.args.get('FEN')
    print("FEN:", theFen)

    engineDepth = (int)(request.args.get("EngineDepth"))
    print("Engine Depth:", engineDepth)

    board = chess.Board(fen=theFen)

    isCheckMate, theMove = chessFunctions.getCheckMate(board)

    returnDict = {}
    if(isCheckMate == True):
        board.push(theMove)
        returnDict["FEN"] = (str)(board.fen())
        newBoardArray = getStringArray(board)
        returnDict["newBoard"] = newBoardArray
        print("Found checkmate")
        return returnDict

    theEval, theMove, nodesReached = chessFunctions.makePuzzleMove(board, engineDepth)
    
    board.push(theMove)
    returnDict["FEN"] = (str)(board.fen())
    newBoardArray = getStringArray(board)
    returnDict["newBoard"] = newBoardArray
    
    
    return returnDict


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.debug)