exports.holdemMonteCarlo = function (hand,board,numberOpponents,runs) {
	
	var pokerEval = require("poker-evaluator");
	
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
	
	//Monte Carlo Loop
	for (mcRuns = 0; mcRuns < runs; mcRuns++) {
		
		//(Re)set arrays
		let otherHands = [];
		let handValues = [];
		let mcDeck = deck.slice();
		let mcBoard = board.slice();
		
		//For each opponent, draw two cards from the deck
		for ( i = 0; i < numberOpponents; i++ ) {
			otherHands[i] = [randCard(mcDeck),randCard(mcDeck)];
		}

		//For each unfilled board card, draw a card from the deck
		for ( i = board.length; i < 5; i++ ) {
			mcBoard.push(randCard(mcDeck));
		}
		
		//evaluate the value (rank) of each 7 card hand, store the values in handValues[]
		handValues[0] = pokerEval.evalHand(hand.concat(mcBoard)).value;
		for ( i = 0; i < otherHands.length; i++ ) {
			handValues[i + 1] = pokerEval.evalHand(otherHands[i].concat(mcBoard)).value;
		}
		
		//determine won/lost/tied, and increment results object
		let isTied = false;
		for (i = 1; i < handValues.length; i++) {
			if ( handValues[0] < handValues[i] ) {
				results.losses++;
				break;
			}
			else if (handValues[0] == handValues[i]) {
				isTied = true;
			}
			if (i == handValues.length - 1) {
				if (isTied) {
					results.ties++;
				}
				else {
					results.wins++;
				}
			}
		}
		results.runs++;
	}
	
	//Output expected win/tie/loss rates
	/*console.log('------------------------------------------------');
	console.log('Hand: ' + hand);
	console.log('Board: ' + board + ', ' + numberOpponents + ' opponents, ' + runs + ' runs');
	console.log('won: ' + Math.round( 10000 * results.wins / results.runs ) / 100 + '%');
	console.log('tied: ' + Math.round( 10000 * results.ties / results.runs ) / 100 + '%');
	console.log('lost: ' + Math.round( 10000 * results.losses / results.runs )  / 100 + '%');
	console.log('------------------------------------------------');
	*/
	
	//return the wins/ties/losses/runs results object
	return results;
}

//Draw a random card from a deck array, remove it from the deck array, and return the card value
function randCard (deck) {
	var cardIndex = Math.floor(Math.random() * deck.length);
	var card = deck[cardIndex];
	deck.splice(cardIndex,1);
	return card;
}
