// ==UserScript==
// @name         Yelp Biz – See My Photos Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds "See my photos" button next to "See all ### photos" on Yelp business pages
// @license      MIT; https://spdx.org/licenses/MIT.html
// @copyright	 2025, Frostlight (https://openuserjs.org/users/Frostlight)
// @icon         https://raw.githubusercontent.com/Frostlight/Userscripts-YelpMyPhotos/master/icon.png
// @homepageURL  https://github.com/Frostlight
// @supportURL   mailto:frostlight@users.noreply.github.com
// @match        https://www.yelp.ca/biz/*
// @match        https://www.yelp.com/biz/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get user ID using working methods
    function getCurrentUserId() {
        // Method 1: Check window.OneTrust.dataSubjectParams.id
        try {
            if (window.OneTrust && window.OneTrust.dataSubjectParams && window.OneTrust.dataSubjectParams.id) {
                const oneTrustId = window.OneTrust.dataSubjectParams.id;
                const match = oneTrustId.match(/^consumer-(.+)$/);
                if (match) {
                    return match[1];
                }
            }
        } catch (e) {
            console.error('Yelp My Photos: Failed to extract user ID from window.OneTrust.dataSubjectParams -', e);
        }

        // Method 2: Parse from script tags
        try {
            const scripts = document.querySelectorAll('script[type="application/json"], script');

            for (const script of scripts) {
                const content = script.textContent;
                if (content.includes('userId') || content.includes('userid')) {
                    // Try pattern: "userId" or "userIdEncid"
                    const userIdMatch = content.match(/"userId(?:Encid)?":\s*"([^"]+)"/);
                    if (userIdMatch) {
                        return userIdMatch[1];
                    }

                    // Try lowercase pattern
                    const lowerMatch = content.match(/"userid":\s*"([^"]+)"/i);
                    if (lowerMatch) {
                        return lowerMatch[1];
                    }
                }
            }
        } catch (e) {
            console.error('Yelp My Photos: Failed to parse user ID from script tags -', e);
        }

        console.warn('Yelp My Photos: Could not find user ID. User may not be logged in.');
        return null;
    }

    // Get business alias from URL
    function getBusinessAlias() {
        const match = window.location.pathname.match(/\/biz\/([^/?]+)/);
        if (!match) {
            console.error('Yelp My Photos: Could not extract business alias from URL:', window.location.pathname);
        }
        return match ? match[1] : null;
    }

    // Create and inject the button
    function injectButton() {
        // Find the "See all ### photos" button
        const photoButton = document.querySelector('a[href*="/biz_photos/"][class*="y-css-"]');
        if (!photoButton) {
            return false;
        }

        // Check if we already injected
        if (photoButton.parentElement.querySelector('[data-my-photos-btn]')) {
            return true;
        }

        const userId = getCurrentUserId();
        if (!userId) {
            return false;
        }

        const businessAlias = getBusinessAlias();
        if (!businessAlias) {
            return false;
        }

        try {
            // Clone the parent span element
            const parentSpan = photoButton.parentElement;
            const newSpan = parentSpan.cloneNode(true);

            // Update the cloned link
            const newLink = newSpan.querySelector('a');
            newLink.href = `/biz_photos/${businessAlias}?userid=${userId}`;
            newLink.setAttribute('data-my-photos-btn', 'true');

            // Update the text
            const textSpan = newLink.querySelector('span[class*="y-css-"]');
            if (textSpan) {
                textSpan.textContent = 'See my photos';
            } else {
                console.warn('Yelp My Photos: Could not find text span to update button label');
            }

            // Insert BEFORE the original button (to the left)
            parentSpan.parentElement.insertBefore(newSpan, parentSpan);
            return true;
        } catch (e) {
            console.error('Yelp My Photos: Failed to inject "See my photos" button -', e);
            return false;
        }
    }

    // Watch for changes and re-inject if needed
    function watchForChanges() {
        const observer = new MutationObserver(() => {
            injectButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Wait for document to be complete
    function init() {
        if (document.readyState === 'complete') {
            injectButton();
            watchForChanges();
        } else {
            window.addEventListener('load', () => {
                injectButton();
                watchForChanges();
            });
        }
    }

    init();
})();
