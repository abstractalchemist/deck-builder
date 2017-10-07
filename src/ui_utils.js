import React from 'react';

function Nav({title,links,tabs}) {

    const generateTabHeaders = _ => {
	if(tabs) {
	    return (<div className="mdl-layout__tab-bar mdl-js-ripple-effect">
		    {( _ => {
			return tabs.map(({id,label}) => <a href={"#" + id} className="mdl-layout__tab" id={id + "_tab"}>{label}</a>)
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

function Card({id,image,abilities,count,removehandler,addhandler,children}) {
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
		else if(children)
		    return children
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

export { Nav, Drawer, Body, Menu, Card, SearchField };
