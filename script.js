// Kaarigar3D - Mobile 3D Furniture Design App

// Main Application Script

// Global Variables

let scene, camera, renderer, controls;

let objects = [];

let selectedObjects = [];

let currentTool = 'select';

let isDrawing = false;

let drawingObject = null;

let startPoint = null;

let gridVisible = true;

let snapToGrid = true;

let gridSize = 1;

let lastClickTime = 0;

let lastSelectedObject = null;

// Initialize the application

function init() {

    // Create Three.js scene

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xe9e9e9);

    

    // Set up camera

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(5, 5, 5);

    camera.lookAt(0, 0, 0);

    

    // Create renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(window.devicePixelRatio);

    document.getElementById('canvasContainer').appendChild(renderer.domElement);

    

    // Add orbit controls

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;

    controls.dampingFactor = 0.25;

    

    // Add lights

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    scene.add(ambientLight);

    

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

    directionalLight.position.set(5, 10, 7);

    scene.add(directionalLight);

    

    // Add grid helper

    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x888888);

    scene.add(gridHelper);

    

    // Add axes helper (for debugging)

    // const axesHelper = new THREE.AxesHelper(5);

    // scene.add(axesHelper);

    

    // Set up event listeners

    setupEventListeners();

    

    // Start animation loop

    animate();

    

    // Load any saved projects

    loadProjectList();

}

// Set up all event listeners

function setupEventListeners() {

    // Window resize

    window.addEventListener('resize', onWindowResize);

    

    // Canvas click events

    renderer.domElement.addEventListener('click', onCanvasClick);

    renderer.domElement.addEventListener('dblclick', onCanvasDoubleClick);

    renderer.domElement.addEventListener('mousedown', onCanvasMouseDown);

    renderer.domElement.addEventListener('mousemove', onCanvasMouseMove);

    renderer.domElement.addEventListener('mouseup', onCanvasMouseUp);

    

    // Touch events for mobile

    renderer.domElement.addEventListener('touchstart', onCanvasTouchStart, { passive: false });

    renderer.domElement.addEventListener('touchmove', onCanvasTouchMove, { passive: false });

    renderer.domElement.addEventListener('touchend', onCanvasTouchEnd, { passive: false });

    

    // Tool buttons

    document.querySelectorAll('.tool-btn').forEach(btn => {

        btn.addEventListener('click', onToolButtonClick);

    });

    

    // More tools button

    document.getElementById('moreToolsBtn').addEventListener('click', toggleMoreTools);

    

    // Context menu buttons

    document.querySelectorAll('.context-menu-items button').forEach(btn => {

        btn.addEventListener('click', onContextMenuAction);

    });

    

    // Close context menu

    document.getElementById('closeContextMenu').addEventListener('click', hideContextMenu);

    

    // Material panel

    document.querySelectorAll('.material-item').forEach(item => {

        item.addEventListener('click', onMaterialSelect);

    });

    

    document.querySelectorAll('.texture-btn').forEach(btn => {

        btn.addEventListener('click', onTextureSelect);

    });

    

    document.getElementById('closeMaterialPanel').addEventListener('click', hideMaterialPanel);

    

    // Main menu

    document.getElementById('mainMenuBtn').addEventListener('click', showMainMenu);

    document.getElementById('closeMainMenu').addEventListener('click', hideMainMenu);

    

    // Menu actions

    document.getElementById('newProjectBtn').addEventListener('click', newProject);

    document.getElementById('openProjectBtn').addEventListener('click', showLoadModal);

    document.getElementById('saveProjectBtn').addEventListener('click', showSaveModal);

    document.getElementById('exportProjectBtn').addEventListener('click', exportAsImage);

    

    // Modal buttons

    document.getElementById('confirmSave').addEventListener('click', saveProject);

    document.getElementById('cancelSave').addEventListener('click', hideSaveModal);

    document.getElementById('closeSaveModal').addEventListener('click', hideSaveModal);

    document.getElementById('closeLoadModal').addEventListener('click', hideLoadModal);

    document.getElementById('cancelLoad').addEventListener('click', hideLoadModal);

}

// Animation loop

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);

}

// Handle window resize

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

// Canvas click handler

function onCanvasClick(event) {

    event.preventDefault();

    

    const now = Date.now();

    const isDoubleClick = (now - lastClickTime) < 300;

    lastClickTime = now;

    

    if (isDoubleClick) return; // Let double click handler take care of it

    

    const mouse = getNormalizedMouseCoordinates(event);

    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(mouse, camera);

    

    const intersects = raycaster.intersectObjects(scene.children, true);

    

    if (intersects.length > 0) {

        const intersect = intersects[0];

        

        // Handle different tools

        switch (currentTool) {

            case 'select':

                handleSelectTool(intersect.object, event.shiftKey);

                break;

                

            case 'paint':

                if (intersect.object.material) {

                    intersect.object.material.color.set(currentColor);

                }

                break;

                

            case 'eyedropper':

                if (intersect.object.material) {

                    currentColor = intersect.object.material.color.clone();

                }

                break;

                

            default:

                // For other tools, start drawing/transforming

                startPoint = intersect.point;

                isDrawing = true;

                break;

        }

    } else {

        // Clicked on empty space - deselect all

        if (currentTool === 'select') {

            clearSelection();

        }

    }

}

// Canvas double click handler

function onCanvasDoubleClick(event) {

    event.preventDefault();

    

    const mouse = getNormalizedMouseCoordinates(event);

    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(mouse, camera);

    

    const intersects = raycaster.intersectObjects(scene.children, true);

    

    if (intersects.length > 0) {

        const intersect = intersects[0];

        

        if (currentTool === 'select') {

            // Select the entire object (not just face)

            selectFullObject(intersect.object);

            

            // Show context menu

            showContextMenu(event.clientX, event.clientY);

        }

    }

}

// Canvas mouse down handler

function onCanvasMouseDown(event) {

    if (currentTool !== 'select' && currentTool !== 'paint' && currentTool !== 'eyedropper') {

        const mouse = getNormalizedMouseCoordinates(event);

        const raycaster = new THREE.Raycaster();

        raycaster.setFromCamera(mouse, camera);

        

        const intersects = raycaster.intersectObjects(scene.children, true);

        

        if (intersects.length > 0) {

            startPoint = intersects[0].point;

            isDrawing = true;

            

            // Create a new object based on the current tool

            createDrawingObject(currentTool, startPoint);

        }

    }

}

// Canvas mouse move handler

function onCanvasMouseMove(event) {

    if (isDrawing && drawingObject && startPoint) {

        const mouse = getNormalizedMouseCoordinates(event);

        const raycaster = new THREE.Raycaster();

        raycaster.setFromCamera(mouse, camera);

        

        const intersects = raycaster.intersectObjects(scene.children, true);

        

        if (intersects.length > 0) {

            const endPoint = intersects[0].point;

            

            // Update the drawing object based on the current tool

            updateDrawingObject(drawingObject, currentTool, startPoint, endPoint);

        }

    }

}

// Canvas mouse up handler

function onCanvasMouseUp(event) {

    if (isDrawing && drawingObject) {

        // Finalize the drawing object

        finalizeDrawingObject(drawingObject);

        drawingObject = null;

    }

    

    isDrawing = false;

    startPoint = null;

}

// Touch event handlers (for mobile)

function onCanvasTouchStart(event) {

    event.preventDefault();

    if (event.touches.length === 1) {

        const touch = event.touches[0];

        const mouseEvent = new MouseEvent('mousedown', {

            clientX: touch.clientX,

            clientY: touch.clientY

        });

        onCanvasMouseDown(mouseEvent);

    }

}

function onCanvasTouchMove(event) {

    event.preventDefault();

    if (event.touches.length === 1) {

        const touch = event.touches[0];

        const mouseEvent = new MouseEvent('mousemove', {

            clientX: touch.clientX,

            clientY: touch.clientY

        });

        onCanvasMouseMove(mouseEvent);

    }

}

function onCanvasTouchEnd(event) {

    event.preventDefault();

    if (event.touches.length === 0) {

        const mouseEvent = new MouseEvent('mouseup');

        onCanvasMouseUp(mouseEvent);

    }

}

// Tool button click handler

function onToolButtonClick(event) {

    const tool = event.currentTarget.dataset.tool;

    

    // Update active tool

    currentTool = tool;

    

    // Update UI

    document.querySelectorAll('.tool-btn').forEach(btn => {

        btn.classList.remove('active');

    });

    event.currentTarget.classList.add('active');

    

    // Handle special tools

    if (tool === 'paint') {

        showMaterialPanel();

    } else {

        hideMaterialPanel();

    }

    

    if (tool === 'orbit' || tool === 'pan' || tool === 'zoomin' || tool === 'zoomout') {

        setupViewTool(tool);

    }

}

// Create a new drawing object based on the current tool

function createDrawingObject(tool, startPoint) {

    let geometry, material, mesh;

    

    // Snap to grid if enabled

    if (snapToGrid) {

        startPoint.x = Math.round(startPoint.x / gridSize) * gridSize;

        startPoint.y = Math.round(startPoint.y / gridSize) * gridSize;

        startPoint.z = Math.round(startPoint.z / gridSize) * gridSize;

    }

    

    switch (tool) {

        case 'line':

            // Line geometry will be created in update function

            material = new THREE.LineBasicMaterial({ color: 0x000000 });

            drawingObject = new THREE.Line(new THREE.BufferGeometry(), material);

            break;

            

        case 'rectangle':

            geometry = new THREE.PlaneGeometry(0.1, 0.1);

            material = new THREE.MeshBasicMaterial({ 

                color: 0x4a6fa5, 

                side: THREE.DoubleSide,

                transparent: true,

                opacity: 0.7

            });

            drawingObject = new THREE.Mesh(geometry, material);

            drawingObject.rotation.x = -Math.PI / 2; // Make it lie flat

            break;

            

        case 'circle':

            geometry = new THREE.CircleGeometry(0.1, 32);

            material = new THREE.MeshBasicMaterial({ 

                color: 0x4a6fa5, 

                side: THREE.DoubleSide,

                transparent: true,

                opacity: 0.7

            });

            drawingObject = new THREE.Mesh(geometry, material);

            drawingObject.rotation.x = -Math.PI / 2; // Make it lie flat

            break;

            

        case 'arc':

            // Arc will be created as a partial circle

            geometry = new THREE.BufferGeometry();

            material = new THREE.LineBasicMaterial({ color: 0x000000 });

            drawingObject = new THREE.Line(geometry, material);

            break;

            

        case 'pushpull':

            // For push/pull, we need to select a face first

            // This will be handled in the click handler

            break;

            

        default:

            // Default to a cube for other tools

            geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

            material = new THREE.MeshBasicMaterial({ 

                color: 0x4a6fa5,

                transparent: true,

                opacity: 0.7

            });

            drawingObject = new THREE.Mesh(geometry, material);

    }

    

    if (drawingObject) {

        drawingObject.position.copy(startPoint);

        scene.add(drawingObject);

    }

    

    return drawingObject;

}

// Update the drawing object based on mouse movement

function updateDrawingObject(obj, tool, startPoint, endPoint) {

    if (!obj) return;

    

    // Snap to grid if enabled

    if (snapToGrid) {

        endPoint.x = Math.round(endPoint.x / gridSize) * gridSize;

        endPoint.y = Math.round(endPoint.y / gridSize) * gridSize;

        endPoint.z = Math.round(endPoint.z / gridSize) * gridSize;

    }

    

    switch (tool) {

        case 'line':

            const lineGeometry = obj.geometry;

            const positions = new Float32Array(6);

            positions[0] = startPoint.x;

            positions[1] = startPoint.y;

            positions[2] = startPoint.z;

            positions[3] = endPoint.x;

            positions[4] = endPoint.y;

            positions[5] = endPoint.z;

            lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            break;

            

        case 'rectangle':

            const width = Math.abs(endPoint.x - startPoint.x);

            const depth = Math.abs(endPoint.z - startPoint.z);

            obj.geometry.dispose();

            obj.geometry = new THREE.PlaneGeometry(width, depth);

            

            // Position at center between start and end points

            obj.position.x = (startPoint.x + endPoint.x) / 2;

            obj.position.z = (startPoint.z + endPoint.z) / 2;

            break;

            

        case 'circle':

            const radius = Math.sqrt(

                Math.pow(endPoint.x - startPoint.x, 2) + 

                Math.pow(endPoint.z - startPoint.z, 2)

            );

            obj.geometry.dispose();

            obj.geometry = new THREE.CircleGeometry(radius, 32);

            break;

            

        case 'arc':

            // Implement arc drawing logic

            break;

            

        default:

            // For other tools (like box), scale between start and end points

            const scaleX = Math.abs(endPoint.x - startPoint.x);

            const scaleY = Math.abs(endPoint.y - startPoint.y);

            const scaleZ = Math.abs(endPoint.z - startPoint.z);

            

            obj.scale.set(scaleX, scaleY, scaleZ);

            

            // Position at center between start and end points

            obj.position.x = (startPoint.x + endPoint.x) / 2;

            obj.position.y = (startPoint.y + endPoint.y) / 2;

            obj.position.z = (startPoint.z + endPoint.z) / 2;

    }

}

// Finalize the drawing object when mouse is released

function finalizeDrawingObject(obj) {

    if (!obj) return;

    

    // Change material to be opaque

    if (obj.material) {

        obj.material.transparent = false;

        obj.material.opacity = 1;

    }

    

    // Add to objects array

    objects.push(obj);

    

    // Select the new object

    clearSelection();

    selectObject(obj);

}

// Handle select tool

function handleSelectTool(object, multiSelect) {

    if (!multiSelect) {

        clearSelection();

    }

    

    selectObject(object);

}

// Select an object

function selectObject(object) {

    if (!object) return;

    

    // Highlight the object

    if (object.material) {

        object.userData.originalColor = object.material.color.clone();

        object.material.color.set(0x00ff00); // Green for selection

    }

    

    selectedObjects.push(object);

    lastSelectedObject = object;

}

// Select the full object (not just face)

function selectFullObject(object) {

    // Traverse up to find the parent object if this is a child (like a face)

    let parent = object;

    while (parent.parent && parent.parent !== scene) {

        parent = parent.parent;

    }

    

    clearSelection();

    selectObject(parent);

}

// Clear current selection

function clearSelection() {

    selectedObjects.forEach(obj => {

        if (obj.material && obj.userData.originalColor) {

            obj.material.color.copy(obj.userData.originalColor);

        }

    });

    

    selectedObjects = [];

}

// Toggle more tools panel

function toggleMoreTools() {

    const panel = document.getElementById('moreToolsPanel');

    panel.classList.toggle('show');

}

// Show context menu

function showContextMenu(x, y) {

    const contextMenu = document.getElementById('contextMenu');

    contextMenu.style.left = `${x}px`;

    contextMenu.style.top = `${y}px`;

    contextMenu.classList.add('show');

}

// Hide context menu

function hideContextMenu() {

    document.getElementById('contextMenu').classList.remove('show');

}

// Context menu action handler

function onContextMenuAction(event) {

    const action = event.currentTarget.dataset.action;

    

    switch (action) {

        case 'group':

            groupSelectedObjects();

            break;

            

        case 'ungroup':

            ungroupSelectedObjects();

            break;

            

        case 'hide':

            hideSelectedObjects();

            break;

            

        case 'unhide':

            unhideAllObjects();

            break;

            

        case 'component':

            convertToComponent();

            break;

            

        case 'explode':

            explodeComponent();

            break;

            

        case 'duplicate':

            duplicateSelectedObjects();

            break;

            

        case 'delete':

            deleteSelectedObjects();

            break;

    }

    

    hideContextMenu();

}

// Group selected objects

function groupSelectedObjects() {

    if (selectedObjects.length < 2) return;

    

    const group = new THREE.Group();

    

    selectedObjects.forEach(obj => {

        scene.remove(obj);

        group.add(obj);

    });

    

    scene.add(group);

    objects.push(group);

    clearSelection();

    selectObject(group);

}

// Ungroup selected objects

function ungroupSelectedObjects() {

    if (selectedObjects.length === 0) return;

    

    const newSelections = [];

    

    selectedObjects.forEach(obj => {

        if (obj instanceof THREE.Group && obj.children.length > 0) {

            const children = [...obj.children];

            

            scene.remove(obj);

            objects = objects.filter(o => o !== obj);

            

            children.forEach(child => {

                scene.add(child);

                objects.push(child);

                newSelections.push(child);

            });

        }

    });

    

    clearSelection();

    newSelections.forEach(obj => selectObject(obj));

}

// Hide selected objects

function hideSelectedObjects() {

    selectedObjects.forEach(obj => {

        obj.visible = false;

    });

    

    clearSelection();

}

// Unhide all objects

function unhideAllObjects() {

    objects.forEach(obj => {

        obj.visible = true;

    });

}

// Convert to component

function convertToComponent() {

    // In a real app, this would create a reusable component

    // For now, we'll just mark it as a component in userData

    selectedObjects.forEach(obj => {

        obj.userData.isComponent = true;

    });

}

// E