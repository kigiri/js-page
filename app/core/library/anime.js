/* skip */

// Constructor
function Animate(el, animations, transition) {
  var keys = Object.keys(animations);
  transition = _transitions[transition] || _transitions.default;

  this.el = el;
  this.animations = animations;
  this.animationKeys = keys;
  this.style = this.el.style;
  this.transitionProperty = keys.join(', ');
  this.keyCount = keys.length;
  this.isPlaying = false;
  this.state = false;

  this.style.transitionDelay = transition.delay;
  this.style.transitionDuration = transition.duration;
  this.style.transitionTimingFunction = transition.timingFunction;
  this.disable();
}

// Private variables
var _transitions = {
  "default": {
    timingFunction: 'ease',
    duration: '200ms',
    delay: '0ms'
  }
};

// Private methods
function _cleanup(event) {
  this.disable();
  this.el.removeEventListener('transitionend', _cleanup);
  this.isPlaying = false;

  if (this.callback instanceof Function) {
    this.callback.call(this, event);
  }
}

function _set(arg, curr) {
  if (typeof arg !== 'string') { return arg + 0 + curr; }
  return arg;
}

// Public methods
Animate.prototype.play = function () {
  if (!this.isPlaying) {
    this.isPlaying = true;
    this.el.addEventListener('transitionend', _cleanup.bind(this));
    requestAnimationFrame(function () {
      if (this.state) {
        this.restore();
      } else {
        this.apply();
      }
      this.enable();
    }.bind(this));
  }
  return this;
};

Animate.prototype.enable = function () {
  this.style.transitionProperty = this.transitionProperty;
  return this;
};

Animate.prototype.disable = function () {
  this.style.transitionProperty = 'none';
  return this;
};

Animate.prototype.apply = function (force) {
  var i = -1;
  while (++i < this.keyCount) {
    this.style[this.animationKeys[i]] = this.animations[this.animationKeys[i]];
  }
  this.state = true;
  if (force) {
    this.el.getBoundingClientRect();
  }
  return this;
};

Animate.prototype.restore = function (force) {
  var i = -1;
  while (++i < this.keyCount) {
    this.style[this.animationKeys[i]] = '';
  }
  this.state = false;
  if (force) {
    this.el.getBoundingClientRect();
  }
  return this;
};

Animate.prototype.then = function (callback) {
  this.callback = callback;
  return this;
};

function anime(el, animations, transition) {
  return new Animate(el, animations, transition);
}

anime.nameTransition = function (name, transition) {
  _transitions[name] = {
    duration: transition.duration !== undefined
            ? _set(transition.duration, 'ms')
            : _transitions.default.duration,
    timingFunction: transition.timingFunction !== undefined
          ? transition.timingFunction
          : _transitions.default.timingFunction,
    delay: transition.delay !== undefined
         ? _set(transition.delay, 'ms')
         : _transitions.default.delay
  };
};

// ┌     ┐ 
// │ a b │
// │ c d │
// └     ┘
anime.matrix = function (elem, a, b, c, d, tx, ty, transitionName) {
  return new Animate(elem, {
    transform: 'matrix('+ a +', '+ c +', '+ b +', '+ d +', '+ tx +', '+ ty +')'
  }, transitionName);
};

anime.opacity = function (elem, value, transitionName) {
  return new Animate(elem, {
    opacity: Math.max(value > 1 ? Math.min(value / 100, 1) : value, 0),
  }, transitionName);
};

anime.rotate = function (elem, angle, transitionName) {
  return new Animate(elem, {
    transform: 'rotate('+ angle +')'
  }, transitionName);
};

anime.perspective = function (elem, perspective, angle, transitionName) {
  return new Animate(elem, {
    transform: 'perspective('+ perspective +') '+ 'rotate('+ angle +')'
  }, transitionName);
};

anime.scale = function (elem, x, y, transitionName) {
  return new Animate(elem, {
    transform: 'scale('+ x +', '+ y +')'
  }, transitionName);
};

anime.translate = function (elem, x, y, transitionName) {
  return new Animate(elem, {
    transform: 'translate('+ _set(x, 'px') +', '+ _set(y, 'px') +')'
  }, transitionName);
};

/* exemples :

anime.nameTransition('funky', {
  duration: '500ms',
  timingFunction: 'cubic-bezier(1, 0, 0.5, 1)',
  delay: '0ms'
});

anime.nameTransition('bulky', {
  duration: '100ms',
  timingFunction: 'cubic-bezier(0, 1, 1, 0.5)',
  delay: '50ms'
});

var enen = anime.translate(document.getElementById('links-right'), 200, 0, "funky");

**/
/** cheap
 * perspective
 * perspective-origin
 * transform
 * transform-style
 * opacity
 * 
 ** decent
 * backface-visibility
 * background-attachment
 * background-blend-mode
 * background-clip
 * background-color
 * background-image
 * background-origin
 * background-position
 * background-repeat
 * background-size
 * border-bottom-color
 * border-bottom-left-radius
 * border-bottom-right-radius
 * border-bottom-style
 * border-image-outset
 * border-image-repeat
 * border-image-slice
 * border-image-source
 * border-image-width
 * border-left-color
 * border-left-style
 * border-right-color
 * border-right-style
 * border-top-color
 * border-top-left-radius
 * border-top-right-radius
 * border-top-style
 * box-shadow
 * clip
 * color
 * opacity
 * outline-offset
 * text-shadow
 * transform-origin
 * z-index
 *
**/

