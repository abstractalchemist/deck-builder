import Http from 'utils';
import { Observable } from 'rxjs';
const { create, from, of } = Observable
import  db_interface  from './db'
export default (function() {
   let testing = [
      {
         id:"033",
         level:3,
         image:"https://images.littleakiba.com/tcg/card37121-large.jpg",
         abilities:["【A】 When this card is placed on Stage from Hand, you may place the top card of your Clock into Waiting Room.", "【A】 This ability can only be activated up to 1 time each turn. When you used 【S】, during this turn, this card gets +X Power. X is equals to the number of your other 《格闘》 Characters x500.", "【A】【CXCOMBO】 When this card attacks, if 「アクセルスマッシュ・インフィニティ」 is in the Climax slot, until the end of your opponent's next turn, this card gets +1500 Power, gains the following ability.『【A】 When the Character facing this card attacks, you may deal 1 Damage to your opponent.』(Damage can be cancelled)"]
      },
      {
         id:"043",
         level:0,
         image:"https://images.littleakiba.com/tcg/card37047-medium.jpg"
      },
      {
         id:"003",
         level:3,
         image:"https://images.littleakiba.com/tcg/card37009-medium.jpg"
      },
      {
         id:"069",
         level:3,
         image:"https://images.littleakiba.com/tcg/card37073-medium.jpg"
      },
      {
         id:"010",
         level:3,
         image:"https://images.littleakiba.com/tcg/card37016-medium.jpg"
      }
   ]
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
         db_interface.scan({
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
         .mergeMap(mapping => {
            let matching_dbs = mapping.filter( ({ set_prefix: {S:prefix} }) => card_id.startsWith(prefix));
            let max = -1
            let max_index = -1;
            
            matching_dbs.forEach(({prefix},j) => {
               if(prefix.length > max) {
                  max = prefix.length;
                  max_index = j;
               }
            })
            return matching_dbs[max_index]

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
               db_interface.getItem({
                  TableName:db,
                  Key: {
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
         .mergeMap(from)
         .map(flatten)
   }
   
   let library_cache = undefined;
   
   return {
   
      removefromcollection(card_id) {
         let headers = getsecurityheaders()
         return from(Http({method:"GET",url:"/api/library/" + card_id, headers}))
            .catch(_ => {
               return of();
            })
            .map(JSON.parse)
            .mergeMap(({count,_rev}) => {
               if(count === 1)
                  return Http({method:"DELETE",url:"/api/library/"+card_id+"?rev=" + _rev,headers})
               
               
               return Http({method:"PUT",url:"/api/library/"+card_id, headers}, JSON.stringify({count:count-1,_rev}))
            })
            .mergeMap(this.update_library.bind(this))
      
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
         return from(Http({method:"GET",url:"/api/library/" + card_id, headers}))
            .map(JSON.parse)
            .mergeMap(({count,_rev}) => Http({method:"PUT",url:"/api/library/" + card_id, headers}, JSON.stringify({count:count+1,_rev})))
            .catch(_ => from(Http({method:"PUT",url:"/api/library/" + card_id, headers}, JSON.stringify({count:1}))))
            .mergeMap(this.update_library.bind(this))
      },
      update_library() {
         let headers = getsecurityheaders()
         if(headers['TOKEN']) {
         //		if(library_cache === undefined) {
            return from(Http({method:"GET",url:"/api/library/_design/view/_list/all/all",headers}))
               .map(JSON.parse)
               .do(data => {
                  library_cache = data;
               })
            // .mergeMap( data => {
            //     library_cache = data;
            
            //     return Rx.Observable.of(library_cache.find( ({ _id }) => key === _id))
            // })
            // }
            
            // else
            //     return Rx.Observable.of(library_cache)
         
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
            db_interface.scan({
               TableName:id
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
            db_interface.scan({
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
