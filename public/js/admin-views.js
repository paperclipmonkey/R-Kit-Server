/* - - - - - - - - - - - -  DataTables - - - - - - - - */

/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
	"sWrapper": "dataTables_wrapper form-inline"
} );

/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{
	return {
		"iStart":         oSettings._iDisplayStart,
		"iEnd":           oSettings.fnDisplayEnd(),
		"iLength":        oSettings._iDisplayLength,
		"iTotal":         oSettings.fnRecordsTotal(),
		"iFilteredTotal": oSettings.fnRecordsDisplay(),
		"iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
		"iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
	};
};

/* Bootstrap style pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
	"bootstrap": {
		"fnInit": function( oSettings, nPaging, fnDraw ) {
			var oLang = oSettings.oLanguage.oPaginate;
			var fnClickHandler = function ( e ) {
				e.preventDefault();
				if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
					fnDraw( oSettings );
				}
			};
			
			$(nPaging).addClass('pagination').append(
				'<ul>'+
					'<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
					'<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
				'</ul>'
			);
			var els = $('a', nPaging);
			$(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
			$(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
		},
		
		"fnUpdate": function ( oSettings, fnDraw ) {
			var iListLength = 5;
			var oPaging = oSettings.oInstance.fnPagingInfo();
			var an = oSettings.aanFeatures.p;
			var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);
			
			if ( oPaging.iTotalPages < iListLength) {
				iStart = 1;
				iEnd = oPaging.iTotalPages;
			}
			else if ( oPaging.iPage <= iHalf ) {
				iStart = 1;
				iEnd = iListLength;
			} else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
				iStart = oPaging.iTotalPages - iListLength + 1;
				iEnd = oPaging.iTotalPages;
			} else {
				iStart = oPaging.iPage - iHalf + 1;
				iEnd = iStart + iListLength - 1;
			}
			
			for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
				// Remove the middle elements
				$('li:gt(0)', an[i]).filter(':not(:last)').remove();
				
				// Add the new list items and their event handlers
				for ( j=iStart ; j<=iEnd ; j++ ) {
					sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
					$('<li '+sClass+'><a href="#">'+j+'</a></li>')
						.insertBefore( $('li:last', an[i])[0] )
						.bind('click', function (e) {
							e.preventDefault();
							oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
							fnDraw( oSettings );
						} );
				}
				
				// Add / remove disabled classes from the static elements
				if ( oPaging.iPage === 0 ) {
					$('li:first', an[i]).addClass('disabled');
				} else {
					$('li:first', an[i]).removeClass('disabled');
				}
				
				if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
					$('li:last', an[i]).addClass('disabled');
				} else {
					$('li:last', an[i]).removeClass('disabled');
				}
			}
		}
	}
});

/* Show/hide table column */
function dtShowHideCol( iCol ) {
	var oTable = $('#views-tables').dataTable();
	var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
	oTable.fnSetColumnVis( iCol, bVis ? false : true );
}

function trim(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
            if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
            }
    }
    return str;
}

function dateHeight(dateStr){
	var x;
    if (trim(dateStr) != '') {
            var frDate = trim(dateStr).split(' ');
            var frTime = frDate[1].split(':');
            var frDateParts = frDate[0].split('/');
            var day = frDateParts[0] * 60 * 24;
            var month = frDateParts[1] * 60 * 24 * 31;
            var year = frDateParts[2] * 60 * 24 * 366;
            var hour = frTime[0] * 60;
            var minutes = frTime[1];
            x = day+month+year+hour+minutes;
    } else {
            x = 99999999999999999; //GoHorse!
    }
    return x;
}

jQuery.fn.dataTableExt.oSort['date-euro-asc'] = function(a, b) {
    var x = dateHeight(a);
    var y = dateHeight(b);
    var z = ((x < y) ? -1 : ((x > y) ? 1 : 0));
    return z;
};

jQuery.fn.dataTableExt.oSort['date-euro-desc'] = function(a, b) {
    var x = dateHeight(a);
    var y = dateHeight(b);
    var z = ((x < y) ? 1 : ((x > y) ? -1 : 0));
    return z;
};

/* Table #example */
$(document).ready(function() {
	window.oTable = $('.datatable').dataTable( {
		"aaSorting": [[ 2, "desc" ]],
		"sDom": "<'row-fluid'<'span4'l><'span8'f>r>t<'row-fluid'<'span4'i><'span8'p>>",
		"sPaginationType": "bootstrap",
		"bStateSave": true,
		"oLanguage": {
			"sLengthMenu": "_MENU_ records per page"
		},
		"sAjaxSource": '/admin/views-datatables',
		"aoColumnDefs": [
			{
				"aTargets": [ 0 ],
				"bVisible": false
			},
			{
				// `data` refers to the data for the cell (defined by `mData`, which
				// defaults to the column being worked with, in this case is the first
				// Using `row[0]` is equivalent.
				"mRender": function ( data, type, row ) {
					return '<img src="http://maps.googleapis.com/maps/api/staticmap?center=' + data.coordinates[1] + ',' + data.coordinates[0] + '&zoom=11&size=200x200&sensor=false&visual_refresh=true&markers=color:red%7C'+ data.coordinates[1] + ',' + data.coordinates[0] + '">';
				},
				"aTargets": [ 1 ]
			},
				{
			// `data` refers to the data for the cell (defined by `mData`, which
			// defaults to the column being worked with, in this case is the first
			// Using `row[0]` is equivalent.
			    "sType": "date-euro",
			    "mRender": function ( data, type, row ) {
					var d = new Date(data);
					var hour = d.getHours();
					if(hour <= 9){
						hour = "0" + hour;
					}
					var minute = d.getMinutes();
					if(minute <= 9){
						minute = "0" + minute;
					}
					var day = d.getDate();
					if(day <= 9){
						day = "0" + day;
					}
					var month = d.getMonth() + 1;
					if(month <= 9){
						month = "0" + month;
					}
					return day + '/' + month + '/' + d.getFullYear() + ' ' + hour + ':' + minute;
				},
				"aTargets": [ 2 ]
			},
			{
				"mRender": function ( data, type, row ) {
					return '<img src="http://static.ratemyview.co.uk/uploads/' + data + '"/>';
				},
				"aTargets": [ 5 ]
            }
            //{ "bVisible": false,  "aTargets": [ 3 ] },
            //{ "sClass": "center", "aTargets": [ 4 ] }
        ]
	});
	$('.datatable tbody tr').live('click', function () {
		var aData = oTable.fnGetData( this );
		window.location.href= "/admin/views/" + aData[0];
	});
	//oTable.fnSetColumnVis('0', false);
	$('.datatable-controls').on('click','li input',function(){
		dtShowHideCol( $(this).val() );
	});
	$('#myInputTextField').on('keyup', function(){
		oTable.fnFilter( $(this).val() );
	});
	iMin = null;
	iMax = null;
	$.fn.dataTableExt.afnFiltering.push(
		function( oSettings, aData, iDataIndex ) {
			//var iMin = document.getElementById('min').value * 1;
			//var iMax = document.getElementById('max').value * 1;
			var iDate = new Date(aData[2]);
			//return true;
			if ( iMin === null && iMax === null )
			{
				return true;
			}
			else if ( iMin === null && iDate < iMax )
			{
				return true;
			}
			else if ( iMin < iDate && null === iMax )
			{
				return true;
			}
			else if ( iMin < iDate && iDate < iMax )
			{
				return true;
			}
			return false;
		}
	);
});