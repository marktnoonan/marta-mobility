<?php
require_once 'IntelligentCities.php';

// TODO: Properly UnitTest by asserting function results
runIntelligentCitiesIntegrationTests();

function runIntelligentCitiesIntegrationTests() {
    testDetermineETADelay();
}

function testDetermineETADelay() {
    IntelligentCities::determineETADelay(33.754226,-84.396138);
}