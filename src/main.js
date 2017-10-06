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
	    <button className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" data-id={id} onClick={removehandler}>
	    <i className="material-icons">remove</i>
	    </button>
	    <button className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" data-id={id} onClick={addhandler}>
	    <i className="material-icons">add</i>
	    </button>
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
		       content : function() {
			   return (<div className="mdl-grid">
				  
				   </div>)
		     }}];
    }

    buildCardSet() {
    }

    addCardToDeck(evt) {
	let target = evt.target.dataset.id;
	console.log("adding " + target + " to deck");
    }

    removeCardFromDeck(evt) {
	let target = evt.target.dataset.id;
	console.log("removing " + target + " from deck");
    }

    buildDeck() {
	return (<div className="mdl-grid">
		<div className="mdl-cell mdl-cell--12-col">
		{ /* add deck ids here */}
		<Menu menu_id="decks" items={Deck.getdecks()} clickhandler={this.updateDeckView.bind(this)} />
		
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
