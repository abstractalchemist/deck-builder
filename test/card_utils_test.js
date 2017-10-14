import { expect } from 'chai';
import React from 'react';
import { mount } from 'enzyme';

import { CardSetView, CardSetNameView, Checkbox, NameDialog, DeckSettingsDialog, DeckLevelView } from '../src/card_utils';

describe('<CardSetView>', function() {
    it('init', function() {
	const obj = mount(<CardSetView cardset_coll={[{},{},{},{},{},{}]} cardset_filter="" filter_to_deck={false} deck={[]} addhandler={
	    _ => {
	    }
	}
			  addhandler2={
			      _ => {
			      }
			  }/>);
	expect(obj).to.not.be.null;
	expect(obj.find("Card")).to.have.lengthOf(6);
    })

    it('filter', function() {
	const obj = mount(<CardSetView cardset_coll={[{abilities:["filter this"]},{},{},{},{},{}]} cardset_filter="filter" filter_to_deck={false} deck={[]} addhandler={
	    _ => {
	    }
	}
			  addhandler2={
			      _ => {
			      }
			  }/>);

	expect(obj.find("Card")).to.have.lengthOf(1);
	expect(obj.find("Card div.mdl-card__supporting-text").text()).to.equal("filter this");
    })

    it('filter to deck', function() {
	const obj = mount(<CardSetView cardset_coll={[{id:1},{id:2},{id:3},{id:4},{id:5},{id:6}]} cardset_filter="" filter_to_deck={true} deck={[{id:1}]} addhandler={
	    _ => {
	    }
	}
			  addhandler2={
			      _ => {
			      }
			  }/>);

	expect(obj.find("Card")).to.have.lengthOf(1);

    })
})

describe('<CardSetNameView>', function() {
    it('init', function() {
	const obj = mount(<CardSetNameView cardsets={[]} is_building={false} clickhandler={
	    _ => {
	    }
	}/>);
	expect(obj).to.not.be.null;
    })

    it('test progress', function() {
	const obj = mount(<CardSetNameView cardsets={[]} is_building={true} clickhandler={
	    _ => {
	    }
	}/>);

	expect(obj.find("button")).to.have.lengthOf(0);
	expect(obj.find(".mdl-spinner")).to.have.lengthOf(1);
    })

    
})

describe('<Checkbox>', function() {
    it('init', function() {
	const obj = mount(<Checkbox label={"A Label"}/>);
	expect(obj).to.not.be.null;
	expect(obj.text()).to.equal("A Label");
    })
})

describe('<NameDialog>', function() {
    it('init', function() {
	let nameUpdate = "";
	const obj = mount(<NameDialog deck_input_name="A Test Deck"
			  changehandler={
			      evt => {
				  nameUpdate = evt.target.value;
			      }
			  }

			  addhandler={
			      _ => {
			      }
			  }/>);
	expect(obj).to.not.be.null;
	expect(obj.find(".mdl-textfield__input").prop('value')).to.equal("A Test Deck");
	obj.find(".mdl-textfield__input").simulate('change', { target: { value: "A Different Name" } });
	expect(nameUpdate).to.equal("A Different Name");
	
    })
})

describe('<DeckSettingsDialog>', function() {
    it('init', function() {
	const obj = mount(<DeckSettingsDialog decks={[{},{},{},{},{}]}
			  deletehandler={
			      _ => {
			      }
			  }/>);
	expect(obj).to.not.be.null;
	expect(obj.find("li")).to.have.lengthOf(5);
	let test_item = obj.find("li.mdl-list__item span").at(0)
	test_item.simulate('click', { currentTarget: {} });
    })
})

describe('<DeckLevelView>', function() {
    it('init', function() {
	const obj = mount(<DeckLevelView deck={[{rarity:"C", level:"0",count:1},
						{rarity:"C", level:"1",count:1},
						{rarity:"C", level:"1",count:1},
						{rarity:"R", level:"2",count:1},
						{rarity:"C", level:"2",count:1},
						{rarity:"U", level:"2",count:1},
						{rarity:"RRR", level:"3",count:1},
						{rarity:"RRR", level:"3",count:1},
						{rarity:"RRR", level:"3",count:1},
						{rarity:"RRR", level:"3",count:1},
						{rarity:"CC", level:"-",count:1}]}/>);
	expect(obj).to.not.be.null;
	expect(obj.find("tbody tr td").at(0).text()).to.equal("4");
	expect(obj.find("tbody tr td").at(1).text()).to.equal("3");
	expect(obj.find("tbody tr td").at(2).text()).to.equal("2");
	expect(obj.find("tbody tr td").at(3).text()).to.equal("1");
	expect(obj.find("tbody tr td").at(4).text()).to.equal("1");
    })
})
