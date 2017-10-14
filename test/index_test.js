import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import Main from '../src/main.js';

describe('<Main>', function() {
    it('basic test', function() {
	const obj = mount(<Main />);
	expect(obj).to.not.be.null;
    })

    it('state test', function() {
	const obj = new Main();
	expect(obj).to.not.be.null;
	expect(obj.state.deck).to.have.lengthOf(0);
	expect(obj.state.cardset).to.equal("");
	expect(obj.state.cardsets).to.have.lengthOf(0);
	expect(obj.state.flush_display).to.be.true;
	expect(obj.state.deck_input_name).to.be.undefined;
    })

    it('update ownership test', function() {
	const obj = new Main();
	
	obj.updateOwnership({ currentTarget: { dataset : { id:1, number:"1"} }});
    })

    it('update card view', function() {
	const obj = new Main();
	obj.updateCardView({});
    })

    it('add card to deck', function() {
	const obj = new Main();
	obj.addCardToDeck({ currentTarget: { dataset: { id: 1} }});
    })

    it('update card count', function() {
	const obj = new Main();
	obj.updateCardCount({ currentTarget: { dataset: { id: 1 } } })
    })

    it('remove card from deck', function() {
	const obj = new Main();
	obj.removeCardFromDeck({target:{dataset:{id:1}}});
    });

    it('delete deck', function() {
	const obj = new Main();
	obj.deleteDeck({ currentTarget: { dataset: { id: 1 } } });
    })

    it('update deck view', function() {
	const obj = new Main();
	obj.updateDeckView({ currentTarget: { dataset: { id: 1 } } });
    })
})
