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
	document.querySelector(".play").addEventListener("click", (e) => {
		e.preventDefault();
		designer.play_pause();
		e.target.classList.toggle("is_playing");
		e.target.blur();
	});
	document.querySelector(".undo").addEventListener("click", (e) => {
		e.preventDefault();
		designer.history_undo();
		e.target.blur();
	});
	document.querySelector(".undoundo").addEventListener("click", (e) => {
		e.preventDefault();
		designer.history_undoundo();
		e.target.blur();
	});

	// Add click handlers to sequences menu button
	document.querySelector(".add_sequence").addEventListener("click", (e) => {
		e.preventDefault();
		designer.add_sequence();
		designer.history_save();
		e.target.blur();
	});
	document.querySelector(".export").addEventListener("click", (e) => {
		e.preventDefault();
		download_file();
		e.target.blur();
	});


	
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


