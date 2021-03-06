/* global $config */

var _langArray = [ "en", "fr" ],
    _selectedLang = 1;

var textData = {
  NO_DESCRIPTION: [ "No description found.", "Aucune description disponible." ],
  START: ["start", "début"],
  END: ["end", "fin"],
  FORM_CONFIG_BACKGROUND_NAME: [ "Background", "Fond" ],
  FORM_CONFIG_BACKGROUND_DESC: [
    "Background page filling color",
    "Couleur de remplissage du fond des pages"
  ],
  FORM_CONFIG_READINGMODE_NAME: ["Reading mode", "Mode de lecture" ],
  FORM_CONFIG_READINGMODE_DESC: [
    "Change the page layout",
    "Change la disposition des pages"
  ],
  FORM_CONFIG_READINGMODE_OPTS_STRIP: ["Vertical strip", "Bande verticale"],
  FORM_CONFIG_READINGMODE_OPTS_SINGLE: ["Single page", "Page par page"],
  FORM_CONFIG_READINGMODE_OPTS_DOUBLE: ["Double page", "Pages double"],
  FORM_CONFIG_LANG_NAME: ["Language", "Langue" ],
  FORM_CONFIG_LANG_DESC: [
    "Change the text laguage",
    "Change la langue du texte"
  ],
  FORM_CONFIG_LANG_OPTS_EN: ["English", "Anglais"],
  FORM_CONFIG_LANG_OPTS_FR: ["French", "Français"],
  FORM_CONFIG_PAGEBUFFER_NAME: ["Pre-loaded page count", "Nombre de pages pré-chargée"],
  FORM_CONFIG_PAGEBUFFER_DESC: ["Higher number use bandwidth greedly", "Une grande valeur peu s'avéré gourmand en bande passante"],
  FORM_CONFIG_INVERTPAGEORDER_NAME: ["Inverted pages", "Pages inversé"],
  FORM_CONFIG_INVERTPAGEORDER_DESC: ["Inverse pages order (manga mode)", "Inverse l'ordre des pages (mode manga)"],
  FORM_CONFIG_FIT_NAME: ["Fit pages", "Pages adaptées"],
  FORM_CONFIG_FIT_DESC: ["Fit pages to the window size", "Adapte la taille des pages à celle de la fênetre"],
  // FORM_CONFIG__NAME: ["", ""],
  // FORM_CONFIG__DESC: ["", ""],
};

function $i18n(key) {
  return textData[key][_selectedLang];
}

$i18n.init = function (loop) {
  var translateTask = loop.get("translate").sub(function () {
    var i = -1, text;
    while (++i < _watchedTextNodes.length) {
      text = _watchedTextNodes[i];
      text.node[text.nodekey] = $i18n(text.datakey);
    }
  });

  $i18n.set = function (languageKey) {
    _selectedLang = Math.max(_langArray.indexOf(languageKey), 0);
    translateTask.request();
    return _selectedLang;
  };
};

var _watchedTextNodes = [];

$i18n.bake = function (key, node, nodekey) {
  var value = $i18n(key);
  if (value) {
    if (node) {
      nodekey = nodekey || 'data';
      node[nodekey] = value;
    } else {
      node = document.createTextNode(value);
      nodekey = 'nodeValue';
    }
    _watchedTextNodes.push({
      node: node,
      nodekey: nodekey,
      datakey: key
    });
    return node;
  }
  return document.createTextNode(key);
};

_selectedLang = Math.max(_langArray.indexOf($config.lang), 0);
