/****************************************************************
 *
 *
 *
 *
 ****************************************************************/
+function($){
	'use strict';

	var Grid = function(element, options){
		this.element = $(element);
		this.options = $.extend({},Grid.DEFAULTS,options);
		this.init();
	}

	Grid.VERSION = '0.0.1';

	Grid.DEFAULTS = {
		method:"POST",
		page:1,
		pageSize:10,
		params:null,
		width:'98%',
		baseWidth:0,
		height:'auto',
		loadingText:'loading',
		nodataText:'no data',
		loadMoreText:'load more',
		noMoreText:"no more",
		loadErrorText:"load error,click to retry"
	};
	
	//INIT 
	Grid.prototype.init = function(){
		if(this.options.url == undefined || this.options.url == null){
			return ;
		}
		var options = this.options;
		//check column params
		if(options.columns == undefined || options.columns == null 
			|| Object.prototype.toString.call(options.columns) !== "[object Array]"){
			console.log('columns undefined');
			return ;
		}else{
			$.each(options.columns,function(i,column){
				//width  defualts = 50px
				if(!/\d+$/.test(column.width)){
					column.width = 50;
				}else{
					column.width = parseInt(column.width);
				}
				options.baseWidth += column.width;

			});
		}
		this.element.empty();
		var elementId = this.element.attr("id");
		this.element.html('<table width="'+this.options.width+'" height="'+this.options.height+'"><thead></thead><tbody></tbody></table>');
		//header set <th> width by percentage
		var theadHtml = '<tr>'
		var tableWidth = this.element.find('table').width();
		for(var i = 0; i < this.options.columns.length; i ++){
			var align = (this.options.columns[i].align == undefined || this.options.columns[i].align == null) ? 'left' : this.options.columns[i].align;
			var width = tableWidth * this.options.columns[i].width / this.options.baseWidth;
			theadHtml += '<th><div style="text-align:' +align+ ';width:'+width+'px">' + this.options.columns[i].title + '<div></th>'
		}
		theadHtml += '</tr>'
		this.element.find('thead').html(theadHtml);
		this.element.append('<div class="grid-info" style="width:'+this.options.width+'" grid-belongs="' +elementId+ '"><a class="grid-info-status">' +this.options.loadingText+ '</a></div>');
		this.loadData();
	}
	//loadData
	Grid.prototype.loadData = function(){
		var $element = this.element;
		var options = this.options;

		//loading .....
		$element.find('.grid-info').empty().html('<a class="grid-info-status">' +options.loadingText+ '</a>');
		$.ajax({
			url : options.url,
			data: {
				page: options.page,
				size:options.pageSize,
				params:options.params
			},
			type:options.method,
			dataType:'json',
			async:true,
			success:function(data){
				var rows = data.rows;
				var tbodyHtml = '';
				for(var i = 0; i < rows.length; i ++){
					tbodyHtml += '<tr>';
					for(var j = 0; j < options.columns.length; j ++){
						tbodyHtml += '<td>' + getCellHtml(rows[i],options.columns[j]) + '</td>';
					}
					tbodyHtml += '</tr>';
				}
				$element.find('tbody').append(tbodyHtml);
				if(data.nextpage  < data.totalpage){
					$element.find('.grid-info').empty().html('<a class="grid-info-loadmore">' +options.loadMoreText+ '</a>');
				}else{
					$element.find('.grid-info').empty().html('<a class="grid-info-status">' +options.noMoreText+ '</a>');
				}
				options.page += 1;
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				console.log(XMLHttpRequest.status);
				console.log(XMLHttpRequest.readyState);
				console.log(textStatus);
				console.log(errorThrown.message);
				$element.find('.grid-info').empty().html('<a class="grid-info-loaderror">' +options.loadErrorText+ '</a>');
			}
		});
	}
	//current options
	Grid.prototype.getOptions = function(){
		return this.options;
	}
	//load more
	Grid.prototype.loadMore = function(){
		this.loadData();
	}
	//search  ==the tbody element should be empty at first
	Grid.prototype.search = function(args){
		this.empty();
		if(typeof args == 'object'){
			this.options.params = args;
		}
		this.options.page = 1;
		this.loadData();
	}
	//load more
	Grid.prototype.empty = function(){
		this.element.find('tbody').empty();
	}
	// formatter cell
	function getCellHtml(row,column){
		var innerHtml = '';
		if(column.field == 'ck' && column.checkbox == true){
			innerHtml = '<input type="checkbox" class="" value="' +row[column.ckvalue]+ '" />'
		}else if(typeof column['formatter'] == 'function'){
			innerHtml = column['formatter'](row[column.field],row);
		}else {
			innerHtml = row[column.field] == undefined ? '' : row[column.field];
		}

		var outerHtml = '';
		var width = 50;
		var align = 'left';
		if(column.align != undefined){
			align = column.align;
		}
		outerHtml = '<div style="text-align:' + align + '">'+innerHtml+'</div>';
		return outerHtml;
	}
	// GRID PLUGIN DEFINATION
	// ======================
	function Plugin(options,args){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data('pengb.grid');
			if(typeof options == "string"){
				if(!data){
					return ;
				}else{
					if(typeof data['options'] == 'function'){
						data['options'](args);
					}else{
						//no this function
					}
				}
			}

			if(!data){
				data = new Grid(this,options);
				$this.data('pengb.grid',data);
			}

		});
	}
	//old
	var old = $.fn.grid;

	$.fn.grid             = Plugin;
	$.fn.grid.Constructor = Grid;

	// Grid NO CONFLICT
	//====================
	$.fn.grid.noConflict = function(){
		$.fn.grid = old;
		return this;
	}
	// Grid DATA-API
	$(document).on('click','.grid-info-loadmore,.grid-info-loaderror',function(e){
		var $this = $(this);
		var $parent = $this.parent().parent();
		$parent.grid("loadMore");
	});

}(jQuery);
