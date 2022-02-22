//
// Single animation step
//

class Animation_Step{

	// Default options are below
	_default_opts = {
		duration: 500,
		index: 0
	};

	_hover_drag = {
		is_active: false,
		setting_option: false
	};

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new animation container in UI 
		this.elm = document.querySelector(".animation_step_prototype").cloneNode(true);
		this.elm.classList.remove("animation_step_prototype");
		this.elm.querySelector(".number").innerText = `#${this.opts.index}`;
		this.elm.querySelector(".duration").innerText = `${this.opts.duration}`;

		// Set handlers for toggling segments on and off
		this.elm.querySelector(".watch_face").addEventListener("mousedown", (e) => {
			e.preventDefault();
			this._hover_drag.is_active = true;
			this._hover_drag.setting_option = "toggle";
		});

		this.elm.querySelectorAll(".lcd_segment").forEach((segment) => {
			segment.addEventListener("mousedown", (e) => {
				e.preventDefault();
				e.stopPropagation();

				this._hover_drag.is_active = true;

				e.target.classList.toggle("on");
				e.target.classList.remove("hover");
				this._hover_drag.setting_option = e.target.classList.contains("on");
			});
			segment.addEventListener("mouseenter", (e) => {
				e.preventDefault();
				if(this._hover_drag.is_active){
					if(this._hover_drag.setting_option == "toggle"){
						e.target.classList.toggle("on");
					}else{
						e.target.classList.toggle("on", this._hover_drag.setting_option);
					}
				}else{
					e.target.classList.add("hover");
				}
			})
			segment.addEventListener("mouseleave", (e) => {
				e.preventDefault();
				e.target.classList.remove("hover");
			});
		});
		document.addEventListener("mouseup", (e) => {
			this._hover_drag.is_active = false;
		});
	}

	//
	// Returns the DOM contents for this step
	get_dom(){
		return this.elm;
	}
}