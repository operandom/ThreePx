requirejs.config({
	paths: {
		threenoamd: '//cdnjs.cloudflare.com/ajax/libs/three.js/r68/three.min',
		three: 'three-amd',
		threepx: '../../src/threepx'
	}
});

requirejs(['three','threepx'], function(THREE, THREEPX) {

	'use strict';
	
	console.log('Application Start');
	var wrapperElement = document.getElementById('wrapper'),
		messageElement = document.getElementById('message'),
		threepx = new THREEPX(wrapperElement, {
			debug: true
		})
	;
	
	wrapperElement.appendChild(threepx.domElement);
	
	var geometry = new THREE.CubeGeometry(100,100,100),
		material = new THREE.MeshPhongMaterial({
			ambient: 0x030303,
			color: 0xdddddd,
			specular: 0x009900,
			shininess: 30,
			shading: THREE.FlatShading
		}),
		cube = new THREE.Mesh(geometry, material),
		cube2 = new THREE.Mesh(geometry, material),
		light_ambient = new THREE.AmbientLight( 0x404040 ),
		light_point = new THREE.PointLight( 0xff0000, 2, 1000 )
	;
	
	cube.position.set(-150,-150,100);
	cube2.position.set(0,100,-50);
	light_point.position.set(200,200,500);
	
	threepx.scene.add(cube);
	threepx.scene.add(cube2);
	threepx.scene.add(light_ambient);
	threepx.scene.add(light_point);
	
	var previousTimestamp;
	
	threepx.renderFunction = function(timestamp, width, height) {
		
		var delta = timestamp - previousTimestamp;
		
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
		
		cube2.rotation.x += 0.01;
		cube2.rotation.y += 0.01;
		
		cube.position.x = Math.round(Math.cos(timestamp/800)*width/3*100)/100;
		cube.position.y = Math.round(Math.sin(timestamp/800)*height/3*100)/100;
		cube.position.z = Math.round(Math.sin(timestamp/1000)*height*100)/100;
		
		previousTimestamp = timestamp;
		
		var perspective,
			wrapperStyle = wrapperElement.style,
			messageStyle = messageElement.style;
		
		if (threepx.sizeChanged) {
			perspective = threepx.perspective + 'px';
			wrapperStyle.webkitPerspective = perspective;
			wrapperStyle.mozPerspective = perspective;
			wrapperStyle.perspective = perspective;
		}
		
		var translate = 'translate3d(' + cube.position.x + 'px,' + (-cube.position.y) + 'px,' + (cube.position.z + 50) + 'px)';
		messageStyle.webkitTransform = translate;
		messageStyle.mozTransform = translate;
		messageStyle.transform = translate;
		messageStyle.zIndex = cube.position.z > 0 ? 4 : 2;
		
		return true
		
	}
	
});