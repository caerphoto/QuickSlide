##Note: QuickSlide doesn't actually do anything useful yet :-)

#QuickSlide

QuickSlide is a simple JavaScript popup image viewer, ideal for lightweight
gallery pages.

Adding it to a page is simple:

1. Include the `quickslide.js` file at the bottom of your page:

        <script src="quickslide.js"></script>

2. Mark your thumbnail image links with `rel="quickslide"`:

        <a href="myphoto_big.jpg" rel="quickslide">
            <img src="myphoto_thumb.jpg">
        </a>

3. Add the `quickslide` class to a parent element:

        <div class="gallery-container quickslide">
          <!-- thumbnail image links go here -->
        </div>
