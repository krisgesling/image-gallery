process(localJSON);

function process(photoArray) {
  var activePhotoIndex = 0;
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
  var allCells = document.getElementById('grid-container')
                         .getElementsByTagName('img');
  for (var i=0; i<allCells.length; i++) {
    allCells[i].addEventListener('click', selectPhoto, false);
  }
  vanillaSwipe(changePhoto); // finger swipe and arrow key change

  function changePhoto(e, swipe) {
    var direction = swipe || e.target.id.slice(0,-4); // take -btn off the ID
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
      return console.error
      (`toggleHide() cannot find target element: ${targetDesc}`);
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
    var heartImg = document.getElementsByClassName('heart')[0]
                           .getElementsByTagName('img')[0];
    heartImg.classList.add('liked');
    setTimeout(function() {
      heartImg.classList.remove('liked')
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
        activePhoto.src = (getScreenSize() > 1024) ?
          photo.url : photo.medium_url;
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
    index = Number(index)
    var toBeLoaded = [];
    for (var i = index-1; i < index+2; i++) {
      if (i!=index && photoArray[i]) {
        var url = (getScreenSize() > 1024) ?
          photoArray[i].url : photoArray[i].medium_url;
        toBeLoaded.push(url);
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
}

/*** VISUAL COMPONENTS ***/
function getScreenSize() {
  // Test size of window to determine full size image
  var maxViewportWidth = (window.innerHeight > window.innerWidth) ?
    window.innerHeight : window.innerWidth;
  return maxViewportWidth;
}

function gridCell(photo) {
  var cell =
    `<div class="grid-cell">
      ${this.imgContainer(photo, 'grid')}
    </div>`;
  return cell;
}

function imgContainer(photo, type) {
  var url = (type == 'grid') ? photo.thumbnail_url :
    (getScreenSize() > 1024) ? photo.url : photo.medium_url;
  var img = `<img id=${photo.id} key=${photo.index} src="${url}"></img>`;
  if (type != 'grid') {
    img += `
      <div class="heart" id="h${photo.id}">
        <img src="./css/img/heart-icon.svg"></img>
      </div>
    `;
  }
  return img;
}
