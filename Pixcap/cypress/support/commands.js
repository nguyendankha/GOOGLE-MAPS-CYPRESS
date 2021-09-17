import {addMatchImageSnapshotCommand} from 'cypress-image-snapshot/command';
import {
    getLatData,
    getLongData,
    getLongLatZoomDataFromURL,
    getZoomData,
    panMap,
    zoomFunction
} from "../utilities/dataManipulation";

addMatchImageSnapshotCommand({
    failureThreshold: 0.03, // threshold for entire image
    failureThresholdType: 'percent', // percent of image or number of pixels
    customDiffConfig: {threshold: 0.1}, // threshold for each pixel
    capture: 'viewport', // capture viewport in screenshot
});

Cypress.Commands.add('goToGardenBaysGoogleMapURL', () => {
    cy.visit(Cypress.env('googleMapsURLs').gardenBays);
})

Cypress.Commands.add('compareZoomLevelAfterZooming', ({element, deltaX, deltaY}) => {
    cy.url().then(currentURL => {
        cy.log(currentURL);
        let data = getLongLatZoomDataFromURL(currentURL);
        let long = getLongData(data);
        let lat = getLatData(data);
        let zoom = getZoomData(data);
        cy.wrap(long).as('OLDLONG');
        cy.wrap(lat).as('OLDLAT');
        cy.wrap(zoom).as('OLDZOOM');

        zoomFunction({
            element: element,
            deltaX: deltaX,
            deltaY: deltaY
        })

        cy.url().then(newUrl => {
            cy.log(newUrl);
            let data = getLongLatZoomDataFromURL(newUrl);
            let long = getLongData(data);
            let lat = getLatData(data);
            let zoom = getZoomData(data);
            cy.wrap(long).as('NEWLONG');
            cy.wrap(lat).as('NEWLAT');
            cy.wrap(zoom).as('NEWZOOM');
        });

        cy.get('@OLDZOOM').then(oldZoom => {
            cy.get('@NEWZOOM').then(zoom => {
                if (deltaY < 0) {
                    expect(zoom).to.be.greaterThan(oldZoom);
                } else {
                    expect(zoom).to.be.lessThan(oldZoom);
                }
            })
        })
    });
});

Cypress.Commands.add('verifyPanMapSuccessfully', ({canvasElement, startPoint, scrollTo}) => {
    cy.url().then(currentURL => {
        cy.log(currentURL);

        panMap({
            canvasElement: canvasElement,
            startPoint: startPoint,
            scrollTo: scrollTo
        });

        cy.url().then(newUrl => {
            cy.log(newUrl);
            let isMapNotPanned = (newUrl === currentURL);
            if (isMapNotPanned) {
                expect(newUrl).to.be.eq(currentURL);
            } else {
                expect(newUrl).to.be.not.eq(currentURL);
            }
        });
    });
});

Cypress.Commands.add(
    'dragMapFromCenter',
    {prevSubject: 'element'},
    (element, {xMoveFactor, yMoveFactor}) => {
        // # cy.get('canvas').dragMapFromCenter({ xMoveFactor: 0.25, yMoveFactor: -0.5 })
        // Get the raw HTML element from jQuery wrapper
        const canvas = element.get(0);
        const rect = canvas.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        // Start dragging from the center of the map
        cy.log('mousedown', {
            clientX: center.x,
            clientY: center.y
        });
        canvas.dispatchEvent(
            new MouseEvent('mousedown', {
                clientX: center.x,
                clientY: center.y
            })
        );

        // Let Leaflet know the mouse has started to move. The diff between
        // mousedown and mousemove event needs to be large enough so that Leaflet
        // will really think the mouse is moving and not that it was a click where
        // the mouse moved just a tiny amount.
        cy.log('mousemove', {
            clientX: center.x,
            clientY: center.y + 5
        });
        canvas.dispatchEvent(
            new MouseEvent('mousemove', {
                clientX: center.x,
                clientY: center.y + 5,
                bubbles: true
            })
        );

        // After Leaflet knows mouse is moving, we move the mouse as depicted by the options.
        cy.log('mousemove', {
            clientX: center.x + rect.width * xMoveFactor,
            clientY: center.y + rect.height * yMoveFactor
        });
        canvas.dispatchEvent(
            new MouseEvent('mousemove', {
                clientX: center.x + rect.width * xMoveFactor,
                clientY: center.y + rect.height * yMoveFactor,
                bubbles: true
            })
        );

        // Now when we "release" the mouse, Leaflet will fire a "dragend" event and
        // the search should register that the drag has stopped and run callbacks.
        cy.log('mouseup', {
            clientX: center.x + rect.width * xMoveFactor,
            clientY: center.y + rect.height * yMoveFactor
        });
        requestAnimationFrame(() => {
            canvas.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: center.x + rect.width * xMoveFactor,
                    clientY: center.y + rect.height * yMoveFactor,
                    bubbles: true
                })
            );
        });
    }
);