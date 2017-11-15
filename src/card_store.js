import Http from 'utils';
import Rx from 'rxjs';

export default (function() {
    let testing = [{id:"033",level:3,image:"https://images.littleakiba.com/tcg/card37121-large.jpg",abilities:["【A】 When this card is placed on Stage from Hand, you may place the top card of your Clock into Waiting Room.", "【A】 This ability can only be activated up to 1 time each turn. When you used 【S】, during this turn, this card gets +X Power. X is equals to the number of your other 《格闘》 Characters x500.", "【A】【CXCOMBO】 When this card attacks, if 「アクセルスマッシュ・インフィニティ」 is in the Climax slot, until the end of your opponent's next turn, this card gets +1500 Power, gains the following ability.『【A】 When the Character facing this card attacks, you may deal 1 Damage to your opponent.』(Damage can be cancelled)"]},
		   {id:"043",level:0,image:"https://images.littleakiba.com/tcg/card37047-medium.jpg"},
		   {id:"003",level:3,image:"https://images.littleakiba.com/tcg/card37009-medium.jpg"},
		   {id:"069",level:3,image:"https://images.littleakiba.com/tcg/card37073-medium.jpg"},
		   {id:"010",level:3,image:"https://images.littleakiba.com/tcg/card37016-medium.jpg"}]
    let selecteddb;


    // this is a reverse mapper
    const mapper = card_id => {
	return Rx.Observable.from(Http({method:"GET",url:"/api/cardmapping/mapping"}))
	    .catch(err => {
		console.log(err)
		if(window.localStorage)
		    return Rx.Observable.of(window.localStorage.getItem('mapping'))
		throw err;
	    })

	    .do(data => {
		if(window.localStorage) {
		    window.localStorage.setItem('mapping', data)
		}
	    })
	    .map(JSON.parse)
	    .map(({mapping}) => {
		//		    let db = mapping.find(({prefix}) => card_id.startsWith(prefix));
		let matching_dbs = mapping.filter( ({ prefix }) => card_id.startsWith(prefix));
		    let max = -1
		let max_index = -1;
		
		matching_dbs.forEach(({prefix},j) => {
		    if(prefix.length > max) {
			max = prefix.length;
			    max_index = j;
		    }
		})
		return matching_dbs[max_index];
	    })

    }
    
    const cardmapper = card_id => {
	return mapper(card_id)
	    .mergeMap(db => Http({method:"GET",url:"/api/" + db.db + "/" + card_id}))
	    
	    .catch(err => {
		if(window.localStorage) {
		    return Rx.Observable.of(window.localStorage.getItem(card_id))
		}
		throw err
	    })
	    .do(data => {
		if(window.localStorage)
		    window.localStorage.setItem(card_id, data)
	    })
	    .map(JSON.parse)
	    .map(obj => Object.assign({},obj, {id:obj._id}));
		
    }
    
    return {

	removefromcollection(card_id) {
	    return Rx.Observable.from(Http({method:"GET",url:"/api/library/" + card_id}))
		.catch(_ => {
		    return Rx.Observable.of();
		})
		.map(JSON.parse)
		.mergeMap(({count,_rev}) => {
		    if(count === 1)
			return Http({method:"DELETE",url:"/api/library/"+card_id+"?rev=" + _rev})
		    else
			    
			return Http({method:"PUT",url:"/api/library/"+card_id}, JSON.stringify({count:count-1,_rev}))
		})
			
	},
	
	// returns a url of export card list
	export_card_list(card_ids) {
	    return Rx.Observable.from(card_ids)
		.mergeMap(mapper)
		.toArray()
		.map(dbs => {
		    let db = dbs[0].db;
		    return {url:"/api/" + db + "/_design/view/_list/all/byid",data:JSON.stringify(card_ids)};
		})
		    
		
	},
	addtocollection(card_id) {
	    return Rx.Observable.from(Http({method:"GET",url:"/api/library/" + card_id}))
		.map(JSON.parse)
		.mergeMap(({count,_rev}) => Http({method:"PUT",url:"/api/library/" + card_id}, JSON.stringify({count:count+1,_rev})))
		.catch(_ => Rx.Observable.from(Http({method:"PUT",url:"/api/library/" + card_id}, JSON.stringify({count:1}))));
	},
	
	getownership(card_id) {
	    if(!card_id)
		throw "Card Id not provided"
	    return Rx.Observable.from(Http({method:"GET",url:"/api/library/" + card_id.toLowerCase().replace(/\/|-/g,"_")}))
		.map(JSON.parse)
		.catch(_ => Rx.Observable.from(Http({method:"GET", url:"/api-dyn/price/" + card_id}))
		       .catch(err => Rx.Observable.of("No Price found"))
	    	       .map(price => {
	    		   return { count: 0, price }
	    	       }));
	
	    // return Rx.Observable.create(observer => {
	    //  	observer.onNext({ count: 0, price: "1.00" });
	    //  	 observer.onCompleted();
	    // })
	},

	// get a card based on id
	getcard(card_id) {
	    return cardmapper(card_id);
	},

	// get all cards from a card set id
	getcardsfromset(id) {
	    return Rx.Observable.from(Http({method:"GET",url:"/api/" + id + "/_design/view/_list/all/all"}))

		.catch(err => {
		    if(window.localStorage) {
			return Rx.Observable.of(window.localStorage.getItem(id))
		    }
		    throw err
		})
		.do(data => {
		    if(window.localStorage)
			window.localStorage.setItem(id,data)
		})
	    	.map(JSON.parse)
		.mergeMap(data => Rx.Observable.from(data))
		.map(obj => Object.assign({},obj,{id:obj._id}));
	},

	// get all known card sets
	getcardsets() {

	    return Rx.Observable.from(Http({method:"GET",url:"/api/cardsets/sets"}))

		.catch(err => {
		    if(window.localStorage) {
			return Rx.Observable.of(window.localStorage.getItem('sets'))
		    }
		    else
			throw err;
		})
		.do(data => {
		    if(window.localStorage)
			window.localStorage.setItem('sets', data)
		})
	    	.map(JSON.parse)
		.pluck('sets');
	}
    };
})()
