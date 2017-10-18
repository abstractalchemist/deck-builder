import React from 'react';

import { partitioncardsets } from './utils';
import { Card } from 'ui-utils'

function CardSetNameView({cardsets,is_building,clickhandler}) {
    const maxRows = 5;
    if(cardsets) {
	let tables = partitioncardsets(cardsets);
	
	
	return (<div id="cardset-selector">
		{tables}
		{( _ => {
		    if(is_building) {
			return <div className="mdl-spinner mdl-js-spinner is-active"></div>
		    }
		    return (<button className="mdl-button mdl-js-button mdl-button--raised"
			    style={{display:"inline-block",marginLeft:"1rem",marginRight:"1rem"}}
			    onClick={clickhandler}>Update Set View</button>)
		    
		})()
		}
		</div>)
    }
    return null;

}

function Checkbox({clickhandler,label,value,id}) {
    return(<label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor={id}>
	   <input type="checkbox" value={value} id={id} className="mdl-checkbox__input" onClick={clickhandler}></input>
	   <span className="mdl-checkbox__label">{label}</span>
	   </label>)

}

function CardSetView({cardset_coll,cardset_filter,filter_to_deck,filter_owned,filter_unowned,deck,addhandler,addhandler2,removehandler2}) {
    let cardset = cardset_coll;
    if(cardset_filter) {
	try {
	    let re = new RegExp(cardset_filter);
	    cardset = cardset.filter( card => {
		
		return re.test(card.abilities) || re.test(card.number) || re.test(card.name);
	    });
	}
	catch(e) {
	    console.log(e)
	}
	
    }
    if(filter_to_deck && deck) {
	cardset = cardset.filter( ({id}) => {
	    return deck.filter( ({id:deck_id}) => deck_id === id).length > 0;
	})
    }
    if(filter_owned) {
	cardset = cardset.filter( ( { ownership : { count } } ) => {
	    return count > 0;
	})
    }
    if(filter_unowned) {
	cardset = cardset.filter( ( { ownership : { count } } ) => {
	    return count === 0;
	})
	
    }
    return cardset.map(card => {
	

	let count = card.ownership ? ( card.ownership.count == 0 ? card.ownership.price : card.ownership.count ) : "No Info";
	
	let props = {};
	if(deck) {
	    if(deck.filter( ({id}) => card.id === id).length === 0) {
		props.addhandler = addhandler;
	    }
	}
	return (<div className="mdl-cell mdl-cell--3-col" style={{ maxWidth: "250px" }} key={card.number}>
		<Card {...card} {...props} count={count} addhandler2={addhandler2} removehandler2={removehandler2} menuOpts={[{id:'tcgrepublic',label:'Search TCG Republic'},{id:'tcgplayer',label:'Search TCG Player'},{id:'amazon',label:"Search Amazon"}]} menuHandler={
		    evt => {
			let target = evt.currentTarget.dataset.id;
			if(target === 'tcgrepublic')
			    
			    window.open("https://tcgrepublic.com/product/text_search.html?q=" + encodeURIComponent(card.number));
			else if(target === 'tcgplayer')
			    window.open("https://www.google.com/search?q=" + encodeURIComponent("site:shop.tcgplayer.com \"" + card.number + "\" -\"Price Guide\""))
			else if(target === 'amazon')
			    window.open("https://www.google.com/search?q=" + encodeURIComponent("site:www.amazon.com \"" + card.number + "\""))
		    }
		}>
		{(_ => {
 		    if(card.abilities) {
			let i = 0;
 			return card.abilities.map( text => <p key={"ability_text_" + i++} style={{fontSize:"10px",lineHeight:"12px"}}>{text}</p>)
		    }
		})()}
		</Card>
		</div>)
    })

}

function NameDialog({deck_input_name, changehandler, addhandler}) {
    return (<dialog id='deck_name' className='mdl-dialog'>
	    <div className="mdl-dialog__content">
	    <div className="mdl-textfield mdl-js-textfield">
	    <input className="mdl-textfield__input" type="text" id="name" value={deck_input_name} onChange={changehandler}>
	    </input>
	    <label className="mdl-textfield__label" htmlFor="name">Name</label>
	    </div>
	    </div>
	    <div className="mdl-dialog__actions mdl-dialog__action--full-width">
	    <button className="mdl-button mdl-js-button" onClick={addhandler}>
	    Add
	    </button>
	    <button className="mdl-button mdl-js-button" onClick={
		_ => {
		    let dialog = document.querySelector('#deck_name');
		    dialog.close();
		}
	    }>
	    Cancel
	    </button>
	    
	    </div>
	    </dialog>)

}

function DeckSettingsDialog({decks,deletehandler,clickhandler}) {
    return (<dialog id='deck_settings' className="mdl-dialog">
	    <div className="mdl-dialog__content">
	    <ul className="mdl-list">
	    {( _ => {
		if(decks) {
		    return decks.map( ({id,label}) => {
			
			return (<li className="mdl-list__item" key={id}>
				<span data-id={id}  className="mdl-list__item-primary-content" onClick={
				    evt => {
					if(clickhandler)
					    clickhandler(evt);
					//					this.updateDeckView(evt);
					
					let dialog = document.querySelector('#deck_settings');
					if(dialog)
					    dialog.close();
					else
					    console.log("dialog not found;  either in test mode or query is wrong")
				    }
 				}>
				<i className="material-icons mdl-list__item-icon">view_stream</i>
				{label}
				</span>
				<span className="mdl-list__item-secondary-action">
				<button data-id={id} className="mdl-button mdl-js-button" onClick={deletehandler}>
				Delete
				</button>
				</span>
				</li>)
		    })
		}
	    })()}
	    </ul>
	    </div>
	    <div className="mdl-dialog__actions mdl-dialog__actions--full-width">
	    <button className="mdl-button mdl-js-button" onClick={
		_ => {
		    let dialog = document.querySelector('#deck_name');
		    if(!dialog.showModal)
			dialogPolyfill.registerDialog(dialog)
		    dialog.showModal();
		}}>
	    Add Deck
	    </button>
	    <button className="mdl-button mdl-js-button" onClick={
		(evt => {
		    let dialog = document.querySelector('#deck_settings');
		    dialog.close();
		})
	    }>
	    Close
	    </button>
	    </div>
	    </dialog>)
}

function DeckLevelView({deck}) {
    let levelcalculator = lvl => {
	if(deck)
	    return deck.filter( ({ level,rarity }) => !/C[A-Z]/.test(rarity) && (parseInt(level) === lvl)).map(({count}) => count).reduce((sum,value) => sum + value, 0);
    }
    let climaxcalculator = _ => {
	if(deck) {
	    return deck.filter(({ rarity }) => /C[A-Z]/.test(rarity)).map(({count}) => count).reduce( (sum,value) => sum + value, 0);
	}
    }

    
    return (<table id="deck_stats" style={{ display:"inline-block" }} className="mdl-data-table mdl-js-data-table">
	    <thead>
	    <tr>
	    <th>
	    Level 3
	    </th>
	    <th>
	    Level 2
	    </th>
	    <th>
	    Level 1
	    </th>
	    <th>
	    Level 0
	    </th>
	    <th>
	    Climax Cards
	    </th>
	    <th>
	    Total
	    </th>
	    </tr>
	    </thead>
	    <tbody>
	    <tr>
	    <td>{levelcalculator(3)}
	    </td>
	    <td>{levelcalculator(2)}
	    </td>
	    
	    <td>{levelcalculator(1)}
	    </td>
	    <td>{levelcalculator(0)}
	    </td>
	    <td>{climaxcalculator()}
	    </td>
	    <td>
	    {deck.map(({count}) => count).reduce((sum,value) => sum + value,0)}
	    </td>
	    </tr>
	    </tbody>
	    </table>)

}

export { CardSetView, CardSetNameView, Checkbox, NameDialog, DeckSettingsDialog, DeckLevelView };
