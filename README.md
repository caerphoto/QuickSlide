#QuickSlide

QuickSlide is a basic JavaScript popup image viewer, ideal for lightweight
gallery pages. Adding it to a page is easy:

1. Include the `quickslide.js` file at the bottom of your page:

        <script src="quickslide.js"></script>

2. Add `rel="quickslide"` to any links you want to convert to popups:

        <a href="images/buslane_b.jpg" rel="quickslide">
          <img src="images/buslane_t.jpg"/>Bus Lane
        </a>

##Configuration
There are a few options you can specify to control the behaviour of the popups. They are set using a &lt;script&gt; anywhere before the inclusion of the main `quickslide.js` file, like so:

    <script>
    QuickSlideConfig = {
      loading_spinner_url = "loading-spinner.gif",
      max_width: 800,
      max_height: 600,
      auto_fit: true }
    </script>

The four options specified in this example are currently the only ones
available.
