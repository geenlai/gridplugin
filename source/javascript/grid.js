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
		height:'auto',
		loadingText:'loading'
	};
	//INIT 
	Grid.prototype.init = function(){
		if(this.options.url == undefined || this.options.url == null){
			return ;
		}
		if(this.options.columns == undefined || this.options.columns == null 
			|| Object.prototype.toString.call(this.options.columns) !== "[object Array]"){
			console.log('columns undefined');
			return ;
		}
		//header
		var theadHtml = '<tr>'
		for(var i = 0; i < this.options.columns.length; i ++){
			theadHtml += '<th>' + this.options.columns[i].title + '</th>'
		}
		theadHtml += '</tr>'
		this.element.html('<table><thead>' +theadHtml+ '</thead><tbody></tbody></table>');
		this.element.append('<div class="grid-status" style="cursor:pointer;width:100px;background:#ccc">' +this.options.loadingText+ '</div>');
		this.loadData();
	}
	//loadData
	Grid.prototype.loadData = function(){
		var $element = this.element;
		var options = this.options;
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
				this.element.find('tbody').append(tbodyHtml);
				if(data.nextpage  < totalpage){
					$element.find('.grid-status').empty().html('loadmore');
				}else{
					$element.find('.grid-status').empty().html('no more');
				}
			},
			error:function(){
				console.log("something wrong...");
				var data = {
					nextpage : 2,
					totalpage: 4,
					rows:[
						{
							name:"pengbo",email:"pengbowo@126.com"
						},
						{
							name:"pengbo1",email:"pengbowo@126.com1"
						},
						{
							name:"pengbo2",email:"pengbowo@126.com12"
						}
					]
				}
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
					options.page = options.page + 1;
					$element.find('.grid-status').empty().html('loadmore');
				}else{
					$element.find('.grid-status').empty().html('no more');
				}
			}
		});
	}
	//current options
	Grid.prototype.getOptions = function(){
		return this.options;
	}
	//load more
	Grid.prototype.loadMore = function(){
		console.log("load more .................");
	}
	//search  ==the tbody element should be empty at first
	Grid.prototype.search = function(){
		this.empty();
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
			innerHtml = row[column.field];
		}

		var outerHtml = '';
		var width = 50;
		var align = 'left';
		if(column.width != undefined && /^\d+$/.test(column.width)){
			width = column.width;
		}
		if(column.align != undefined){
			align = column.align;
		}
		outerHtml = '<div style="width:'+width+'px;text-align:' + align + '">'+innerHtml+'</div>';
		return outerHtml;
	}
	// GRID PLUGIN DEFINATION
	// ======================
	function Plugin(options){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data('pengb.grid');

			if(!data){
				data = new Grid(this,options);
				$this.data('pengb.grid',data);
			}
			if(typeof options == 'string'){
				data[options]();
			}
		});
	}

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
	$(document).on('click','.grid-status',function(e){
		var $this = $(this);
		var $parent = $this.parent();
		$parent.grid("loadMore");
	});

}(jQuery);