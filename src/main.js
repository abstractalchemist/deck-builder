import React from 'react';
import Deck from './deck_store';
import Cards from './card_store';
import Rx from 'rxjs/Rx';
import {Nav,Drawer,Body,Menu,Card,SearchField} from 'ui-utils';
import { buildCardSet, CardSetView, CardSetNameView } from 'weiss-utils'

import { Checkbox, NameDialog, DeckSettingsDialog, DeckLevelView } from './card_utils';
import { generateCard, generateDeckView } from './utils'
import FacebookLogin from './login'
import work from 'webworkify';

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
	window.__main_fbinit__ = _ => {
	    this.onlogin()
	}
	if(typeof Worker !== 'undefined') {
	    console.log(typeof Worker)
	    this.worker = work(require('./worker.js'))
	}
    }

    updateOwnership(evt) {
	console.log(`updating ownership of ${evt.currentTarget.dataset.id}`);
	this.setState({can_add_to_library:false})
	let target = evt.currentTarget.dataset.id;
	let number = evt.currentTarget.dataset.number;
	Cards.addtocollection(target)
	    .mergeMap(_ => Cards.getcard(target))
	    .mergeMap(data =>  Cards.getownership(number).map(o => Object.assign({}, {ownership:o}, data)))
	    .subscribe(
		o => {
		    let ptr = this.state.cardset_coll.map(j => {
			if(j.id === o.id)
			    return o
			return j;
		    });
		    this.setState({cardset_coll:ptr, can_add_to_library:true});
		    
		},
		err => {
		    alert(`ownership update error ${err}`);
		})
	
 	
    }

    componentDidMount() {
	this.onlogin();
	Cards.getcardsets().subscribe(
	    data => {
		this.setState({cardsets:data});
	    });
	
	//	document.querySelectorAll("table > input
	let elem =  document.querySelector(".fb-login-button")
	if(elem)
	    elem.setAttribute('onlogin','window.__facebook_login__()')
	
     }

    componentDidUpdate() {
	componentHandler.upgradeDom();
	let elem =  document.querySelector(".fb-login-button")
	if(elem)
	    elem.setAttribute('onlogin','window.__facebook_login__()')

    }
    
    filterCardSet(evt) {
	this.setState({cardset_filter:evt.target.value});
	
    }

    buildCardSet() {
	let show_opts = [
	    	<Checkbox clickhandler={
		    evt => {
			this.setState({hide_name_view:evt.currentTarget.checked});
		    }
		} label="Hide Sets View" id="hide-name-view"/>,
		<button id="export-card-list" className="mdl-button mdl-js-button mdl-button--raised" onClick={
		    evt => {
			Cards.export_card_list(this.state.cardset_coll.map( ({id}) => id))
			    .subscribe( ({url,data}) => {
				window.open(url + "?keys=" + data);
			    })
                        
		    }
		}>Export View</button>
	]
	if(this.state.loggedIn)
	    show_opts = show_opts.concat([
		    <Checkbox value={this.state.show_title} clickhandler={
			evt => {
			    this.setState({show_title:evt.currentTarget.checked})
			}
		    } label="Show Title" id="show-title-option"/>,
		    <Checkbox clickhandler={
			evt => {
			    this.setState({filter_to_deck:evt.currentTarget.checked})
			    
			}
		    } label="Show Only Cards In Deck" {...show_opts} id="filter-deck-option"/>,
		    <Checkbox label="Show Only Owned Cards" value={this.state.filter_owned} clickhandler={
			evt => {
			    this.setState({filter_owned:evt.currentTarget.checked});
			}
		    } id="filter-owned-option"/>,
		    <Checkbox label="Show Only Unowned Cards" value={this.state.filter_unowned} clickhandler={
			evt => {
			    this.setState({filter_unowned:evt.currentTarget.checked})
			}
		    } id="filter-unowned-option" />,
		
	    ])

	return buildCardSet(Object.assign({}, this.state, {
	    updateCardView:this.updateCardView.bind(this),
	    filterCardSet:this.filterCardSet.bind(this),
	    addhandler:(this.state.loggedIn && this.state.deck_id) ? { handler: this.addCardToDeck.bind(this), tooltip: "Add Card To Current Deck" }: undefined,
	    addhandler2:this.state.loggedIn ? { handler: evt => {
		this.updateOwnership(evt)
	    }, tooltip: "Add Card To Library", disabled:!this.state.can_add_to_library }: undefined,
	    
	    removehandler2:this.state.loggedIn ? { handler : this.removeOwnership.bind(this), tooltip:"Remove From Library" } : undefined,
	    menuOpts:[{id:'tcgrepublic',label:'Search TCG Republic'},{id:'tcgplayer',label:'Search TCG Player'},{id:'amazon',label:"Search Amazon"},{id:'ideal808',label:"Search Ideal 808"}],
	    menuHandler: card => {
		return evt => {
		    let target = evt.currentTarget.dataset.id;
		    if(target === 'tcgrepublic')
			window.open("https://tcgrepublic.com/product/text_search.html?q=" + encodeURIComponent(card.number));
		    else if(target === 'tcgplayer')
			window.open("https://www.google.com/search?q=" + encodeURIComponent("site:shop.tcgplayer.com \"" + card.number + "\" -\"Price Guide\""))
		    else if(target === 'amazon')
			window.open("https://www.google.com/search?q=" + encodeURIComponent("site:www.amazon.com \"" + card.number + "\""))
		    else if(target === 'ideal808')
			window.open("https://www.google.com/search?q=" + encodeURIComponent("site:www.ideal808.com \"" + card.number + "\" -\"tour guide\""))
		}
	    },
	    addFilterOptions:  show_opts
	}))
    }


    removeOwnership(evt) {
	console.log(`removing ownership of ${evt.currentTarget.dataset.id}`);
	let target = evt.currentTarget.dataset.id;
	let number = evt.currentTarget.dataset.number;
	Cards.removefromcollection(target)
	    .mergeMap(_ => Cards.getcard(target))
	    .mergeMap(data =>  Cards.getownership(number).map(o => Object.assign({}, {ownership:o}, data)))
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

    updateCardView(evt) {
	//	let target = evt.target.dataset.id;
	//	let

	//	let selected = document.querySelectorAll("#cardset-selector tr.is-selected td:nth-child(2)");
	let selected = document.querySelectorAll('.cardset-selector label.is-checked')
	let targets = [];
	if(selected) {
	    for(let i = 0; i < selected.length; ++i) {
		let item = selected.item(i);
		if(item.dataset.id)
		    targets.push(item.dataset.id);
	    }
	}
	//	let target = targets[0];
	let observable = Rx.Observable.merge.apply(undefined, targets.map(Cards.getcardsfromset));
	//	let observable = Cards.getcardsfromset(target);
	let buffer = [];
	if(this.cardViewRetrieveHandle) {
	    this.cardViewRetrieveHandle.unsubscribe();
	}
	if(this.ownershipRetrieveHandle) {
	    this.ownershipRetrieveHandle.unsubscribe();
	}
	
	this.cardViewRetrieveHandle = observable.subscribe(
	    data => {
		buffer.push(data)
	    },
	    err => {
		console.log(`error ${err}`);
	    },
	    _ => {
		//		console.log('update card view');
		this.setState({cardset:targets,cardset_coll:buffer,is_building:true});
		let buffer2 = [];
		this.ownershipRetrieveHandle = Rx.Observable.from(buffer)
		    .mergeMap(data => {
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

			    //			    buffer2.sort( ( {id:id1},{id:id2} ) => id1.localeCompare(id2))
			    if(this.worker) {
				this.worker.postMessage(buffer2)
				this.worker.addEventListener('message', ({data}) => {
				    this.setState({is_building:undefined,cardset_coll:data,can_add_to_library:true});
				})
			    }
			    else
				this.setState({is_building:undefined,cardset_coll:buffer2,can_add_to_library:true});
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
		    .mergeMap(card => {
			if(card.relatedTo) {
			    return Cards.getcard(card.relatedTo).map(relation => {
				return { card,relation}
			    });
			}
			else
			    return Rx.Observable.of({card:card});
		    });
		let c = deck.filter( ({id}) => id === target);
		if(c.length == 0) {
		    observable
			.do( ({ card,relation}) => deck.push(Object.assign({}, card, { count: 1 })))
			.mergeMap(card => {
			    return Deck.updatedeck(this.state.deck_id, deck)
				.map( _ => card)

			})
			.subscribe(
			    ({card,relation}) => {
				if(relation)
				    alert("added card is related to " + relation.name);
				
				this.setState({deck});
			    
			    },
			    err => {
				alert(err)
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
	    Deck.deleteDeck(target).mergeMap(
		_ => {
		    return Deck.getdecks();
		})
		.subscribe(decks => {
		    this.setState({ decks })
		});
	}
    }

    onlogin() {
	if(typeof FB !== "undefined") {
 	    FB.getLoginStatus( ({status,authResponse}) => {
		console.log(`user status ${status}`)
		if(status === 'connected') {
		    this.setState(({loggedIn:true}))
		    window.sessionStorage.setItem('fb-token', authResponse.accessToken)
	
		    Deck.getdecks().subscribe(
			data => {
			    this.setState({decks:data});
			})
		    Cards.update_library()
			.subscribe(
			    _ => {},
			    err => {})
		}
		else {
		    this.setState({loggedIn:false,decks:undefined, filter_to_deck:false, filter_owned:false, filter_unowned:false})
		    
		    window.sessionStorage.removeItem('fb-token')
		    
		}
	    })
	}
	else {
 	    this.setState({loggedIn:false,decks:undefined, filter_to_deck:false, filter_owned:false, filter_unowned:false})
	    
	    window.sessionStorage.removeItem('fb-token')
	    
	}


    }
    
    buildDeck() {
	if(!this.state.loggedIn) {
	    return (<div className="mdl-grid login-grid">
		    <div className="mdl-cell mdl-cell---12-col">
		    <div className="mdl-card mdl-shadow--2dp login-display">
		    
		    <div className="mdl-card__title mdl-card--expand">
		    <div className="mdl-grid" style={{width:"100%",height:"100%"}}>
		    <div className="mdl-cell mdl-cell--4-col mdl-cell--1-col-phone mdl-cell--2-col-tablet" style={{display:"flex", alignItems:"center"}}>
 		    <h2>Weiss Deck Builder</h2>
		    </div>

		    <div style={{background: "url('welcome.png') center/cover"}} className="mdl-cell mdl-cell--8-col mdl-cell--3-col-phone mdl-cell--6-col-tablet"/>
		    </div>
		    </div>

		    <div className="mdl-card__supporting-text">
		    This Application uses the Facebook account to identify you and store your saved decks and library so you can access it the next time you login into this application
		    </div>

		    </div>

		    </div>
		    </div>)
	}
	else {
	    let save_opts = { disabled: "true" }
	    if(this.state.deck_id)
		save_opts = { enabled: "true" }
	    
	    return (<div className="mdl-grid">
		    <div className="mdl-cell mdl-cell---12-col">
		    </div>
		    <div className="mdl-cell mdl-cell--12-col">
		    { /* add deck ids here */}

		    <button id="deck-settings" className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={
			( evt => {
			    let dialog = document.querySelector('#deck_settings');
			    if(!dialog.showModal)
				dialogPolyfill.registerDialog(dialog);
			    dialog.showModal();
			})}>
		    Manage Decks
		    </button>
		    <button id="save-settings" className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={
			evt => {
			    Deck.updatedeck(this.state.deck_id, this.state.deck).subscribe(
				_ => {
				    alert("save successful");
				},
				err => {
				    alert("Error: " + err);
				});
			}
		    } {...save_opts}>
		    Save Current Deck
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
				.mergeMap( _ => {
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
    }	
    

    updateDeckView(evt) {
	let target = evt.currentTarget.dataset.id;

	if(target) {
	    let observer = Deck.getdeck(target);
	    observer.subscribe(
		deck => {
		    if(deck && deck.deck) {
			console.log("setting target to " + target);
			Rx.Observable.from(deck.deck)
			    .mergeMap( ({id,count}) => {
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
	return (<div className="mdl-layout mdl-js-layout mdl-layout__header--scroll">
		<Nav title="Deck Builder" links={this.links} tabs={this.tabs}>
		{(_ => {
		    if(screen.width > 768)
			return <FacebookLogin onlogin={this.onlogin.bind(this)}/>
		})()}
		</Nav>
		<div className="mdl-layout--large-screen-only">
		<Drawer title="Deck Builder" links={this.links}/>
		</div>
		<Body>
		{( _ => {
		    if(screen.width < 768) {
			return <FacebookLogin onlogin={this.onlogin.bind(this)}/>
		    }
		})()}
		{(_ => {
		    if(screen.width <= 768) {
			return (<div className="mdl-tabs mdl-js-tabs mdl-layout--small-screen-only">
				<div className="mdl-tabs__tab-bar">
				{( _ => {
				    return this.tabs.map( ({id,label}) => {
					return <a href={`#${id}-small`} className="mdl-tabs__tab">{label}</a>
				    })
				})()}
				
				</div>
				{( _ => {
				    return this.tabs.map( ({id,content}) => {
					return (<div className="mdl-tabs__panel" id={`${id}-small`}>
						{content()}
						</div>)
				    })
				})()}
				</div>)
		    }
		})()}

		{(_ => {
		    if(screen.height >= 768) {
			return (<div className="mdl-layout--large-screen-only">
				{this.generateTabs()}
				</div>)
		    }
		})()}
		</Body>
		</div>)
    }
}

export default Main;
