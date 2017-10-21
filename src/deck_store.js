import Rx from 'rxjs/Rx';
import Http from 'utils';

export default (function() {
    //    let decks = [{id:1,label:"Testing"}];
    let selecteddeck, selectedrev;
    return {

	adddeck(name) {
//	    return Rx.Observable.create( observer => {
//		let decklength = decks.length;
//		decks.push({id:decklength, label:name});
//		observer.onNext();
//		observer.onCompleted();
	    //	    })
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/_uuids"}))
		.map(JSON.parse)
		.pluck('uuids')
		.mergeMap(uuid => {
		    return Rx.Observable.fromPromise(Http({method:"PUT",url:"/api/decks/" + uuid},JSON.stringify({label:name,deck:[]})));
				
		})
	},
	getdecks() {
	    //	    return Rx.Observable.from(decks).toArray();
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/_design/view/_list/all/all"}))
		.map(JSON.parse)
		.mergeMap(Rx.Observable.from)
		.map(obj => Object.assign({},obj,{ id: obj._id }))
		.toArray();
	},
	getdeck(id) {
	    selecteddeck = id;
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/" + id}))
		.map(JSON.parse)
		.map(obj => Object.assign({},obj,{id:obj._id}))
//	    return Rx.Observable.create(observer => {
//		observer.onNext({ id : 1,
//				  deck : [{id:"VS/W50-033",count:4},
//					  {id:"VS/W50-043",count:1},
//					  {id:"VS/W50-003",count:1},
//					  {id:"VS/W50-069",count:1}] });
//		observer.onCompleted();
//	    });
	},
	
	updatedeck(id,deck) {
	    let reduced = deck.map(({id,count}) => {
		return {id,count}
	    })
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/" + id}))
		.map(JSON.parse)
		.mergeMap( ({ _rev, _id, label}) => {
		    return Rx.Observable.fromPromise(Http({method:"PUT",url:"/api/decks/" + id},
							  JSON.stringify({
							      deck: reduced,
							      label: label,
							      _rev:_rev})))
		})
	},

	deleteDeck(id) {
	    if(selecteddeck == id)
		selecteddeck = {};
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/" + id}))
		.map(JSON.parse)
		.mergeMap(({_rev,_id}) => {
		    return Rx.Observable.fromPromise(Http({method:"DELETE",url:"/api/decks/"+id+"?rev=" + _rev}))
		});
	}
    };
})()
