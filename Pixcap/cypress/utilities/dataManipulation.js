export const getLongLatZoomDataFromURL = (url) => {
    expect(url).includes('z/');
    let regularExpressPattern = "(?<=\\@)(.*?)(?=\\/)";
    let longLatZoom = url.match(regularExpressPattern);
    let long = null;
    let lat = null;
    let zoom = null;
    if (longLatZoom.length != null) {
        let splittedLongLatZoom = longLatZoom[0].split(',');
        long = splittedLongLatZoom[1];
        lat = splittedLongLatZoom[0];
        zoom = splittedLongLatZoom[2].substring(0, splittedLongLatZoom[2].length - 1);
    }
    return [long, lat, zoom];
};

export const getLongData = (data) => {
    return parseFloat(data[1]);
};

export const getLatData = (data) => {
    return parseFloat(data[0]);
};

export const getZoomData = (data) => {
    return parseFloat(data[2]);
};

export const zoomFunction = ({element, deltaX, deltaY}) => {
    cy
        .get(element)
        .should('be.visible')
        .should('not.be.disabled')
        .trigger('wheel', {
            deltaX: deltaX,
            deltaY: deltaY // Positive number for zooming out, Negative number for zooming in
        })
        .wait(5000);
};

/**
 * // THIS IS THE POINT THAT WE PAN THE MAP
 * IF WE WANT TO PAN THE MAP VERTICALLY: RETAIN THE "X" VALUE (X VALUE EQUAL THE "MOUSEMOVE"'S X VALUE, CHANGE THE Y VALUE ONLY)
 * IF WE WANT TO PAN THE MAP HORIZONTALLY: RETAIN THE "Y" VALUE (Y VALUE EQUAL THE "MOUSEMOVE"'S Y VALUE, CHANGE THE X VALUE ONLY)
 * Y: IF Y VALUE < "MOUSEMOVE"'S Y VALUE, SCROLL TO THE BOTTOM
 * Y: IF Y VALUE > "MOUSEMOVE"'S Y VALUE, SCROLL TO THE TOP
 * X: IF X VALUE < "MOUSEMOVE"'S X VALUE, SCROLL TO THE RIGHT
 * X: IF X VALUE > "MOUSEMOVE"'S X VALUE, SCROLL TO THE LEFT
 */
export const panMap = ({canvasElement, startPoint, scrollTo}) => {
    const START_POINT_X = startPoint.x;
    const START_POINT_Y = startPoint.y;
    let NEW_POINT_POSITION = scrollTo.position;
    let NEW_POINT_X = scrollTo.x;
    let NEW_POINT_Y = scrollTo.y;

    cy
        .get(canvasElement)
        .should('be.visible')
        .should('not.be.disabled')
        .then($canvas => {
            const CANVAS_WIDTH = $canvas.width();
            const CANVAS_HEIGHT = $canvas.height();
            if ((START_POINT_X > CANVAS_HEIGHT || START_POINT_Y > CANVAS_WIDTH) && (NEW_POINT_X > CANVAS_HEIGHT || NEW_POINT_Y > CANVAS_WIDTH)) {
                cy.log('The map will NOT pan or scroll because the point value is greater than the map size!!! Please help to check & try again');
            } else if ((START_POINT_X === 0 || START_POINT_Y === 0) && (NEW_POINT_X === 0 || NEW_POINT_Y === 0)) {
                cy.log('The map will NOT pan or scroll because the point value is 0!!! Please help to check & try again');
            } else {
                cy
                    .get('#pane button[aria-label="Collapse side panel"]')
                    .should('be.visible')
                    .should('be.enabled')
                    .should('not.be.disabled')
                    .click();
                if (NEW_POINT_POSITION === 'LEFT') {
                    NEW_POINT_X = START_POINT_X + 50;
                    cy
                        .wrap($canvas)
                        .trigger("mousedown", {button: 0}, {force: true})
                        .trigger("mousemove", START_POINT_X, START_POINT_Y, {force: true})
                        .click(NEW_POINT_X, START_POINT_Y);
                } else if (NEW_POINT_POSITION === 'RIGHT') {
                    NEW_POINT_X = START_POINT_X - 50;
                    cy
                        .wrap($canvas)
                        .trigger("mousedown", {button: 0}, {force: true})
                        .trigger("mousemove", START_POINT_X, START_POINT_Y, {force: true})
                        .click(NEW_POINT_X, START_POINT_Y);
                } else if (NEW_POINT_POSITION === 'TOP') {
                    NEW_POINT_Y = START_POINT_Y + 50;
                    cy
                        .wrap($canvas)
                        .trigger("mousedown", {button: 0}, {force: true})
                        .trigger("mousemove", START_POINT_X, START_POINT_Y, {force: true})
                        .click(START_POINT_X, NEW_POINT_Y);
                } else if (NEW_POINT_POSITION === 'BOTTOM') {
                    NEW_POINT_Y = START_POINT_Y - 50;
                    cy
                        .wrap($canvas)
                        .trigger("mousedown", {button: 0}, {force: true})
                        .trigger("mousemove", START_POINT_X, START_POINT_Y, {force: true})
                        .click(START_POINT_X, NEW_POINT_Y);
                } else if (NEW_POINT_POSITION === null) {
                    cy
                        .wrap($canvas)
                        .trigger("mousedown", {button: 0}, {force: true})
                        .trigger("mousemove", START_POINT_X, START_POINT_Y, {force: true})
                        .click(NEW_POINT_X, NEW_POINT_Y);
                }
            }
        });
    cy.wait(5000);
};

function initMap() {
    const marina = [1.2846547, 103.858805];
    console.log(createInfoWindowContent(marina, 3));
    // const map = new google.maps.Map(document.getElementById("map"), {
    //     center: chicago,
    //     zoom: 3,
    // });
    // const coordInfoWindow = new google.maps.InfoWindow();
    //
    // coordInfoWindow.setContent(createInfoWindowContent(chicago, map.getZoom()));
    // coordInfoWindow.setPosition(chicago);
    // coordInfoWindow.open(map);
    // map.addListener("zoom_changed", () => {
    //     coordInfoWindow.setContent(createInfoWindowContent(chicago, map.getZoom()));
    //     coordInfoWindow.open(map);
    // });
}

const TILE_SIZE = 256;

function createInfoWindowContent(latLng, zoom) {
    const scale = 1 << zoom;
    console.log('scale', scale)
    const worldCoordinate = project(latLng);
    const pixelCoordinate = [
        Math.floor(worldCoordinate[0] * scale),
        Math.floor(worldCoordinate[1] * scale)
    ];
    const tileCoordinate = [
        Math.floor((worldCoordinate[0] * scale) / TILE_SIZE),
        Math.floor((worldCoordinate[1] * scale) / TILE_SIZE)
    ];
    return pixelCoordinate;
}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) {
    let siny = Math.sin((latLng[0] * Math.PI) / 180);
    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);
    return [
        TILE_SIZE * (0.5 + latLng[1] / 360),
        TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
    ];
}