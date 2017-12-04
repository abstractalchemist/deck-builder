export default function(self) {
    console.log("instantiating worker")
    self.addEventListener('message', ({data}) => {
	console.log(`received message`)
	data.sort()
	self.postMessage(data)
    })
}
