import Cards from '../src/card_store'

describe("Card Store Test", function() {

    // this isn't working something in JSOM
    xit("export", function(done) {
	Cards.export_card_list(["vs_w50_104"])
	    .subscribe(
		_ => {
		},
		err => {
		    done(err);
		},
		_ => {
		    done()
		})
    })
})
