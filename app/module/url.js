/* global $ez, $state, $history */

var _ = {
  story: '',
  view: {},
  team: '',
  chapter: '',
  view: 'read',
  page: ''
};

// website/read/all-you-need-is-kill/team/MTO/chapter/5/page/2

function getTitle() {
  return _.view.title +" - Chapter "+ _.chapter +" Page "+ _.page;
}

function getUrl() {
  return [_.view, _.story, _.team, "chapter", _.chapter, "page", _.page].join('/');
}

function save() {
  if (_.view === 'read') {
    $history.add(_.view, getTitle(), getUrl());
  }
}

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
    switch (args[0]) {
      case 'read':
        _.story = args[1];
        args = args.slice(2);
        var i = 0;
        while (++i < args.length) {
          change(args[i-1], args[i]);
        }
      default: break; // view not found, rewrite to home
    }
    return _;
  },
  set: function (updatedKeys) {
    Object.keys(updatedKeys).forEach(function (key) {
      change(key, updatedKeys[key]);
    });
  }
};

