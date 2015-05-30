/* global $ez, $state, $history */

var _ = {
  story: '',
  data: {},
  team: '',
  chapter: '',
  view: '',
  page: ''
};

// website/read/all-you-need-is-kill/team/MTO/chapter/5/page/2

function change(key, value) {
  if (_[key] !== value && _[key] !== undefined) {
    _[key] = value;
    $state.requestURLUpdate();
    return true;
  }
  return false;
}

var $url = {
  init: function () {
    var args = window.location.pathname.split('/').filter($ez.removeEmpty);
    var i = 2, arg, val, route = _routes[args[0]];

    if (!route || route.__set__(args[1]) === false) {
      $history.goHome();
      return _;
    }

    while (i < args.length) {
      arg = route[args[i]];
      if (typeof arg !== "function") {
        break;
      }
      route[args[i]] = arg.bind({val: args[i + 1]});
      i += 2;
    }
    route.__apply__();
    return _;
  },
  set: function (updatedKeys) {
    Object.keys(updatedKeys).forEach(function (key) {
      change(key, updatedKeys[key]);
    });
  }
};

function validateInt(val) {
  var v = parseInt(val);
  if (isNaN(v)) {
    return false;
  }
  return v;
}

var _routes = {
  story: {
    __set__: function (val) {
      // should check if val is existing story
      if (!val) { return false; }
      _.story = val;
    },
    __apply__: function () {
      var path = "/story/" + _.story + '/';
      Object.keys(_routes.story).forEach(function (key) {
        if (/^__(.+)__$/.test(key)) { return; }
        var val;
        val = _routes.story[key]();
        _[key] = val;
        path += key +'/'+ val +'/';
      });
      $history.set(null, "getTitle()", path);
    },
    team: function () {
      return "MTO";
    },
    chapter: function () {
      this.val = validateInt(this.val);
      if (this.val === false) {
        this.val = "last";
      }
      return this.val;
    },
    page: function () {
      this.val = validateInt(this.val);
      if (this.val === false) {
        this.val = 0;
      }
      return this.val;
    },
  }
}
