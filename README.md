ThreePx
=======

ThreePx synchronises the [three.js](http://threejs.org/) frustrum with that of the CSS.<br>
So, a 100 by 100 plane with a Z position of 0 and without rotation in three.js has a size of 100px by 100px on the screen.
The size of this plane doesn't change when the html wrapper changes it's size.

Installation
------------
Download [three.js](http://threejs.org/) and ThreePx files and put them in your project folder.<br>
Use Requirejs, Nodejs or a classical html script tag to import.<br>
Show in the examples folder to learn more.

Quick Example
-------------
```javascript
var wrapperElement = document.getElementById('wrapper'),
	threepx = new THREEPX(wrapperElement);

var size = 200,
	material = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture('crate.jpg')
	}),
	geometry = new THREE.CubeGeometry(size, size, size)

var ambientLight = new THREE.AmbientLight(0xbbbbbb),
	directionalLight = new THREE.DirectionalLight(0xffffff),
	cube = new THREE.Mesh(
		new THREE.CubeGeometry(size, size, size),
		new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture('crate.jpg')
		}
	)
;

directionalLight.position.set(1, 1, 1).normalize();

cube.position.z = -size/2;
cube.overdraw = true;

threepx.scene.add(cube);
threepx.scene.add(ambientLight);
threepx.scene.add(directionalLight);


var lastTimestamp = new Date();

threepx.renderFunction  = function (timestamp, width, height) {

	var delta = timestamp - lastTimestamp,
	angle = 0.02 * delta * 2 * Math.PI / 1000
	;

	cube.rotation.x += angle;
	cube.rotation.y += angle;

	lastTimestamp = timestamp;

	return true;
}
```

	

Requirements
------------
Three.js r66+ and a modern browser with WebGl, requestAnimationFrame() and css transform support.