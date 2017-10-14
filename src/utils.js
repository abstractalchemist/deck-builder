import React from 'react';
import { Card } from 'ui-utils';

function CardSetTable({slice, maxrows}) {
    return (<table className="mdl-data-table mdl-js-data-table mdl-data-table--selectable" style={{display:"inline-block",marginLeft:"1rem",marginRight:"1rem"}}>
	    <thead>
	    <tr>
	    <th className="mdl-data-table__cell--non-numeric">Set Name</th>
	    </tr>
	    </thead>
	    <tbody>
	    {( _ => {
		let rows = slice.map(o => {
		    
		    return (<tr key={o.id}>
			    <td className="mdl-data-table__cell--non-numeric" data-id={o.id}>{o.label}</td>
			    </tr>)
		})
		let j = rows.length;
		while(j < maxrows) {
		    rows.push(<tr key={j + "_blank"}></tr>);
		    j++
		}
		return rows;
	    })()
	    }
	    </tbody>
	    </table>)
}

function partitioncardsets(cardsets, maxrows) {
    let i = 0;
    maxrows = maxrows || 5;
    let tables = [];
    while(i < cardsets.length) {
	let slice = cardsets.slice(i, i+ maxrows);
	tables.push((_ => <CardSetTable slice={slice} maxrows={maxrows} key={"table_" + i}/>)())
	
	i = i + maxrows;
    }

    return tables;
}

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


export { partitioncardsets, generateCard, generateDeckView };
