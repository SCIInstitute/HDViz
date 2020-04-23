import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { withDSXContext } from '../dsxContext';

/**
 * Creates Morse-Smale decomposition
 */
class MorseSmaleWindow extends React.Component {
  /**
   * Creates Morse-Smale window object
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.client = this.props.dsxContext.client;

    this.init = this.init.bind(this);
    this.createControls = this.createControls.bind(this);
    this.updateCamera = this.updateCamera.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.mouseRelease = this.mouseRelease.bind(this);
    this.getCanvasPosition = this.getCanvasPosition.bind(this);
    this.getPickPosition = this.getPickPosition.bind(this);
    this.pick = this.pick.bind(this);
    this.addRegressionCurvesToScene = this.addRegressionCurvesToScene.bind(this);
    this.addExtremaToScene = this.addExtremaToScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.resetScene = this.resetScene.bind(this);
  }

  /**
   * Called by react when this component mounts.
   * Initializes Three.js for drawing and adds event listeners.
   */
  componentDidMount() {
    this.init();
    window.addEventListener('resize', this.resizeCanvas);
    this.refs.msCanvas.addEventListener('mousedown', this.mouseRelease, { passive:true });
  }

  /**
   * Called by react when this component receives new props or context or
   * when the state changes.
   * The data needed to draw the Morse-Smale decomposition it fetched here.
   * @param {object} prevProps
   * @param {object} prevState
   * @param {object} prevContext
   */
  componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.props.decomposition === null) {
      return;
    }

    if (this.props.numberOfWindows !== prevProps.numberOfWindows) {
      this.resizeCanvas();
    }

    if (prevProps.decomposition === null
      || this.isNewDecomposition(prevProps.decomposition, this.props.decomposition)) {
      this.resetScene();
      // object unpacking (a javascript thing, props is inherited from the React component)
      const { datasetId, k, persistenceLevel } = this.props.decomposition;
      const category = this.props.decomposition.decompositionCategory;
      const field = this.props.decomposition.decompositionField;
      Promise.all([
        this.client.fetchMorseSmaleRegression(datasetId, category, field, k, persistenceLevel),
        this.client.fetchMorseSmaleExtrema(datasetId, category, field, k, persistenceLevel),
      ]).then((response) => {
        const [regressionResponse, extremaResponse] = response;
        this.regressionCurves = regressionResponse;
        this.addRegressionCurvesToScene(regressionResponse);
        this.addExtremaToScene(extremaResponse.extrema);
        this.renderScene();

        if (this.pickedObject) {
          let crystalID = this.pickedObject.name;
          this.client.fetchCrystalPartition(datasetId, persistenceLevel, crystalID).then((result) => {
            this.props.onCrystalSelection(result.crystalSamples);
          });
        }
      });
    }
  }

  /**
   * Called by React when this component is removed from the DOM.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeCanvas);
    this.refs.msCanvas.removeEventListener('mousedown', this.mouseRelease);
  }

  /**
   * If any of the decomposition settings have changed returns true
   * for new decomposition
   * @param {object} prevDecomposition - the previous decomposition
   * @param {object} currentDecomposition - the current decomposition
   * @return {boolean} true if any of the decomposition settings have changed.
   */
  isNewDecomposition(prevDecomposition, currentDecomposition) {
    return (prevDecomposition.datasetId !== currentDecomposition.datasetId
        || prevDecomposition.decompositionCategory !== currentDecomposition.decompositionCategory
        || prevDecomposition.decompositionField !== currentDecomposition.decompositionField
        || prevDecomposition.decompositionMode !== currentDecomposition.decompositionMode
        || prevDecomposition.k !== currentDecomposition.k
        || prevDecomposition.persistenceLevel !== currentDecomposition.persistenceLevel);
  }

  /**
   * Initializes the renderer, camera, and scene for Three.js.
   */
  init() {
    // canvas
    let canvas = this.refs.msCanvas;
    let gl = canvas.getContext('webgl');

    // scene
    this.scene = new THREE.Scene();

    // renderer
    this.renderer = new THREE.WebGLRenderer({ canvas:canvas, context:gl });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // camera and controls
    this.camera = new THREE.OrthographicCamera();
    this.camera.zoom = 2.5;
    this.camera.position.set(0, -1, 0.5);
    this.camera.up.set(0, 0, 1);
    this.updateCamera(canvas.clientWidth, canvas.clientHeight);

    // light
    this.ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    this.frontDirectionalLight = new THREE.DirectionalLight(0xffffff);
    this.frontDirectionalLight.position.set(5, -1, 5);
    this.backDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.backDirectionalLight.position.set(-5, -1, -5);

    // picking
    this.pickedObject = undefined;
    this.raycaster = new THREE.Raycaster();

    // reset and render
    this.resetScene();
    this.renderScene();
  }

  /**
   * Initializes the controls.
   * ONLY CALL THIS ONCE, otherwise multiple controls send multiple move operations to camera.
   */
  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = this.camera.near;
    this.controls.maxDistance = this.camera.far;
    this.controls.target0.set(0, 0, 0.5);  // z is normalized [0,1], x/y are not normalized, so adjust target when loading new data (todo)
    this.controls.addEventListener( 'change', this.renderScene );
  }

  /**
   * Called when the canvas is resized.
   * This can happen on a window resize or when another window is added to dSpaceX.
   * @param {boolean} newWindowAdded
   */
  resizeCanvas(newWindowAdded = true) {
    let width = this.refs.msCanvas.clientWidth;
    let height = this.refs.msCanvas.clientHeight;

    this.refs.msCanvas.width = width;
    this.refs.msCanvas.height = height;

    // Resize renderer
    this.renderer.setSize(width, height, false );

    // update camera
    this.updateCamera(width, height, { resetPos:false });

    // Redraw scene with updates
    if (newWindowAdded) {
      this.renderScene();
    }
  }

  /**
   * Event handling for mouse click release
   * @param {Event} event
   */
  mouseRelease(event) {
    // Handle left click release
    if (event.button === 0) {
      const position = this.getPickPosition(event);
      this.pick(position, event.ctrlKey); // click w/ ctrl held down to produce model's original samples
    }
  }

  /**
   * Gets the click coordinates on the canvas - used for selecting crystal
   * @param {object} event
   * @return {{x: number, y: number}}
   */
  getCanvasPosition(event) {
    const rect = this.refs.msCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  /**
    * Converts pixel space to clip space
    * @param {object} event
    * @return {{x: number, y: number}}
    */
  getPickPosition(event) {
    const pos = this.getCanvasPosition(event);
    const canvas = this.refs.msCanvas;
    return {
      x: (pos.x / canvas.clientWidth) * 2 - 1,
      y: (pos.y / canvas.clientHeight) * -2 + 1,
    };
  }

  /**
   * Pick level set of decomposition
   * @param {object} normalizedPosition
   * @param {boolean} showOrig
   */
  pick(normalizedPosition, showOrig) {
    // Get intersected object
    const { datasetId, decompositionCategory, decompositionField, persistenceLevel } = this.props.decomposition;
    this.raycaster.setFromCamera(normalizedPosition, this.camera);
    let intersectedObjects = this.raycaster.intersectObjects(this.scene.children);
    intersectedObjects = intersectedObjects.filter((io) => io.object.name !== '');
    if (intersectedObjects.length) {
      // Update opacity to signify selected crystal
      if (this.pickedObject) {
        // Make sure have object in current scene
        this.pickedObject = this.scene.getObjectByName(this.pickedObject.name);
        this.pickedObject.material.opacity = 0.75;
        this.pickedObject = undefined;
      }
      this.pickedObject = intersectedObjects[0].object;
      this.pickedObject.material.opacity = 1;
      this.renderScene();

      // Get crystal partitions
      let crystalID = this.pickedObject.name;
      this.props.evalShapeoddsModelForCrystal(datasetId, decompositionCategory, decompositionField, persistenceLevel,
        crystalID, 50 /* numZ*/, showOrig);
      this.client.fetchCrystalPartition(datasetId, persistenceLevel, crystalID).then((result) => {
        this.props.onCrystalSelection(result.crystalSamples);
      });
    }
  }

  /**
   * Adds the regression curves to the scene
   * @param {object} regressionData
   */
  addRegressionCurvesToScene(regressionData) {
    regressionData.curves.forEach((regressionCurve, index) => {
      let curvePoints = [];
      regressionCurve.points.forEach((regressionPoint) => {
        curvePoints.push(new THREE.Vector3(regressionPoint[0], regressionPoint[1], regressionPoint[2]));
      });
      // Create curve
      let curve = new THREE.CatmullRomCurve3(curvePoints);
      let tubularSegments = 50;
      let curveGeometry = new THREE.TubeBufferGeometry(curve, tubularSegments, .02, 50, false);
      let count = curveGeometry.attributes.position.count;
      curveGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      let colors = regressionCurve.colors;
      let colorAttribute = curveGeometry.attributes.color;
      let color = new THREE.Color();
      for (let i = 0; i < curvePoints.length; ++i) {
        color.setRGB(colors[i][0], colors[i][1], colors[i][2]);
        for (let j = 0; j < tubularSegments; ++j) {
          colorAttribute.setXYZ(i*tubularSegments+j, color.r, color.g, color.b);
        }
      }
      let opacity = 0.75;
      if (this.pickedObject && parseInt(this.pickedObject.name) === index) {
        opacity = 1.00;
      }
      let curveMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        flatShading: true,
        vertexColors: THREE.VertexColors,
        transparent: true,
        opacity: opacity,
      });
      let curveMesh = new THREE.Mesh(curveGeometry, curveMaterial);
      curveMesh.name = index;
      this.scene.add(curveMesh);
    });
  }

  /**
   * Adds the extrema to the scene.
   * @param {object} extrema
   */
  addExtremaToScene(extrema) {
    extrema.forEach((extreme) => {
      let extremaGeometry = new THREE.SphereBufferGeometry(0.05, 32, 32);
      let color = new THREE.Color(extreme.color[0], extreme.color[1], extreme.color[2]);
      let extremaMaterial = new THREE.MeshLambertMaterial({ color:color });
      let extremaMesh = new THREE.Mesh(extremaGeometry, extremaMaterial);
      extremaMesh.translateX(extreme.position[0]);
      extremaMesh.translateY(extreme.position[1]);
      extremaMesh.translateZ(extreme.position[2]);
      this.scene.add(extremaMesh);
    });
  }

  /**
   * Draws the scene to the canvas.
   */
  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Resets the scene when there is new data by removing
   * the old scene children and adding back the lights.
   */
  resetScene() {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.scene.add(this.ambientLight);
    this.scene.add(this.frontDirectionalLight);
    this.scene.add(this.backDirectionalLight);

    this.updateCamera(this.refs.msCanvas.width, this.refs.msCanvas.height, { resetPos:true });
  }

  /**
   * updateCamera
   */
  updateCamera(width, height, resetPos = false) {
    let sx = 1;
    let sy = 1;
    if (width > height) {
      sx = width/height;
    } else {
      sy = height/width;
    }
    this.camera.left = -4*sx;
    this.camera.right = 4*sx;
    this.camera.top = 4*sy;
    this.camera.bottom = -4*sy;
    this.camera.near = -16;
    this.camera.far = 16;

    // controls
    if (this.controls === undefined) {
      this.createControls();   // need to have "pretty much the camera for this scene" before creating controls
    }
    
    if (resetPos) {
      this.controls.reset();   // resets camera to original position (also calls updateProjectionMatrix)
    }
    else {
      this.camera.updateProjectionMatrix();
      this.controls.update();  // it's necessary to call this when the camera is manually changed
    }
  }

  /**
   * Renders Morse-Smale Decomposition
   * @return {JSX} Morse-Smale JSX component
   */
  render() {
    let style = {
      width: '100%',
      height: '100%',
    };

    return (
      <ReactResizeDetector handleWidth handleHeight onResize={() => this.resizeCanvas(false)}>
        <canvas ref='msCanvas' style={style} />
      </ReactResizeDetector>);
  }
}

export default withDSXContext(MorseSmaleWindow);
