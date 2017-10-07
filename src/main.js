import React from 'react';
import Deck from './deck_store';
import Cards from './card_store';

function Nav({title,links,tabs}) {

    const generateTabHeaders = _ => {
	if(tabs) {
	    return (<div className="mdl-layout__tab-bar mdl-js-ripple-effect">
		    {( _ => {
			return tabs.map(({id,label}) => <a href={"#" + id} className="mdl-layout__tab">{label}</a>)
		    })()}
		    </div>)
	}

    }
    
    return (<header className="mdl-layout__header">
	    <div className="mdl-layout-icon"></div>
	    
	    <div className="mdl-layout__header-row">
	    <span className="mdl-layout__title">{title}</span>
	    <div className="mdl-layout-spacer"></div>
	    <nav className="mdl-navigation">
	    {( _ => {
		if(links) {
		    return links.map(({id,label}) => <a className="mdl-navigation__link" href={"#" + id}>{label}</a>);
		}
	    })()}
	    </nav>

	    </div>
	    {generateTabHeaders()}
	    </header>);
}

function Drawer({title,links}) {
    return (<div className="mdl-layout__drawer">
	    <span className="mdl-layout-title">{title}</span>
	    <nav className="mdl-navigation">
	    {( _ => {
		if(links) {
		    return links.map(({href,label}) => <a className="mdl-navigation__link" href={href}>{label}</a>);
		}
	    })()}
				    
	    </nav>
	    </div>);
}

function Body({children}) {
    return ( <main className="mdl-layout__content">
	     {children}
	     </main> )
}

function Menu({menu_id,items,clickhandler}) {
    return (<div>
	    <button id={menu_id} className="mdl-button mdl-js-button mdl-button__icon">
	    <i className="material-icons">more_vert</i>
	    </button>
	    <ul htmlFor={menu_id} className="mdl-menu mdl-js-menu">
	    {( _ => {
		if(items)
		    return items.map(({ label, id }) => <li onClick={clickhandler} className="mdl-menu__item" data-id={id}>{label}</li>);
	    })()
	    }
	    </ul>
	    </div>)
}

function Card({id,image,abilities,count,removehandler,addhandler}) {
    return (<div className="mdl-card" style={{width:"100%"}}>
	    <div className="mdl-card__title">
	    </div>
	    <span className="mdl-badge mdl-badge--overlap" data-badge={count}></span>
	    <div className="mdl-card__media">

	    <img src={image} style={{width:"100%"}} ></img>

	    </div>
	    <div className="mdl-card__supporting-text">
	    {(_ => {
		if(abilities)
		    return abilities.map( text => <p style={{fontSize:"10px"}}>{text}</p>)
	    })()}
	    </div>
	    <div className="mdl-card__actions">
	    {( _ => {
		if(removehandler)
		    return ( <button className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" data-id={id} onClick={removehandler}>
			     <i className="material-icons">remove</i>
			     </button>)
	    })()}
	    {( _ => {
		if(addhandler)
		    return (<button className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" data-id={id} onClick={addhandler}>
			    <i className="material-icons">add</i>
			    </button>)
	    })()}
	    </div>
	    </div>)

}

function SearchField({value,changehandler}) {
    return (<div className="mdl-textfield mdl-js-textfield mdl-textfield--expandable
                  mdl-textfield--floating-label mdl-textfield--align-right">
	    
            <label className="mdl-button mdl-js-button mdl-button--icon" htmlFor="fixed-header-drawer-exp">
            <i className="material-icons">search</i>
            </label>
	    
            <div className="mdl-textfield__expandable-holder">
            <input className="mdl-textfield__input" type="text" name="sample" id="fixed-header-drawer-exp" value={value} onChange={changehandler}></input>
	    
            </div>
	    </div>)
}

class Main extends React.Component {

    constructor(props) {
	super(props);

	this.links = [];
	this.state = { deck : [], cardset: "" }
	let mythis = this;
	this.tabs = [{ id: "deck_builder",
		       label: "Deck Builder",
		       content : this.buildDeck.bind(this) },
		     { id: "card_viewer",
		       label : "Card Viewer",
		       content : this.buildCardSet.bind(this) }]
		     
    }

    filterCardSet(evt) {
	this.setState({cardset_filter:evt.target.value});
	
    }

    buildCardSet() {
	return (<div className="mdl-grid">
		<div className="mdl-cell mdl-cell--6-col">
		<Menu menu_id="cardests" items={Cards.getcardsets()} clickhandler={this.updateCardView.bind(this)} />
		</div>
		<div className="mdl-cell mdl-cell--6-col">
		<SearchField value={this.state.cardset_filter} changehandler={this.filterCardSet.bind(this)}/>
		</div>
		{( _ => {
		    if(this.state.cardset) {
			
			let cardset = Cards.getcardsfromset(this.state.cardset);
			if(this.state.cardset_filter) {
			    cardset = cardset.filter( card => new RegExp(this.state.cardset_filter).test(card.abilities) );
			}
			return cardset.map(card => <div className="mdl-cell mdl-cell--3-col"><Card {...card} /></div>);
		    }
		})()}
		</div>)
    }

    updateCardView(evt) {
	let target = evt.target.dataset.id;
	this.setState({cardset:target});
	
    }

    addCardToDeck(evt) {
	let target = evt.target.dataset.id;
	console.log("adding " + target + " to deck");
    }

    removeCardFromDeck(evt) {
	let target = evt.target.dataset.id;
	console.log("removing " + target + " from deck");
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
			Deck.adddeck(this.state.deck_input_name).subscribe(
			    _ => {
				let dialog = document.querySelector('#deck_name');
				
				dialog.close();
				this.setState({deck_input_name:""});
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
		    let decks = Deck.getdecks();
		    if(decks) {
			return decks.map( ({id,label}) => {
			    return (<li data-id={id} className="mdl-list__item" onClick={this.updateDeckView.bind(this)}>
				    <span className="mdl-list__item-primary-content">
				    <i className="material-icons mdl-list__item-icon">view_stream</i>
				    {label}
				    </span>
				    <span className="mdl-list__item-secondary-action">
				    <button className="mdl-button mdl-js-button">
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
		{this.buildDialog()}
		{this.buildNameDialog()}
		</div>
		{( _ => {
		    if(this.state.deck) {
			console.log("building deck view");
			return this.state.deck.map(card => {
			    return (<div className="mdl-cell mdl-cell--3-col">
				    <Card {...card} addhandler={this.addCardToDeck.bind(this)} removehandler={this.removeCardFromDeck.bind(this)}/>
				    </div>)
			});
		    }
		})()
		}
		
		</div>)
		
    }

    updateDeckView(evt) {
	let target = evt.target.dataset.id;

	let deck = Deck.getdeck(target);
	if(deck && deck.deck) {
	    console.log("setting target to " + target);
	    let cards = deck.deck.map(({id,count}) => Object.assign({},Cards.getcard(id), {count}));
	    this.setState({deck: cards});
	}
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
