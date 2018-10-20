var hl = new URL(window.location.href).searchParams.get("hl") || "";
if(hl) hl+="-";

class localStorageController {
	static reload() {
		this.myset = JSON.parse(window.localStorage.getItem(hl + "myset"));
	}
	
	static reload_exclude() {
		this.exclude = JSON.parse(window.localStorage.getItem(hl + "exclude")) || [[],[],[],[],[],[]];
	}
	
	static save() {
		localStorage.setItem(hl + "myset", this.toUnicode(JSON.stringify(this.myset)));
	}
	
	static save_exclude() {
		localStorage.setItem(hl + "exclude", this.toUnicode(JSON.stringify(this.exclude)));
	}
	
	static get_mySetName(i) {
		return this.myset[i].mySetName || "Set Name";
	}
	
	static set_mySetName(i, newSetName) {
		this.myset[i].mySetName = newSetName;
		this.save();
	}
	
	static get_exclude(i) {
		return this.exclude[i];
	}
	
	static add_exclude(i, val) {
		this.exclude[i].push(val);
	}
	
	static get_legnth() {
		if (!this.myset)
			return 0;
		return this.myset.length;
	}
	
	static saveNewOrder(newOrder) {
		var temp = [];
		for (var i=0 ; i<newOrder.length ; i++) {
			temp.push(this.myset[newOrder[i]]);
		}
		this.myset = temp;
		this.save();
	}
	
	static toUnicode(str) {
		return str.split('').map(function (value, index, array) {
			var temp = value.charCodeAt(0).toString(16);
			if (temp.length > 2) {
				return '\\u' + temp.padStart(4, '0');
			}
			return value;
		}).join('');
	}
}

(function() {
	
	function setWeapon(skills) {
		$("#weapon").children().each(function(i,l){
			if (skills.indexOf(l.innerText) != -1) {
				$("#weapon")[0].selectedIndex = i;
			}
		});
	}
	
	function setSkills(skills) {
		$("#skilllistcontainer select").each(function(){
			var select = $(this);
			var skillpointname = select.attr("skillpointname");
			
			var match = false;
			select.children().each(function(i,l){
				if (l.innerText != skillpointname) {
					if (skills.indexOf(l.innerText) != -1) {
						match = true;
						select[0].selectedIndex = i;
						select.addClass("skillselected");
						skills = skills.replace(l.innerText, "");
					}
				}
			});
			if (!match) {
				select[0].selectedIndex = 1;
				select.removeClass("skillselected");
			}
		});
	}

	function addButton() {
		localStorageController.reload();
		
		$("#mysetpane .skillnamerow").each(function(i,l){
			if ($(l).children().attr("colspan") == 7) {
				$(l).children().attr("colspan", 6);
				
				$(l).append("<td style=\"white-space: nowrap;\"><button>Search</button> <button>" + localStorageController.get_mySetName(i) + "</button></td>");
				$(l).find("button").first().click(function(event){
					event.stopPropagation();
					var skills = $(this).parent().prev()[0].innerText;
					
					setWeapon(skills);
					setSkills(skills);
					$("#tab-search a")[0].click();
					$("#searchbutton")[0].click();
				});
				$(l).find("button").last().click(i, function(event){
					event.stopPropagation();
					var newSetName = prompt("Please enter set name", $(this)[0].innerText) || $(this)[0].innerText;
					$(this)[0].innerText = newSetName;
					localStorageController.set_mySetName(event.data, newSetName);
					$("#tab-myset a")[0].click();
				});
			}
		});
	}
	
	function addSortable() {
		// Sortable rows
		var oldIndex;
		$('.sorted_table').sortable({
		  containerSelector: 'table',
		  itemPath: '> tbody',
		  itemSelector: 'tr',
		  placeholder: '<tr class="placeholder"/>'
		});
	}
	
	function addTBody() {
		for(var i=0 ; i<localStorageController.get_legnth() ; i++) {
			$("#sorted_table tbody").append("<tr><td index=" + i + ">" + localStorageController.get_mySetName(i) + "</td></tr>");
		}
	}
	
	function saveNewOrder() {
		var newOrder = $("#sorted_table tbody td").map(function() {return parseInt($(this).attr("index"))});
		localStorageController.saveNewOrder(newOrder);
	}
	
	function addReorder() {
		if (!$("#myModal").length) {
			$.get(chrome.runtime.getURL("") + "reorder_modal.html", function(data){
				$("#mysetpane").append(data);
				addTBody();
				addSortable();
				$('#myModal').on('hidden.bs.modal', function (e) {
					saveNewOrder();
					$("#tab-myset a")[0].click();
				})
			});
		}		
	}
	
	$("#tab-myset").click(function() {
		setTimeout(addButton, 0);
		setTimeout(addReorder, 0);
	});
	
	function addExcludeItem(index, EQUIP_NAME) {
		$.get(chrome.runtime.getURL("") + "exclude_div.html", function(data){
			var newData = data.replace(/EQUIP_NAME/g, EQUIP_NAME).replace("PART", index.toString());
			$($($("#excludeincludepane .includeexclude-section")[index]).find(".panel-body")[1]).append(newData);
		});
	}
	
	function addExclude() {
		if (!$(".plugin_exclude").length) {
			$("#excludeincludepane .includeexclude-section").each(function(i,l){
				//add select
				$($(l).find(".panel-body")[1]).prepend("<select style=\"margin-left: 14px\" part=\"" + i + "\" class=\"pin-select plugin_exclude\"></select>");
				var excludeSelect = $($($(l).find(".panel-body")[1])).find("select");
				
				//copy select item
				$($($("#excludeincludepane .includeexclude-section")[i]).find("select")[0]).find("option").each(function(j,m){
					excludeSelect.append(m.outerHTML);
				})
				excludeSelect[0].selectedIndex = 0;
				
				//add change event
				excludeSelect.change(function(){					
					if ($(this)[0].selectedIndex != 0 && $(this)[0].selectedIndex != $(this).find("option").length-1)
					{
						localStorageController.reload_exclude();
						var part = parseInt($(this).attr("part"));
						var val = $(this).val();
						
						if ($.inArray(val, localStorageController.get_exclude(part)) == -1)
						{
							addExcludeItem(part, val);
							localStorageController.add_exclude(part, val);
							localStorageController.save_exclude();
						}
						$(this)[0].selectedIndex = 0;
					}
				});
			});
		}
	}
	
	$("#excludeincludepane").bind("DOMSubtreeModified",function(){
		setTimeout(addExclude, 0);
	});
	
})();
