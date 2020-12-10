import chess
import chess.svg
import EvaluationFunctions
from copy import deepcopy
import time
from random import shuffle

'''
MiniMax Function -> Implemented from slides

INPUTS:
    aBoard -> python-chess Board() Object containing the current board
    maximizingPlayer -> True if it is white's move, false if black's move
    evaluationDict -> Dictionary containing the evaluation functions to score each board
    alpha -> max Value we are looking for to prune tree
    beta -> min Value we are looking for to prune tree
    weightDict -> Dictionary of weights to combine with evaluation scores
    depth -> Integer of search depth we want to look before recursing up

OUTPUTS:
    eval - evaluation of position afte rmove
    move - bestMove
    nodesReached - number of nodes reached in the search
'''


def minMaxMove(aBoard, maximizingPlayer, evaluationDict, alpha, beta, weightDict, depth=3, nodesReached=0):

    #Base Case
    #Check if depth has been reached - or other stopping criteria
    if (depth == 0 or aBoard.is_checkmate() or aBoard.is_stalemate()):
        nodesReached+=1
        return EvaluationFunctions.getEvaluation(aBoard, evaluationDict, weightDict), None, nodesReached
    
    #when its white's move
    elif(maximizingPlayer == True):
        #initialize vars
        maxEval = -1000000
        maxMove = None
        listOfMoves = list(aBoard.legal_moves)
        #Shuffle legal moves (for more randomness in games)
        shuffle(listOfMoves)
        for move in listOfMoves:
            aBoard.push(move)

            #Recursive call on potential move - next being black's move
            theEval, theMove, nodesReached = minMaxMove(aBoard, False, evaluationDict, alpha, beta, weightDict, depth=depth-1, nodesReached=nodesReached+1)
            aBoard.pop()

            #Find max evaluation
            if(theEval >= maxEval):
                maxEval = theEval
                maxMove = move

            #Get alpha value - should we prune this subtree?
            alpha = max(alpha, theEval)
            if(alpha > beta):
                break
        return maxEval, maxMove, nodesReached

    #If its black's move
    elif(maximizingPlayer == False):
        #initialize vars
        minEval = 100000
        minMove = None
        listOfMoves = list(aBoard.legal_moves)
        #Shuffle legal moves (for more randomness in games)
        shuffle(listOfMoves)
        for move in listOfMoves:
            aBoard.push(move)

            #Recursive call on potential move - next being white's move
            theEval, theMove, nodesReached = minMaxMove(aBoard, True, evaluationDict, alpha, beta, weightDict, depth=depth-1, nodesReached=nodesReached+1)
            aBoard.pop()

            if(theEval <= minEval):
                minEval = theEval
                minMove = move

            #Get beta value - should we prune this subtree?    
            beta = min(beta, theEval)
            if(beta < alpha):
                break

        return minEval, minMove, nodesReached


'''

Similar to General MiniMax function - just only uses legal moves evaluation function

'''
def puzzleSolveminMaxMove(aBoard, maximizingPlayer, alpha, beta, depth=3, nodesReached=0):
    
    #Base Case
    #Check if depth has been reached - or other stopping criteria
    if (depth == 0 or len((list)(aBoard.legal_moves)) == 0):
        nodesReached+=1
        return EvaluationFunctions.getCheckMateBoolean(aBoard), None, nodesReached
    
    #when its white's move
    elif(maximizingPlayer == True):
        #initialize vars
        maxEval = -1000000
        maxMove = None
        listOfMoves = sortMovesInCheck(aBoard)
        for move in listOfMoves:
            aBoard.push(move)

            #Recursive call on potential move - next being black's move
            theEval, theMove, nodesReached = puzzleSolveminMaxMove(aBoard, False, alpha, beta, depth=depth-1, nodesReached=nodesReached+1)
            aBoard.pop()

            #Find max evaluation
            if(theEval >= maxEval):
                maxEval = theEval
                maxMove = move

            #Get alpha value - should we prune this subtree?
            alpha = max(alpha, theEval)
            if(alpha > beta):
                break
        return maxEval, maxMove, nodesReached

    #If its black's move
    elif(maximizingPlayer == False):
        #initialize vars
        minEval = 100000
        minMove = None
        
        listOfMoves = sortMovesInCheck(aBoard)
        for move in listOfMoves:
            aBoard.push(move)

            #Recursive call on potential move - next being white's move
            theEval, theMove, nodesReached = puzzleSolveminMaxMove(aBoard, True, alpha, beta, depth=depth-1, nodesReached=nodesReached+1)
            aBoard.pop()

            if(theEval <= minEval):
                minEval = theEval
                minMove = move

            #Get beta value - should we prune this subtree?    
            beta = min(beta, theEval)
            if(beta < alpha):
                break

        return minEval, minMove, nodesReached

'''
This function gets the dictionary of what the evaluation criteria will be for a certain player

'''
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


''''
Define weights of evaluation criteria here
'''

def getWeightDictionary():

    weightDict = {}
    weightDict["PieceScoring"] = 1
    weightDict["PossibleMovesScoring"] = 0.1

    return weightDict


'''

Wrapper function for MiniMax function

'''
def makeAMove(aBoard, evaluationDict, weightDict, depth):
    whiteToMove=True
    if(aBoard.turn == chess.BLACK):
        whiteToMove=False

    #print("Calling minMaxMove with params: ")
    #print("whiteToMove: ", whiteToMove, " evaluationDict: ", evaluationDict, "weight dict", weightDict, "depth: ", depth)
    currentEval, theMove, nodesReached = minMaxMove(aBoard, whiteToMove, evaluationDict, -10000000000, 1000000000, weightDict, depth=depth)


    return currentEval, theMove, nodesReached

'''

Wrapper function for Puzzle MiniMax

'''

def makePuzzleMove(aBoard, depth):
    whiteToMove=True
    if(aBoard.turn == chess.BLACK):
        whiteToMove=False

    currentEval, theMove, nodesReached = puzzleSolveminMaxMove(aBoard, whiteToMove, -10000000000, 1000000000, depth=depth)


    return currentEval, theMove, nodesReached


'''
For puzzle purposes, we first want to check moves that put the opponent in check

'''
def sortMovesInCheck(board):
    allMoves = list(board.legal_moves)

    outputList = []
    tempList = []

    for tempMove in allMoves:
        board.push(tempMove)
        if(board.is_check() == True or board.is_checkmate() == True):
            outputList.append(tempMove)
        else:
            tempList.append(tempMove)

        board.pop()

    outputList.extend(tempList)

    return outputList

'''
Check if there is a checkmate available in the current position

'''

def getCheckMate(aBoard):
    allMoves = list(aBoard.legal_moves)
    for tempMove in allMoves:
        aBoard.push(tempMove)
        if(aBoard.is_checkmate() == True):
            print("Found checkmate here")
            aBoard.pop()
            return True, tempMove
        aBoard.pop()

    return False, None