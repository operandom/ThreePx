/*!
 * @author Operandom (Valéry Herlaud)
 * @licence MIT
 */

(function(root) {
	
	'use strict';
	var define = root.define,
		isNode = typeof module === 'object' && typeof module.exports === 'object',
		isAMD  = typeof define === 'function' && define.amd
		;
		
	if (isNode) {
		console.log('[THREEPX] Nodejs detected');
		define = function (requirements, factory) {
			module.export = factory(require('three'));
		};
	}
	
	if (isAMD) {
		console.log('[THREEPX] AMD detected.');
	}
	
	if (!isNode && !isAMD) {
		console.log('[THREEPX] Root injection');
		define = function (fakeRequirements, factory) { root.THREEPX = factory(THREE); };
	}
	
	
	// Requirejs
	
	define(['three'], function (THREE) {
		
		console.log('[THREEPX] class defined.');
		
		return THREEPX;
		
		/**
		 * ThreePx synchronises the three.js frustrum with that of the CSS.
		 * 
		 * @class THREEPX
		 * @constructor
		 * 
		 * @param {HTMLElement} wrapper
		 * @param {Object} options
		 */
		function THREEPX (wrapper, options) { //@TODO group options
			
			var self = this,
				defaultPerspective = 2000,
				
				explicitWidth,
				explicitHeight,
				
				// Options
				configurable = false,
				autoInitializeThreejs = true,
				autoResize = true,
				debug = false,
				
				renderFunction,
				
				// View
				perspective, width, height, fov, ratio,

				// Flags
				canBeUsed, enabled, forceResize, userNeedRender,
				explicitWidthChanged, explicitHeightChanged,
				wrapperChanged, sceneChanged, rendererChanged, cameraChanged,
				viewChanged,

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
					canBeUsed: {
						configurable: configurable,
						enumerable: true,
						get: getCanBeUsed
					},
					enabled: {
						configurable: configurable,
						enumerable: true,
						get: getEnabled,
						set: setEnabled
					},
					width: {
						configurable: configurable,
						enumerable: true,
						get: getWidth,
					},
					height: {
						configurable: configurable,
						enumerable: true,
						get: getHeight,
					},
					explicitWidth: {
						configurable: configurable,
						enumerable: true,
						get: getExplicitWidth,
						set: setExplicitWidth
					},
					explicitHeight: {
						configurable: configurable,
						enumerable: true,
						get: getExplicitHeight,
						set: setExplicitHeight
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
					wrapperChanged: {
						configurable: configurable,
						enumerable: true,
						get:wrapperChanged
					},
					wrapper: {
						configurable: configurable,
						enumerable: true,
						get: getWrapper,
						set: setWrapper
					},
					sceneChanged: {
						configurable: configurable,
						enumerable: true,
						get: getSceneChanged
					},
					scene: {
						configurable: configurable,
						enumerable: true,
						get: getScene,
						set: setScene
					},
					rendererChanged: {
						configurable: configurable,
						enumerable: true,
						get: getRendererChanged
					},
					renderer: {
						configurable: configurable,
						enumerable: true,
						get: getRenderer,
						set: setRenderer
					},
					camera: {
						configurable: configurable,
						enumerable: true,
						get: getCamera,
						set: setCamera
					},
					cameraChanged: {
						configurable: configurable,
						enumerable: true,
						get: getCameraChanged,
					}

					
				});
				
			}




			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  A P I   M E T H O D S                                         //
			//                                                                //
			////////////////////////////////////////////////////////////////////

			
			
			function getCanBeUsed() {
				return canBeUsed;
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
			
			
			
			// enabled


			function getEnabled() {
				return enabled;
			}


			function setEnabled(value) {

				if (enabled !== value && (enabled = !!value)) {
					requestAnimationFrame(render);
				}

			}
			
			
			
			// autoresize


			function getAutoResize() {
				return autoResize;
			}


			function setAutoResize(value) {
				autoResize = !!value;
			}
			
			
			
			// renderFunction


			function getRenderFunction() {
				return renderFunction;
			}


			function setRenderFunction(value) {
				renderFunction = value;
			}



			// width


			function getWidth() {
				return width;
			}



			// height


			function getHeight() {
				return height;
			}



			// explicitWidth


			function getExplicitWidth() {
				return explicitWidth;
			}


			function setExplicitWidth(value) {

				value = valueToInt(value);

				if (explicitWidth !== value) {
					explicitWidth = value;
					explicitWidthChanged = true;
				}

			}



			// explicitHeight


			function getExplicitHeight() {
				return explicitHeight;
			}


			function setExplicitHeight(value) {
				
				value = valueToInt(value);

				if (explicitHeight !== value) {
					explicitHeight = value;
					explicitWidthChanged = true;
				}

			}

			
			
			// wrapper
			
			
			function getWrapperChanged() {
				return wrapperChanged;
			}
			
			
			function getWrapper() {
				return wrapper;
			}
			
			
			function setWrapper(value) {
				
				if (wrapper !== value) {
					cleanWrapper();
					wrapper = value;
					updateWrapper();
					wrapperChanged = true;
				}
				
			}
			
			
			
			// scene
						
			
			function getSceneChanged() {
				return sceneChanged;
			}
			
			
			function getScene() {
				return scene;
			}
			
			
			function setScene(value) {
				
				if (scene !== value) {
					cleanScene();
					scene = value;
					updateScene();
					sceneChanged = true;
				}
				
			}
			
			
			
			// renderer
			
			
			function getRendererChanged() {
				return rendererChanged;
			}
			
			
			function getRenderer() {
				return renderer;
			}


			function setRenderer(value) {
				
				if (renderer !== value) {
					cleanRenderer();
					renderer = value;
					updateRenderer();
					rendererChanged = true;
				}
				
			}
			
			
			
			// camera
			
			
			function getCameraChanged() {
				return cameraChanged;
			}


			function getCamera() {
				return renderer;
			}


			function setCamera(value) {
				
				if (camera !== value) {
					cleanCamera();
					camera = value;
					updateCamera();
					cameraChanged = true;
				}
				
			}




			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  U P D A T E   &   C L E A N I N G                             //
			//                                                                //
			////////////////////////////////////////////////////////////////////


			
			function updateWrapper() {
				addDomElementToWrapper();
			}
			
			
			function cleanWrapper() {
				removeDomElementFromWrapper();
			}


			function updateScene() {
				addCameraToScene();
			}


			function cleanScene() {
				removeCameraFromScene();
			}


			function updateRenderer() {
				addDomElementToWrapper();
				synchronizeRendererWithCamera();
			}


			function cleanRenderer() {
				removeDomElementFromWrapper();
			}


			function updateCamera() {
				synchronizeRendererWithCamera();
			}


			function cleanCamera() {
			}



			
			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  I N I T I A L I Z A T I O N                                   //
			//                                                                //
			////////////////////////////////////////////////////////////////////

			
			
			function  initialize() {
				
				setCanBeUsed();
				
				if (canBeUsed) {

					console.log('[THREEPX] initialization start');

					if (autoInitializeThreejs) {
						initializeThreejs();
					}

					if (debug) {
						initializeDebug();
					}

					wrapperChanged = true;
					forceResize = true;
					setEnabled(true);

					console.log('[THREEPX] initialization ended');

				}
				
			}
			
			
			function initializeThreejs() {
				
				console.log('[THREEPX] Auto initialize Three.js components.');
				
				
				// Camera
				setCamera(new THREE.PerspectiveCamera(fov, ratio, 1, 10000));
				
				
				// Scene
				setScene(new THREE.Scene());
				
				
				// Renderer
				setRenderer(new THREE.WebGLRenderer({
					alpha: true,
					antialias: true
				}));

			}


			function initializeDebug() {

				console.log('[THREEPX] initialize debug components');
				
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
				
				if (wrapper && scene && renderer && camera) {

					var currentWidth,
						currentHeight,
						currentPerspective
					;
					
					currentWidth = explicitWidth;
					currentHeight = explicitHeight;
					currentPerspective = getComputedPerspective();

					
					if (autoResize || forceResize) {
						
						if (currentWidth == null) {
							currentWidth = wrapper.clientWidth;
						}
						
						if (currentHeight == null) {
							currentHeight = wrapper.clientHeight;
						}
					}
					
					
					if (explicitWidthChanged || explicitHeightChanged || autoResize || forceResize) {

						viewChanged = currentWidth !== width ||
							currentHeight !== height ||
							currentPerspective !== perspective;

					}

					
					if (viewChanged) {
						
						width = currentWidth;
						height = currentHeight;
						perspective = currentPerspective;
						
						updateView(currentWidth, currentHeight, currentPerspective);

						if (debug) {
							updateDebug(width, height);
						}
						
					}

					userNeedRender = renderFunction && renderFunction(timestamp, width, height) === true;

					if (viewChanged || userNeedRender) {
						renderer.render(scene, camera);
					}


					// Clean tags
					explicitWidthChanged  = false;
					explicitHeightChanged = false;
					wrapperChanged        = false;
					sceneChanged          = false;
					rendererChanged       = false;
					cameraChanged         = false;
					viewChanged           = false;
					userNeedRender        = false;
					forceResize           = false;

				}

				if (enabled) {
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



			function setCanBeUsed() {
				var value = false,
					canvas = document.createElement('canvas');
				
				value = canvas.getContext && canvas.getContext('webgl');
				value = value && requestAnimationFrame && typeof requestAnimationFrame === 'function';
				
				canBeUsed = value;
				
				if (!value) {
					console.log('[THREEPX] Cannot be used.');
				}
			}
			
			
			function parseOptions() {
				
				if (options) {
					autoResize = typeof options.autoResize === 'boolean' ? options.autoResize : autoResize;
					configurable = options.configurable || configurable;
					debug =  options.debug || debug;
					autoInitializeThreejs = typeof options.autoInitializeThreejs === 'boolean' ? options.autoInitializeThreejs : autoInitializeThreejs;
				}
			}
			
			
			function getComputedPerspective() {
				
				var propertyName = 'perspective',
					property = parseInt(getComputedCSSProperty(propertyName));
				
				if (isNaN(property)) {
					setVendorCSSProperty(propertyName, defaultPerspective + 'px');
					property = defaultPerspective;
				}
								
				return property;
			}
			
			
			function getComputedPerspectiveOrigin() {
				
				
				var propertyName = 'perspective-origin',
					property = parseInt(getComputedCSSProperty(propertyName));

				//@TODO getComputedPerspectiveOrigin

				return property;
			}
			
			
			function getComputedCSSProperty(name) {
								
				var style = window.getComputedStyle(wrapper),
					property = style.getPropertyValue(name) ||
					           style.getProperty('-webkit-' + name) ||
					           style.getProperty('-moz-' + name);					
				
				return property;
			}
			
			
			function setVendorCSSProperty(name, value) {
				
				var Name = formatForVendor(name),
					style = wrapper.style;
				
				style['webkit' + Name] = value;
				style['moz' + Name] = value;
				style[name] = value;
				
			}
			
			
			function formatForVendor(string) {
				
				return string.split('-').map(function (part) {
					return part.charAt(0).toUpperCase() + part.substring(1);
				}).join('');
				
			}
			
			
			function addDomElementToWrapper() {

				if (wrapper && renderer) {
					wrapper.insertBefore(renderer.domElement, wrapper.firstChild);
				}

			}
			
			function removeDomElementFromWrapper() {

				if (wrapper && renderer) {
					wrapper.removeChild(renderer.domElement);
				}

			}


			function addCameraToScene() {

				if (scene && camera) {
					scene.add(camera);
				}

			}


			function removeCameraFromScene() {

				if (scene && camera) {
					scene.remove(camera);
				}

			}
			
			
			function synchronizeRendererWithCamera() {
				
				if (autoInitializeThreejs && renderer && camera) {
					renderer.shadowCameraFar = camera.far;
				}
				
			}
			
			
			function valueToInt(value) {
				
				value = parseInt(value);
				
				if (isNaN(value)) {
					value = null;
				}
				
				return value;
				
			}

		}
		
		
	});
	
	
})(this);