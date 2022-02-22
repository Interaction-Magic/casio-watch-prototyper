//
// Simple logger class to add formatted messages to a box
//

class Logger{

	panel;

	_default_opts = {
		container: null
	};

	_default_msg_opts = {
	};

	constructor(opts){
		this.opts = {...this._default_opts, ...opts};
		this.opts.log_panel = this.opts.container.querySelector(".log");

		// Add toggles for filters
		this.opts.container.querySelectorAll(".filter-btn").forEach(btn => {
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				if(btn.dataset.filter){
					this.opts.container.classList.toggle(`filter-${btn.dataset.filter}`);
				}
			});
		});
	}


	// Add new message
	// Pass a colour to quickly style the whole message
	// Or pass in msg text already styled
	log(msg, opts){

		// Merge opts with defaults
		opts = {...this._default_msg_opts, ...opts};

		// Generate new message
		const time = new Date();
		const new_msg = document.createElement('p');

		// Which char to show as
		const char = opts.char ?? this.opts.char ?? '>';

		new_msg.innerHTML = `
			<span class="time" title="${time.toTimeString()}">${time.toTimeString().substr(0,8)}</span>
			<span class="direction direction_${char}">${char}</span>
			<span class="msg" style="${(opts.colour) ? 'color:'+opts.colour : ''}" title="${opts.hover ?? ''}">${msg}</span>`;

		// Set class of the <p>
		if(opts.class)	new_msg.classList.add(opts.class);

		// Add data properties to the log entry
		for(const d in opts.data){
			new_msg.dataset[d] = opts.data[d];
		}

		// See if we are already at the bottom, better for UI if user is looking at something higher up
		const will_scroll = this._is_scrolled_bottom();
	
		// Add message
		this.opts.log_panel.append(new_msg);

		// Scroll to bottom
		if(will_scroll){
			this._scroll_to_bottom();
		}

		return new_msg;
	}

	_is_scrolled_bottom(){
		// 50 = small scroll buffer
		return (this.opts.log_panel.offsetHeight + this.opts.log_panel.scrollTop >= (this.opts.log_panel.scrollHeight-50));
	}

	_scroll_to_bottom(){
		// Scroll to bottom
		this.opts.log_panel.scrollTop = this.opts.log_panel.scrollHeight;
	}

	show_errors(){
		this.opts.log_panel.classList.add("show_errors");
	}
	hide_errors(){
		this.opts.log_panel.classList.remove("show_errors");
	}
	show_pings(){
		this.opts.log_panel.classList.add("show_pings");
	}
	hide_pings(){
		this.opts.log_panel.classList.remove("show_pings");
	}
}