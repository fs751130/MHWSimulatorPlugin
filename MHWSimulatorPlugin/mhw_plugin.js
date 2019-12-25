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
	
	static remove_exclude(i, val) {
		this.exclude[i].splice(this.exclude[i].indexOf(val), 1);
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
	
	var weaponFlag, skillsFlag, skillsFlagNum;
	
	function setWeapon(skills) {
		weaponFlag = false;
		var val = setInterval(function(){
			if ($("#weapon").length!=0) {
				$("#weapon").children().each(function(i,l){
					if (skills.indexOf(l.innerText) != -1) {
						$("#weapon")[0].selectedIndex = i;
					}
				});
				$("#weapon2")[0].selectedIndex = 0;
				$("#weapon2").children().each(function(i,l){
					if (skills.indexOf(l.innerText) != -1 && skills.indexOf(l.innerText) != skills.indexOf(l.innerText + ")")) {
						$("#weapon2")[0].selectedIndex = i;
					}
				});			
				setTimeout(function(){
					$("#weapon")[0].dispatchEvent(new Event('change'));
					$("#weapon2")[0].dispatchEvent(new Event('change'));
					weaponFlag = true;
				},0);
				clearInterval(val);
			} else {
				$("#ui div:first div:first div:first div:nth-child(2) select").attr("id","weapon");
				$("#ui div:first div:first div:first div:nth-child(3) select").attr("id","weapon2");
			}
		}, 100);
	}
	
	function setSkills(skills) {
		skillsFlag = false;
		skillsFlagNum = 0;
		var val = setInterval(function(){
			if ($("#skilllistcontainer").length!=0) {
				$("#skilllistcontainer select").each(function(){
					var select = $(this);
					
					var skillpointname;
					select.children().each(function(i,l){
						if (!$(l).attr("value")) {
							skillpointname = l.innerText;							
						}
					});
					//var skillpointname = select.attr("skillpointname");
					
					var match = false;
					select.children().each(function(i,l){
						if (l.innerText != skillpointname) {
							if (skills.indexOf($(l).attr("value")) != -1) {
								match = true;
								select[0].selectedIndex = i;
								//select.addClass("skillselected");
								select.attr("style", "background-color: rgb(255, 255, 204);");
								skills = skills.replace($(l).attr("value"), "");
							}
						}
					});
					if (!match) {					
						select.children().each(function(i,l){
							if (l.innerText == skillpointname) {
								select[0].selectedIndex = i;				
							}
						});
						//select.removeClass("skillselected");
						select.attr("style", "");
					}
					setTimeout(function(){
						select[0].dispatchEvent(new Event('change'));
						skillsFlagNum++;
					},0);
				});
				skillsFlag = true;
				clearInterval(val);
			} else {
				$("#ui div:first div:first").children("div:nth-child(2)").attr("id","skilllistcontainer");
			}
		}, 100);
	}
	
	function searchButtonClick() {
		var val = setInterval(function(){
			if ($("#searchbutton").length!=0 && weaponFlag && skillsFlag && skillsFlagNum == $("#skilllistcontainer select").length) {
				$("#searchbutton")[0].click();
				$("#searchbutton")[0].scrollIntoView();
				clearInterval(val);
			} else {
				$("#ui button:first").attr("id","searchbutton");
			}
		}, 100);
	}

	function addButton() {
		localStorageController.reload();
		
		$("#mysetpane .skillnamerow").each(function(i,l){
			if ($(l).children().find("button").length == 0) {
				$(l).children().attr("colspan", 6);
				
				$(l).append("<td style=\"white-space: nowrap;\"><button>Search</button> <button>" + localStorageController.get_mySetName(i) + "</button></td>");
				$(l).find("button").first().click(function(event){
					event.stopPropagation();
					var skills = $(this).parent().prev()[0].innerText;
					
					$("#tab-search a")[0].click();
					setWeapon(skills);
					setSkills(skills);
					searchButtonClick();
				});
				$(l).find("button").last().click(i, function(event){
					event.stopPropagation();
					var newSetName = prompt("Please enter set name", $(this)[0].innerText) || $(this)[0].innerText;
					$(this)[0].innerText = newSetName;
					localStorageController.set_mySetName(event.data, newSetName);
					setTimeout(function(){$("#tab-search a")[0].click();},0);
					setTimeout(function(){$("#tab-myset a")[0].click();},0);
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
					setTimeout(function(){$("#tab-search a")[0].click();},0);
					setTimeout(function(){$("#tab-myset a")[0].click();},0);
				})
			});
		}		
	}
	
	//add id
	$($("#ui div .nav-tabs li")[0]).attr("id","tab-search");
	$($("#ui div .nav-tabs li")[1]).attr("id","tab-myset");
	$($("#ui div .nav-tabs li")[2]).attr("id","tab-excludeinclude");
	
	//
	$("#tab-myset").click(function() {
		$("#ui .table-responsive").attr("id","mysetpane");
		setTimeout(addButton, 0);
		setTimeout(addReorder, 0);
	});
	
	function removeExcludeItem() {		
		var part = parseInt($(this).attr("part"));
		var equip = $(this).attr("equip");
		var pp = this.parentNode.parentNode;
		pp.parentNode.removeChild(pp);
		localStorageController.remove_exclude(part, equip);
		localStorageController.save_exclude();
	}
	
	function addExcludeItem(index, EQUIP_NAME) {
		$.get(chrome.runtime.getURL("") + "exclude_div.html", function(data){
			var newData = data.replace(/EQUIP_NAME/g, EQUIP_NAME).replace("PART", index.toString());
			$($($("#excludeincludepane .includeexclude-section")[index]).find(".panel-body")[1]).append(newData);
			$($("#excludeincludepane .includeexclude-section")[index]).find("span").each(function(){
				if ($(this).attr("equip") == EQUIP_NAME) {
					$(this)[0].addEventListener("click",removeExcludeItem);
				}
			})
		});
	}
	
	function addExclude() {
		if ($("#excludeincludepane").length != 0) {
			if ($(".plugin_exclude").length != 6) {
				$("#excludeincludepane .includeexclude-section").each(function(i,l){
					if ($(l).find(".plugin_exclude").length)
						return;
						
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
						if ($(this)[0].selectedIndex != 0)
						{
							localStorageController.reload_exclude();
							var part = parseInt($(this).attr("part"));
							var equip = $(this).val();
							
							if ($.inArray(equip, localStorageController.get_exclude(part)) == -1)
							{
								addExcludeItem(part, equip);
								localStorageController.add_exclude(part, equip);
								localStorageController.save_exclude();
							}
							$(this)[0].selectedIndex = 0;
						}
					});
				});
			}
			// remove duplicate
			$("#excludeincludepane .includeexclude-section span").each(function(){
				if ($(this).attr("equip")) {
					var part = parseInt($(this).attr("part"));
					var equip = $(this).attr("equip");
					var hasDuplicate = false;
					$($("#excludeincludepane .includeexclude-section")[part]).find("span").each(function(){
						if (!$(this).attr("equip")) {						
							var innerText = this.parentNode.parentNode.innerText;
							if (innerText.replace($(this).attr("equip"),"").trim()) {
								hasDuplicate = true;
							}
						}						
					})
					if (hasDuplicate) {
						var pp = this.parentNode.parentNode;
						pp.parentNode.removeChild(pp);
					}						
				}
			})			
		} else {
			var div = $("#ui div:first div:first div:first");
			if (div.find(".includeexclude-section").length)
				div.attr("id","excludeincludepane");	
		}
	}	
	
	var addExcludeFlag = false;
	$("#tab-excludeinclude").click(function() {
		if (!addExcludeFlag)
		{
			var val = setInterval(function(){
				if ($(".plugin_exclude").length != 6)
					setTimeout(addExclude, 0);			
			}, 100);
			addExcludeFlag = true;
		}
	});	
})();