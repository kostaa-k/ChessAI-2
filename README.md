### CP468 Term Project

## Installation

Requirements
1. Install nodejs with npm -> https://nodejs.org/en/blog/release/v12.18.4/
2. Install python -> https://www.python.org/downloads/release/python-380/

## How to Run

Clone the repo
`git clone https://github.com/kostaa-k/ChessAI-2.git`

#### Front End
1. `CD to 'UI' folder`
2. `npm install`
3. `npm start`

#### Back End
1. `CD to 'python-backend' folder`
2. `pip install -r requirements.txt`
3. Use flask:
- Windows CMD: SET FLASK_APP= controller.py
- Powershell: $env:FLASK_APP ="controller.py"
- Unix: export FLASK_APP=controller.py
4. `flask run`

## How to use
Using the menu on the left choose between 'Game Simulator' or 'Puzzle Solver' which will change the input menus

#### Game Simulator 
1. Using the input buttons and slider, set the Material Scoring, Num Legal Moves and Engine Depth for the White and Black players
2. Click 'Start Game' to begin the game

![Game Simulator Image](https://github.com/kostaa-k/ChessAI-2/blob/master/Site-Images/GameSimulation.PNG)

#### Puzzle Solver
1. Using the textbox, enter in the FEN</p>
FEN Example: `5rk1/7p/6p1/8/3B2N1/6P1/6K1/8 w - - 0 1`</p>
`Note: Puzzle Solver can only solve checkmate puzzles <= 3 moves`
2. Click 'Import FEN'
3. Click 'Solve Puzzle' to solve the imported puzzle

![Puzzle Solver Image](https://github.com/kostaa-k/ChessAI-2/blob/master/Site-Images/PuzzleSolver.PNG)

## Find Puzzle FEN's here
- checkmate in 2 http://wtharvey.com/m8n2.txt
- checkmate in 3 http://wtharvey.com/m8n3.txt
