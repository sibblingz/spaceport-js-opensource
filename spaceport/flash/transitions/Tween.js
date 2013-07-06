define('flash/transitions/Tween', [
	'util/builtin/isNaN',
	'util/as3/inherit',
	'flash/events/Event',
	'flash/events/EventDispatcher',
	'util/broadcast/addListener',
	'flash/utils/Timer',
	'flash/events/TimerEvent',
	'flash/transitions/easing/Linear',
	'flash/transitions/TweenEvent',
	'shared/default',
	'util/numberDefault',
	'shared/defineGetter',
	'shared/defineSetter'
], function(
	isNaN,
	__inherit,
	Event,
	EventDispatcher,
	addBroadcastListener,
	Timer,
	TimerEvent,
	Linear,
	TweenEvent,
	__default,
	__number_default,
	defineGetter,
	defineSetter
) {
	var enterFrameTweens = [];
	addBroadcastListener(Event.ENTER_FRAME, {
		dispatchEvent: function globalTweenHandler() {
			enterFrameTweens.forEach(function(tweenNextFrame) {
				tweenNextFrame();
			});
		}
	});
	
	// ----------------------
	
	function fixTime(self) {
		if(self.useSeconds)
			self._startTime = Date.now() - self.time * 1000;
	}
	
	function dispatchEvent(type, from) {
		from.dispatchEvent(new TweenEvent(type, from.time, from.position));
	}
	
	function getPosition(self) {
		return self.func(self.time, self.begin, self.finish - self.begin, self.duration);
	}
	
	function setPosition(self, position) {
		if(self.prop.length)
			self.obj[self.prop] = position;
		
		dispatchEvent(TweenEvent.MOTION_CHANGE, self);
	}
	
	function update(self) {
		setPosition(self, getPosition(self));
	}
	
	function startEnterFrame(self) {
		if(self.isPlaying)
			stopEnterFrame(self);
		
		if(isNaN(self.FPS)) {
			enterFrameTweens.push(self.nextFrame);
		} else {
			var milliseconds = 1000 / self.FPS;
			self._timer.delay = milliseconds;
			self._timer.addEventListener(TimerEvent.TIMER, self.nextFrame);
			self._timer.start();
		}

		self.isPlaying = true;
	}
	
	function stopEnterFrame(self) {
		if(isNaN(self.FPS)) {
			var index = enterFrameTweens.indexOf(self.nextFrame);
			if(index !== -1)
				enterFrameTweens.splice(index, 1);
		} else {
			self._timer.stop();
			self._timer.removeEventListener(TimerEvent.TIMER, self.nextFrame);
		}

		self.isPlaying = false;
	}
	
	function Tween(obj, prop, func, begin, finish, duration, useSeconds) {
		EventDispatcher.apply(this);

		this._timer = new Timer(100);
		
		this.func = Linear.easeIn;
		if(typeof func === 'function')
			this.func = func;
		
		this.obj = obj;
		this.prop = prop;
		this.begin = begin;
		this.duration = duration;
		this.useSeconds = __default(useSeconds, false);
		this.finish = finish;
		
		var time = 0;
		defineGetter(this, 'time', function get_time() {
			return time;
		});
		defineSetter(this, 'time', function set_time(t) {
			if(t > this.duration) {
				if(this.looping) {
					this.rewind(t - this.duration);
					update(this);
					dispatchEvent(TweenEvent.MOTION_LOOP, this);
				} else {
					if(this.useSeconds) {
						time = this.duration;
						update(this);
					}
					
					this.stop();
					dispatchEvent(TweenEvent.MOTION_FINISH, this);
				}
			} else if(t < 0) {
				this.rewind();
				update(this);
			} else {
				time = t;
				update(this);
			}
		});
		
		var fps = NaN;
		defineGetter(this, 'FPS', function get_FPS() {
			return fps;
		});
		defineSetter(this, 'FPS', function set_FPS(f) {
			var oldIsPlaying = this.isPlaying;
			stopEnterFrame(this);
			
			fps = f;
			if(oldIsPlaying)
				startEnterFrame(this);
		});
		
		this.nextFrame = this.nextFrame.bind(this);
		this.rewind = function rewind(t) {
			time = __number_default(t, 0);
			fixTime(this);
			update(this); 
		};
		
		this.start();
	}
	
	return __inherit(Tween, EventDispatcher, {
		get position() {
			return getPosition(this);
		},
		set position(p) {
			setPosition(this, p);
		},
		continueTo: function continueTo(finish, duration) {
			this.begin = this.position;
			this.finish = finish;
			if(!isNaN(duration))
				this.duration = duration;
			
			this.start();
		},
		'yoyo': function yoyo() {
			this.continueTo(this.begin, this.time);
		},
		'start': function start() {
			this.rewind();
			startEnterFrame(this);
			
			dispatchEvent(TweenEvent.MOTION_START, this);
		},
		'stop': function stop() {
			stopEnterFrame(this);
			
			dispatchEvent(TweenEvent.MOTION_STOP, this);
		},
		'resume': function resume() {
			fixTime(this);
			
			startEnterFrame(this);
			dispatchEvent(TweenEvent.MOTION_RESUME, this);
		},
		'fforward': function fforward() {
			this.time = this.duration;
			
			fixTime(this);
		},
		'nextFrame': function nextFrame() {
			if(this.useSeconds)
				this.time = (Date.now() - this._startTime) / 1000;
			else
				this.time += 1;
		},
		'prevFrame': function prevFrame() {
			if(!this.useSeconds)
				this.time -= 1;
		}
	});
});
