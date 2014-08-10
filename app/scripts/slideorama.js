/**
    Slide-O-Rama jQuery Plugin
    = built with AMD and Node JS module.exports in mind
**/

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( name, definition ){
  var theModule = definition(),
      // this is considered "safe":
      hasDefine = typeof define === "function" && define.amd,
      // hasDefine = typeof define === "function",
      hasExports = typeof module !== "undefined" && module.exports;

  if ( hasDefine ){
    // AMD Module
    define(name, theModule);
  } else if ( hasExports ) {
    // Node.js Module
    module.exports = theModule;
  }
})( "slide_o_rama", function ($, global, document, undefined) {
  "use strict";

  // Constants
  var CURRENT_PAGE_CLASS = "slider__page--current",
      SLIDER_TOGGLE_INACTIVE = "slider__toggle--inactive",
      Plugin = function (slider, options) {
        this.initialize.call(this, slider, options || {});
      };

  Plugin.prototype = {
    initialize: function (slider, options) {
      var self = this;

      this.$slider = $(slider);
      this.$slides = this.$slider.find(options.slides) || this.$slider.find(".slider__slide");
      this.slideWidth = options.slideWidth;
      this.slidesToShow = options.slidesToShow;
      this.totalSlides = this.$slides.length || 0;
      this.startSlide = options.startSlide;
      this.showToggles = options.showToggles;
      this.showPager = options.showPager;
      this.animationSpeed = options.animationSpeed;
      this.afterSliderLoad = options.afterSliderLoad;
      this._units = $(".lt-ie9").length > 0 ? "em" : "rem";
      this._animating = false;
      this._slidePosition = 0;

      // Bind handlers to controls
      this._prep()._activate();

      return this;
    },

    _prep: function () {
      // Wrap slides in outer container
      this.$slider.wrap("<div class=\"slider__wrapper\"><div class=\"slider__inner_wrapper\"><\/div><\/div>");

      // Store reference to slider wrapper
      this.$innerWrapper = this.$slider.parent(".slider__inner_wrapper");
      this.$wrapper = this.$innerWrapper.parent(".slider__wrapper");

      // Add slider__slide class if provided slides selector don't have them so can style
      // them appropriately for the slider
      if (!this.$slides.hasClass("slider__slide")) {
        this.$slides.addClass("slider__slide");
      }

      // If this.$slides (aka the slider) doesn't have the 'slider' class on it,
      // add it for styling purposes (in shared/partials/_slider.scss)
      if (!this.$slider.hasClass("slider")) {
        this.$slider.addClass("slider");
      }

      // Add Next/Prev toggles
      if (this.showToggles) {
        this._buildToggles();
      }

      // If showPager true, create pager and append to slider
      if (this.showPager) {
        this._createPaginator();
      }

      // Set slide width
      this._setWidths();

      // If user specifies to start on slide other than first, trigger startSlidePosition
      if (this.startSlide > 1) {
        this.startSlidePosition();
      }

      // User specifies a callback after slider loads, execute it
      if (this.afterSliderLoad && typeof this.afterSliderLoad === "function") {
        this.afterSliderLoad();
      }

      return this;
    },

    _activate: function () {
      var self = this;

      this.$slider.on({
        "previous.slider": function (e) {
          e.preventDefault();

          self.prevSlide(e);
        },

        "next.slider": function (e) {
          e.preventDefault();

          self.nextSlide(e);
        }
      });

      return this;
    },

    _remCalculator: function (size) {
      var baseFontSize = parseFloat($("body").css("fontSize"), 10);

      return (size / baseFontSize) + this._setUnits();
    },

    _setUnits: function () {
      return $(".lt-ie9").length > 0 ? "em" : "rem";
    },

    // If no width set, then make slide widths be percentage
    // of parent container width
    _calcWidths: function () {
      // If no width set, grab outerWidth() of .slider__wrapper
      if (this.slideWidth) {
        this._innerWrapperWidth = this.slideWidth * this.slidesToShow;
      } else {
        this._innerWrapperWidth = this.$innerWrapper.outerWidth();
        this.slideWidth = this._innerWrapperWidth / this.slidesToShow;
      }

      // Store entire slider wrapper width
      this._wrapperWidth = this.$wrapper.outerWidth();

      return {
        sliderWidth: this._remCalculator(this.slideWidth * this.totalSlides),
        slideWidth: this._remCalculator(this.slideWidth),
        innerWrapperWidth: this._remCalculator(this._innerWrapperWidth)
      };
    },

    _setWidths: function () {
      var self = this,
          widths = this._calcWidths();

      // Set slider width
      this.$slider.css({
        width: widths.sliderWidth
      });

      // Set slide
      this.$slides.css({
        width: widths.slideWidth
      });

      // Set inner wrapper width to only show x slides
      this.$innerWrapper.css({
        width: widths.innerWrapperWidth
      });

      return this;
    },

    _calcTotalSlides: function () {
      return Math.ceil(this.totalSlides / this.slidesToShow);
    },

    _atFirstSlideSet: function () {
      return this._slidePosition === 0;
    },

    _atLastSlideSet: function () {
      return this._slidePosition === this._calcTotalSlides() - 1;
    },

    // _calcSliderPosition: function () {
    //   // Get current slidePosition
    //   // Multiply by slidesToShow
    //   // Multiply by slideWidth
    //   return this._remCalculator(this._slidePosition * this.slidesToShow * this.slideWidth);
    // },

    _buildToggles: function () {
      var self = this,
          togglesClass = "icon slider__toggle",
          prevToggleClass = togglesClass + " icon__prev slider__prev_toggle",
          nextToggleClass = togglesClass + " icon__next slider__next_toggle";

      if (this.totalSlides <= this.slidesToShow) {
        return false;
      }

      switch (true) {
        // If startSlidePos === 1, hide previous toggle
        case this._atFirstSlideSet():
          prevToggleClass += " " + SLIDER_TOGGLE_INACTIVE;
          break;
        // If startSlidePos === [last slide], hide next toggle
        case this._atLastSlideSet():
          nextToggleClass += " " + SLIDER_TOGGLE_INACTIVE;
          break;
        default:
          break;
      }

      this.$wrapper.append("<span class=\" " + prevToggleClass + "\"><\/span><span class=\"" + nextToggleClass + "\"><\/span>");

      // Store references to each toggle
      this.$nextToggle = this.$wrapper.find(".slider__next_toggle");
      this.$prevToggle = this.$wrapper.find(".slider__prev_toggle");

      this.$nextToggle.on("click", function (e) {
        e.preventDefault();

        self.nextSlide(e);
      });


      this.$prevToggle.on("click", function (e) {
        e.preventDefault();

        self.prevSlide(e);
      });

      return this;
    },

    _createPaginator: function () {
      var self = this,
          i = 0,
          len = this._calcTotalSlides() - 1,
          page = "",
          pager,
          pageClass;

      for (; i <= len; i++) {
        pageClass = "slider__page";

        // Add current class to first page link
        if (i === 0) {
          pageClass += " " + CURRENT_PAGE_CLASS;
        }

        page += "<li class=\"" + pageClass + " slider__page_" + i + "\" data-page=\"" + i + "\">" + i + "<\/li>";
      }

      // Add page links to container
      pager = "<ul class=\"slider__pager\">" + page + "<\/ul>";

      // Add pager to slider
      this.$wrapper.append(pager);

      // Store pager element
      this.$pager = this.$wrapper.find(".slider__pager");

      // Bind pagerSlide on pager creation
      this.$pager.on("click", ".slider__page", self.pagerSlide.bind(self));

      return this;
    },

    // This will only get called if user sets showPager to true
    // Need to update pager links when click on pager link directly AND click Next/Prev toggles
    // @param $page: This is passed in when click on pager link directly
    _updateCurrentPagerLink: function ($page) {
      var $newCurrentPage = $page ? $page : this.$pager.find(".slider__page_" + this._slidePosition);

      // Update pager current page state
      // Remove current pager link current state
      this.$pager.find("." + CURRENT_PAGE_CLASS).removeClass(CURRENT_PAGE_CLASS);

      // Make next pager link current
      $newCurrentPage.addClass(CURRENT_PAGE_CLASS);

      return this;
    },

    _updateSliderToggles: function () {
      var $inactiveToggles = this.$slider.find("." + SLIDER_TOGGLE_INACTIVE);

      // Show/Hide Toggles
      // If at first slide, hide Previous and show Next (if hidden)
      // If at last slide, hide Next and show Previous (if hidden)
      // If in the middle, show Next and Previous (if hidden)
      switch (true) {
        // If at first slide, hide Previous toggle if not hidden and show Next toggle
        case this._atFirstSlideSet():
          this.$nextToggle.removeClass(SLIDER_TOGGLE_INACTIVE);

          if (!this.$prevToggle.hasClass(SLIDER_TOGGLE_INACTIVE)) {
            this.$prevToggle.addClass(SLIDER_TOGGLE_INACTIVE);
          }
          break;
        case this._atLastSlideSet():
          // If at last slide, hide Next toggle if not hidden and show Previous toggle
          this.$prevToggle.removeClass(SLIDER_TOGGLE_INACTIVE);

          if (!this.$nextToggle.hasClass(SLIDER_TOGGLE_INACTIVE)) {
            this.$nextToggle.addClass(SLIDER_TOGGLE_INACTIVE);
          }
          break;
        default:
          // If in the middle slides, then show both toggles
          if ($inactiveToggles.length > 0) {
            $inactiveToggles.removeClass(SLIDER_TOGGLE_INACTIVE);
          }
          break;
      }

      return this;
    },

    startSlidePosition: function () {
      // Update slidePosition to user-specified slide
      this._slidePosition = this.startSlide - 1;

      // Move slider to appropriate position
      this.moveSlider();

      // After move, see if need to show/hide toggles
      this._updateSliderToggles();

      return this;
    },

    pagerSlide: function (e) {
      var $page = $(e.target);

      e.preventDefault();

      // If still animating, prevent too many click events from firing
      if (this._animating) {
        return false;
      }

      // Set new slidePosition
      this._slidePosition = parseInt($page.attr("data-page"), 10);

      // Move slider
      this.moveSlider($page);

      // Update toggle views
      this._updateSliderToggles();

      return this;
    },

    moveSlider: function ($page) {
      var self = this;

      // Set animating flag to true
      this._animating = true;

      // Move slides by slideWidth
      this.$slider.animate({
        marginLeft: this._remCalculator(-this._innerWrapperWidth * this._slidePosition)
      }, self.animationSpeed, function () {
        // Once animating is complete, reset _animating flag
        self._animating = false;
      });

      // Update pager current page state
      if (this.showPager) {
        this._updateCurrentPagerLink($page);
      }

      return this;
    },

    nextSlide: function (e) {
      var self = this;

      e.preventDefault();

      // If still animating, prevent too many click events from firing
      if (this._animating || this._atLastSlideSet()) {
        return false;
      }

      // Show Prev Slide Toggle if at first slide
      if (this.showToggles) {
        if (this._atFirstSlideSet()) {
          this.$prevToggle.removeClass(SLIDER_TOGGLE_INACTIVE);
        }
      }

      // +1 to slidePosition
      this._slidePosition++;

      // Move slides by slideWidth
      this.moveSlider();

      // If reach last slide (slidePosition === this.totalSlides), hide
      // this toggle
      if (this.showToggles) {
        if (this._atLastSlideSet()) {
          this.$nextToggle.addClass(SLIDER_TOGGLE_INACTIVE);
        }
      }

      return this;
    },

    prevSlide: function (e) {
      var self = this;

      e.preventDefault();

      // If still animating, prevent too many click events from firing
      if (this._animating || this._atFirstSlideSet()) {
        return false;
      }

      // Show Next Slide Toggle if at last slide
      if (this.showToggles) {
        if (this._atLastSlideSet()) {
          this.$nextToggle.removeClass(SLIDER_TOGGLE_INACTIVE);
        }
      }

      // -1 to slidePosition
      this._slidePosition--;

      // Move slides by slideWidth
      this.moveSlider();

      // If reach last slide (slidePosition === 1), hide
      // this toggle
      if (this.showToggles) {
        if (this._atFirstSlideSet()) {
          this.$prevToggle.addClass(SLIDER_TOGGLE_INACTIVE);
        }
      }

      return this;
    }
  };

  $.fn.extend({
    slide_o_rama: function (options) {
      var defaults = {
        slidesToShow: 1,
        startSlide: 1,
        slideWidth: null,
        showToggles: true,
        showPager: true,
        animationSpeed: 350,
        afterSliderLoad: null
      }, o = $.extend(defaults, options);

      [].forEach.call($(this), function (slider, idx, arr) {
        return new Plugin(slider, o);
      });
    }
  });

  return $.fn.slide_o_rama;
}(jQuery, window, document));
