var vanillaSwipe = function(callback) {
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
        callback(null, 'right');
      } else {
        /* right swipe */
        callback(null, 'left');
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
        callback(null, 'left');
        break;
      case 39: // right
        callback(null, 'right');
        break;
      case 38: // up
      case 39: // down
        break;
    }
  }
}
