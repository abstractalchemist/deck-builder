import { Observable } from 'rxjs'
const { create, from } = Observable
import Http from 'utils';
import db_interface from './db'
import { basic_handler, login_status } from './store_utils'
export default (function() {
//    let decks = [{id:1,label:"Testing"}];
   let selecteddeck, selectedrev;
   
   const getsecurityheaders = function() {
      let headers = {}
      if(window.sessionStorage) {
         let session = window.sessionStorage.getItem('fb-token')
         
         if(session)
         headers = { TOKEN : session, 'content-type':'application/json' }
         
      }
      return headers;
   }
   
   return {
   
      adddeck(name) {
         //	    return Rx.Observable.create( observer => {
         //		let decklength = decks.length;
         //		decks.push({id:decklength, label:name});
         //		observer.onNext();
         //		observer.onCompleted();
         //	    })
         let headers = getsecurityheaders()
         return login_status()
            .mergeMap(user_id => 
               create(observer => {
                  db_interface.updateItem({
                     TableName:'decks',
                     Key: {
                        user_id: {
                           S:user_id
                        }
                     },
                     ExpressionAttributeValues: {
                        ":label": {
                           S:name
                        }
                     },
                     UpdateExpression:"SET label = :label",
                     ReturnValues:"ALL_NEW"
                  }, basic_handler)
               })
            )
//         return from(Http({method:"GET",url:"/api/_uuids",headers}))
//            .map(JSON.parse)
//            .pluck('uuids')
//            .mergeMap(uuid => {
//            return Rx.Observable.fromPromise(Http({method:"PUT",url:"/api/decks/" + uuid,headers},JSON.stringify({label:name,deck:[]})));
//            
//            })
      },
      getdecks() {
         //	    return Rx.Observable.from(decks).toArray();
         let headers = getsecurityheaders()
         return create(observer => {
         })
//         return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/_design/view/_list/all/all",headers}))
//         .map(JSON.parse)
//         .mergeMap(Rx.Observable.from)
//         .map(obj => Object.assign({},obj,{ id: obj._id }))
//         .toArray();
      },
      getdeck(id) {
         let headers = getsecurityheaders()
         selecteddeck = id;
         return create(observer => {
         })
//         return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/" + id,headers}))
//         .map(JSON.parse)
//         .map(obj => Object.assign({},obj,{id:obj._id}))
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
         let headers = getsecurityheaders()
         
         // removes unnecessary properties
         let reduced = deck.map(({id,count}) => {
            return {id,count}
         })
         return create(observer => {
         })
//         return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/" + id,headers}))
//         .map(JSON.parse)
//         .mergeMap( ({ _rev, _id, label}) => {
//         return Rx.Observable.fromPromise(Http({method:"PUT",url:"/api/decks/" + id, headers},
//         JSON.stringify({
//         deck: reduced,
//         label: label,
//         _rev:_rev})))
//         })
      },
      
      deleteDeck(id) {
         let headers = getsecurityheaders()
         return create(observer => {
         })
//         if(selecteddeck == id)
//         selecteddeck = {};
//         return Rx.Observable.fromPromise(Http({method:"GET",url:"/api/decks/" + id, headers}))
//         .map(JSON.parse)
//         .mergeMap(({_rev,_id}) => {
//         return Rx.Observable.fromPromise(Http({method:"DELETE",url:"/api/decks/"+id+"?rev=" + _rev,headers}))
//         });
      }
   };
})()
