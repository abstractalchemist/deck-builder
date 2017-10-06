import React from 'react';

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

class Main extends React.Component {

    constructor(props) {
	super(props);

	this.links = [];
	this.tabs = [{ id: "deck_builder", label: "Deck Builder" }, { id: "card_viewer", label : "Card Viewer" }];
    }

    generateTabs() {
	if(this.tabs) {
	    return this.tabs.map( ({id}) => {
		return (<section className="mdl-layout__tab-panel" id={id}>
			<div className="page-content">
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
