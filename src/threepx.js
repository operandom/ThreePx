/*!
 * Copyright (c) 2014 Valéry Herlaud. Licensed under the MIT license.
 * See the file LICENSE.md in this distribution for more details.
 */

(function(root) {

	'use strict';

	var version = '0.1.1',
		define = root.define,
		isNode = typeof module === 'object' && typeof module.exports === 'object',
		isAMD  = typeof define === 'function' && define.amd
		;

	console.log('ThreePx v' + version);

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

		console.log('[THREEPX] Class defined.');

		defineStaticAPI();

		return THREEPX;

		/**
		 * ThreePx synchronises the [three.js](href="http://threejs.org/")
		 * frustrum with that of the CSS.<br>
		 * See working examples in the examples folder.
		 *
		 * @class THREEPX
		 * @constructor
		 *
		 * @param {HTMLElement} wrapper The `THREEPX.renderer.domElement`
		 *    will be added at position 0 of the wrapper.
		 * @param {Object} [options] The default options are:
		 *  * __configurable:__ `false`<br>
		 *    Enable this option to override if you want override the API.
		 *  * __autoInitializeThreejs:__ `true`<br>
		 *    Enable or disable the creation of the scene, the renderer
		 *    and the camera on the new ThreePx instance.
		 *  * __autoResize:__ `true`<br>
		 *    Enable or disable the bind between the wrapper size and
		 *    the `THREEPX.renderer.domElement`.
		 *  * __debug:__ `false`<br>
		 *    Enable or disable some three.js elements added to the scene to debug.
		 *
		 * @example
		 *       var wrapperElement = document.getElementById('wrapper'),
		 *           threepx = new THREEPX(wrapperElement),
		 *           mesh = new THREE.Mesh(
		 *               // define your mesh
		 *           )
		 *       ;
		 *
		 *       threepx.scene.add(mesh);
		 *
		 *       var lastTimestamp = new Date();
		 *
		 *       threepx.renderFunction  = function (timestamp, width, height) {
		 *
		 *           var delta = timestamp - lastTimestamp,
		 *               angle = 0.02 * delta * 2 * Math.PI / 1000
		 *           ;
		 *
		 *           mesh.rotation.x += angle;
		 *           mesh.rotation.y += angle;
		 *
		 *           mesh.position.set(100 + width/2, 100 - height/2, 0);
		 *
		 *           lastTimestamp = timestamp;
		 *
		 *           return true;
		 *       }
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
				translateX = 0,
				translateY = 0,
				translateZ = 0,
				rotateX = 0,
				rotateY = 0,
				rotateZ = 0,

				// Flags
				enabled, forceResize, userNeedRender,
				explicitWidthChanged, explicitHeightChanged,
				wrapperChanged, sceneChanged, rendererChanged, cameraChanged,
				viewChanged,
				transformChanged, translateChanged, rotateChanged,

				// THREE
				scene, camera, renderer,
				twoRadians = 360 / Math.PI,

				// Debug
				plane, plane100,
				cubeTL, cubeTR, cubeBL, cubeBR,
				cubeSize = 100,
				cubeHalfSize = cubeSize/2
			;




			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  S U M M A R Y                                                 //
			//                                                                //
			////////////////////////////////////////////////////////////////////



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
					
					version: {
						configurable: configurable,
						enumerable: true,
						get: getVersion
					},
					enabled: {
						configurable: configurable,
						enumerable: true,
						get: getEnabled,
						set: setEnabled
					},
					
					
					// Size
					
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
					
					
					// View
					
					viewChanged: {
						configurable: configurable,
						enumerable: true,
						get: getViewChanged
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
					
					
					// User function
					
					renderFunction: {
						configurable: configurable,
						enumerable: true,
						get: getRenderFunction,
						set: setRenderFunction
					},
					
					
					// Wrapper
					
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
					
					
					// three.js components
					
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
					},
					
					
					// Transform
					
					transformChanged: {
						configurable: configurable,
						enumerable: true,
						get: getTransformChanged,
					},
					translateX: {
						configurable: configurable,
						enumerable: true,
						get: getTranslateX,
						set: setTranslateX
					},
					translateY: {
						configurable: configurable,
						enumerable: true,
						get: getTranslateY,
						set: setTranslateY
					},
					translateZ: {
						configurable: configurable,
						enumerable: true,
						get: getTranslateZ,
						set: setTranslateZ
					},
					translate: {
						configurable: configurable,
						enumerable: true,
						writable: configurable,
						value: translate
					},
					rotateX: {
						configurable: configurable,
						enumerable: true,
						get: getRotateX,
						set: setRotateX
					},
					rotateY: {
						configurable: configurable,
						enumerable: true,
						get: getRotateY,
						set: setRotateY
					},
					rotateZ: {
						configurable: configurable,
						enumerable: true,
						get: getRotateZ,
						set: setRotateZ
					},
					rotate: {
						configurable: configurable,
						enumerable: true,
						writable: configurable,
						value: rotate
					},

				});

			}




			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  A P I   M E T H O D S                                         //
			//                                                                //
			////////////////////////////////////////////////////////////////////



			/**
			 * The version of ThreePx.
			 *
			 * @property version
			 * @type {String}
			 * @readOnly
			 */
			function getVersion() {
				return version;
			}


			/**
			 * The field of view given for the perspective property.
			 *
			 * @property fov
			 * @type {Float}
			 * @readOnly
			 */
			function getFov() {
				return fov;
			}


			/**
			 * The perspective parse from the wrapper CSS.
			 *
			 * @property perspective
			 * @type {Float}
			 * @default 2000 if CSS perspective is not defined for the wrapper.
			 * @readOnly
			 */
			function getPerspective() {
				return perspective;
			}


			/**
			 * Set to true if the view changed during the frame.
			 *
			 * @property viewChanged
			 * @type {Bollean}
			 * @readOnly
			 */
			function getViewChanged() {
				return viewChanged;
			}


			/**
			 * Enable or disable the rendering.
			 *
			 * @property enable
			 * @type {Boolean}
			 * @default true
			 */
			function getEnabled() {
				return enabled;
			}


			function setEnabled(value) {

				if (enabled !== value && (enabled = !!value)) {
					requestAnimationFrame(render);
				}

			}


			/**
			 * If autoResize is set to true,
			 * the size of the `THREEPX.renderer.domElement` is bind
			 * to the wrapper size.

			 * *This property can be set in the options passed to the constructor.*
			 *
			 * @property autoResize
			 * @type {Bollean}
			 * @default true
			 */
			function getAutoResize() {
				return autoResize;
			}


			function setAutoResize(value) {
				autoResize = !!value;
			}


			/**
			 * An user function called at the end of the render process.
			 * The function must return true to make the renderer render.
			 *
			 * @example
			 *     threepx.renderFunction = function (timestamp, width, height) {
			 *         cube.rotation.y += 0.01;
			 *         return true;
			 *     }
			 * @property renderFunction
			 * @type {Function}
			 */
			function getRenderFunction() {
				return renderFunction;
			}


			function setRenderFunction(value) {
				renderFunction = value;
			}


			/**
			 * The actual width of the `THREEPX.renderer.domElement`.<br>
			 * If explicitWidth property is null or undefined,
			 * the width is equal to the `THREEPX.wrapper.clientWidth`
			 * else the width is equal to explicitWidth property.
			 *
			 * @property width
			 * @type {Integer}
			 * @readOnly
			 */
			function getWidth() {
				return width;
			}


			/**
			 * The actual height of the `THREEPX.renderer.domElement`.<br>
			 * If explicitHeight property is null or undefined,
			 * the width is equal to the `THREEPX.wrapper.clientHeight`
			 * else the height is equal to explicitHeight property.
			 *
			 * @property height
			 * @type {Integer}
			 * @readOnly
			 */
			function getHeight() {
				return height;
			}


			/**
			 * If the explicit width is not null or not undefined,
			 * the width is set tho the explicit width
			 * and the autoResize is not effective for the width.<br>
			 *
			 * *Update the value will generate a three.js render.*
			 *
			 * @property explicitWidth
			 * @type {Integer}
			 * @default undefined
			 */
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


			/**
			 * If the explicit height is not null or not undefined,
			 * the height is set tho the explicit height
			 * and the autoResize is not effective for the height.<br>
			 *
			 * *Update the value will generate a three.js render.*
			 *
			 * @property explicitHeight
			 * @type {Integer}
			 * @default undefined
			 */
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


			/**
			 * Set to true if the wrapper changed during the frame.
			 *
			 * @property wrapperChanged
			 * @type {Boolean}
			 * @readOnly
			 */
			function getWrapperChanged() {
				return wrapperChanged;
			}


			/**
			 * The wrapper used by the instance of ThreePx.
			 *
			 * @property wrapper
			 * @type {HTMLElement}
			 */
			function getWrapper() {
				return wrapper;
			}


			function setWrapper(value) {

				if (wrapper !== value) {
					cleanWrapper();
					wrapper = value;
					prepareWrapper();
					wrapperChanged = true;
				}

			}


			/**
			 * A flag to know if the scene has changed during the frame.
			 *
			 * @property sceneChanged
			 * @type {Boolean}
			 * @readOnly
			 */
			function getSceneChanged() {
				return sceneChanged;
			}


			/**
			 * The three.js [scene](http://threejs.org/docs/#Reference/Scenes/Scene)
			 * used by the instance of ThreePx.
			 *
			 * *Camera will be automatically added to scene.*
			 *
			 * @property scene
			 * @type {THREE.Scene}
			 */
			function getScene() {
				return scene;
			}


			function setScene(value) {

				if (scene !== value) {
					cleanScene();
					scene = value;
					prepareScene();
					sceneChanged = true;
				}

			}


			/**
			 * A flag to know if the renderer has changed during the frame.
			 *
			 * @property rendererChanged
			 * @type {Boolean}
			 * @readOnly
			 */
			function getRendererChanged() {
				return rendererChanged;
			}


			/**
			 * The three.js [renderer](http://threejs.org/docs/#Reference/Renderers/WebGLRenderer)
			 * used by the instance of ThreePx.
			 *
			 * @property renderer
			 * @type {THREE.WebGLRenderer}
			 */
			function getRenderer() {
				return renderer;
			}


			function setRenderer(value) {

				if (renderer !== value) {
					cleanRenderer();
					renderer = value;
					prepareRenderer();
					rendererChanged = true;
				}

			}


			/**
			 * A flag to know if the camera has changed during the frame.
			 *
			 * @property cameraChanged
			 * @readOnly
			 * @type {Boolean}
			 */
			function getCameraChanged() {
				return cameraChanged;
			}


			/**
			 * The three.js [camera](http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera)
			 * used by the instance of ThreePx.
			 *
			 * *Camera will be automatically added to scene.*
			 *
			 * @property camera
			 * @type {THREE.PerspectiveCamera}
			 */
			function getCamera() {
				return renderer;
			}


			function setCamera(value) {

				if (camera !== value) {
					cleanCamera();
					camera = value;
					prepareCamera();
					cameraChanged = true;
				}

			}
			
			
			/**
			 * A flag to know if translation or rotation have changed during this frame.
			 * 
			 * @property transformChanged
			 * @type {Boolean}
			 */
			function getTransformChanged() {
				return transformChanged;
			}


			/**
			 * Equivalent to CSS translate3d
			 *
			 * @method translate
			 * @param {Float} x Specifies the 3D translation in the x direction.
			 * @param {Float} y Specifies the 3D translation in the y direction.
			 * @param {Float} z Specifies the 3D translation in the z direction.
			 */
			function translate (x,y,z) {
				setTranslateX(x);
				setTranslateY(y);
				setTranslateZ(z);
			}


			/**
			 * Specifies the 3D translation in the x direction
			 * 
			 * @property translateX
			 * @type {Float}
			 */
			function getTranslateX() {
				return translateX;
			}


			function setTranslateX(value) {

				value = value || 0;
				
				if (translateX !== value) {
					translateX = value;
					translateChanged = true;
					transformChanged = true;
				}

			}


			/**
			 * Specifies the 3D translation in the y direction
			 * 
			 * @property translateY
			 * @type {Float}
			 */
			function getTranslateY() {
				return translateY;
			}


			function setTranslateY(value) {

				value = value || 0;

				if (translateY !== value) {
					translateY = value;
					translateChanged = true;
					transformChanged = true;
				}

			}


			/**
			 * Specifies the 3D translation in the z direction
			 * 
			 * @property translateZ
			 * @type {Float}
			 */
			function getTranslateZ() {
				return translateZ;
			}


			function setTranslateZ(value) {

				value = value || 0;

				if (translateZ !== value) {
					translateZ = value;
					translateChanged = true;
					transformChanged = true;
				}

			}


			/**
			 * Equivalent to CSS rotate3d
			 *
			 * @method rotate
			 * @param {Float} x Specifies the 3D translation in the x direction.
			 * @param {Float} y Specifies the 3D translation in the y direction.
			 * @param {Float} z Specifies the 3D translation in the z direction.
			 */
			function rotate (x,y,z) {
				setRotateX(x);
				setRotateY(y);
				setRotateZ(z);
			}


			/**
			 * Specifies the 3D translation in the x direction
			 * 
			 * @property rotateX
			 * @type {Float}
			 */
			function getRotateX() {
				return rotateX;
			}


			function setRotateX(value) {

				value = value || 0;

				if (rotateX !== value) {
					rotateX = value;
					rotateChanged = true;
					transformChanged = true;
				}

			}


			/**
			 * Specifies the 3D translation in the y direction
			 * 
			 * @property rotateY
			 * @type {Float}
			 */
			function getRotateY() {
				return rotateY;
			}


			function setRotateY(value) {

				value = value || 0;

				if (rotateY !== value) {
					rotateY = value;
					rotateChanged = true;
					transformChanged = true;
				}

			}


			/**
			 * Specifies the 3D rotation in the z direction
			 * 
			 * @property rotateZ
			 * @type {Float}
			 */
			function getRotateZ() {
				return rotateZ;
			}


			function setRotateZ(value) {

				value = value || 0;

				if (rotateZ !== value) {
					rotateZ = value;
					rotateChanged = true;
					transformChanged = true;
				}

			}





			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  P R E P A R E   &   C L E A N                                 //
			//                                                                //
			////////////////////////////////////////////////////////////////////



			function prepareWrapper() {
				addDomElementToWrapper();
			}


			function cleanWrapper() {
				removeDomElementFromWrapper();
			}


			function prepareScene() {
				addCameraToScene();
			}


			function cleanScene() {
				removeCameraFromScene();
			}


			function prepareRenderer() {
				addDomElementToWrapper();
				synchronizeRendererWithCamera();
			}


			function cleanRenderer() {
				removeDomElementFromWrapper();
			}


			function prepareCamera() {
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

				if (THREEPX.canBeUsed) {

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

				} else {
					console.log('[THREEPX] Cannot be initialized because the requirements are not satisfied.');
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

					
					// TODO update camera after renderFunction
					if (viewChanged) {

						width = currentWidth;
						height = currentHeight;
						perspective = currentPerspective;

						updateView();

						if (debug) {
							updateDebug(width, height);
						}

					}

					userNeedRender = renderFunction && renderFunction(timestamp, width, height) === true;
					
					if (transformChanged) {
						updateCameraTransform();
					}

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
					rotateChanged         = false;
					translateChanged      = false;

				}

				if (enabled) {
					requestAnimationFrame(render);
				}

			}
			
			
			function updateProperties() {
			}


			function updateView() {

				renderer.setSize(width, height);

				camera.fov = fov = Math.atan( height / ( 2 * perspective ) ) * twoRadians;
				camera.aspect = ratio = width / height;
				
				updateCameraTransform();
				
			}
			
			
			function updateCameraTransform() {
				
				camera.position.set(translateX, translateY, translateZ + perspective);
				camera.rotation.set(rotateX, rotateY, rotateZ);
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




		function defineStaticAPI() {

			Object.defineProperties(THREEPX, {
				version: {
					configurable: true,
					enumareable: true,
					get: getVersion
				},
				canBeUsed: {
					configurable: true,
					enumareable: true,
					get: getCanBeUsed
				}
			});




			////////////////////////////////////////////////////////////////////
			//                                                                //
			//  S T A T I C   A P I   M E T H O D S                           //
			//                                                                //
			////////////////////////////////////////////////////////////////////



			/**
			 * The version of ThreePx.
			 *
			 * @property version
			 * @type {String}
			 * @static
			 * @readOnly
			 */
			function getVersion() {
				return version;
			}


			/**
			 * ThreePx need WebGL and requestAnimationFrame() to be used.
			 * If these requirements are not satisfied canBeUsed property is set to false.
			 *
			 * @property canBeUsed
			 * @type {Boolean}
			 * @static
			 * @readOnly
			 */
			function getCanBeUsed() {
				var canBeUsed,
					canvas = document.createElement('canvas'),
					vendors = ['webkit', 'moz', 'ms', 'o'];


				// from https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js
				canBeUsed = !!(function () { try { return !! window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')); } catch(e) { return false; }})();

				// from https://gist.github.com/paulirish/1579671
				for(var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
					window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
				}

				canBeUsed = canBeUsed && window.requestAnimationFrame;

				return canBeUsed;
			}
		}
	});


})(this);
