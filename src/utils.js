import React from 'react';
import { Card } from 'ui-utils';


function generateCard(addHandler, removeHandler) {
   return function(card) {
      return (<div className="mdl-cell mdl-cell--3-col-desktop mdl-cell--2-col-phone mdl-cell--2-col-tablet card-set-cell">
         <Card {...card} addhandler={{handler:addHandler,tooltip:"Add One To Deck"}} removehandler={{handler:removeHandler,tooltip:"Remove One From Deck"}}>
            {(_ => {
               if(card.abilities) {
                  let i = 0;
                  return card.abilities.map( text => <p key={i++}>{text}</p>)
               }
            })()}
         
         </Card>
         </div>)
   }
}

function generateDeckView(deck, flush_display, addHandler, removeHandler) {

   let filterFunc = (lvl) => {
      let cards = deck
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
