/****************************************************************
 *
 *right click memu
 *
 *
 ****************************************************************/
+function($){
	'use strict';
	// MENU PLUGIN DEFINATION
	// ======================
	function Plugin(selector,options){
		//set right click disable
		$(document).on('contextmenu',this,function(e){
			return false; 
		});
		$(document).off('mousedown').on('mousedown', function(){
		   	$('.menu').hide();
  		});

  		$('.menu').off('mousedown').on('mousedown',function(e){
  			e.stopPropagation();
  		});
  		$('.menu').off('mouseleave').on('mouseleave',function(e){
  			$('.menu').hide();
  		});
		$(document).on('mousedown',selector,function(e){
			var $this = $(this);
			//点击事件参数
			if(e.which == 3){
				//计算显示位置
				var x = e.clientX + $(this).scrollLeft();
				var y = e.clientY + $(this).scrollTop();
				$(".menu").css({'top':y,'left':x});
				$(".menu").show();
				//构造菜单
				$('.menu-list').empty();
				for(var i = 0; i< options.length; i ++){
					var disabled = "";
					if(options[i].disabled){
						disabled="disabled";
					}
					var menuItem = '<li class="menu-item '+disabled+'">'+options[i].name+'</li>';
					$(menuItem).data({"fn":options[i].fn}).appendTo('.menu-list');
				}
				$(".menu-item").on("mousedown",function(event){
						if($(this).hasClass("disabled"))return ;
						var fn = $(this).data("fn");
						fn.call(window,$(this),$this);
				})
				e.stopPropagation();
			}
		});
	}

	var old = $.fn.menu;

	$.fn.menu             = Plugin;

	// MENU NO CONFLICT
	//====================
	$.fn.menu.noConflict = function(){
		$.fn.menu = old;
		return this;
	}
}(jQuery);