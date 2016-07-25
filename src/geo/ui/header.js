
cdb.geo.ui.Header = cdb.core.View.extend({

  className: 'cartodb-header',

  defaults: {
    style: {
      textAlign: "left",
      zIndex: 4,
      color: "#ffffff",
      fontSize: "20",
      fontFamilyName: "Helvetica",
      boxColor: 'rgba(0,0,0,0.5)',
      boxOpacity: 0.7,
      boxPadding: 10
    }
  },

  initialize: function() {
    var extra = this.model.get("extra");

    this._cleanStyleProperties(this.options.style);

    if (this.model.get("description")) {
      this.defaults.style.fontSize = "12";
    }

    _.defaults(this.options.style, this.defaults.style);

    this.style = new cdb.core.Model(this.options.style);

    this.style.on("change", this._applyStyle, this);

    this.add_related_model(this.style);

    this.model.set({
      title:            extra.title,
      description:      extra.description,
      show_title:       extra.show_title,
      show_description: extra.show_description
    }, { silent: true });
  },

  show: function() {
    //var display        = this.model.get("display");
    var hasTitle       = this.model.get("title") && this.model.get("show_title");
    var hasDescription = this.model.get("description") && this.model.get("show_description");

    if (hasTitle || hasDescription) {
      this.$el.show();
      if (hasTitle)       this.$el.find(".content div.title").show();
      if (hasDescription) this.$el.find(".content div.description").show();
    }
  },

  _getStandardPropertyName: function(name) {
    if (!name) {
      return;
    }

    var parts = name.split("-");

    if (parts.length === 1) {
      return name;
    } else {
      return parts[0] + _.map(parts.slice(1), function(l) {
        return l.slice(0,1).toUpperCase() + l.slice(1);
      }).join("");
    }
  },

  _cleanStyleProperties: function(hash) {

    var standardProperties = {};

    _.each(hash, function(value, key) {
      standardProperties[this._getStandardPropertyName(key)] = value;
    }, this);

    this.options.style = standardProperties;

  },

  _getRGBA: function(color, opacity) {
    return 'rgba(' + parseInt(color.slice(-6,-4),16) + ',' + parseInt(color.slice(-4,-2),16) +
      ',' + parseInt(color.slice(-2),16) + ',' + opacity + ' )';
  },

  _applyStyle: function() {

    var textColor  = this.style.get("color");
    var textAlign  = this.style.get("textAlign");
    var boxColor   = this.style.get("boxColor");
    var boxOpacity = this.style.get("boxOpacity");
    var boxPadding = this.style.get("boxPadding");
    var lineWidth  = this.style.get("lineWidth");
    var lineColor  = this.style.get("lineColor");
    var fontFamily = this.style.get("fontFamilyName");

    this.$content = this.$el.find(".content");

    if (this.model.get("description")) {
      this.$text = this.$el.find(".description");
    } else {
      this.$text = this.$el.find(".title");
    }

    this.$content.css("padding", boxPadding);
    this.$text.css("font-size", this.style.get("fontSize") + "px");
    this.$el.css("z-index", this.style.get("zIndex"));
    this.$text.css('font-family', fontFamily);
    this.$content.css('text-align', textAlign);
    $(".cartodb-header").css("background-color", "transparent");
    this.$content.css("background-color", this._getRGBA(boxColor, boxOpacity));
    this.$text.css("color", this._getRGBA(textColor, 1));
  },

  // Add target attribute to all links
  _setLinksTarget: function(str) {
    if (!str) return str;
    var reg = new RegExp(/<(a)([^>]+)>/g);
    return str.replace(reg, "<$1 target=\"_blank\"$2>");
  },

  render: function() {
    var data = _.clone(this.model.attributes);
    data.title = cdb.core.sanitize.html(data.title);
    data.description = this._setLinksTarget(cdb.core.sanitize.html(data.description));
    this.$el.html(this.options.template(data));

    if (this.options.slides) {
      this.slides_controller = new cdb.geo.ui.SlidesController({
        transitions: this.options.transitions,
        slides: this.options.slides
      });

      this.$el.append(this.slides_controller.render().$el);
    }

    if (this.model.get("show_title") || this.model.get("show_description")) {
      this.show();
    } else {
      this.hide();
    }

    var self = this;
    // Delay applying styles to prevent rendering issues with other elements;
    // annotations also do this.
    setTimeout(function() {
      self._applyStyle();
    }, 500);

    return this;
  }

});
