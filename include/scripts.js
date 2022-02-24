'use strict';

// When page loads
document.addEventListener("DOMContentLoaded", () => {

	// Copy over the segments array to a couple of places (to avoid having too heavy an HTML on load)
	const segments_source = document.querySelector(".segment_components").innerHTML;
	const copy_watch_display = (destination) => {
		destination.innerHTML = destination.innerHTML + segments_source;
	};
	copy_watch_display(document.querySelector(".live_watch"));
	copy_watch_display(document.querySelector(".segments"));
	
	// Create a new instance of the Designer 
	const designer = new Designer({
		sequences_container: document.querySelector(".sequences"), 
		live_watch : document.querySelector(".live_watch")
	});

	// Add click handlers to menu buttons
	document.querySelectorAll(".primary_nav a, .sequences_nav a").forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();

			// Get the hash, to work out what sort of switch it is
			const url_target = link.href;
			if(!url_target){
				return;
			}
			const hash = url_target.substring(url_target.indexOf('#') + 1);

			switch(hash){

				case "play":
					designer.play_pause();
					e.target.classList.toggle("is_playing");
					break;
				
				case "undo":
					designer.history_undo();
					break;
				
				case "undoundo":
					designer.history_undoundo();
					break;

				case "add_sequence":
					designer.add_sequence();
					designer.history_save();
					break;

				case "import":
					upload_file();
					break;

				case "export":
					download_file();
					break;
			}
			
			link.blur();
		});
	});

	// Receive input file from upload
	let upload_file = () => {
		const helper_link = document.createElement('input');
		helper_link.type = "file";
		helper_link.accept = "text/plain";
		helper_link.addEventListener("change", (e) => {

			if(e.target.files[0]){
				console.log(e.target.files[0]);
				let reader = new FileReader();
				reader.readAsText(e.target.files[0]);

				reader.onload = function() {
					designer.put_state(JSON.parse(reader.result));
					alert(`Imported: ${e.target.files[0].name}`);
					designer.history_save();
				};
				
				reader.onerror = function() {
					alert("Error importing file");
				};
			}


		});
		helper_link.click();
	}
	
	// Generate downloadable text file of data
	let download_file = () => {

		let data = JSON.stringify(designer.get_state());
	
		// Trigger download
		const helper_link = document.createElement('a');
		helper_link.href = `data:text/plain;charset=utf-8,${encodeURI(data)}`;
		helper_link.target = '_blank';
		helper_link.download = `sensor_watch_ui_${Math.round(Date.now()/1000)}.txt`;
		helper_link.click();
	}
	
});


