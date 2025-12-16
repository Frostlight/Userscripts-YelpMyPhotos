// ==UserScript==
// @name         Yelp Biz – See My Photos Button
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Adds "See my photos" button next to "See all ### photos" on Yelp business pages
// @license      MIT; https://spdx.org/licenses/MIT.html
// @copyright    2025, Frostlight (https://openuserjs.org/users/Frostlight)
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
        // Find the photo-header-buttons container
        const container = document.querySelector('div[class*="photo-header-buttons"]');
        
        if (!container) {
            return false;
        }

        // Check if we already injected
        if (container.querySelector('[data-my-photos-btn]')) {
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
            // Find any existing button span to clone its structure
            const existingSpan = container.querySelector('span[class*="y-css-"]');
            if (!existingSpan) {
                console.error('Yelp My Photos: Could not find button structure to clone');
                return false;
            }
            
            // Clone the span
            const newSpan = existingSpan.cloneNode(true);
            
            // Update the link
            const newLink = newSpan.querySelector('a');
            newLink.href = `/biz_photos/${businessAlias}?userid=${userId}`;
            newLink.setAttribute('data-my-photos-btn', 'true');
            
            // Update the text
            const textSpan = newLink.querySelector('span[class*="y-css-"]');
            if (textSpan) {
                textSpan.textContent = 'See my photos';
            }

            // Insert at the beginning of the container (to the left)
            container.insertBefore(newSpan, container.firstChild);
            
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
