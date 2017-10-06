export default (function() {
    let testing = [{id:"VS/W50-033",image:"https://images.littleakiba.com/tcg/card37121-large.jpg",abilities:["【A】 When this card is placed on Stage from Hand, you may place the top card of your Clock into Waiting Room.", "【A】 This ability can only be activated up to 1 time each turn. When you used 【S】, during this turn, this card gets +X Power. X is equals to the number of your other 《格闘》 Characters x500.", "【A】【CXCOMBO】 When this card attacks, if 「アクセルスマッシュ・インフィニティ」 is in the Climax slot, until the end of your opponent's next turn, this card gets +1500 Power, gains the following ability.『【A】 When the Character facing this card attacks, you may deal 1 Damage to your opponent.』(Damage can be cancelled)"]},
		   {id:"VS/W50-043",image:"https://images.littleakiba.com/tcg/card37047-large.jpg"},
		   {id:"VS/W50-003",image:"https://images.littleakiba.com/tcg/card37009-large.jpg"},
		   {id:"VS/W50-069",image:"https://images.littleakiba.com/tcg/card37073-large.jpg"}]
    return {

	// get a card based on id
	getcard(card_id) {
	    return testing.filter(({id}) => card_id === id)[0];
	},

	// get all cards from a card set id
	getcardsfromset(id) {
	    if(id === 'VS') {
		return testing;
	    }
	},

	// get all known card sets
	getcardsets() {
	    return ["VS"];
	}
    };
})()
