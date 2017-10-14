import React from 'react';
import Deck from './deck_store';
import Cards from './card_store';
import Rx from 'rx';
import {Nav,Drawer,Body,Menu,Card,SearchField} from 'ui-utils';


import { CardSetView, CardSetNameView, Checkbox, NameDialog, DeckSettingsDialog, DeckLevelView } from './card_utils';
import { generateCard, generateDeckView } from './utils'

/*
 * state attributes
 * - deck - list of cards to display in deck view
 * - cardset - the ids of the cardset to view in card set view
 * - is_building - if this property is set, then information is still being collected
 * - cardsets - the list of all known cardsets 
 * - flush_display - if true, display all cards together;  otherwise split by level
 * - cardset_filter - the current expression to filter the card set view on
 * - cardset_coll - the list of cards to view in the cardset, maybe modified by the filter
 * - deck_input_name - name of the deck currently being viewed
 * - deck_id - id of the deck currently being viewed ( in the database )
 */


class Main extends React.Component {

    constructor(props) {
	super(props);

	this.links = [];
	this.state = { deck : [], cardset: "", cardsets: [], flush_display : true }
	let mythis = this;
	this.tabs = [{ id: "deck_builder",
		       label: "Deck Builder",
		       content : this.buildDeck.bind(this) },
		     { id: "card_viewer",
		       label : "Card Viewer",
		       content : this.buildCardSet.bind(this) }]

	
    }

    updateOwnership(evt) {
	console.log(`updating ownership of ${evt.currentTarget.dataset.id}`);
	let target = evt.currentTarget.dataset.id;
	let number = evt.currentTarget.dataset.number;
	Cards.addtocollection(target)
	    .selectMany(_ => Cards.getcard(target))
	    .selectMany(data =>  Cards.getownership(number).map(o => Object.assign({}, {ownership:o}, data)))
	    .subscribe(
		o => {
		    let ptr = this.state.cardset_coll.map(j => {
			if(j.id === o.id)
			    return o
			return j;
		    });
		    this.setState({cardset_coll:ptr});
		    
		},
		err => {
		    alert(`ownership update error ${err}`);
		})
			    
								 
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
	    
//	document.querySelectorAll("table > input

    }

    componentDidUpdate() {
	componentHandler.upgradeDom();
    }
    
    filterCardSet(evt) {
	this.setState({cardset_filter:evt.target.value});
	
    }

    buildCardSet() {
	return (<div className="mdl-grid">
		<div className="mdl-cell mdl-cell--6-col">
		<CardSetNameView {...this.state} clickhandler={this.updateCardView.bind(this)} />
		 
		</div>
		<div className="mdl-cell mdl-cell--6-col">
 		<SearchField value={this.state.cardset_filter} changehandler={this.filterCardSet.bind(this)}/>
		<Checkbox clickhandler={
		    evt => {
			this.setState({filter_to_deck:evt.currentTarget.checked})
			
		    }
		} label="Filter On Deck"/>
		</div>
		
		{( _ => {
		    if(this.state.cardset && this.state.cardset_coll) 
			return <CardSetView {...this.state} addhandler={this.addCardToDeck.bind(this)} addhandler2={this.updateOwnership.bind(this)} />;
		})()}
		</div>)
    }

    updateCardView(evt) {
	//	let target = evt.target.dataset.id;
	//	let

	let selected = document.querySelectorAll("#cardset-selector tr.is-selected td:nth-child(2)");
	let targets = [];
	if(selected) {
	    for(let i = 0; i < selected.length; ++i) {
		let item = selected.item(i);
		if(item.dataset.id)
		    targets.push(item.dataset.id);
	    }
	}
	//	let target = targets[0];
	let observable = Rx.Observable.merge(targets.map(Cards.getcardsfromset));
//	let observable = Cards.getcardsfromset(target);
	let buffer = [];
	if(this.cardViewRetrieveHandle) {
	    this.cardViewRetrieveHandle.dispose();
	}
	if(this.ownershipRetrieveHandle) {
	    this.ownershipRetrieveHandle.dispose();
	}
	
	this.cardViewRetrieveHandle = observable.subscribe(
	    data => buffer.push(data),
	    err => {
		console.log(`error ${err}`);
	    },
	    _ => {
		console.log('update card view');
		this.setState({cardset:targets,cardset_coll:buffer,is_building:true});
		let buffer2 = [];
		this.ownershipRetrieveHandle = Rx.Observable.fromArray(buffer)
		    .selectMany(data => {
			return Cards.getownership(data.number)
			    .map(ownership => Object.assign({}, data, {ownership}))
		    })
		    .subscribe(
			data => {
			    buffer2.push(data);
			    // let index = this.state.cardset_coll.findIndex( ({ id }) => data.id === id);
			    // let ptr = this.state.cardset_coll.map(o => o);
			    // if(index >= 0) {
			    // 	ptr[index] = data;
			    // 	this.setState({cardset_coll:ptr});
			    // }
			},
			err => {
			    console.log(`error ${err}`);
			},
			_ => {
			    
			    this.setState({is_building:undefined,cardset_coll:buffer2});
			})
 	    })
	
    }

    addCardToDeck(evt) {
	let target = evt.currentTarget.dataset.id;
	console.log("adding " + target + " to deck");
	if(target) {
	    let deck = this.state.deck;
	    if(deck) {
		let observable = Cards.getcard(target)
		    .selectMany(card => {
			if(card.relatedTo) {
			    return Cards.getcard(card.relatedTo).map(relation => {
				return { card,relation}
			    });
			}
			else
			    return Rx.Observable.just({card:card});
		    });
		let c = deck.filter( ({id}) => id === target);
		if(c.length == 0) {
		    observable.subscribe(
			({card,relation}) => {
			    deck.push(Object.assign({}, card, { count: 1 }));
			    if(relation)
				alert("added card is related to " + relation.name);
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
	let target = evt.currentTarget.dataset.id;
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
				alert("save successful");
			    },
			    err => {
				alert("Error: " + err);
			    });
		    }
		}>
		Save Settings
		</button>


		<DeckLevelView {...this.state} />
		<div className="mdl-textfield mdl-js-textfield">
		<label htmlFor="deck_label" className="mdl-textfield__label">{this.state.deck_name}</label>
		<input id="deck_label" className="mdl-textfield__input"></input>
		</div>
		<Checkbox clickhandler={
		    evt => {
			this.setState({flush_display:!evt.currentTarget.checked});
		    }
		}
		label="Split On Level"/>
		</div>
		<DeckSettingsDialog {...this.state} deletehandler={this.deleteDeck.bind(this)} clickhandler={this.updateDeckView.bind(this)}/>
		<NameDialog {...this.state} changehandler={
		    evt => {
			
			this.setState({deck_input_name: evt.target.value});
		
		    }
		}
		addhandler={
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
		} />
		
		{( _ => {
		    if(this.state.deck) 
			return generateDeckView(this.state.deck, this.state.flush_display, this.updateCardCount.bind(this), this.removeCardFromDeck.bind(this));
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
		return (<section className="mdl-layout__tab-panel" id={id} key={id}>
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
