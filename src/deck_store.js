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
	    return Rx.Observable.fromArray(decks).toArray();
	},
	getdeck(id) {
	    return Rx.Observable.create(observer => {
		observer.onNext({ id : 1,
				  deck : [{id:"VS/W50-033",count:4},
					  {id:"VS/W50-043",count:1},
					  {id:"VS/W50-003",count:1},
					  {id:"VS/W50-069",count:1}] });
		observer.onCompleted();
	    });
	},
	updatedeck(id,deck) {
	}

	
    };
})()
