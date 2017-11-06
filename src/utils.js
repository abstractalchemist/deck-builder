import React from 'react';
import { Card } from 'ui-utils';


function generateCard(addHandler, removeHandler) {
    return function(card) {
	return (<div className="mdl-cell mdl-cell--3-col" style={{ maxWidth:"300px" }}>
		<Card {...card} addhandler={addHandler} removehandler={removeHandler}>
		    {(_ => {
			if(card.abilities) {
			    let i = 0;
 			    return card.abilities.map( text => <p style={{fontSize:"10px",lineHeight:"12px"}} key={i++}>{text}</p>)
			}
		    })()}
		
		</Card>
		    </div>)
    }
}

function generateDeckView(deck, flush_display, addHandler, removeHandler) {

    let filterFunc = (lvl) => {
	let cards =deck
	    .filter(({level,rarity}) => !/C[A-Z]/.test(rarity) && parseInt(level) === lvl)
	    .map(generateCard(addHandler, removeHandler));
	if(!flush_display)
	    cards.push(<div className="mdl-cell" style={{width:"100%"}}/>);
	return cards;
    }
    let climaxCards = _ => {
	return deck.filter( ({ rarity }) => /C[A-Z]/.test(rarity))
	    .map(generateCard(addHandler, removeHandler))
    }
    
    return [].concat(
	filterFunc(3),
	filterFunc(2),
	filterFunc(1),
	filterFunc(0),
	climaxCards());

}


export { generateCard, generateDeckView };
