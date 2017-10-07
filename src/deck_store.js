import Rx from 'rx';
import Http from './utils';

export default (function() {
    let decks = [{id:1,label:"Testing"}];
    return {

	adddeck(name) {
	    return Rx.Observable.create( observer => {
		let decklength = decks.length;
		decks.push({id:decklength, label:name});
		observer.onNext();
		observer.onCompleted();
	    })
	},
	getdecks() {
	    return decks;
	},
	getdeck(id) {
	    return { id : 1,
		     deck : [{id:"VS/W50-033",count:4},
			     {id:"VS/W50-043",count:1},
			     {id:"VS/W50-003",count:1},
			     {id:"VS/W50-069",count:1}] }
	},
	updatedeck(id,deck) {
	}

	
    };
})()
