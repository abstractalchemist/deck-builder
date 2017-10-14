import React from 'react';



function CardSetTable({slice, maxrows}) {
    return (<table className="mdl-data-table mdl-js-data-table mdl-data-table--selectable" style={{display:"inline-block",marginLeft:"1rem",marginRight:"1rem"}}>
	    <thead>
	    <tr>
	    <th className="mdl-data-table__cell--non-numeric">Set Name</th>
	    </tr>
	    </thead>
	    <tbody>
	    {( _ => {
		let rows = slice.map(o => {
		    
		    return (<tr>
			    <td className="mdl-data-table__cell--non-numeric" data-id={o.id}>{o.label}</td>
			    </tr>)
		})
		let j = rows.length;
		while(j < maxrows) {
		    rows.push(<tr></tr>);
		    j++
		}
		return rows;
	    })()
	    }
	    </tbody>
	    </table>)
}

function partitioncardsets(cardsets, maxrows) {
    let i = 0;
    maxrows = maxrows || 5;
    let tables = [];
    while(i < cardsets.length) {
	let slice = cardsets.slice(i, i+ maxrows);
	tables.push((_ => <CardSetTable slice={slice} maxrows={maxrows}/>))
	
	i = i + maxrows;
    }

    return tables;
}

export { partitioncardsets };
