var urlRoot = "https://party.gez.bz/api/";


function loadSampleData(url, callback)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
}
loadSampleData('./js/sample-json-data.json',process)


/*** API CALL ***
var request = new XMLHttpRequest();
request.open('GET', 'https://party.gez.bz/api/wp-json/wp/v2/posts', true);

request.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    var data = JSON.parse(this.response);
    process(data);
  } else {
    // Target server reached, but it returned an error
    console.error('Target server reached, but it returned an error');
  }
};

request.onerror = function() {
  // There was a connection error of some sort
  console.error('Connection error');
};

request.send();
*/


function process(data) {
  var activePhotoId = 0;

  var photoArray = ingestAllPhotos(data);
  displaySinglePhoto(photoArray[activePhotoId]);
  displayPhotoGrid(photoArray, 'grid');

  /*** EVENT HANDLERS ***/
  document.getElementById('right-btn')
          .addEventListener('click', changePhoto, false);
  document.getElementById('left-btn')
          .addEventListener('click', changePhoto, false);
  document.getElementById('grid-btn')
          .addEventListener('click', toggleGrid, false);
  var allCells = document.getElementsByClassName('img grid');
  for (var i=0; i<allCells.length; i++) {
    allCells[i].addEventListener('click', selectPhoto, false);
  }



  // Vanilla swipe gestures
  // http://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);

  var xDown = null;
  var yDown = null;

  function handleTouchStart(evt) {
      xDown = evt.changedTouches[0].clientX;
      yDown = evt.changedTouches[0].clientY;
  }

  function handleTouchMove(evt) {
      if ( ! xDown || ! yDown ) {
        return;
      }

      var xUp = evt.changedTouches[0].clientX;
      var yUp = evt.changedTouches[0].clientY;

      var xDiff = xDown - xUp;
      var yDiff = yDown - yUp;

      if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
          /* left swipe */
          changePhoto(null, 'right');
        } else {
          /* right swipe */
          changePhoto(null, 'left');
        }
      } else {
        if ( yDiff > 0 ) {
          /* up swipe */
        } else {
          /* down swipe */
        }
      }
      /* reset values */
      xDown = null;
      yDown = null;
  }



  function changePhoto(e, swipe) {
    var direction = swipe || e.path[0].id.slice(0,-4); // take -btn off the ID
    var nextPhotoId = activePhotoId;
    if (direction == 'right' && activePhotoId < photoArray.length-1) {
      nextPhotoId++;
    } else if (direction == 'left' && activePhotoId > 0) {
      nextPhotoId--;
    }
    if (nextPhotoId != activePhotoId) {
      activePhotoId = nextPhotoId;
      displaySinglePhoto(photoArray[activePhotoId]);
    }
  }


  function toggleGrid(e) {
    var hide, show;
    if (e.path[0].className == 'icon') {
      hide = 'none';
      show = 'flex';
    } else {
      hide = 'flex';
      show = 'none';
    }
    document.getElementById('grid-btn')
            .style.display = hide;
    document.getElementById('display-container')
            .style.display = hide;
    document.getElementById('grid-container')
            .style.display = show;
  }

  function selectPhoto(e) {
    let id = e.path[0].id;
    toggleGrid(e);
    activePhotoId = id;
    displaySinglePhoto(photoArray[id]);
  }



  /*** PHOTO DISPLAY ***/
  function displaySinglePhoto(photo) {
    var displayContainer = document.getElementById('single-image-container');
    var activePhotoArr = displayContainer.getElementsByTagName('img');
    var activePhoto = activePhotoArr[0];
    if (activePhoto) {
      activePhoto.className += ' prev';
      setTimeout(function() {
        activePhoto.src = photo.url;
        // Test if img loaded, reveal once it has.
        (function reveal() {
          reveal.i = reveal.i ? reveal.i : 0;
          reveal.i++;
          if (activePhoto.complete) {
            document.getElementById('loader').className = 'hide';
            activePhoto.className = activePhoto.className.slice(0,-5);
          } else {
            document.getElementById('loader').className = '';
            if (reveal.i < 5) {
              setTimeout(function() {
                reveal();
              }, 500);
            }
            reveal.i = 0;
          }
        })();
      }, 1000);

    } else {
      displayContainer.innerHTML = this.imgContainer(photo, 'single');
    }
    preloadImages(neighbourImages(activePhotoId), true);
  }

  function neighbourImages(id) {
    // TODO optimise order of preloading images
    var toBeLoaded = [];
    for (var i = id-1; i < id+2; i++) {
      if (i!=id && photoArray[i]) {
        toBeLoaded.push(photoArray[i].url);
      }
    }
    return toBeLoaded;
  }


  function preloadImages(array, waitForOtherResources, timeout) {
  // Preload images before display
  // http://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript
    var loaded = false,
        list = preloadImages.list ? preloadImages.list : [],
        imgs = array.slice(0),
        t = timeout || 10*1000,
        timer;
    if (!waitForOtherResources || document.readyState === 'complete') {
      loadNow();
    } else {
      window.addEventListener("load", function() {
        clearTimeout(timer);
        loadNow();
      });
      // in case window.addEventListener doesn't get called
      // (sometimes some resource gets stuck)
      // then preload the images anyway after some timeout time
      timer = setTimeout(loadNow, t);
    }
    function loadNow() {
      if (!loaded) {
        loaded = true;
        for (var i = 0; i < imgs.length; i++) {
          var img = new Image();
          img.onload = img.onerror = img.onabort = function() {
            var index = list.indexOf(this);
            if (index !== -1) {
              // remove image from the array once it's loaded
              // for memory consumption reasons
              list.splice(index, 1);
            }
          };
          list.push(img);
          img.src = imgs[i];
        }
      }
    }
  }


  function displayPhotoGrid(photoArray) {
    photoArray.forEach( (photo) => {
      var grid = document.getElementById('grid-container');
      grid.innerHTML += gridCell(photo);
    });
  }


  function ingestAllPhotos(data) {
    if (!Array.isArray(data)) {
      return console.error(
        'Type error: Photo data for ingestion not delivered as an Array'
      );
    }
    var postsWithFeaturedImg = data.filter(function(post) {
      return post.better_featured_image;
    });
    var photoArray = postsWithFeaturedImg.reverse()
                                         .map(function(post, i) {
      return {
        url: urlRoot + 'wp-content/uploads/' + post.better_featured_image.media_details.file,
        thumbnail_url: post.better_featured_image.media_details.sizes.medium.source_url,
        alt_text: post.better_featured_image.alt_text,
        caption: post.better_featured_image.caption,
        description: post.better_featured_image.description,
        post_title: post.title.rendered,
        id: i
      };
    });
    return photoArray;
  }

}

/*** VISUAL COMPONENTS ***/
function gridCell(photo) {
  var cell =
    `<div class="grid-cell">
      ${this.imgContainer(photo, 'grid')}
    </div>`;
  return cell;
}

function imgContainer(photo, type) {
  var url = (type == 'grid') ? photo.thumbnail_url : photo.url;
  var container = `<img class="img ${type}" id=${photo.id} src="${url}"></img>`;
  return container;
}
