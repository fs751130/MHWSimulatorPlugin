var hl = new URL(window.location.href).searchParams.get("hl") || "";
if(hl) hl+="-";

class localStorageController {
	static reload() {
		this.myset = JSON.parse(window.localStorage.getItem(hl + "myset"));
	}
	
	static save() {
		localStorage.setItem(hl + "myset", this.toUnicode(JSON.stringify(this.myset)));
	}
	
	static get_mySetName(i) {
		return this.myset[i].mySetName || "Set Name";
	}
	
	static set_mySetName(i, newSetName) {
		this.myset[i].mySetName = newSetName;
		this.save();
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
})();
