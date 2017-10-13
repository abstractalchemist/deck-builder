import Http from 'utils';
import Rx from 'rx';

export default (function() {
    let testing = [{id:"033",level:3,image:"https://images.littleakiba.com/tcg/card37121-large.jpg",abilities:["【A】 When this card is placed on Stage from Hand, you may place the top card of your Clock into Waiting Room.", "【A】 This ability can only be activated up to 1 time each turn. When you used 【S】, during this turn, this card gets +X Power. X is equals to the number of your other 《格闘》 Characters x500.", "【A】【CXCOMBO】 When this card attacks, if 「アクセルスマッシュ・インフィニティ」 is in the Climax slot, until the end of your opponent's next turn, this card gets +1500 Power, gains the following ability.『【A】 When the Character facing this card attacks, you may deal 1 Damage to your opponent.』(Damage can be cancelled)"]},
		   {id:"043",level:0,image:"https://images.littleakiba.com/tcg/card37047-medium.jpg"},
		   {id:"003",level:3,image:"https://images.littleakiba.com/tcg/card37009-medium.jpg"},
		   {id:"069",level:3,image:"https://images.littleakiba.com/tcg/card37073-medium.jpg"},
		   {id:"010",level:3,image:"https://images.littleakiba.com/tcg/card37016-medium.jpg"}]
    let selecteddb;
    return {

	getownership(card_id) {
	    return Rx.Observable.fromPromise(Http({method:"GET", url:"/api-dyn/price/" + card_id}))
		.catch(err => Rx.Observable.just("No Price found"))
	    	.map(price => {
	    	    return { count: 0, price }
	    	});
	
	    // return Rx.Observable.create(observer => {
	    //  	observer.onNext({ count: 0, price: "1.00" });
	    //  	 observer.onCompleted();
	    // })
	},

	// get a card based on id
	getcard(card_id) {
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/cardmapping/mapping"}))
		.map(JSON.parse)
		.selectMany(({mapping}) => {
		    //		    let db = mapping.find(({prefix}) => card_id.startsWith(prefix));
		    let matching_dbs = mapping.filter( ({ prefix }) => card_id.startsWith(prefix));
		    let max = -1
		    let max_index = -1;
		    
		    matching_dbs.forEach((i,j) => {
			if(i.length > max) {
			    max = i.length;
			    max_index = j;
			}
		    })
		    let db = mapping[max_index];
		    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/" + db.db + "/" + card_id})).map(JSON.parse).map(obj => Object.assign({},obj, {id:obj._id}));
		})
	},

	// get all cards from a card set id
	getcardsfromset(id) {
//	    if(id === 'VS') {
//		return Rx.Observable.fromArray(testing);
	    //	    }
	    selecteddb = id;
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/" + id + "/_design/view/_list/all/all"})).map(JSON.parse).selectMany(Rx.Observable.fromArray).map(obj => Object.assign({},obj,{id:obj._id}));
	},

	// get all known card sets
	getcardsets() {
	    //	    return Rx.Observable.fromArray([{id:"VS",label:"Vivid Strke"}]).toArray();
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/cardsets/sets"})).map(JSON.parse).pluck('sets');
	}
    };
})()
