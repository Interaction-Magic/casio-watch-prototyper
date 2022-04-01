//  ***********************************************
//  ***********************************************
//  Preferences
// 
//  Author: George Cave @ Interaction Magic
//  Date: April 2022
// 
//  ***********************************************
//  
//  xxx
// 
//  ***********************************************
// 
//  Usage:
// 
//  xxx
// 
//  Public methods:
// 
//  xxx
//
//  Public properties:
// 
//  xxx
// 
//  ***********************************************

class Preferences{

	// Default options are below
	_default_opts = {
		storage_name: "preferences",
		checked_class: "is-checked"
	};

	_default_preference_data = {
		name:	"default",
		checkbox_class: "toggle_default",
		default: false,
		set: (state) => {
			console.log(state);
		}
	};

	_preferences = [];

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};
		if(opts.preferences){
			for(let p of opts.preferences){
				this.create(p);
			}
			delete this.opts.preferences;
		}

	}

	create(preference){
		this._preferences.push(preference);

		preference.toggle_link.addEventListener("click", (e) => {
			e.preventDefault();

			preference.toggle_link.classList.toggle(this.opts.checked_class);
			this.set(preference.name);
		});
	}

	set(name, state){
		const p = this._preferences.find(item => item.name == name);

		if(!state){
			state = p.toggle_link.classList.contains(this.opts.checked_class);
		}
		p.set(state);
		p.toggle_link.classList.toggle(this.opts.checked_class, state);
		this.save();
	}
	
	save(){
		const preferences = this._preferences.map(
			item => ({
				name: item.name,
				state: item.toggle_link.classList.contains(this.opts.checked_class)
			})
		);
		localStorage.setItem(this.opts.storage_name, JSON.stringify(preferences));
	}

	load(){
	
		if(localStorage.getItem(this.opts.storage_name)){

			const saved_preferences = JSON.parse(localStorage.getItem(this.opts.storage_name));

			for(let p of this._preferences){
				let saved_state = saved_preferences.find(item => item.name == p.name);
				this.set(p.name, saved_state ? saved_state.state : p.default);
			}

		}else{
			// Defaults here
			for(let p of this._preferences){
				this.set(p.name, p.default);
			}
		}
	}


}
