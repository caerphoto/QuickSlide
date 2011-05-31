#QuickSlide

QuickSlide is a basic JavaScript popup image viewer, ideal for lightweight
gallery pages.

##Usage

1. Include the `quickslide.js` (or the minified equivalent) file at the bottom of your page:

        <script src="quickslide.js"></script>

2. Add `rel="quickslide"` to any links you want to convert to popups:

        <a href="images/buslane_b.jpg" rel="quickslide">
          <img src="images/buslane_t.jpg"/>Bus Lane
        </a>
Make sure these links point to images, otherwise QuickSlide will get confused.

That's it! QuickSlide is designed to be an unobtrusive, progressive enhancement to existing pages: it won't interfere with other JavaScript widgets or libraries, and your page won't break if for some reaon the code fails to load.

##Configuration
There are a few options you can specify to control the behaviour of the popups. They are set using a &lt;script&gt; tag anywhere before the inclusion of the main quickslide.js file, like so:

    <script>
    QuickSlideConfig = {
      loading_spinner_url: "loading-spinner.gif",
      max_width: 800,
      max_height: 600,
      absolute_position: true,
      auto_fit: true }
    </script>

The options specified in this example are currently the only ones available. An explanation of the options:

* `loading_spinner_url`: a string containing the URL for an image to use as a placeholder while the full image loads. It doesn't have to be an animation – you can use any valid image you want. Default is `"loading-spinner.gif"`.

* `max_width, max_height`: dimensions are in pixels. Specifying either will constrain the popup image to that size, maintaining aspect ratio. You can specify both. No default.

* `absolute_position`: set to `true` to make the popup scroll with the document. Default is `false`, which means the popup stays in the centre of the browser window even when you scroll up or down (i.e. it is displayed with `position: fixed style`).

* `auto_fit`: set this to `true` to prevent popups from being larger than the browser window. Default is `false`.
