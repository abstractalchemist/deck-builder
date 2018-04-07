import Http from 'utils';
import { Observable } from 'rxjs';
const { create, from, of } = Observable
import  get_interface  from './db'

import { basic_handler, login_status } from './store_utils'
export default (function() {
   let selecteddb;
   const getsecurityheaders = function() {
      let headers = {}
      if(window.sessionStorage) {
         let session = window.sessionStorage.getItem('fb-token')
      
         if(session)
            headers = { TOKEN : session, 'content-type':'application/json' }
      
      }
      return headers;
   }
   
   
   // this is a reverse mapper
   const mapper = card_id => {
      return create(observer => {
         get_interface().scan({
            TableName:'card_sets'
         },
         (error, data) => {
            if(error) observer.error(error)
            else {
               observer.next(data)
               observer.complete()
            }
         })
      })
         .pluck('Items')
         .map(mapping => {
            let matching_dbs = mapping.filter( ({ prefix }) => {
               if(prefix.S) {
                  prefix = prefix.S
                  return card_id.startsWith(prefix.toLowerCase().replace('/','_').replace('-','_'))
               }
               else if(prefix.SS) {
                  return prefix.SS.some(prefix => card_id.startsWith(prefix.toLowerCase().replace('/','_').replace('-','_')))      
               }
            })
               .map(({id,prefix}) => {
                  if(prefix.S)
                     return {id,prefix:prefix.S}
                  else if(prefix.SS) 
                     return {id,prefix:prefix.SS}
               })

            
            let max = -1
            let max_index = -1;
            
            matching_dbs
               .forEach(({prefix},j) => {
                  if(Array.isArray(prefix)) {
                     prefix.forEach(p => {
                        if(p.length > max) {
                           max = p.length
                           max_index = j
                        }
                     })
                  }
                  if(prefix.length > max) {
                     max = prefix.length;
                     max_index = j;
                  }
               })
            return matching_dbs[max_index].id.S

         })
   
   }
   
   const get_value = obj => {
      if(obj['S'])
         return obj['S']
      else if(obj['N'])
         return parseInt(obj['N'])
      else if(obj['SS']) {
         return obj['SS']
      }
      return obj['M']

   }

   const flatten = dynamo_obj => {
      if(typeof dynamo_obj !== 'object' || Array.isArray(dynamo_obj))
         return dynamo_obj
      let output = {}
      for(let i in dynamo_obj) {
         if(dynamo_obj.hasOwnProperty(i)) {
            let value = dynamo_obj[i]
            output[i] = flatten(get_value(dynamo_obj[i]))
         }
      }
      return output
   }

   const cardmapper = card_id => {
      return mapper(card_id)
         .mergeMap(db => {
            return create(observer => {
               get_interface().getItem({
                  TableName:'cards',
                  Key: {
                     table_id:{
                        S:db
                     },
                     id:{
                        S:card_id
                     }
                  }
               },
               (error, data) => {
                  if(error) observer.error(error)
                  else {
                     observer.next(data)
                     observer.complete()
                  }
               })
            })
         })
         .pluck('Item')
         .map(flatten)
   }
   
   let library_cache = undefined;

   const get_library = _ => {
      return login_status()
         .mergeMap(user_id => 
            create(observer => {
               console.log(`using id ${user_id}`)
               get_interface().getItem({
                  TableName:'library',
                  Key: {
                     user_id: {
                        S:user_id
                        
                     }
                  }
               }, basic_handler(observer))
            })
         )
   }
  
   const update_library = data => {
      return login_status()
         .mergeMap(user_id => 
            create(observer => 
               get_interface().updateItem({
                  TableName:'library',
                  Key: {
                     user_id:{
                        S:user_id
                     }
                  },
                  ExpressionAttributeNames: {
                     "#library":"library"
                  },
                  ExpressionAttributeValues: {
                     "#l": {
                        L: data
                     }
                  },
                  UpdateExpression:"SET #library = :l",
                  ReturnValues:"ALL_NEW"
               }, basic_handler(observer))
            ))
   }

   return {
   
      removefromcollection(card_id) {
         return get_library()
            .mergeMap(data => {
               let doc = data.find( ({card_id:{S}}) => S === card_id)
               if(doc) {
                  doc.count.N = (parseInt(doc.count.N) - 1).toString()
                  if(parseInt(doc.count.N) == 0)
                     data = data.filter( ({ card_id:{S}}) => S !== card_id )
               }
               return update_library(data)
            })
      
      },
      
      // returns a url of export card list
      export_card_list(card_ids) {
         return from(card_ids)
            .mergeMap(mapper)
            .toArray()
            .map(dbs => {
               let db = dbs[0].db;
               return {url:"/api/" + db + "/_design/view/_list/all/byid",data:JSON.stringify(card_ids)};
            })
      
      
      },
      addtocollection(card_id) {
         let headers = getsecurityheaders()
         return get_library()
            .mergeMap(data => {
               let doc = data.find( ({card_id:{S}}) => S === card_id)
               if(doc)
                  doc.count.N = (parseInt(doc.count.N) + 1).toString()
               else {
                  data.push({
                     card_id: {
                        S:card_id
                     },
                     count: {
                        N:"1"
                     }
                  })
               }
               return update_library(data)
            })
      },
      update_library() {
         let headers = getsecurityheaders()
         if(headers['TOKEN']) {
            return get_library()         
         }
         else
            return of("")
      
      },
      getownership(card_id) {
         if(!card_id)
            throw "Card Id not provided"
         let headers = getsecurityheaders()
         let key =  card_id.toLowerCase().replace(/\/|-/g,"_")
         if(headers['TOKEN'] && library_cache) {
            return of(library_cache.find( ({ _id }) => key === _id))
         }
         return of("No Price found")
         
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
         return create(observer => {
            get_interface().query({
               TableName:'cards',
               ExpressionAttributeValues: {
                  ":table_id":{
                     S:id
                  }
               },
               KeyConditionExpression:"table_id=:table_id"
            },
            (error, data) => {
               if(error) observer.error(error)
               else {
                  observer.next(data)
                  observer.complete()
               }
            })
         })
            .pluck('Items')
            .mergeMap(from)
            .map(flatten)
      },
      
      // get all known card sets
      getcardsets() {
         return create(observer => {
            get_interface().scan({
               TableName:'card_sets'
            },
            (error, data) => {
               if(error) observer.error(error)
               else {
                  observer.next(data)
                  observer.complete()
               }
            })
         })
            .pluck('Items')
            .mergeMap(from)
            .map(flatten)
            .toArray()
      }
   };
})()
