export default function(self) {
    console.log("instantiating worker")
    self.addEventListener('message', ({data}) => {
	console.log(`received message`)
	data.sort(({id:id0}, {id:id1}) => id0.localeCompare(id1))
	self.postMessage(data)
    })
}
