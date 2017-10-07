import Rx from 'rx';
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
		.selectMany(uuid => {
		    return Rx.Observable.fromPromise(Http({method:"PUT",url:"/api/decks/" + uuid},JSON.stringify({label:name,deck:[]})));
				
		})
	},
	getdecks() {
	    //	    return Rx.Observable.fromArray(decks).toArray();
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/_design/view/_list/all/all"}))
		.map(JSON.parse)
		.selectMany(Rx.Observable.fromArray)
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
	},

	deleteDeck(id) {
	    if(selecteddeck == id)
		selecteddeck = {};
	    return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/" + id}))
		.map(JSON.parse)
		.selectMany(({_rev,_id}) => {
		    return Rx.Observable.fromPromise(Http({method:"DELETE",url:"/api/decks/"+id+"?rev=" + _rev}))
		});
	}
    };
})()
