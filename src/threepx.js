(function(root) {
	
	'use strict';
	var define = root.define;
		
	// Nodejs
	if (typeof module === 'object' && typeof module.exports === 'object') {
		console.log('[THREEPX] Nodejs detected');
		define = function (requirements, factory) {
			module.export = factory(require('three'));
		};
		
	// Requirejs
	} else if (typeof define === 'function' && define.amd) {
		console.log('[THREEPX] AMD detected.');
		
	// Browser tag style
	} else {
		console.log('[THREEPX] Root injection');
		define = function (fakeRequirements, factory) { root.THREEPX = factory(THREE); };
	}
	
	
	// Requirejs
	
	define(['three'], function (THREE) {
		
		console.log('[THREEPX] class defined.');
		
		return THREEPX;
		
		/**
		 * A Tool to make a 
		 * 
		 * @class THREEPX
		 * @constructor
		 * 
		 * @param {HTMLElement} wrapper
		 * @param {Object} options
		 */
		function THREEPX (wrapper, options) { //@TODO group options
			
			var self = this,
				defaultPerspective = 1000,
				
				// Options
				configurable = false,
				autoResize = true,
				debug = false,
				
				sizeReferer,
				renderFunction,
				
				// View
				perspective, width, height, fov, ratio,
				near = 1,
				far = 10000,

				// Flags
				activated,
				viewChanged,
				sizeRefererChanged,
				userNeedRender,
				
				// THREE
				scene, camera, renderer,
				twoRadians = 360 / Math.PI,
				
				// Debug
				plane, plane100,
				cubeTL, cubeTR, cubeBL, cubeBR,
				cubeSize = 100,
				cubeHalfSize = cubeSize/2
			;
						
			defineClass();
			parseOptions(options);
			initialize();
			
			
			
			
			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  C L A S S   D E F I N I T I O N                               //
			//                                                                //
			////////////////////////////////////////////////////////////////////
			
			
			
			function defineClass() {
				
				Object.defineProperties(self, {
					domElement: {
						configurable: configurable,
						enumerable: true,
						get: getDomElement
					},
					fov: {
						configurable: configurable,
						enumerable: true,
						get: getFov
					},
					perspective: {
						configurable: configurable,
						enumerable: true,
						get: getPerspective
					},
					viewChanged: {
						configurable: configurable,
						enumerable: true,
						get: getViewChanged
					},
					renderFunction: {
						configurable: configurable,
						enumerable: true,
						get: getRenderFunction,
						set: setRenderFunction
					},
					activated: {
						configurable: configurable,
						enumerable: true,
						get: getActivated,
						set: setActivated
					},
					scene: {
						configurable: configurable,
						enumerable: true,
						get: getScene
					}
				});
				
			}




			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  A P I                                                         //
			//                                                                //
			////////////////////////////////////////////////////////////////////



			function getDomElement() {
				return renderer.domElement;
			}


			function getFov() {
				return fov;
			}
			
			
			function getPerspective() {
				return perspective;
			}
			
			
			function getViewChanged() {
				return viewChanged;
			}


			function getRenderFunction() {
				return renderFunction;
			}


			function setRenderFunction(value) {
				renderFunction = value;
			}


			function getAutoResize() {
				return autoResize;
			}


			function setAutoResize(value) {
				autoResize = !!value;
			}
			
			
			function getActivated() {
				return activated;
			}
			
			
			function setActivated(value) {
				
				if (activated !== value && (activated = !!value)) {
					requestAnimationFrame(render);
				}
				
			}
			
			
			function getScene() {
				return scene;
			}

			
			
			
			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  I N I T I A L I Z A T I O N                                   //
			//                                                                //
			////////////////////////////////////////////////////////////////////

			
			
			function  initialize() {
				
				console.log('[THREEPX] initialization start');
								
				camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
				
				scene = new THREE.Scene();
				scene.add(camera);
				
				renderer = new THREE.WebGLRenderer({
					alpha: true,
					antialias: true
				});
				renderer.setClearColor(0x000000, 0);
				renderer.domElement.className = 'threepx';
				
				if (debug) {
					initializeDebug();
				}
				
				console.log('[THREEPX] initialization ended');
				
				sizeRefererChanged = true;
				setActivated(true);
			}
			
			
			function initializeDebug() {
				
				var material = new THREE.MeshBasicMaterial({
						color: 0xFFFFFF,
						transparent: true,
						opacity: 0.5
					}),
					cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
					wireframeMaterial = new THREE.MeshBasicMaterial({
						wireframe: true,
						color: 'blue'
					})
				;

				plane = new THREE.Mesh(
					new THREE.PlaneGeometry(1, 1),
					material
				);
				
				plane100 = new THREE.Mesh(
					new THREE.PlaneGeometry(100,100),
					material
				);
				
				cubeTL = new THREE.Mesh(cubeGeometry, wireframeMaterial);
				cubeTR = new THREE.Mesh(cubeGeometry, wireframeMaterial);
				cubeBL = new THREE.Mesh(cubeGeometry, wireframeMaterial);
				cubeBR = new THREE.Mesh(cubeGeometry, wireframeMaterial);
				
				cubeTL.position.z =
				cubeTR.position.z =
				cubeBL.position.z =
				cubeBR.position.z = -cubeHalfSize;
				
				scene.add(plane);
				scene.add(plane100);
				scene.add(cubeTL);
				scene.add(cubeTR);
				scene.add(cubeBL);
				scene.add(cubeBR);
			}



			
			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  R E N D E R I N G                                             //
			//                                                                //
			////////////////////////////////////////////////////////////////////
			
			
			
			function render(timestamp) {
				
				var currentWidth = sizeReferer.clientWidth,
					currentHeight = sizeReferer.clientHeight,
					currentPerspective = getVendorStyleProperty('perspective')
				;
				
				
				if (autoResize) {
					viewChanged = currentWidth !== width ||
					              currentHeight !== height ||
					              currentPerspective !== perspective;
										
					width = currentWidth;
					height = currentHeight;
					perspective = currentPerspective;
				}
				
				if (sizeRefererChanged || viewChanged) {
					updateView(currentWidth, currentHeight, currentPerspective);
					
					if (debug) {
						updateDebug(width, height);
					}
				}
				
				userNeedRender = renderFunction && renderFunction(timestamp, width, height) === true;
				
				if (sizeRefererChanged || viewChanged || userNeedRender) {
					renderer.render(scene, camera);
					sizeRefererChanged = false;
				}
				
				
				// Clean tags
				sizeRefererChanged = false;
				viewChanged = false;
				userNeedRender = false;
				
				if (activated) {
					requestAnimationFrame(render);
				}

			}
			
			
			function updateView(width, height, perspective) {
				
				renderer.setSize(width, height);
		
				camera.fov = fov = Math.atan( height / ( 2 * perspective ) ) * twoRadians;
				camera.aspect = ratio = width / height;
				camera.position.set(0,0,perspective);
				camera.updateProjectionMatrix();
				
			}
			
			
			function updateDebug(width, height) {
				
				var halfWidth = width/2,
					halfHeight = height/2,
					left   = cubeHalfSize - halfWidth,
					right  = halfWidth - cubeHalfSize,
					top    = cubeHalfSize - halfHeight,
					bottom = halfHeight - cubeHalfSize
				;
								
				cubeTL.position.set(left, top, -cubeHalfSize);
				cubeTR.position.set(right, top, -cubeHalfSize);
				cubeBL.position.set(left, bottom, -cubeHalfSize);
				cubeBR.position.set(right, bottom, -cubeHalfSize);
								
				plane.scale.set(width, height, 1);
				
			}




			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  T O O L S                                                     //
			//                                                                //
			////////////////////////////////////////////////////////////////////



			function parseOptions() {
				
				if (options) {
					sizeReferer = options.sizeReferer || wrapper;
					autoResize = options.autoResize || autoResize;
					configurable = options.configurable || configurable;
					debug =  options.debug || debug;
				} else {
					sizeReferer = wrapper;
				}
				
			}
			
			
			function getVendorStyleProperty(name) {
				
				var style = window.getComputedStyle(wrapper),
					perspective
				;
				
				perspective = parseInt(
					style.getPropertyValue('-webkit-' + name) ||
					style.getPropertyValue('-moz-' + name) ||
					style.getPropertyValue(name)
				);
				
				if (isNaN(perspective)) {
					perspective = defaultPerspective;
					wrapper.style.webkitPerspective = defaultPerspective + 'px';
					wrapper.style.mozPerspective = defaultPerspective + 'px';
					wrapper.style.perspective = defaultPerspective + 'px';
				}
				
				console.log(perspective);
				
				return perspective;
			}
									
		}
		
		
	});
	
	
})(this);