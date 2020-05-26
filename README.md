# holdem-monte-carlo-evaluator
javascript win/tie/loss evaluator for known Texas Hold'em hands vs unknown opponent hands, using the npm adaptation of 2+2 pascal evaluator (poker-evaluator). Useful input for poker bots' decision-making.

Parameters
------------------------------------------------
holdemMonteCarlo(hand,board,numberOpponents,opponentLags,numberRuns)

hand is an array of length two, either strings or integers

board is an array of length 0 to 5, either strings or integers -- but hand/board must match type!

numberOpponents is an integer between 1 and 9 (I think it can handle 10+, but haven't tested)

opponentLags is an array of length 0 to numberOpponents, each a number 0 to 1, specifying each opponent's tendency to be Loose-AGgressive (LAGgy) in this situation. It is the inverse of the opponent's range. For example, pre-flop, a player who folds 80% of hands would have a lag of .8 (80%). Pre-flop "lags" for this function can be thought of as VPIP (Voluntarily-Put-money-In-Pot). A player with a VPIP of .15 has a lag of .15, whereas a player who plays ATC (any two cards) has a lag of 1. Default value for unspecified lags is 1. Loose maniacs have lags close to 1 anyway, so it's a good approximation. There's probably a significant error in "chaining" lags together from street to street, plus lots of human players play "ranges" instead of perfectly clear cutoffs. Nonetheless, using a player's VPIP on a street as their lag value is quite useful for approximating the odds of one's hand win/lose/tie -ing on a street against certain opponents.

numberRuns is integer number of Monte Carlo simulated hands to run. Adjust this up or down depending on time constraints, processing power, and needed accuracy.

Example 1: (no lags specified, lags default to 1, Aces win a simulated 73% of the time all-in preflop vs 2 loose maniac opponents playing their full ranges, or ATC - any two cards:

holdemMonteCarlo(["As","Ad"],[],2,[],100000)'
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Hand: As,Ad
Board: , 2 opponents, 100000 runs
won: 73.31%
tied: 0.56%
lost: 26.13%
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

(actual odds: 73.6% win, .5% tie, 25.9% lose)


Example 2: Aces' value diminishes all-in against 2 tighter opponents who each only play the top 20% of hands pre-flop

holdemMonteCarlo(["As","Ad"],[],2,[".2",".2"],100000)'
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Hand: As,Ad
Board: , 2 opponents, 100000 runs
won: 53.92%
tied: 4.75%
lost: 41.33%
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


05-26-20: The Monte Carlo simulation assumes that players are perfectly rational in folding their worst X% of their range. In reality, players aren't perfectly rational, and probably fold mostly their worst X%, but also fold some hands above that cutoff, and fail to fold some hands below that cutoff. It may be GTO to play this way, but I'm too lazy to 'fuzz' the cutoff. If it matters to other users, I could make that adjustable.

Example Usage:
------------------------------------------------

holdemMonteCarlo(['As','Ac'],['9h','Ah','Jc'],5,['.2','.2','.2','.2','.2'],1000000);

holdemMonteCarlo([51,52],[9,50,36],5,['.2','.2','.2','.2','.2'],1000000);

(recommend using numbers to represent cards for ~2x speedier lookup)


Return Values
------------------------------------------------

object {
results:results
handOdds:handOdds
}

returnObject.results.wins
returnObject.results.ties
returnObject.results.losses
returnObject.results.runs

returnObject.handOdds is an array where player 0 is the bot, opponents are 1,2,3,4...

returnObject.handOdds[x] is an object with percent likelihood of player x achieving various hands, for example:

returnObject.handOdds[0]= {
hicard:0,
pair:7,
twopair:42,
trips:36,
straight:10,
flush:0),
FH:4,
quads:1,
straightflush:0,
}

Example Console Output:
------------------------------------------------
Hand: As,Ac

Board: , 5 opponents, 1000000 runs

won: 48.97%

tied: 0.57%

lost: 50.46%

(actual 49.5% win, .6% tie, 49.9% lose)


This table is helpful for converting cards as strings to numbers for ~2x speedier lookups in poker evaluator:
------------------------------------------------
cards:

 "2c": 1,
 
 "2d": 2,
 
 "2h": 3,

 "2s": 4,

 "3c": 5,

 "3d": 6,

 "3h": 7,

 "3s": 8,

 "4c": 9,

 "4d": 10,

 "4h": 11,

 "4s": 12,

 "5c": 13,

 "5d": 14,

 "5h": 15,

 "5s": 16,

 "6c": 17,

 "6d": 18,

 "6h": 19,

 "6s": 20,

 "7c": 21,

 "7d": 22,

 "7h": 23,

 "7s": 24,

 "8c": 25,

 "8d": 26,

 "8h": 27,

 "8s": 28,

 "9c": 29,

 "9d": 30,

 "9h": 31,

 "9s": 32,

 "tc": 33,

 "td": 34,

 "th": 35,

 "ts": 36,

 "jc": 37,

 "jd": 38,

 "jh": 39,

 "js": 40,

 "qc": 41,

 "qd": 42,

 "qh": 43,

 "qs": 44,

 "kc": 45,

 "kd": 46,

 "kh": 47,

 "ks": 48,

 "ac": 49,

 "ad": 50,

 "ah": 51,
 
 "as": 52
