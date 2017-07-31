<?php
require_once 'IntelligentCities.php';

// TODO: Properly UnitTest by asserting function results
runIntelligentCitiesIntegrationTests();

function runIntelligentCitiesIntegrationTests() {
    testDetermineETADelay();
    //testGatherReportData();
}

function testDetermineETADelay() {
    $ETAModifier = IntelligentCities::determineETADelay(33.754226,-84.396138);
    var_dump($ETAModifier);
}

function testGatherReportData() {
    $assets = IntelligentCities::gatherReportData(33.754226,-84.396138);
    var_dump($assets);
}