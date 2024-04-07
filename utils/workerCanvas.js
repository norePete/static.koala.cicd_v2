let global = {};

async function sleep(x) {
  await new Promise(resolve => setTimeout(resolve, x));
}

function convertToIndex(x, y, width) {
    // for a given x,y coordinate the corresponding
    // index in a 1D array can be found as follows:
    // preceeding number of rows * number of pixels in 
    // each row gets us to the correct y position, adding
    // the x coordinate gets us to the correct x, y position
    // (everything is multiplied by 3 to account for rgb color channels)
    return ((Math.floor(y) - 6) * width * 4) + (x * 4) - 20;
}

function findOffset(x, y, offsetX, offsetY, width, height) {
    if (y - offsetY > 0 && y - offsetY < height && x - offsetX > 0 && x - offsetX < width) { 
        return [x - offsetX, y - offsetY];

    } else {
        return [x,y];
    }
}

function findTopAndLeft(x, y, length, width, height) {
    let arr = [];
    for (let i = 0; i < length; i++) {
        if (y - i > 0 && y - i < height) { arr.push([x, y - i]); }
        if (x - i > 0 && x - i < width) { arr.push([x - i, y]); }
    }
    return arr;
}

function findBottomAndRight(x, y, length, width, height) {
    let arr = [];
    for (let i = 0; i < length; i++) {
        if (y + i > 0 && y + i < height) { arr.push([x, y + i]); }
        if (x + i > 0 && x + i < width) { arr.push([x + i, y]); }
    }
    return arr;
}

function findSquare(x, y, length, width, height) {
    const topAndLeft = findTopAndLeft(
        ...findOffset(x, y, -length, -length, width, height),
        length * 2,
        width,
        height);
    const bottomAndRight = findBottomAndRight(
        ...findOffset(x, y, length, length, width, height),
        length * 2,
        width,
        height);
    return [...topAndLeft, ...bottomAndRight];
}

function findCross(x, y, size, width, height) {
    let arr = [];
    for (let i = 0; i < size; i++) {
        if (y - i > 0) { arr.push([x, y - i]); }
        if (x - i > 0) { arr.push([x - i, y]); }
        if (x + i < width) { arr.push([x + i, y]); }
        if (y + i < height) { arr.push([x, y + i]); }
    }
    return arr;
}

function verticalLine(x, y, size, width, height) {
    let arr = [];
    for (let i = 0; i < size; i++) {
        if (y - i > 0) { arr.push([x, y - i]); }
        if (y + i < height) { arr.push([x, y + i]); }
    }
    return arr;
}

function horizontalLine(x, y, size, width, height) {
    let arr = [];
    for (let i = 0; i < size; i++) {
        if (x - i > 0) { arr.push([x - i, y]); }
        if (x + i < width) { arr.push([x + i, y]); }
    }
    return arr;
}


const run = async (x, y, messagePipe) => {
    const sideLength = [4, 6, 6, 8, 8, 4];
    let near_pixels = [];
    if (x % 4 === 0) {
        near_pixels = horizontalLine(x, y, sideLength[x % 6], global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    } else {
        near_pixels = verticalLine(x, y, sideLength[x % 6], global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    }
    const indices = near_pixels.map(coords => convertToIndex(coords[0], coords[1], global[messagePipe].canvas.width));

    global[messagePipe].globalBuffer.threads.push([2000, indices]);
    // push image data to new thread,
    // push original data to same thread
    // mutate each thread

    //ctx.putImageData(image_data, 0, 0);
};

self.onmessage = async (event) => {

    if (event.data.label === "mouseCoord") {
        await mouseEffect(event.data.x, event.data.y, event.data.width, event.data.height, event.data.image_width, event.data.image_height, event.data.message_pipe);

    } else if (event.data.label === "init") {
        const messagePipe = event.data.messagePipe;

        global[messagePipe] = {
            canvas : null,
            ctx : null,
            count : 0,
            debounce_queue : [],
            original : [],
            globalBuffer: {
                threads: [],
            },
        }


        global[messagePipe].canvas = event.data.canvas;
        imageUrl = event.data.imageUrl;
        const imageBlob = await loadImage(imageUrl);
        start(global[messagePipe].canvas, imageBlob, global, messagePipe);
    }

};

async function on(indices, messagePipe) {
    const image_data = global[messagePipe].ctx.getImageData(0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    const data = image_data.data;
    for (let i = 0; i < indices.length; i++) {
        data[indices[i]] = 35;
        data[indices[i] + 1] = 35;
        data[indices[i] + 2] = 35;
    }
    global[messagePipe].ctx.putImageData(image_data, 0, 0);
}

async function off(indices, messagePipe) {
    const image_data_reset = global[messagePipe].ctx.getImageData(0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    const data_reset = image_data_reset.data;
    for (let i = 0; i < indices.length; i++) {
        data_reset[indices[i] + 0] = global[messagePipe].original[indices[i] + 0];
        data_reset[indices[i] + 1] = global[messagePipe].original[indices[i] + 1];
        data_reset[indices[i] + 2] = global[messagePipe].original[indices[i] + 2];
    }
    global[messagePipe].ctx.putImageData(image_data_reset, 0, 0);
}

async function dark(indices, messagePipe) {
    const image_data_reset = global[messagePipe].ctx.getImageData(0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    const data_reset = image_data_reset.data;
    for (let i = 0; i < indices.length; i++) {
        data_reset[indices[i] + 0] = 5;
        data_reset[indices[i] + 1] = 5; 
        data_reset[indices[i] + 2] = 5; 
    }
    global[messagePipe].ctx.putImageData(image_data_reset, 0, 0);
}
async function darken(indices, messagePipe) {
    const image_data_reset = global[messagePipe].ctx.getImageData(0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    const data_reset = image_data_reset.data;
    for (let i = 0; i < indices.length; i++) {
        data_reset[indices[i] + 0] -= 50;
        data_reset[indices[i] + 1] -= 50; 
        data_reset[indices[i] + 2] -= 50; 
    }
    global[messagePipe].ctx.putImageData(image_data_reset, 0, 0);
}

async function transform(indices, width, height) {
    const step_y1 = height * 0.0005;
    const step_x1 = width * 0.0005;
    const step_y2 = height * 0.0005;
    const step_x2 = width * 0.0005;

    const up = -1 * step_y1 * width * 4;
    const down = step_y2 * width * 4;
    const left = -1 * step_x1 * 4;
    const right = step_x2 * 4;

    const clone1 = indices.map(x => x 
        + (Math.floor(Math.random() * 4) * up)
        + (Math.floor(Math.random() * 4) * down)
        + (Math.floor(Math.random() * 4) * left)
        + (Math.floor(Math.random() * 4) * right));
    const clone2 = indices.map(x => x 
        + (Math.floor(Math.random() * 6) * up)
        + (Math.floor(Math.random() * 6) * down)
        + (Math.floor(Math.random() * 6) * left)
        + (Math.floor(Math.random() * 6) * right));
    const clone3 = indices.map(x => x 
        + (Math.floor(Math.random() * 2) * up)
        + (Math.floor(Math.random() * 2) * down)
        + (Math.floor(Math.random() * 2) * left)
        + (Math.floor(Math.random() * 2) * right));
    return [...clone1, clone2, clone3];
}

async function repeat(number, f) {
    for (let i = 0; i < number; i++) {
        await f();
    }
}

async function mouseEffect(x, y, width, height, image_width, image_height, messagePipe) {
    global[messagePipe].count += 1;
    const percentX = x/width;
    const percentY = y/ height;
    const personal_count = global[messagePipe].count;
    global[messagePipe].debounce_queue.unshift([percentX, percentY]);
    await sleep(5);
    if (personal_count === global[messagePipe].count) {
        await run(Math.floor(global[messagePipe].debounce_queue[0][0] * image_width), Math.floor(global[messagePipe].debounce_queue[0][1] * image_height), messagePipe);
        global[messagePipe].count = 0;
        global[messagePipe].debounce_queue = [];
    }
    const selfThreads = global[messagePipe].globalBuffer.threads;
    // clear threads
    global[messagePipe].globalBuffer.threads = [];
    // check if threads exist
    if (selfThreads.length > 0) {
        // pull all indices from all threads
        let indices = []
        for (let i = 0; i < selfThreads.length; i++) {
            indices.push(...selfThreads[i][1]);
        }
        const indices2 = await transform(indices, image_width, image_height);
        const indices3 = await transform(indices, image_width, image_height);
        await on(indices, messagePipe);
        await on(indices2, messagePipe);
        await on(indices3, messagePipe);
        await repeat(1, async () => {
            await sleep(100);
            //await off(indices, messagePipe);
            await dark(indices, messagePipe);
            await dark(indices2, messagePipe);
            await dark(indices3, messagePipe);
        });
    } else {
        console.log("else");
        // copy original to buffer
        // write indices over original
        const image_data = global[messagePipe].ctx.getImageData(0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
        const data = image_data.data;
        console.log(data);
    }

}

async function loadImage(url) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return blob;
}

async function start(canvas, imageBlob, global, messagePipe) {
    global[messagePipe].ctx = global[messagePipe].canvas.getContext("2d");
    const bitmap = await createImageBitmap(imageBlob);
    global[messagePipe].ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    const image_data = global[messagePipe].ctx.getImageData(0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    const data = image_data.data 
    global[messagePipe].original = [...data];

    const image_data_black = global[messagePipe].ctx.getImageData(0, 0, global[messagePipe].canvas.width, global[messagePipe].canvas.height);
    const data_black = image_data_black.data;
    for (let i = 0; i < data_black.length; i += 4) {
        data_black[i] = 0;
        data_black[i + 1] = 0;
        data_black[i + 2] = 0;
    }
    global[messagePipe].ctx.putImageData(image_data_black, 0, 0);
}

