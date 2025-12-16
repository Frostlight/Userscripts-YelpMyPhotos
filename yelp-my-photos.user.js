// ==UserScript==
// @name         Yelp Photos – My Photos Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a "My Photos" button next to "Add Photos" on Yelp business photo pages to view the current user's photos for that business.
// @match        https://www.yelp.ca/biz_photos/*
// @match        https://www.yelp.com/biz_photos/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Helper: wait for an element to exist
    function waitForElement(selector, root = document, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const el = root.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const found = root.querySelector(selector);
                if (found) {
                    observer.disconnect();
                    resolve(found);
                }
            });

            observer.observe(root, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error('Timeout waiting for ' + selector));
            }, timeout);
        });
    }

    // Extract current user ID from the page
    function getCurrentUserId() {
        // Method 1: Check for user profile links in the header/page
        const userLinks = document.querySelectorAll('a[href*="/user_details?userid="]');
        for (const link of userLinks) {
            const match = link.href.match(/userid=([^&]+)/);
            if (match) {
                return match[1];
            }
        }

        // Method 2: Check window object for user data
        if (window.yelp && window.yelp.www && window.yelp.www.init && window.yelp.www.init.user) {
            return window.yelp.www.init.user.id;
        }

        // Method 3: Parse from page props/scripts
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            const content = script.textContent;
            if (content.includes('userId') || content.includes('userid')) {
                const match = content.match(/"userId[Ee]ncid":\s*"([^"]+)"/);
                if (match) {
                    return match[1];
                }
            }
        }

        return null;
    }

    // Build a URL to the same biz_photos page filtered to a specific user
    function buildMyPhotosUrl(userId) {
        const url = new URL(window.location.href);
        // Clear existing userid param and set the current user's ID
        url.searchParams.set('userid', userId);
        return url.toString();
    }

    function createMyPhotosButton(addPhotosButton, userId) {
        // Clone the existing Add Photos button to keep styles consistent
        const clone = addPhotosButton.cloneNode(true);

        // Ensure it is clickable and looks enabled
        clone.removeAttribute('aria-disabled');
        clone.removeAttribute('disabled');

        // Change label text - find the text span inside
        const textSpans = clone.querySelectorAll('span');
        for (const span of textSpans) {
            if (span.textContent.includes('Add') || span.textContent.includes('Photo')) {
                span.textContent = 'My Photos';
                break;
            }
        }

        // Click -> navigate to user's photos for this biz
        clone.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = buildMyPhotosUrl(userId);
        });

        return clone;
    }

    async function init() {
        try {
            // Get current user ID
            const userId = getCurrentUserId();
            if (!userId) {
                console.log('Yelp My Photos: User not logged in or ID not found');
                return;
            }

            // Find the Add Photos button - it's within a div.y-css-1ilqd8r wrapper
            const addPhotosButton = await waitForElement('div.y-css-1ilqd8r button[aria-label*="Add"]');
            const wrapperDiv = addPhotosButton.closest('div.y-css-1ilqd8r') || addPhotosButton.parentElement;

            if (!wrapperDiv) return;

            // Avoid inserting multiple times
            if (wrapperDiv.dataset.myPhotosInjected === 'true') return;
            wrapperDiv.dataset.myPhotosInjected = 'true';

            const myPhotosBtn = createMyPhotosButton(addPhotosButton, userId);

            // Create a wrapper div with the same class for the new button
            const myPhotosWrapper = document.createElement('div');
            myPhotosWrapper.className = 'y-css-1ilqd8r';
            myPhotosWrapper.appendChild(myPhotosBtn);

            // Insert directly after the Add Photos wrapper
            if (wrapperDiv.nextSibling) {
                wrapperDiv.parentElement.insertBefore(myPhotosWrapper, wrapperDiv.nextSibling);
            } else {
                wrapperDiv.parentElement.appendChild(myPhotosWrapper);
            }
        } catch (e) {
            // Silent fail on pages where the button is not present
            console.log('Yelp My Photos error:', e);
        }
    }

    // Run once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
