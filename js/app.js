var urlRoot = 'https://party.gez.bz/api/';


function loadSampleData(url, callback)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    script.onreadystatechange = callback;
    //script.onload = callback;

    head.appendChild(script);
}
loadSampleData('./js/sample-data-with-likes.json',process)


/*** API CALL ***
var request = new XMLHttpRequest();
request.open('GET', 'https://party.gez.bz/api/wp-json/wp/v2/posts', true);

request.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    var data = JSON.parse(this.response);
    console.log(JSON.stringify(data,null,2));
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
  var activePhotoIndex = 0;
  var photoArray = ingestAllPhotos(data);
  displaySinglePhoto(photoArray[activePhotoIndex]);
  displayPhotoGrid(photoArray, 'grid');

  /*** EVENT HANDLERS ***/
  document.getElementById('right-btn')
          .addEventListener('click', changePhoto, false);
  document.getElementById('left-btn')
          .addEventListener('click', changePhoto, false);
  document.getElementsByClassName('heart')[0]
          .addEventListener('click', incrementLikes, false);
  document.getElementById('grid-btn')
          .addEventListener('click', toggleGrid, false);

  //var allCells = document.getElementsByClassName('grid');
  var allCells = document.getElementById('grid-container')
                         .getElementsByTagName('img');
  for (var i=0; i<allCells.length; i++) {
    allCells[i].addEventListener('click', selectPhoto, false);
  }


  // Vanilla swipe gestures
  // http://stackoverflow.com/questions/2264072/
  // detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
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

  // Arrow key presses
  document.onkeydown = keyPressed;
  function keyPressed(e) {
    e = e || window.event;
    switch (e.keyCode) {
      case 37: // left
        changePhoto(null, 'left');
        break;
      case 39: // right
        changePhoto(null, 'right');
        break;
      case 38: // up
      case 39: // down
        break;
    }
  }


  function changePhoto(e, swipe) {
    var direction = swipe || e.path[0].id.slice(0,-4); // take -btn off the ID
    var nextPhotoId = activePhotoIndex;

    if (direction == 'right' && activePhotoIndex < photoArray.length-1) {
      nextPhotoId++;
    } else if (direction == 'left' && activePhotoIndex > 0) {
      nextPhotoId--;
    }

    if (nextPhotoId != activePhotoIndex) {
      activePhotoIndex = nextPhotoId;
      displaySinglePhoto(photoArray[activePhotoIndex]);
    }
  }


  function toggleHide(targetDesc, hide) {
  // Sets the target element to hide or display
  // If hide arg is undefined then detect and switch
    var target;
    switch (targetDesc.charAt(0)) {
      case '.':
        target = document.getElementsByClassName(targetDesc.slice(1))[0];
        break;
      case '#':
        target = document.getElementById(targetDesc.slice(1));
        break;
      default:
        target = document.getElementsByTagName(targetDesc);
        break;
    }

    if (!target && !target.id && !target.className) {
      return console.error(`toggleHide() cannot find target element: ${targetDesc}`);
    };

    var isHidden = (' ' + target.className + ' ').indexOf(' hide ') >= 0;
    if (hide == 'undefined' || hide != isHidden) {
      target.classList.toggle('hide');
      return !isHidden;
    };
  }

  function toggleGrid(e) {
    toggleHide('#grid-btn');
    var gridDisplayProp = toggleHide('#grid-container') ? 'none' : 'flex';
    document.getElementById('grid-container')
            .style.display = gridDisplayProp;
    // changes display attribute as easiest way to clear UI for clicks etc
    var hideDisplay = toggleHide('#display-container') ? 'none' : 'flex';
    document.getElementById('display-container')
            .style.display = hideDisplay;
  }


  function incrementLikes(e) {
    var imgContIndex = e.path[0].tagName == 'DIV' ? '1' : '2';
    var incrementId = e.path[imgContIndex].childNodes[1].id;
    ga('send', 'event', 'Likes', 'Heart', incrementId);

     // then do animation stuff
    document.getElementsByClassName('heart')[0]
                        .getElementsByTagName('img')[0]
                        .style.width = '3em';
    document.getElementsByClassName('heart')[0]
            .getElementsByTagName('span')[0].innerHTML ='Thanks!';
    //.innerHTML('Thanks');
    setTimeout(function() {
      document.getElementsByClassName('heart')[0]
              .getElementsByTagName('img')[0]
              .style.width = '2em';
      setTimeout(function() {
        document.getElementsByClassName('heart')[0]
                .getElementsByTagName('span')[0].innerHTML ='';
      }, 1000);
    }, 300);
  }


  function selectPhoto(e) {
    var index = e.path[0].attributes.key.value;
    toggleGrid(e);
    activePhotoIndex = index;
    displaySinglePhoto(photoArray[index]);
  }


  /*** PHOTO DISPLAY ***/
  // TODO Refactor!
  function displaySinglePhoto(photo) {
    var singleImgCont = document.getElementById('single-image-container');
    var activePhoto = singleImgCont.getElementsByTagName('img')[0];

    if (activePhoto) {
      toggleHide('#single-image-container');
      setTimeout(function() {
        activePhoto.src = photo.url;
        activePhoto.id = photo.id;
        activePhoto.key = photo.index;
        // Test if img loaded, reveal once it has.
        (function reveal() {
          reveal.i = reveal.i ? reveal.i : 0;
          reveal.i++;
          if (activePhoto.complete) {
            toggleHide('#loader', true);
            toggleHide('#single-image-container');
          } else {
            toggleHide('#loader', false);
            if (reveal.i < 10) {
              setTimeout(function() {
                reveal();
              }, 500);
            }
            reveal.i = 0;
          }
        })();
      }, 800);

    } else {
      singleImgCont.innerHTML = this.imgContainer(photo);
    }
    preloadImages(neighbourImages(activePhotoIndex), true);
  }

  function neighbourImages(index) {
    // TODO optimise order of preloading images
    var toBeLoaded = [];
    for (var i = index-1; i < index+2; i++) {
      if (i!=index && photoArray[i]) {
        toBeLoaded.push(photoArray[i].url);
      }
    }
    return toBeLoaded;
  }


  function preloadImages(array, waitForOtherResources, timeout) {
  // Preload images before display
  // http://stackoverflow.com/questions/10240110/
  // how-do-you-cache-an-image-in-javascript
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
      var gridContainer = document.getElementById('grid-container');
      gridContainer.innerHTML += gridCell(photo);
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
      var postImage = post.better_featured_image;
      var baseUrl = urlRoot + 'wp-content/uploads/';
      return {
        url: baseUrl + postImage.media_details.file,
        thumbnail_url: postImage.media_details.sizes.medium.source_url,
        alt_text: postImage.alt_text,
        caption: postImage.caption,
        description: post.better_featured_image.description,
        post_title: post.title.rendered,
        likes: post.acf ? post.acf.likes : 0,
        index: i,
        id: post.id
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
  var img = `
                    <img id=${photo.id} key=${photo.index} src="${url}"></img>
                  `;
  if (type != 'grid') {
    img += `
                  <div class="heart" id="h${photo.id}">
                    <span></span>
                    <img src="./css/img/heart-icon.svg"></img>
                  </div>
                `;
  }
  return img;
}
