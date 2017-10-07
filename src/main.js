import React from 'react';
import Deck from './deck_store';
import Cards from './card_store';
import Rx from 'rx';
import {Nav,Drawer,Body,Menu,Card,SearchField} from 'ui-utils';

class Main extends React.Component {

    constructor(props) {
	super(props);

	this.links = [];
	this.state = { deck : [], cardset: "", cardsets: [] }
	let mythis = this;
	this.tabs = [{ id: "deck_builder",
		       label: "Deck Builder",
		       content : this.buildDeck.bind(this) },
		     { id: "card_viewer",
		       label : "Card Viewer",
		       content : this.buildCardSet.bind(this) }]

	
    }

    componentDidMount() {
	Cards.getcardsets().subscribe(
	    data => {
		this.setState({cardsets:data});
	    });

	Deck.getdecks().subscribe(
	    data => {
		this.setState({decks:data});
	    })
	    
    }

    filterCardSet(evt) {
	this.setState({cardset_filter:evt.target.value});
	
    }

    buildCardSet() {
	return (<div className="mdl-grid">
		<div className="mdl-cell mdl-cell--6-col">
		<Menu menu_id="cardests" items={this.state.cardsets} clickhandler={this.updateCardView.bind(this)} />
		</div>
		<div className="mdl-cell mdl-cell--6-col">
		<SearchField value={this.state.cardset_filter} changehandler={this.filterCardSet.bind(this)}/>
		</div>
		{( _ => {
		    if(this.state.cardset && this.state.cardset_coll) {
			

			if(this.state.cardset_filter) {
			    cardset = cardset.filter( card => new RegExp(this.state.cardset_filter).test(card.abilities) );
			    
			}
			return this.state.cardset_coll.map(card => {


			    let count = card.ownership.count == 0 ? card.ownership.price : card.ownership.count;
			    
			    return (<div className="mdl-cell mdl-cell--3-col">
				    <Card {...card} addhandler={this.addCardToDeck.bind(this)} count={count}>
				    
				    </Card>
				    </div>)
			})
		    }
		})()}
		</div>)
    }

    updateCardView(evt) {
	let target = evt.target.dataset.id;
	let observable = Cards.getcardsfromset(target);
	observable
	    .selectMany(data => {
		return Cards.getownership(data.id).map( ownership => {
		    return Object.assign({}, data, {ownership})
		})
	    })
	    .toArray()
	    .subscribe(
		data => {
		    
		    this.setState({cardset:target,cardset_coll:data});
		})
	
    }

    addCardToDeck(evt) {
	let target = evt.target.dataset.id;
	console.log("adding " + target + " to deck");
	if(target) {
	    let deck = this.state.deck;
	    if(deck) {
		let observable = Cards.getcard(target);
		let c = deck.filter( ({id}) => id === target);
		if(c.length == 0) {
		    observable.subscribe(
			card => {
			    deck.push(Object.assign({}, card, { count: 1 }));
			    
			    this.setState({deck});
			    //document.querySelector("#deck_builder_tab").classList.add("is-active");
			    //document.querySelector("#deck_builder").classList.add("is-active");
			    //document.querySelector("#card_viewer_tab").classList.remove("is-active");
			    //document.querySelector("#card_viewer").classList.remove("is-active");
			    
			});
		
		}
		else
		    alert("Card exists in deck");
	    }
	}
	else
	    alert("target undefined");
    }

    updateCardCount(evt) {
	let target = evt.target.dataset.id;
	if(target) {
	    let deck = this.state.deck;
	    let index = deck.findIndex( ({id}) => id === target);
	    if(index >= 0) {
		deck[index].count = deck[index].count + 1;
		this.setState({deck});
	    }
	}
    }

    removeCardFromDeck(evt) {
	let target = evt.target.dataset.id;
	if(target) {
	    console.log("removing " + target + " from deck");
	    let cardIndex = this.state.deck.findIndex( ({id}) => id === target );
	    if(cardIndex >= 0) {

		let deck = this.state.deck;
		let card = deck[cardIndex];
		if(card.count > 1)
		    card.count = card.count - 1;
		else 
		    deck.splice(cardIndex,1);
		this.setState({deck:deck});
	    }
	}
	else
	    alert("target undefined");
    }

    buildNameDialog() {
	return (<dialog id='deck_name' className='mdl-dialog'>
		<div className="mdl-dialog__content">
		<div className="mdl-textfield mdl-js-textfield">
		<input className="mdl-textfield__input" type="text" id="name" value={this.state.deck_input_name} onChange={
		    evt => {
			
			this.setState({deck_input_name: evt.target.value});
			
		    }}>
		</input>
		<label className="mdl-textfield__label" htmlFor="name">Name</label>
		</div>
		</div>
		<div className="mdl-dialog__actions mdl-dialog__action--full-width">
		<button className="mdl-button mdl-js-button" onClick={
		    _ => {
			Deck.adddeck(this.state.deck_input_name)
			    .selectMany( _ => {
				return Deck.getdecks();
			    })
			    .subscribe(
				decks => {
				    let dialog = document.querySelector('#deck_name');
				    
				    dialog.close();
				    
				    this.setState({deck_input_name:"",decks});
				});
		    }
		}>
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

    buildDialog() {
	return (<dialog id='deck_settings' className="mdl-dialog">
		<div className="mdl-dialog__content">
		<ul className="mdl-list">
		{( _ => {
		    let decks = this.state.decks;
		    if(decks) {
			return decks.map( ({id,label}) => {
			    return (<li  className="mdl-list__item" >
				    <span data-id={id}  className="mdl-list__item-primary-content" onClick={
					evt => {
					    this.updateDeckView(evt);
					    let dialog = document.querySelector('#deck_settings');
					    dialog.close();
					}
 				    }>
				    <i className="material-icons mdl-list__item-icon">view_stream</i>
				    {label}
				    </span>
				    <span className="mdl-list__item-secondary-action">
				    <button data-id={id} className="mdl-button mdl-js-button" onClick={this.deleteDeck.bind(this)}>
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

    deleteDeck(evt) {
	let target = evt.currentTarget.dataset.id;
	if(target) {
	    Deck.deleteDeck(target).selectMany(
		_ => {
		    return Deck.getdecks();
		})
		.subscribe(decks => {
		    this.setState({ decks })
		});
	}
    }

    buildDeck() {

	let levelcalculator = lvl => {
	    if(this.state.deck)
		return this.state.deck.filter( ({ level }) => level === lvl).length
	}
	return (<div className="mdl-grid">
		<div className="mdl-cell mdl-cell--12-col">
		{ /* add deck ids here */}

		<button className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={
		    ( evt => {
			let dialog = document.querySelector('#deck_settings');
			if(!dialog.showModal)
			    dialogPolyfill.registerDialog(dialog);
			dialog.showModal();
		    })}>
		Deck Settings
		</button>
		<button className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={
		    evt => {
			Deck.updatedeck(this.state.deck_id, this.state.deck).subscribe(
			    _ => {
				console.log("save successful");
			    });
		    }
		}>
		Save Settings
		</button>

		<table id="deck_stats" style={{ display:"inline-block" }} className="mdl-data-table mdl-js-data-table">
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
		</tr>
		</tbody>
		</table>
		<div className="mdl-textfield mdl-js-textfield" style={{display:"inline-block"}}>
		<label htmlFor="deck_label" className="mdl-textfield__label">{this.state.deck_name}</label>
		<input id="deck_label" className="mdl-textfield__input"></input>
		</div>
		</div>
		{this.buildDialog()}
		{this.buildNameDialog()}

		{( _ => {
		    if(this.state.deck) {
			console.log("building deck view");
			return this.state.deck.map(card => {
			    return (<div className="mdl-cell mdl-cell--3-col">
				    <Card {...card} addhandler={this.updateCardCount.bind(this)} removehandler={this.removeCardFromDeck.bind(this)}/>
				    </div>)
			});
		    }
		})()
		}
		
		</div>)
		
    }

    updateDeckView(evt) {
	let target = evt.currentTarget.dataset.id;

	if(target) {
	    let observer = Deck.getdeck(target);
	    observer.subscribe(
		deck => {
		    if(deck && deck.deck) {
			console.log("setting target to " + target);
			Rx.Observable.fromArray(deck.deck)
			    .selectMany( ({id,count}) => {
				return Cards.getcard(id).map(data => Object.assign({}, data, {count}))
			    })
			    .toArray()
			    .subscribe(
				data => {
				    this.setState({deck:data,deck_id:deck.id,deck_name:deck.label})
				},
				err => {
				    alert(err);
				});
		    }
		})

	}
	else
	    alert("no target detected");
	
    }
    
    generateTabs() {
	if(this.tabs) {
	    return this.tabs.map( ({id,content}) => {
		return (<section className="mdl-layout__tab-panel" id={id}>
			<div className="page-content">
			{content()}
			</div>
			</section>)
	    })
	}
	
    }

    render() {
	return (<div className="mdl-layout mdl-js-layout">
		<Nav title="Deck Builder" links={this.links} tabs={this.tabs}/>
		<Drawer title="Deck Builder" links={this.links}/>
		<Body>
		{this.generateTabs()}
		</Body>
		</div>)
    }
}

export default Main;
