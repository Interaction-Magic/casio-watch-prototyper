//
// Wrapper class for the whole designer
//

class Designer{

	// Default options are below
	_default_opts = {
		duration: 500,
	};

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};
	}

	//
	// Returns an array of data for the current display
	get_segment_sequence() {

	}
}
