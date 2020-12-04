import chess
import chess.svg
import EvaluationFunctions
from copy import deepcopy
import time
from random import shuffle


def minMaxMove(aBoard, maximizingPlayer, evaluationDict, alpha, beta, weightDict, depth=3):
    if (depth == 0 or aBoard.is_checkmate()):
        return EvaluationFunctions.getEvaluation(aBoard, evaluationDict, weightDict), None
    elif(maximizingPlayer == True):
        maxEval = -1000000
        maxMove = None
        listOfMoves = list(aBoard.legal_moves)
        shuffle(listOfMoves)
        for move in listOfMoves:
            aBoard.push(move)
            theEval, theMove = minMaxMove(aBoard, False, evaluationDict, alpha, beta, weightDict, depth=depth-1)
            #print(theEval, move, depth, "Maximizing")
            aBoard.pop()
            if(theEval >= maxEval):
                maxEval = theEval
                maxMove = move
            alpha = max(alpha, theEval)
            if(alpha > beta):
                break
        return maxEval, maxMove
    elif(maximizingPlayer == False):
        minEval = 100000
        minMove = None
        listOfMoves = list(aBoard.legal_moves)
        shuffle(listOfMoves)
        for move in listOfMoves:
            aBoard.push(move)
            theEval, theMove = minMaxMove(aBoard, True, evaluationDict, alpha, beta, weightDict, depth=depth-1)
            #print(theEval, move, depth, "Minimizing")
            aBoard.pop()
            if(theEval <= minEval):
                minEval = theEval
                minMove = move
                
            beta = min(beta, theEval)
            if(beta < alpha):
                #print("Breaking because move: ", move, alpha, beta)
                break
        return minEval, minMove


def getEvaluationDictionary(toEvaluateMaterial, toEvaluatePossibleMoves):
    evaluationDict = {}

    if(toEvaluateMaterial == False and toEvaluatePossibleMoves == False):
        return None
    
    if(toEvaluateMaterial == True):
        evaluationDict["PieceScoring"] = {}
        evaluationDict["PieceScoring"]["function"] = EvaluationFunctions.getMaterialScore

    if(toEvaluatePossibleMoves == True):
        evaluationDict["PossibleMovesScoring"] = {}
        evaluationDict["PossibleMovesScoring"]["function"] = EvaluationFunctions.getPossibleMoveNums

    return evaluationDict


def getWeightDictionary():

    weightDict = {}
    weightDict["PieceScoring"] = 1
    weightDict["PossibleMovesScoring"] = 0.1

    return weightDict

def makeAMove(aBoard, evaluationDict, weightDict, depth):
    whiteToMove=True
    if(aBoard.turn == chess.BLACK):
        whiteToMove=False

    print("Calling minMaxMove with params: ")
    print("whiteToMove: ", whiteToMove, " evaluationDict: ", evaluationDict, "weight dict", weightDict, "depth: ", depth)
    currentEval, theMove = minMaxMove(aBoard, whiteToMove, evaluationDict, -10000000, 10000000, weightDict, depth=depth)


    return currentEval, theMove