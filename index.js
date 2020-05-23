exports.holdemMonteCarlo = function (hand,board,numberOpponents,opponentLags,runs) {
	
	var pokerEval = require('latest-poker-evaluator');
	
	let numberPlayers = numberOpponents + 1;
	
	// if not specified, assume full ranges (100% LAG) for each opponent
	if (!opponentLags) {
		var opponentsLags = [];
	}
	for (i = 0; i < numberOpponents; i++) {
		if (!opponentLags[i] || opponentLags[i] <= 0 || opponentLags[i] > 1) {
			opponentLags[i] = 1;
		}
	}
	
	//Initialize results object
	let results = {
	wins:0,
	ties:0,
	losses:0,
	runs:0
	};
	
	//initialize full deck with int or str cards to match hand input type
	if (typeof hand[0] === 'string') {
		var deck = ['As','2s','3s','4s','5s','6s','7s','8s','9s','Ts','Js','Qs','Ks','Ac','2c','3c','4c','5c','6c','7c','8c','9c','Tc','Jc','Qc','Kc','Ah','2h','3h','4h','5h','6h','7h','8h','9h','Th','Jh','Qh','Kh','Ad','2d','3d','4d','5d','6d','7d','8d','9d','Td','Jd','Qd','Kd'];
	}
	else {
		var deck = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52];
	}
	
	//Remove hand and board cards from the deck
	deck.splice(deck.indexOf(hand[0]),1);
	deck.splice(deck.indexOf(hand[1]),1);
	for (i = 0; i < board.length; i++) {
		deck.splice(deck.indexOf(board[i]),1);
	}
	
	let handValues = [
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	];
	
	let hands = [
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	];
	
	//Monte Carlo Loop
	for (runNum = 0; runNum < runs; runNum++) {
		
		//(Re)set arrays
		let mcDeck = deck.slice();
		let mcBoard = board.slice();
		
		//For each opponent, draw two cards from the deck
		for ( i = 1; i <= numberOpponents; i++ ) {
			hands[i][runNum] = [randCard(mcDeck),randCard(mcDeck)];
		}

		//For each unfilled board card, draw a card from the deck
		for ( i = board.length; i < 5; i++ ) {
			mcBoard.push(randCard(mcDeck));
		}
		
		//evaluate the value (rank) of each 7 card hand, store the values in handValues[]
		handValues[0][runNum] = pokerEval.evalHand(hand.concat(mcBoard)).value;
		for ( i = 1; i <= numberOpponents; i++ ) {
			handValues[i][runNum] = pokerEval.evalHand(hands[i][runNum].concat(mcBoard)).value;
		}
	}
	
	//Pre-eval logic for ranges
	let cutoff = [];
	orderedHandValues = [];
	for (i = 1; i <= numberOpponents; i++) {
		orderedHandValues[i] = handValues[i].slice();
		orderedHandValues[i].sort(function(a, b) {
	  		return a - b;
		});
		cutoff[i] = orderedHandValues[i][Math.floor(runs * (1 - opponentLags[i - 1]))];
	}
	
	//Trim impossibilities, based on players' tightness
	for (runNum = 0; runNum < handValues[0].length; runNum++) {
		for (opp = 1; opp <= numberOpponents; opp++) {
			if (handValues[opp][runNum] < cutoff[opp]) {
				for (i = 0; i <= numberOpponents; i++) {
					handValues[i].splice(runNum,1);
					if(i > 0) {
						hands[i].splice(runNum,1);
					}
				}
				runNum --;
				break;
			}
		}
	}
	
	let handTypes = [
    'invalid hand',
    'hicard',
    'pair',
    'twopair',
    'trips',
    'straight',
    'flush',
    'FH',
    'quads',
    'straightflush'
  	];
  	
  	let probableHands = [];
  	let possibleHandTypes = [];
  	
  	for (runNum = 0; runNum < handValues[0].length; runNum++) {
	  	for (i = 0; i <= numberOpponents; i++) {
	  		if (!possibleHandTypes[i]) {
	  			possibleHandTypes[i] = [];
	  		}
	  		possibleHandTypes[i].push(handTypes[handValues[i][runNum] >> 12]);
	  	}
	}

	for (player in possibleHandTypes) {
		let handTypesCounts = {};
		possibleHandTypes[player].forEach((el) => {
			handTypesCounts[el] = handTypesCounts[el] ? (handTypesCounts[el] += 1) : 1;
		});
		probableHands[player] = handTypesCounts;
	}
	
	let handOdds = [];
	
	for (player in probableHands) {
		handOdds[player] = {
		hicard:Math.floor( 100 * probableHands[player].hicard / handValues[0].length || 0),
		pair:Math.floor( 100 * probableHands[player].pair / handValues[0].length || 0),
		twopair:Math.floor( 100 * probableHands[player].twopair / handValues[0].length || 0),
		trips:Math.floor( 100 * probableHands[player].trips / handValues[0].length || 0),
		straight:Math.floor( 100 * probableHands[player].straight / handValues[0].length || 0),
		flush:Math.floor( 100 * probableHands[player].flush / handValues[0].length || 0),
		FH:Math.floor( 100 * probableHands[player].FH / handValues[0].length || 0),
		quads:Math.floor( 100 * probableHands[player].quads / handValues[0].length || 0),
		straightflush:Math.floor( 100 * probableHands[player].straightflush / handValues[0].length || 0),
		};
	}
	
	//Eval loop: determine won/lost/tied, and increment results object
	for (runNum = 0; runNum < handValues[0].length; runNum++, results.runs++) {
		let isTied = false;
		for (i = 1; i <= numberOpponents; i++) {
			if ( handValues[0][runNum] < handValues[i][runNum] ) {
				results.losses++;
				break;
			}
			else if (handValues[0][runNum] == handValues[i][runNum]) {
				isTied = true;
			}
			if (i == numberOpponents) {
				if (isTied) {
					results.ties++;
				}
				else {
					results.wins++;
				}
			}
		}
	}
	//catch case where players are impossibly tight
	if (handValues[0].length == 0) {
		results.runs = 1;
	}
	
	//Output expected win/tie/loss rates
	console.log('------------------------------------------------');
	console.log('Hand: ' + hand);
	console.log('Board: ' + board + ', ' + numberOpponents + ' opponents, ' + runs + ' runs');
	console.log('won: ' + Math.round( 10000 * results.wins / results.runs ) / 100 + '%');
	console.log('tied: ' + Math.round( 10000 * results.ties / results.runs ) / 100 + '%');
	console.log('lost: ' + Math.round( 10000 * results.losses / results.runs )  / 100 + '%');
	console.log('------------------------------------------------');
	
	//return the wins/ties/losses/runs results object
	return {
	results:results,
	handOdds:handOdds
	};
}

//Draw a random card from a deck array, remove it from the deck array, and return the card value
function randCard (deck) {
	var cardIndex = Math.floor(Math.random() * deck.length);
	var card = deck[cardIndex];
	deck.splice(cardIndex,1);
	return card;
}
