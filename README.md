ThreePx
=======

ThreePx synchronises the [three.js](http://threejs.org/) frustrum with that of the CSS.<br>
So, a 100 by 100 plane with a Z position of 0 and without rotation in three.js has a size of 100px by 100px on the screen.
The size of this plane doesn't change when the html wrapper changes it's size.

Installation
------------
Download [three.js](http://threejs.org/) and [ThreePx](https://github.com/operandom/ThreePx/releases) files and put them in your project folder.<br>
Use Requirejs, Nodejs or a classical html script tag to import.<br>
Show in the examples folder to learn more.

Quick Example
-------------

```javascript
var wrapperElement = document.getElementById('wrapper'),
    threepx = new THREEPX(wrapperElement),
    mesh = new THREE.Mesh(
        // define your mesh
    )
;

threepx.scene.add(mesh);

var lastTimestamp = new Date();

threepx.renderFunction  = function (timestamp, width, height) {

    var delta = timestamp - lastTimestamp,
        angle = 0.02 * delta * 2 * Math.PI / 1000
    ;

    mesh.rotation.x += angle;
    mesh.rotation.y += angle;

    mesh.position.set(100 + width/2, 100 - height/2, 0);

    lastTimestamp = timestamp;

    return true;
}
```

Requirements
------------
Three.js r66+ and a modern browser with WebGl, requestAnimationFrame() and css transform support.

TODO
----
* Add support of perspectiveOrigin
* Add property change events
* Add tests
* Improve code

Developers
----------
Install Gulp and node modules if you want minified the source, YUIDoc to generate the doc.<br>
Testers, devs and ideas are welcome.

Licence
-------
Copyright (c) 2014 Valéry Herlaud. Licensed under the MIT license. See the file LICENSE.md in this distribution for more details.
