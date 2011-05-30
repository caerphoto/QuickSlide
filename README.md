#QuickSlide

QuickSlide is a simple JavaScript popup image viewer, ideal for lightweight
gallery pages.

Adding it to a page is simple:

1. Include the `quickslide.js` file at the bottom of your page:

        <script src="quickslide.js"></script>

2. Add `rel="quickslide"` to any links you want to convert to popups:

        <a href="images/buslane_b.jpg" rel="quickslide">
          <img src="images/buslane_t.jpg"/>Bus Lane
        </a>
        <a href="images/cathedral_b.jpg" rel="quickslide">
          <img src="images/cathedral_t.jpg"/>Cathedral
        </a>

##Configuration
There are a few options you can specify to control the behaviour of the popups. They are set using a &lt;script&gt; anywhere before the inclusion of the main `quickslide.js` file, like so:

    <script>
    QuickSlideConfig = { max_width: 800, max_height: 600, auto_fit: true }
    </script>

The three options specified in this example are currently the only ones
available.
