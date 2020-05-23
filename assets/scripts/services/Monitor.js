// As seen at https://github.com/NathanBurkett/EventsMonitor but very seriously modified

class Monitor {
	constructor() {
		this.events = [];
	}

	add(obj) {
		this.loopProperties(prop => {
			if (!obj.hasOwnProperty(prop)) {
				throw new Error('Event object needs ' + prop + ' property');
			}
		});
		if(this.find(obj, false)) {
			this.remove(obj.el, obj.event);
		}
		obj.el.addEventListener(obj.event, obj.fn, true);
		this.events.push(obj);
		return this;
	}

	remove(el, type, index = undefined) {
		if (!index) {
			index = this.find({
				el: el,
				event: type,
			}, true);
		}
		if (index) {
			const d = this.events[index];
			d.el.removeEventListener(d.event, d.fn, false);
			this.events.splice(index, 1);
			return true;
		}
		return false;
	}

	removeAll() {
		let blacklist = [window, Worker, G.worker];
		this.events.filter(ev => !blacklist.includes(ev.el)).forEach((ev, index) => {
			ev.el.removeEventListener(ev.event, ev.fn, false);
		});
		this.events.length = 0;
		return true;
	}

	each(fn) {
		this.events.map(fn);
		return this;
	}

	find(eventObj, returnIndex = false) {
		let match;
		this.each((item, index) => {
			if (eventObj.el === item.el && eventObj.event === item.event) {
				match = returnIndex ? index : item;
			}
		});
		return match;
	}

	loopProperties(fn) {
		['el', 'event', 'fn'].forEach(fn);
		return this;
	}
}

export default Monitor;
