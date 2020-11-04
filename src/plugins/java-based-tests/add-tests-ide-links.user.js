// ==UserScript==
// @name         Add IDE navigation links for java test files within the GE tests dashboard and tests section
// @namespace    http://gradle.com
// @version      0.1
// @description  Decorates the test names in the tests dashboard  and tests section with links to open the source file in IDEA
// @author       Gradle Enterprise FE team
// @include      http://*
// @run-at context-menu
// @grant        none
// ==/UserScript==

(function () {
    const GE_TESTS_DASHBOARD_PATH = '/scans/tests';
    const GE_IDE_HELPER_BASE_URL = 'http://localhost:16666';
    const GET_LINKS_PATH_FRAGMENT = 'java-based-test/get-ide-links';

    const isTestsDashboard = location.pathname.endsWith(GE_TESTS_DASHBOARD_PATH);
    const testItemsSelector = isTestsDashboard ? '.TestsTable__item-cell:first-child .TestsTable__link' : '.TestExpandedSectionHeader__name';
    const testItemElements = Array.from(document.querySelectorAll(testItemsSelector));

    window.fetch(`${GE_IDE_HELPER_BASE_URL}/${GET_LINKS_PATH_FRAGMENT}`, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            url: window.location.href,
            testItems: testItemElements.map(({textContent}) => textContent)
        })
    })
        .then(response => response.json())
        .then(testItemIdeLinks =>
            testItemElements.forEach((testItemElement, testItemElementIndex) => {
                const testItemIdeLink = testItemIdeLinks[testItemElementIndex];

                decorateWithIdeLink(testItemElement, testItemIdeLink)
            })
        )


    function decorateWithIdeLink(testItemElement, testItemIdeLink) {
        const ideLinkElement = document.createElement('a');
        const ideLinkElementText = document.createTextNode("[IDE]");

        ideLinkElement.href = '#'; // make it appear clickable
        ideLinkElement.appendChild(ideLinkElementText);
        ideLinkElement.onclick = event => {
            event.preventDefault();
            window.fetch(`${GE_IDE_HELPER_BASE_URL}/${testItemIdeLink}`);
        }

        testItemElement.parentElement.style.display = 'flex';
        testItemElement.parentElement.appendChild(ideLinkElement);
    }
})();
