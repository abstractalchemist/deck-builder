import React from 'react';

import { Card } from 'ui-utils'

function Checkbox({clickhandler,label,value,id,tooltip}) {
    let label_id = `label-id-${id}`
    return(<label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor={id}>
	   <input type="checkbox" value={value} id={id} className="mdl-checkbox__input" onClick={clickhandler}></input>
	   <span className="mdl-checkbox__label" id={label_id}>{label}</span>
	   <div className="mdl-tooltip" htmlFor={label_id}>{tooltip}</div>
	   </label>)

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

function DeckSettingsDialog({decks,deletehandler,clickhandler,deck_id}) {
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
 				} id={`span-click-${id}`}>
				<i className="material-icons mdl-list__item-icon">view_stream</i>
				{label}
				</span>
				<div className="mdl-tooltip" htmlFor={`span-click-${id}`}>{`Set As ${label} as Current Deck`}</div>
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
	    <p>
	    Please click on the icon next to the deck name in order to load a deck.
	    </p>
	    
	    {( _ => {
		if(!deck_id) {
		    return <p>You need to load a deck in order to start adding cards to it</p>
		}
	    })()
	    }
	    </div>
	    <div className="mdl-dialog__actions mdl-dialog__actions--full-width">
	    <button className="mdl-button mdl-js-button" onClick={
		_ => {
		    let dialog = document.querySelector('#deck_name');
		    if(!dialog.showModal)
			dialogPolyfill.registerDialog(dialog)
		    dialog.showModal();
		}}>
	    Create New Deck
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

export {  Checkbox, NameDialog, DeckSettingsDialog, DeckLevelView };
