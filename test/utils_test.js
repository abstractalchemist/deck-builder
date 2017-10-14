import { partitioncardsets, generateCard, generateDeckView } from '../src/utils'
import { expect } from 'chai';
import React from 'react';
import { mount } from 'enzyme';

function Wrapper({children}) {
    return (<div>
	    {children}
	    </div>)
}

describe('utils.js test', function() {
    
    it('paritioncardsets', function() {
	let tables = partitioncardsets([{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7}], 3);
	const obj = mount(<Wrapper>{tables}</Wrapper>);
		
	expect(obj).to.not.be.null;
	expect(tables).to.have.lengthOf(3);
    })

    it('generateCard', function() {
	let cardgenerator = generateCard(
	    _ => {
	    },
	    _ => {
	    });
	const card = mount(cardgenerator({abilities:["",""]}));
	expect(card).to.not.be.null;
	expect(card.find("p")).to.have.lengthOf(2);
	
    })

    it('generateDeckView', function() {
	let deckview = generateDeckView([{level:"1",rarity:"R"},
					 {level:"2",rarity:"R"},
					 {level:"1",rarity:"CR"},
					 {level:"3",rarity:"C"},
					 {level:"1",rarity:"CC"}], true,
					_ => {
					},
					_ => {
					});
	const obj = mount(<div>{deckview}</div>);
	expect(obj).to.not.be.null;
	expect(obj.find("Card")).to.have.lengthOf(5);
	expect(deckview).to.have.lengthOf(5);

	deckview = generateDeckView([{level:"1",rarity:"R"},
				     {level:"2",rarity:"R"},
				     {level:"1",rarity:"CR"},
				     {level:"3",rarity:"C"},
				     {level:"1",rarity:"CC"}], false,
				    _ => {
				    },
				    _ => {
				    });

	expect(deckview).to.have.lengthOf(9);
    })
})
