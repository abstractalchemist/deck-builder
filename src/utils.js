export default function(opts, data) {
    return new Promise((resolve,reject) => {
	let method = opts.method || "GET";
	let inputs = data || "";
	let xhr = new XMLHttpRequest();
	xhr.open(method, opts.url);
	xhr.onreadystatechange = function() {
	    if(xhr.readyState === 4) {
		if(xhr.status === 200 || xhr.status === 201) {
		    console.log("%s resolved with status %s", opts.url, xhr.status);
		    resolve(xhr.responseText);
		}
		else {
		    console.log("rejected message to %s with status %s", opts.url, xhr.status);
		    reject();
		}
		
	    }

	}
	xhr.send(inputs);
    })
}
		       
    
