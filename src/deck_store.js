import { Observable } from 'rxjs'
const { create, from } = Observable
import Http from 'utils';
import get_interface from './db'
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
         let headers = getsecurityheaders()
         return login_status()
            .mergeMap(user_id => 
               create(observer => {
                  get_interface().putItem({
                     TableName:'decks',
                     Item: {
                        user_id: {
                           S: user_id
                        },
                        generated_id: {
                           S: name.toLowerCase().replace(' ','_')
                        },
                        label: {
                           S: name
                        }
                     }
                  }, basic_handler(observer))
               })
            )
      },
      getdecks() {
         //	    return Rx.Observable.from(decks).toArray();
         let headers = getsecurityheaders()
         return login_status()
            .mergeMap(user_id => 
               create(observer => {
                  get_interface().query({
                     ExpressionAttributeValues: {
                        ":v" : {
                           S: user_id
                        }
                     },
                     KeyConditionExpression: "user_id = :v",
                     TableName:'decks'
                  },
                  basic_handler(observer))
               }))
            .pluck('Items')
            .mergeMap(from)
            .map(({generated_id:{S:id},label:{S:label}}) => {
               return {
                  id,
                  label
               }
            })
            .reduce(
               (R,V) => { R.push(V); return R },
               [])
        
      },
      getdeck(id) {
         let headers = getsecurityheaders()
         selecteddeck = id;
         return login_status()
            .mergeMap(user_id => 
               create(observer => {
                  get_interface().getItem({
                     TableName:'decks',
                     Key: {
                        user_id: {
                           S:user_id
                        },
                        generated_id: {
                           S: id
                        }
                     }
                  },
                  (err, data) => {
                     if(err) observer.error(err)
                     else {
                        observer.next(data.Item)
                        observer.complete() 
                     }
                  })
               }))
            .do(console.log.bind(console))
            .map( ({generated_id:{S:id}, label:{S:label}, deck}) => {
               if(deck)
                  return { id, label, deck:deck.L }
               return {id, label, deck:[]}
            })
      },
      
      updatedeck(id,deck) {
         let headers = getsecurityheaders()
         
         // removes unnecessary properties
         let reduced = deck.map(({id,count}) => {
            return { 
               id: {
                  S: id
               }, 
               count: {
                  N:count
               }
            }
         })
         return login_status()
            .mergeMap(user_id => 
               create(observer => {
                  get_interface().putItem({
                     TableName:'decks',
                     Item: {
                        user_id: {
                           S: user_id
                        },
                        generated_id: {
                           S: id
                        },
                        deck: {
                           L:reduced
                        }
                     }
                  },
                  basic_handler(observer))
               })
            )
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
