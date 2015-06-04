/* global $ez, $state, $history, $loop */

var _ = {
  story: '',
  data: {},
  team: '',
  chapter: '',
  page: '',
};

_view = {};
_path = '/';

// website/read/all-you-need-is-kill/team/MTO/chapter/5/page/2

var _urlTask = $loop.urlChange.sub(function () {
  $history.add(null, "yoyo", window.location.origin + '/#'+ _path);
});

function change(key, value) {
  if (_[key] !== value && _[key] !== undefined) {
    _[key] = value;
    return true;
  }
  return false;
}

var $url = {
  setView: function (key, value) {
    var view = _routes[key];
    console.log(view, key);
    if (view && view !== _view) {
      _view = view;
      view.__set__(value);
      view.__apply__();
    }
    return $url;
  },
  init: function () {
    var args = window.location.hash.split('/').filter($ez.removeEmpty);
    var i = 2, key, view = _routes[args[0]];

    if (!view || view.__set__(args[1]) === false) {
      $history.goHome();
      return _;
    }

    _view = view;
    while (i < args.length) {
      key = args[i++];
      if (typeof view[key] !== "function") {
        break;
      }
      _[key] = args[i++];
    }
    view.__apply__();
    return _;
  },

  set: function (updateData) {
    var i = -1, key, hasChanged = false, updatedKeys = Object.keys(updateData);
    while (++i < updatedKeys.length) {
      key = updatedKeys[i];
      if (change(key, updateData[key])) {
        hasChanged = true;
      }
    }
    if (hasChanged) {
      _view.__apply__();
    }
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
      _path = "/story/" + _.story + '/';
      Object.keys(_routes.story).forEach(function (key) {
        if (/^__(.+)__$/.test(key)) { return; }
        _[key] = _routes.story[key](_[key]);
        _path += key +'/'+ _[key] +'/';
      });
      _urlTask.request();
    },
    team: function (val) {
      return "MTO";
    },
    chapter: function (val) {
      val = validateInt(val);
      if (val === false) {
        val = 0; // should try resume where the user last chapter read
      }
      return val;
    },
    page: function (val) {
      val = validateInt(val);
      if (val === false) {
        val = 0; // should try resume where the user last page read
      }
      return val;
    },
  }
}
