# AMD/Module-compatible jQuery Slider Plugin

### Brief Intro
This is just another jQuery Slider pluging that is built to be compatible for AMD (CommonJS/RequireJS)and Node-style module inclusion. Currently a WIP, it will eventually be responsive and fit to whatever window size you choose.

**Dependencies**: `jQuery v.1.8+`

**Browser Compatibility**: `IE 9+, FF 30+, Chrome 27+, Safari 5.1+, Opera 23+, iOS Safari 6.1+, Android Browser 2.3+`

### How to use
1. Include the jQuery v.1.8+ into your template
2. Include the `slideorama.js` following jQuery
3. Then initialize the plugin as follows:
  `$(".slider").slide_o_rama();`
  There are optional params you can customize to fit your needs.

### Options
1. `slidesToShow` (integer): [default: `1`]
  * Here you can customize how many slides you would like to show at a time. Default is set to `1`
2. `startSlide` (integer): [default: `1`]
  * Here you can specify which slide number you would like to start on. By default, the `startSlide` is set to `1`, but if overridden, the appropriate pager page will be selected and the prev/next toggle states will be updated.
3. `slideWidth` (string or integer): [default: `null`]
  * By default, depending on the number of slides you choose to show at a time, the default slide width will take up the appropriate width relative to the overall slider wrapper container.
  * For example, if the slider wrapper takes up `500px` and you choose to set `slidesToShow: 2`, the plugin will set each slide width to `250px`. Note: I am using `rem` as the unit value to allow for flexibility.
4. `showToggles` (boolean): [default: `true`]
  * By default, the prev/next arrow toggles will show. You can choose to not use these default toggles and create your own and simply trigger the `previous.slider` and `next.slider` events to move to the prev/next slides. This will allow more customizability for users.
5. `showPager` (boolean): [default: `true`]
  * This is shown by default and allows users to go directly to a certain slide. You can hide this by setting `showPager` to `false`.
  * [WIP] I will add in events where you can trigger these events directly to allow for more customizability.
6. `animationSpeed` (string or integer): [default: `350`]
  * This just uses jQuery's `animate()` method, so you can pass in the same values here.
7. `afterSliderLoad` (function) (*optional*): [default: `null`]
  * This is an optional param that allows you to add in custom callbacks after the slider is loaded, so you can do any other prep work needed.

### Test out the example
To see the example (FYI it's pretty bare UI-wise), just checkout the repo, `cd` into the directory and run `grunt serve`. I used Yeoman to set this example up which leverages Grunt to compile its assets and run the server. Let me know if you have any questions or run into any issues with any of the above.

Thanks for listening and I will update this more as I go and think of other use cases.
