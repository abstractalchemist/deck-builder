export default (function() {
    return {
	getdecks() {
	    return [{id:1,label:"Testing"}];
	},
	getdeck(id) {
	    return { id : 1,
		     deck : [{id:"VS/W50-033",count:4},
			     {id:"VS/W50-043",count:1},
			     {id:"VS/W50-003",count:1},
			     {id:"VS/W50-069",count:1}] }
	},
	updatedeck(id,deck) {
	}

	
    };
})()
