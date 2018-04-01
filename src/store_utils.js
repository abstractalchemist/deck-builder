import { Observable } from 'rxjs'
const { create } = Observable
import AWS from 'aws-sdk'
const basic_handler = observer =>
   (error, data) => {
      if(error) observer.error(error)
      else {
         observer.next(data)
         observer.complete()
      }
   }

const login_status = _ => 
   create(observer => {
      if(AWS.config.credentials) {
         observer.next(AWS.config.credentials.identityId)
         observer.complete()
      }
      else {
         observer.error(new Error('credentials object undefined'))
      }
//      if(typeof FB !== 'undefined') {
//         FB.getLoginStatus(
//            ({status, authResponse:{userID}}) => {
//               if(status === 'connected') {
//                  observer.next(userID)
//                  observer.complete()
//
//               }
//               else
//                  observer.error(new Error(`user is not logged in`))
//            })
//      }
//      else
//         observer.error(new Error(`FB undefined`))
   })

export { basic_handler, login_status }
