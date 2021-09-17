import {
    scrollToBottom,
    scrollToLeft,
    scrollToRight,
    scrollToTop,
    SEARCH_LOCATION_KEYWORD_MARINA_BAY,
    startPoint
} from "../../utilities/googleMapsData";
import {
    GOOGLE_MAPS_CANVAS_ELEMENT,
    SEARCH_BOX_ELEMENT,
    SIDE_PANEL_ELEMENT
} from "../../page-elements/google-maps-elements";

context('Google Maps visual testing', () => {
    it('Should match image snapshot with cypress-image-snapshot plugin', function () {
        cy.goToGardenBaysGoogleMapURL();
        cy
            .get(SIDE_PANEL_ELEMENT)
            .should('be.visible')
            .should('be.enabled')
            .should('not.be.disabled')
            .click();
        // Wait for Canvas image of Google maps loaded successfully
        cy.wait(8000);
        cy
            .get(GOOGLE_MAPS_CANVAS_ELEMENT)
            .should('be.visible')
            .should('not.be.disabled')
            .matchImageSnapshot('Actions -- Should match image snapshot', {
                failureThreshold: 0.03, // threshold for entire image
                failureThresholdType: 'percent', // percent of image or number of pixels
                customDiffConfig: {threshold: 0.1}, // threshold for each pixel
                capture: 'viewport', // capture viewport in screenshot
            });
    });

    it('should get Canvas element from Google Maps and Zoom in', () => {
        cy.goToGardenBaysGoogleMapURL();
        cy.compareZoomLevelAfterZooming({
            element: GOOGLE_MAPS_CANVAS_ELEMENT,
            deltaX: 0,
            deltaY: -3000
        });
    });

    it('should get Canvas element from Google Maps and Zoom out', () => {
        cy.goToGardenBaysGoogleMapURL();
        cy.compareZoomLevelAfterZooming({
            element: GOOGLE_MAPS_CANVAS_ELEMENT,
            deltaX: 0,
            deltaY: 3000
        });
    });

    it('should search Marina Bay Sands Singapore from Search box and select the search result item to select the location marker', function () {
        const SEARCH_RESULT_ITEM_ELEMENT = `//span[contains(text(), "${SEARCH_LOCATION_KEYWORD_MARINA_BAY}")]`;
        cy.goToGardenBaysGoogleMapURL();
        cy
            .get(SEARCH_BOX_ELEMENT)
            .should('be.visible')
            .should('not.be.disabled')
            .click()
            .clear()
            .type(SEARCH_LOCATION_KEYWORD_MARINA_BAY);
        cy
            .xpath(SEARCH_RESULT_ITEM_ELEMENT)
            .should('be.visible')
            .should('not.be.disabled')
            .click();
    });

    it('should click on a point in map and pan the map to the left', () => {
        cy.goToGardenBaysGoogleMapURL();
        cy.verifyPanMapSuccessfully({
            canvasElement: GOOGLE_MAPS_CANVAS_ELEMENT,
            startPoint: startPoint,
            scrollTo: scrollToLeft
        });
    });

    it('should click on a point in map and pan the map to the right', () => {
        cy.goToGardenBaysGoogleMapURL();
        cy.verifyPanMapSuccessfully({
            canvasElement: GOOGLE_MAPS_CANVAS_ELEMENT,
            startPoint: startPoint,
            scrollTo: scrollToRight
        });
    });

    it('should click on a point in map and pan the map to the top', () => {
        cy.goToGardenBaysGoogleMapURL();
        cy.verifyPanMapSuccessfully({
            canvasElement: GOOGLE_MAPS_CANVAS_ELEMENT,
            startPoint: startPoint,
            scrollTo: scrollToTop
        });
    });

    it('should click on a point in map and pan the map to the bottom', () => {
        cy.goToGardenBaysGoogleMapURL();
        cy.verifyPanMapSuccessfully({
            canvasElement: GOOGLE_MAPS_CANVAS_ELEMENT,
            startPoint: startPoint,
            scrollTo: scrollToBottom
        });
    });
});
