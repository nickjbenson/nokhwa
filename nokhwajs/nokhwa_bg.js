import * as wasm from './nokhwa_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_24(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hcf34bb914ec8dc3e(arg0, arg1, addHeapObject(arg2));
}

/**
* Requests Webcam permissions from the browser using [`MediaDevices::get_user_media()`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaDevices.html#method.get_user_media) [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
* # Errors
* This will error if there is no valid web context or the web API is not supported
* # JS-WASM
* In exported JS bindings, the name of the function is `requestPermissions`. It may throw an exception.
* @returns {Promise<any>}
*/
export function requestPermissions() {
    var ret = wasm.requestPermissions();
    return takeObject(ret);
}

/**
* Queries Cameras using [`MediaDevices::enumerate_devices()`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaDevices.html#method.enumerate_devices) [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices)
* # Errors
* This will error if there is no valid web context or the web API is not supported
* # JS-WASM
* This is exported as `queryCameras`. It may throw an exception.
* @returns {any}
*/
export function queryCameras() {
    var ret = wasm.queryCameras();
    return takeObject(ret);
}

/**
* Queries the browser's supported constraints using [`navigator.mediaDevices.getSupportedConstraints()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints)
* # Errors
* This will error if there is no valid web context or the web API is not supported
* # JS-WASM
* This is exported as `queryConstraints` and returns an array of strings.
* @returns {Array<any>}
*/
export function queryConstraints() {
    var ret = wasm.queryConstraints();
    return takeObject(ret);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
function __wbg_adapter_204(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h2c139c16959e39a8(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
* The enum describing the possible constraints for video in the browser.
* - `DeviceID`: The ID of the device
* - `GroupID`: The ID of the group that the device is in
* - `AspectRatio`: The Aspect Ratio of the final stream
* - `FacingMode`: What direction the camera is facing. This is more common on mobile. See [`JSCameraFacingMode`]
* - `FrameRate`: The Frame Rate of the final stream
* - `Height`: The height of the final stream in pixels
* - `Width`: The width of the final stream in pixels
* - `ResizeMode`: Whether the client can crop and/or scale the stream to match the resolution (width, height). See [`JSCameraResizeMode`]
* See More: [`MediaTrackConstraints`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints) [`Capabilities, constraints, and settings`](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints)
* # JS-WASM
* This is exported as `CameraSupportedCapabilities`.
*/
export const CameraSupportedCapabilities = Object.freeze({ DeviceID:0,"0":"DeviceID",GroupID:1,"1":"GroupID",AspectRatio:2,"2":"AspectRatio",FacingMode:3,"3":"FacingMode",FrameRate:4,"4":"FrameRate",Height:5,"5":"Height",Width:6,"6":"Width",ResizeMode:7,"7":"ResizeMode", });
/**
* The Facing Mode of the camera
* - Any: Make no particular choice.
* - Environment: The camera that shows the user's environment, such as the back camera of a smartphone
* - User: The camera that shows the user, such as the front camera of a smartphone
* - Left: The camera that shows the user but to their left, such as a camera that shows a user but to their left shoulder
* - Right: The camera that shows the user but to their right, such as a camera that shows a user but to their right shoulder
* See More: [`facingMode`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode)
* # JS-WASM
* This is exported as `CameraFacingMode`.
*/
export const CameraFacingMode = Object.freeze({ Any:0,"0":"Any",Environment:1,"1":"Environment",User:2,"2":"User",Left:3,"3":"Left",Right:4,"4":"Right", });
/**
* Whether the browser can crop and/or scale to match the requested resolution.
* - `Any`: Make no particular choice.
* - `None`: Do not crop and/or scale.
* - `CropAndScale`: Crop and/or scale to match the requested resolution.
* See More: [`resizeMode`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#resizemode)
* # JS-WASM
* This is exported as `CameraResizeMode`.
*/
export const CameraResizeMode = Object.freeze({ Any:0,"0":"Any",None:1,"1":"None",CropAndScale:2,"2":"CropAndScale", });
/**
* Constraints to create a [`JSCamera`]
*
* If you want more options, see [`JSCameraConstraintsBuilder`]
* # JS-WASM
* This is exported as `CameraConstraints`.
*/
export class CameraConstraints {

    static __wrap(ptr) {
        const obj = Object.create(CameraConstraints.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cameraconstraints_free(ptr);
    }
}
/**
* A builder that builds a [`JSCameraConstraints`] that is used to construct a [`JSCamera`].
* See More: [`Constraints MDN`](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints), [`Properties of Media Tracks MDN`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)
* # JS-WASM
* This is exported as `CameraConstraintsBuilder`.
*/
export class CameraConstraintsBuilder {

    static __wrap(ptr) {
        const obj = Object.create(CameraConstraintsBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cameraconstraintsbuilder_free(ptr);
    }
}
/**
* Information about a Camera e.g. its name.
* `description` amd `misc` may contain information that may differ from backend to backend. Refer to each backend for details.
* `index` is a camera's index given to it by (usually) the OS usually in the order it is known to the system.
* # JS-WASM
* This is exported as a `CameraInfo`.
*/
export class CameraInfo {

    static __wrap(ptr) {
        const obj = Object.create(CameraInfo.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_camerainfo_free(ptr);
    }
    /**
    * Create a new [`CameraInfo`].
    * # JS-WASM
    * This is exported as a constructor for [`CameraInfo`].
    * @param {string} human_name
    * @param {string} description
    * @param {string} misc
    * @param {number} index
    */
    constructor(human_name, description, misc, index) {
        var ptr0 = passStringToWasm0(human_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(misc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.camerainfo_new(ptr0, len0, ptr1, len1, ptr2, len2, index);
        return CameraInfo.__wrap(ret);
    }
    /**
    * Get a reference to the device info's human readable name.
    * # JS-WASM
    * This is exported as a `get_HumanReadableName`.
    * @returns {string}
    */
    get HumanReadableName() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camerainfo_HumanReadableName(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Set the device info's human name.
    * # JS-WASM
    * This is exported as a `set_HumanReadableName`.
    * @param {string} human_name
    */
    set HumanReadableName(human_name) {
        var ptr0 = passStringToWasm0(human_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.camerainfo_set_HumanReadableName(this.ptr, ptr0, len0);
    }
    /**
    * Get a reference to the device info's description.
    * # JS-WASM
    * This is exported as a `get_Description`.
    * @returns {string}
    */
    get Description() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camerainfo_Description(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Set the device info's description.
    * # JS-WASM
    * This is exported as a `set_Description`.
    * @param {string} description
    */
    set Description(description) {
        var ptr0 = passStringToWasm0(description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.camerainfo_set_Description(this.ptr, ptr0, len0);
    }
    /**
    * Get a reference to the device info's misc.
    * # JS-WASM
    * This is exported as a `get_MiscString`.
    * @returns {string}
    */
    get MiscString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camerainfo_MiscString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Set the device info's misc.
    * # JS-WASM
    * This is exported as a `set_MiscString`.
    * @param {string} misc
    */
    set MiscString(misc) {
        var ptr0 = passStringToWasm0(misc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.camerainfo_set_MiscString(this.ptr, ptr0, len0);
    }
    /**
    * Get a reference to the device info's index.
    * # JS-WASM
    * This is exported as a `get_Index`.
    * @returns {number}
    */
    get Index() {
        var ret = wasm.camerainfo_Index(this.ptr);
        return ret >>> 0;
    }
    /**
    * Set the device info's index.
    * # JS-WASM
    * This is exported as a `set_Index`.
    * @param {number} index
    */
    set Index(index) {
        wasm.camerainfo_set_Index(this.ptr, index);
    }
}

export class JSCamera {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscamera_free(ptr);
    }
    /**
    * Creates a new [`JSCamera`] using [`JSCameraConstraints`].
    *
    * # Errors
    * This may error if permission is not granted, or the constraints are invalid.
    * # JS-WASM
    * This is the constructor for `NOKCamera`. It returns a promise and may throw an error.
    * @param {CameraConstraints} constraints
    */
    constructor(constraints) {
        _assertClass(constraints, CameraConstraints);
        var ptr0 = constraints.ptr;
        constraints.ptr = 0;
        var ret = wasm.jscamera_js_new(ptr0);
        return takeObject(ret);
    }
    /**
    * Gets the internal [`JSCameraConstraints`].
    * Most likely, you will edit this value by taking ownership of it, then feed it back into [`set_constraints`](crate::js_camera::JSCamera::set_constraints).
    * # JS-WASM
    * This is exported as `get_Constraints`.
    * @returns {CameraConstraints}
    */
    get Constraints() {
        var ret = wasm.jscamera_Constraints(this.ptr);
        return CameraConstraints.__wrap(ret);
    }
    /**
    * Sets the JSCameraConstraints. This calls [`apply_constraints`](crate::js_camera::JSCamera::apply_constraints) internally.
    *
    * # Errors
    * See [`apply_constraints`](crate::js_camera::JSCamera::apply_constraints).
    * # JS-WASM
    * This is exported as `set_Constraints`. It may throw an error.
    * @param {CameraConstraints} constraints
    */
    set Constraints(constraints) {
        _assertClass(constraints, CameraConstraints);
        var ptr0 = constraints.ptr;
        constraints.ptr = 0;
        wasm.jscamera_set_Constraints(this.ptr, ptr0);
    }
    /**
    * Gets the internal [`Resolution`].
    *
    * Note: This value is only updated after you call [`measure_resolution`](crate::js_camera::JSCamera::measure_resolution)
    * # JS-WASM
    * This is exported as `get_Resolution`.
    * @returns {Resolution}
    */
    get Resolution() {
        var ret = wasm.jscamera_Resolution(this.ptr);
        return Resolution.__wrap(ret);
    }
    /**
    * Measures the [`Resolution`] of the internal stream. You usually do not need to call this.
    *
    * # Errors
    * If the camera fails to attach to the created `<video>`, this will error.
    *
    * # JS-WASM
    * This is exported as `measureResolution`. It may throw an error.
    */
    measureResolution() {
        wasm.jscamera_measureResolution(this.ptr);
    }
    /**
    * Applies any modified constraints.
    * # Security
    * WARNING: This function uses [`Function`](https://docs.rs/js-sys/0.3.52/js_sys/struct.Function.html) and if the [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) or [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId)
    * fields are invalid/contain malicious JS, it will run without restraint. Please take care as to make sure the [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) and the [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId)
    * fields are not malicious! (This usually boils down to not letting users input data directly)
    *
    * # Errors
    * This function may return an error on an invalid string in [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) or [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId) or if the
    * Javascript Function fails to run.
    * # JS-WASM
    * This is exported as `applyConstraints`. It may throw an error.
    */
    applyConstraints() {
        wasm.jscamera_applyConstraints(this.ptr);
    }
    /**
    * Gets the internal [`MediaStream`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStream.html) [`MDN`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
    * # JS-WASM
    * This is exported as `MediaStream`.
    * @returns {MediaStream}
    */
    get MediaStream() {
        var ret = wasm.jscamera_MediaStream(this.ptr);
        return takeObject(ret);
    }
    /**
    * Captures an [`ImageData`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.ImageData.html) [`MDN`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) by drawing the image to a non-existent canvas.
    *
    * # Errors
    * If drawing to the canvas fails this will error.
    * # JS-WASM
    * This is exported as `captureImageData`. It may throw an error.
    * @returns {ImageData}
    */
    captureImageData() {
        var ret = wasm.jscamera_captureImageData(this.ptr);
        return takeObject(ret);
    }
    /**
    * Captures an [`ImageData`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.ImageData.html) [`MDN`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) and then returns its `URL` as a string.
    * - `mime_type`: The mime type of the resulting URI. It is `image/png` by default (lossless) but can be set to `image/jpeg` or `image/webp` (lossy). Anything else is ignored.
    * - `image_quality`: A number between `0` and `1` indicating the resulting image quality in case you are using a lossy image mime type. The default value is 0.92, and all other values are ignored.
    *
    * # Errors
    * If drawing to the canvas fails or URI generation is not supported or fails this will error.
    * # JS-WASM
    * This is exported as `captureImageURI`. It may throw an error
    * @param {string} mime_type
    * @param {number} image_quality
    * @returns {string}
    */
    captureImageURI(mime_type, image_quality) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(mime_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.jscamera_captureImageURI(retptr, this.ptr, ptr0, len0, image_quality);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates an off-screen canvas and a `<video>` element (if not already attached) and returns a raw `Cow<[u8]>` RGBA frame.
    * # Errors
    * If a cast fails, the camera fails to attach, the currently attached node is invalid, or writing/reading from the canvas fails, this will error.
    * # JS-WASM
    * This is exported as `captureFrameRawData`. This may throw an error.
    * @returns {Uint8Array}
    */
    captureFrameRawData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscamera_captureFrameRawData(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Attaches camera to a `element`(by-id).
    * - `generate_new`: Whether to add a video element to provided element to attach to. Set this to `false` if the `element` ID you are passing is already a `<video>` element.
    * # Errors
    * If the camera fails to attach, fails to generate the video element, or a cast fails, this will error.
    * # JS-WASM
    * This is exported as `attachToElement`. It may throw an error.
    * @param {string} element
    * @param {boolean} generate_new
    */
    attachToElement(element, generate_new) {
        var ptr0 = passStringToWasm0(element, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.jscamera_attachToElement(this.ptr, ptr0, len0, generate_new);
    }
    /**
    * Detaches the camera from the `<video>` node.
    * # Errors
    * If the casting fails (the stored node is not a `<video>`) this will error.
    * # JS-WASM
    * This is exported as `detachCamera`. This may throw an error.
    */
    detachCamera() {
        wasm.jscamera_detachCamera(this.ptr);
    }
}

export class JSCameraConstraints {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscameraconstraints_free(ptr);
    }
    /**
    * Gets the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html)
    * # JS-WASM
    * This is exported as `get_MediaStreamConstraints`.
    * @returns {any}
    */
    get MediaStreamConstraints() {
        var ret = wasm.jscameraconstraints_MediaStreamConstraints(this.ptr);
        return takeObject(ret);
    }
    /**
    * Gets the minimum [`Resolution`].
    * # JS-WASM
    * This is exported as `get_MinResolution`.
    * @returns {Resolution | undefined}
    */
    get MinResolution() {
        var ret = wasm.jscameraconstraints_MinResolution(this.ptr);
        return ret === 0 ? undefined : Resolution.__wrap(ret);
    }
    /**
    * Gets the minimum [`Resolution`].
    * # JS-WASM
    * This is exported as `set_MinResolution`.
    * @param {Resolution} min_resolution
    */
    set MinResolution(min_resolution) {
        _assertClass(min_resolution, Resolution);
        var ptr0 = min_resolution.ptr;
        min_resolution.ptr = 0;
        wasm.jscameraconstraints_set_MinResolution(this.ptr, ptr0);
    }
    /**
    * Gets the internal [`Resolution`]
    * # JS-WASM
    * This is exported as `get_Resolution`.
    * @returns {Resolution}
    */
    get Resolution() {
        var ret = wasm.jscameraconstraints_Resolution(this.ptr);
        return Resolution.__wrap(ret);
    }
    /**
    * Sets the internal [`Resolution`]
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_Resolution`.
    * @param {Resolution} preferred_resolution
    */
    set Resolution(preferred_resolution) {
        _assertClass(preferred_resolution, Resolution);
        var ptr0 = preferred_resolution.ptr;
        preferred_resolution.ptr = 0;
        wasm.jscameraconstraints_set_Resolution(this.ptr, ptr0);
    }
    /**
    * Gets the maximum [`Resolution`].
    * # JS-WASM
    * This is exported as `get_MaxResolution`.
    * @returns {Resolution | undefined}
    */
    get MaxResolution() {
        var ret = wasm.jscameraconstraints_MaxResolution(this.ptr);
        return ret === 0 ? undefined : Resolution.__wrap(ret);
    }
    /**
    * Gets the maximum [`Resolution`].
    * # JS-WASM
    * This is exported as `set_MaxResolution`.
    * @param {Resolution} max_resolution
    */
    set MaxResolution(max_resolution) {
        _assertClass(max_resolution, Resolution);
        var ptr0 = max_resolution.ptr;
        max_resolution.ptr = 0;
        wasm.jscameraconstraints_set_MaxResolution(this.ptr, ptr0);
    }
    /**
    * Gets the internal resolution exact.
    * # JS-WASM
    * This is exported as `get_ResolutionExact`.
    * @returns {boolean}
    */
    get ResolutionExact() {
        var ret = wasm.jscameraconstraints_ResolutionExact(this.ptr);
        return ret !== 0;
    }
    /**
    * Sets the internal resolution exact.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_ResolutionExact`.
    * @param {boolean} resolution_exact
    */
    set ResolutionExact(resolution_exact) {
        wasm.jscameraconstraints_set_ResolutionExact(this.ptr, resolution_exact);
    }
    /**
    * Gets the minimum aspect ratio of the [`JSCameraConstraints`].
    * # JS-WASM
    * This is exported as `get_MinAspectRatio`.
    * @returns {number | undefined}
    */
    get MinAspectRatio() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscameraconstraints_MinAspectRatio(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getFloat64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the minimum aspect ratio of the [`JSCameraConstraints`].
    * # JS-WASM
    * This is exported as `set_MinAspectRatio`.
    * @param {number} min_aspect_ratio
    */
    set MinAspectRatio(min_aspect_ratio) {
        wasm.jscameraconstraints_set_MinAspectRatio(this.ptr, min_aspect_ratio);
    }
    /**
    * Gets the internal aspect ratio.
    * # JS-WASM
    * This is exported as `get_AspectRatio`.
    * @returns {number}
    */
    get AspectRatio() {
        var ret = wasm.jscameraconstraints_AspectRatio(this.ptr);
        return ret;
    }
    /**
    * Sets the internal aspect ratio.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_AspectRatio`.
    * @param {number} aspect_ratio
    */
    set AspectRatio(aspect_ratio) {
        wasm.jscameraconstraints_set_AspectRatio(this.ptr, aspect_ratio);
    }
    /**
    * Gets the maximum aspect ratio.
    * # JS-WASM
    * This is exported as `get_MaxAspectRatio`.
    * @returns {number | undefined}
    */
    get MaxAspectRatio() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscameraconstraints_MaxAspectRatio(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getFloat64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the maximum internal aspect ratio.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_MaxAspectRatio`.
    * @param {number} max_aspect_ratio
    */
    set MaxAspectRatio(max_aspect_ratio) {
        wasm.jscameraconstraints_set_MaxAspectRatio(this.ptr, max_aspect_ratio);
    }
    /**
    * Gets the internal aspect ratio exact.
    * # JS-WASM
    * This is exported as `get_AspectRatioExact`.
    * @returns {boolean}
    */
    get AspectRatioExact() {
        var ret = wasm.jscameraconstraints_AspectRatioExact(this.ptr);
        return ret !== 0;
    }
    /**
    * Sets the internal aspect ratio exact.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_AspectRatioExact`.
    * @param {boolean} aspect_ratio_exact
    */
    set AspectRatioExact(aspect_ratio_exact) {
        wasm.jscameraconstraints_set_AspectRatioExact(this.ptr, aspect_ratio_exact);
    }
    /**
    * Gets the internal [`JSCameraFacingMode`].
    * # JS-WASM
    * This is exported as `get_FacingMode`.
    * @returns {number}
    */
    get FacingMode() {
        var ret = wasm.jscameraconstraints_FacingMode(this.ptr);
        return ret >>> 0;
    }
    /**
    * Sets the internal [`JSCameraFacingMode`]
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_FacingMode`.
    * @param {number} facing_mode
    */
    set FacingMode(facing_mode) {
        wasm.jscameraconstraints_set_FacingMode(this.ptr, facing_mode);
    }
    /**
    * Gets the internal facing mode exact.
    * # JS-WASM
    * This is exported as `get_FacingModeExact`.
    * @returns {boolean}
    */
    get FacingModeExact() {
        var ret = wasm.jscameraconstraints_FacingModeExact(this.ptr);
        return ret !== 0;
    }
    /**
    * Sets the internal facing mode exact
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_FacingModeExact`.
    * @param {boolean} facing_mode_exact
    */
    set FacingModeExact(facing_mode_exact) {
        wasm.jscameraconstraints_set_FacingModeExact(this.ptr, facing_mode_exact);
    }
    /**
    * Gets the minimum internal frame rate.
    * # JS-WASM
    * This is exported as `get_MinFrameRate`.
    * @returns {number | undefined}
    */
    get MinFrameRate() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscameraconstraints_MinFrameRate(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the minimum internal frame rate
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_MinFrameRate`.
    * @param {number} min_frame_rate
    */
    set MinFrameRate(min_frame_rate) {
        wasm.jscameraconstraints_set_MinFrameRate(this.ptr, min_frame_rate);
    }
    /**
    * Gets the internal frame rate.
    * # JS-WASM
    * This is exported as `get_FrameRate`.
    * @returns {number}
    */
    get FrameRate() {
        var ret = wasm.jscameraconstraints_FrameRate(this.ptr);
        return ret >>> 0;
    }
    /**
    * Sets the internal frame rate
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_FrameRate`.
    * @param {number} frame_rate
    */
    set FrameRate(frame_rate) {
        wasm.jscameraconstraints_set_FrameRate(this.ptr, frame_rate);
    }
    /**
    * Gets the maximum internal frame rate.
    * # JS-WASM
    * This is exported as `get_MaxFrameRate`.
    * @returns {number | undefined}
    */
    get MaxFrameRate() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscameraconstraints_MaxFrameRate(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the maximum internal frame rate
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_MaxFrameRate`.
    * @param {number} max_frame_rate
    */
    set MaxFrameRate(max_frame_rate) {
        wasm.jscameraconstraints_set_MaxFrameRate(this.ptr, max_frame_rate);
    }
    /**
    * Gets the internal frame rate exact.
    * # JS-WASM
    * This is exported as `get_FrameRateExact`.
    * @returns {boolean}
    */
    get FrameRateExact() {
        var ret = wasm.jscameraconstraints_FrameRateExact(this.ptr);
        return ret !== 0;
    }
    /**
    * Sets the internal frame rate exact.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_FrameRateExact`.
    * @param {boolean} frame_rate_exact
    */
    set FrameRateExact(frame_rate_exact) {
        wasm.jscameraconstraints_set_FrameRateExact(this.ptr, frame_rate_exact);
    }
    /**
    * Gets the internal [`JSCameraResizeMode`].
    * # JS-WASM
    * This is exported as `get_ResizeMode`.
    * @returns {number}
    */
    get ResizeMode() {
        var ret = wasm.jscameraconstraints_ResizeMode(this.ptr);
        return ret >>> 0;
    }
    /**
    * Sets the internal [`JSCameraResizeMode`]
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_ResizeMode`.
    * @param {number} resize_mode
    */
    set ResizeMode(resize_mode) {
        wasm.jscameraconstraints_set_ResizeMode(this.ptr, resize_mode);
    }
    /**
    * Gets the internal resize mode exact.
    * # JS-WASM
    * This is exported as `get_ResizeModeExact`.
    * @returns {boolean}
    */
    get ResizeModeExact() {
        var ret = wasm.jscameraconstraints_ResizeModeExact(this.ptr);
        return ret !== 0;
    }
    /**
    * Sets the internal resize mode exact.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_ResizeModeExact`.
    * @param {boolean} resize_mode_exact
    */
    set ResizeModeExact(resize_mode_exact) {
        wasm.jscameraconstraints_set_ResizeModeExact(this.ptr, resize_mode_exact);
    }
    /**
    * Gets the internal device id.
    * # JS-WASM
    * This is exported as `get_DeviceId`.
    * @returns {string}
    */
    get DeviceId() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscameraconstraints_DeviceId(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Sets the internal device ID.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_DeviceId`.
    * @param {string} device_id
    */
    set DeviceId(device_id) {
        var ptr0 = passStringToWasm0(device_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.jscameraconstraints_set_DeviceId(this.ptr, ptr0, len0);
    }
    /**
    * Gets the internal device id exact.
    * # JS-WASM
    * This is exported as `get_DeviceIdExact`.
    * @returns {boolean}
    */
    get DeviceIdExact() {
        var ret = wasm.jscameraconstraints_DeviceIdExact(this.ptr);
        return ret !== 0;
    }
    /**
    * Sets the internal device ID exact.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_DeviceIdExact`.
    * @param {boolean} device_id_exact
    */
    set DeviceIdExact(device_id_exact) {
        wasm.jscameraconstraints_set_DeviceIdExact(this.ptr, device_id_exact);
    }
    /**
    * Gets the internal group id.
    * # JS-WASM
    * This is exported as `get_GroupId`.
    * @returns {string}
    */
    get GroupId() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscameraconstraints_GroupId(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Sets the internal group ID.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_GroupId`.
    * @param {string} group_id
    */
    set GroupId(group_id) {
        var ptr0 = passStringToWasm0(group_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.jscameraconstraints_set_GroupId(this.ptr, ptr0, len0);
    }
    /**
    * Gets the internal group id exact.
    * # JS-WASM
    * This is exported as `get_GroupIdExact`.
    * @returns {boolean}
    */
    get GroupIdExact() {
        var ret = wasm.jscameraconstraints_GroupIdExact(this.ptr);
        return ret !== 0;
    }
    /**
    * Sets the internal group ID exact.
    * Note that this doesn't affect the internal [`MediaStreamConstraints`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStreamConstraints.html) until you call
    * [`apply_constraints()`](crate::js_camera::JSCameraConstraints::apply_constraints)
    * # JS-WASM
    * This is exported as `set_GroupIdExact`.
    * @param {boolean} group_id_exact
    */
    set GroupIdExact(group_id_exact) {
        wasm.jscameraconstraints_set_GroupIdExact(this.ptr, group_id_exact);
    }
    /**
    * Applies any modified constraints.
    * # Security
    * WARNING: This function uses [`Function`](https://docs.rs/js-sys/0.3.52/js_sys/struct.Function.html) and if the [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) or [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId)
    * fields are invalid/contain malicious JS, it will run without restraint. Please take care as to make sure the [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) and the [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId)
    * fields are not malicious! (This usually boils down to not letting users input data directly)
    *
    * # Errors
    * This function may return an error on an invalid string in [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) or [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId) or if the
    * Javascript Function fails to run.
    * # JS-WASM
    * This is exported as `applyConstraints`. This may throw an error.
    */
    applyConstraints() {
        wasm.jscameraconstraints_applyConstraints(this.ptr);
    }
}

export class JSCameraConstraintsBuilder {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscameraconstraintsbuilder_free(ptr);
    }
    /**
    * Constructs a default [`JSCameraConstraintsBuilder`].
    * The constructed default [`JSCameraConstraintsBuilder`] has these settings:
    * - 480x234 min, 640x360 ideal, 1920x1080 max
    * - 10 FPS min, 15 FPS ideal, 30 FPS max
    * - 1.0 aspect ratio min, 1.77777777778 aspect ratio ideal, 2.0 aspect ratio max
    * - No `exact`s
    * # JS-WASM
    * This is exported as a constructor.
    */
    constructor() {
        var ret = wasm.jscameraconstraintsbuilder_new();
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the minimum resolution for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`width`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/width) and [`height`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/height).
    * # JS-WASM
    * This is exported as `set_MinResolution`.
    * @param {Resolution} min_resolution
    * @returns {CameraConstraintsBuilder}
    */
    set MinResolution(min_resolution) {
        const ptr = this.__destroy_into_raw();
        _assertClass(min_resolution, Resolution);
        var ptr0 = min_resolution.ptr;
        min_resolution.ptr = 0;
        var ret = wasm.jscameraconstraintsbuilder_set_MaxResolution(ptr, ptr0);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the preferred resolution for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`width`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/width) and [`height`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/height).
    * # JS-WASM
    * This is exported as `set_Resolution`.
    * @param {Resolution} new_resolution
    * @returns {CameraConstraintsBuilder}
    */
    set Resolution(new_resolution) {
        const ptr = this.__destroy_into_raw();
        _assertClass(new_resolution, Resolution);
        var ptr0 = new_resolution.ptr;
        new_resolution.ptr = 0;
        var ret = wasm.jscameraconstraintsbuilder_set_Resolution(ptr, ptr0);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the maximum resolution for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`width`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/width) and [`height`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/height).
    * # JS-WASM
    * This is exported as `set_MaxResolution`.
    * @param {Resolution} max_resolution
    * @returns {CameraConstraintsBuilder}
    */
    set MaxResolution(max_resolution) {
        const ptr = this.__destroy_into_raw();
        _assertClass(max_resolution, Resolution);
        var ptr0 = max_resolution.ptr;
        max_resolution.ptr = 0;
        var ret = wasm.jscameraconstraintsbuilder_set_MaxResolution(ptr, ptr0);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets whether the resolution fields ([`width`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/width), [`height`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/height)/[`resolution`](crate::js_camera::JSCameraConstraintsBuilder::resolution))
    * should use [`exact`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#constraints).
    * Note that this will make the builder ignore [`min_resolution`](crate::js_camera::JSCameraConstraintsBuilder::min_resolution) and [`max_resolution`](crate::js_camera::JSCameraConstraintsBuilder::max_resolution).
    * # JS-WASM
    * This is exported as `set_ResolutionExact`.
    * @param {boolean} value
    * @returns {CameraConstraintsBuilder}
    */
    set ResolutionExact(value) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_ResolutionExact(ptr, value);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the minimum aspect ratio of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`aspectRatio`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/aspectRatio).
    * # JS-WASM
    * This is exported as `set_MinAspectRatio`.
    * @param {number} ratio
    * @returns {CameraConstraintsBuilder}
    */
    set MinAspectRatio(ratio) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_MinAspectRatio(ptr, ratio);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the aspect ratio of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`aspectRatio`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/aspectRatio).
    * # JS-WASM
    * This is exported as `set_AspectRatio`.
    * @param {number} ratio
    * @returns {CameraConstraintsBuilder}
    */
    set AspectRatio(ratio) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_AspectRatio(ptr, ratio);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the maximum aspect ratio of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`aspectRatio`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/aspectRatio).
    * # JS-WASM
    * This is exported as `set_MaxAspectRatio`.
    * @param {number} ratio
    * @returns {CameraConstraintsBuilder}
    */
    set MaxAspectRatio(ratio) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_MaxAspectRatio(ptr, ratio);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets whether the [`aspect_ratio`](crate::js_camera::JSCameraConstraintsBuilder::aspect_ratio) field should use [`exact`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#constraints).
    * Note that this will make the builder ignore [`min_aspect_ratio`](crate::js_camera::JSCameraConstraintsBuilder::min_aspect_ratio) and [`max_aspect_ratio`](crate::js_camera::JSCameraConstraintsBuilder::max_aspect_ratio).
    * # JS-WASM
    * This is exported as `set_AspectRatioExact`.
    * @param {boolean} value
    * @returns {CameraConstraintsBuilder}
    */
    set AspectRatioExact(value) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_AspectRatioExact(ptr, value);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the facing mode of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`facingMode`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode).
    * # JS-WASM
    * This is exported as `set_FacingMode`.
    * @param {number} facing_mode
    * @returns {CameraConstraintsBuilder}
    */
    set FacingMode(facing_mode) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_FacingMode(ptr, facing_mode);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets whether the [`facing_mode`](crate::js_camera::JSCameraConstraintsBuilder::facing_mode) field should use [`exact`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#constraints).
    * # JS-WASM
    * This is exported as `set_FacingModeExact`.
    * @param {boolean} value
    * @returns {CameraConstraintsBuilder}
    */
    set FacingModeExact(value) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_FacingModeExact(ptr, value);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the minimum frame rate of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`frameRate`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/frameRate).
    * # JS-WASM
    * This is exported as `set_MinFrameRate`.
    * @param {number} fps
    * @returns {CameraConstraintsBuilder}
    */
    set MinFrameRate(fps) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_MinFrameRate(ptr, fps);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the frame rate of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`frameRate`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/frameRate).
    * # JS-WASM
    * This is exported as `set_FrameRate`.
    * @param {number} fps
    * @returns {CameraConstraintsBuilder}
    */
    set FrameRate(fps) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_FrameRate(ptr, fps);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the maximum frame rate of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`frameRate`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/frameRate).
    * # JS-WASM
    * This is exported as `set_MaxFrameRate`.
    * @param {number} fps
    * @returns {CameraConstraintsBuilder}
    */
    set MaxFrameRate(fps) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_MaxFrameRate(ptr, fps);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets whether the [`frame_rate`](crate::js_camera::JSCameraConstraintsBuilder::frame_rate) field should use [`exact`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#constraints).
    * Note that this will make the builder ignore [`min_frame_rate`](crate::js_camera::JSCameraConstraintsBuilder::min_frame_rate) and [`max_frame_rate`](crate::js_camera::JSCameraConstraintsBuilder::max_frame_rate).
    * # JS-WASM
    * This is exported as `set_FrameRateExact`.
    * @param {boolean} value
    * @returns {CameraConstraintsBuilder}
    */
    set FrameRateExact(value) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_FrameRateExact(ptr, value);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the resize mode of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`resizeMode`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#resizemode).
    * # JS-WASM
    * This is exported as `set_ResizeMode`.
    * @param {number} resize_mode
    * @returns {CameraConstraintsBuilder}
    */
    set ResizeMode(resize_mode) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_ResizeMode(ptr, resize_mode);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets whether the [`resize_mode`](crate::js_camera::JSCameraConstraintsBuilder::resize_mode) field should use [`exact`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#constraints).
    * # JS-WASM
    * This is exported as `set_ResizeModeExact`.
    * @param {boolean} value
    * @returns {CameraConstraintsBuilder}
    */
    set ResizeModeExact(value) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_ResizeModeExact(ptr, value);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the device ID of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`deviceId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/deviceId).
    * # JS-WASM
    * This is exported as `set_DeviceId`.
    * @param {string} id
    * @returns {CameraConstraintsBuilder}
    */
    set DeviceId(id) {
        const ptr = this.__destroy_into_raw();
        var ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.jscameraconstraintsbuilder_set_DeviceId(ptr, ptr0, len0);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets whether the [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) field should use [`exact`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#constraints).
    * # JS-WASM
    * This is exported as `set_DeviceIdExact`.
    * @param {boolean} value
    * @returns {CameraConstraintsBuilder}
    */
    set DeviceIdExact(value) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_DeviceIdExact(ptr, value);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets the group ID of the resulting constraint for the [`JSCameraConstraintsBuilder`].
    *
    * Sets [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId).
    * # JS-WASM
    * This is exported as `set_GroupId`.
    * @param {string} id
    * @returns {CameraConstraintsBuilder}
    */
    set GroupId(id) {
        const ptr = this.__destroy_into_raw();
        var ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.jscameraconstraintsbuilder_set_GroupId(ptr, ptr0, len0);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Sets whether the [`group_id`](crate::js_camera::JSCameraConstraintsBuilder::group_id) field should use [`exact`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#constraints).
    * # JS-WASM
    * This is exported as `set_GroupIdExact`.
    * @param {boolean} value
    * @returns {CameraConstraintsBuilder}
    */
    set GroupIdExact(value) {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_set_GroupIdExact(ptr, value);
        return CameraConstraintsBuilder.__wrap(ret);
    }
    /**
    * Builds the [`JSCameraConstraints`]. Wrapper for [`build`](crate::js_camera::JSCameraConstraintsBuilder::build)
    *
    * Fields that use exact are marked `exact`, otherwise are marked with `ideal`. If min-max are involved, they will use `min` and `max` accordingly.
    * # Security
    * WARNING: This function uses [`Function`](https://docs.rs/js-sys/0.3.52/js_sys/struct.Function.html) and if the [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) or [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId)
    * fields are invalid/contain malicious JS, it will run without restraint. Please take care as to make sure the [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) and the [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId)
    * fields are not malicious! (This usually boils down to not letting users input data directly).
    *
    * # Errors
    * This function may return an error on an invalid string in [`device_id`](crate::js_camera::JSCameraConstraintsBuilder::device_id) or [`groupId`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/groupId) or if the
    * Javascript Function fails to run.
    * # JS-WASM
    * This is exported as `build`. It may throw an error.
    * @returns {CameraConstraints}
    */
    buildCameraConstraints() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.jscameraconstraintsbuilder_buildCameraConstraints(ptr);
        return CameraConstraints.__wrap(ret);
    }
}
/**
* A wrapper around a [`MediaStream`](https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.MediaStream.html)
* # JS-WASM
* This is exported as `NOKCamera`.
*/
export class NOKCamera {

    static __wrap(ptr) {
        const obj = Object.create(NOKCamera.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nokcamera_free(ptr);
    }
}
/**
* Describes a Resolution.
* This struct consists of a Width and a Height value (x,y). <br>
* Note: the [`Ord`] implementation of this struct is flipped from highest to lowest.
* # JS-WASM
* This is exported as `Resolution`
*/
export class Resolution {

    static __wrap(ptr) {
        const obj = Object.create(Resolution.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_resolution_free(ptr);
    }
    /**
    * @returns {number}
    */
    get width_x() {
        var ret = wasm.__wbg_get_resolution_width_x(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set width_x(arg0) {
        wasm.__wbg_set_resolution_width_x(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get height_y() {
        var ret = wasm.__wbg_get_resolution_height_y(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set height_y(arg0) {
        wasm.__wbg_set_resolution_height_y(this.ptr, arg0);
    }
    /**
    * Create a new resolution from 2 image size coordinates.
    * # JS-WASM
    * This is exported as a constructor for [`Resolution`].
    * @param {number} x
    * @param {number} y
    */
    constructor(x, y) {
        var ret = wasm.resolution_new(x, y);
        return Resolution.__wrap(ret);
    }
    /**
    * Get the width of Resolution
    * # JS-WASM
    * This is exported as `get_Width`.
    * @returns {number}
    */
    get Width() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.resolution_Width(ptr);
        return ret >>> 0;
    }
    /**
    * Get the height of Resolution
    * # JS-WASM
    * This is exported as `get_Height`.
    * @returns {number}
    */
    get Height() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.resolution_Height(ptr);
        return ret >>> 0;
    }
    /**
    * Get the x (width) of Resolution
    * @returns {number}
    */
    x() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.resolution_Width(ptr);
        return ret >>> 0;
    }
    /**
    * Get the y (height) of Resolution
    * @returns {number}
    */
    y() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.resolution_Height(ptr);
        return ret >>> 0;
    }
}

export function __wbindgen_string_new(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbg_nokcamera_new(arg0) {
    var ret = NOKCamera.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_number_new(arg0) {
    var ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_object_clone_ref(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    var ret = false;
    return ret;
};

export function __wbg_camerainfo_new(arg0) {
    var ret = CameraInfo.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_instanceof_Window_9c4fd26090e1d029(arg0) {
    var ret = getObject(arg0) instanceof Window;
    return ret;
};

export function __wbg_document_249e9cf340780f93(arg0) {
    var ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_navigator_fdf3521d0e190a9b(arg0) {
    var ret = getObject(arg0).navigator;
    return addHeapObject(ret);
};

export function __wbg_createElement_ba61aad8af6be7f4() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getElementById_2ee254bbb67b6ae1(arg0, arg1, arg2) {
    var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_clone_145f41ee37450a09(arg0) {
    var ret = getObject(arg0).clone();
    return addHeapObject(ret);
};

export function __wbg_instanceof_MediaDeviceInfo_c114f21ce814c0c1(arg0) {
    var ret = getObject(arg0) instanceof MediaDeviceInfo;
    return ret;
};

export function __wbg_deviceId_43087f5284cd4616(arg0, arg1) {
    var ret = getObject(arg1).deviceId;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_kind_edfc7c230c6229d4(arg0) {
    var ret = getObject(arg0).kind;
    return addHeapObject(ret);
};

export function __wbg_label_c9e2693761406b45(arg0, arg1) {
    var ret = getObject(arg1).label;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_groupId_bcd2aac231ef907e(arg0, arg1) {
    var ret = getObject(arg1).groupId;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_data_7db9e348ce1855fa(arg0, arg1) {
    var ret = getObject(arg1).data;
    var ptr0 = passArray8ToWasm0(ret, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_enumerateDevices_d31f8ad01062db66() { return handleError(function (arg0) {
    var ret = getObject(arg0).enumerateDevices();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getUserMedia_307474a524d5b8f0() { return handleError(function (arg0) {
    var ret = getObject(arg0).getUserMedia();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getUserMedia_43dccb6c4bc010a6() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).getUserMedia(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_setAttribute_0b50656f1ccc45bf() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_instanceof_CanvasRenderingContext2d_eea9cd931eb496b7(arg0) {
    var ret = getObject(arg0) instanceof CanvasRenderingContext2D;
    return ret;
};

export function __wbg_drawImage_932bd490db48b1d4() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5);
}, arguments) };

export function __wbg_getImageData_6e56dc172cd2ed36() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var ret = getObject(arg0).getImageData(arg1, arg2, arg3, arg4);
    return addHeapObject(ret);
}, arguments) };

export function __wbg_setsrcObject_cf10011aa69a6341(arg0, arg1) {
    getObject(arg0).srcObject = getObject(arg1);
};

export function __wbg_instanceof_HtmlCanvasElement_e0e251da2aa0b541(arg0) {
    var ret = getObject(arg0) instanceof HTMLCanvasElement;
    return ret;
};

export function __wbg_setwidth_fd251e9da5abcced(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export function __wbg_setheight_5b882973e84fa13c(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};

export function __wbg_getContext_d778ffc8203f64ae() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_toDataURL_b102ad8b69bcfda4() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var ret = getObject(arg1).toDataURL(getStringFromWasm0(arg2, arg3), getObject(arg4));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };

export function __wbg_mediaDevices_73cffc9c73b5584a() { return handleError(function (arg0) {
    var ret = getObject(arg0).mediaDevices;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_instanceof_HtmlVideoElement_16b7e72c92542fa4(arg0) {
    var ret = getObject(arg0) instanceof HTMLVideoElement;
    return ret;
};

export function __wbg_setwidth_f98394ec7accd8f5(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export function __wbg_videoWidth_0651aae47a30560a(arg0) {
    var ret = getObject(arg0).videoWidth;
    return ret;
};

export function __wbg_videoHeight_0cce9c78bfe90582(arg0) {
    var ret = getObject(arg0).videoHeight;
    return ret;
};

export function __wbg_appendChild_6ae001e6d3556190() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).appendChild(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_a4f61a2fb16987bc(arg0, arg1) {
    var ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_length_f86925e8c69110ea(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

export function __wbg_new_fc8ee963685ada41() {
    var ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_newnoargs_68424965d85fcb08(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_9698e9b9c4668ae0() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_from_cfe9a017acc727a1(arg0) {
    var ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_push_ef0a52724cfe2a05(arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export function __wbg_call_4438b4bab9ab5268() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_ae366b99da42660b(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_204(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        var ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_resolve_84f06d050082a771(arg0) {
    var ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_then_fd35af33296a58d7(arg0, arg1) {
    var ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_c919ca41618a24c2(arg0, arg1, arg2) {
    var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_self_3df7c33e222cd53b() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_0f90182e6c405ff2() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_787cfd4f25a35141() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_af2eb7b1369372ed() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbindgen_is_string(arg0) {
    var ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbindgen_debug_string(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_rethrow(arg0) {
    throw takeObject(arg0);
};

export function __wbindgen_closure_wrapper712(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 65, __wbg_adapter_24);
    return addHeapObject(ret);
};

